//! ИИ-мастер: настройки провайдеров, выбор модели и запросы.
//!
//! Горячее переключение: история диалога хранится в нейтральном формате ([`ChatMessage`]),
//! а провайдер и модель читаются из настроек в момент каждого запроса. Поэтому модель
//! можно сменить посреди сцены — следующий ответ даст новая модель с тем же контекстом.

pub mod gemini;
pub mod prompt;

use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

/// Провайдер ИИ.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
#[serde(rename_all = "snake_case")]
pub enum Provider {
    #[default]
    Gemini,
}

impl Provider {
    pub fn label(self) -> &'static str {
        match self {
            Provider::Gemini => "Google Gemini",
        }
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
}

/// Настройки ИИ. Хранятся в папке настроек приложения на ПК.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct AiSettings {
    pub provider: Provider,
    pub model: Option<String>,
    pub gemini_api_key: Option<String>,
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
}

impl AiSettings {
    pub fn view(&self) -> AiSettingsView {
        let key = self.key();
        AiSettingsView {
            provider: self.provider,
            provider_label: self.provider.label(),
            model: self.model.clone(),
            has_key: key.is_some(),
            key_hint: key.map(|k| {
                let tail: String =
                    k.chars().rev().take(4).collect::<Vec<_>>().into_iter().rev().collect();
                format!("…{tail}")
            }),
        }
    }

    /// Ключ активного провайдера.
    pub fn key(&self) -> Option<&str> {
        match self.provider {
            Provider::Gemini => self.gemini_api_key.as_deref().filter(|k| !k.is_empty()),
        }
    }

    pub fn set_key(&mut self, provider: Provider, key: &str) {
        let key = key.trim();
        let value = (!key.is_empty()).then(|| key.to_string());
        match provider {
            Provider::Gemini => self.gemini_api_key = value,
        }
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
    match provider {
        Provider::Gemini => {
            let key = settings
                .gemini_api_key
                .as_deref()
                .filter(|k| !k.is_empty())
                .ok_or("Сначала введите API-ключ Gemini")?;
            gemini::list_models(client, key).await
        }
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
    };
    Ok(MasterReply { text, provider: settings.provider, model })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn view_hides_key() {
        let mut s = AiSettings::default();
        assert!(!s.view().has_key);
        s.set_key(Provider::Gemini, "  AIzaSecretKey1234 ");
        let view = s.view();
        assert!(view.has_key);
        assert_eq!(view.key_hint.as_deref(), Some("…1234"));
        let json = serde_json::to_string(&view).unwrap();
        assert!(!json.contains("Secret"));
        s.set_key(Provider::Gemini, "");
        assert!(s.key().is_none());
    }

    #[test]
    fn settings_round_trip_through_file() {
        let dir = std::env::temp_dir().join(format!("dnd-ai-test-{}", std::process::id()));
        let store = SettingsStore::new(Some(dir.join("ai-settings.json")));
        let mut s = AiSettings::default();
        s.set_key(Provider::Gemini, "key-1");
        s.model = Some("model-a".into());
        store.save(&s).unwrap();
        let loaded = store.load();
        assert_eq!(loaded.gemini_api_key.as_deref(), Some("key-1"));
        assert_eq!(loaded.model.as_deref(), Some("model-a"));
        let _ = fs::remove_dir_all(dir);
        assert!(SettingsStore::new(None).save(&s).is_err());
    }
}
