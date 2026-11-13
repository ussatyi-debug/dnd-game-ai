//! Claude (Anthropic): Messages API и список моделей.
//!
//! Главное отличие от других провайдеров — явное кэширование: кодекс и снимок сцены
//! помечаются `cache_control`, и внутри сцены повторный ход стоит заметно дешевле.

use serde_json::{json, Value};

use super::{cached_tokens, prompt_tokens, ChatMessage, Generated, ModelInfo, Role};

const BASE_URL: &str = "https://api.anthropic.com/v1";
const API_VERSION: &str = "2023-06-01";
/// Больше ответа мастеру не нужно; без лимита Messages API запрос не принимает.
const MAX_TOKENS: u32 = 8_192;

/// Модели, пригодные для текстового диалога.
pub async fn list_models(client: &reqwest::Client, key: &str) -> Result<Vec<ModelInfo>, String> {
    let response = client
        .get(format!("{BASE_URL}/models?limit=100"))
        .header("x-api-key", key)
        .header("anthropic-version", API_VERSION)
        .send()
        .await
        .map_err(network_error)?;
    let status = response.status();
    let body: Value = response.json().await.map_err(|e| format!("Неверный ответ Claude: {e}"))?;
    if !status.is_success() {
        return Err(api_error(status.as_u16(), &body));
    }
    Ok(parse_models(&body))
}

/// Ответ модели на историю диалога.
pub async fn generate(
    client: &reqwest::Client,
    key: &str,
    model: &str,
    system: &str,
    history: &[ChatMessage],
    json_mode: bool,
) -> Result<Generated, String> {
    let response = client
        .post(format!("{BASE_URL}/messages"))
        .header("x-api-key", key)
        .header("anthropic-version", API_VERSION)
        .json(&request_body(model, system, history, json_mode))
        .send()
        .await
        .map_err(network_error)?;
    let status = response.status();
    let body: Value = response.json().await.map_err(|e| format!("Неверный ответ Claude: {e}"))?;
    if !status.is_success() {
        return Err(api_error(status.as_u16(), &body));
    }
    // В строгом режиме ответ начат с «{» на нашей стороне — возвращаем его обратно в текст.
    let text = parse_reply(&body)?;
    Ok(Generated {
        text: if json_mode { format!("{{{}", text.trim_start()) } else { text },
        prompt_tokens: prompt_tokens(&body),
        cached_tokens: cached_tokens(&body),
    })
}

pub(crate) fn parse_models(body: &Value) -> Vec<ModelInfo> {
    body["data"]
        .as_array()
        .map(Vec::as_slice)
        .unwrap_or_default()
        .iter()
        .filter_map(|m| {
            let id = m["id"].as_str()?;
            Some(ModelInfo {
                id: id.to_string(),
                name: m["display_name"].as_str().unwrap_or(id).to_string(),
                description: "Платная модель: расходует кредиты аккаунта Anthropic".into(),
                input_token_limit: None,
            })
        })
        .collect()
}

/// Тело запроса Messages API.
///
/// Кодекс и снимок сцены уходят в `system` с пометкой кэша: внутри сцены они не меняются,
/// и повторные ходы Claude считает по цене кэша. Строгий JSON задаётся началом ответа.
pub(crate) fn request_body(
    model: &str,
    system: &str,
    history: &[ChatMessage],
    json_mode: bool,
) -> Value {
    let mut messages: Vec<Value> = history
        .iter()
        .filter(|m| !m.text.trim().is_empty())
        .skip_while(|m| m.role == Role::Master)
        .map(|m| {
            json!({
                "role": match m.role { Role::Player => "user", Role::Master => "assistant" },
                "content": m.text.trim(),
            })
        })
        .collect();
    // Messages API требует, чтобы последним было слово игрока.
    if messages.last().and_then(|m| m["role"].as_str()) == Some("assistant") {
        messages.push(json!({ "role": "user", "content": "Продолжай." }));
    }
    if json_mode {
        // Ответ начинается с «{» — модель продолжает строго с JSON.
        messages.push(json!({ "role": "assistant", "content": "{" }));
    }
    json!({
        "model": model,
        "max_tokens": MAX_TOKENS,
        "system": [{
            "type": "text",
            "text": system,
            "cache_control": { "type": "ephemeral" },
        }],
        "messages": messages,
    })
}

pub(crate) fn parse_reply(body: &Value) -> Result<String, String> {
    let mut text = String::new();
    for part in body["content"].as_array().map(Vec::as_slice).unwrap_or_default() {
        if part["type"] == "text" {
            text.push_str(part["text"].as_str().unwrap_or_default());
        }
    }
    if !text.trim().is_empty() {
        return Ok(text);
    }
    match body["stop_reason"].as_str() {
        Some("max_tokens") => Err("Ответ Claude оборвался по лимиту длины".into()),
        Some("refusal") => Err("Claude отказался отвечать".into()),
        _ => Err("Claude вернул пустой ответ".into()),
    }
}

pub(crate) fn api_error(status: u16, body: &Value) -> String {
    let message = body["error"]["message"].as_str().unwrap_or("без объяснения");
    match status {
        401 => format!("Claude не принял ключ (401): {message}"),
        403 => format!("У ключа нет доступа к этой модели (403): {message}"),
        404 => format!("Модель не найдена (404): {message}"),
        429 => format!("Слишком частые запросы к Claude (429): {message}"),
        400 => format!("Claude не принял запрос (400): {message}"),
        500..=599 => format!("Сбой на стороне Claude ({status}): {message}"),
        _ => format!("Claude вернул ошибку {status}: {message}"),
    }
}

fn network_error(e: reqwest::Error) -> String {
    format!("Не удалось связаться с Claude: {e}")
}

#[cfg(test)]
mod tests {
    use super::*;

    fn msg(role: Role, text: &str) -> ChatMessage {
        ChatMessage { role, text: text.into() }
    }

    #[test]
    fn system_is_cached_and_history_starts_with_player() {
        let history = [msg(Role::Master, "Вступление"), msg(Role::Player, "Осматриваюсь")];
        let body = request_body("claude-sonnet-4", "КОДЕКС", &history, false);
        assert_eq!(body["system"][0]["cache_control"]["type"], "ephemeral");
        assert_eq!(body["messages"].as_array().unwrap().len(), 1);
        assert_eq!(body["messages"][0]["role"], "user");
    }

    #[test]
    fn json_mode_starts_the_answer_with_brace() {
        let history = [msg(Role::Player, "Что в сумке?")];
        let body = request_body("claude-sonnet-4", "КОДЕКС", &history, true);
        let messages = body["messages"].as_array().unwrap();
        assert_eq!(messages.last().unwrap()["role"], "assistant");
        assert_eq!(messages.last().unwrap()["content"], "{");
    }

    #[test]
    fn models_and_errors_are_parsed() {
        let body = json!({ "data": [{ "id": "claude-opus-4", "display_name": "Claude Opus 4" }] });
        let models = parse_models(&body);
        assert_eq!(models[0].id, "claude-opus-4");
        assert_eq!(models[0].name, "Claude Opus 4");
        let error = json!({ "error": { "message": "invalid x-api-key" } });
        assert!(api_error(401, &error).contains("не принял ключ"));
        assert!(parse_reply(&json!({ "content": [], "stop_reason": "max_tokens" })).is_err());
        assert_eq!(
            parse_reply(&json!({ "content": [{ "type": "text", "text": "Привет" }] })).unwrap(),
            "Привет"
        );
    }
}
