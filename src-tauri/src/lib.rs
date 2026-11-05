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
    CardDraft, CastMethod, CastOutcome, CastRequest, CharacterSheet, CustomCard, ExprRoll,
    InventoryView, KbCard, KbOverride, LoadReport, LuckyReroll, MasterNote, NewNote, NoteEdit,
    NoteKind, NoteLayer, PartyView, RestKind, RestResult, SaveData, SaveState, Session,
    SheetDetails, SheetEdit, SheetProposal, SlotRef, SlotRestoreOutcome, SpellEntry, SpellbookView,
    TreasuryView, UndoInfo,
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
fn spellbook(id: String, state: State<'_, SessionState>) -> Result<SpellbookView, String> {
    lock(&state)?.spellbook(&id).map_err(|e| e.to_string())
}

#[tauri::command]
fn preparation_options(
    id: String,
    caster_id: String,
    state: State<'_, SessionState>,
) -> Result<Vec<SpellEntry>, String> {
    lock(&state)?.preparation_options(&id, &caster_id).map_err(|e| e.to_string())
}

#[tauri::command]
fn prepare_spells(
    id: String,
    caster_id: String,
    spells: Vec<String>,
    state: State<'_, SessionState>,
) -> Result<SpellbookView, String> {
    lock(&state)?.prepare_spells(&id, &caster_id, &spells).map_err(|e| e.to_string())
}

#[tauri::command]
fn cast_spell(
    id: String,
    spell_id: String,
    method: Option<CastMethod>,
    slot_level: Option<u8>,
    state: State<'_, SessionState>,
) -> Result<CastOutcome, String> {
    let request = CastRequest { spell_id, method, slot_level };
    lock(&state)?.cast_spell(&id, &request).map_err(|e| e.to_string())
}

#[tauri::command]
fn change_slot(
    id: String,
    slot: SlotRef,
    spend: bool,
    state: State<'_, SessionState>,
) -> Result<SpellbookView, String> {
    lock(&state)?.change_slot(&id, slot, spend).map_err(|e| e.to_string())
}

#[tauri::command]
fn restore_slot(
    id: String,
    item_id: String,
    slot: SlotRef,
    state: State<'_, SessionState>,
) -> Result<SlotRestoreOutcome, String> {
    lock(&state)?.restore_slot_with(&id, &item_id, slot).map_err(|e| e.to_string())
}

#[tauri::command]
fn engine_log(state: State<'_, SessionState>) -> Result<Vec<String>, String> {
    Ok(lock(&state)?.engine_log().to_vec())
}

#[tauri::command]
fn character_details(id: String, state: State<'_, SessionState>) -> Result<SheetDetails, String> {
    lock(&state)?.details(&id).map_err(|e| e.to_string())
}

#[tauri::command]
fn inventory(id: String, state: State<'_, SessionState>) -> Result<InventoryView, String> {
    lock(&state)?.inventory(&id).map_err(|e| e.to_string())
}

#[tauri::command]
fn master_notes(state: State<'_, SessionState>) -> Result<Vec<MasterNote>, String> {
    Ok(lock(&state)?.notes().to_vec())
}

#[tauri::command]
fn master_undo_info(state: State<'_, SessionState>) -> Result<Option<UndoInfo>, String> {
    Ok(lock(&state)?.master_undo_info())
}

#[tauri::command]
fn set_kb_cards(cards: Vec<KbCard>, state: State<'_, SessionState>) -> Result<bool, String> {
    lock(&state)?.set_kb_cards(cards);
    Ok(true)
}

#[tauri::command]
fn kb_overrides(state: State<'_, SessionState>) -> Result<Vec<KbOverride>, String> {
    Ok(lock(&state)?.kb_overrides().to_vec())
}

#[tauri::command]
fn add_note(
    layer: NoteLayer,
    title: String,
    text: String,
    card: Option<String>,
    kind: Option<NoteKind>,
    due_day: Option<u32>,
    state: State<'_, SessionState>,
) -> Result<u64, String> {
    lock(&state)?
        .create_note(NewNote {
            card,
            by_player: true,
            kind: kind.unwrap_or_default(),
            due_day,
            ..NewNote::new(layer, &title, &text)
        })
        .map_err(|e| e.to_string())
}

// Поля команды приходят из интерфейса отдельными аргументами.
#[allow(clippy::too_many_arguments)]
#[tauri::command]
fn update_note(
    id: u64,
    title: Option<String>,
    text: Option<String>,
    card: Option<String>,
    layer: Option<NoteLayer>,
    kind: Option<NoteKind>,
    due_day: Option<u32>,
    done: Option<bool>,
    state: State<'_, SessionState>,
) -> Result<MasterNote, String> {
    let edit = NoteEdit { title, text, card, layer, kind, due_day: due_day.map(Some), done };
    lock(&state)?.update_note(id, edit).map_err(|e| e.to_string())
}

#[tauri::command]
fn edit_sheet(id: String, edit: SheetEdit, state: State<'_, SessionState>) -> Result<bool, String> {
    lock(&state)?.edit_sheet(&id, edit).map(|()| true).map_err(|e| e.to_string())
}

#[tauri::command]
fn revert_sheet_edit(
    id: String,
    key: String,
    state: State<'_, SessionState>,
) -> Result<bool, String> {
    lock(&state)?.revert_sheet_edit(&id, &key).map(|()| true).map_err(|e| e.to_string())
}

#[tauri::command]
fn sheet_proposals(state: State<'_, SessionState>) -> Result<Vec<SheetProposal>, String> {
    Ok(lock(&state)?.sheet_proposals().to_vec())
}

#[tauri::command]
fn resolve_proposal(id: u64, accept: bool, state: State<'_, SessionState>) -> Result<bool, String> {
    lock(&state)?.resolve_proposal(id, accept).map(|()| true).map_err(|e| e.to_string())
}

#[tauri::command]
fn custom_cards(state: State<'_, SessionState>) -> Result<Vec<CustomCard>, String> {
    Ok(lock(&state)?.custom_cards().to_vec())
}

#[tauri::command]
fn create_card(card: CardDraft, state: State<'_, SessionState>) -> Result<String, String> {
    lock(&state)?.create_card(card, true).map_err(|e| e.to_string())
}

#[tauri::command]
fn update_card(
    id: String,
    card: CardDraft,
    state: State<'_, SessionState>,
) -> Result<bool, String> {
    lock(&state)?.update_card(&id, card).map(|()| true).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_card(id: String, state: State<'_, SessionState>) -> Result<bool, String> {
    lock(&state)?.delete_card(&id).map(|()| true).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_note(id: u64, state: State<'_, SessionState>) -> Result<bool, String> {
    lock(&state)?.delete_note(id).map(|()| true).map_err(|e| e.to_string())
}

/// Загрузка сохранения: часть `engine` файла. При ошибке игра не меняется.
#[tauri::command]
fn load_state(
    save: serde_json::Value,
    state: State<'_, SessionState>,
) -> Result<LoadReport, String> {
    let data: SaveData = serde_json::from_value(save)
        .map_err(|e| format!("Сохранение не загружено: файл повреждён ({e})"))?;
    lock(&state)?.load(data).map_err(|e| e.to_string())
}

/// Автосохранение: файл `auto-N.json` и сведения о нём `auto-N.meta.json`
/// в папке данных приложения.
#[derive(serde::Serialize, serde::Deserialize)]
struct AutosaveMeta {
    slot: u8,
    saved_at: String,
    day: Option<u32>,
    location: String,
}

const AUTOSAVE_SLOTS: u8 = 3;

fn autosave_dir(app: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Нет папки данных приложения: {e}"))?
        .join("autosaves");
    std::fs::create_dir_all(&dir).map_err(|e| format!("Не создать папку автосохранений: {e}"))?;
    Ok(dir)
}

fn check_slot(slot: u8) -> Result<(), String> {
    if slot < AUTOSAVE_SLOTS {
        Ok(())
    } else {
        Err(format!("Нет ячейки автосохранения {slot}"))
    }
}

#[tauri::command]
fn autosave_list(app: tauri::AppHandle) -> Result<Vec<AutosaveMeta>, String> {
    let dir = autosave_dir(&app)?;
    Ok((0..AUTOSAVE_SLOTS)
        .filter_map(|slot| {
            let text = std::fs::read_to_string(dir.join(format!("auto-{slot}.meta.json"))).ok()?;
            let meta: AutosaveMeta = serde_json::from_str(&text).ok()?;
            dir.join(format!("auto-{slot}.json")).exists().then_some(meta)
        })
        .collect())
}

#[tauri::command]
fn autosave_write(
    app: tauri::AppHandle,
    slot: u8,
    json: String,
    saved_at: String,
    day: Option<u32>,
    location: String,
) -> Result<bool, String> {
    check_slot(slot)?;
    let dir = autosave_dir(&app)?;
    let tmp = dir.join(format!("auto-{slot}.json.tmp"));
    std::fs::write(&tmp, json).map_err(|e| format!("Автосохранение не записано: {e}"))?;
    std::fs::rename(&tmp, dir.join(format!("auto-{slot}.json")))
        .map_err(|e| format!("Автосохранение не записано: {e}"))?;
    let meta = AutosaveMeta { slot, saved_at, day, location };
    let text = serde_json::to_string(&meta).map_err(|e| e.to_string())?;
    std::fs::write(dir.join(format!("auto-{slot}.meta.json")), text)
        .map_err(|e| format!("Автосохранение не записано: {e}"))?;
    Ok(true)
}

#[tauri::command]
fn autosave_read(app: tauri::AppHandle, slot: u8) -> Result<String, String> {
    check_slot(slot)?;
    std::fs::read_to_string(autosave_dir(&app)?.join(format!("auto-{slot}.json")))
        .map_err(|e| format!("Автосохранение не прочитано: {e}"))
}

/// Ссылка открывается в системном браузере (окно приложения внешние ссылки не открывает).
#[tauri::command]
fn open_url(app: tauri::AppHandle, url: String) -> Result<bool, String> {
    use tauri_plugin_opener::OpenerExt;
    if !(url.starts_with("https://") || url.starts_with("http://")) {
        return Err("Открываются только веб-ссылки".into());
    }
    app.opener().open_url(url, None::<&str>).map(|()| true).map_err(|e| e.to_string())
}

#[tauri::command]
fn undo_master_turn(state: State<'_, SessionState>) -> Result<Vec<String>, String> {
    lock(&state)?.undo_master_turn().map_err(|e| e.to_string())
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
    settings.set_key(provider, &key)?;
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
    kb_extra: Option<String>,
    ai: State<'_, AiState>,
    session: State<'_, SessionState>,
) -> Result<MasterReply, String> {
    let settings = lock(&ai.settings)?.clone();
    let system = {
        let mut session = lock(&session)?;
        let query = history
            .iter()
            .rev()
            .find(|m| m.role == ai::Role::Player)
            .map_or("", |m| m.text.as_str());
        let kb_extra = kb_extra.as_deref().unwrap_or("");
        dnd_master::system_text(&dnd_master::turn_context(&mut session, query, kb_extra))
    };
    let player_text = history
        .iter()
        .rev()
        .find(|m| m.role == ai::Role::Player)
        .map(|m| m.text.clone())
        .unwrap_or_default();
    let mut history = history;
    let mut rolls = Vec::new();
    let mut round = 0;
    let mut reply = loop {
        let reply = ai::chat(&ai.client, &settings, &system, &history).await?;
        // Запросы бросков: движок бросает, мастер получает результаты и продолжает ход.
        if round < dnd_master::MAX_ROLL_ROUNDS {
            let rolled = dnd_master::run_rolls(&mut *lock(&session)?, &reply.text);
            if let Some(r) = rolled {
                round += 1;
                history.push(ai::ChatMessage { role: ai::Role::Master, text: reply.text });
                history.push(ai::ChatMessage { role: ai::Role::Player, text: r.feedback });
                rolls.extend(r.rolls);
                continue;
            }
        }
        break reply;
    };
    let turn = dnd_master::apply_directives(&mut *lock(&session)?, &reply.text);
    reply.fabricated =
        dnd_master::fabricated_rolls(&turn.text, &dnd_master::rolled_faces(&rolls), &player_text);
    reply.text = turn.text;
    reply.actions = turn.actions;
    reply.rolls = rolls;
    Ok(reply)
}

/// «Выход» на главном экране.
#[tauri::command]
fn exit_app(app: tauri::AppHandle) {
    app.exit(0);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
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
            exit_app,
            lucky_reroll,
            character_sheet,
            party,
            treasury,
            save_state,
            treasury_add_manual,
            take_rest,
            spellbook,
            preparation_options,
            prepare_spells,
            cast_spell,
            change_slot,
            restore_slot,
            engine_log,
            character_details,
            inventory,
            master_notes,
            master_undo_info,
            undo_master_turn,
            set_kb_cards,
            kb_overrides,
            add_note,
            update_note,
            delete_note,
            custom_cards,
            edit_sheet,
            revert_sheet_edit,
            sheet_proposals,
            resolve_proposal,
            create_card,
            update_card,
            delete_card,
            autosave_list,
            autosave_write,
            autosave_read,
            open_url,
            load_state,
            ai_settings,
            ai_set_key,
            ai_select_model,
            ai_list_models,
            ai_chat
        ])
        .run(tauri::generate_context!())
        .expect("не удалось запустить приложение");
}
