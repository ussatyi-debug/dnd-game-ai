//! Локальная модель через Ollama: на этом ПК или на другом компьютере в локальной сети.

use std::time::Duration;

use serde_json::{json, Value};

use super::{cached_tokens, prompt_tokens, ChatMessage, Generated, ModelInfo, Role};

/// Адрес Ollama по умолчанию.
pub const DEFAULT_URL: &str = "http://localhost:11434";
/// Окно контекста мастера: кодекс, листы, база знаний и последние сообщения.
pub const NUM_CTX: u32 = 32_768;
/// Локальная модель отвечает дольше облачной, особенно при частичной выгрузке на процессор.
const CHAT_TIMEOUT: Duration = Duration::from_secs(600);

/// Проверяет и нормализует адрес сервера: `http://192.168.1.25:11434`.
pub fn normalize_url(url: &str) -> Result<String, String> {
    let url = url.trim().trim_end_matches('/');
    if url.is_empty() {
        return Ok(DEFAULT_URL.into());
    }
    let with_scheme = if url.starts_with("http://") || url.starts_with("https://") {
        url.to_string()
    } else {
        format!("http://{url}")
    };
    let host = with_scheme.split("://").nth(1).unwrap_or_default();
    if host.is_empty() || host.contains(' ') || host.contains('/') {
        return Err(format!(
            "Неверный адрес сервера Ollama: «{url}». Пример: http://192.168.1.25:11434"
        ));
    }
    Ok(with_scheme)
}

fn network_error(base: &str, e: reqwest::Error) -> String {
    if e.is_timeout() {
        format!("Ollama ({base}) не ответила вовремя: модель ещё загружается или не помещается в память")
    } else {
        format!(
            "Нет связи с Ollama ({base}): запущена ли она, верен ли адрес; для доступа по сети — \
OLLAMA_HOST=0.0.0.0 и разрешение в брандмауэре"
        )
    }
}

fn api_error(status: u16, body: &Value) -> String {
    let message = body["error"].as_str().unwrap_or("неизвестная ошибка");
    format!("Ollama ответила ошибкой {status}: {message}")
}

/// Установленные модели.
pub async fn list_models(client: &reqwest::Client, base: &str) -> Result<Vec<ModelInfo>, String> {
    let response =
        client.get(format!("{base}/api/tags")).send().await.map_err(|e| network_error(base, e))?;
    let status = response.status();
    let body: Value = response.json().await.map_err(|e| format!("Неверный ответ Ollama: {e}"))?;
    if !status.is_success() {
        return Err(api_error(status.as_u16(), &body));
    }
    Ok(parse_models(&body))
}

pub(crate) fn parse_models(body: &Value) -> Vec<ModelInfo> {
    let mut models: Vec<ModelInfo> = body["models"]
        .as_array()
        .map(Vec::as_slice)
        .unwrap_or_default()
        .iter()
        .filter_map(|m| {
            let id = m["name"].as_str().or_else(|| m["model"].as_str())?;
            let details = &m["details"];
            let mut parts = Vec::new();
            if let Some(p) = details["parameter_size"].as_str() {
                parts.push(format!("{p} параметров"));
            }
            if let Some(q) = details["quantization_level"].as_str() {
                parts.push(q.to_string());
            }
            if let Some(size) = m["size"].as_u64() {
                parts.push(format!("{:.1} ГБ", size as f64 / 1_073_741_824.0));
            }
            parts.push("бесплатно, на вашем ПК".into());
            Some(ModelInfo {
                id: id.to_string(),
                name: id.to_string(),
                description: parts.join(" · "),
                input_token_limit: Some(u64::from(NUM_CTX)),
            })
        })
        .filter(|m| !m.id.contains("embed"))
        .collect();
    models.sort_by(|a, b| a.id.cmp(&b.id));
    models
}

/// Тело запроса `/api/chat`: кодекс и состояние игры — системным сообщением.
pub(crate) fn request_body(
    model: &str,
    system: &str,
    history: &[ChatMessage],
    think: bool,
) -> Value {
    let mut messages = vec![json!({ "role": "system", "content": system })];
    messages.extend(
        history
            .iter()
            .filter(|m| !m.text.trim().is_empty())
            .skip_while(|m| m.role == Role::Master)
            .map(|m| {
                json!({
                    "role": match m.role { Role::Player => "user", Role::Master => "assistant" },
                    "content": m.text.trim(),
                })
            }),
    );
    let mut body = json!({
        "model": model,
        "messages": messages,
        "stream": false,
        // Рекомендации Qwen для ответов без размышлений; presence_penalty снижает повторы и
        // переход на другой язык посреди текста.
        "options": {
            "num_ctx": NUM_CTX,
            "temperature": 0.7,
            "top_p": 0.8,
            "top_k": 20,
            "presence_penalty": 1.5,
        },
    });
    if !think {
        // Режим размышлений (Qwen 3 и др.) сильно замедляет ответ мастера.
        body["think"] = json!(false);
    }
    body
}

/// Убирает рассуждения `<think>…</think>`, если модель вставила их в ответ.
pub(crate) fn strip_thinking(text: &str) -> String {
    let mut out = text.to_string();
    while let (Some(start), Some(end)) = (out.find("<think>"), out.find("</think>")) {
        if end < start {
            break;
        }
        out.replace_range(start..end + "</think>".len(), "");
    }
    out.trim().to_string()
}

pub(crate) fn parse_reply(body: &Value) -> Result<String, String> {
    let text = body["message"]["content"].as_str().unwrap_or_default();
    let text = strip_thinking(text);
    if text.is_empty() {
        return Err(
            "Локальная модель вернула пустой ответ — попробуйте ещё раз или другую модель".into()
        );
    }
    Ok(text)
}

async fn post(client: &reqwest::Client, base: &str, body: &Value) -> Result<(u16, Value), String> {
    let response = client
        .post(format!("{base}/api/chat"))
        .timeout(CHAT_TIMEOUT)
        .json(body)
        .send()
        .await
        .map_err(|e| network_error(base, e))?;
    let status = response.status().as_u16();
    let body: Value = response.json().await.map_err(|e| format!("Неверный ответ Ollama: {e}"))?;
    Ok((status, body))
}

/// Ответ модели на историю диалога.
pub async fn generate(
    client: &reqwest::Client,
    base: &str,
    model: &str,
    system: &str,
    history: &[ChatMessage],
    json_mode: bool,
) -> Result<Generated, String> {
    let body_for = |no_think: bool| {
        let mut body = request_body(model, system, history, no_think);
        if json_mode {
            body["format"] = "json".into();
        }
        body
    };
    let done = |body: &Value| -> Result<Generated, String> {
        Ok(Generated {
            text: parse_reply(body)?,
            prompt_tokens: prompt_tokens(body),
            cached_tokens: cached_tokens(body),
        })
    };
    let (status, body) = post(client, base, &body_for(false)).await?;
    if (200..300).contains(&status) {
        return done(&body);
    }
    // Модели без режима размышлений отклоняют параметр think — повтор без него.
    if body["error"].as_str().is_some_and(|e| e.contains("think")) {
        let (status, body) = post(client, base, &body_for(true)).await?;
        if (200..300).contains(&status) {
            return done(&body);
        }
        return Err(api_error(status, &body));
    }
    Err(api_error(status, &body))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn urls_are_normalized() {
        assert_eq!(normalize_url("").unwrap(), DEFAULT_URL);
        assert_eq!(normalize_url("192.168.1.25:11434/").unwrap(), "http://192.168.1.25:11434");
        assert_eq!(normalize_url(" https://pc.local:11434 ").unwrap(), "https://pc.local:11434");
        assert!(normalize_url("http://a b").is_err());
        assert!(normalize_url("http://host/path").is_err());
    }

    #[test]
    fn models_and_replies_are_parsed() {
        let body = json!({ "models": [
            { "name": "qwen3.6:35b-a3b", "size": 23_000_000_000u64, "details": { "parameter_size": "35B", "quantization_level": "Q4_K_M" } },
            { "name": "nomic-embed-text:latest", "size": 274_000_000u64, "details": {} }
        ]});
        let models = parse_models(&body);
        assert_eq!(models.len(), 1);
        assert!(models[0].description.contains("35B"));
        let reply = json!({ "message": { "role": "assistant", "content": "<think>план</think>\nТаверна гудит." } });
        assert_eq!(parse_reply(&reply).unwrap(), "Таверна гудит.");
        assert!(parse_reply(&json!({ "message": { "content": "  " } })).is_err());
    }

    #[test]
    fn request_has_system_context_and_no_thinking() {
        let history = vec![
            ChatMessage { role: Role::Master, text: "приветствие".into() },
            ChatMessage { role: Role::Player, text: "Осматриваю зал".into() },
        ];
        let body = request_body("m", "КОДЕКС", &history, false);
        let messages = body["messages"].as_array().unwrap();
        assert_eq!(messages.len(), 2);
        assert_eq!(messages[0]["role"], "system");
        assert_eq!(messages[1]["content"], "Осматриваю зал");
        assert_eq!(body["think"], false);
        assert_eq!(body["options"]["num_ctx"], NUM_CTX);
        assert!(request_body("m", "К", &history, true).get("think").is_none());
    }
}
