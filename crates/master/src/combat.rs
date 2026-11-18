//! Команда мастера `combat` и статблоки участников боя (пак 0.10.1).
//!
//! ```text
//! {"cmd":"combat","start":true,"foes":[{"name":"Нелла","role":"простолюдин","surprised":true}],
//!  "party_surprised":false,"ambush":["Асдрубаель"]}
//! {"cmd":"combat","add":[{"name":"Вышибала","role":"головорез"}]}
//! {"cmd":"combat","set":{"name":"Нелла","status":"down"}}
//! {"cmd":"combat","end":true,"outcome":"Нелла без сознания, рабочие сбежали"}
//! ```
//!
//! Числа участника: свои `ac`/`hp` из команды, иначе лист отряда Стрэнджей (в своей кампании
//! они NPC мира), иначе статблок бестиария по роли или имени (`data/rules/monsters.json`).

use dnd_engine::{FighterStatus, NewFighter, Session, Side};
use serde_json::Value;

use crate::bestiary as generated;

/// Статблок для боя: только то, что нужно мастеру.
#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct Statblock {
    pub id: &'static str,
    pub name: &'static str,
    pub ac: i32,
    pub hp: u32,
    pub xp: u32,
    pub cr: &'static str,
    pub attacks: &'static str,
}

fn statblocks() -> impl Iterator<Item = Statblock> {
    generated::BESTIARY.iter().map(|&(id, name, ac, hp, xp, cr, attacks)| Statblock {
        id,
        name,
        ac,
        hp,
        xp,
        cr,
        attacks,
    })
}

/// Роли безымянных NPC → статблок бестиария. Основа слова — без окончания.
const ROLES: &[(&str, &str)] = &[
    ("простолюдин", "commoner"),
    ("горожан", "commoner"),
    ("рабоч", "commoner"),
    ("крестьян", "commoner"),
    ("трактирщи", "commoner"),
    ("торгов", "commoner"),
    ("купец", "commoner"),
    ("слуг", "commoner"),
    ("матрос", "commoner"),
    ("грузчик", "commoner"),
    ("официант", "commoner"),
    ("служанк", "commoner"),
    ("обычный человек", "commoner"),
    ("бандит", "bandit"),
    ("разбойни", "bandit"),
    ("вор", "bandit"),
    ("карманни", "bandit"),
    ("главарь", "bandit-captain"),
    ("предводитель", "bandit-captain"),
    ("атаман", "bandit-captain"),
    ("стражни", "guard"),
    ("страж", "guard"),
    ("часов", "guard"),
    ("капитан страж", "guard-captain"),
    ("головорез", "tough"),
    ("вышибал", "tough"),
    ("громил", "tough"),
    ("крепыш", "tough"),
    ("наёмни", "tough"),
    ("наемни", "tough"),
    ("главарь банды", "tough-boss"),
    ("босс", "tough-boss"),
    ("солдат", "warrior-infantry"),
    ("пехотин", "warrior-infantry"),
    ("ополчен", "warrior-infantry"),
    ("ветеран", "warrior-veteran"),
    ("рыцар", "knight"),
    ("дворян", "noble"),
    ("аристократ", "noble"),
    ("знатн", "noble"),
    ("культист-фанатик", "cultist-fanatic"),
    ("фанатик", "cultist-fanatic"),
    ("культист", "cultist"),
    ("сектант", "cultist"),
    ("послушни", "priest-acolyte"),
    ("аколит", "priest-acolyte"),
    ("жрец", "priest"),
    ("священни", "priest"),
    ("разведчи", "scout"),
    ("охотни", "scout"),
    ("следопыт", "scout"),
    ("шпион", "spy"),
    ("лазутчи", "spy"),
    ("убийц", "assassin"),
    ("ассасин", "assassin"),
    ("берсерк", "berserker"),
    ("гладиатор", "gladiator"),
    ("пират", "pirate"),
    ("капитан пират", "pirate-captain"),
    ("маг", "mage"),
    ("чародей", "mage"),
    ("архимаг", "archmage"),
    ("друид", "druid"),
    ("волк", "wolf"),
    ("крыс", "rat"),
    ("гоблин", "goblin-warrior"),
    ("скелет", "skeleton"),
    ("зомби", "zombie"),
];

fn fold(text: &str) -> String {
    text.trim().to_lowercase().replace('ё', "е")
}

/// Статблок по роли («простолюдин», «вышибала»), id («bandit») или русскому имени («Бандит»).
pub(crate) fn statblock(role: &str) -> Option<Statblock> {
    let key = fold(role);
    if key.is_empty() {
        return None;
    }
    if let Some(s) = statblocks().find(|s| s.id == key || fold(s.name) == key) {
        return Some(s);
    }
    // Самое длинное подходящее начало роли: «капитан стражи» раньше «стражник».
    let mut best: Option<(&str, usize)> = None;
    for (stem, id) in ROLES {
        let stem = fold(stem);
        let hit = key.starts_with(&stem) || key.split_whitespace().any(|w| w.starts_with(&stem));
        if hit && best.is_none_or(|(_, len)| stem.chars().count() > len) {
            best = Some((*id, stem.chars().count()));
        }
    }
    let id = best?.0;
    statblocks().find(|s| s.id == id)
}

fn text<'a>(v: &'a Value, key: &str) -> Option<&'a str> {
    v.get(key).and_then(Value::as_str).map(str::trim).filter(|s| !s.is_empty())
}

fn flag(v: &Value, key: &str) -> bool {
    v.get(key).and_then(Value::as_bool).unwrap_or(false)
}

/// Участник из команды мастера; `count` — несколько одинаковых («Рабочий 1», «Рабочий 2»).
fn fighters(session: &Session, list: &Value) -> Result<Vec<NewFighter>, String> {
    let items = match list {
        Value::Array(a) => a.clone(),
        Value::Object(_) => vec![list.clone()],
        _ => return Err("участники боя — список: [{\"name\":\"…\",\"role\":\"…\"}]".into()),
    };
    let mut out = Vec::new();
    for item in &items {
        let name = text(item, "name").ok_or("у участника боя нет имени «name»")?;
        let role = text(item, "role").unwrap_or("");
        let side = match text(item, "side") {
            Some(s) => Side::parse(s).ok_or_else(|| format!("неизвестная сторона «{s}»"))?,
            None => Side::Foe,
        };
        let mut f = NewFighter {
            name: name.to_string(),
            side,
            role: role.to_string(),
            surprised: flag(item, "surprised"),
            hidden: flag(item, "hidden") || flag(item, "ambush"),
            ..NewFighter::default()
        };
        let ac = item.get("ac").and_then(Value::as_i64).and_then(|v| i32::try_from(v).ok());
        let hp = item.get("hp").and_then(Value::as_u64).and_then(|v| u32::try_from(v).ok());
        if let Some(c) = world_sheet(session, name) {
            // Отряд Стрэнджей в своей кампании — NPC мира: числа из их листов слоя «Мир».
            f.ac = Some(c.0);
            f.hp_max = Some(c.1);
            f.source = "лист слоя «Мир»".into();
        } else if let (Some(ac), Some(hp)) = (ac, hp) {
            f.ac = Some(ac);
            f.hp_max = Some(hp);
            f.source = "мастер".into();
        } else if let Some(s) = statblock(role).or_else(|| statblock(name)) {
            f.ac = Some(ac.unwrap_or(s.ac));
            f.hp_max = Some(hp.unwrap_or(s.hp));
            f.xp = s.xp;
            f.source = format!("бестиарий: {}", s.name);
            f.notes = format!("{} (ПО {}, {} ПО)", s.attacks, s.cr, s.xp);
            if f.role.is_empty() {
                f.role = s.name.to_string();
            }
        } else if ac.is_some() || hp.is_some() {
            f.ac = ac;
            f.hp_max = hp;
            f.source = "мастер".into();
        } else {
            return Err(format!(
                "для «{name}» не найден статблок по роли «{role}» — укажи роль из бестиария \
(простолюдин, бандит, стражник, головорез, ветеран, жрец, маг…) или числа \"ac\" и \"hp\""
            ));
        }
        let count = item.get("count").and_then(Value::as_u64).unwrap_or(1).clamp(1, 20);
        if count == 1 {
            out.push(f);
        } else {
            for i in 1..=count {
                out.push(NewFighter { name: format!("{name} {i}"), ..f.clone() });
            }
        }
    }
    Ok(out)
}

/// КД и хиты члена отряда Стрэнджей по имени (только в своей кампании).
fn world_sheet(session: &Session, name: &str) -> Option<(i32, u32)> {
    session.campaign()?;
    let key = fold(name);
    dnd_engine::fixtures::demo_party()
        .into_iter()
        .filter(|c| session.party().iter().all(|p| p.id != c.id))
        .find(|c| {
            let full = fold(&c.name);
            full == key || full.split_whitespace().next() == key.split_whitespace().next()
        })
        .map(|c| (c.armor_class, c.hit_points.max))
}

/// Команда `combat`.
pub(crate) fn run_combat(session: &mut Session, cmd: &Value) -> Result<String, String> {
    if flag(cmd, "end") {
        let outcome = text(cmd, "outcome").unwrap_or("");
        return session.end_combat(outcome, None).map_err(|e| e.to_string());
    }
    if let Some(set) = cmd.get("set") {
        let sets = match set {
            Value::Array(a) => a.clone(),
            other => vec![other.clone()],
        };
        let mut lines = Vec::new();
        for s in &sets {
            let name = text(s, "name").ok_or("у set нет имени «name»")?;
            let status = text(s, "status").ok_or("у set нет состояния «status»")?;
            let status = FighterStatus::parse(status).ok_or_else(|| {
                format!("неизвестное состояние «{status}»: active, down, dead, fled, surrendered")
            })?;
            lines.push(session.set_fighter(name, status).map_err(|e| e.to_string())?);
        }
        return Ok(lines.join("; "));
    }
    if let Some(add) = cmd.get("add") {
        let list = fighters(session, add)?;
        return session.add_fighters(list).map_err(|e| e.to_string());
    }
    if flag(cmd, "start") || cmd.get("foes").is_some() {
        let foes = fighters(session, cmd.get("foes").unwrap_or(&Value::Null))?;
        let ambush: Vec<String> = cmd
            .get("ambush")
            .and_then(Value::as_array)
            .map(|a| a.iter().filter_map(Value::as_str).map(str::to_string).collect())
            .unwrap_or_default();
        return session
            .start_combat(foes, flag(cmd, "party_surprised"), &ambush)
            .map_err(|e| e.to_string());
    }
    Err("у combat нужно одно из полей: \"start\":true с \"foes\", \"add\", \"set\", \"end\":true"
        .into())
}

#[cfg(test)]
mod tests {
    use super::*;
    use dnd_engine::Xoshiro256;
    use serde_json::json;

    #[test]
    fn roles_map_to_bestiary() {
        assert_eq!(statblock("простолюдин").unwrap().id, "commoner");
        assert_eq!(statblock("рабочий").unwrap().id, "commoner");
        assert_eq!(statblock("вышибала").unwrap().id, "tough");
        assert_eq!(statblock("капитан стражи").unwrap().id, "guard-captain");
        assert_eq!(statblock("Бандит").unwrap().id, "bandit");
        assert!(statblock("кто-то").is_none());
    }

    #[test]
    fn combat_command_start_add_set_end() {
        let mut s = Session::demo(Xoshiro256::from_seed(3));
        let r = run_combat(
            &mut s,
            &json!({"cmd":"combat","start":true,"foes":[{"name":"Нелла","role":"простолюдин","surprised":true},{"name":"Рабочий","role":"рабочий","count":2}]}),
        )
        .unwrap();
        assert!(r.contains("Рабочий 2"), "{r}");
        let lines = s.combat_lines().join("\n");
        assert!(lines.contains("КД 10") && lines.contains("хиты 4/4"), "{lines}");
        run_combat(&mut s, &json!({"cmd":"combat","set":{"name":"Нелла","status":"down"}}))
            .unwrap();
        let end =
            run_combat(&mut s, &json!({"cmd":"combat","end":true,"outcome":"рабочие сбежали"}))
                .unwrap();
        assert!(end.contains("рабочие сбежали"));
        assert!(s.combat().is_none());
        assert!(run_combat(
            &mut s,
            &json!({"cmd":"combat","start":true,"foes":[{"name":"Некто"}]})
        )
        .is_err());
    }
}
