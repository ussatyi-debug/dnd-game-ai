//! Приложение Tauri: связывает интерфейс с игровым движком и ИИ-мастером.
//!
//! Логика игры — в `dnd_engine::Session`, ИИ — в модуле [`ai`]; здесь только тонкие
//! команды-обёртки.

mod ai;
mod tts;

use std::sync::{Mutex, MutexGuard};
use std::time::Duration;

use ai::{
    AiSettings, AiSettingsView, ChatMessage, MasterReply, ModelInfo, Provider, SettingsStore,
};
use dnd_engine::{
    validate_hero as check_hero, Campaign, CardDraft, CastMethod, CastOutcome, CastRequest,
    CharacterSheet, CustomCard, ExprRoll, HeroSpec, InventoryView, KbCard, KbOverride, LoadReport,
    LuckyReroll, MasterNote, NewNote, NoteEdit, NoteKind, NoteLayer, PartyView, RestKind,
    RestResult, SaveData, SaveState, Scene, Session, SheetDetails, SheetEdit, SheetProposal,
    SlotRef, SlotRestoreOutcome, SpellEntry, SpellbookView, TreasuryView, UndoInfo,
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

/// Проверка листа героя из мастера создания: список нарушений (пусто — лист в порядке).
#[tauri::command]
fn validate_hero(spec: serde_json::Value) -> Result<Vec<String>, String> {
    let spec: HeroSpec =
        serde_json::from_value(spec).map_err(|e| format!("Лист героя не прочитан: {e}"))?;
    Ok(check_hero(&spec))
}

/// Опыт отряда и журнал опыта мастера.
#[tauri::command]
fn xp_status(state: State<'_, SessionState>) -> Result<dnd_engine::XpStatus, String> {
    Ok(lock(&state)?.xp_status())
}

/// Повышение уровня по листу нового уровня из мастера создания.
#[tauri::command]
fn level_up(spec: serde_json::Value, state: State<'_, SessionState>) -> Result<String, String> {
    let spec: HeroSpec =
        serde_json::from_value(spec).map_err(|e| format!("Лист героя не прочитан: {e}"))?;
    lock(&state)?.level_up(spec).map_err(|e| e.to_string())
}

/// Можно ли принять спутника и какого уровня.
#[tauri::command]
fn recruit_info(state: State<'_, SessionState>) -> Result<dnd_engine::RecruitInfo, String> {
    Ok(lock(&state)?.recruit_info())
}

/// Предложения мастера принять персонажа в отряд.
#[tauri::command]
fn recruit_requests(
    state: State<'_, SessionState>,
) -> Result<Vec<dnd_engine::RecruitRequest>, String> {
    Ok(lock(&state)?.recruit_requests().to_vec())
}

/// Принять спутника по листу (необязательно — по предложению мастера `request`).
#[tauri::command]
fn add_member(
    spec: serde_json::Value,
    request: Option<u64>,
    state: State<'_, SessionState>,
) -> Result<String, String> {
    let spec: HeroSpec =
        serde_json::from_value(spec).map_err(|e| format!("Лист героя не прочитан: {e}"))?;
    lock(&state)?.add_member(spec, request).map_err(|e| e.to_string())
}

#[tauri::command]
fn dismiss_recruit(id: u64, state: State<'_, SessionState>) -> Result<bool, String> {
    Ok(lock(&state)?.dismiss_recruit(id))
}

/// Новая своя кампания вместо текущей игры.
#[tauri::command]
fn start_campaign(
    campaign: serde_json::Value,
    scene: serde_json::Value,
    gold: u32,
    state: State<'_, SessionState>,
) -> Result<PartyView, String> {
    let campaign: Campaign =
        serde_json::from_value(campaign).map_err(|e| format!("Кампания не прочитана: {e}"))?;
    let scene: Scene =
        serde_json::from_value(scene).map_err(|e| format!("Сцена не прочитана: {e}"))?;
    let mut session = lock(&state)?;
    session.start_campaign(campaign, scene, gold).map_err(|e| e.to_string())?;
    Ok(session.party_view())
}

/// Кампания «Дом Стрэндж» с начала.
#[tauri::command]
fn restart_demo(state: State<'_, SessionState>) -> Result<PartyView, String> {
    let mut session = lock(&state)?;
    session.restart_demo();
    Ok(session.party_view())
}

/// Автосохранение: файл `auto-N.json` и сведения о нём `auto-N.meta.json`
/// в папке данных приложения.
#[derive(serde::Serialize, serde::Deserialize)]
struct AutosaveMeta {
    slot: u8,
    saved_at: String,
    day: Option<u32>,
    location: String,
    /// Название ручного сохранения (у автосохранений пусто).
    #[serde(default)]
    name: String,
}

/// Ячейки 0–4 — автосохранения по кругу, 10–19 — ручные сохранения игрока.
const AUTOSAVE_SLOTS: u8 = 5;
const MANUAL_SLOTS: std::ops::Range<u8> = 10..20;

fn all_slots() -> impl Iterator<Item = u8> {
    (0..AUTOSAVE_SLOTS).chain(MANUAL_SLOTS)
}

/// ID кампании для имени папки: «strange» — «Дом Стрэндж» (старая папка), иначе своя.
fn check_campaign(campaign: &str) -> Result<(), String> {
    let ok = !campaign.is_empty()
        && campaign.len() <= 40
        && campaign
            .chars()
            .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '-' || c == '_');
    if ok {
        Ok(())
    } else {
        Err(format!("Недопустимый ID кампании «{campaign}»"))
    }
}

fn data_dir(app: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
    app.path().app_data_dir().map_err(|e| format!("Нет папки данных приложения: {e}"))
}

fn autosave_dir(app: &tauri::AppHandle, campaign: &str) -> Result<std::path::PathBuf, String> {
    check_campaign(campaign)?;
    let root = data_dir(app)?.join("autosaves");
    let dir = if campaign == "strange" { root } else { root.join(campaign) };
    std::fs::create_dir_all(&dir).map_err(|e| format!("Не создать папку автосохранений: {e}"))?;
    Ok(dir)
}

fn check_slot(slot: u8) -> Result<(), String> {
    if slot < AUTOSAVE_SLOTS || MANUAL_SLOTS.contains(&slot) {
        Ok(())
    } else {
        Err(format!("Нет ячейки автосохранения {slot}"))
    }
}

#[tauri::command]
fn autosave_list(app: tauri::AppHandle, campaign: String) -> Result<Vec<AutosaveMeta>, String> {
    let dir = autosave_dir(&app, &campaign)?;
    Ok(all_slots()
        .filter_map(|slot| {
            let text = std::fs::read_to_string(dir.join(format!("auto-{slot}.meta.json"))).ok()?;
            let meta: AutosaveMeta = serde_json::from_str(&text).ok()?;
            dir.join(format!("auto-{slot}.json")).exists().then_some(meta)
        })
        .collect())
}

#[tauri::command]
// Аргументы команды приходят из интерфейса по именам — структура тут ничего не упростит.
#[allow(clippy::too_many_arguments)]
fn autosave_write(
    app: tauri::AppHandle,
    campaign: String,
    slot: u8,
    json: String,
    saved_at: String,
    day: Option<u32>,
    location: String,
    name: Option<String>,
) -> Result<bool, String> {
    check_slot(slot)?;
    let dir = autosave_dir(&app, &campaign)?;
    let tmp = dir.join(format!("auto-{slot}.json.tmp"));
    std::fs::write(&tmp, json).map_err(|e| format!("Автосохранение не записано: {e}"))?;
    std::fs::rename(&tmp, dir.join(format!("auto-{slot}.json")))
        .map_err(|e| format!("Автосохранение не записано: {e}"))?;
    let name: String = name.unwrap_or_default().chars().take(80).collect();
    let meta = AutosaveMeta { slot, saved_at, day, location, name };
    let text = serde_json::to_string(&meta).map_err(|e| e.to_string())?;
    std::fs::write(dir.join(format!("auto-{slot}.meta.json")), text)
        .map_err(|e| format!("Автосохранение не записано: {e}"))?;
    Ok(true)
}

#[tauri::command]
fn autosave_read(app: tauri::AppHandle, campaign: String, slot: u8) -> Result<String, String> {
    check_slot(slot)?;
    std::fs::read_to_string(autosave_dir(&app, &campaign)?.join(format!("auto-{slot}.json")))
        .map_err(|e| format!("Автосохранение не прочитано: {e}"))
}

/// Сохранение в файл: в приложениях ссылка «скачать» не работает, файл пишет Rust.
/// ПК — папка «Загрузки», Android — общая папка Download (Android 11+ разрешает приложению
/// создавать в ней свои файлы без разрешений). Возвращает полный путь к файлу.
#[tauri::command]
fn export_save(app: tauri::AppHandle, name: String, json: String) -> Result<String, String> {
    let safe: String = name
        .chars()
        .map(|c| if c.is_alphanumeric() || " -_.()".contains(c) { c } else { '_' })
        .collect::<String>()
        .trim()
        .trim_start_matches('.')
        .to_string();
    let safe = if safe.is_empty() { "sheet.json".to_string() } else { safe };
    // Сохранения и листы — .json; лист для Word — .doc (HTML), для печати — .html; PDF — текстовый (ASCII).
    let known = [".json", ".doc", ".html", ".pdf"].iter().any(|ext| safe.ends_with(ext));
    let safe = if known { safe } else { format!("{safe}.json") };
    let dir = export_dir(&app)?;
    std::fs::create_dir_all(&dir)
        .map_err(|e| format!("Нет папки для сохранения ({}): {e}", dir.display()))?;
    let path = dir.join(&safe);
    std::fs::write(&path, json)
        .map_err(|e| format!("Файл не записан ({}): {e}", path.display()))?;
    Ok(path.display().to_string())
}

#[cfg(target_os = "android")]
fn export_dir(_app: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
    Ok(std::path::PathBuf::from("/storage/emulated/0/Download/DnD Game AI"))
}

#[cfg(not(target_os = "android"))]
fn export_dir(app: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
    app.path()
        .download_dir()
        .or_else(|_| app.path().document_dir())
        .map_err(|e| format!("Нет папки «Загрузки»: {e}"))
}

/// Удаление сохранения из ячейки (автосохранения или ручного).
#[tauri::command]
fn autosave_delete(app: tauri::AppHandle, campaign: String, slot: u8) -> Result<bool, String> {
    check_slot(slot)?;
    let dir = autosave_dir(&app, &campaign)?;
    for file in [format!("auto-{slot}.json"), format!("auto-{slot}.meta.json")] {
        match std::fs::remove_file(dir.join(file)) {
            Ok(()) => {}
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => {}
            Err(e) => return Err(format!("Сохранение не удалено: {e}")),
        }
    }
    Ok(true)
}

/// Удаляет папку сохранений своей кампании целиком.
#[tauri::command]
fn campaign_delete_saves(app: tauri::AppHandle, campaign: String) -> Result<bool, String> {
    check_campaign(&campaign)?;
    if campaign == "strange" {
        return Err("Сохранения «Дома Стрэндж» удаляются по одному".into());
    }
    let dir = data_dir(&app)?.join("autosaves").join(&campaign);
    match std::fs::remove_dir_all(dir) {
        Ok(()) => Ok(true),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(true),
        Err(e) => Err(format!("Сохранения кампании не удалены: {e}")),
    }
}

/// Список своих кампаний (`campaigns.json` в папке данных; ведёт интерфейс).
#[tauri::command]
fn campaigns_read(app: tauri::AppHandle) -> Result<String, String> {
    let path = data_dir(&app)?.join("campaigns.json");
    match std::fs::read_to_string(path) {
        Ok(text) => Ok(text),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok("[]".into()),
        Err(e) => Err(format!("Список кампаний не прочитан: {e}")),
    }
}

#[tauri::command]
fn campaigns_write(app: tauri::AppHandle, json: String) -> Result<bool, String> {
    serde_json::from_str::<serde_json::Value>(&json)
        .map_err(|e| format!("Список кампаний повреждён: {e}"))?;
    let dir = data_dir(&app)?;
    std::fs::create_dir_all(&dir).map_err(|e| format!("Нет папки данных: {e}"))?;
    let tmp = dir.join("campaigns.json.tmp");
    std::fs::write(&tmp, json).map_err(|e| format!("Список кампаний не записан: {e}"))?;
    std::fs::rename(&tmp, dir.join("campaigns.json"))
        .map_err(|e| format!("Список кампаний не записан: {e}"))?;
    Ok(true)
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

// ───────────────────────────── озвучка ─────────────────────────────

/// Встроенный Silero (Windows): модель грузится при первой фразе; раздача в сеть — по кнопке.
#[derive(Default)]
struct TtsState {
    #[cfg(windows)]
    silero: Mutex<Option<std::sync::Arc<Mutex<tts::silero::Silero>>>>,
    #[cfg(windows)]
    share: Mutex<Option<tts::share::Share>>,
}

#[cfg(windows)]
fn silero_engine(
    app: &tauri::AppHandle,
    state: &TtsState,
) -> Result<std::sync::Arc<Mutex<tts::silero::Silero>>, String> {
    let mut slot = lock(&state.silero)?;
    if let Some(engine) = slot.as_ref() {
        return Ok(engine.clone());
    }
    let dir = app.path().resource_dir().map_err(|e| format!("Нет папки приложения: {e}"))?;
    let engine = std::sync::Arc::new(Mutex::new(tts::silero::Silero::load(&dir)?));
    *slot = Some(engine.clone());
    Ok(engine)
}

#[tauri::command]
fn tts_silero_available(app: tauri::AppHandle) -> bool {
    #[cfg(windows)]
    {
        app.path().resource_dir().map(|d| tts::silero::installed(&d)).unwrap_or(false)
    }
    #[cfg(not(windows))]
    {
        let _ = app;
        false
    }
}

#[tauri::command]
async fn tts_silero_voices(
    app: tauri::AppHandle,
    state: State<'_, TtsState>,
) -> Result<Vec<tts::VoiceInfo>, String> {
    #[cfg(windows)]
    {
        let engine = silero_engine(&app, &state)?;
        let voices = lock(&*engine)?.voices();
        Ok(voices)
    }
    #[cfg(not(windows))]
    {
        let _ = (app, state);
        Err("Встроенный Silero есть только в версии для Windows".into())
    }
}

#[tauri::command]
async fn tts_silero_synth(
    app: tauri::AppHandle,
    state: State<'_, TtsState>,
    voice: String,
    text: String,
    rate: f32,
) -> Result<tauri::ipc::Response, String> {
    #[cfg(windows)]
    {
        let engine = silero_engine(&app, &state)?;
        let wav = tauri::async_runtime::spawn_blocking(move || -> Result<Vec<u8>, String> {
            let pcm = lock(&*engine)?.synth(&text, &voice, rate)?;
            Ok(tts::wav_from_f32(&pcm, tts::silero::SAMPLE_RATE))
        })
        .await
        .map_err(|e| format!("Silero: {e}"))??;
        Ok(tauri::ipc::Response::new(wav))
    }
    #[cfg(not(windows))]
    {
        let _ = (app, state, voice, text, rate);
        Err("Встроенный Silero есть только в версии для Windows".into())
    }
}

/// Состояние раздачи озвучки в сеть (`running: false` — выключена или недоступна).
#[tauri::command]
fn tts_share_status(state: State<'_, TtsState>) -> Result<serde_json::Value, String> {
    #[cfg(windows)]
    {
        let share = lock(&state.share)?;
        Ok(match share.as_ref() {
            Some(s) => serde_json::to_value(s.status()).map_err(|e| e.to_string())?,
            None => {
                serde_json::json!({ "running": false, "port": tts::share::DEFAULT_PORT, "address": null })
            }
        })
    }
    #[cfg(not(windows))]
    {
        let _ = state;
        Ok(serde_json::json!({ "running": false, "port": 5150, "address": null }))
    }
}

#[tauri::command]
fn tts_share_start(
    app: tauri::AppHandle,
    state: State<'_, TtsState>,
    port: u16,
) -> Result<serde_json::Value, String> {
    #[cfg(windows)]
    {
        let engine = silero_engine(&app, &state)?;
        let for_voices = engine.clone();
        let voices: tts::share::VoicesFn = std::sync::Arc::new(move || {
            let list = lock(&*for_voices)?.voices();
            serde_json::to_string(&tts::ServerVoices { engine: "silero".into(), voices: list })
                .map_err(|e| e.to_string())
        });
        let synth: tts::share::SynthFn = std::sync::Arc::new(move |voice, text, rate| {
            let pcm = lock(&*engine)?.synth(text, voice, rate)?;
            Ok(tts::wav_from_f32(&pcm, tts::silero::SAMPLE_RATE))
        });
        let mut share = lock(&state.share)?;
        *share = None;
        let started = tts::share::Share::start(port, voices, synth)?;
        let status = started.status();
        *share = Some(started);
        serde_json::to_value(status).map_err(|e| e.to_string())
    }
    #[cfg(not(windows))]
    {
        let _ = (app, state, port);
        Err("Раздача озвучки в сеть есть только в версии для Windows".into())
    }
}

#[tauri::command]
fn tts_share_stop(state: State<'_, TtsState>) -> Result<bool, String> {
    #[cfg(windows)]
    {
        Ok(lock(&state.share)?.take().is_some())
    }
    #[cfg(not(windows))]
    {
        let _ = state;
        Ok(false)
    }
}

#[tauri::command]
async fn tts_cloud_models(
    provider: Provider,
    ai: State<'_, AiState>,
) -> Result<Vec<String>, String> {
    let settings = lock(&ai.settings)?.clone();
    tts::cloud_models(&ai.client, &settings, provider).await
}

#[tauri::command]
async fn tts_cloud_synth(
    provider: Provider,
    model: String,
    voice: String,
    text: String,
    rate: f32,
    ai: State<'_, AiState>,
) -> Result<tauri::ipc::Response, String> {
    let settings = lock(&ai.settings)?.clone();
    let bytes =
        tts::cloud_synth(&ai.client, &settings, provider, &model, &voice, &text, rate).await?;
    Ok(tauri::ipc::Response::new(bytes))
}

#[tauri::command]
async fn tts_server_voices(
    url: String,
    ai: State<'_, AiState>,
) -> Result<tts::ServerVoices, String> {
    tts::server_voices(&ai.client, &url).await
}

#[tauri::command]
async fn tts_server_synth(
    url: String,
    voice: String,
    text: String,
    rate: f32,
    ai: State<'_, AiState>,
) -> Result<tauri::ipc::Response, String> {
    Ok(tauri::ipc::Response::new(tts::server_synth(&ai.client, &url, &voice, &text, rate).await?))
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
///
/// Мастер получает системный текст сцены (кодекс, снимок, хроника — неизменный до смены
/// сцены) и последнюю реплику с изменениями за ход и заявкой. Запросы бросков и запросы к
/// движку обслуживаются по ходу; рассказ до них не теряется. При `two_step` команды движка
/// не выполняются: рассказ уходит игроку сразу, данные обновляет [`ai_update`].
#[tauri::command]
async fn ai_chat(
    history: Vec<ChatMessage>,
    kb_extra: Option<String>,
    two_step: Option<bool>,
    ai: State<'_, AiState>,
    session: State<'_, SessionState>,
) -> Result<MasterReply, String> {
    let settings = lock(&ai.settings)?.clone();
    let two_step = two_step.unwrap_or(false);
    let player_text = history
        .iter()
        .rev()
        .find(|m| m.role == ai::Role::Player)
        .map(|m| m.text.clone())
        .unwrap_or_default();
    let request = dnd_master::master_request(
        &mut *lock(&session)?,
        &player_text,
        kb_extra.as_deref().unwrap_or(""),
        two_step,
    );
    let system = request.system;
    let mut history = history;
    if let Some(last) = history.iter_mut().rev().find(|m| m.role == ai::Role::Player) {
        last.text = request.turn;
    }
    let mut rolls = Vec::new();
    let mut raw = Vec::new();
    let mut prose: Vec<String> = Vec::new();
    let mut carried = String::new();
    let mut prompt_tokens = None;
    let mut prompt_chars = 0;
    let mut round = 0;
    let mut reply = loop {
        let reply = ai::chat(&ai.client, &settings, &system, &history, false).await?;
        prompt_tokens = prompt_tokens.max(reply.prompt_tokens);
        prompt_chars = prompt_chars.max(reply.prompt_chars);
        raw.push(reply.text.clone());
        // Запросы бросков и сведений: движок отвечает, мастер продолжает ход с места остановки.
        if round < dnd_master::MAX_ROLL_ROUNDS {
            let rolled = dnd_master::run_rolls(&mut *lock(&session)?, &reply.text);
            if let Some(r) = rolled {
                round += 1;
                history.push(ai::ChatMessage { role: ai::Role::Master, text: reply.text });
                history.push(ai::ChatMessage { role: ai::Role::Player, text: r.feedback });
                rolls.extend(r.rolls);
                if !r.prose.is_empty() {
                    prose.push(r.prose);
                }
                if !r.carried.is_empty() {
                    carried.push_str(&r.carried);
                    carried.push('\n');
                }
                continue;
            }
        }
        break reply;
    };
    let mut full = prose.join("\n\n");
    if !full.is_empty() {
        full.push_str("\n\n");
    }
    full.push_str(&reply.text);
    reply.prompt_tokens = prompt_tokens;
    reply.prompt_chars = prompt_chars;
    reply.rolls = rolls;
    reply.raw = raw;
    if two_step {
        let (text, written) = dnd_master::narration_parts(&full);
        reply.fabricated = dnd_master::fabricated_rolls(
            &text,
            &dnd_master::rolled_faces(&reply.rolls),
            &player_text,
        );
        reply.text = text;
        reply.written_commands = format!("{carried}{written}").trim().to_string();
        reply.pending_update = true;
        return Ok(reply);
    }
    full.push('\n');
    full.push_str(&carried);
    let mut turn = dnd_master::apply_directives(&mut *lock(&session)?, &full);
    // Отказы движка: один повтор — мастер присылает исправленные команды, они входят в тот же ход.
    if let Some(request) = dnd_master::repair_request(&turn.actions) {
        history.push(ai::ChatMessage { role: ai::Role::Master, text: reply.text.clone() });
        history.push(ai::ChatMessage { role: ai::Role::Player, text: request });
        if let Ok(fix) = ai::chat(&ai.client, &settings, &system, &history, false).await {
            reply.raw.push(fix.text.clone());
            let fixed = dnd_master::apply_repair(&mut *lock(&session)?, &fix.text);
            turn.actions.extend(fixed.into_iter().map(|mut a| {
                a.summary = format!("исправлено: {}", a.summary);
                a
            }));
        }
    }
    reply.fabricated = dnd_master::fabricated_rolls(
        &turn.text,
        &dnd_master::rolled_faces(&reply.rolls),
        &player_text,
    );
    reply.text = turn.text;
    reply.actions = turn.actions;
    Ok(reply)
}

/// Второй шаг двухшагового хода: модель переводит рассказ мастера в команды движка
/// (ответ JSON, где провайдер это умеет), движок их выполняет. Один повтор при отказах.
#[tauri::command]
async fn ai_update(
    player_text: String,
    narration: String,
    written: Option<String>,
    ai: State<'_, AiState>,
    session: State<'_, SessionState>,
) -> Result<MasterReply, String> {
    let settings = lock(&ai.settings)?.clone();
    let request = dnd_master::update_request(
        &*lock(&session)?,
        &player_text,
        &narration,
        written.as_deref().unwrap_or(""),
    );
    let mut history = vec![ai::ChatMessage { role: ai::Role::Player, text: request.turn }];
    let mut reply = ai::chat(&ai.client, &settings, &request.system, &history, true).await?;
    let first = reply.text.clone();
    let mut turn =
        dnd_master::apply_directives(&mut *lock(&session)?, &dnd_master::update_commands(&first));
    reply.raw = vec![first.clone()];
    if let Some(repair) = dnd_master::repair_request(&turn.actions) {
        history.push(ai::ChatMessage { role: ai::Role::Master, text: first });
        history.push(ai::ChatMessage {
            role: ai::Role::Player,
            text: format!(
                "{repair}\nОтветь JSON {{\"commands\":[...]}} только с исправленными командами."
            ),
        });
        if let Ok(fix) = ai::chat(&ai.client, &settings, &request.system, &history, true).await {
            reply.raw.push(fix.text.clone());
            let fixed = dnd_master::apply_repair(
                &mut *lock(&session)?,
                &dnd_master::update_commands(&fix.text),
            );
            turn.actions.extend(fixed.into_iter().map(|mut a| {
                a.summary = format!("исправлено: {}", a.summary);
                a
            }));
        }
    }
    reply.text = String::new();
    reply.actions = turn.actions;
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
            app.manage(TtsState::default());
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
            xp_status,
            level_up,
            recruit_info,
            recruit_requests,
            add_member,
            dismiss_recruit,
            resolve_proposal,
            create_card,
            update_card,
            delete_card,
            autosave_list,
            autosave_write,
            autosave_read,
            autosave_delete,
            campaign_delete_saves,
            campaigns_read,
            campaigns_write,
            export_save,
            validate_hero,
            start_campaign,
            restart_demo,
            open_url,
            load_state,
            ai_settings,
            ai_set_key,
            ai_select_model,
            ai_list_models,
            ai_chat,
            ai_update,
            tts_silero_available,
            tts_silero_voices,
            tts_silero_synth,
            tts_share_status,
            tts_share_start,
            tts_share_stop,
            tts_cloud_models,
            tts_cloud_synth,
            tts_server_voices,
            tts_server_synth
        ])
        .run(tauri::generate_context!())
        .expect("не удалось запустить приложение");
}
