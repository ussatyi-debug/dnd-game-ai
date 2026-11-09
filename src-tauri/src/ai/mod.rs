//! ИИ-мастер: настройки провайдеров, выбор модели и запросы.
//!
//! Горячее переключение: история диалога хранится в нейтральном формате ([`ChatMessage`]),
//! а провайдер и модель читаются из настроек в момент каждого запроса. Поэтому модель
//! можно сменить посреди сцены — следующий ответ даст новая модель с тем же контекстом.

pub mod gemini;
pub mod ollama;
pub mod openai;
pub mod yandex;

use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

/// Провайдер ИИ.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "snake_case")]
pub enum Provider {
    #[default]
    Gemini,
    #[serde(rename = "openai")]
    OpenAi,
    /// Локальная модель через Ollama (на этом ПК или в локальной сети).
    Local,
    /// YandexGPT и другие модели Yandex AI Studio.
    Yandex,
}

impl Provider {
    pub const ALL: [Provider; 4] =
        [Provider::Gemini, Provider::OpenAi, Provider::Yandex, Provider::Local];

    pub fn label(self) -> &'static str {
        match self {
            Provider::Gemini => "Google Gemini",
            Provider::OpenAi => "OpenAI (ChatGPT)",
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
        }
    }

    /// Ключ провайдера.
    pub fn key_for(&self, provider: Provider) -> Option<&str> {
        let key = match provider {
            Provider::Gemini => self.gemini_api_key.as_deref(),
            Provider::OpenAi => self.openai_api_key.as_deref(),
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
        Provider::Local => ollama::list_models(client, key).await,
        Provider::Yandex => yandex::list_models(client, key).await,
    }
}

/// Ответ мастера на историю диалога.
pub async fn chat(
    client: &reqwest::Client,
    settings: &AiSettings,
    system: &str,
    history: &[ChatMessage],
) -> Result<MasterReply, String> {
    let model = settings.model.clone().ok_or("Выберите модель в меню «Модели ИИ»")?;
    let key = settings.key().ok_or("Введите API-ключ в меню «Модели ИИ»")?;
    let text = match settings.provider {
        Provider::Gemini => gemini::generate(client, key, &model, system, history).await?,
        Provider::OpenAi => openai::generate(client, key, &model, system, history).await?,
        Provider::Local => ollama::generate(client, key, &model, system, history).await?,
        Provider::Yandex => yandex::generate(client, key, &model, system, history).await?,
    };
    Ok(MasterReply {
        text,
        provider: settings.provider,
        model,
        actions: Vec::new(),
        rolls: Vec::new(),
        fabricated: Vec::new(),
        raw: Vec::new(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

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
        assert_eq!(view.providers.len(), 4);
        assert!(view.providers[3].ready);
        assert_eq!(view.providers[3].key_hint.as_deref(), Some(ollama::DEFAULT_URL));
        assert!(view.providers[1].has_key);
        assert!(!serde_json::to_string(&view).unwrap().contains("Secret"));
        s.set_key(Provider::Yandex, "b1gfolder42 AQVNyandexSecret7777").unwrap();
        let view = s.view();
        assert_eq!(view.providers[2].key_hint.as_deref(), Some("b1gfolder42 …7777"));
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
