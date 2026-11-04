//! Google Gemini (Generative Language API, v1beta).

use serde_json::{json, Value};

use super::{ChatMessage, ModelInfo, Role};

const BASE_URL: &str = "https://generativelanguage.googleapis.com/v1beta";

/// Модели с поддержкой генерации текста.
pub async fn list_models(client: &reqwest::Client, key: &str) -> Result<Vec<ModelInfo>, String> {
    let response = client
        .get(format!("{BASE_URL}/models"))
        .query(&[("pageSize", "1000")])
        .header("x-goog-api-key", key)
        .send()
        .await
        .map_err(network_error)?;
    let status = response.status();
    let body: Value = response.json().await.map_err(|e| format!("Неверный ответ Gemini: {e}"))?;
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
) -> Result<String, String> {
    let response = client
        .post(format!("{BASE_URL}/models/{model}:generateContent"))
        .header("x-goog-api-key", key)
        .json(&request_body(system, history))
        .send()
        .await
        .map_err(network_error)?;
    let status = response.status();
    let body: Value = response.json().await.map_err(|e| format!("Неверный ответ Gemini: {e}"))?;
    if !status.is_success() {
        return Err(api_error(status.as_u16(), &body));
    }
    parse_reply(&body)
}

pub(crate) fn parse_models(body: &Value) -> Vec<ModelInfo> {
    let mut models: Vec<ModelInfo> = body["models"]
        .as_array()
        .map(Vec::as_slice)
        .unwrap_or_default()
        .iter()
        .filter(|m| {
            m["supportedGenerationMethods"]
                .as_array()
                .is_some_and(|methods| methods.iter().any(|x| x == "generateContent"))
        })
        .filter_map(|m| {
            let id = m["name"].as_str()?.strip_prefix("models/")?.to_string();
            Some(ModelInfo {
                name: m["displayName"].as_str().unwrap_or(&id).to_string(),
                description: m["description"].as_str().unwrap_or_default().to_string(),
                input_token_limit: m["inputTokenLimit"].as_u64(),
                id,
            })
        })
        .collect();
    models.sort_by(|a, b| a.name.cmp(&b.name));
    models
}

/// Тело запроса. Gemini требует чередования ролей и первого сообщения от пользователя,
/// поэтому подряд идущие сообщения одной роли склеиваются, а начальные ответы мастера
/// (до первой заявки игрока) отбрасываются.
pub(crate) fn request_body(system: &str, history: &[ChatMessage]) -> Value {
    let mut contents: Vec<(Role, String)> = Vec::new();
    for message in history {
        let text = message.text.trim();
        if text.is_empty() {
            continue;
        }
        match contents.last_mut() {
            Some((role, existing)) if *role == message.role => {
                existing.push_str("\n\n");
                existing.push_str(text);
            }
            None if message.role == Role::Master => {}
            _ => contents.push((message.role, text.to_string())),
        }
    }
    let contents: Vec<Value> = contents
        .into_iter()
        .map(|(role, text)| {
            let role = if role == Role::Player { "user" } else { "model" };
            json!({ "role": role, "parts": [{ "text": text }] })
        })
        .collect();
    json!({
        "systemInstruction": { "parts": [{ "text": system }] },
        "contents": contents,
        "generationConfig": { "temperature": 0.9 }
    })
}

pub(crate) fn parse_reply(body: &Value) -> Result<String, String> {
    let candidate = &body["candidates"][0];
    let text: String = candidate["content"]["parts"]
        .as_array()
        .map(Vec::as_slice)
        .unwrap_or_default()
        .iter()
        .filter(|p| p["thought"].as_bool() != Some(true))
        .filter_map(|p| p["text"].as_str())
        .collect::<Vec<_>>()
        .join("");
    if !text.trim().is_empty() {
        return Ok(text);
    }
    if let Some(reason) = body["promptFeedback"]["blockReason"].as_str() {
        return Err(format!("Gemini отклонил запрос (причина: {reason})"));
    }
    match candidate["finishReason"].as_str() {
        Some("SAFETY") => Err("Gemini остановил ответ фильтром безопасности".into()),
        Some("MAX_TOKENS") => Err("Ответ Gemini оборвался по лимиту длины".into()),
        Some(reason) => Err(format!("Gemini вернул пустой ответ (причина: {reason})")),
        None => Err("Gemini вернул пустой ответ".into()),
    }
}

pub(crate) fn api_error(status: u16, body: &Value) -> String {
    let message = body["error"]["message"].as_str().unwrap_or("без подробностей");
    match status {
        400 if message.contains("API key") => {
            "Ключ Gemini не принят — проверьте его в меню «Модели ИИ»".into()
        }
        401 | 403 => format!("Нет доступа к Gemini: {message}"),
        404 => format!("Модель не найдена — выберите другую в меню «Модели ИИ» ({message})"),
        429 => format!(
            "Gemini отказал по квоте: {message}. Если квота бесплатного тарифа равна нулю, \
             он недоступен для вашего аккаунта или региона — включите оплату в Google AI Studio \
             или выберите ChatGPT"
        ),
        500..=599 => format!("Сервис Gemini временно недоступен ({status}): {message}"),
        _ => format!("Ошибка Gemini ({status}): {message}"),
    }
}

fn network_error(error: reqwest::Error) -> String {
    if error.is_timeout() {
        "Gemini не ответил вовремя — попробуйте ещё раз".into()
    } else {
        format!("Нет связи с Gemini: {error}")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn msg(role: Role, text: &str) -> ChatMessage {
        ChatMessage { role, text: text.into() }
    }

    #[test]
    fn request_alternates_roles_and_starts_with_user() {
        let body = request_body(
            "кодекс",
            &[
                msg(Role::Master, "приветствие до первой заявки"),
                msg(Role::Player, "Осматриваю зал"),
                msg(Role::Player, "16 - везунчик"),
                msg(Role::Master, "Вы замечаете..."),
                msg(Role::Player, "  "),
            ],
        );
        let contents = body["contents"].as_array().unwrap();
        assert_eq!(contents.len(), 2);
        assert_eq!(contents[0]["role"], "user");
        assert_eq!(contents[0]["parts"][0]["text"], "Осматриваю зал\n\n16 - везунчик");
        assert_eq!(contents[1]["role"], "model");
        assert_eq!(body["systemInstruction"]["parts"][0]["text"], "кодекс");
    }

    #[test]
    fn models_are_filtered_and_stripped() {
        let body = json!({ "models": [
            { "name": "models/b-model", "displayName": "B", "supportedGenerationMethods": ["generateContent"], "inputTokenLimit": 1000 },
            { "name": "models/embed", "displayName": "E", "supportedGenerationMethods": ["embedContent"] },
            { "name": "models/a-model", "displayName": "A", "supportedGenerationMethods": ["countTokens", "generateContent"] }
        ]});
        let models = parse_models(&body);
        assert_eq!(
            models.iter().map(|m| m.id.as_str()).collect::<Vec<_>>(),
            ["a-model", "b-model"]
        );
        assert_eq!(models[1].input_token_limit, Some(1000));
    }

    #[test]
    fn reply_text_and_failures() {
        let ok = json!({ "candidates": [{ "content": { "parts": [
            { "text": "размышления", "thought": true },
            { "text": "> — Стоять!" },
            { "text": " Стражник поднимает алебарду." }
        ]}}]});
        assert_eq!(parse_reply(&ok).unwrap(), "> — Стоять! Стражник поднимает алебарду.");
        let blocked = json!({ "promptFeedback": { "blockReason": "SAFETY" } });
        assert!(parse_reply(&blocked).unwrap_err().contains("SAFETY"));
        let cut =
            json!({ "candidates": [{ "finishReason": "MAX_TOKENS", "content": { "parts": [] } }] });
        assert!(parse_reply(&cut).unwrap_err().contains("лимиту"));
    }

    #[test]
    fn api_errors_are_explained() {
        let key =
            json!({ "error": { "message": "API key not valid. Please pass a valid API key." } });
        assert!(api_error(400, &key).contains("Ключ Gemini не принят"));
        assert!(api_error(429, &json!({})).contains("квоте"));
        assert!(api_error(404, &json!({ "error": { "message": "not found" } })).contains("Модель"));
    }
}
