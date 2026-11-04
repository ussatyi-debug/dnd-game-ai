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

use dnd_engine::{RestKind, Session, Xoshiro256};
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
    LuckyReroll,
    CharacterSheet {
        id: String,
    },
    Party,
    Treasury,
    SaveState,
    /// Системный текст мастера на этот ход: кодекс и состояние игры.
    MasterContext,
    TreasuryAddManual {
        asset_id: String,
        location_id: String,
        quantity: i64,
        reason: String,
    },
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
        Request::LuckyReroll => to_value(session.lucky_reroll().map_err(|e| e.to_string())?),
        Request::CharacterSheet { id } => to_value(session.sheet(&id).map_err(|e| e.to_string())?),
        Request::Party => to_value(session.party_view()),
        Request::Treasury => to_value(session.treasury_view()),
        Request::SaveState => to_value(session.save_state()),
        Request::MasterContext => {
            to_value(dnd_master::system_text(&dnd_master::turn_context(session)))
        }
        Request::TreasuryAddManual { asset_id, location_id, quantity, reason } => to_value(
            session
                .add_manual_treasury_entry(&asset_id, &location_id, quantity, &reason)
                .map_err(|e| e.to_string())?,
        ),
        Request::TakeRest { kind } => to_value(session.take_rest(kind)),
    }
}

fn to_value<T: Serialize>(value: T) -> Result<Value, String> {
    serde_json::to_value(value).map_err(|e| format!("Ошибка сериализации ответа: {e}"))
}

thread_local! {
    static SESSION: RefCell<Session> = RefCell::new(Session::demo(Xoshiro256::from_seed(0)));
    static OUTPUT: RefCell<Vec<u8>> = const { RefCell::new(Vec::new()) };
}

/// Начинает новую сессию с зерном генератора от браузера (`crypto.getRandomValues`).
#[no_mangle]
pub extern "C" fn engine_init(seed_hi: u32, seed_lo: u32) {
    let seed = (u64::from(seed_hi) << 32) | u64::from(seed_lo);
    SESSION.with(|s| *s.borrow_mut() = Session::demo(Xoshiro256::from_seed(seed)));
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
        Session::demo(Xoshiro256::from_seed(5))
    }

    fn call(session: &mut Session, request: Value) -> Value {
        serde_json::from_str(&handle(session, &request.to_string())).unwrap()
    }

    #[test]
    fn roll_expression_returns_breakdown() {
        let mut s = session();
        let r = call(
            &mut s,
            json!({ "cmd": "roll_expression", "expression": "3d6", "critical": false }),
        );
        let total = r["ok"]["total"].as_i64().unwrap();
        assert!((3..=18).contains(&total));
        assert_eq!(r["ok"]["expression"], "3d6");
        assert_eq!(r["ok"]["groups"][0]["values"].as_array().unwrap().len(), 3);
    }

    #[test]
    fn character_sheet_has_lucky_and_derived_values() {
        let mut s = session();
        let r = call(&mut s, json!({ "cmd": "character_sheet", "id": "pc.nikis" }));
        let sheet = &r["ok"];
        assert_eq!(sheet["name"], "Сэр Никис Стрэндж");
        assert_eq!(sheet["level"], 10);
        assert_eq!(sheet["proficiency_bonus"], 4);
        assert_eq!(sheet["abilities"][3]["label"], "ИНТ");
        assert_eq!(sheet["abilities"][3]["modifier"], 4);
        assert_eq!(sheet["resources"][0]["id"], "feat.lucky");
        assert_eq!(sheet["resources"][0]["current"], 3);
    }

    #[test]
    fn lucky_reroll_and_rest() {
        let mut s = session();
        let r = call(&mut s, json!({ "cmd": "lucky_reroll" }));
        let value = r["ok"]["value"].as_u64().unwrap();
        assert!((1..=20).contains(&value));
        assert_eq!(r["ok"]["lucky"]["current"], 2);

        let rested = call(&mut s, json!({ "cmd": "take_rest", "kind": "long" }));
        let nikis = &rested["ok"]["characters"][0];
        assert_eq!(nikis["id"], "pc.nikis");
        assert!(nikis["restored"].as_array().unwrap().iter().any(|v| v == "Везунчик"));
        let sheet = call(&mut s, json!({ "cmd": "character_sheet", "id": "pc.nikis" }));
        assert_eq!(sheet["ok"]["resources"][0]["current"], 3);
    }

    #[test]
    fn lucky_without_charges_is_an_error() {
        let mut s = session();
        for _ in 0..3 {
            assert!(call(&mut s, json!({ "cmd": "lucky_reroll" }))["ok"].is_object());
        }
        let r = call(&mut s, json!({ "cmd": "lucky_reroll" }));
        assert!(r["err"].as_str().unwrap().contains("Везунчик"));
    }

    #[test]
    fn party_treasury_and_save() {
        let mut s = session();
        let party = call(&mut s, json!({ "cmd": "party" }));
        assert_eq!(party["ok"]["members"].as_array().unwrap().len(), 6);
        assert_eq!(party["ok"]["scene"]["day"], 82);
        let treasury = call(&mut s, json!({ "cmd": "treasury" }));
        assert_eq!(treasury["ok"]["total"], party["ok"]["treasury_total"]);
        assert!(treasury["ok"]["entries"].as_array().unwrap().len() > 20);
        let save = call(&mut s, json!({ "cmd": "save_state" }));
        assert_eq!(save["ok"]["format_version"], 1);
        assert_eq!(save["ok"]["party"][1]["id"], "npc.corvus");
        let added = call(
            &mut s,
            json!({
                "cmd": "treasury_add_manual",
                "assetId": "gp",
                "locationId": "purse",
                "quantity": -5,
                "reason": "Подаяние"
            }),
        );
        assert_eq!(added["ok"]["entries"][0]["source"], "manual");
        let missing = call(&mut s, json!({ "cmd": "character_sheet", "id": "x" }));
        assert!(missing["err"].is_string());
    }

    #[test]
    fn master_context_is_text_with_codex_and_state() {
        let mut s = session();
        let r = call(&mut s, json!({ "cmd": "master_context" }));
        let text = r["ok"].as_str().unwrap();
        assert!(text.starts_with("Ты — Мастер"));
        assert!(text.contains("Сэр Никис Стрэндж"));
        assert!(text.contains("кубы_мастера"));
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
        let request = json!({ "cmd": "character_sheet", "id": "pc.nikis" }).to_string();
        let bytes = request.as_bytes();
        let ptr = engine_alloc(bytes.len());
        unsafe {
            std::ptr::copy_nonoverlapping(bytes.as_ptr(), ptr, bytes.len());
            let len = engine_call(ptr, bytes.len());
            engine_free(ptr, bytes.len());
            let out = std::slice::from_raw_parts(engine_output_ptr(), len);
            let value: Value = serde_json::from_slice(out).unwrap();
            assert_eq!(value["ok"]["resources"][0]["name"], "Везунчик");
        }
    }
}
