//! Команды движка в ответе мастера.
//!
//! ИИ-мастер дописывает в конец ответа блок
//!
//! ````text
//! ```engine
//! {"cmd":"cast","character":"npc.valeria","spell":"bless","slot":1}
//! ```
//! ````
//!
//! Блок вырезается из текста, команды выполняет движок (с полной проверкой правил), а
//! итог каждой — успех или причина отказа — показывается в чате и попадает в журнал
//! движка, который мастер видит на следующем ходу.

use dnd_engine::{
    all_spells, AssetKind, CardDraft, CardFact, CastMethod, CastRequest, Character, HpChange, Mood,
    NewNote, NoteEdit, NoteKind, NoteLayer, RestKind, SceneChange, Session, SheetEdit, SlotRef,
};
use serde::Serialize;
use serde_json::Value;

const FENCE: &str = "```";
const TAG: &str = "engine";

/// Итог одной команды.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct MasterAction {
    pub ok: bool,
    pub summary: String,
}

/// Ответ мастера после выполнения команд.
#[derive(Debug, Clone, PartialEq, Eq, Serialize)]
pub struct MasterTurn {
    /// Текст для игрока, без блоков команд.
    pub text: String,
    pub actions: Vec<MasterAction>,
    /// Броски d20 в тексте, которых движок не делал (заполняет вызывающий код).
    pub fabricated: Vec<String>,
}

/// Делит текст на повествование и содержимое блоков `engine`. Незакрытый блок (ответ ещё
/// печатается) тоже вырезается.
pub(crate) fn split(text: &str) -> (String, Vec<String>) {
    let mut prose = String::new();
    let mut blocks = Vec::new();
    let mut rest = text;
    loop {
        let Some(start) = find_open(rest) else {
            prose.push_str(rest);
            break;
        };
        prose.push_str(&rest[..start]);
        let after_open = &rest[start + FENCE.len() + TAG.len()..];
        match after_open.find(FENCE) {
            Some(end) => {
                blocks.push(after_open[..end].to_string());
                rest = &after_open[end + FENCE.len()..];
            }
            None => {
                blocks.push(after_open.to_string());
                break;
            }
        }
    }
    (prose.trim().to_string(), blocks)
}

/// Начало блока ```` ```engine ````.
fn find_open(text: &str) -> Option<usize> {
    let mut from = 0;
    while let Some(i) = text[from..].find(FENCE) {
        let at = from + i;
        if text[at + FENCE.len()..].starts_with(TAG) {
            return Some(at);
        }
        from = at + FENCE.len();
    }
    None
}

/// Текст без блоков команд (для показа ответа, пока он печатается).
pub fn strip_directives(text: &str) -> String {
    split(text).0
}

/// Команды блока: JSON-объект на строку или JSON-массив целиком.
pub(crate) fn commands(block: &str) -> Vec<Result<Value, String>> {
    let trimmed = block.trim();
    if trimmed.is_empty() {
        return Vec::new();
    }
    if let Ok(Value::Array(items)) = serde_json::from_str::<Value>(trimmed) {
        return items.into_iter().map(Ok).collect();
    }
    if let Ok(value) = serde_json::from_str::<Value>(trimmed) {
        return vec![Ok(value)];
    }
    trimmed
        .lines()
        .map(str::trim)
        .filter(|l| !l.is_empty())
        .map(|l| serde_json::from_str::<Value>(l).map_err(|_| format!("не JSON: {l}")))
        .collect()
}

fn text_field<'a>(cmd: &'a Value, key: &str) -> Result<&'a str, String> {
    cmd.get(key)
        .and_then(Value::as_str)
        .map(str::trim)
        .filter(|s| !s.is_empty())
        .ok_or_else(|| format!("нет поля «{key}»"))
}

/// Персонаж по ID, по ID без префикса («valeria») или по части имени.
fn find_character(session: &Session, key: &str) -> Result<String, String> {
    let key_lower = key.to_lowercase();
    let party = session.party();
    let matches = |c: &&Character| {
        c.id == key
            || c.id.rsplit('.').next() == Some(key)
            || c.name.to_lowercase().contains(&key_lower)
    };
    party
        .iter()
        .find(|c| c.id == key)
        .or_else(|| party.iter().find(matches))
        .map(|c| c.id.clone())
        .ok_or_else(|| format!("в отряде нет персонажа «{key}»"))
}

/// Заклинание по ID или по русскому названию.
fn find_spell(key: &str) -> String {
    let lower = key.to_lowercase();
    all_spells()
        .iter()
        .find(|s| s.id == key || s.name.to_lowercase() == lower)
        .map_or_else(|| key.to_string(), |s| s.id.to_string())
}

fn slot_ref(value: Option<&Value>) -> Result<Option<SlotRef>, String> {
    match value {
        None | Some(Value::Null) => Ok(None),
        Some(Value::String(s)) if s == "pact" => Ok(Some(SlotRef::Pact)),
        Some(v) => v
            .as_u64()
            .or_else(|| v.as_str().and_then(|s| s.parse().ok()))
            .and_then(|n| u8::try_from(n).ok())
            .map(|n| Some(SlotRef::Level(n)))
            .ok_or_else(|| format!("неверный круг ячейки: {v}")),
    }
}

fn method(value: Option<&Value>) -> Result<Option<CastMethod>, String> {
    let Some(name) = value.and_then(Value::as_str) else {
        return Ok(None);
    };
    Ok(Some(match name {
        "slot" => CastMethod::Slot,
        "pact" => CastMethod::Pact,
        "ritual" => CastMethod::Ritual,
        "scroll" => CastMethod::Scroll,
        "granted" => CastMethod::Granted,
        "cantrip" => CastMethod::Cantrip,
        other => return Err(format!("неизвестный способ «{other}»")),
    }))
}

fn int_field(cmd: &Value, key: &str) -> Option<i64> {
    cmd.get(key).and_then(|v| v.as_i64().or_else(|| v.as_str().and_then(|s| s.trim().parse().ok())))
}

fn opt_text<'a>(cmd: &'a Value, key: &str) -> Option<&'a str> {
    cmd.get(key).and_then(Value::as_str).map(str::trim).filter(|s| !s.is_empty())
}

fn positive(cmd: &Value, key: &str) -> Result<Option<u32>, String> {
    match int_field(cmd, key) {
        None => Ok(None),
        Some(n) if n > 0 => {
            u32::try_from(n).map(Some).map_err(|_| format!("«{key}» слишком велико"))
        }
        Some(n) => Err(format!("«{key}» должно быть больше нуля, а не {n}")),
    }
}

fn engine<T>(result: Result<T, dnd_engine::EngineError>) -> Result<T, String> {
    result.map_err(|e| e.to_string())
}

fn last_log(session: &Session) -> String {
    session.engine_log().last().cloned().unwrap_or_default()
}

/// Команды без персонажа: казна, сцена, отдых, записи в базу знаний.
fn run_global(session: &mut Session, name: &str, cmd: &Value) -> Option<Result<String, String>> {
    let result = match name {
        "treasury" => (|| -> Result<String, String> {
            let quantity = int_field(cmd, "quantity").ok_or("нет поля «quantity»")?;
            let reason = opt_text(cmd, "reason").unwrap_or("Без пояснения");
            engine(session.master_treasury_entry(
                text_field(cmd, "asset")?,
                text_field(cmd, "location")?,
                quantity,
                reason,
            ))?;
            Ok(last_log(session))
        })(),
        "transfer" => (|| -> Result<String, String> {
            let quantity = int_field(cmd, "quantity").ok_or("нет поля «quantity»")?;
            let reason = opt_text(cmd, "reason").unwrap_or("Перемещение");
            engine(session.master_treasury_transfer(
                text_field(cmd, "asset")?,
                quantity,
                text_field(cmd, "from")?,
                text_field(cmd, "to")?,
                reason,
            ))?;
            Ok(last_log(session))
        })(),
        "new_asset" => (|| -> Result<String, String> {
            let kind = match opt_text(cmd, "kind").unwrap_or("valuable") {
                "coin" => AssetKind::Coin,
                "gem" => AssetKind::Gem,
                "ingot" => AssetKind::Ingot,
                "note" => AssetKind::Note,
                "valuable" => AssetKind::Valuable,
                other => return Err(format!("неизвестный вид ценности «{other}»")),
            };
            let value = int_field(cmd, "value").unwrap_or(0).max(0);
            let id = engine(session.master_new_asset(text_field(cmd, "name")?, kind, value))?;
            Ok(format!("{} [id: {id}]", last_log(session)))
        })(),
        "scene" => (|| -> Result<String, String> {
            let day = match int_field(cmd, "day") {
                Some(d) => Some(u32::try_from(d).map_err(|_| format!("неверный день {d}"))?),
                None => None,
            };
            let change = SceneChange {
                day,
                time: opt_text(cmd, "time").map(Into::into),
                location: opt_text(cmd, "location").map(Into::into),
                situation: opt_text(cmd, "situation").map(Into::into),
                mood: match opt_text(cmd, "mood") {
                    Some(m) => Some(
                        Mood::parse(m).ok_or_else(|| format!("неизвестное настроение «{m}»"))?,
                    ),
                    None => None,
                },
            };
            engine(session.change_scene(change))?;
            Ok(last_log(session))
        })(),
        "roll" => {
            Err("лимит бросков за ход исчерпан — броски запрашивай отдельным ответом до рассказа"
                .into())
        }
        "rest" => (|| -> Result<String, String> {
            let kind = match opt_text(cmd, "kind").unwrap_or("long") {
                "short" => RestKind::Short,
                "long" => RestKind::Long,
                other => return Err(format!("неизвестный отдых «{other}»")),
            };
            let lines = session.master_rest(kind);
            let mut text = last_log(session);
            if !lines.is_empty() {
                text.push_str(": ");
                text.push_str(&lines.join("; "));
            }
            Ok(text)
        })(),
        "note" => (|| -> Result<String, String> {
            let layer = match opt_text(cmd, "layer") {
                None => None,
                Some("player") => Some(NoteLayer::Player),
                Some("master") => Some(NoteLayer::Master),
                Some(other) => return Err(format!("неизвестный слой «{other}»")),
            };
            let kind = match opt_text(cmd, "kind") {
                None => None,
                Some(k) => Some(NoteKind::parse(k).ok_or_else(|| {
                    format!("неизвестный вид записи «{k}»: event, secret, plan, timer")
                })?),
            };
            let due_day = match int_field(cmd, "due_day") {
                Some(d) => Some(u32::try_from(d).map_err(|_| format!("неверный день {d}"))?),
                None => None,
            };
            if let Some(id) = int_field(cmd, "id") {
                let id = u64::try_from(id).map_err(|_| format!("неверный номер записи {id}"))?;
                if cmd.get("delete").and_then(Value::as_bool).unwrap_or(false) {
                    engine(session.delete_note(id))?;
                } else {
                    let field =
                        |key: &str| cmd.get(key).and_then(Value::as_str).map(str::to_string);
                    let edit = NoteEdit {
                        title: field("title"),
                        text: field("text"),
                        card: field("card"),
                        layer,
                        kind,
                        due_day: due_day.map(Some),
                        done: cmd.get("done").and_then(Value::as_bool),
                    };
                    engine(session.update_note(id, edit))?;
                }
                return Ok(last_log(session));
            }
            let title = opt_text(cmd, "title").unwrap_or("");
            let text = opt_text(cmd, "text").unwrap_or("");
            let layer = layer.unwrap_or(NoteLayer::Player);
            engine(session.create_note(NewNote {
                card: opt_text(cmd, "card").map(Into::into),
                kind: kind.unwrap_or_default(),
                due_day,
                ..NewNote::new(layer, title, text)
            }))?;
            Ok(last_log(session))
        })(),
        "new_card" | "edit_card" | "delete_card" => (|| -> Result<String, String> {
            if name == "delete_card" {
                engine(session.delete_card(text_field(cmd, "card")?))?;
                return Ok(last_log(session));
            }
            let field = |key: &str| cmd.get(key).and_then(Value::as_str).map(str::to_string);
            let facts = cmd.get("facts").and_then(Value::as_object).map(|m| {
                m.iter()
                    .map(|(label, v)| CardFact {
                        label: label.clone(),
                        value: v.as_str().map_or_else(|| v.to_string(), str::to_string),
                    })
                    .collect()
            });
            let draft = CardDraft {
                layer: field("layer"),
                section: field("section"),
                title: field("title"),
                subtitle: field("subtitle"),
                summary: field("summary"),
                facts,
                status: field("status"),
            };
            if name == "new_card" {
                engine(session.create_card(draft, false))?;
            } else {
                engine(session.update_card(text_field(cmd, "card")?, draft))?;
            }
            Ok(last_log(session))
        })(),
        "card" => (|| -> Result<String, String> {
            let card = text_field(cmd, "card")?;
            let status = text_field(cmd, "status")?;
            let status = if status == "reset" { None } else { Some(status) };
            engine(session.set_card_status(card, status, opt_text(cmd, "note").unwrap_or("")))?;
            Ok(last_log(session))
        })(),
        _ => return None,
    };
    Some(result)
}

fn run(session: &mut Session, cmd: &Value) -> Result<String, String> {
    let name = text_field(cmd, "cmd")?;
    if let Some(result) = run_global(session, name, cmd) {
        return result;
    }
    let character = find_character(session, text_field(cmd, "character")?)?;
    match name {
        "cast" => {
            let spell = find_spell(text_field(cmd, "spell")?);
            let mut request = CastRequest::new(&spell);
            request.method = method(cmd.get("method"))?;
            match slot_ref(cmd.get("slot"))? {
                Some(SlotRef::Pact) => {
                    request.method.get_or_insert(CastMethod::Pact);
                }
                Some(SlotRef::Level(l)) => request.slot_level = Some(l),
                None => {}
            }
            session.cast_spell(&character, &request).map(|o| o.summary).map_err(|e| e.to_string())
        }
        "slot" => {
            let slot = slot_ref(cmd.get("level"))?.ok_or("нет поля «level»")?;
            let spend = cmd.get("spend").and_then(Value::as_bool).unwrap_or(true);
            session.change_slot(&character, slot, spend).map_err(|e| e.to_string())?;
            Ok(last_log(session))
        }
        "restore" => {
            let item = text_field(cmd, "item")?;
            let slot = slot_ref(cmd.get("level"))?.ok_or("нет поля «level»")?;
            session
                .restore_slot_with(&character, item, slot)
                .map(|o| o.summary)
                .map_err(|e| e.to_string())
        }
        "prepare" => {
            let caster = text_field(cmd, "caster")?;
            let spells: Vec<String> = cmd
                .get("spells")
                .and_then(Value::as_array)
                .ok_or("нет списка «spells»")?
                .iter()
                .filter_map(Value::as_str)
                .map(find_spell)
                .collect();
            session.prepare_spells(&character, caster, &spells).map_err(|e| e.to_string())?;
            Ok(last_log(session))
        }
        "hp" => {
            let change = if let Some(n) = positive(cmd, "damage")? {
                HpChange::Damage(n)
            } else if let Some(n) = positive(cmd, "heal")? {
                HpChange::Heal(n)
            } else if let Some(n) = positive(cmd, "temp")? {
                HpChange::Temporary(n)
            } else {
                return Err("нужно поле «damage», «heal» или «temp»".into());
            };
            engine(session.change_hp(&character, change))?;
            Ok(last_log(session))
        }
        "resource" => {
            let delta = int_field(cmd, "delta").ok_or("нет поля «delta»")?;
            let delta = i32::try_from(delta).map_err(|_| format!("неверное «delta» {delta}"))?;
            engine(session.adjust_resource(&character, text_field(cmd, "resource")?, delta))?;
            Ok(last_log(session))
        }
        "condition" => {
            if let Some(c) = opt_text(cmd, "add") {
                engine(session.set_condition(&character, c, true))?;
            } else if let Some(c) = opt_text(cmd, "remove") {
                engine(session.set_condition(&character, c, false))?;
            } else {
                return Err("нужно поле «add» или «remove»".into());
            }
            Ok(last_log(session))
        }
        "item" => {
            let quantity = positive(cmd, "quantity")?;
            if let Some(item) = opt_text(cmd, "add") {
                engine(session.add_item(
                    &character,
                    item,
                    quantity.unwrap_or(1),
                    opt_text(cmd, "container"),
                    opt_text(cmd, "category").unwrap_or(""),
                    opt_text(cmd, "notes").unwrap_or(""),
                ))?;
            } else if let Some(item) = opt_text(cmd, "remove") {
                engine(session.remove_item(&character, item, quantity.unwrap_or(1)))?;
            } else if let Some(item) = opt_text(cmd, "move") {
                let to = text_field(cmd, "to")?;
                engine(session.move_item(&character, item, quantity.unwrap_or(0), to))?;
            } else {
                return Err("нужно поле «add», «remove» или «move»".into());
            }
            Ok(last_log(session))
        }
        "move" => {
            engine(session.move_character(&character, text_field(cmd, "location")?))?;
            Ok(last_log(session))
        }
        "propose_sheet" => {
            let edit: SheetEdit =
                serde_json::from_value(cmd.get("edit").cloned().ok_or("нет поля «edit»")?)
                    .map_err(|e| format!("неверная правка листа: {e}"))?;
            engine(session.propose_sheet_edit(
                &character,
                edit,
                opt_text(cmd, "reason").unwrap_or(""),
            ))?;
            Ok(last_log(session))
        }
        other => Err(format!("неизвестная команда «{other}»")),
    }
}

/// Выполняет команды из ответа мастера и возвращает текст без них с итогами команд.
///
/// Перед командами снимается точка отмены: весь ход мастера можно откатить одной кнопкой.
pub fn apply_directives(session: &mut Session, reply: &str) -> MasterTurn {
    let (text, blocks) = split(reply);
    let before = session.checkpoint();
    let mut actions = Vec::new();
    for block in blocks {
        for cmd in commands(&block) {
            let result = cmd.and_then(|cmd| run(session, &cmd));
            actions.push(match result {
                Ok(summary) => MasterAction { ok: true, summary },
                Err(reason) => {
                    // Ошибки самого движка уже записаны в журнал; ошибки формата — нет.
                    if session.engine_log().last().is_none_or(|l| !l.contains(&reason)) {
                        session.log(format!("Отказ (команда мастера): {reason}"));
                    }
                    MasterAction { ok: false, summary: reason }
                }
            });
        }
    }
    let summaries = actions.iter().filter(|a| a.ok).map(|a| a.summary.clone()).collect();
    session.commit_master_turn(before, summaries);
    MasterTurn { text, actions, fabricated: Vec::new() }
}

#[cfg(test)]
mod tests {
    use super::*;
    use dnd_engine::Xoshiro256;

    fn session() -> Session {
        Session::demo(Xoshiro256::from_seed(5))
    }

    #[test]
    fn blocks_are_cut_from_text() {
        let text = "Валерия поднимает символ.\n```engine\n{\"cmd\":\"cast\"}\n```\nКонец.";
        let (prose, blocks) = split(text);
        assert_eq!(prose, "Валерия поднимает символ.\n\nКонец.");
        assert_eq!(blocks.len(), 1);
        assert_eq!(strip_directives("Текст\n```engine\n{\"cmd\""), "Текст");
        assert_eq!(strip_directives("```rust\nlet x = 1;\n```"), "```rust\nlet x = 1;\n```");
    }

    #[test]
    fn cast_and_slot_commands_run_through_engine() {
        let mut s = session();
        let reply = "Свет.\n```engine\n{\"cmd\":\"cast\",\"character\":\"npc.valeria\",\"spell\":\"bless\",\"slot\":2}\n{\"cmd\":\"slot\",\"character\":\"gunther\",\"level\":1}\n{\"cmd\":\"cast\",\"character\":\"pc.nikis\",\"spell\":\"Туманный шаг\",\"slot\":\"pact\"}\n```";
        let turn = apply_directives(&mut s, reply);
        assert_eq!(turn.text, "Свет.");
        assert_eq!(turn.actions.len(), 3, "{:?}", turn.actions);
        assert!(turn.actions.iter().all(|a| a.ok), "{:?}", turn.actions);
        assert!(turn.actions[0].summary.contains("«Благословение» (2 круг)"));
        let valeria = s.character("npc.valeria").unwrap();
        assert_eq!(valeria.resource("slots.2").unwrap().current(), 2);
        let gunther = s.character("npc.gunther").unwrap();
        assert_eq!(gunther.resource("slots.1").unwrap().current(), 3);
        let nikis = s.character("pc.nikis").unwrap();
        assert_eq!(nikis.resource("pact.slots").unwrap().current(), 1);
    }

    #[test]
    fn scene_mood_is_set_by_master() {
        let mut s = session();
        let turn = apply_directives(&mut s, "Засада!\n```engine\n{\"cmd\":\"scene\",\"mood\":\"battle\"}\n{\"cmd\":\"scene\",\"mood\":\"party\"}\n```");
        assert!(turn.actions[0].ok, "{:?}", turn.actions);
        assert!(!turn.actions[1].ok);
        assert_eq!(s.scene().mood, Mood::Battle);
    }

    #[test]
    fn refusals_are_reported_and_logged() {
        let mut s = session();
        let reply = "```engine\n[{\"cmd\":\"cast\",\"character\":\"pc.nikis\",\"spell\":\"fireball\"},{\"cmd\":\"fly\",\"character\":\"pc.nikis\"},{\"cmd\":\"cast\",\"character\":\"Мордехай\",\"spell\":\"bless\"}]\n```";
        let turn = apply_directives(&mut s, reply);
        assert_eq!(turn.text, "");
        assert_eq!(turn.actions.len(), 3);
        assert!(turn.actions.iter().all(|a| !a.ok));
        assert!(turn.actions[0].summary.contains("Огненный шар"));
        assert!(turn.actions[1].summary.contains("неизвестная команда"));
        assert!(turn.actions[2].summary.contains("Мордехай"));
        assert_eq!(s.engine_log().len(), 3);
        assert!(s.engine_log().iter().all(|l| l.starts_with("Отказ")));
    }

    #[test]
    fn restore_and_prepare_commands() {
        let mut s = session();
        s.change_slot("pc.nikis", SlotRef::Pact, true).unwrap();
        let turn = apply_directives(
            &mut s,
            "```engine\n{\"cmd\":\"restore\",\"character\":\"pc.nikis\",\"item\":\"item.pact_rod.slot\",\"level\":\"pact\"}\n{\"cmd\":\"prepare\",\"character\":\"npc.valeria\",\"caster\":\"cleric\",\"spells\":[\"bless\"]}\n```",
        );
        assert!(turn.actions[0].ok, "{:?}", turn.actions[0]);
        assert!(!turn.actions[1].ok);
        assert!(turn.actions[1].summary.contains("длительного отдыха"));
    }

    #[test]
    fn state_commands_and_undo() {
        let mut s = session();
        let reply = concat!(
            "Удар.\n```engine\n",
            "{\"cmd\":\"hp\",\"character\":\"nikis\",\"damage\":12}\n",
            "{\"cmd\":\"resource\",\"character\":\"pc.nikis\",\"resource\":\"Везунчик\",\"delta\":-1}\n",
            "{\"cmd\":\"condition\",\"character\":\"corvus\",\"add\":\"Отравлен\"}\n",
            "{\"cmd\":\"item\",\"character\":\"pc.nikis\",\"add\":\"Печать Вернера\",\"container\":\"Кольцо Теневого\"}\n",
            "{\"cmd\":\"treasury\",\"asset\":\"gp\",\"location\":\"При себе\",\"quantity\":-50,\"reason\":\"Взятка\"}\n",
            "{\"cmd\":\"transfer\",\"asset\":\"gp\",\"quantity\":100,\"from\":\"crow_rock_vault\",\"to\":\"purse\"}\n",
            "{\"cmd\":\"scene\",\"time\":\"полдень\"}\n",
            "{\"cmd\":\"move\",\"character\":\"valeria\",\"location\":\"Серебряный Шпиль\"}\n",
            "{\"cmd\":\"note\",\"layer\":\"player\",\"title\":\"Пароль гати\",\"text\":\"Серый рассвет\"}\n",
            "{\"cmd\":\"hp\",\"character\":\"nikis\",\"damage\":0}\n",
            "```"
        );
        let turn = apply_directives(&mut s, reply);
        assert_eq!(turn.text, "Удар.");
        let ok: Vec<_> = turn.actions.iter().filter(|a| a.ok).collect();
        assert_eq!(ok.len(), 9, "{:?}", turn.actions);
        assert!(!turn.actions[9].ok);
        let nikis = s.character("pc.nikis").unwrap();
        assert_eq!(nikis.hit_points.current, 45);
        assert_eq!(nikis.hit_points.temporary, 0);
        assert_eq!(s.scene().time.as_deref(), Some("полдень"));
        assert_eq!(s.notes().len(), 1);
        let info = s.master_undo_info().unwrap();
        assert_eq!(info.actions.len(), 9);
        s.undo_master_turn().unwrap();
        let nikis = s.character("pc.nikis").unwrap();
        assert_eq!(nikis.hit_points.current, 49);
        assert!(s.notes().is_empty());
        assert_eq!(s.scene().time.as_deref(), Some("утро"));
    }

    #[test]
    fn rest_and_new_asset_commands() {
        let mut s = session();
        let turn = apply_directives(
            &mut s,
            "```engine\n{\"cmd\":\"new_asset\",\"name\":\"Изумруд\",\"kind\":\"gem\",\"value\":500}\n{\"cmd\":\"rest\",\"kind\":\"short\"}\n{\"cmd\":\"scene\",\"day\":3}\n```",
        );
        assert!(turn.actions[0].ok, "{:?}", turn.actions[0]);
        assert!(turn.actions[0].summary.contains("[id: new."));
        assert!(turn.actions[1].ok);
        assert!(!turn.actions[2].ok);
    }

    #[test]
    fn note_edit_delete_and_card_status() {
        let mut s = session();
        s.set_kb_cards(vec![dnd_engine::KbCard {
            id: "goal.astrolabe".into(),
            title: "Получить Княжескую Астролябию".into(),
            layer: "player".into(),
            status: Some("progress".into()),
        }]);
        let turn = apply_directives(
            &mut s,
            concat!(
                "```engine\n",
                "{\"cmd\":\"note\",\"title\":\"Астролябия\",\"text\":\"Готова к Дню 85\",\"card\":\"goal.astrolabe\"}\n",
                "{\"cmd\":\"note\",\"id\":1,\"text\":\"Готова раньше срока\"}\n",
                "{\"cmd\":\"card\",\"card\":\"goal.astrolabe\",\"status\":\"done\",\"note\":\"Получена\"}\n",
                "{\"cmd\":\"note\",\"id\":7,\"delete\":true}\n",
                "{\"cmd\":\"card\",\"card\":\"goal.nothing\",\"status\":\"done\"}\n",
                "```"
            ),
        );
        let ok: Vec<bool> = turn.actions.iter().map(|a| a.ok).collect();
        assert_eq!(ok, vec![true, true, true, false, false], "{:?}", turn.actions);
        assert_eq!(s.notes()[0].text, "Готова раньше срока");
        assert_eq!(s.notes()[0].card.as_deref(), Some("goal.astrolabe"));
        assert_eq!(s.kb_overrides()[0].status, "done");
        s.undo_master_turn().unwrap();
        assert!(s.notes().is_empty());
        assert!(s.kb_overrides().is_empty());
        let turn = apply_directives(&mut s, "```engine\n{\"cmd\":\"note\",\"title\":\"x\"}\n{\"cmd\":\"note\",\"id\":1,\"delete\":true}\n```");
        assert!(turn.actions.iter().all(|a| a.ok), "{:?}", turn.actions);
    }

    #[test]
    fn cards_timers_and_reminder() {
        let mut s = session();
        let turn = apply_directives(
            &mut s,
            concat!(
                "```engine\n",
                "{\"cmd\":\"new_card\",\"layer\":\"master\",\"section\":\"prisoners\",\"title\":\"Соглядатай у Шпиля\",\"summary\":\"Задержан Корвусом\",\"facts\":{\"Где\":\"казематы Шпиля\"},\"status\":\"prisoner\"}\n",
                "{\"cmd\":\"note\",\"layer\":\"master\",\"kind\":\"timer\",\"due_day\":83,\"title\":\"Хвост на тракте\",\"text\":\"Засада 2–3 всадника\",\"card\":\"Соглядатай у Шпиля\"}\n",
                "{\"cmd\":\"note\",\"layer\":\"master\",\"kind\":\"timer\",\"title\":\"без дня\"}\n",
                "```"
            ),
        );
        let ok: Vec<bool> = turn.actions.iter().map(|a| a.ok).collect();
        assert_eq!(ok, vec![true, true, false], "{:?}", turn.actions);
        assert_eq!(s.custom_cards()[0].facts[0].value, "казематы Шпиля");
        assert_eq!(s.turns_without_notes(), 0);
        for _ in 0..3 {
            apply_directives(&mut s, "Тишина.");
        }
        assert_eq!(s.turns_without_notes(), 3);
        let turn = apply_directives(
            &mut s,
            "```engine\n{\"cmd\":\"edit_card\",\"card\":\"dyn.соглядатай_у_шпиля\",\"status\":\"dead\"}\n{\"cmd\":\"note\",\"id\":1,\"done\":true}\n```",
        );
        assert!(turn.actions.iter().all(|a| a.ok), "{:?}", turn.actions);
        assert!(s.notes()[0].done);
    }

    #[test]
    fn sheet_proposals_wait_for_player() {
        let mut s = session();
        let turn = apply_directives(
            &mut s,
            "```engine\n{\"cmd\":\"propose_sheet\",\"character\":\"nikis\",\"edit\":{\"op\":\"proficiency\",\"kind\":\"Языки\",\"text\":\"Общий, Бездны\"},\"reason\":\"игрок назвал языки\"}\n{\"cmd\":\"propose_sheet\",\"character\":\"nikis\",\"edit\":{\"op\":\"fly\"}}\n```",
        );
        assert!(turn.actions[0].ok, "{:?}", turn.actions);
        assert!(!turn.actions[1].ok);
        assert_eq!(s.sheet_proposals().len(), 1);
        let id = s.sheet_proposals()[0].id;
        s.resolve_proposal(id, true).unwrap();
        assert!(s
            .character("pc.nikis")
            .unwrap()
            .profile
            .proficiencies
            .iter()
            .any(|l| l.text == "Общий, Бездны"));
    }
}
