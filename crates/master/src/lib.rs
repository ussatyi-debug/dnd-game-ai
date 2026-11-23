//! Системный промпт ИИ-мастера и контекст хода.
//!
//! Кодекс мастера собирается из общей части и слоя кампании (`codex.rs`); снимок сцены и
//! блоки хода — `scene.rs`; листы, книги заклинаний и записи для мастера — здесь.
//!
//! Крейт общий для приложения (мастер на Gemini и других провайдерах) и веб-версии
//! (мастер на Claude), поэтому правила мастера везде одинаковые.

#[rustfmt::skip]
#[path = "bestiary.generated.rs"]
mod bestiary;
mod codex;
mod combat;
mod directives;
mod recall;
mod rolls;
mod scene;
mod timeline;

pub use directives::{
    apply_directives, apply_repair, narration_parts, out_of_game_reply, repair_request, scene_now,
    strip_directives, MasterAction, MasterTurn,
};
pub use rolls::{
    fabricated_rolls, has_roll_requests, resolve_pool, rolled_faces, run_rolls, MasterRoll,
    PoolTurn, RollRound, MAX_ROLL_ROUNDS,
};
pub use scene::{
    answer_query, master_request, master_request_narrated, turn_hint, update_commands,
    update_request, MasterRequest, CHRONICLE_REMINDER_TURNS, HISTORY_TURNS_DEFAULT,
    HISTORY_TURNS_MAX, HISTORY_TURNS_MIN,
};
pub use timeline::{apply_turn_check, turn_check, TurnFix};

use dnd_engine::{Character, MasterNote, Proficiency, Session, SpellbookView, KB_STATUSES};
use serde_json::{json, Value};

fn spell_line(name: &str, id: &str, level: u8, concentration: bool, ritual: bool) -> String {
    let mut line = format!("{name} [{id}]");
    if level == 0 {
        line.push_str(", заговор");
    } else {
        line.push_str(&format!(", {level} круг"));
    }
    if concentration {
        line.push_str(", конц.");
    }
    if ritual {
        line.push_str(", ритуал");
    }
    // Механика из каталога SRD 5.2: мастер не вспоминает правила 2014 года по памяти.
    if let Some(meta) = dnd_engine::spell(id).filter(|m| !m.mech.is_empty()) {
        line.push_str(" — ");
        line.push_str(meta.mech);
    }
    line
}

/// Книга заклинаний в компактном виде для мастера.
fn magic_context(book: &SpellbookView) -> Value {
    let slots: Vec<String> = book
        .slots
        .iter()
        .map(|s| {
            let kind = if s.pact { " (договор, \"pact\")" } else { "" };
            format!("{} круг{kind}: {}/{}", s.level, s.pool.current(), s.pool.max())
        })
        .collect();
    let casters: Vec<Value> = book
        .casters
        .iter()
        .map(|c| {
            json!({
                "класс": c.label,
                "caster": c.id,
                "кс": c.save_dc,
                "атака": c.attack_bonus,
                "заговоры": c.cantrips.iter().map(|e| spell_line(&e.name, &e.id, 0, e.concentration, false)).collect::<Vec<_>>(),
                "готовые": c.spells.iter().map(|e| spell_line(&e.name, &e.id, e.level, e.concentration, e.ritual)).collect::<Vec<_>>(),
            })
        })
        .collect();
    let granted: Vec<String> = book
        .granted
        .iter()
        .map(|g| {
            let uses = g.uses.as_ref().map_or("неограниченно".to_string(), |p| {
                format!("{}/{}", p.current(), p.max())
            });
            format!(
                "{} — {} (на {} круге, {uses})",
                spell_line(&g.spell.name, &g.spell.id, g.spell.level, g.spell.concentration, false),
                g.source,
                g.cast_level
            )
        })
        .collect();
    let scrolls: Vec<String> = book
        .scrolls
        .iter()
        .map(|s| {
            let state = match (s.usable, s.check_dc) {
                (true, None) => "можно прочесть".to_string(),
                (true, Some(dc)) => format!("можно прочесть с проверкой КС {dc}"),
                (false, _) => {
                    "НЕЛЬЗЯ прочесть: заклинания нет в списках классов персонажа — свиток можно отдать тому, у кого оно в списке".to_string()
                }
            };
            format!("{} [{}], {} круг ×{} — {state}", s.spell.name, s.spell.id, s.level, s.count)
        })
        .collect();
    json!({
        "ячейки": slots,
        "классы": casters,
        "от_черт_и_предметов": granted,
        "свитки": scrolls,
        "подготовка_открыта": book.can_prepare,
    })
}

fn signed(v: i32) -> String {
    if v >= 0 {
        format!("+{v}")
    } else {
        format!("{v}")
    }
}

/// Итоговые числа листа для бросков: спасброски, навыки, атаки, состояния, инвентарь.
/// Мастер прибавляет модификаторы к кубам игрока, поэтому числа нужны готовыми.
/// Пол словом для мастера: по нему он обращается к персонажу.
pub(crate) fn gender_word(gender: &str) -> &'static str {
    match gender {
        "f" => "женский",
        "m" => "мужской",
        _ => "не указан",
    }
}

fn sheet_context(c: &Character, short: bool) -> Value {
    let d = c.details();
    let saves: Vec<String> = d
        .saves
        .iter()
        .map(|s| format!("{} {}{}", s.label, signed(s.total), if s.proficient { "*" } else { "" }))
        .collect();
    let skills: Vec<String> = d
        .skills
        .iter()
        .filter(|s| !short || s.proficiency != Proficiency::None)
        .filter(|s| d.skills_listed || s.proficiency != Proficiency::None)
        .map(|s| {
            let mut line = format!("{} {}", s.name, signed(s.total));
            if !s.advantage.is_empty() {
                line.push_str(&format!(" (преимущество: {})", s.advantage.join("; ")));
            }
            line
        })
        .collect();
    let attacks: Vec<String> = d
        .attacks
        .iter()
        .map(|a| {
            let unknown =
                if a.proficiency_unknown { ", владение не указано" } else { "" };
            match (a.save_dc, &a.save_label) {
                (Some(dc), Some(save)) => {
                    format!("{}: спасбросок {save} КС {dc}, {}", a.name, a.damage)
                }
                _ => format!("{}: {} к попаданию, {}{unknown}", a.name, signed(a.to_hit), a.damage),
            }
        })
        .collect();
    let hit_dice: Vec<String> =
        d.hit_dice.iter().map(|h| format!("{}/{} d{}", h.current, h.total, h.die)).collect();
    let inventory: serde_json::Map<String, Value> =
        c.inventory_summary().into_iter().map(|(place, items)| (place, json!(items))).collect();
    json!({
        "пол": gender_word(&c.profile.gender),
        "спасброски": saves,
        "навыки": if d.skills_listed { json!(skills) } else { json!("в листе не указаны — модификатор характеристики") },
        "пассивная_внимательность": d.passive_perception,
        "атаки": attacks,
        "состояния": d.conditions,
        "истощение": d.exhaustion,
        "кости_хитов": hit_dice,
        "владения": if short { json!("спроси командой query, если понадобятся") } else { json!(d.proficiencies.iter().map(|l| format!("{}: {}", l.kind, l.text)).collect::<Vec<_>>()) },
        "умения": d.features.iter().map(|f| format!("{} ({})", f.name, f.source)).collect::<Vec<_>>(),
        "настройка": d.attunement.iter().map(|a| a.name.clone()).collect::<Vec<_>>(),
        "ресурсы": c.resources().iter().map(|r| format!("{} [{}] {}/{}", r.name(), r.id(), r.current(), r.max())).collect::<Vec<_>>(),
        "инвентарь": inventory,
    })
}

fn note_json(session: &Session, n: &MasterNote) -> Value {
    let card = n.card.as_deref().map(|id| {
        let title = session.kb_cards().iter().find(|c| c.id == id).map_or(id, |c| c.title.as_str());
        format!("{title} [{id}]")
    });
    json!({
        "id": n.id,
        "день": n.day,
        "заголовок": n.title,
        "текст": n.text,
        "карточка": card,
        "записал": if n.by_player { "игрок" } else { "мастер" },
        "вид": n.kind.label(),
        "день_срабатывания": n.due_day,
        "отработано": n.done,
    })
}

fn status_label(id: &str) -> &str {
    KB_STATUSES.iter().find(|(s, _)| *s == id).map_or(id, |(_, l)| *l)
}

/// Оглавление базы знаний: карточки со статусами (с учётом изменений по ходу игры).
fn kb_index(session: &Session) -> Value {
    let mut layers = serde_json::Map::new();
    for (layer, title) in [("player", "игрок"), ("master", "мастер"), ("world", "мир")]
    {
        let lines: Vec<String> = session
            .kb_cards()
            .iter()
            .filter(|c| c.layer == layer)
            .map(|c| {
                let changed = session.kb_overrides().iter().find(|o| o.card_id == c.id);
                let status = match (changed, c.status.as_deref()) {
                    (Some(o), _) => {
                        format!(" — {} (изменено, День {})", status_label(&o.status), o.day)
                    }
                    (None, Some(s)) => format!(" — {}", status_label(s)),
                    (None, None) => String::new(),
                };
                format!("{} [{}]{status}", c.title, c.id)
            })
            .collect();
        let mut lines = lines;
        for c in session.custom_cards().iter().filter(|c| c.layer == layer) {
            let status =
                c.status.as_deref().map(|s| format!(" — {}", status_label(s))).unwrap_or_default();
            // Без описания: оно приходит по заявке или по запросу query card — оглавление не растёт.
            lines.push(format!(
                "{} [{}]{status} (создана по ходу игры, День {})",
                c.title, c.id, c.day
            ));
        }
        if !lines.is_empty() {
            layers.insert(title.to_string(), json!(lines));
        }
    }
    Value::Object(layers)
}

#[cfg(test)]
mod tests {
    use super::*;
    use dnd_engine::Xoshiro256;

    fn sheet(session: &Session, id: &str) -> Value {
        sheet_context(session.character(id).unwrap(), false)
    }

    #[test]
    fn spellbook_context_after_cast() {
        let mut session = Session::demo(Xoshiro256::from_seed(1));
        session.cast_spell("pc.nikis", &dnd_engine::CastRequest::new("far-step")).unwrap();
        let book = session.character("pc.nikis").unwrap().spellbook().unwrap();
        let nikis = magic_context(&book);
        assert_eq!(nikis["ячейки"][0], "5 круг (договор, \"pact\"): 1/2");
        assert_eq!(nikis["классы"][0]["кс"], 17);
        let ready = nikis["классы"][0]["готовые"].as_array().unwrap();
        assert!(ready
            .iter()
            .any(|v| v.as_str().unwrap().starts_with("Далёкий шаг [far-step], 5 круг")));
        assert!(session.character("npc.valeria").unwrap().spellbook().is_some());
        assert!(session.character("npc.corvus").unwrap().spellbook().is_none());
    }

    #[test]
    fn sheet_context_has_saves_skills_inventory_and_attacks() {
        let session = Session::demo(Xoshiro256::from_seed(1));
        let nikis = sheet(&session, "pc.nikis");
        assert!(nikis["спасброски"].as_array().unwrap().iter().any(|v| v == "ЛОВ +7*"));
        assert!(nikis["навыки"]
            .as_array()
            .unwrap()
            .iter()
            .any(|v| v.as_str().unwrap().starts_with("Ловкость рук +17")));
        assert_eq!(nikis["пассивная_внимательность"], 16);
        assert!(nikis["инвентарь"]["Кольцо Теневого Хранилища"].is_array());
        assert!(sheet(&session, "npc.corvus")["навыки"].is_array());
        let valeria = sheet(&session, "npc.valeria");
        assert!(valeria["атаки"]
            .as_array()
            .unwrap()
            .iter()
            .any(|v| v.as_str().unwrap().starts_with("Погребальный звон: спасбросок МДР КС 17")));
    }

    #[test]
    fn kb_index_shows_changed_status() {
        let mut session = Session::demo(Xoshiro256::from_seed(3));
        session.set_kb_cards(vec![dnd_engine::KbCard {
            id: "goal.astrolabe".into(),
            title: "Астролябия".into(),
            layer: "player".into(),
            status: Some("progress".into()),
            summary: String::new(),
            text: String::new(),
            parent: None,
        }]);
        session.set_card_status("goal.astrolabe", Some("done"), "").unwrap();
        let index = kb_index(&session);
        let line = index["игрок"][0].as_str().unwrap();
        assert!(line.contains("выполнено (изменено"), "{line}");
    }
}
