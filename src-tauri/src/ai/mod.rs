//! ИИ-мастер: настройки провайдеров, выбор модели и запросы.
//!
//! Горячее переключение: история диалога хранится в нейтральном формате ([`ChatMessage`]),
//! а провайдер и модель читаются из настроек в момент каждого запроса. Поэтому модель
//! можно сменить посреди сцены — следующий ответ даст новая модель с тем же контекстом.

pub mod anthropic;
pub mod gemini;
pub mod ollama;
pub mod openai;
pub mod yandex;

use std::collections::BTreeMap;
use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

/// Провайдер ИИ.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize, Default)]
#[serde(rename_all = "snake_case")]
pub enum Provider {
    #[default]
    Gemini,
    #[serde(rename = "openai")]
    OpenAi,
    /// Claude (Anthropic).
    Anthropic,
    /// Локальная модель через Ollama (на этом ПК или в локальной сети).
    Local,
    /// YandexGPT и другие модели Yandex AI Studio.
    Yandex,
}

impl Provider {
    pub const ALL: [Provider; 5] = [
        Provider::Gemini,
        Provider::OpenAi,
        Provider::Anthropic,
        Provider::Yandex,
        Provider::Local,
    ];

    pub fn label(self) -> &'static str {
        match self {
            Provider::Gemini => "Google Gemini",
            Provider::OpenAi => "OpenAI (ChatGPT)",
            Provider::Anthropic => "Claude (Anthropic)",
            Provider::Local => "Локальная модель",
            Provider::Yandex => "YandexGPT (Яндекс)",
        }
    }

    /// Подключён ли провайдер в этой версии.
    pub fn ready(self) -> bool {
        true
    }
}

/// Сообщение диалога.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: Role,
    pub text: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Role {
    Player,
    Master,
}

/// Модель, доступная у провайдера.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct ModelInfo {
    pub id: String,
    pub name: String,
    pub description: String,
    pub input_token_limit: Option<u64>,
}

/// Ответ мастера.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct MasterReply {
    pub text: String,
    pub provider: Provider,
    pub model: String,
    /// Итоги команд движка из ответа мастера (ячейки, заклинания).
    pub actions: Vec<dnd_master::MasterAction>,
    /// Броски, сделанные движком по запросам мастера (и тайные — интерфейс их не показывает).
    pub rolls: Vec<dnd_master::MasterRoll>,
    /// Броски d20 в тексте, которых движок не делал.
    pub fabricated: Vec<String>,
    /// Все ответы модели за ход как есть (для журнала разбора ошибок).
    pub raw: Vec<String>,
    /// Размер самого большого запроса хода в токенах — как посчитал провайдер.
    pub prompt_tokens: Option<u64>,
    /// Сколько из них провайдер взял из кэша (повтор неизменного начала запроса).
    pub cached_tokens: Option<u64>,
    /// Сколько из них записано в кэш (первый ход сцены или после долгой паузы).
    pub cache_write_tokens: Option<u64>,
    /// Размер того же запроса в символах (если провайдер токены не вернул).
    pub prompt_chars: usize,
    /// Двухшаговый ход: рассказ готов, данные ещё обновляются (`ai_update`).
    pub pending_update: bool,
    /// Команды движка, которые мастер написал в рассказе (двухшаговый ход): подсказка второму шагу.
    pub written_commands: String,
    /// Мастер пометил ход как разговор без изменений: второй шаг можно пропустить.
    pub no_changes: bool,
    /// Ответ модели в токенах (сумма за все запросы хода).
    pub output_tokens: Option<u64>,
    /// Свежая часть запроса (не из кэша и не записанная в него) — сумма за все запросы хода.
    pub fresh_tokens: Option<u64>,
    /// Сколько запросов к модели ушло за ход (броски, query и исправления — отдельные запросы).
    pub requests: u32,
    /// Разбивка самого большого запроса хода по блокам, в символах: кодекс, снимок сцены,
    /// история, сообщение хода.
    pub blocks: Vec<PromptBlock>,
}

/// Блок запроса для «Логирования».
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct PromptBlock {
    pub name: String,
    pub chars: usize,
}

/// Ответ модели: текст и размер запроса в токенах, если провайдер его вернул.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Generated {
    pub text: String,
    pub prompt_tokens: Option<u64>,
    /// Кэшированная часть запроса в токенах (OpenAI, Anthropic, Gemini).
    pub cached_tokens: Option<u64>,
    /// Записанная в кэш часть запроса (Anthropic).
    pub cache_write_tokens: Option<u64>,
    /// Длина ответа модели в токенах.
    pub output_tokens: Option<u64>,
}

/// Ошибка сети, а не ответа модели: стоит повторить запрос.
fn is_network_error(error: &str) -> bool {
    let e = error.to_lowercase();
    e.starts_with("нет связи")
        || e.contains("timed out")
        || e.contains("timeout")
        || e.contains("connection")
}

/// Длина ответа в токенах: Anthropic и OpenAI Responses (`output_tokens`), Chat Completions
/// (`completion_tokens`), Gemini (`candidatesTokenCount`), Ollama (`eval_count`), Яндекс
/// (`completionTokens`, числом в строке).
pub(crate) fn output_tokens(body: &serde_json::Value) -> Option<u64> {
    let usage = &body["usage"];
    usage["output_tokens"]
        .as_u64()
        .or_else(|| usage["completion_tokens"].as_u64())
        .or_else(|| body["usageMetadata"]["candidatesTokenCount"].as_u64())
        .or_else(|| body["eval_count"].as_u64())
        .or_else(|| {
            let yandex = &body["result"]["usage"]["completionTokens"];
            yandex.as_u64().or_else(|| yandex.as_str().and_then(|t| t.parse().ok()))
        })
}

/// Размер запроса в токенах из ответа провайдера: OpenAI (Responses и Chat Completions),
/// Gemini, Ollama.
pub(crate) fn prompt_tokens(body: &serde_json::Value) -> Option<u64> {
    let usage = &body["usage"];
    let base = usage["input_tokens"]
        .as_u64()
        .or_else(|| usage["prompt_tokens"].as_u64())
        .or_else(|| body["usageMetadata"]["promptTokenCount"].as_u64())
        .or_else(|| body["prompt_eval_count"].as_u64())?;
    // У Claude кэшированная часть считается отдельно от `input_tokens`; у остальных
    // провайдеров она уже внутри, и эти поля пустые.
    let cached = usage["cache_read_input_tokens"].as_u64().unwrap_or(0)
        + usage["cache_creation_input_tokens"].as_u64().unwrap_or(0);
    Some(base + cached)
}

/// Записанная в кэш часть запроса: за неё платят дороже обычного входа, зато ходы в пределах
/// срока жизни кэша идут по цене чтения.
pub(crate) fn cache_write_tokens(body: &serde_json::Value) -> Option<u64> {
    body["usage"]["cache_creation_input_tokens"].as_u64().filter(|n| *n > 0)
}

/// Кэшированная часть запроса: провайдер не считает её заново и берёт дешевле.
/// OpenAI — `cached_tokens`, Anthropic — `cache_read_input_tokens`, Gemini — `cachedContentTokenCount`.
pub(crate) fn cached_tokens(body: &serde_json::Value) -> Option<u64> {
    body["usage"]["prompt_tokens_details"]["cached_tokens"]
        .as_u64()
        .or_else(|| body["usage"]["input_tokens_details"]["cached_tokens"].as_u64())
        .or_else(|| body["usage"]["cache_read_input_tokens"].as_u64())
        .or_else(|| body["usageMetadata"]["cachedContentTokenCount"].as_u64())
}

/// Настройки ИИ. Хранятся в папке настроек приложения на ПК.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct AiSettings {
    pub provider: Provider,
    pub model: Option<String>,
    pub gemini_api_key: Option<String>,
    #[serde(default)]
    pub openai_api_key: Option<String>,
    /// Адрес сервера Ollama; по умолчанию — этот ПК.
    #[serde(default)]
    pub local_url: Option<String>,
    /// ID каталога Yandex Cloud и API-ключ через пробел.
    #[serde(default)]
    pub yandex_key: Option<String>,
    /// Ключ Anthropic (Claude).
    #[serde(default)]
    pub anthropic_api_key: Option<String>,
    /// Модель второго шага (данные движка) по провайдерам; пустая строка — та же, что у мастера.
    /// Нет записи — дешёвая модель по умолчанию ([`default_update_model`]).
    #[serde(default)]
    pub update_models: BTreeMap<Provider, String>,
}

/// Дешёвая модель второго шага по умолчанию: шаг только переводит готовый рассказ в команды,
/// сильная модель ему не нужна. Если модель недоступна, второй шаг повторяется моделью мастера.
pub fn default_update_model(provider: Provider) -> Option<&'static str> {
    match provider {
        Provider::Anthropic => Some("claude-haiku-5-5"),
        Provider::OpenAi => Some("gpt-6-luna"),
        Provider::Gemini => Some("gemini-flash-lite-latest"),
        // Локальная модель и Яндекс: вторая модель — ещё одна загрузка или другой тариф.
        Provider::Local | Provider::Yandex => None,
    }
}

/// Состояние одного провайдера для интерфейса.
#[derive(Debug, Clone, Serialize)]
pub struct ProviderView {
    pub provider: Provider,
    pub label: &'static str,
    pub ready: bool,
    pub has_key: bool,
    pub key_hint: Option<String>,
}

/// Настройки для интерфейса: ключ никогда не передаётся, только признак и подсказка.
#[derive(Debug, Clone, Serialize)]
pub struct AiSettingsView {
    pub provider: Provider,
    pub provider_label: &'static str,
    pub model: Option<String>,
    pub has_key: bool,
    /// Последние 4 символа ключа.
    pub key_hint: Option<String>,
    /// Все провайдеры: подключён ли, есть ли ключ.
    pub providers: Vec<ProviderView>,
    /// Модель второго шага активного провайдера (`None` — та же, что у мастера).
    pub update_model: Option<String>,
    /// Модель второго шага по умолчанию для активного провайдера.
    pub update_model_default: Option<&'static str>,
}

fn hint_for(provider: Provider, key: &str) -> String {
    // Адрес локального сервера не секрет — показывается целиком.
    match provider {
        Provider::Local => key.to_string(),
        // ID каталога не секрет, от ключа — последние символы.
        Provider::Yandex => match yandex::YandexKey::parse(key) {
            Ok(k) => format!("{} {}", k.folder, hint(&k.api_key)),
            Err(_) => hint(key),
        },
        _ => hint(key),
    }
}

fn hint(key: &str) -> String {
    let tail: String = key.chars().rev().take(4).collect::<Vec<_>>().into_iter().rev().collect();
    format!("…{tail}")
}

impl AiSettings {
    pub fn view(&self) -> AiSettingsView {
        let key = self.key();
        AiSettingsView {
            provider: self.provider,
            provider_label: self.provider.label(),
            model: self.model.clone(),
            has_key: key.is_some(),
            key_hint: key.map(|k| hint_for(self.provider, k)),
            providers: Provider::ALL
                .into_iter()
                .map(|p| {
                    let key = self.key_for(p);
                    ProviderView {
                        provider: p,
                        label: p.label(),
                        ready: p.ready(),
                        has_key: key.is_some(),
                        key_hint: key.map(|k| hint_for(p, k)),
                    }
                })
                .collect(),
            update_model: self.update_model(),
            update_model_default: default_update_model(self.provider),
        }
    }

    /// Модель второго шага активного провайдера: выбранная, иначе дешёвая по умолчанию;
    /// `None` — та же, что у мастера.
    pub fn update_model(&self) -> Option<String> {
        match self.update_models.get(&self.provider) {
            Some(m) if m.trim().is_empty() => None,
            Some(m) => Some(m.trim().to_string()),
            None => default_update_model(self.provider).map(Into::into),
        }
    }

    /// Выбрать модель второго шага провайдера; пустая строка — та же, что у мастера.
    pub fn set_update_model(&mut self, provider: Provider, model: &str) {
        self.update_models.insert(provider, model.trim().to_string());
    }

    /// Ключ провайдера.
    pub fn key_for(&self, provider: Provider) -> Option<&str> {
        let key = match provider {
            Provider::Gemini => self.gemini_api_key.as_deref(),
            Provider::OpenAi => self.openai_api_key.as_deref(),
            Provider::Anthropic => self.anthropic_api_key.as_deref(),
            Provider::Local => Some(self.local_url.as_deref().unwrap_or(ollama::DEFAULT_URL)),
            Provider::Yandex => self.yandex_key.as_deref(),
        };
        key.filter(|k| !k.is_empty())
    }

    /// Ключ активного провайдера.
    pub fn key(&self) -> Option<&str> {
        self.key_for(self.provider)
    }

    pub fn set_key(&mut self, provider: Provider, key: &str) -> Result<(), String> {
        let key = key.trim();
        let value = (!key.is_empty()).then(|| key.to_string());
        match provider {
            Provider::Gemini => self.gemini_api_key = value,
            Provider::OpenAi => self.openai_api_key = value,
            Provider::Anthropic => self.anthropic_api_key = value,
            Provider::Local => self.local_url = Some(ollama::normalize_url(key)?),
            Provider::Yandex => {
                self.yandex_key = match value {
                    Some(v) => {
                        let k = yandex::YandexKey::parse(&v)?;
                        Some(format!("{} {}", k.folder, k.api_key))
                    }
                    None => None,
                }
            }
        }
        Ok(())
    }
}

/// Хранилище настроек в файле `ai-settings.json`.
pub struct SettingsStore {
    path: Option<PathBuf>,
}

impl SettingsStore {
    pub fn new(path: Option<PathBuf>) -> Self {
        Self { path }
    }

    pub fn load(&self) -> AiSettings {
        self.path
            .as_ref()
            .and_then(|p| fs::read_to_string(p).ok())
            .and_then(|text| serde_json::from_str(&text).ok())
            .unwrap_or_default()
    }

    pub fn save(&self, settings: &AiSettings) -> Result<(), String> {
        let path = self.path.as_ref().ok_or("Папка настроек приложения недоступна")?;
        if let Some(dir) = path.parent() {
            fs::create_dir_all(dir)
                .map_err(|e| format!("Не удалось создать папку настроек: {e}"))?;
        }
        let text = serde_json::to_string_pretty(settings)
            .map_err(|e| format!("Не удалось записать настройки: {e}"))?;
        fs::write(path, text).map_err(|e| format!("Не удалось сохранить настройки: {e}"))
    }
}

/// Список моделей провайдера.
pub async fn list_models(
    client: &reqwest::Client,
    settings: &AiSettings,
    provider: Provider,
) -> Result<Vec<ModelInfo>, String> {
    let key = settings
        .key_for(provider)
        .ok_or_else(|| format!("Сначала введите API-ключ: {}", provider.label()))?;
    match provider {
        Provider::Gemini => gemini::list_models(client, key).await,
        Provider::OpenAi => openai::list_models(client, key).await,
        Provider::Anthropic => anthropic::list_models(client, key).await,
        Provider::Local => ollama::list_models(client, key).await,
        Provider::Yandex => yandex::list_models(client, key).await,
    }
}

/// Ответ мастера на историю диалога.
///
/// `system` — блоки системного текста (у Claude каждый кэшируется своей меткой, остальные
/// провайдеры получают их одним текстом); `cache_upto` — последнее сообщение истории перед
/// текущим ходом: у Claude история до него тоже кэшируется.
pub async fn chat(
    client: &reqwest::Client,
    settings: &AiSettings,
    system_parts: &[String],
    history: &[ChatMessage],
    json_mode: bool,
    cache_upto: Option<usize>,
) -> Result<MasterReply, String> {
    let model = settings.model.clone().ok_or("Выберите модель в меню «Модели ИИ»")?;
    let key = settings.key().ok_or("Введите API-ключ в меню «Модели ИИ»")?;
    let joined = system_parts.join("\n");
    let system = joined.as_str();
    // Обрыв связи («Нет связи с …», таймаут) — один повтор сразу, прежде чем показать
    // ошибку игроку: короткие сбои сети у облачных провайдеров случаются посреди игры.
    let mut attempt = 0;
    let out = loop {
        let result = match settings.provider {
            Provider::Gemini => {
                gemini::generate(client, key, &model, system, history, json_mode).await
            }
            Provider::OpenAi => {
                openai::generate(client, key, &model, system, history, json_mode).await
            }
            Provider::Anthropic => {
                anthropic::generate(client, key, &model, system_parts, history, cache_upto).await
            }
            Provider::Local => {
                ollama::generate(client, key, &model, system, history, json_mode).await
            }
            Provider::Yandex => {
                yandex::generate(client, key, &model, system, history, json_mode).await
            }
        };
        match result {
            Err(e) if attempt == 0 && is_network_error(&e) => attempt += 1,
            other => break other?,
        }
    };
    let prompt_chars =
        system.chars().count() + history.iter().map(|m| m.text.chars().count()).sum::<usize>();
    // Свежая часть: у Claude кэш и запись идут отдельно и уже вычтены из `input_tokens`; у
    // остальных кэш входит в размер запроса.
    let fresh_tokens = out.prompt_tokens.map(|total| {
        total
            .saturating_sub(out.cached_tokens.unwrap_or(0))
            .saturating_sub(out.cache_write_tokens.unwrap_or(0))
    });
    Ok(MasterReply {
        text: out.text,
        provider: settings.provider,
        model,
        actions: Vec::new(),
        rolls: Vec::new(),
        fabricated: Vec::new(),
        raw: Vec::new(),
        prompt_tokens: out.prompt_tokens,
        cached_tokens: out.cached_tokens,
        cache_write_tokens: out.cache_write_tokens,
        prompt_chars,
        pending_update: false,
        written_commands: String::new(),
        no_changes: false,
        output_tokens: out.output_tokens,
        fresh_tokens,
        requests: 1,
        blocks: Vec::new(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn claude_cache_counts_into_request_size() {
        // Claude: input_tokens — только свежая часть, кэш и запись кэша считаются отдельно.
        let claude = serde_json::json!({
            "usage": { "input_tokens": 7_594, "cache_read_input_tokens": 19_772, "cache_creation_input_tokens": 0 }
        });
        assert_eq!(prompt_tokens(&claude), Some(27_366));
        assert_eq!(cached_tokens(&claude), Some(19_772));
        // OpenAI: кэш уже внутри prompt_tokens.
        let openai = serde_json::json!({
            "usage": { "prompt_tokens": 12_076, "prompt_tokens_details": { "cached_tokens": 10_000 } }
        });
        assert_eq!(prompt_tokens(&openai), Some(12_076));
        assert_eq!(cached_tokens(&openai), Some(10_000));
    }

    #[test]
    fn view_hides_key() {
        let mut s = AiSettings::default();
        assert!(!s.view().has_key);
        s.set_key(Provider::Gemini, "  AIzaSecretKey1234 ").unwrap();
        let view = s.view();
        assert!(view.has_key);
        assert_eq!(view.key_hint.as_deref(), Some("…1234"));
        let json = serde_json::to_string(&view).unwrap();
        assert!(!json.contains("Secret"));
        s.set_key(Provider::Gemini, "").unwrap();
        assert!(s.key().is_none());
    }

    #[test]
    fn keys_are_per_provider_and_local_is_a_server_url() {
        let mut s = AiSettings::default();
        s.set_key(Provider::OpenAi, "sk-proj-Secret9876").unwrap();
        assert!(s.key().is_none(), "активен Gemini без ключа");
        s.provider = Provider::OpenAi;
        assert_eq!(s.key(), Some("sk-proj-Secret9876"));
        let view = s.view();
        assert_eq!(view.key_hint.as_deref(), Some("…9876"));
        // Порядок провайдеров: Gemini, OpenAI, Claude, Яндекс, локальная модель.
        assert_eq!(view.providers.len(), 5);
        assert!(view.providers[4].ready);
        assert_eq!(view.providers[4].key_hint.as_deref(), Some(ollama::DEFAULT_URL));
        assert!(view.providers[1].has_key);
        s.set_key(Provider::Anthropic, "sk-ant-Claude1234").unwrap();
        assert_eq!(s.key_for(Provider::Anthropic), Some("sk-ant-Claude1234"));
        assert_eq!(s.view().providers[2].key_hint.as_deref(), Some("…1234"));
        assert!(!serde_json::to_string(&view).unwrap().contains("Secret"));
        s.set_key(Provider::Yandex, "b1gfolder42 AQVNyandexSecret7777").unwrap();
        let view = s.view();
        assert_eq!(view.providers[3].key_hint.as_deref(), Some("b1gfolder42 …7777"));
        assert!(!serde_json::to_string(&view).unwrap().contains("yandexSecret"));
        assert!(s.set_key(Provider::Yandex, "только-ключ").is_err());
        s.set_key(Provider::Local, "192.168.1.25:11434").unwrap();
        assert_eq!(s.key_for(Provider::Local), Some("http://192.168.1.25:11434"));
        assert!(s.set_key(Provider::Local, "http://a b").is_err());
        assert_eq!(serde_json::to_string(&Provider::OpenAi).unwrap(), "\"openai\"");
        // Старые настройки без ключа OpenAI читаются.
        let old: AiSettings =
            serde_json::from_str(r#"{"provider":"gemini","model":null,"gemini_api_key":"k"}"#)
                .unwrap();
        assert!(old.openai_api_key.is_none());
    }

    #[test]
    fn settings_round_trip_through_file() {
        let dir = std::env::temp_dir().join(format!("dnd-ai-test-{}", std::process::id()));
        let store = SettingsStore::new(Some(dir.join("ai-settings.json")));
        let mut s = AiSettings::default();
        s.set_key(Provider::Gemini, "key-1").unwrap();
        s.model = Some("model-a".into());
        store.save(&s).unwrap();
        let loaded = store.load();
        assert_eq!(loaded.gemini_api_key.as_deref(), Some("key-1"));
        assert_eq!(loaded.model.as_deref(), Some("model-a"));
        let _ = fs::remove_dir_all(dir);
        assert!(SettingsStore::new(None).save(&s).is_err());
    }
}
