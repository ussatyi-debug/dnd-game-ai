//! Контекст мастера по сценам.
//!
//! Мастер получает запрос из трёх частей:
//! - системный текст из двух блоков: кодекс со шпаргалкой (не меняется всю игру) и снимок
//!   сцены с хроникой (не меняется до смены сцены). Провайдеры кэшируют начало запроса, а
//!   Claude — каждый блок отдельно: при смене сцены перезаписывается только снимок;
//! - последние заявки игрока с ответами мастера (их отбирает интерфейс);
//! - последнюю реплику — день, время, место и хиты отряда сейчас, изменения с начала сцены,
//!   журнал движка, напоминания, карточки по заявке, пул кубов, подсказку и саму заявку.
//!
//! Недостающее мастер запрашивает у движка командой `query` ([`answer_query`]), пересказы
//! дней пишет командой `chronicle`. Двухшаговый ход: рассказ отдельно, команды движка по
//! рассказу — вторым запросом ([`update_request`]).

use std::collections::BTreeMap;

use dnd_engine::knowledge::{matches, query_stems};
use dnd_engine::{CharacterKind, CustomCard, MasterMemo, NoteKind, NoteLayer, Session};
use serde_json::{json, Value};

use crate::{custom_codex, kb_index, magic_context, note_json, sheet_context, CODEX};

/// Сколько последних заявок игрока (с ответами мастера) уходит мастеру по умолчанию.
pub const HISTORY_TURNS_DEFAULT: usize = 6;
/// Границы настройки длины истории.
pub const HISTORY_TURNS_MIN: usize = 4;
pub const HISTORY_TURNS_MAX: usize = 20;
/// Сколько последних записей журнала мастера входит в снимок сцены.
const SNAPSHOT_JOURNAL: usize = 10;
/// Сколько последних записей слоя игрока входит в снимок сцены (остальные — по заявке и query).
const SNAPSHOT_PLAYER_NOTES: usize = 15;
/// Сколько созданных по ходу игры карточек, подходящих к заявке, добавляется к реплике.
const TURN_CARDS_FOUND: usize = 3;
/// Сколько записей журнала, подходящих к заявке, добавляется к реплике.
const TURN_JOURNAL_FOUND: usize = 5;
/// Сколько последних записей этой сцены идут в [ИЗМЕНЕНИЯ] полным текстом.
const NOTES_FULL_IN_CHANGES: usize = 4;
/// Сколько последних дней хроники идёт целиком; более ранние — первой фразой.
const CHRONICLE_FULL_DAYS: usize = 7;
/// Через сколько ходов без обновления пересказа текущего дня мастер получает напоминание.
pub const CHRONICLE_REMINDER_TURNS: u32 = 10;
/// Через сколько ходов без смены времени суток мастеру напоминают, что время идёт.
const TIME_REMINDER_TURNS: u32 = 8;

/// Правила работы со снимком сцены — дополнение к кодексу.
const PROTOCOL: &str = r#"
КОНТЕКСТ ПО СЦЕНАМ
- «СНИМОК СЦЕНЫ» ниже собран в начале сцены и не меняется, пока сцена не сменится. День, время, место и хиты отряда сейчас — в блоке «[СЦЕНА]» последнего сообщения игрока; всё, что изменилось с начала сцены, — в «[ИЗМЕНЕНИЯ С НАЧАЛА СЦЕНЫ]». Последнее сообщение важнее снимка.
- Постоянная часть листов всего отряда (спасброски, навыки, атаки, владения, умения, заклинания) — в блоке «ЛИСТЫ ОТРЯДА» сразу после кодекса. Текущее (ресурсы с id, кости хитов, состояния, инвентарь, ячейки) — «листы_сейчас» и «магия_сейчас» в снимке, у тех, кто в сцене; хиты — в [СЦЕНА]. Записи журнала, сделанные в этой сцене, в [ИЗМЕНЕНИЯХ] — полным текстом только последние, остальные заголовком. Чего не видишь — запроси у движка блоком ```engine (как броски), а не выдумывай:
  {"cmd":"query","what":"sheet","id":"npc.valeria"} — лист; "spells" — книга заклинаний и ячейки; {"cmd":"query","what":"card","id":"npc.krot"} — текст карточки базы; {"cmd":"query","what":"notes","text":"склад"} — поиск по журналу мастера; {"cmd":"query","what":"chronicle","day":54} — пересказ дня.
- Запрос бросков или запрос к движку можно дописать в конце уже начатого рассказа: рассказ игрок увидит, движок вернёт ответ, и ты продолжишь с места остановки.
- Блоки последнего сообщения игрока заменяют поля прежнего контекста: [ЖУРНАЛ ДВИЖКА] — «журнал_движка», [СРАБОТАВШИЕ ТАЙМЕРЫ] — «сработавшие_таймеры», [ПРЕДЛОЖЕНИЯ ЛИСТА ЖДУТ ИГРОКА] — «предложения_листа_ждут_игрока», [НАПОМИНАНИЯ] — «напоминание_о_записях», [КАРТОЧКИ ПО ЗАЯВКЕ] и [ЖУРНАЛ МАСТЕРА ПО ЗАЯВКЕ] — подходящие к заявке карточки и записи.
- В снимке — только последние записи игроку; старые приходят блоком [ЗАПИСИ ИГРОКУ ПО ЗАЯВКЕ] или по query notes. Описания карточек, созданных по ходу игры, — блоком [КАРТОЧКИ ИГРЫ ПО ЗАЯВКЕ] или по query card. Всё, что изменилось в базе с начала сцены (новые карточки с их id, статусы, правки и удаления записей, в том числе сделанные игроком), — в [ИЗМЕНЕНИЯ С НАЧАЛА СЦЕНЫ].
- Пул кубов: в каждом ходу движок кладёт блок «[ПУЛ КУБОВ]» — заранее брошенные d20, d12, d10, d8, d6, d4. Броски противников, NPC и спутников, их урон и тайные проверки бери из пула, без запроса roll: пиши в рассказе выражение в двойных квадратных скобках — движок сам возьмёт кубы по порядку, посчитает и подставит итог числом. «Вор бьёт [[1d20+4]] против КД 15», урон противнику — «[[1d6+2]] урона». Урон члену отряда — «[[1d8+2 > id]]»: движок сам спишет хиты, команду hp за этот урон не пиши. Крит — удвой кубы сам: [[2d8+2]]. Тайная проверка — «[[1d20+3 ?]]»: куб забирается, игрок числа не видит. Каждое выражение забирает следующие значения своего куба, поэтому исход ты знаешь заранее — описывай попадание или промах по пулу. Арифметику не делай: итог посчитает движок. Броски героя игрока — только от игрока.
- Ранний диалог тебе не присылается — его заменяет ХРОНИКА. Пересказ дня: {"cmd":"chronicle","day":N,"text":"5–10 предложений: что произошло, кто что узнал и решил, чем кончился день"}. Пересказ текущего дня обновляй по ходу — та же команда перезаписывает его.
"#;

/// Шпаргалка команд — в кэшируемом блоке кодекса (раньше шла в каждом ходу).
const CHEAT_SHEET: &str = "Механика — только командами в блоке ```engine (по одной JSON-строке): \
броски за NPC, противников и спутников и их урон — выражения пула [[1d20+4]], [[1d8+2 > id]], тайные — [[1d20+3 ?]]; \
отдельный бросок с модификатором из листа — roll (числа только от движка), хиты — hp, ресурсы — resource, состояния — condition, \
заклинания — cast, предметы — item, деньги — treasury/transfer, сцена и время — scene, отдых — rest, \
записи — note (layer player и master), новое задание или цель героя — new_card (player, goals), её ход и итог — goal, \
пересказ дня — chronicle, недостающие сведения — query. \
Без команды изменение не сохранится.";

/// Запрос к модели: системный текст и последняя реплика игрока.
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
pub struct MasterRequest {
    /// Весь системный текст одним куском (для провайдеров без раздельного кэша).
    pub system: String,
    /// Те же блоки по отдельности: кодекс (не меняется всю игру) и снимок сцены с хроникой.
    /// Claude кэширует каждый блок своей меткой.
    pub system_parts: Vec<String>,
    pub turn: String,
}

impl MasterRequest {
    fn new(parts: Vec<String>, turn: String) -> Self {
        Self { system: parts.join("\n"), system_parts: parts, turn }
    }
}

/// Место сцены для ключа снимка: самая внешняя локация по цепочке `parent` (таверна и её
/// подвал — одна сцена). Без карточки места — само место.
fn scene_place(session: &Session) -> String {
    let parent_of = |key: &str| -> Option<(String, Option<String>)> {
        let key = key.trim();
        session
            .kb_cards()
            .iter()
            .find(|c| c.id == key || c.title.eq_ignore_ascii_case(key))
            .map(|c| (c.id.clone(), c.parent.clone()))
            .or_else(|| {
                session
                    .custom_cards()
                    .iter()
                    .find(|c| c.id == key || c.title.eq_ignore_ascii_case(key))
                    .map(|c| (c.id.clone(), c.parent.clone()))
            })
    };
    let mut place = session.scene().location.clone();
    let mut current = parent_of(&place);
    // Глубина ограничена: зацикленные `parent` не повесят ход.
    for _ in 0..6 {
        let Some((id, parent)) = current else { break };
        place = id;
        current = parent.as_deref().and_then(parent_of);
    }
    place
}

/// Ключ сцены: смена дня, места (соседние места одной локации — та же сцена), состава сцены
/// или отдых — новая сцена.
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
        scene_place(session),
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
    // База знаний: созданные карточки, статусы встроенных и записи — чтобы мастер видел
    // свои и чужие правки сразу, а не с новой сцены.
    for c in session.custom_cards() {
        out.push((format!("база|карточка|{}", c.id), card_line(c)));
    }
    for o in session.kb_overrides() {
        let note = if o.note.is_empty() { String::new() } else { format!(" ({})", o.note) };
        out.push((
            format!("база|статус|{}", o.card_id),
            format!("{}{note}", crate::status_label(&o.status)),
        ));
    }
    for n in session.notes() {
        let done = if n.done { " (отработано)" } else { "" };
        out.push((format!("база|запись|{}", n.id), format!("«{}»{done}: {}", n.title, n.text)));
    }
    out
}

/// Карточка одной строкой для списка изменений: название, id, статус, ход цели.
fn card_line(c: &CustomCard) -> String {
    let mut line = format!("«{}» [{}]", c.title, c.id);
    if let Some(s) = c.status.as_deref() {
        line.push_str(&format!(" — {}", crate::status_label(s)));
    }
    if let Some(g) = &c.goal {
        if !g.steps.is_empty() {
            let done = g.steps.iter().filter(|s| s.done).count();
            line.push_str(&format!("; шаги {done}/{}", g.steps.len()));
        }
        if let Some(last) = g.log.last() {
            line.push_str(&format!("; ход: {}", last.text));
        }
    }
    if !c.summary.is_empty() {
        line.push_str(&format!("; {}", c.summary));
    }
    line
}

/// Цель для снимка сцены и второго шага: всё, что нужно, чтобы её вести.
fn goal_json(c: &CustomCard) -> Value {
    let g = c.goal.clone().unwrap_or_default();
    json!({
        "id": c.id,
        "цель": c.title,
        "суть": c.summary,
        "статус": c.status.as_deref().map(crate::status_label),
        "заказчик": g.giver,
        "награда": g.reward,
        "срок_день": g.due_day,
        "шаги": g.steps.iter().enumerate().map(|(i, s)| format!("{}. {}{}", i + 1, s.text, if s.done { " — сделано" } else { "" })).collect::<Vec<_>>(),
        "ход": g.log.iter().rev().take(3).rev().map(|l| format!("День {}: {}", l.day, l.text)).collect::<Vec<_>>(),
    })
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
    for (key, value) in now.iter().filter(|(k, _)| !k.starts_with("база|")) {
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
    for key in before.keys().filter(|k| !now.contains_key(*k) && !k.starts_with("база|")) {
        let (owner, field) = who(key);
        if key.contains("|предмет|") {
            let item = field.strip_prefix("предмет — ").unwrap_or(&field);
            out.push(format!("{owner}: больше нет — {item}"));
        } else if key.starts_with("казна|") {
            out.push(format!("{owner}: {field} — израсходовано полностью"));
        }
    }
    // База знаний. Записи этой сцены копятся с каждым ходом: полным текстом идут только
    // последние, остальные — заголовком (их писал сам мастер; текст — по запросу query).
    let kb = |map: &BTreeMap<&str, &str>, key: &str| map.get(key).map(|v| (*v).to_string());
    let mut touched: Vec<u64> = now
        .iter()
        .filter(|(k, v)| k.starts_with("база|запись|") && before.get(**k) != Some(*v))
        .filter_map(|(k, _)| k.rsplit('|').next()?.parse().ok())
        .collect();
    touched.sort_unstable();
    let full_from = touched.iter().rev().nth(NOTES_FULL_IN_CHANGES - 1).copied().unwrap_or(0);
    for (key, value) in now.iter().filter(|(k, _)| k.starts_with("база|")) {
        let old = kb(&before, key);
        if old.as_deref() == Some(*value) {
            continue;
        }
        let id = key.rsplit('|').next().unwrap_or_default();
        let new = old.is_none();
        if key.starts_with("база|карточка|") {
            out.push(format!(
                "{}: {value}",
                if new {
                    "Новая карточка"
                } else {
                    "Карточка изменена"
                }
            ));
        } else if key.starts_with("база|статус|") {
            out.push(format!("Статус карточки [{id}]: {value}"));
        } else if let Some(n) = session.notes().iter().find(|n| n.id.to_string() == id) {
            let layer = match n.layer {
                NoteLayer::Player => "игроку",
                NoteLayer::Master => "журнал мастера",
            };
            let who = if n.by_player { ", записал игрок" } else { "" };
            let compact: String;
            let value: &str = if n.id < full_from {
                let done = if n.done { " (отработано)" } else { "" };
                compact = format!("«{}»{done} — текст: query notes", n.title);
                &compact
            } else {
                value
            };
            if new {
                out.push(format!(
                    "Новая запись ({layer}, {}{who}) [запись {id}]: {value}",
                    n.kind.label()
                ));
            } else {
                out.push(format!("Запись изменена ({layer}{who}) [запись {id}]: {value}"));
            }
        }
    }
    for key in before.keys().filter(|k| k.starts_with("база|") && !now.contains_key(*k)) {
        let id = key.rsplit('|').next().unwrap_or_default();
        if key.starts_with("база|карточка|") {
            out.push(format!("Карточка удалена: {}", before[key]));
        } else if key.starts_with("база|статус|") {
            out.push(format!("Статус карточки [{id}] возвращён к исходному"));
        } else {
            out.push(format!("Запись удалена [запись {id}]: {}", before[key]));
        }
    }
    out
}

/// Снимок сцены: кто в сцене — с полными листами и магией, остальные — строкой.
fn snapshot(session: &Session, short: bool) -> Value {
    let party = session.party_view();
    let here = |id: &str| party.members.iter().any(|m| m.id == id && m.in_scene);
    let player =
        session.party().iter().find(|c| c.kind == CharacterKind::Player).map(|c| c.sheet());
    let journal: Vec<_> = session.notes().iter().filter(|n| n.layer == NoteLayer::Master).collect();
    let for_player: Vec<_> = session
        .notes()
        .iter()
        .filter(|n| n.layer == NoteLayer::Player && n.kind != NoteKind::Day)
        .collect();
    let player_from = for_player.len().saturating_sub(SNAPSHOT_PLAYER_NOTES);
    let recent = journal.len().saturating_sub(SNAPSHOT_JOURNAL);
    let timers: Vec<String> = session
        .notes()
        .iter()
        .filter(|n| n.kind == NoteKind::Timer && !n.done)
        .map(|n| format!("День {}: {} [запись {}]", n.due_day.unwrap_or(0), n.title, n.id))
        .collect();
    // Отдельно от большого json! ниже: вложенный объект внутри него делает выражение слишком
    // глубоким для wasm2js (веб-версия). Ключи — как в кодексе («situation»); место — на
    // начало сцены.
    let scene = json!({
        "day": party.scene.day,
        "location": party.scene.location,
        "situation": party.scene.situation,
    });
    json!({
        "своя_кампания": session.campaign().map(|c| c.title.clone()),
        // Время, место сейчас, сводка «СЕЙЧАС» и хиты — в блоке [СЦЕНА] каждого хода: здесь они
        // устаревали бы, а снимок кэшируется до смены сцены.
        "сцена": scene,
        "отряд": party.members.iter().map(|m| json!({
            "id": m.id,
            "имя": m.name,
            "вид": m.race,
            "пол": crate::gender_word(&m.gender),
            "кто": m.summary,
            "кд": m.armor_class,
            "где": m.location,
            "в_сцене": m.in_scene,
        })).collect::<Vec<_>>(),
        "персонаж_игрока": player,
        // Постоянная часть листов — в блоке «ЛИСТЫ ОТРЯДА» (кэш на всю игру), здесь — текущее.
        "листы_сейчас": session.party().iter().filter(|c| here(&c.id)).map(|c| (c.id.clone(), split_keys(sheet_context(c, short), SHEET_NOW).1)).collect::<serde_json::Map<_, _>>(),
        "магия_сейчас": session.party().iter().filter(|c| here(&c.id)).filter_map(|c| {
            let book = c.spellbook()?;
            Some((c.id.clone(), split_keys(magic_context(&book), MAGIC_NOW).1))
        }).collect::<serde_json::Map<_, _>>(),
        "казна_всего_зм": party.treasury_total / 100,
        "казна": session.treasury_view().locations.iter().filter(|l| !l.lines.is_empty()).map(|l| json!({
            "место": l.name,
            "id": l.id,
            "состав": l.lines.iter().map(|h| format!("{} [{}] ×{}", h.name, h.asset_id, h.quantity)).collect::<Vec<_>>(),
        })).collect::<Vec<_>>(),
        "карточки_базы": kb_index(session),
        "цели_активные": session.active_goals().into_iter().map(goal_json).collect::<Vec<_>>(),
        "опыт": xp_context(session),
        "записи_базы_знаний": {
            "записи_игроку_последние": for_player[player_from..].iter().map(|n| note_json(session, n)).collect::<Vec<_>>(),
            "всего_записей_игроку": for_player.len(),
            "журнал_мастера_последние": journal[recent..].iter().map(|n| note_json(session, n)).collect::<Vec<_>>(),
            "всего_в_журнале": journal.len(),
        },
        "таймеры": timers,
    })
}

/// Поля листа, меняющиеся в игре: они идут в снимок сцены, остальное — в блок «ЛИСТЫ ОТРЯДА».
const SHEET_NOW: &[&str] = &["состояния", "истощение", "кости_хитов", "ресурсы", "инвентарь"];
/// Поля книги заклинаний, меняющиеся в игре.
const MAGIC_NOW: &[&str] = &["ячейки", "от_черт_и_предметов", "свитки", "подготовка_открыта"];

/// Объект JSON → (постоянные поля, поля из `now`).
fn split_keys(value: Value, now: &[&str]) -> (Value, Value) {
    let Value::Object(map) = value else { return (value, Value::Null) };
    let (dynamic, fixed): (serde_json::Map<_, _>, serde_json::Map<_, _>) =
        map.into_iter().partition(|(k, _)| now.contains(&k.as_str()));
    (Value::Object(fixed), Value::Object(dynamic))
}

/// Блок «ЛИСТЫ ОТРЯДА»: постоянная часть листов и заклинаний всего отряда. Меняется только
/// при повышении уровня, новом спутнике, подготовке заклинаний или настройке предмета, —
/// поэтому кэшируется вместе с кодексом, а не перезаписывается со снимком каждой сцены.
fn party_sheets(session: &Session, short: bool) -> String {
    let sheets: serde_json::Map<_, _> = session
        .party()
        .iter()
        .map(|c| (c.id.clone(), split_keys(sheet_context(c, short), SHEET_NOW).0))
        .collect();
    let magic: serde_json::Map<_, _> = session
        .party()
        .iter()
        .filter_map(|c| {
            Some((c.id.clone(), split_keys(magic_context(&c.spellbook()?), MAGIC_NOW).0))
        })
        .collect();
    let body = json!({ "листы": sheets, "магия": magic });
    format!(
        "\nЛИСТЫ ОТРЯДА (постоянная часть; текущее — «листы_сейчас», «магия_сейчас» в снимке и [СЦЕНА]):\n{}\n",
        serde_json::to_string(&body).unwrap_or_default()
    )
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
    format!("{base}{PROTOCOL}\nШПАРГАЛКА КОМАНД\n{CHEAT_SHEET}\n")
}

/// Снимок сцены с хроникой — второй блок системного текста: собирается при смене сцены,
/// иначе берётся готовый. Кодекс в нём не хранится: он собирается каждый ход заново и не
/// меняется всю игру.
fn scene_system(session: &mut Session, short: bool) -> MasterMemo {
    let key = format!("{}{}", scene_key(session), if short { "|короткий лист" } else { "" });
    if let Some(memo) = session.master_memo().filter(|m| m.key == key) {
        return memo.clone();
    }
    let snapshot = serde_json::to_string(&snapshot(session, short)).unwrap_or_default();
    let system =
        format!("СНИМОК СЦЕНЫ (JSON):\n{snapshot}\n\nХРОНИКА:\n{}", chronicle_text(session));
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
        out.push("атака: броски и урон противников и спутников — из пула [[…]]; урон отряду — [[… > id]]");
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
            "задание: new_card player/goals (giver, reward, due_day, steps); подоплёка — note в журнал мастера",
        );
    }
    if has(&["иду", "едем", "идем", "отправля", "переход", "возвраща", "скачем", "плывем"])
    {
        out.push("перемещение: scene location (и time), спутники — move");
    }
    out
}

/// Сколько значений каждого куба движок кладёт в пул хода.
pub const POOL_PER_DIE: usize = 8;

/// Блок [СЦЕНА]: день, время, место и хиты отряда сейчас — всё, что меняется внутри сцены и
/// потому не входит в кэшируемый снимок.
fn scene_now_lines(session: &Session) -> Vec<String> {
    let scene = session.scene();
    let mut out = vec![format!(
        "День {}, {}; место — {}",
        scene.day,
        scene.time.as_deref().filter(|t| !t.trim().is_empty()).unwrap_or("время не указано"),
        scene.location
    )];
    let party: Vec<String> = session
        .party()
        .iter()
        .map(|c| {
            let hp = &c.hit_points;
            let temp = if hp.temporary > 0 {
                format!(" +{} врем.", hp.temporary)
            } else {
                String::new()
            };
            let away = if c.location == scene.location {
                String::new()
            } else {
                format!(", {}", c.location)
            };
            format!("{} [{}] хиты {}/{}{temp}{away}", c.name, c.id, hp.current, hp.max)
        })
        .collect();
    out.push(format!("отряд: {}", party.join("; ")));
    out
}

/// Последняя реплика игрока: сцена сейчас, изменения, напоминания, карточки по заявке, пул
/// кубов, подсказка, заявка.
fn turn_message(
    session: &Session,
    memo: &MasterMemo,
    player_text: &str,
    kb_extra: &str,
    two_step: bool,
    narration: &str,
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
    block(&mut out, "СЦЕНА", &scene_now_lines(session));
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
    let prep = session.start_prep_missing();
    if !prep.is_empty() {
        reminders.push(format!(
            "подготовка новой игры не завершена — запиши в этом ходу командами: {}",
            prep.join("; ")
        ));
    }
    if session.battle_unrewarded() {
        reminders.push(
            "бой окончен — оставь пометку опыта xp_note за противников: опыт по их опасности (ПО) по таблице \
из кодекса, поделённый на членов отряда; бегство и переговоры тоже засчитываются по замыслу сцены"
                .to_string(),
        );
    }
    if session.turns_since_time() >= TIME_REMINDER_TURNS {
        reminders.push(format!(
            "время сцены не менялось {} ходов — если события заняли время (дорога, бой, обыск, разговоры), \
обнови его командой scene; наступила ночь или новое утро — обнови и день",
            session.turns_since_time()
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
    // Старые записи игроку в снимок не входят — подходящие к заявке приходят сюда.
    let old_player: Vec<String> = session
        .notes_matching(player_text, NoteLayer::Player)
        .into_iter()
        .filter(|n| n.kind != NoteKind::Day)
        .take(TURN_JOURNAL_FOUND)
        .map(|n| format!("«{}» [запись {}, День {}]: {}", n.title, n.id, n.day, n.text))
        .collect();
    block(&mut out, "ЗАПИСИ ИГРОКУ ПО ЗАЯВКЕ", &old_player);
    block(&mut out, "КАРТОЧКИ ИГРЫ ПО ЗАЯВКЕ", &cards_matching(session, player_text));
    if !kb_extra.trim().is_empty() {
        out.push_str("[КАРТОЧКИ ПО ЗАЯВКЕ]\n");
        out.push_str(kb_extra.trim());
        out.push_str("\n\n");
    }
    if two_step {
        out.push_str(
            "[ДВУХШАГОВЫЙ ХОД]\nВ рассказе пиши только команды roll и query. Изменения состояния и записи \
движок соберёт по твоему рассказу отдельным шагом — поэтому называй в рассказе всё явно: урон и лечение \
числами, потраченное и полученное, кто куда ушёл, что герой узнал. Если ход ничего не изменил (чистый \
разговор, осмотр без находок), закончи ответ отдельной строкой «БЕЗ ИЗМЕНЕНИЙ» — игрок её не увидит, а \
движок пропустит второй шаг. Если изменилось хоть что-то, строку не пиши.\n\n",
        );
    }
    let pool = session.dice_pool().lines();
    if !pool.is_empty() {
        out.push_str("[ПУЛ КУБОВ]\n");
        for line in pool {
            out.push_str(&format!("{line}\n"));
        }
        out.push_str(
            "Выражения [[1d20+4]], [[1d8+2 > id]], [[1d20+3 ?]] — движок берёт кубы отсюда по порядку \
и подставляет итог.\n\n",
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
    // Живая сводка — у самого конца запроса: модель держит в голове последнее лучше всего.
    if !session.scene().now.trim().is_empty() {
        out.push_str(&format!("[СЕЙЧАС]\n{}\n\n", session.scene().now.trim()));
    }
    if let Some(rule) = narration_rule(narration) {
        out.push_str(&format!("[ДЛИНА РАССКАЗА]\n{rule}\n\n"));
    }
    out.push_str("[ЗАЯВКА ИГРОКА]\n");
    out.push_str(player_text);
    out
}

/// Длина рассказа из настроек игрока: "short", "long"; иначе — обычная (без указаний).
/// Ответ модели стоит в несколько раз дороже запроса, поэтому краткий рассказ — самая
/// заметная экономия.
fn narration_rule(narration: &str) -> Option<&'static str> {
    match narration {
        "short" => Some(
            "Кратко: 1–2 коротких абзаца, не больше 600–800 знаков. Только то, что произошло, и \
ответы NPC по делу; без описаний обстановки, которые игрок уже знает, и без пересказа его заявки. \
Записи в базу знаний — по 1–2 предложения. Броски, команды и блок «СЕЙЧАС» — как обычно.",
        ),
        "long" => Some(
            "Подробно: живое описание обстановки, звуков и деталей, реплики NPC целиком — до 5–6 абзацев.",
        ),
        _ => None,
    }
}

/// Созданные по ходу игры карточки, подходящие к заявке, с описанием.
fn cards_matching(session: &Session, query: &str) -> Vec<String> {
    let stems = query_stems(query);
    if stems.is_empty() {
        return Vec::new();
    }
    let mut scored: Vec<(usize, &CustomCard)> = session
        .custom_cards()
        .iter()
        .map(|c| {
            let title = matches(&stems, &format!("{} {}", c.title, c.subtitle)) * 3;
            (title + matches(&stems, &format!("{} {}", c.summary, c.text)), c)
        })
        .filter(|(score, _)| *score >= 3)
        .collect();
    scored.sort_by_key(|(score, _)| std::cmp::Reverse(*score));
    scored
        .into_iter()
        .take(TURN_CARDS_FOUND)
        .map(|(_, c)| {
            let facts: Vec<String> =
                c.facts.iter().map(|f| format!("{}: {}", f.label, f.value)).collect();
            let text: String = c.text.chars().take(1200).collect();
            format!("{}. {} {}", card_line(c), facts.join("; "), text).trim().to_string()
        })
        .collect()
}

/// Запрос мастеру на ход: системный текст сцены и последняя реплика игрока.
pub fn master_request(
    session: &mut Session,
    player_text: &str,
    kb_extra: &str,
    two_step: bool,
    short_sheet: bool,
) -> MasterRequest {
    master_request_narrated(session, player_text, kb_extra, two_step, short_sheet, "")
}

/// То же с длиной рассказа из настроек игрока ("short", "normal", "long").
pub fn master_request_narrated(
    session: &mut Session,
    player_text: &str,
    kb_extra: &str,
    two_step: bool,
    short_sheet: bool,
    narration: &str,
) -> MasterRequest {
    let memo = scene_system(session, short_sheet);
    session.deal_dice_pool(POOL_PER_DIE);
    let turn = turn_message(session, &memo, player_text, kb_extra, two_step, narration);
    let fixed = format!("{}{}", codex(session), party_sheets(session, short_sheet));
    MasterRequest::new(vec![fixed, memo.system], turn)
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
                json!({ "кто": c.name, "лист": sheet_context(c, false), "хиты": format!("{}/{}", c.hit_points.current, c.hit_points.max), "кд": c.armor_class })
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
    let custom: Vec<String> = session.custom_cards().iter().map(card_line).collect();
    // Не всё оглавление: только карточки, подходящие по словам к заявке, рассказу и
    // командам мастера, — остальные второму шагу не нужны.
    let index = relevant_index(session, &format!("{player_text}\n{narration}\n{written}"));
    let goals = serde_json::to_string(
        &session.active_goals().into_iter().map(goal_json).collect::<Vec<_>>(),
    )
    .unwrap_or_default();
    let recent: Vec<String> = session
        .notes()
        .iter()
        .rev()
        .filter(|n| n.kind != NoteKind::Day)
        .take(12)
        .map(|n| format!("[запись {}] День {} «{}»", n.id, n.day, n.title))
        .collect();
    let scene = session.scene();
    let mut reminders = Vec::new();
    for day in session.chronicle_missing() {
        reminders.push(format!("нет пересказа Дня {day} — добавь chronicle"));
    }
    if session.turns_since_chronicle() + 1 >= CHRONICLE_REMINDER_TURNS {
        reminders.push(format!("обнови пересказ текущего Дня {} (chronicle)", scene.day));
    }
    let prep = session.start_prep_missing();
    if !prep.is_empty() {
        reminders.push(format!("подготовка новой игры: {}", prep.join("; ")));
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
- задание, поручение или цель, которую герой принял: {{"cmd":"new_card","layer":"player","section":"goals","title":"...","summary":"что сделать","giver":"кто поручил","reward":"...","due_day":N,"steps":["...","..."]}} — отдельная карточка цели, не просто note.
- опыт: за бой, найденное, успешную проверку с последствиями, важное решение — {{"cmd":"xp_note","text":"за что","xp":N}} (N — оценка на каждого по таблице опыта правил). Начисление — только когда рассказ закрыл день, отряд отдыхает или игрок попросил: {{"cmd":"xp","each":N,"reason":"..."}}.
- ход активной цели (см. «Активные цели героя»): {{"cmd":"goal","card":"id цели","step_done":1,"log":"что продвинулось"}}; "add_step":"..."; итог — "status":"done" или "failed". Если рассказ продвинул или закрыл цель — команда goal обязательна.

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
Карточки базы, подходящие к ходу (id для "card" бери только отсюда или из «Карточек, созданных по ходу игры»): {}
Активные цели героя: {}
Последние записи (не повторяй их): {}
Журнал движка: {}
{}"#,
        scene.day,
        scene.time.clone().unwrap_or_default(),
        scene.location,
        party.join("\n"),
        places.join("\n"),
        if custom.is_empty() { "нет".to_string() } else { custom.join("; ") },
        if index.is_empty() { "нет".to_string() } else { index.join("; ") },
        goals,
        if recent.is_empty() { "нет".to_string() } else { recent.join("; ") },
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
    MasterRequest::new(vec![system], turn)
}

/// Сколько карточек оглавления получает второй шаг.
const UPDATE_CARDS: usize = 12;

/// Карточки базы, подходящие к тексту хода: упомянутые по id или подходящие по словам
/// названия; строкой «название [id] — статус».
fn relevant_index(session: &Session, text: &str) -> Vec<String> {
    let stems = query_stems(text);
    let mut scored: Vec<(usize, String)> = session
        .kb_cards()
        .iter()
        .filter_map(|c| {
            let by_id = text.contains(c.id.as_str());
            let score = if by_id { 100 } else { matches(&stems, &c.title) };
            (score > 0).then(|| {
                let status = session
                    .kb_overrides()
                    .iter()
                    .find(|o| o.card_id == c.id)
                    .map(|o| o.status.clone())
                    .or_else(|| c.status.clone())
                    .map(|st| format!(" — {}", crate::status_label(&st)))
                    .unwrap_or_default();
                (score, format!("«{}» [{}]{status}", c.title, c.id))
            })
        })
        .collect();
    scored.sort_by_key(|(score, _)| std::cmp::Reverse(*score));
    scored.into_iter().take(UPDATE_CARDS).map(|(_, line)| line).collect()
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

/// Опыт отряда для снимка сцены: уровень, опыт и порог; пометки журнала опыта.
fn xp_context(session: &Session) -> Value {
    let xp = session.xp_status();
    json!({
        "отряд": xp.members.iter().map(|m| format!(
            "{} — {} ур., опыт {}{}{}",
            m.name,
            m.level,
            m.xp,
            m.xp_next.map(|t| format!(" из {t}")).unwrap_or_default(),
            if m.ready { " (порог пройден — повышение на длительном отдыхе)" } else { "" },
        )).collect::<Vec<_>>(),
        "пометки": xp.notes.iter().map(|n| format!("День {}: {} ({})", n.day, n.text, n.xp)).collect::<Vec<_>>(),
        "оценка_по_пометкам_каждому": xp.pending,
    })
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
        let first = master_request(&mut s, "Осматриваюсь", "", false, false);
        let id = s.party()[0].id.clone();
        crate::apply_directives(
            &mut s,
            &format!("```engine\n{{\"cmd\":\"hp\",\"character\":\"{id}\",\"damage\":3}}\n```"),
        );
        let second = master_request(&mut s, "Иду дальше", "", false, false);
        assert_eq!(first.system, second.system);
        assert!(second.turn.contains("ИЗМЕНЕНИЯ С НАЧАЛА СЦЕНЫ"));
        assert!(second.turn.contains("хиты"), "{}", second.turn);
        assert!(second.turn.ends_with("Иду дальше"));
    }

    #[test]
    fn codex_block_survives_scene_change_and_time_stays_in_turn() {
        let mut s = session();
        let first = master_request(&mut s, "Осматриваюсь", "", false, false);
        assert_eq!(first.system_parts.len(), 2);
        assert!(first.system_parts[0].contains("ШПАРГАЛКА КОМАНД"));
        assert!(!first.turn.contains("[ШПАРГАЛКА]"));
        assert!(first.turn.contains("[СЦЕНА]\n- День "), "{}", first.turn);
        assert!(first.turn.contains("[ПУЛ КУБОВ]\nd20: "), "{}", first.turn);
        // Смена времени суток — не новая сцена: системный текст тот же, время — в ходе.
        crate::apply_directives(
            &mut s,
            "```engine\n{\"cmd\":\"scene\",\"time\":\"глубокая ночь\"}\n```",
        );
        let night = master_request(&mut s, "Жду", "", false, false);
        assert_eq!(first.system, night.system);
        assert!(night.turn.contains("глубокая ночь"));
        // Новый день — новый снимок, но блок кодекса не меняется.
        let day = s.scene().day + 1;
        crate::apply_directives(
            &mut s,
            &format!("```engine\n{{\"cmd\":\"scene\",\"day\":{day},\"time\":\"утро\"}}\n```"),
        );
        let next = master_request(&mut s, "Утро", "", false, false);
        assert_ne!(first.system_parts[1], next.system_parts[1]);
        assert_eq!(first.system_parts[0], next.system_parts[0]);
    }

    #[test]
    fn party_sheets_are_cached_with_codex_and_scene_notes_shrink() {
        let mut s = session();
        let first = master_request_narrated(&mut s, "Осматриваюсь", "", false, false, "short");
        assert!(first.system_parts[0].contains("ЛИСТЫ ОТРЯДА"));
        assert!(first.system_parts[0].contains("спасброски"));
        assert!(!first.system_parts[1].contains("спасброски"));
        assert!(first.system_parts[1].contains("листы_сейчас"));
        assert!(first.turn.contains("[ДЛИНА РАССКАЗА]\nКратко"), "{}", first.turn);
        // Урон и записи меняют текущее, но не блок кодекса с листами.
        let mut cmds = String::from("{\"cmd\":\"hp\",\"character\":\"pc.nikis\",\"damage\":3}");
        for i in 1..=6 {
            cmds.push_str(&format!(
                "\n{{\"cmd\":\"note\",\"title\":\"Улика {i}\",\"text\":\"длинный текст улики номер {i}\"}}"
            ));
        }
        crate::apply_directives(&mut s, &format!("```engine\n{cmds}\n```"));
        let next = master_request_narrated(&mut s, "Дальше", "", false, false, "normal");
        assert_eq!(first.system_parts[0], next.system_parts[0]);
        assert!(!next.turn.contains("[ДЛИНА РАССКАЗА]"));
        // Последние записи сцены — полным текстом, ранние — заголовком.
        assert!(next.turn.contains("длинный текст улики номер 6"), "{}", next.turn);
        assert!(next.turn.contains("длинный текст улики номер 3"));
        assert!(!next.turn.contains("длинный текст улики номер 2"));
        assert!(next.turn.contains("«Улика 1» — текст: query notes"));
    }

    #[test]
    fn rooms_of_one_place_share_the_scene() {
        let mut s = session();
        let card = |id: &str, title: &str, parent: Option<&str>| dnd_engine::KbCard {
            id: id.into(),
            title: title.into(),
            layer: "world".into(),
            status: None,
            summary: String::new(),
            text: String::new(),
            parent: parent.map(Into::into),
        };
        s.set_kb_cards(vec![
            card("loc.inn", "Таверна «Бочка»", None),
            card("loc.inn.cellar", "Подвал таверны", Some("loc.inn")),
            card("loc.port", "Порт", None),
        ]);
        let all: Vec<String> = s.party().iter().map(|c| c.id.clone()).collect();
        let go = |s: &mut Session, place: &str| {
            let mut cmds = format!("{{\"cmd\":\"scene\",\"location\":\"{place}\"}}");
            for id in &all {
                cmds.push_str(&format!(
                    "\n{{\"cmd\":\"move\",\"character\":\"{id}\",\"location\":\"{place}\"}}"
                ));
            }
            crate::apply_directives(s, &format!("```engine\n{cmds}\n```"));
        };
        go(&mut s, "Таверна «Бочка»");
        let inn = master_request(&mut s, "x", "", false, false);
        go(&mut s, "Подвал таверны");
        let cellar = master_request(&mut s, "x", "", false, false);
        assert_eq!(inn.system, cellar.system);
        assert!(cellar.turn.contains("место — Подвал таверны"), "{}", cellar.turn);
        go(&mut s, "Порт");
        assert_ne!(inn.system, master_request(&mut s, "x", "", false, false).system);
    }

    #[test]
    fn rest_starts_a_new_scene() {
        let mut s = session();
        master_request(&mut s, "x", "", false, false);
        let id = s.party()[0].id.clone();
        crate::apply_directives(
            &mut s,
            &format!("```engine\n{{\"cmd\":\"hp\",\"character\":\"{id}\",\"damage\":2}}\n```"),
        );
        assert!(!master_request(&mut s, "x", "", false, false).turn.contains("- нет\n"));
        // Отдых — новая сцена: снимок собирается заново, изменений с её начала нет.
        crate::apply_directives(&mut s, "```engine\n{\"cmd\":\"rest\",\"kind\":\"short\"}\n```");
        let after = master_request(&mut s, "x", "", false, false);
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
        let req = master_request(&mut s, "x", "", false, false);
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
    fn new_cards_and_goal_progress_reach_the_master_within_the_scene() {
        let mut s = session();
        master_request(&mut s, "x", "", false, false);
        let turn = crate::apply_directives(
            &mut s,
            "```engine\n{\"cmd\":\"new_card\",\"layer\":\"player\",\"section\":\"goals\",\"title\":\"Найти курьера\",\"summary\":\"Пропал у доков\",\"giver\":\"Хольм\",\"steps\":[\"Расспросить докеров\"]}\n```",
        );
        assert!(turn.actions.iter().all(|a| a.ok), "{:?}", turn.actions);
        let id = s.custom_cards()[0].id.clone();
        let req = master_request(&mut s, "x", "", false, false);
        assert!(
            req.turn.contains(&format!("Новая карточка: «Найти курьера» [{id}]")),
            "{}",
            req.turn
        );
        let turn = crate::apply_directives(
            &mut s,
            &format!("```engine\n{{\"cmd\":\"goal\",\"card\":\"{id}\",\"step_done\":1,\"log\":\"Докеры видели его\"}}\n```"),
        );
        assert!(turn.actions.iter().all(|a| a.ok), "{:?}", turn.actions);
        let req = master_request(&mut s, "Что с курьером?", "", false, false);
        assert!(req.turn.contains("шаги 1/1"), "{}", req.turn);
        assert!(req.turn.contains("[КАРТОЧКИ ИГРЫ ПО ЗАЯВКЕ]"), "{}", req.turn);
        // Новая сцена: цель уже в снимке.
        crate::apply_directives(&mut s, "```engine\n{\"cmd\":\"rest\",\"kind\":\"short\"}\n```");
        assert!(master_request(&mut s, "x", "", false, false).system.contains("цели_активные"));
        let update = update_request(&s, "x", "y", "");
        assert!(update.system.contains("Найти курьера"));
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
