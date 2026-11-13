//! OpenAI (ChatGPT): Responses API и список моделей.

use serde_json::{json, Value};

use super::{cached_tokens, prompt_tokens, ChatMessage, Generated, ModelInfo, Role};

const BASE_URL: &str = "https://api.openai.com/v1";

/// Модели, пригодные для текстового диалога.
pub async fn list_models(client: &reqwest::Client, key: &str) -> Result<Vec<ModelInfo>, String> {
    let response = client
        .get(format!("{BASE_URL}/models"))
        .bearer_auth(key)
        .send()
        .await
        .map_err(network_error)?;
    let status = response.status();
    let body: Value = response.json().await.map_err(|e| format!("Неверный ответ OpenAI: {e}"))?;
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
        .post(format!("{BASE_URL}/responses"))
        .bearer_auth(key)
        .json(&{
            let mut body = request_body(model, system, history);
            if json_mode {
                body["text"] = json!({ "format": { "type": "json_object" } });
            }
            body
        })
        .send()
        .await
        .map_err(network_error)?;
    let status = response.status();
    let body: Value = response.json().await.map_err(|e| format!("Неверный ответ OpenAI: {e}"))?;
    if !status.is_success() {
        return Err(api_error(status.as_u16(), &body));
    }
    Ok(Generated {
        text: parse_reply(&body)?,
        prompt_tokens: prompt_tokens(&body),
        cached_tokens: cached_tokens(&body),
    })
}

/// Не текстовые модели (звук, картинки, эмбеддинги и т. п.) в выбор не попадают.
const EXCLUDED: [&str; 13] = [
    "audio",
    "realtime",
    "tts",
    "transcribe",
    "image",
    "embedding",
    "moderation",
    "search",
    "instruct",
    "dall-e",
    "whisper",
    "computer-use",
    "deep-research",
];

fn is_chat_model(id: &str) -> bool {
    let chat_family = id.starts_with("gpt-")
        || id.starts_with("chatgpt-")
        || (id.starts_with('o') && id[1..].starts_with(|c: char| c.is_ascii_digit()));
    chat_family && !EXCLUDED.iter().any(|x| id.contains(x))
}

pub(crate) fn parse_models(body: &Value) -> Vec<ModelInfo> {
    let mut models: Vec<(i64, ModelInfo)> = body["data"]
        .as_array()
        .map(Vec::as_slice)
        .unwrap_or_default()
        .iter()
        .filter_map(|m| {
            let id = m["id"].as_str()?;
            is_chat_model(id).then(|| {
                (
                    m["created"].as_i64().unwrap_or_default(),
                    ModelInfo {
                        id: id.to_string(),
                        name: id.to_string(),
                        description: "Платная модель: расходует кредиты аккаунта OpenAI".into(),
                        input_token_limit: None,
                    },
                )
            })
        })
        .collect();
    // Сначала новые модели.
    models.sort_by(|a, b| b.0.cmp(&a.0).then_with(|| a.1.id.cmp(&b.1.id)));
    models.into_iter().map(|(_, m)| m).collect()
}

/// Тело запроса Responses API: кодекс и состояние игры — в `instructions`, история — в
/// `input`. Пустые сообщения отбрасываются, история начинается с заявки игрока.
pub(crate) fn request_body(model: &str, system: &str, history: &[ChatMessage]) -> Value {
    let input: Vec<Value> = history
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
    json!({
        "model": model,
        "instructions": system,
        "input": input,
        "store": false,
    })
}

pub(crate) fn parse_reply(body: &Value) -> Result<String, String> {
    let mut text = String::new();
    let mut refusal = None;
    for item in body["output"].as_array().map(Vec::as_slice).unwrap_or_default() {
        if item["type"] != "message" {
            continue;
        }
        for part in item["content"].as_array().map(Vec::as_slice).unwrap_or_default() {
            match part["type"].as_str() {
                Some("output_text") => text.push_str(part["text"].as_str().unwrap_or_default()),
                Some("refusal") => refusal = part["refusal"].as_str().map(str::to_string),
                _ => {}
            }
        }
    }
    if !text.trim().is_empty() {
        return Ok(text);
    }
    if let Some(reason) = refusal {
        return Err(format!("Модель OpenAI отказалась отвечать: {reason}"));
    }
    match body["incomplete_details"]["reason"].as_str() {
        Some("max_output_tokens") => Err("Ответ OpenAI оборвался по лимиту длины".into()),
        Some("content_filter") => Err("OpenAI остановил ответ фильтром безопасности".into()),
        Some(reason) => Err(format!("OpenAI вернул неполный ответ (причина: {reason})")),
        None => Err("OpenAI вернул пустой ответ".into()),
    }
}

pub(crate) fn api_error(status: u16, body: &Value) -> String {
    let message = body["error"]["message"].as_str().unwrap_or("без подробностей");
    let code = body["error"]["code"].as_str().unwrap_or_default();
    match (status, code) {
        (401, _) => "Ключ OpenAI не принят — проверьте его в меню «Модели ИИ»".into(),
        (429, "insufficient_quota") => "На счёте OpenAI закончились кредиты или не настроена \
                                        оплата (platform.openai.com → Billing)"
            .into(),
        (429, _) => format!("Превышен лимит запросов OpenAI — подождите минуту ({message})"),
        (403, _) => format!("Нет доступа к модели OpenAI: {message}"),
        (404, _) => format!("Модель не найдена — выберите другую в меню «Модели ИИ» ({message})"),
        (500..=599, _) => format!("Сервис OpenAI временно недоступен ({status}): {message}"),
        _ => format!("Ошибка OpenAI ({status}): {message}"),
    }
}

fn network_error(error: reqwest::Error) -> String {
    if error.is_timeout() {
        "OpenAI не ответил вовремя — попробуйте ещё раз".into()
    } else {
        format!("Нет связи с OpenAI: {error}")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn msg(role: Role, text: &str) -> ChatMessage {
        ChatMessage { role, text: text.into() }
    }

    #[test]
    fn request_uses_instructions_and_roles() {
        let body = request_body(
            "gpt-5.5",
            "КОДЕКС",
            &[
                msg(Role::Master, "Приветствие"),
                msg(Role::Player, " Крадусь к окну "),
                msg(Role::Master, "Стража спит."),
                msg(Role::Player, ""),
            ],
        );
        assert_eq!(body["model"], "gpt-5.5");
        assert_eq!(body["instructions"], "КОДЕКС");
        assert_eq!(body["store"], false);
        let input = body["input"].as_array().unwrap();
        assert_eq!(input.len(), 2);
        assert_eq!(input[0]["role"], "user");
        assert_eq!(input[0]["content"], "Крадусь к окну");
        assert_eq!(input[1]["role"], "assistant");
        assert!(body.get("temperature").is_none());
    }

    #[test]
    fn only_chat_models_newest_first() {
        let body = json!({ "data": [
            { "id": "gpt-4o", "created": 100 },
            { "id": "gpt-5.5", "created": 300 },
            { "id": "o3", "created": 200 },
            { "id": "text-embedding-3-large", "created": 400 },
            { "id": "gpt-4o-audio-preview", "created": 500 },
            { "id": "gpt-image-1", "created": 600 },
            { "id": "whisper-1", "created": 50 },
            { "id": "omni-moderation-latest", "created": 700 },
            { "id": "chatgpt-4o-latest", "created": 150 }
        ]});
        let ids: Vec<String> = parse_models(&body).into_iter().map(|m| m.id).collect();
        assert_eq!(ids, vec!["gpt-5.5", "o3", "chatgpt-4o-latest", "gpt-4o"]);
    }

    #[test]
    fn reply_text_refusal_and_incomplete() {
        let ok = json!({ "output": [
            { "type": "reasoning", "summary": [] },
            { "type": "message", "content": [
                { "type": "output_text", "text": "Тень " },
                { "type": "output_text", "text": "шевельнулась." }
            ]}
        ]});
        assert_eq!(parse_reply(&ok).unwrap(), "Тень шевельнулась.");
        let refused = json!({ "output": [{ "type": "message", "content": [{ "type": "refusal", "refusal": "нет" }] }] });
        assert!(parse_reply(&refused).unwrap_err().contains("отказалась"));
        let cut = json!({ "output": [], "incomplete_details": { "reason": "max_output_tokens" } });
        assert!(parse_reply(&cut).unwrap_err().contains("лимиту длины"));
        assert!(parse_reply(&json!({})).is_err());
    }

    #[test]
    fn api_errors_are_explained() {
        let quota = json!({ "error": { "message": "You exceeded your current quota", "code": "insufficient_quota" } });
        assert!(api_error(429, &quota).contains("кредиты"));
        let limit =
            json!({ "error": { "message": "Rate limit reached", "code": "rate_limit_exceeded" } });
        assert!(api_error(429, &limit).contains("лимит запросов"));
        assert!(api_error(401, &json!({})).contains("Ключ OpenAI"));
        assert!(api_error(404, &json!({ "error": { "message": "no model" } })).contains("no model"));
    }
}
