//! Приложение Tauri: связывает интерфейс с игровым движком.
//!
//! Все броски выполняются здесь, в Rust; интерфейс только отправляет запросы
//! и показывает результаты.

use std::sync::Mutex;

use dnd_engine::{
    resolve_player_d20, roll_d20, D20Roll, DiceExpr, ExprRoll, Modifier, ResourcePool, RestKind,
    RollMode, Xoshiro256,
};
use tauri::State;

/// Состояние текущей сессии.
struct Session {
    rng: Xoshiro256,
    lucky: ResourcePool,
}

impl Session {
    fn new() -> Self {
        Self { rng: Xoshiro256::from_entropy(), lucky: ResourcePool::lucky() }
    }
}

type SessionState = Mutex<Session>;

fn lock<'a>(
    state: &'a State<'_, SessionState>,
) -> Result<std::sync::MutexGuard<'a, Session>, String> {
    state.lock().map_err(|_| "Состояние сессии повреждено, перезапустите приложение".to_string())
}

/// Бросок выражения, например `2d6+3`; `critical` удваивает кубы.
#[tauri::command]
fn roll_expression(
    expression: String,
    critical: bool,
    state: State<'_, SessionState>,
) -> Result<ExprRoll, String> {
    let expr = DiceExpr::parse(&expression).map_err(|e| e.to_string())?;
    let mut session = lock(&state)?;
    Ok(expr.roll(&mut session.rng, critical))
}

/// Бросок d20 виртуальным кубом движка.
#[tauri::command]
fn roll_check(
    mode: RollMode,
    modifiers: Vec<Modifier>,
    crit_threshold: u32,
    state: State<'_, SessionState>,
) -> Result<D20Roll, String> {
    let mut session = lock(&state)?;
    roll_d20(&mut session.rng, mode, modifiers, crit_threshold).map_err(|e| e.to_string())
}

/// Бросок с настоящего куба, заявленный игроком: «16», «12 - везунчик».
#[tauri::command]
fn submit_player_roll(
    input: String,
    mode: RollMode,
    modifiers: Vec<Modifier>,
    crit_threshold: u32,
    state: State<'_, SessionState>,
) -> Result<D20Roll, String> {
    let mut session = lock(&state)?;
    resolve_player_d20(&input, mode, modifiers, crit_threshold, &mut session.lucky)
        .map_err(|e| e.to_string())
}

/// Текущее состояние зарядов «Везунчика».
#[tauri::command]
fn lucky_status(state: State<'_, SessionState>) -> Result<ResourcePool, String> {
    Ok(lock(&state)?.lucky.clone())
}

/// Отдых: восстанавливает ресурсы по их правилам.
#[tauri::command]
fn take_rest(kind: RestKind, state: State<'_, SessionState>) -> Result<ResourcePool, String> {
    let mut session = lock(&state)?;
    session.lucky.apply_rest(kind);
    Ok(session.lucky.clone())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(Mutex::new(Session::new()))
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
