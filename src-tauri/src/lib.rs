//! Приложение Tauri: связывает интерфейс с игровым движком и ИИ-мастером.
//!
//! Логика игры — в `dnd_engine::Session`, ИИ — в модуле [`ai`]; здесь только тонкие
//! команды-обёртки.

mod ai;

use std::sync::{Mutex, MutexGuard};
use std::time::Duration;

use ai::{
    AiSettings, AiSettingsView, ChatMessage, MasterReply, ModelInfo, Provider, SettingsStore,
};
use dnd_engine::{
    CharacterSheet, ExprRoll, LuckyReroll, PartyView, RestKind, RestResult, SaveState, Session,
    TreasuryView,
};
use tauri::{Manager, State};

type SessionState = Mutex<Session>;

struct AiState {
    client: reqwest::Client,
    settings: Mutex<AiSettings>,
    store: SettingsStore,
}

fn lock<'a, T>(mutex: &'a Mutex<T>) -> Result<MutexGuard<'a, T>, String> {
    mutex.lock().map_err(|_| "Состояние приложения повреждено, перезапустите его".to_string())
}

#[tauri::command]
fn roll_expression(
    expression: String,
    critical: bool,
    state: State<'_, SessionState>,
) -> Result<ExprRoll, String> {
    lock(&state)?.roll_expression(&expression, critical).map_err(|e| e.to_string())
}

#[tauri::command]
fn lucky_reroll(state: State<'_, SessionState>) -> Result<LuckyReroll, String> {
    lock(&state)?.lucky_reroll().map_err(|e| e.to_string())
}

#[tauri::command]
fn character_sheet(id: String, state: State<'_, SessionState>) -> Result<CharacterSheet, String> {
    lock(&state)?.sheet(&id).map_err(|e| e.to_string())
}

#[tauri::command]
fn party(state: State<'_, SessionState>) -> Result<PartyView, String> {
    Ok(lock(&state)?.party_view())
}

#[tauri::command]
fn treasury(state: State<'_, SessionState>) -> Result<TreasuryView, String> {
    Ok(lock(&state)?.treasury_view())
}

#[tauri::command]
fn save_state(state: State<'_, SessionState>) -> Result<SaveState, String> {
    Ok(lock(&state)?.save_state())
}

#[tauri::command]
fn treasury_add_manual(
    asset_id: String,
    location_id: String,
    quantity: i64,
    reason: String,
    state: State<'_, SessionState>,
) -> Result<TreasuryView, String> {
    lock(&state)?
        .add_manual_treasury_entry(&asset_id, &location_id, quantity, &reason)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn take_rest(kind: RestKind, state: State<'_, SessionState>) -> Result<RestResult, String> {
    Ok(lock(&state)?.take_rest(kind))
}

#[tauri::command]
fn ai_settings(ai: State<'_, AiState>) -> Result<AiSettingsView, String> {
    Ok(lock(&ai.settings)?.view())
}

#[tauri::command]
fn ai_set_key(
    provider: Provider,
    key: String,
    ai: State<'_, AiState>,
) -> Result<AiSettingsView, String> {
    let mut settings = lock(&ai.settings)?;
    settings.set_key(provider, &key);
    ai.store.save(&settings)?;
    Ok(settings.view())
}

#[tauri::command]
fn ai_select_model(
    provider: Provider,
    model: String,
    ai: State<'_, AiState>,
) -> Result<AiSettingsView, String> {
    let mut settings = lock(&ai.settings)?;
    settings.provider = provider;
    settings.model = Some(model);
    ai.store.save(&settings)?;
    Ok(settings.view())
}

#[tauri::command]
async fn ai_list_models(
    provider: Provider,
    ai: State<'_, AiState>,
) -> Result<Vec<ModelInfo>, String> {
    let settings = lock(&ai.settings)?.clone();
    ai::list_models(&ai.client, &settings, provider).await
}

/// Ответ мастера. Провайдер и модель берутся из настроек в момент вызова — так работает
/// горячее переключение моделей.
#[tauri::command]
async fn ai_chat(
    history: Vec<ChatMessage>,
    ai: State<'_, AiState>,
    session: State<'_, SessionState>,
) -> Result<MasterReply, String> {
    let settings = lock(&ai.settings)?.clone();
    let system = {
        let mut session = lock(&session)?;
        ai::prompt::system_text(&ai::prompt::turn_context(&mut session))
    };
    ai::chat(&ai.client, &settings, &system, &history).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(Mutex::new(Session::default()))
        .setup(|app| {
            let path = app.path().app_config_dir().ok().map(|dir| dir.join("ai-settings.json"));
            let store = SettingsStore::new(path);
            let settings = store.load();
            let client = reqwest::Client::builder()
                .timeout(Duration::from_secs(120))
                .build()
                .map_err(|e| format!("Не удалось создать HTTP-клиент: {e}"))?;
            app.manage(AiState { client, settings: Mutex::new(settings), store });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            roll_expression,
            lucky_reroll,
            character_sheet,
            party,
            treasury,
            save_state,
            treasury_add_manual,
            take_rest,
            ai_settings,
            ai_set_key,
            ai_select_model,
            ai_list_models,
            ai_chat
        ])
        .run(tauri::generate_context!())
        .expect("не удалось запустить приложение");
}
