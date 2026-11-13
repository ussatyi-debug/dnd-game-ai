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

/// Все адреса этого ПК в домашних сетях — телефон может быть в другой сети, чем основной
/// маршрут. Служебные адреса (127.*, 169.254.*) отбрасываются; первым идёт адрес маршрута.
pub fn lan_addresses() -> Vec<String> {
    let mut found: Vec<String> = Vec::new();
    if let Some(main) = lan_ip() {
        found.push(main);
    }
    let output = std::process::Command::new("ipconfig").output();
    if let Ok(out) = output {
        // ipconfig печатает в кодировке консоли; нужны только цифры и точки.
        let text = String::from_utf8_lossy(&out.stdout);
        for line in text.lines() {
            let Some((_, value)) = line.rsplit_once(':') else { continue };
            let value = value.trim();
            if value.split('.').count() != 4 {
                continue;
            }
            if !value.split('.').all(|p| !p.is_empty() && p.chars().all(|c| c.is_ascii_digit())) {
                continue;
            }
            // Маска подсети и шлюз пропускаются: нужен только сам адрес карты.
            let lower = line.to_lowercase();
            if lower.contains("mask")
                || lower.contains("маск")
                || lower.contains("шлюз")
                || lower.contains("gateway")
            {
                continue;
            }
            if value.starts_with("127.")
                || value.starts_with("169.254.")
                || value.starts_with("255.")
            {
                continue;
            }
            if !found.iter().any(|a| a == value) {
                found.push(value.to_string());
            }
        }
    }
    found
}

/// Имя правила брандмауэра Windows для раздачи озвучки.
pub const FIREWALL_RULE: &str = "DnD Game AI — озвучка в домашней сети";

/// Есть ли правило брандмауэра для порта раздачи.
pub fn firewall_allowed(port: u16) -> bool {
    let Ok(out) = std::process::Command::new("netsh")
        .args(["advfirewall", "firewall", "show", "rule", &format!("name={FIREWALL_RULE}")])
        .output()
    else {
        return false;
    };
    if !out.status.success() {
        return false;
    }
    String::from_utf8_lossy(&out.stdout).contains(&port.to_string())
}

/// Просит Windows разрешить порт в домашней (частной) сети: игрок подтверждает запрос прав.
pub fn firewall_allow(port: u16) -> Result<(), String> {
    let command = format!(
        "netsh advfirewall firewall delete rule name='{FIREWALL_RULE}' | Out-Null; \
netsh advfirewall firewall add rule name='{FIREWALL_RULE}' dir=in action=allow protocol=TCP \
localport={port} profile=private"
    );
    let status = std::process::Command::new("powershell")
        .args([
            "-NoProfile",
            "-Command",
            &format!("Start-Process powershell -Verb RunAs -Wait -WindowStyle Hidden -ArgumentList '-NoProfile','-Command','{command}'"),
        ])
        .status()
        .map_err(|e| format!("Не удалось вызвать брандмауэр Windows: {e}"))?;
    if !status.success() {
        return Err("Windows не подтвердил разрешение порта".into());
    }
    if !firewall_allowed(port) {
        return Err(
            "Правило брандмауэра не появилось — добавьте его вручную (инструкция в README)".into(),
        );
    }
    Ok(())
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
