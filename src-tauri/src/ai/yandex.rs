//! YandexGPT (Yandex AI Studio): OpenAI-совместимый Chat Completions API.
//!
//! Нужны API-ключ сервисного аккаунта и ID каталога: модель задаётся как
//! `gpt://<каталог>/<модель>`, каталог передаётся ещё и заголовком `OpenAI-Project`.

use serde_json::{json, Value};

use super::{ChatMessage, ModelInfo, Role};

const BASE_URL: &str = "https://ai.api.cloud.yandex.net/v1";

/// Модели, если список у сервиса получить не удалось.
const KNOWN: [(&str, &str); 5] = [
    ("yandexgpt/latest", "YandexGPT Pro — основная модель Яндекса"),
    ("yandexgpt-lite/latest", "YandexGPT Lite — быстрее и дешевле"),
    ("aliceai-llm", "Alice AI LLM"),
    ("qwen3-235b-a22b-fp8/latest", "Qwen3 235B в Yandex Cloud"),
    ("gpt-oss-120b/latest", "gpt-oss-120b в Yandex Cloud"),
];

/// Ключ Яндекса: ID каталога и API-ключ («b1g… AQVN…» или «b1g…:AQVN…»).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct YandexKey {
    pub folder: String,
    pub api_key: String,
}

impl YandexKey {
    pub fn parse(text: &str) -> Result<Self, String> {
        let parts: Vec<&str> = text
            .split(|c: char| c.is_whitespace() || c == ':' || c == ';' || c == ',')
            .filter(|p| !p.is_empty())
            .collect();
        match parts.as_slice() {
            [folder, key] => {
                // Каталог — короткий ID из букв и цифр, ключ — длинная строка.
                let (folder, key) =
                    if folder.len() > key.len() { (key, folder) } else { (folder, key) };
                if !folder.chars().all(|c| c.is_ascii_alphanumeric()) {
                    return Err(
                        "ID каталога Yandex Cloud — латинские буквы и цифры (например b1g…)".into(),
                    );
                }
                Ok(Self { folder: folder.to_string(), api_key: key.to_string() })
            }
            _ => {
                Err("Для Яндекса введите ID каталога и API-ключ через пробел: «b1g… AQVN…»".into())
            }
        }
    }
}

fn model_uri(folder: &str, model: &str) -> String {
    if model.starts_with("gpt://") {
        model.to_string()
    } else {
        format!("gpt://{folder}/{model}")
    }
}

/// Модели каталога; если сервис списка не дал — известные текстовые модели.
pub async fn list_models(client: &reqwest::Client, key: &str) -> Result<Vec<ModelInfo>, String> {
    let key = YandexKey::parse(key)?;
    let response = client
        .get(format!("{BASE_URL}/models"))
        .bearer_auth(&key.api_key)
        .header("OpenAI-Project", &key.folder)
        .send()
        .await
        .map_err(network_error)?;
    let status = response.status();
    let body: Value = response.json().await.unwrap_or(Value::Null);
    // 401 — неверный ключ. 403 на списке не значит, что модели недоступны: сервису списка
    // нужны свои права, а генерации хватает ai.languageModels.user. Тогда — известные модели,
    // и настоящую ошибку доступа покажет первый запрос к мастеру.
    if status.as_u16() == 401 {
        return Err(api_error(status.as_u16(), &body));
    }
    if !status.is_success() {
        return Ok(known_models());
    }
    let listed = parse_models(&body, &key.folder);
    Ok(if listed.is_empty() { known_models() } else { listed })
}

fn known_models() -> Vec<ModelInfo> {
    KNOWN
        .iter()
        .map(|(id, description)| ModelInfo {
            id: (*id).to_string(),
            name: (*id).to_string(),
            description: format!("{description}. Платная модель: расходует баланс Yandex Cloud"),
            input_token_limit: None,
        })
        .collect()
}

pub(crate) fn parse_models(body: &Value, folder: &str) -> Vec<ModelInfo> {
    let prefix = format!("gpt://{folder}/");
    let mut out: Vec<ModelInfo> = body["data"]
        .as_array()
        .map(Vec::as_slice)
        .unwrap_or_default()
        .iter()
        .filter_map(|m| {
            let id = m["id"].as_str()?;
            let id = id.strip_prefix(&prefix).unwrap_or(id);
            let text = ![
                "embedding",
                "emb-",
                "speech",
                "tts",
                "stt",
                "art",
                "image",
                "classifier",
                "realtime",
            ]
            .iter()
            .any(|x| id.contains(x));
            text.then(|| ModelInfo {
                id: id.to_string(),
                name: id.to_string(),
                description: "Платная модель: расходует баланс Yandex Cloud".into(),
                input_token_limit: None,
            })
        })
        .collect();
    out.sort_by(|a, b| a.id.cmp(&b.id));
    out.dedup_by(|a, b| a.id == b.id);
    out
}

/// Ответ модели на историю диалога.
pub async fn generate(
    client: &reqwest::Client,
    key: &str,
    model: &str,
    system: &str,
    history: &[ChatMessage],
) -> Result<String, String> {
    let key = YandexKey::parse(key)?;
    let response = client
        .post(format!("{BASE_URL}/chat/completions"))
        .bearer_auth(&key.api_key)
        .header("OpenAI-Project", &key.folder)
        .json(&request_body(&model_uri(&key.folder, model), system, history))
        .send()
        .await
        .map_err(network_error)?;
    let status = response.status();
    let body: Value = response.json().await.map_err(|e| format!("Неверный ответ Яндекса: {e}"))?;
    if !status.is_success() {
        return Err(api_error(status.as_u16(), &body));
    }
    parse_reply(&body)
}

pub(crate) fn request_body(model: &str, system: &str, history: &[ChatMessage]) -> Value {
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
    json!({ "model": model, "messages": messages, "temperature": 0.6 })
}

pub(crate) fn parse_reply(body: &Value) -> Result<String, String> {
    let choice = &body["choices"][0];
    let text = choice["message"]["content"].as_str().unwrap_or_default();
    if !text.trim().is_empty() {
        return Ok(text.to_string());
    }
    match choice["finish_reason"].as_str() {
        Some("length") => Err("Ответ Яндекса оборвался по лимиту длины".into()),
        Some("content_filter") => Err("Яндекс остановил ответ фильтром содержания".into()),
        _ => Err("Яндекс вернул пустой ответ".into()),
    }
}

pub(crate) fn api_error(status: u16, body: &Value) -> String {
    let message = body["error"]["message"]
        .as_str()
        .or_else(|| body["message"].as_str())
        .unwrap_or("без подробностей");
    match status {
        401 => "Ключ Яндекса не принят — проверьте API-ключ в меню «Модели ИИ»".into(),
        403 => format!(
            "Нет доступа к модели Яндекса ({message}). Проверьте: роль ai.languageModels.user выдана сервисному аккаунту в том же каталоге, чей ID указан в ключе; у API-ключа область действия yc.ai.foundationModels.execute; после выдачи роли подождите пару минут"
        ),
        404 => format!("Модель или каталог не найдены — проверьте ID каталога ({message})"),
        429 => format!("Превышен лимит запросов Яндекса — подождите минуту ({message})"),
        500..=599 => format!("Сервис Яндекса временно недоступен ({status}): {message}"),
        _ => format!("Ошибка Яндекса ({status}): {message}"),
    }
}

fn network_error(error: reqwest::Error) -> String {
    if error.is_timeout() {
        "Яндекс не ответил вовремя — попробуйте ещё раз".into()
    } else {
        format!("Нет связи с Яндексом: {error}")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn key_parsing_accepts_both_orders() {
        let k = YandexKey::parse("b1gabc123 AQVNsecretkeyvalue_long").unwrap();
        assert_eq!(k.folder, "b1gabc123");
        assert_eq!(k.api_key, "AQVNsecretkeyvalue_long");
        let k = YandexKey::parse(" AQVNsecretkeyvalue_long:b1gabc123 ").unwrap();
        assert_eq!(k.folder, "b1gabc123");
        assert!(YandexKey::parse("AQVNonlykey").is_err());
    }

    #[test]
    fn request_has_system_and_model_uri() {
        let body = request_body(
            &model_uri("b1g", "yandexgpt/latest"),
            "КОДЕКС",
            &[
                ChatMessage { role: Role::Master, text: "Привет".into() },
                ChatMessage { role: Role::Player, text: "Иду".into() },
            ],
        );
        assert_eq!(body["model"], "gpt://b1g/yandexgpt/latest");
        assert_eq!(body["messages"][0]["role"], "system");
        assert_eq!(body["messages"][1]["role"], "user");
        assert_eq!(body["messages"].as_array().unwrap().len(), 2);
    }

    #[test]
    fn models_are_stripped_and_filtered() {
        let body = json!({ "data": [
            { "id": "gpt://b1g/yandexgpt/latest" },
            { "id": "gpt://b1g/text-embeddings" },
            { "id": "yandexgpt-lite/latest" }
        ]});
        let ids: Vec<String> = parse_models(&body, "b1g").into_iter().map(|m| m.id).collect();
        assert_eq!(ids, vec!["yandexgpt-lite/latest", "yandexgpt/latest"]);
        assert_eq!(known_models().len(), 5);
    }

    #[test]
    fn replies_and_errors() {
        let ok =
            json!({ "choices": [{ "message": { "content": "Туман." }, "finish_reason": "stop" }] });
        assert_eq!(parse_reply(&ok).unwrap(), "Туман.");
        let cut =
            json!({ "choices": [{ "message": { "content": "" }, "finish_reason": "length" }] });
        assert!(parse_reply(&cut).unwrap_err().contains("лимиту"));
        assert!(api_error(403, &json!({})).contains("ai.languageModels.user"));
    }
}
