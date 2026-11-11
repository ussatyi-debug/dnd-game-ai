//! Раздача озвучки в домашнюю сеть: ПК-версия становится «своим сервером» для телефона.
//!
//! Простой HTTP-сервер на отдельном потоке: `GET /voices` и `POST /tts` (см. протокол в
//! [`super`]). Слушает все адреса ПК на выбранном порту; Windows при первом запуске
//! спросит разрешение брандмауэра.

use std::io::{BufRead, BufReader, Read, Write};
use std::net::{SocketAddr, TcpListener, TcpStream, UdpSocket};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::Duration;

use serde::{Deserialize, Serialize};

/// Порт по умолчанию.
pub const DEFAULT_PORT: u16 = 5150;
/// Самый длинный текст одного запроса (фразы озвучки — до ~260 знаков).
const MAX_BODY: usize = 64 * 1024;

/// Синтез для сервера: голос, текст, скорость → WAV.
pub type SynthFn = Arc<dyn Fn(&str, &str, f32) -> Result<Vec<u8>, String> + Send + Sync>;
/// Список голосов для сервера (JSON ответа `/voices`).
pub type VoicesFn = Arc<dyn Fn() -> Result<String, String> + Send + Sync>;

/// Состояние раздачи для интерфейса.
#[derive(Debug, Clone, Serialize)]
pub struct ShareStatus {
    pub running: bool,
    pub port: u16,
    /// Адрес для телефона: `http://<IP ПК в сети>:<порт>`.
    pub address: Option<String>,
}

pub struct Share {
    stop: Arc<AtomicBool>,
    port: u16,
}

impl Share {
    pub fn start(port: u16, voices: VoicesFn, synth: SynthFn) -> Result<Self, String> {
        let listener = TcpListener::bind(SocketAddr::from(([0, 0, 0, 0], port)))
            .map_err(|e| format!("Порт {port} занят или недоступен: {e}"))?;
        listener
            .set_nonblocking(true)
            .map_err(|e| format!("Не удалось запустить сервер озвучки: {e}"))?;
        let stop = Arc::new(AtomicBool::new(false));
        let flag = stop.clone();
        std::thread::Builder::new()
            .name("tts-share".into())
            .spawn(move || {
                while !flag.load(Ordering::Relaxed) {
                    match listener.accept() {
                        Ok((stream, _)) => {
                            let (voices, synth) = (voices.clone(), synth.clone());
                            std::thread::spawn(move || {
                                let _ = handle(stream, &voices, &synth);
                            });
                        }
                        Err(e) if e.kind() == std::io::ErrorKind::WouldBlock => {
                            std::thread::sleep(Duration::from_millis(100));
                        }
                        Err(_) => std::thread::sleep(Duration::from_millis(250)),
                    }
                }
            })
            .map_err(|e| format!("Не удалось запустить сервер озвучки: {e}"))?;
        Ok(Self { stop, port })
    }

    pub fn status(&self) -> ShareStatus {
        ShareStatus {
            running: true,
            port: self.port,
            address: lan_ip().map(|ip| format!("http://{ip}:{}", self.port)),
        }
    }
}

impl Drop for Share {
    fn drop(&mut self) {
        self.stop.store(true, Ordering::Relaxed);
    }
}

/// IP этого ПК в домашней сети (адрес, через который идёт трафик наружу; пакеты не отправляются).
pub fn lan_ip() -> Option<String> {
    let socket = UdpSocket::bind("0.0.0.0:0").ok()?;
    socket.connect("192.168.0.1:80").or_else(|_| socket.connect("8.8.8.8:80")).ok()?;
    Some(socket.local_addr().ok()?.ip().to_string())
}

#[derive(Deserialize)]
struct TtsRequest {
    text: String,
    #[serde(default)]
    voice: String,
    #[serde(default = "one")]
    rate: f32,
}

fn one() -> f32 {
    1.0
}

fn respond(stream: &mut TcpStream, status: &str, kind: &str, body: &[u8]) -> std::io::Result<()> {
    write!(
        stream,
        "HTTP/1.1 {status}\r\nContent-Type: {kind}\r\nContent-Length: {}\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Headers: Content-Type\r\nAccess-Control-Allow-Methods: GET, POST, OPTIONS\r\nConnection: close\r\n\r\n",
        body.len()
    )?;
    stream.write_all(body)?;
    stream.flush()
}

fn handle(mut stream: TcpStream, voices: &VoicesFn, synth: &SynthFn) -> std::io::Result<()> {
    stream.set_nonblocking(false)?;
    stream.set_read_timeout(Some(Duration::from_secs(15)))?;
    let mut reader = BufReader::new(stream.try_clone()?);
    let mut line = String::new();
    reader.read_line(&mut line)?;
    let mut parts = line.split_whitespace();
    let (method, path) = (parts.next().unwrap_or(""), parts.next().unwrap_or(""));
    let mut length = 0usize;
    loop {
        let mut header = String::new();
        if reader.read_line(&mut header)? == 0 || header.trim().is_empty() {
            break;
        }
        if let Some((k, v)) = header.split_once(':') {
            if k.trim().eq_ignore_ascii_case("content-length") {
                length = v.trim().parse().unwrap_or(0);
            }
        }
    }
    if length > MAX_BODY {
        return respond(
            &mut stream,
            "413 Payload Too Large",
            "text/plain; charset=utf-8",
            "Слишком длинный текст".as_bytes(),
        );
    }
    let mut body = vec![0; length];
    reader.read_exact(&mut body)?;
    let path = path.split('?').next().unwrap_or("");
    match (method, path) {
        ("OPTIONS", _) => respond(&mut stream, "204 No Content", "text/plain", b""),
        ("GET", "/voices") => match voices() {
            Ok(json) => {
                respond(&mut stream, "200 OK", "application/json; charset=utf-8", json.as_bytes())
            }
            Err(e) => respond(
                &mut stream,
                "500 Internal Server Error",
                "text/plain; charset=utf-8",
                e.as_bytes(),
            ),
        },
        ("POST", "/tts") => {
            let req: TtsRequest = match serde_json::from_slice(&body) {
                Ok(r) => r,
                Err(e) => {
                    let msg = format!("Неверный запрос: {e}");
                    return respond(
                        &mut stream,
                        "400 Bad Request",
                        "text/plain; charset=utf-8",
                        msg.as_bytes(),
                    );
                }
            };
            match synth(&req.voice, &req.text, req.rate) {
                Ok(wav) => respond(&mut stream, "200 OK", "audio/wav", &wav),
                Err(e) => respond(
                    &mut stream,
                    "500 Internal Server Error",
                    "text/plain; charset=utf-8",
                    e.as_bytes(),
                ),
            }
        }
        _ => respond(
            &mut stream,
            "404 Not Found",
            "text/plain; charset=utf-8",
            "Нет такого адреса: /voices, /tts".as_bytes(),
        ),
    }
}
