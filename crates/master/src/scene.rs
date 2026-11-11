//! Контекст мастера по сценам.
//!
//! Мастер получает запрос из трёх частей:
//! - системный текст — кодекс, снимок сцены и хроника; не меняется до смены сцены, поэтому
//!   провайдеры кэшируют начало запроса;
//! - последние заявки игрока с ответами мастера (их отбирает интерфейс);
//! - последнюю реплику — изменения с начала сцены, журнал движка, напоминания, карточки по
//!   заявке, шпаргалку команд, подсказку по словам заявки и саму заявку.
//!
//! Недостающее мастер запрашивает у движка командой `query` ([`answer_query`]), пересказы
//! дней пишет командой `chronicle`. Двухшаговый ход: рассказ отдельно, команды движка по
//! рассказу — вторым запросом ([`update_request`]).

use std::collections::BTreeMap;

use dnd_engine::{CharacterKind, MasterMemo, NoteKind, NoteLayer, Session};
use serde_json::{json, Value};

use crate::{custom_codex, kb_index, magic_context, note_json, sheet_context, CODEX};

/// Сколько последних заявок игрока (с ответами мастера) уходит мастеру по умолчанию.
pub const HISTORY_TURNS_DEFAULT: usize = 12;
/// Границы настройки длины истории.
pub const HISTORY_TURNS_MIN: usize = 6;
pub const HISTORY_TURNS_MAX: usize = 20;
/// Сколько последних записей журнала мастера входит в снимок сцены.
const SNAPSHOT_JOURNAL: usize = 10;
/// Сколько записей журнала, подходящих к заявке, добавляется к реплике.
const TURN_JOURNAL_FOUND: usize = 5;
/// Сколько последних дней хроники идёт целиком; более ранние — первой фразой.
const CHRONICLE_FULL_DAYS: usize = 7;
/// Через сколько ходов без обновления пересказа текущего дня мастер получает напоминание.
pub const CHRONICLE_REMINDER_TURNS: u32 = 10;

/// Правила работы со снимком сцены — дополнение к кодексу.
const PROTOCOL: &str = r#"
КОНТЕКСТ ПО СЦЕНАМ
- «СНИМОК СЦЕНЫ» ниже собран в начале сцены и не меняется, пока сцена не сменится. Всё, что изменилось с тех пор, — в блоке «[ИЗМЕНЕНИЯ С НАЧАЛА СЦЕНЫ]» последнего сообщения игрока: он важнее снимка.
- Полные листы и магия в снимке — только у тех, кто в сцене; у остальных — строка в «отряд». Чего не видишь — запроси у движка блоком ```engine (как броски), а не выдумывай:
  {"cmd":"query","what":"sheet","id":"npc.valeria"} — лист; "spells" — книга заклинаний и ячейки; {"cmd":"query","what":"card","id":"npc.krot"} — текст карточки базы; {"cmd":"query","what":"notes","text":"склад"} — поиск по журналу мастера; {"cmd":"query","what":"chronicle","day":54} — пересказ дня.
- Запрос бросков или запрос к движку можно дописать в конце уже начатого рассказа: рассказ игрок увидит, движок вернёт ответ, и ты продолжишь с места остановки.
- Блоки последнего сообщения игрока заменяют поля прежнего контекста: [ЖУРНАЛ ДВИЖКА] — «журнал_движка», [СРАБОТАВШИЕ ТАЙМЕРЫ] — «сработавшие_таймеры», [ПРЕДЛОЖЕНИЯ ЛИСТА ЖДУТ ИГРОКА] — «предложения_листа_ждут_игрока», [НАПОМИНАНИЯ] — «напоминание_о_записях», [КАРТОЧКИ ПО ЗАЯВКЕ] и [ЖУРНАЛ МАСТЕРА ПО ЗАЯВКЕ] — подходящие к заявке карточки и записи.
- Ранний диалог тебе не присылается — его заменяет ХРОНИКА. Пересказ дня: {"cmd":"chronicle","day":N,"text":"5–10 предложений: что произошло, кто что узнал и решил, чем кончился день"}. Пересказ текущего дня обновляй по ходу — та же команда перезаписывает его.
"#;

/// Шпаргалка команд — перед каждой заявкой игрока.
const CHEAT_SHEET: &str = "Механика — только командами в блоке ```engine (по одной JSON-строке): \
броски — roll (числа только от движка), хиты — hp, ресурсы — resource, состояния — condition, \
заклинания — cast, предметы — item, деньги — treasury/transfer, сцена и время — scene, отдых — rest, \
записи — note (layer player и master), новое задание или цель героя — new_card (player, goals, status active), \
пересказ дня — chronicle, недостающие сведения — query. \
Без команды изменение не сохранится.";

/// Запрос к модели: системный текст и последняя реплика игрока.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
pub struct MasterRequest {
    pub system: String,
    pub turn: String,
}

/// Ключ сцены: смена дня, места, состава сцены или отдых — новая сцена.
fn scene_key(session: &Session) -> String {
    let scene = session.scene();
    let mut here: Vec<&str> = session
        .party()
        .iter()
        .filter(|c| c.location == scene.location)
        .map(|c| c.id.as_str())
        .collect();
    here.sort_unstable();
    format!(
        "{}|{}|{}|{}|{}|{}",
        session.campaign().map_or("", |c| c.title.as_str()),
        scene.day,
        scene.location,
        here.join(","),
        session.party().len(),
        session.rest_count()
    )
}

/// Состояние для списка изменений: «id|поле» → значение.
fn state_lines(session: &Session) -> Vec<(String, String)> {
    let mut out = Vec::new();
    let scene = session.scene();
    out.push(("сцена|время".to_string(), scene.time.clone().unwrap_or_default()));
    out.push(("сцена|ситуация".to_string(), scene.situation.clone()));
    for c in session.party() {
        let id = &c.id;
        let hp = &c.hit_points;
        let mut hits = format!("{}/{}", hp.current, hp.max);
        if hp.temporary > 0 {
            hits.push_str(&format!(" (+{} врем.)", hp.temporary));
        }
        out.push((format!("{id}|хиты"), hits));
        out.push((format!("{id}|где"), c.location.clone()));
        let d = c.details();
        let mut conditions = d.conditions.join(", ");
        if d.exhaustion > 0 {
            if !conditions.is_empty() {
                conditions.push_str(", ");
            }
            conditions.push_str(&format!("истощение {}", d.exhaustion));
        }
        out.push((format!("{id}|состояния"), conditions));
        for r in c.resources() {
            out.push((format!("{id}|ресурс|{}", r.name()), format!("{}/{}", r.current(), r.max())));
        }
        if let Some(book) = c.spellbook() {
            for s in &book.slots {
                let label = if s.pact {
                    format!("ячейки договора {} круга", s.level)
                } else {
                    format!("ячейки {} круга", s.level)
                };
                out.push((
                    format!("{id}|ресурс|{label}"),
                    format!("{}/{}", s.pool.current(), s.pool.max()),
                ));
            }
        }
        for (place, items) in c.inventory_summary() {
            for item in items {
                out.push((format!("{id}|предмет|{place}: {item}"), "есть".to_string()));
            }
        }
    }
    for place in session.treasury_view().locations {
        for line in place.lines {
            out.push((format!("казна|{}|{}", place.name, line.name), line.quantity.to_string()));
        }
    }
    out
}

/// Изменения с момента снимка, строками для мастера.
fn changes(session: &Session, memo: &MasterMemo) -> Vec<String> {
    let names: BTreeMap<&str, &str> =
        session.party().iter().map(|c| (c.id.as_str(), c.name.as_str())).collect();
    let before: BTreeMap<&str, &str> =
        memo.baseline.iter().map(|(k, v)| (k.as_str(), v.as_str())).collect();
    let now_lines = state_lines(session);
    let now: BTreeMap<&str, &str> =
        now_lines.iter().map(|(k, v)| (k.as_str(), v.as_str())).collect();
    let who = |key: &str| -> (String, String) {
        let (owner, field) = key.split_once('|').unwrap_or((key, ""));
        let owner = match owner {
            "сцена" => "Сцена".to_string(),
            "казна" => "Казна".to_string(),
            id => names.get(id).map_or_else(|| id.to_string(), |n| (*n).to_string()),
        };
        let field = field.strip_prefix("ресурс|").unwrap_or(field);
        (owner, field.replace('|', " — "))
    };
    let mut out = Vec::new();
    for (key, value) in &now {
        let (owner, field) = who(key);
        match before.get(key) {
            Some(old) if old == value => {}
            Some(old) => out.push(format!("{owner}: {field} {old} → {value}")),
            None if key.contains("|предмет|") => {
                let item = field.strip_prefix("предмет — ").unwrap_or(&field);
                out.push(format!("{owner}: получено — {item}"));
            }
            None => out.push(format!("{owner}: {field} — {value}")),
        }
    }
    for key in before.keys().filter(|k| !now.contains_key(*k)) {
        let (owner, field) = who(key);
        if key.contains("|предмет|") {
            let item = field.strip_prefix("предмет — ").unwrap_or(&field);
            out.push(format!("{owner}: больше нет — {item}"));
        } else if key.starts_with("казна|") {
            out.push(format!("{owner}: {field} — израсходовано полностью"));
        }
    }
    for n in session.notes().iter().filter(|n| n.id > memo.last_note_id) {
        let layer = match n.layer {
            NoteLayer::Player => "игроку",
            NoteLayer::Master => "журнал мастера",
        };
        out.push(format!(
            "Новая запись ({layer}, {}): «{}» [запись {}]",
            n.kind.label(),
            n.title,
            n.id
        ));
    }
    out
}

/// Снимок сцены: кто в сцене — с полными листами и магией, остальные — строкой.
fn snapshot(session: &Session) -> Value {
    let party = session.party_view();
    let here = |id: &str| party.members.iter().any(|m| m.id == id && m.in_scene);
    let player =
        session.party().iter().find(|c| c.kind == CharacterKind::Player).map(|c| c.sheet());
    let journal: Vec<_> = session.notes().iter().filter(|n| n.layer == NoteLayer::Master).collect();
    let recent = journal.len().saturating_sub(SNAPSHOT_JOURNAL);
    let timers: Vec<String> = session
        .notes()
        .iter()
        .filter(|n| n.kind == NoteKind::Timer && !n.done)
        .map(|n| format!("День {}: {} [запись {}]", n.due_day.unwrap_or(0), n.title, n.id))
        .collect();
    json!({
        "своя_кампания": session.campaign().map(|c| c.title.clone()),
        "сцена": party.scene,
        "отряд": party.members.iter().map(|m| json!({
            "id": m.id,
            "имя": m.name,
            "вид": m.race,
            "кто": m.summary,
            "хиты": format!("{}/{}", m.hit_points.current, m.hit_points.max),
            "кд": m.armor_class,
            "где": m.location,
            "в_сцене": m.in_scene,
        })).collect::<Vec<_>>(),
        "персонаж_игрока": player,
        "листы": session.party().iter().filter(|c| here(&c.id)).map(|c| (c.id.clone(), sheet_context(c))).collect::<serde_json::Map<_, _>>(),
        "магия": session.party().iter().filter(|c| here(&c.id)).filter_map(|c| {
            let book = c.spellbook()?;
            Some((c.id.clone(), magic_context(&book)))
        }).collect::<serde_json::Map<_, _>>(),
        "казна_всего_зм": party.treasury_total / 100,
        "казна": session.treasury_view().locations.iter().filter(|l| !l.lines.is_empty()).map(|l| json!({
            "место": l.name,
            "id": l.id,
            "состав": l.lines.iter().map(|h| format!("{} [{}] ×{}", h.name, h.asset_id, h.quantity)).collect::<Vec<_>>(),
        })).collect::<Vec<_>>(),
        "карточки_базы": kb_index(session),
        "записи_базы_знаний": {
            "записи_мастера_игроку": session.notes().iter()
                .filter(|n| n.layer == NoteLayer::Player && n.kind != NoteKind::Day)
                .map(|n| note_json(session, n)).collect::<Vec<_>>(),
            "журнал_мастера_последние": journal[recent..].iter().map(|n| note_json(session, n)).collect::<Vec<_>>(),
            "всего_в_журнале": journal.len(),
        },
        "таймеры": timers,
    })
}

/// Хроника: главы из базы знаний кратко, дни этой игры — последние целиком.
fn chronicle_text(session: &Session) -> String {
    let mut out = String::new();
    let chapters: Vec<String> = session
        .kb_cards()
        .iter()
        .filter(|c| c.id.starts_with("chron."))
        .map(|c| {
            if c.summary.is_empty() {
                format!("- {}", c.title)
            } else {
                format!("- {}: {}", c.title, c.summary)
            }
        })
        .collect();
    if !chapters.is_empty() {
        out.push_str("Главы:\n");
        out.push_str(&chapters.join("\n"));
        out.push('\n');
    }
    let days = session.chronicle();
    let full_from = days.len().saturating_sub(CHRONICLE_FULL_DAYS);
    for (i, d) in days.iter().enumerate() {
        let text = if i < full_from { first_sentence(&d.text) } else { d.text.clone() };
        out.push_str(&format!("День {}: {text}\n", d.day));
    }
    if out.is_empty() {
        out.push_str("Пока пусто.\n");
    }
    out
}

fn first_sentence(text: &str) -> String {
    let end = text.find(['.', '!', '?']).map_or(text.len(), |i| i + 1);
    let cut: String = text[..end].chars().take(220).collect();
    if cut.len() < text.len() {
        format!("{cut} …")
    } else {
        cut
    }
}

/// Кодекс с правилами снимка.
fn codex(session: &Session) -> String {
    let base = match session.campaign() {
        Some(c) => {
            let hero = session
                .party()
                .iter()
                .find(|p| p.kind == CharacterKind::Player)
                .map_or("герой игрока", |p| p.name.as_str());
            custom_codex(&c.title, hero)
        }
        None => CODEX.to_string(),
    };
    format!("{base}{PROTOCOL}")
}

/// Системный текст на текущую сцену: собирается при смене сцены, иначе берётся готовый.
fn scene_system(session: &mut Session) -> MasterMemo {
    let key = scene_key(session);
    if let Some(memo) = session.master_memo().filter(|m| m.key == key) {
        return memo.clone();
    }
    let snapshot = serde_json::to_string(&snapshot(session)).unwrap_or_default();
    let system = format!(
        "{}\nСНИМОК СЦЕНЫ (JSON):\n{snapshot}\n\nХРОНИКА:\n{}",
        codex(session),
        chronicle_text(session)
    );
    let memo = MasterMemo {
        key,
        system,
        baseline: state_lines(session),
        last_note_id: session.notes().iter().map(|n| n.id).max().unwrap_or(0),
    };
    session.set_master_memo(memo.clone());
    memo
}

/// Подсказка движка по словам заявки: какие команды, скорее всего, понадобятся.
pub fn turn_hint(player_text: &str) -> Vec<&'static str> {
    let t = player_text.to_lowercase().replace('ё', "е");
    let has = |words: &[&str]| words.iter().any(|w| t.contains(w));
    let mut out = Vec::new();
    if has(&["атак", "бью", "удар", "стреля", "рублю", "колю", "нападаю", "напада"])
    {
        out.push("атака: броски противников и урона — roll; урон — hp цели");
    }
    if has(&["колдую", "заклин", "читаю свит", "творю", "кастую"]) {
        out.push("заклинание: cast с ячейкой (или slot), эффекты — hp/condition");
    }
    if has(&[
        "провер",
        "ищу",
        "осматр",
        "убежда",
        "обман",
        "запуг",
        "краду",
        "крадусь",
        "прячусь",
        "взлам",
        "слуша",
    ]) {
        out.push("проверка: броски противников и тайные — roll; бросок героя — от игрока");
    }
    if has(&["отдых", "ночуем", "сплю", "привал", "ночлег"]) {
        out.push("отдых: rest short или long; при новом дне — chronicle прошедшего дня");
    }
    if has(&["покупа", "плачу", "заплат", "отдаю", "продаю", "куплю", "дарю", "беру", "забираю"])
    {
        out.push("деньги и вещи: treasury/transfer, item add/remove/move");
    }
    if has(&[
        "задани",
        "поручени",
        "контракт",
        "заказ",
        "награда",
        "берусь",
        "соглашаюсь",
        "возьмусь",
        "принимаю",
    ]) {
        out.push(
            "задание: new_card player/goals со status active; подоплёка — note в журнал мастера",
        );
    }
    if has(&["иду", "едем", "идем", "отправля", "переход", "возвраща", "скачем", "плывем"])
    {
        out.push("перемещение: scene location (и time), спутники — move");
    }
    out
}

/// Последняя реплика игрока: изменения, напоминания, карточки по заявке, шпаргалка, заявка.
fn turn_message(
    session: &Session,
    memo: &MasterMemo,
    player_text: &str,
    kb_extra: &str,
    two_step: bool,
) -> String {
    let mut out = String::new();
    let block = |out: &mut String, title: &str, lines: &[String]| {
        if lines.is_empty() {
            return;
        }
        out.push_str(&format!("[{title}]\n"));
        for l in lines {
            out.push_str(&format!("- {l}\n"));
        }
        out.push('\n');
    };
    let changed = changes(session, memo);
    if changed.is_empty() {
        out.push_str("[ИЗМЕНЕНИЯ С НАЧАЛА СЦЕНЫ]\n- нет\n\n");
    } else {
        block(&mut out, "ИЗМЕНЕНИЯ С НАЧАЛА СЦЕНЫ", &changed);
    }
    block(&mut out, "ЖУРНАЛ ДВИЖКА", session.engine_log());
    let due: Vec<String> = session
        .due_notes()
        .iter()
        .map(|n| format!("{} [запись {}]: {}", n.title, n.id, n.text))
        .collect();
    block(&mut out, "СРАБОТАВШИЕ ТАЙМЕРЫ", &due);
    let proposals: Vec<String> = session
        .sheet_proposals()
        .iter()
        .map(|p| format!("{} — {} ({})", p.character_name, p.summary, p.reason))
        .collect();
    block(&mut out, "ПРЕДЛОЖЕНИЯ ЛИСТА ЖДУТ ИГРОКА", &proposals);
    let mut reminders = Vec::new();
    for day in session.chronicle_missing() {
        reminders
            .push(format!("нет пересказа Дня {day} — запиши его в этом ходу командой chronicle"));
    }
    if session.turns_since_chronicle() >= CHRONICLE_REMINDER_TURNS {
        reminders.push(format!(
            "обнови пересказ текущего Дня {} командой chronicle",
            session.scene().day
        ));
    }
    if session.turns_without_notes() >= dnd_engine::NOTE_REMINDER_TURNS {
        reminders.push(format!(
            "уже {} ходов без записей в базу знаний — запиши важное: события, тайны, планы NPC, таймеры",
            session.turns_without_notes()
        ));
    }
    block(&mut out, "НАПОМИНАНИЯ", &reminders);
    let found: Vec<String> = session
        .notes_matching(player_text, NoteLayer::Master)
        .into_iter()
        .filter(|n| n.id <= memo.last_note_id)
        .take(TURN_JOURNAL_FOUND)
        .map(|n| format!("«{}» [запись {}, День {}]: {}", n.title, n.id, n.day, n.text))
        .collect();
    block(&mut out, "ЖУРНАЛ МАСТЕРА ПО ЗАЯВКЕ", &found);
    if !kb_extra.trim().is_empty() {
        out.push_str("[КАРТОЧКИ ПО ЗАЯВКЕ]\n");
        out.push_str(kb_extra.trim());
        out.push_str("\n\n");
    }
    out.push_str(&format!("[ШПАРГАЛКА]\n{CHEAT_SHEET}\n\n"));
    if two_step {
        out.push_str(
            "[ДВУХШАГОВЫЙ ХОД]\nВ рассказе пиши только команды roll и query. Изменения состояния и записи \
движок соберёт по твоему рассказу отдельным шагом — поэтому называй в рассказе всё явно: урон и лечение \
числами, потраченное и полученное, кто куда ушёл, что герой узнал.\n\n",
        );
    }
    let hints = turn_hint(player_text);
    if !hints.is_empty() {
        out.push_str("[ПОДСКАЗКА ДВИЖКА]\n");
        for h in hints {
            out.push_str(&format!("- {h}\n"));
        }
        out.push('\n');
    }
    out.push_str("[ЗАЯВКА ИГРОКА]\n");
    out.push_str(player_text);
    out
}

/// Запрос мастеру на ход: системный текст сцены и последняя реплика игрока.
pub fn master_request(
    session: &mut Session,
    player_text: &str,
    kb_extra: &str,
    two_step: bool,
) -> MasterRequest {
    let memo = scene_system(session);
    let turn = turn_message(session, &memo, player_text, kb_extra, two_step);
    MasterRequest { system: memo.system, turn }
}

/// Ответ движка на запрос мастера `query`.
pub fn answer_query(session: &Session, cmd: &Value) -> Result<String, String> {
    let what = cmd.get("what").and_then(Value::as_str).unwrap_or("").trim();
    let text_of = |key: &str| cmd.get(key).and_then(Value::as_str).map(str::trim).unwrap_or("");
    match what {
        "sheet" | "spells" => {
            let id = crate::directives::find_character(session, text_of("id"))?;
            let c = session.character(&id).map_err(|e| e.to_string())?;
            let value = if what == "sheet" {
                json!({ "кто": c.name, "лист": sheet_context(c), "хиты": format!("{}/{}", c.hit_points.current, c.hit_points.max), "кд": c.armor_class })
            } else {
                let book =
                    c.spellbook().ok_or_else(|| format!("у {} нет книги заклинаний", c.name))?;
                json!({ "кто": c.name, "магия": magic_context(&book) })
            };
            Ok(serde_json::to_string(&value).unwrap_or_default())
        }
        "card" => {
            let id = text_of("id");
            if let Some(card) = session.custom_cards().iter().find(|c| c.id == id) {
                return Ok(serde_json::to_string(card).unwrap_or_default());
            }
            let card = session
                .kb_cards()
                .iter()
                .find(|c| c.id == id || c.title.eq_ignore_ascii_case(id))
                .ok_or_else(|| format!("карточки «{id}» нет — id бери из «карточки_базы»"))?;
            let notes: Vec<String> = session
                .notes()
                .iter()
                .filter(|n| n.card.as_deref() == Some(card.id.as_str()))
                .map(|n| format!("«{}» [запись {}]: {}", n.title, n.id, n.text))
                .collect();
            let text = if card.text.is_empty() { card.summary.clone() } else { card.text.clone() };
            Ok(format!(
                "{} [{}]\n{text}\nЗаписи по карточке: {}",
                card.title,
                card.id,
                if notes.is_empty() { "нет".to_string() } else { notes.join("; ") }
            ))
        }
        "notes" => {
            let query = text_of("text");
            let found: Vec<String> = session
                .notes_matching(query, NoteLayer::Master)
                .into_iter()
                .chain(session.notes_matching(query, NoteLayer::Player))
                .take(8)
                .map(|n| format!("«{}» [запись {}, День {}]: {}", n.title, n.id, n.day, n.text))
                .collect();
            Ok(if found.is_empty() {
                format!("по «{query}» записей нет")
            } else {
                found.join("\n")
            })
        }
        "chronicle" => {
            let day =
                cmd.get("day").and_then(Value::as_u64).ok_or("для chronicle нужен \"day\"")?;
            Ok(session.chronicle().into_iter().find(|n| u64::from(n.day) == day).map_or_else(
                || format!("пересказа Дня {day} нет"),
                |n| format!("День {day}: {}", n.text),
            ))
        }
        other => {
            Err(format!("неизвестный запрос «{other}»: sheet, spells, card, notes, chronicle"))
        }
    }
}

/// Второй шаг двухшагового хода: по рассказу мастера — только команды движка.
/// Ответ модели — JSON `{"commands":[…]}` ([`update_commands`] превращает его в блок команд).
pub fn update_request(
    session: &Session,
    player_text: &str,
    narration: &str,
    written: &str,
) -> MasterRequest {
    let party: Vec<String> = session
        .party()
        .iter()
        .map(|c| {
            let res: Vec<String> = c
                .resources()
                .iter()
                .map(|r| format!("{} [{}] {}/{}", r.name(), r.id(), r.current(), r.max()))
                .collect();
            format!(
                "{} [{}]: хиты {}/{}, где — {}{}",
                c.name,
                c.id,
                c.hit_points.current,
                c.hit_points.max,
                c.location,
                if res.is_empty() {
                    String::new()
                } else {
                    format!("; ресурсы: {}", res.join(", "))
                }
            )
        })
        .collect();
    let places: Vec<String> = session
        .treasury_view()
        .locations
        .iter()
        .map(|l| {
            let lines: Vec<String> = l
                .lines
                .iter()
                .map(|h| format!("{} [{}] ×{}", h.name, h.asset_id, h.quantity))
                .collect();
            format!("{} [{}]: {}", l.name, l.id, lines.join(", "))
        })
        .collect();
    let custom: Vec<String> =
        session.custom_cards().iter().map(|c| format!("{} [{}]", c.title, c.id)).collect();
    let scene = session.scene();
    let mut reminders = Vec::new();
    for day in session.chronicle_missing() {
        reminders.push(format!("нет пересказа Дня {day} — добавь chronicle"));
    }
    if session.turns_since_chronicle() + 1 >= CHRONICLE_REMINDER_TURNS {
        reminders.push(format!("обнови пересказ текущего Дня {} (chronicle)", scene.day));
    }
    let system = format!(
        r#"Ты — модуль учёта игрового движка D&D. Мастер уже рассказал ход игроку. Твоя задача — перевести рассказ в команды движка, чтобы состояние игры совпало с рассказом. Сам ничего не придумывай.

Ответ — только JSON: {{"commands":[ ... ]}}. Если менять нечего — {{"commands":[]}}.

Команды:
- hp: {{"cmd":"hp","character":"id","damage":N}} / "heal":N / "temp":N — числа только из рассказа.
- resource: {{"cmd":"resource","character":"id","resource":"id ресурса","delta":-1}}
- condition: {{"cmd":"condition","character":"id","add":"Отравлен"}} / "remove"
- cast: {{"cmd":"cast","character":"id","spell":"id заклинания","slot":N}}; ячейка без заклинания: {{"cmd":"slot","character":"id","level":1,"spend":true}}
- item: {{"cmd":"item","character":"id","add":"Название","quantity":1}} / "remove" / "move","to"
- treasury: {{"cmd":"treasury","asset":"gp","location":"id места","quantity":-80,"reason":"..."}}; transfer: {{"cmd":"transfer","asset":"gp","quantity":N,"from":"id","to":"id","reason":"..."}}
- scene: {{"cmd":"scene","time":"вечер","location":"..."}} ("day" — только вперёд, если рассказ прямо говорит о новом дне); move: {{"cmd":"move","character":"id","location":"..."}}
- rest: {{"cmd":"rest","kind":"short"|"long"}} — только если в рассказе отряд отдыхает по заявке игрока.
- note: {{"cmd":"note","layer":"player","title":"...","text":"..."}} — что герой узнал или решил; "layer":"master" — правда за событием, планы NPC. Вид "kind": event, secret, plan, timer (с "due_day").
- chronicle: {{"cmd":"chronicle","day":N,"text":"5–10 предложений о дне"}}
- card: {{"cmd":"card","card":"id","status":"done"}}; new_card: {{"cmd":"new_card","layer":"master","section":"...","title":"...","summary":"..."}}
- задание, поручение или цель, которую герой принял: {{"cmd":"new_card","layer":"player","section":"goals","title":"...","summary":"кто поручил, что сделать, награда, срок","status":"active"}} — отдельная карточка цели, не просто note; ход и итог — card со status progress / done / failed.

Правила:
- Только то, что в рассказе произошло. Броски уже сделаны — не добавляй roll.
- После значимого события (новый NPC, улика, решение, сделка, бой) — две записи note: player и master.
- Не дублируй команды, которые уже выполнены (см. журнал движка).

Сейчас: День {}, {}, {}.
Отряд:
{}
Казна:
{}
Карточки, созданные по ходу игры: {}
Журнал движка: {}
{}"#,
        scene.day,
        scene.time.clone().unwrap_or_default(),
        scene.location,
        party.join("\n"),
        places.join("\n"),
        if custom.is_empty() { "нет".to_string() } else { custom.join(", ") },
        session.engine_log().join(" | "),
        if reminders.is_empty() {
            String::new()
        } else {
            format!("Напоминания: {}", reminders.join("; "))
        },
    );
    let mut turn = format!("ЗАЯВКА ИГРОКА:\n{player_text}\n\nРАССКАЗ МАСТЕРА:\n{narration}\n");
    if !written.trim().is_empty() {
        turn.push_str(&format!(
            "\nКоманды, которые мастер написал сам (проверь по рассказу и включи верные):\n{written}\n"
        ));
    }
    turn.push_str("\nОтветь JSON {\"commands\":[...]}.");
    MasterRequest { system, turn }
}

/// Ответ второго шага → текст с блоком команд для [`crate::apply_directives`].
/// Понимает JSON `{"commands":[…]}`, массив команд и обычный ответ с блоками ```engine.
pub fn update_commands(reply: &str) -> String {
    let trimmed = reply.trim();
    let body = trimmed
        .strip_prefix("```json")
        .or_else(|| trimmed.strip_prefix("```"))
        .and_then(|s| s.strip_suffix("```"))
        .unwrap_or(trimmed)
        .trim();
    let list = match serde_json::from_str::<Value>(body) {
        Ok(Value::Object(map)) => map.get("commands").and_then(Value::as_array).cloned(),
        Ok(Value::Array(items)) => Some(items),
        _ => None,
    };
    match list {
        Some(items) => {
            let lines: Vec<String> = items
                .iter()
                .filter(|v| {
                    v.get("cmd")
                        .and_then(Value::as_str)
                        .is_some_and(|c| c != "roll" && c != "query")
                })
                .map(|v| v.to_string())
                .collect();
            if lines.is_empty() {
                String::new()
            } else {
                format!("```engine\n{}\n```", lines.join("\n"))
            }
        }
        None => reply.to_string(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use dnd_engine::Xoshiro256;

    fn session() -> Session {
        Session::demo(Xoshiro256::from_seed(7))
    }

    #[test]
    fn system_text_is_stable_within_a_scene() {
        let mut s = session();
        let first = master_request(&mut s, "Осматриваюсь", "", false);
        let id = s.party()[0].id.clone();
        crate::apply_directives(
            &mut s,
            &format!("```engine\n{{\"cmd\":\"hp\",\"character\":\"{id}\",\"damage\":3}}\n```"),
        );
        let second = master_request(&mut s, "Иду дальше", "", false);
        assert_eq!(first.system, second.system);
        assert!(second.turn.contains("ИЗМЕНЕНИЯ С НАЧАЛА СЦЕНЫ"));
        assert!(second.turn.contains("хиты"), "{}", second.turn);
        assert!(second.turn.ends_with("Иду дальше"));
    }

    #[test]
    fn rest_starts_a_new_scene() {
        let mut s = session();
        master_request(&mut s, "x", "", false);
        let id = s.party()[0].id.clone();
        crate::apply_directives(
            &mut s,
            &format!("```engine\n{{\"cmd\":\"hp\",\"character\":\"{id}\",\"damage\":2}}\n```"),
        );
        assert!(!master_request(&mut s, "x", "", false).turn.contains("- нет\n"));
        // Отдых — новая сцена: снимок собирается заново, изменений с её начала нет.
        crate::apply_directives(&mut s, "```engine\n{\"cmd\":\"rest\",\"kind\":\"short\"}\n```");
        let after = master_request(&mut s, "x", "", false);
        assert!(after.turn.contains("[ИЗМЕНЕНИЯ С НАЧАЛА СЦЕНЫ]\n- нет"), "{}", after.turn);
    }

    #[test]
    fn chronicle_is_written_and_asked_for() {
        let mut s = session();
        let today = s.scene().day;
        let turn = crate::apply_directives(
            &mut s,
            &format!("Ночь прошла.\n```engine\n{{\"cmd\":\"chronicle\",\"day\":{today},\"text\":\"Отряд прибыл в город.\"}}\n```"),
        );
        assert!(turn.actions.iter().all(|a| a.ok), "{:?}", turn.actions);
        crate::apply_directives(
            &mut s,
            &format!("```engine\n{{\"cmd\":\"scene\",\"day\":{}}}\n```", today + 2),
        );
        let req = master_request(&mut s, "x", "", false);
        assert!(req.system.contains("Отряд прибыл в город."));
        assert!(req.turn.contains(&format!("нет пересказа Дня {}", today + 1)));
    }

    #[test]
    fn query_answers_sheet_and_unknown_card() {
        let s = session();
        let id = s.party()[0].id.clone();
        let sheet = answer_query(&s, &json!({"cmd":"query","what":"sheet","id":id})).unwrap();
        assert!(sheet.contains("лист"));
        assert!(answer_query(&s, &json!({"cmd":"query","what":"card","id":"нет.такой"})).is_err());
    }

    #[test]
    fn quest_words_hint_a_goal_card() {
        assert!(turn_hint("Хорошо, берусь за это поручение")
            .iter()
            .any(|h| h.starts_with("задание")));
    }

    #[test]
    fn hints_follow_player_words() {
        assert!(turn_hint("Атакую стражника мечом").iter().any(|h| h.starts_with("атака")));
        assert!(turn_hint("Ночуем в таверне").iter().any(|h| h.starts_with("отдых")));
        assert!(turn_hint("Смотрю на небо").is_empty());
    }

    #[test]
    fn update_reply_becomes_engine_block() {
        let text = update_commands("```json\n{\"commands\":[{\"cmd\":\"hp\",\"character\":\"pc.nikis\",\"damage\":4},{\"cmd\":\"roll\",\"dice\":\"1d20\"}]}\n```");
        assert!(text.starts_with("```engine\n"));
        assert!(text.contains("\"damage\":4"));
        assert!(!text.contains("roll"));
        assert_eq!(update_commands("{\"commands\":[]}"), "");
    }
}
