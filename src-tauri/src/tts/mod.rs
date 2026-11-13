//! Озвучка в приложении: облачные голоса (OpenAI, Gemini, Яндекс), свой сервер озвучки
//! и встроенный Silero на Windows.
//!
//! Ключи облачных провайдеров — те же, что у мастера (`ai-settings.json`), в интерфейс они
//! не передаются. Звук возвращается байтами файла (WAV, MP3) — интерфейс декодирует его сам.
//!
//! Протокол своего сервера (его же раздаёт ПК-версия, см. [`share`]):
//! - `GET  /voices` → `{"engine": "...", "voices": [{"id", "name", "gender"}]}`;
//! - `POST /tts` с JSON `{"text", "voice", "rate"}` → `audio/wav`.

#[cfg(windows)]
pub mod share;
#[cfg(windows)]
pub mod silero;

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::ai::{yandex::YandexKey, AiSettings, Provider};

/// Голос облачного провайдера или своего сервера.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct VoiceInfo {
    pub id: String,
    pub name: String,
    /// `m`, `f` или пусто — неизвестно.
    #[serde(default)]
    pub gender: String,
}

/// Ответ `GET /voices` своего сервера.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerVoices {
    #[serde(default)]
    pub engine: String,
    pub voices: Vec<VoiceInfo>,
}

/// WAV (PCM 16 бит, моно) из отсчётов `f32` в диапазоне −1…1.
pub fn wav_from_f32(samples: &[f32], sample_rate: u32) -> Vec<u8> {
    let pcm: Vec<i16> =
        samples.iter().map(|s| (s.clamp(-1.0, 1.0) * i16::MAX as f32) as i16).collect();
    wav_from_i16(&pcm, sample_rate)
}

/// WAV (PCM 16 бит, моно) из отсчётов `i16`.
pub fn wav_from_i16(pcm: &[i16], sample_rate: u32) -> Vec<u8> {
    let data_len = (pcm.len() * 2) as u32;
    let mut out = Vec::with_capacity(44 + data_len as usize);
    out.extend_from_slice(b"RIFF");
    out.extend_from_slice(&(36 + data_len).to_le_bytes());
    out.extend_from_slice(b"WAVEfmt ");
    out.extend_from_slice(&16u32.to_le_bytes());
    out.extend_from_slice(&1u16.to_le_bytes());
    out.extend_from_slice(&1u16.to_le_bytes());
    out.extend_from_slice(&sample_rate.to_le_bytes());
    out.extend_from_slice(&(sample_rate * 2).to_le_bytes());
    out.extend_from_slice(&2u16.to_le_bytes());
    out.extend_from_slice(&16u16.to_le_bytes());
    out.extend_from_slice(b"data");
    out.extend_from_slice(&data_len.to_le_bytes());
    for s in pcm {
        out.extend_from_slice(&s.to_le_bytes());
    }
    out
}

/// Декодирование base64 (стандартный алфавит, с выравниванием `=`).
pub fn base64_decode(text: &str) -> Result<Vec<u8>, String> {
    fn value(c: u8) -> Option<u32> {
        match c {
            b'A'..=b'Z' => Some((c - b'A') as u32),
            b'a'..=b'z' => Some((c - b'a' + 26) as u32),
            b'0'..=b'9' => Some((c - b'0' + 52) as u32),
            b'+' | b'-' => Some(62),
            b'/' | b'_' => Some(63),
            _ => None,
        }
    }
    let mut out = Vec::with_capacity(text.len() * 3 / 4);
    let mut buf = 0u32;
    let mut bits = 0;
    for c in text.bytes().filter(|c| !c.is_ascii_whitespace() && *c != b'=') {
        buf = (buf << 6) | value(c).ok_or("Повреждённые данные звука (base64)")?;
        bits += 6;
        if bits >= 8 {
            bits -= 8;
            out.push((buf >> bits) as u8);
            buf &= (1 << bits) - 1;
        }
    }
    Ok(out)
}

fn network_error(provider: &str, e: reqwest::Error) -> String {
    if e.is_timeout() {
        format!("{provider}: озвучка не ответила вовремя")
    } else {
        format!("{provider}: нет связи с сервисом озвучки ({e})")
    }
}

fn api_error(provider: &str, status: u16, body: &Value) -> String {
    let message = body["error"]["message"]
        .as_str()
        .or_else(|| body["message"].as_str())
        .or_else(|| body["error_message"].as_str())
        .unwrap_or("без пояснения");
    match status {
        401 | 403 => format!(
            "{provider}: нет доступа к озвучке ({status}). Проверьте ключ{}: {message}",
            if provider == "Яндекс" {
                " и роль ai.speechkit-tts.user у сервисного аккаунта"
            } else {
                ""
            }
        ),
        404 => format!("{provider}: модель озвучки не найдена: {message}"),
        429 => format!("{provider}: превышен лимит запросов озвучки: {message}"),
        _ => format!("{provider}: ошибка озвучки {status}: {message}"),
    }
}

fn key(settings: &AiSettings, provider: Provider) -> Result<&str, String> {
    settings.key_for(provider).ok_or_else(|| {
        format!(
            "Нет ключа {} — введите его в настройках ИИ-мастера (тот же ключ работает для озвучки)",
            provider.label()
        )
    })
}

/// Модели озвучки провайдера (по списку моделей с тем же ключом).
pub async fn cloud_models(
    client: &reqwest::Client,
    settings: &AiSettings,
    provider: Provider,
) -> Result<Vec<String>, String> {
    let mut models: Vec<String> = match provider {
        Provider::OpenAi => {
            let r = client
                .get("https://api.openai.com/v1/models")
                .bearer_auth(key(settings, provider)?)
                .send()
                .await
                .map_err(|e| network_error("OpenAI", e))?;
            let status = r.status().as_u16();
            let body: Value = r.json().await.map_err(|e| format!("OpenAI: неверный ответ: {e}"))?;
            if status >= 300 {
                return Err(api_error("OpenAI", status, &body));
            }
            body["data"]
                .as_array()
                .map(|a| {
                    a.iter()
                        .filter_map(|m| m["id"].as_str())
                        .filter(|id| id.contains("tts"))
                        .map(String::from)
                        .collect()
                })
                .unwrap_or_default()
        }
        Provider::Gemini => {
            let r = client
                .get("https://generativelanguage.googleapis.com/v1beta/models")
                .query(&[("pageSize", "1000")])
                .header("x-goog-api-key", key(settings, provider)?)
                .send()
                .await
                .map_err(|e| network_error("Gemini", e))?;
            let status = r.status().as_u16();
            let body: Value = r.json().await.map_err(|e| format!("Gemini: неверный ответ: {e}"))?;
            if status >= 300 {
                return Err(api_error("Gemini", status, &body));
            }
            body["models"]
                .as_array()
                .map(|a| {
                    a.iter()
                        .filter_map(|m| m["name"].as_str())
                        .map(|n| n.trim_start_matches("models/"))
                        .filter(|id| id.contains("tts"))
                        .map(String::from)
                        .collect()
                })
                .unwrap_or_default()
        }
        // У SpeechKit одна модель синтеза; голоса выбираются отдельно.
        Provider::Yandex => vec!["speechkit".into()],
        Provider::Anthropic | Provider::Local => {
            return Err("У этого провайдера нет озвучки — выберите Piper, свой сервер, OpenAI, Gemini или Яндекс".into())
        }
    };
    models.sort();
    models.dedup();
    if models.is_empty() {
        return Err(format!("{}: моделей озвучки для этого ключа не найдено", provider.label()));
    }
    Ok(models)
}

/// Озвучка фразы облачным провайдером: байты звукового файла (MP3 или WAV).
pub async fn cloud_synth(
    client: &reqwest::Client,
    settings: &AiSettings,
    provider: Provider,
    model: &str,
    voice: &str,
    text: &str,
    rate: f32,
) -> Result<Vec<u8>, String> {
    match provider {
        Provider::OpenAi => {
            let r = client
                .post("https://api.openai.com/v1/audio/speech")
                .bearer_auth(key(settings, provider)?)
                .json(&json!({
                    "model": model,
                    "voice": voice,
                    "input": text,
                    "response_format": "mp3",
                    "speed": rate.clamp(0.25, 4.0),
                }))
                .send()
                .await
                .map_err(|e| network_error("OpenAI", e))?;
            let status = r.status().as_u16();
            if status >= 300 {
                let body: Value = r.json().await.unwrap_or(Value::Null);
                return Err(api_error("OpenAI", status, &body));
            }
            Ok(r.bytes().await.map_err(|e| network_error("OpenAI", e))?.to_vec())
        }
        Provider::Gemini => {
            let r = client
                .post(format!(
                    "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
                ))
                .header("x-goog-api-key", key(settings, provider)?)
                .json(&json!({
                    "contents": [{ "parts": [{ "text": text }] }],
                    "generationConfig": {
                        "responseModalities": ["AUDIO"],
                        "speechConfig": { "voiceConfig": { "prebuiltVoiceConfig": { "voiceName": voice } } }
                    }
                }))
                .send()
                .await
                .map_err(|e| network_error("Gemini", e))?;
            let status = r.status().as_u16();
            let body: Value = r.json().await.map_err(|e| format!("Gemini: неверный ответ: {e}"))?;
            if status >= 300 {
                return Err(api_error("Gemini", status, &body));
            }
            let part = &body["candidates"][0]["content"]["parts"][0]["inlineData"];
            let data = part["data"].as_str().ok_or("Gemini не вернул звук для этой фразы")?;
            let rate_hz = part["mimeType"]
                .as_str()
                .and_then(|m| m.split("rate=").nth(1))
                .and_then(|r| r.split(';').next())
                .and_then(|r| r.parse().ok())
                .unwrap_or(24_000);
            let bytes = base64_decode(data)?;
            let pcm: Vec<i16> =
                bytes.as_chunks::<2>().0.iter().map(|b| i16::from_le_bytes(*b)).collect();
            Ok(wav_from_i16(&pcm, rate_hz))
        }
        Provider::Yandex => {
            let k = YandexKey::parse(key(settings, provider)?)?;
            let speed = format!("{:.2}", rate.clamp(0.1, 3.0));
            let r = client
                .post("https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize")
                .header("Authorization", format!("Api-Key {}", k.api_key))
                .form(&[
                    ("text", text),
                    ("lang", "ru-RU"),
                    ("voice", voice),
                    ("format", "mp3"),
                    ("speed", speed.as_str()),
                    ("folderId", k.folder.as_str()),
                ])
                .send()
                .await
                .map_err(|e| network_error("Яндекс", e))?;
            let status = r.status().as_u16();
            if status >= 300 {
                let body: Value = r.json().await.unwrap_or(Value::Null);
                return Err(api_error("Яндекс", status, &body));
            }
            Ok(r.bytes().await.map_err(|e| network_error("Яндекс", e))?.to_vec())
        }
        Provider::Anthropic | Provider::Local => Err("У этого провайдера нет озвучки".into()),
    }
}

/// Адрес своего сервера: `http://` по умолчанию, без завершающего `/`.
pub fn server_url(url: &str) -> Result<String, String> {
    let url = url.trim().trim_end_matches('/');
    if url.is_empty() {
        return Err("Укажите адрес сервера озвучки, например http://192.168.1.10:5150".into());
    }
    Ok(if url.starts_with("http://") || url.starts_with("https://") {
        url.to_string()
    } else {
        format!("http://{url}")
    })
}

/// Голоса своего сервера.
pub async fn server_voices(client: &reqwest::Client, url: &str) -> Result<ServerVoices, String> {
    let url = server_url(url)?;
    let r = client
        .get(format!("{url}/voices"))
        .timeout(std::time::Duration::from_secs(10))
        .send()
        .await
        .map_err(|e| format!("Сервер озвучки {url} не отвечает: {e}"))?;
    if !r.status().is_success() {
        return Err(format!("Сервер озвучки ответил ошибкой {}", r.status().as_u16()));
    }
    r.json().await.map_err(|e| format!("Сервер озвучки вернул не список голосов: {e}"))
}

/// Озвучка фразы своим сервером: байты WAV.
pub async fn server_synth(
    client: &reqwest::Client,
    url: &str,
    voice: &str,
    text: &str,
    rate: f32,
) -> Result<Vec<u8>, String> {
    let url = server_url(url)?;
    let r = client
        .post(format!("{url}/tts"))
        .json(&json!({ "text": text, "voice": voice, "rate": rate }))
        .send()
        .await
        .map_err(|e| format!("Сервер озвучки {url} не отвечает: {e}"))?;
    let status = r.status().as_u16();
    if status >= 300 {
        let text = r.text().await.unwrap_or_default();
        return Err(format!(
            "Сервер озвучки: ошибка {status}: {}",
            text.chars().take(200).collect::<String>()
        ));
    }
    Ok(r.bytes().await.map_err(|e| format!("Сервер озвучки оборвал ответ: {e}"))?.to_vec())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn wav_header_is_valid() {
        let wav = wav_from_f32(&[0.0, 0.5, -0.5, 1.5], 24_000);
        assert_eq!(&wav[0..4], b"RIFF");
        assert_eq!(&wav[8..16], b"WAVEfmt ");
        assert_eq!(u32::from_le_bytes([wav[24], wav[25], wav[26], wav[27]]), 24_000);
        assert_eq!(wav.len(), 44 + 8);
        // Значения за пределами −1…1 обрезаются.
        assert_eq!(i16::from_le_bytes([wav[50], wav[51]]), i16::MAX);
    }

    #[test]
    fn base64_roundtrip() {
        assert_eq!(base64_decode("TWFu").unwrap(), b"Man");
        assert_eq!(base64_decode("TWE=").unwrap(), b"Ma");
        assert_eq!(base64_decode("TQ==").unwrap(), b"M");
        assert!(base64_decode("@@").is_err());
    }

    #[test]
    fn server_url_gets_scheme() {
        assert_eq!(server_url("192.168.1.5:5150/").unwrap(), "http://192.168.1.5:5150");
        assert_eq!(server_url("https://x.lan").unwrap(), "https://x.lan");
        assert!(server_url("  ").is_err());
    }
}
