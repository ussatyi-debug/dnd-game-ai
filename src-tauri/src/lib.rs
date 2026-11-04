//! Приложение Tauri: связывает интерфейс с игровым движком.
//!
//! Вся логика — в `dnd_engine::Session`; здесь только тонкие команды-обёртки.

use std::sync::{Mutex, MutexGuard};

use dnd_engine::{CharacterSheet, ExprRoll, LuckyReroll, RestKind, RestResult, Session};
use tauri::State;

type SessionState = Mutex<Session>;

fn lock<'a>(state: &'a State<'_, SessionState>) -> Result<MutexGuard<'a, Session>, String> {
    state.lock().map_err(|_| "Состояние сессии повреждено, перезапустите приложение".to_string())
}

/// Бросок кубов лотка, например `3d6`.
#[tauri::command]
fn roll_expression(
    expression: String,
    critical: bool,
    state: State<'_, SessionState>,
) -> Result<ExprRoll, String> {
    lock(&state)?.roll_expression(&expression, critical).map_err(|e| e.to_string())
}

/// Переброс d20 чертой «Везунчик».
#[tauri::command]
fn lucky_reroll(state: State<'_, SessionState>) -> Result<LuckyReroll, String> {
    lock(&state)?.lucky_reroll().map_err(|e| e.to_string())
}

/// Лист персонажа.
#[tauri::command]
fn character_sheet(state: State<'_, SessionState>) -> Result<CharacterSheet, String> {
    Ok(lock(&state)?.sheet())
}

/// Отдых: восстанавливает ресурсы персонажа.
#[tauri::command]
fn take_rest(kind: RestKind, state: State<'_, SessionState>) -> Result<RestResult, String> {
    Ok(lock(&state)?.take_rest(kind))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(Mutex::new(Session::default()))
        .invoke_handler(tauri::generate_handler![
            roll_expression,
            lucky_reroll,
            character_sheet,
            take_rest
        ])
        .run(tauri::generate_context!())
        .expect("не удалось запустить приложение");
}
