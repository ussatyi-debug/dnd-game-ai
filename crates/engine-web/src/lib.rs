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

use dnd_engine::{
    validate_hero, Campaign, CardDraft, CardFact, CastMethod, CastRequest, HeroSpec, KbCard,
    NewNote, NoteEdit, NoteKind, NoteLayer, RestKind, SaveData, Scene, Session, SheetEdit, SlotRef,
    Xoshiro256,
};
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
    /// Запрос мастеру на этот ход: системный текст сцены и последняя реплика игрока.
    /// `query` — заявка игрока, `kb_extra` — подходящие к ней карточки базы знаний.
    MasterContext {
        #[serde(default)]
        query: String,
        #[serde(default)]
        kb_extra: String,
        #[serde(default)]
        two_step: bool,
    },
    /// Двухшаговый ход: рассказ для игрока и команды, которые мастер написал в нём.
    MasterNarration {
        text: String,
    },
    /// Двухшаговый ход, второй шаг: запрос модели «рассказ → команды движка».
    MasterUpdateRequest {
        player: String,
        narration: String,
        #[serde(default)]
        written: String,
    },
    /// Двухшаговый ход: выполняет команды из ответа второго шага.
    MasterUpdateApply {
        text: String,
        /// Повтор после отказов: дописывается к ходу.
        #[serde(default)]
        repair: bool,
    },
    TreasuryAddManual {
        asset_id: String,
        location_id: String,
        quantity: i64,
        reason: String,
    },
    TakeRest {
        kind: RestKind,
    },
    Spellbook {
        id: String,
    },
    PreparationOptions {
        id: String,
        caster_id: String,
    },
    PrepareSpells {
        id: String,
        caster_id: String,
        spells: Vec<String>,
    },
    CastSpell {
        id: String,
        spell_id: String,
        method: Option<CastMethod>,
        slot_level: Option<u8>,
    },
    ChangeSlot {
        id: String,
        slot: SlotRef,
        spend: bool,
    },
    RestoreSlot {
        id: String,
        item_id: String,
        slot: SlotRef,
    },
    EngineLog,
    /// Полный лист персонажа: спасброски, навыки, атаки, умения.
    CharacterDetails {
        id: String,
    },
    /// Инвентарь по местам хранения.
    Inventory {
        id: String,
    },
    /// Записи мастера в базу знаний.
    MasterNotes,
    /// Последний ход мастера, который можно отменить.
    MasterUndoInfo,
    UndoMasterTurn,
    /// Указатель карточек базы знаний (передаётся при запуске).
    SetKbCards {
        cards: Vec<KbCard>,
    },
    /// Статусы карточек, изменённые по ходу игры.
    KbOverrides,
    /// Запись игрока в базу знаний.
    AddNote {
        layer: NoteLayer,
        title: String,
        text: String,
        card: Option<String>,
        #[serde(default)]
        kind: Option<NoteKind>,
        #[serde(default)]
        due_day: Option<u32>,
    },
    UpdateNote {
        id: u64,
        title: Option<String>,
        text: Option<String>,
        card: Option<String>,
        layer: Option<NoteLayer>,
        #[serde(default)]
        kind: Option<NoteKind>,
        #[serde(default)]
        due_day: Option<u32>,
        #[serde(default)]
        done: Option<bool>,
    },
    /// Правка листа игроком.
    EditSheet {
        id: String,
        edit: SheetEdit,
    },
    /// Вернуть поле листа как в приложении.
    RevertSheetEdit {
        id: String,
        key: String,
    },
    /// Предложения мастера изменить лист.
    SheetProposals,
    ResolveProposal {
        id: u64,
        accept: bool,
    },
    /// Карточки базы, созданные по ходу игры.
    CustomCards,
    CreateCard {
        card: CardInput,
    },
    UpdateCard {
        id: String,
        card: CardInput,
    },
    DeleteCard {
        id: String,
    },
    DeleteNote {
        id: u64,
    },
    /// Загрузка сохранения (часть `engine` файла).
    LoadState {
        save: Value,
    },
    /// Проверка листа героя из мастера создания: список нарушений (пусто — лист в порядке).
    ValidateHero {
        spec: Value,
    },
    /// Новая своя кампания вместо текущей игры.
    StartCampaign {
        campaign: Value,
        scene: Value,
        gold: u32,
    },
    /// Кампания «Дом Стрэндж» с начала.
    RestartDemo,
    /// Выполняет команды движка из ответа мастера и возвращает текст без них.
    MasterApply {
        text: String,
        /// Значения кубов, брошенных движком за мастера в этом ходу.
        #[serde(default)]
        rolled: Vec<u32>,
        /// Заявка игрока: числа из неё — его собственные броски.
        #[serde(default)]
        player: String,
    },
    /// Выполняет запросы бросков мастера; `null` — запросов в ответе нет.
    MasterRolls {
        text: String,
    },
    /// Исправленные мастером команды после отказов движка — в тот же ход.
    MasterRepair {
        text: String,
    },
}

/// Карточка из формы интерфейса.
#[derive(Debug, Deserialize, Default)]
#[serde(default)]
pub struct CardInput {
    pub layer: Option<String>,
    pub section: Option<String>,
    pub title: Option<String>,
    pub subtitle: Option<String>,
    pub summary: Option<String>,
    pub facts: Option<Vec<CardFact>>,
    pub status: Option<String>,
    pub text: Option<String>,
    pub parent: Option<String>,
    pub goal: Option<dnd_engine::GoalEdit>,
}

impl From<CardInput> for CardDraft {
    fn from(c: CardInput) -> Self {
        CardDraft {
            layer: c.layer,
            section: c.section,
            title: c.title,
            subtitle: c.subtitle,
            summary: c.summary,
            facts: c.facts,
            status: c.status,
            text: c.text,
            parent: c.parent,
            goal: c.goal,
        }
    }
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
        Request::MasterContext { query, kb_extra, two_step } => {
            to_value(dnd_master::master_request(session, &query, &kb_extra, two_step))
        }
        Request::MasterNarration { text } => {
            let (text, written) = dnd_master::narration_parts(&text);
            Ok(json!({ "text": text, "written": written }))
        }
        Request::MasterUpdateRequest { player, narration, written } => {
            to_value(dnd_master::update_request(session, &player, &narration, &written))
        }
        Request::MasterUpdateApply { text, repair } => {
            let commands = dnd_master::update_commands(&text);
            if repair {
                to_value(dnd_master::apply_repair(session, &commands))
            } else {
                to_value(dnd_master::apply_directives(session, &commands))
            }
        }
        Request::TreasuryAddManual { asset_id, location_id, quantity, reason } => to_value(
            session
                .add_manual_treasury_entry(&asset_id, &location_id, quantity, &reason)
                .map_err(|e| e.to_string())?,
        ),
        Request::TakeRest { kind } => to_value(session.take_rest(kind)),
        Request::Spellbook { id } => to_value(session.spellbook(&id).map_err(|e| e.to_string())?),
        Request::PreparationOptions { id, caster_id } => {
            to_value(session.preparation_options(&id, &caster_id).map_err(|e| e.to_string())?)
        }
        Request::PrepareSpells { id, caster_id, spells } => {
            to_value(session.prepare_spells(&id, &caster_id, &spells).map_err(|e| e.to_string())?)
        }
        Request::CastSpell { id, spell_id, method, slot_level } => {
            let request = CastRequest { spell_id, method, slot_level };
            to_value(session.cast_spell(&id, &request).map_err(|e| e.to_string())?)
        }
        Request::ChangeSlot { id, slot, spend } => {
            to_value(session.change_slot(&id, slot, spend).map_err(|e| e.to_string())?)
        }
        Request::RestoreSlot { id, item_id, slot } => {
            to_value(session.restore_slot_with(&id, &item_id, slot).map_err(|e| e.to_string())?)
        }
        Request::EngineLog => to_value(session.engine_log()),
        Request::CharacterDetails { id } => {
            to_value(session.details(&id).map_err(|e| e.to_string())?)
        }
        Request::Inventory { id } => to_value(session.inventory(&id).map_err(|e| e.to_string())?),
        Request::MasterNotes => to_value(session.notes()),
        Request::MasterUndoInfo => to_value(session.master_undo_info()),
        Request::SetKbCards { cards } => {
            session.set_kb_cards(cards);
            to_value(true)
        }
        Request::KbOverrides => to_value(session.kb_overrides()),
        Request::AddNote { layer, title, text, card, kind, due_day } => to_value(
            session
                .create_note(NewNote {
                    card,
                    by_player: true,
                    kind: kind.unwrap_or_default(),
                    due_day,
                    ..NewNote::new(layer, &title, &text)
                })
                .map_err(|e| e.to_string())?,
        ),
        Request::CustomCards => to_value(session.custom_cards()),
        Request::EditSheet { id, edit } => {
            session.edit_sheet(&id, edit).map_err(|e| e.to_string())?;
            to_value(true)
        }
        Request::RevertSheetEdit { id, key } => {
            session.revert_sheet_edit(&id, &key).map_err(|e| e.to_string())?;
            to_value(true)
        }
        Request::SheetProposals => to_value(session.sheet_proposals()),
        Request::ResolveProposal { id, accept } => {
            session.resolve_proposal(id, accept).map_err(|e| e.to_string())?;
            to_value(true)
        }
        Request::CreateCard { card } => {
            to_value(session.create_card(card.into(), true).map_err(|e| e.to_string())?)
        }
        Request::UpdateCard { id, card } => {
            session.update_card(&id, card.into()).map_err(|e| e.to_string())?;
            to_value(true)
        }
        Request::DeleteCard { id } => {
            session.delete_card(&id).map_err(|e| e.to_string())?;
            to_value(true)
        }
        Request::UpdateNote { id, title, text, card, layer, kind, due_day, done } => to_value(
            session
                .update_note(
                    id,
                    NoteEdit { title, text, card, layer, kind, due_day: due_day.map(Some), done },
                )
                .map_err(|e| e.to_string())?,
        ),
        Request::DeleteNote { id } => {
            session.delete_note(id).map_err(|e| e.to_string())?;
            to_value(true)
        }
        Request::LoadState { save } => {
            let data: SaveData = serde_json::from_value(save)
                .map_err(|e| format!("Сохранение не загружено: файл повреждён ({e})"))?;
            to_value(session.load(data).map_err(|e| e.to_string())?)
        }
        Request::ValidateHero { spec } => {
            let spec: HeroSpec =
                serde_json::from_value(spec).map_err(|e| format!("Лист героя не прочитан: {e}"))?;
            to_value(validate_hero(&spec))
        }
        Request::StartCampaign { campaign, scene, gold } => {
            let campaign: Campaign = serde_json::from_value(campaign)
                .map_err(|e| format!("Кампания не прочитана: {e}"))?;
            let scene: Scene =
                serde_json::from_value(scene).map_err(|e| format!("Сцена не прочитана: {e}"))?;
            session.start_campaign(campaign, scene, gold).map_err(|e| e.to_string())?;
            to_value(session.party_view())
        }
        Request::RestartDemo => {
            session.restart_demo();
            to_value(session.party_view())
        }
        Request::UndoMasterTurn => to_value(session.undo_master_turn().map_err(|e| e.to_string())?),
        Request::MasterApply { text, rolled, player } => {
            let mut turn = dnd_master::apply_directives(session, &text);
            turn.fabricated = dnd_master::fabricated_rolls(&turn.text, &rolled, &player);
            to_value(turn)
        }
        Request::MasterRolls { text } => to_value(dnd_master::run_rolls(session, &text)),
        Request::MasterRepair { text } => to_value(dnd_master::apply_repair(session, &text)),
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
        assert_eq!(sheet["level"], 11);
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
    fn spellbook_cast_and_slots() {
        let mut s = session();
        let book = call(&mut s, json!({ "cmd": "spellbook", "id": "pc.nikis" }));
        assert_eq!(book["ok"]["slots"][0]["pact"], true);
        assert_eq!(book["ok"]["casters"][0]["save_dc"], 17);

        let cast = call(
            &mut s,
            json!({ "cmd": "cast_spell", "id": "npc.valeria", "spellId": "bless", "slotLevel": 2 }),
        );
        assert_eq!(cast["ok"]["cast_level"], 2);
        assert_eq!(cast["ok"]["method"], "slot");
        let refused = call(
            &mut s,
            json!({ "cmd": "cast_spell", "id": "pc.nikis", "spellId": "cone-of-cold", "method": null }),
        );
        assert!(refused["err"].as_str().unwrap().contains("Конус холода"));

        let changed = call(
            &mut s,
            json!({ "cmd": "change_slot", "id": "pc.nikis", "slot": "pact", "spend": true }),
        );
        assert_eq!(changed["ok"]["slots"][0]["pool"]["current"], 1);
        let changed = call(
            &mut s,
            json!({ "cmd": "change_slot", "id": "npc.valeria", "slot": { "level": 3 }, "spend": true }),
        );
        assert!(changed["ok"]["slots"].is_array());
        let restored = call(
            &mut s,
            json!({ "cmd": "restore_slot", "id": "pc.nikis", "itemId": "item.pact_rod.slot", "slot": "pact" }),
        );
        assert_eq!(restored["ok"]["slot"]["current"], 2);

        let options = call(
            &mut s,
            json!({ "cmd": "preparation_options", "id": "npc.valeria", "casterId": "cleric" }),
        );
        assert!(options["ok"].as_array().unwrap().len() > 40);
        let prepared = call(
            &mut s,
            json!({ "cmd": "prepare_spells", "id": "npc.valeria", "casterId": "cleric", "spells": ["bless"] }),
        );
        assert!(prepared["err"].as_str().unwrap().contains("длительного отдыха"));

        let log = call(&mut s, json!({ "cmd": "engine_log" }));
        assert!(log["ok"].as_array().unwrap().len() >= 4);

        let applied = call(
            &mut s,
            json!({ "cmd": "master_apply", "text": "Готово.\n```engine\n{\"cmd\":\"cast\",\"character\":\"pc.nikis\",\"spell\":\"eldritch-blast\"}\n```" }),
        );
        assert_eq!(applied["ok"]["text"], "Готово.");
        assert_eq!(applied["ok"]["actions"][0]["ok"], true);
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
        assert_eq!(save["ok"]["format_version"], 9);
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
    fn master_context_is_scene_system_and_turn() {
        let mut s = session();
        let r = call(&mut s, json!({ "cmd": "master_context", "query": "Иду в порт" }));
        let system = r["ok"]["system"].as_str().unwrap();
        assert!(system.starts_with("Ты — Мастер"));
        assert!(system.contains("Сэр Никис Стрэндж"));
        assert!(system.contains("\"cmd\":\"roll\""));
        let turn = r["ok"]["turn"].as_str().unwrap();
        assert!(turn.contains("[ИЗМЕНЕНИЯ С НАЧАЛА СЦЕНЫ]"));
        assert!(turn.ends_with("Иду в порт"));
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

    #[test]
    fn save_round_trip_through_json() {
        let mut s = session();
        call(
            &mut s,
            json!({ "cmd": "add_note", "layer": "player", "title": "Пароль", "text": "Серый рассвет", "card": null }),
        );
        call(&mut s, json!({ "cmd": "lucky_reroll" }));
        let save = call(&mut s, json!({ "cmd": "save_state" }))["ok"].clone();
        let mut other = session();
        let report = call(&mut other, json!({ "cmd": "load_state", "save": save }));
        assert!(report["ok"]["supplemented"].as_array().unwrap().is_empty(), "{report}");
        let notes = call(&mut other, json!({ "cmd": "master_notes" }));
        assert_eq!(notes["ok"][0]["by_player"], true);
        let sheet = call(&mut other, json!({ "cmd": "character_sheet", "id": "pc.nikis" }));
        let lucky = sheet["ok"]["resources"]
            .as_array()
            .unwrap()
            .iter()
            .find(|r| r["id"] == "feat.lucky")
            .unwrap()
            .clone();
        assert_eq!(lucky["current"], 2);
        let bad = call(&mut other, json!({ "cmd": "load_state", "save": { "format_version": 4 } }));
        assert!(bad["err"].as_str().unwrap().contains("повреждён"));
    }
}
