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

use dnd_engine::{all_spells, CastMethod, CastRequest, Character, Session, SlotRef};
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
}

/// Делит текст на повествование и содержимое блоков `engine`. Незакрытый блок (ответ ещё
/// печатается) тоже вырезается.
fn split(text: &str) -> (String, Vec<String>) {
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
fn commands(block: &str) -> Vec<Result<Value, String>> {
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

fn run(session: &mut Session, cmd: &Value) -> Result<String, String> {
    let name = text_field(cmd, "cmd")?;
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
            Ok(session.engine_log().last().cloned().unwrap_or_default())
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
            Ok(session.engine_log().last().cloned().unwrap_or_default())
        }
        other => Err(format!("неизвестная команда «{other}»")),
    }
}

/// Выполняет команды из ответа мастера и возвращает текст без них с итогами команд.
pub fn apply_directives(session: &mut Session, reply: &str) -> MasterTurn {
    let (text, blocks) = split(reply);
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
    MasterTurn { text, actions }
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
}
