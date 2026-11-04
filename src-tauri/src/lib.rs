//! Приложение Tauri: связывает интерфейс с игровым движком.
//!
//! Вся логика — в `dnd_engine::Session`; здесь только тонкие команды-обёртки.

use std::sync::{Mutex, MutexGuard};

use dnd_engine::{D20Roll, ExprRoll, Modifier, ResourcePool, RestKind, RollMode, Session};
use tauri::State;

type SessionState = Mutex<Session>;

fn lock<'a>(state: &'a State<'_, SessionState>) -> Result<MutexGuard<'a, Session>, String> {
    state.lock().map_err(|_| "Состояние сессии повреждено, перезапустите приложение".to_string())
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
fn roll_check(
    mode: RollMode,
    modifiers: Vec<Modifier>,
    crit_threshold: u32,
    state: State<'_, SessionState>,
) -> Result<D20Roll, String> {
    lock(&state)?.roll_check(mode, modifiers, crit_threshold).map_err(|e| e.to_string())
}

#[tauri::command]
fn submit_player_roll(
    input: String,
    mode: RollMode,
    modifiers: Vec<Modifier>,
    crit_threshold: u32,
    state: State<'_, SessionState>,
) -> Result<D20Roll, String> {
    lock(&state)?
        .submit_player_roll(&input, mode, modifiers, crit_threshold)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn lucky_status(state: State<'_, SessionState>) -> Result<ResourcePool, String> {
    Ok(lock(&state)?.lucky().clone())
}

#[tauri::command]
fn take_rest(kind: RestKind, state: State<'_, SessionState>) -> Result<ResourcePool, String> {
    Ok(lock(&state)?.take_rest(kind).clone())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(Mutex::new(Session::default()))
        .invoke_handler(tauri::generate_handler![
            roll_expression,
            roll_check,
            submit_player_roll,
            lucky_status,
            take_rest
        ])
        .run(tauri::generate_context!())
        .expect("не удалось запустить приложение");
}
