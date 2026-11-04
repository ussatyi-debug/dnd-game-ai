//! Веб-версия движка.
//!
//! Крейт компилируется в wasm32 и затем переводится в обычный JavaScript (wasm2js), поэтому
//! в браузере работает тот же код на Rust, что и в приложении. Интерфейс — JSON-строки:
//!
//! - запрос: `{"cmd":"roll_expression","expression":"2d6+3","critical":false}`;
//! - ответ: `{"ok": <результат>}` или `{"err": "<текст ошибки>"}`.
//!
//! Имена команд совпадают с командами приложения Tauri, имена полей — в camelCase,
//! как их передаёт интерфейс.

use std::cell::RefCell;

use dnd_engine::{Modifier, RestKind, RollMode, Session, Xoshiro256};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

/// Запрос к движку.
#[derive(Debug, Deserialize)]
#[serde(tag = "cmd", rename_all = "snake_case", rename_all_fields = "camelCase")]
pub enum Request {
    RollExpression {
        expression: String,
        critical: bool,
    },
    RollCheck {
        mode: RollMode,
        modifiers: Vec<Modifier>,
        crit_threshold: u32,
    },
    SubmitPlayerRoll {
        input: String,
        mode: RollMode,
        modifiers: Vec<Modifier>,
        crit_threshold: u32,
    },
    LuckyStatus,
    TakeRest {
        kind: RestKind,
    },
}

/// Обрабатывает JSON-запрос и возвращает JSON-ответ.
pub fn handle(session: &mut Session, request: &str) -> String {
    let result = serde_json::from_str::<Request>(request)
        .map_err(|e| format!("Неверный запрос к движку: {e}"))
        .and_then(|req| dispatch(session, req));
    match result {
        Ok(value) => json!({ "ok": value }),
        Err(message) => json!({ "err": message }),
    }
    .to_string()
}

fn dispatch(session: &mut Session, request: Request) -> Result<Value, String> {
    match request {
        Request::RollExpression { expression, critical } => {
            to_value(session.roll_expression(&expression, critical).map_err(|e| e.to_string())?)
        }
        Request::RollCheck { mode, modifiers, crit_threshold } => to_value(
            session.roll_check(mode, modifiers, crit_threshold).map_err(|e| e.to_string())?,
        ),
        Request::SubmitPlayerRoll { input, mode, modifiers, crit_threshold } => to_value(
            session
                .submit_player_roll(&input, mode, modifiers, crit_threshold)
                .map_err(|e| e.to_string())?,
        ),
        Request::LuckyStatus => to_value(session.lucky()),
        Request::TakeRest { kind } => to_value(session.take_rest(kind)),
    }
}

fn to_value<T: Serialize>(value: T) -> Result<Value, String> {
    serde_json::to_value(value).map_err(|e| format!("Ошибка сериализации ответа: {e}"))
}

thread_local! {
    static SESSION: RefCell<Session> = RefCell::new(Session::new(Xoshiro256::from_seed(0)));
    static OUTPUT: RefCell<Vec<u8>> = const { RefCell::new(Vec::new()) };
}

/// Начинает новую сессию с зерном генератора от браузера (`crypto.getRandomValues`).
#[no_mangle]
pub extern "C" fn engine_init(seed_hi: u32, seed_lo: u32) {
    let seed = (u64::from(seed_hi) << 32) | u64::from(seed_lo);
    SESSION.with(|s| *s.borrow_mut() = Session::new(Xoshiro256::from_seed(seed)));
}

/// Выделяет буфер под запрос. Буфер освобождается вызовом [`engine_free`].
#[no_mangle]
pub extern "C" fn engine_alloc(len: usize) -> *mut u8 {
    let mut buffer = Vec::<u8>::with_capacity(len.max(1));
    let ptr = buffer.as_mut_ptr();
    std::mem::forget(buffer);
    ptr
}

/// Освобождает буфер, выделенный [`engine_alloc`].
///
/// # Safety
/// `ptr` и `len` должны быть ровно теми, что использовались при вызове `engine_alloc`.
#[no_mangle]
pub unsafe extern "C" fn engine_free(ptr: *mut u8, len: usize) {
    if !ptr.is_null() {
        drop(Vec::from_raw_parts(ptr, 0, len.max(1)));
    }
}

/// Выполняет запрос из буфера `ptr..ptr+len` и возвращает длину ответа. Сам ответ
/// читается по адресу [`engine_output_ptr`] и действителен до следующего вызова.
///
/// # Safety
/// `ptr` должен указывать на `len` инициализированных байт.
#[no_mangle]
pub unsafe extern "C" fn engine_call(ptr: *const u8, len: usize) -> usize {
    let bytes = std::slice::from_raw_parts(ptr, len);
    let response = match std::str::from_utf8(bytes) {
        Ok(text) => SESSION.with(|s| handle(&mut s.borrow_mut(), text)),
        Err(_) => json!({ "err": "Запрос к движку не в кодировке UTF-8" }).to_string(),
    };
    OUTPUT.with(|out| {
        let mut out = out.borrow_mut();
        *out = response.into_bytes();
        out.len()
    })
}

/// Адрес последнего ответа.
#[no_mangle]
pub extern "C" fn engine_output_ptr() -> *const u8 {
    OUTPUT.with(|out| out.borrow().as_ptr())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn session() -> Session {
        Session::new(Xoshiro256::from_seed(5))
    }

    fn call(session: &mut Session, request: Value) -> Value {
        serde_json::from_str(&handle(session, &request.to_string())).unwrap()
    }

    #[test]
    fn roll_expression_returns_breakdown() {
        let mut s = session();
        let r = call(
            &mut s,
            json!({ "cmd": "roll_expression", "expression": "2d6+3", "critical": false }),
        );
        let total = r["ok"]["total"].as_i64().unwrap();
        assert!((5..=15).contains(&total));
        assert_eq!(r["ok"]["expression"], "2d6+3");
        assert_eq!(r["ok"]["groups"][0]["values"].as_array().unwrap().len(), 2);
    }

    #[test]
    fn roll_check_uses_camel_case_fields() {
        let mut s = session();
        let r = call(
            &mut s,
            json!({
                "cmd": "roll_check",
                "mode": "advantage",
                "modifiers": [{ "label": "ЛОВ", "value": 2 }],
                "critThreshold": 20
            }),
        );
        assert_eq!(r["ok"]["mode"], "advantage");
        assert_eq!(r["ok"]["dice"].as_array().unwrap().len(), 2);
        assert_eq!(r["ok"]["source"], "engine");
    }

    #[test]
    fn lucky_flow_and_rest() {
        let mut s = session();
        let r = call(
            &mut s,
            json!({
                "cmd": "submit_player_roll",
                "input": "12 - везунчик",
                "mode": "normal",
                "modifiers": [{ "label": "ЛОВ", "value": 2 }],
                "critThreshold": 20
            }),
        );
        assert_eq!(r["ok"]["total"], 14);
        assert_eq!(r["ok"]["lucky_used"], true);

        let status = call(&mut s, json!({ "cmd": "lucky_status" }));
        assert_eq!(status["ok"]["current"], 2);
        assert_eq!(status["ok"]["max"], 3);
        assert_eq!(status["ok"]["recovery"], "long_rest");

        let rested = call(&mut s, json!({ "cmd": "take_rest", "kind": "long" }));
        assert_eq!(rested["ok"]["current"], 3);
    }

    #[test]
    fn engine_errors_are_returned_as_err() {
        let mut s = session();
        let r = call(
            &mut s,
            json!({ "cmd": "roll_expression", "expression": "2d7", "critical": false }),
        );
        assert!(r["err"].as_str().unwrap().contains("d7"));
        assert!(r.get("ok").is_none());
    }

    #[test]
    fn malformed_requests_are_rejected() {
        let mut s = session();
        let r: Value = serde_json::from_str(&handle(&mut s, "не json")).unwrap();
        assert!(r["err"].as_str().unwrap().starts_with("Неверный запрос"));
        let r = call(&mut s, json!({ "cmd": "unknown" }));
        assert!(r["err"].is_string());
    }

    #[test]
    fn ffi_round_trip() {
        engine_init(0, 42);
        let request = json!({ "cmd": "lucky_status" }).to_string();
        let bytes = request.as_bytes();
        let ptr = engine_alloc(bytes.len());
        unsafe {
            std::ptr::copy_nonoverlapping(bytes.as_ptr(), ptr, bytes.len());
            let len = engine_call(ptr, bytes.len());
            engine_free(ptr, bytes.len());
            let out = std::slice::from_raw_parts(engine_output_ptr(), len);
            let value: Value = serde_json::from_slice(out).unwrap();
            assert_eq!(value["ok"]["name"], "Везунчик");
        }
    }
}
