//! Заявка игрока этого хода (решения владельца 25.11.2026): бросок игрока с итогом по листу
//! героя, просьба описать сцену, вступление новой игры. Из неё движок строит заявку мастеру и
//! проверяет его ответ до показа игроку.

use dnd_engine::{Ability, PlayerRoll, Session, Skill, TurnAsk};

/// Служебная заявка начала игры (её шлёт интерфейс).
pub const OPENING_MARK: &str = "[Начало игры]";

/// Короче — бросок, а не рассказ игрока («на кубе 19 внимательность»).
const ROLL_MAX_WORDS: usize = 10;
/// Вступление короче — сцена не описана (тест 25.11.2026: две фразы и «***»).
const OPENING_MIN_CHARS: usize = 500;
/// Ответ на просьбу описать короче — описания нет.
const DESCRIBE_MIN_CHARS: usize = 200;

fn fold(text: &str) -> String {
    text.to_lowercase().replace('ё', "е")
}

fn words(text: &str) -> Vec<String> {
    fold(text)
        .split(|c: char| !c.is_alphanumeric())
        .filter(|w| !w.is_empty())
        .map(str::to_string)
        .collect()
}

/// Начало слова-навыка: «внимательность» → «внимательно», «магия» → «маги».
fn stem(word: &str) -> String {
    let n = word.chars().count();
    word.chars().take(n.saturating_sub(2).max(4)).collect()
}

/// Навык или спасбросок в словах заявки: подпись и модификатор по листу героя.
fn roll_kind(session: &Session, hero: &str, words: &[String]) -> Option<(String, i32)> {
    let character = session.character(hero).ok()?;
    let joined = words.join(" ");
    if let Some(i) = words.iter().position(|w| w.starts_with("спас")) {
        const ABILITIES: [(&[&str], Ability); 6] = [
            (&["сил"], Ability::Strength),
            (&["лов"], Ability::Dexterity),
            (&["тел"], Ability::Constitution),
            (&["инт"], Ability::Intelligence),
            (&["мдр", "муд"], Ability::Wisdom),
            (&["хар"], Ability::Charisma),
        ];
        let ability = words.iter().skip(i + 1).find_map(|w| {
            ABILITIES.iter().find(|(p, _)| p.iter().any(|p| w.starts_with(p))).map(|(_, a)| *a)
        })?;
        let line = character.saves().into_iter().find(|s| s.ability == ability)?;
        return Some((format!("спасбросок {}", line.label), line.total));
    }
    let mut found = Skill::ALL.into_iter().filter(|skill| {
        let name = fold(skill.name());
        if name.contains(' ') {
            return joined.contains(&name);
        }
        let stem = stem(&name);
        words.iter().any(|w| w.starts_with(&stem))
    });
    let skill = found.next()?;
    if found.next().is_some() {
        return None;
    }
    Some((skill.name().to_string(), character.skill_total(skill)))
}

/// Бросок игрока в заявке: «19 внимательность», «на кубе 12, спасбросок ЛОВ». Одно число куба
/// (1–20) и один навык или спасбросок героя; иначе — не бросок.
pub fn player_roll(session: &Session, player_text: &str) -> Option<PlayerRoll> {
    let words = words(player_text);
    if words.is_empty() || words.len() > ROLL_MAX_WORDS {
        return None;
    }
    let numbers: Vec<i32> = words.iter().filter_map(|w| w.parse::<i32>().ok()).collect();
    let [die] = numbers.as_slice() else { return None };
    if !(1..=20).contains(die) {
        return None;
    }
    let (hero, _) = crate::rolls::hero(session)?;
    let (label, modifier) = roll_kind(session, &hero, &words)?;
    Some(PlayerRoll { label, die: *die, modifier })
}

/// Заявка игрока этого хода.
pub fn read(session: &Session, player_text: &str) -> TurnAsk {
    let t = fold(player_text);
    let opening = player_text.trim_start().starts_with(OPENING_MARK);
    let describe = !opening
        && !crate::scene::out_of_game(player_text)
        && ["опиши", "допиши", "продолжи", "еще раз", "подробнее"].iter().any(|w| t.contains(w));
    TurnAsk { roll: player_roll(session, player_text), describe, opening }
}

/// Заявка для мастера: бросок — только итог (число куба мастер не видит, прибавлять нечего).
pub fn for_master(player_text: &str, ask: &TurnAsk) -> String {
    let Some(roll) = &ask.roll else { return player_text.to_string() };
    let t = fold(player_text);
    let mode = if t.contains("преимущ") {
        ", с преимуществом"
    } else if t.contains("помех") {
        ", с помехой"
    } else {
        ""
    };
    format!(
        "[бросок игрока{mode}: {} — итог {} (модификатор {:+} уже прибавлен движком; к итогу ничего \
не прибавляй)]",
        roll.label,
        roll.total(),
        roll.modifier
    )
}

/// Рассказ без реплик вне игры «((…))».
fn story(text: &str) -> String {
    let mut out = String::new();
    let mut rest = text;
    while let Some(start) = rest.find("((") {
        out.push_str(&rest[..start]);
        match rest[start..].find("))") {
            Some(end) => rest = &rest[start + end + 2..],
            None => {
                rest = "";
            }
        }
    }
    out.push_str(rest);
    out.trim().to_string()
}

/// Модификатор прибавлен второй раз: «итог 21» при итоге 20 и модификаторе +1, или «20 + 1».
fn double_modifier(roll: &PlayerRoll, text: &str) -> bool {
    if roll.modifier == 0 {
        return false;
    }
    let total = roll.total();
    let twice = (total + roll.modifier).to_string();
    let sum = format!("{total} + {}", roll.modifier.abs());
    let compact = format!("{total}+{}", roll.modifier.abs());
    if text.contains(&sum) || text.contains(&compact) {
        return true;
    }
    let label = stem(&fold(roll.label.split_whitespace().last().unwrap_or("")));
    let key = |w: &String| {
        w.starts_with(&label)
            || ["итог", "результат", "бросок", "провер", "спасброс"]
                .iter()
                .any(|k| w.starts_with(k))
    };
    text.split(['.', '!', '?', '\n']).any(|sentence| {
        let words = words(sentence);
        words
            .iter()
            .enumerate()
            .filter(|(_, w)| **w == twice)
            .any(|(i, _)| words.iter().enumerate().any(|(j, w)| i.abs_diff(j) <= 3 && key(w)))
    })
}

/// Замечания к ответу мастера по заявке игрока: строки для «[ПРОВЕРКА ХОДА]».
pub fn check(session: &Session, text: &str) -> Vec<String> {
    let ask = session.turn_ask();
    let story_chars = story(text).chars().count();
    let mut out = Vec::new();
    if ask.opening && story_chars < OPENING_MIN_CHARS {
        out.push(
            "Вступление: сцена почти не описана. Перепиши ход рассказом без ((…)): место, время \
суток, люди и обстановка вокруг героя, первая угроза или зов; закончи вопросом, что делает герой."
                .to_string(),
        );
    }
    if ask.describe && story_chars < DESCRIBE_MIN_CHARS {
        out.push(
            "Игрок просит описать сцену — это игровой ход, а не разговор вне игры: перепиши ответ \
рассказом, без ((…))."
                .to_string(),
        );
    }
    if let Some(roll) = ask.roll.as_ref().filter(|r| double_modifier(r, text)) {
        out.push(format!(
            "Бросок игрока: итог {} уже с модификатором ({:+}) — не прибавляй его ещё раз; перепиши \
ход с итогом {}.",
            roll.total(),
            roll.modifier,
            roll.total()
        ));
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    fn session() -> Session {
        Session::demo(dnd_engine::Xoshiro256::from_seed(11))
    }

    #[test]
    fn player_roll_gets_the_sheet_modifier() {
        let s = session();
        let (hero, _) = crate::rolls::hero(&s).unwrap();
        let perception = s.character(&hero).unwrap().skill_total(Skill::Perception);
        let roll = player_roll(&s, "на кубе 19 внимательность.").unwrap();
        assert_eq!(
            (roll.label.as_str(), roll.die, roll.modifier),
            ("Внимательность", 19, perception)
        );
        let save = player_roll(&s, "12 спасбросок ЛОВ").unwrap();
        assert_eq!(save.label, "спасбросок ЛОВ");
        assert!(player_roll(&s, "Иду к двери и внимательно слушаю, что за ней").is_none());
        assert!(player_roll(&s, "19 и 7 внимательность").is_none());
        assert!(player_roll(&s, "25 внимательность").is_none());
        let ask = read(&s, "19 внимательность с преимуществом");
        let text = for_master("19 внимательность с преимуществом", &ask);
        assert!(text.contains("с преимуществом: Внимательность — итог"), "{text}");
        assert!(!text.contains("19 "), "{text}");
    }

    #[test]
    fn double_modifier_and_empty_scene_are_caught() {
        let mut s = session();
        let roll =
            PlayerRoll { label: "Внимательность".into(), die: 19, modifier: 1 };
        assert!(double_modifier(&roll, "Твой итог — 21, ты замечаешь след."));
        assert!(double_modifier(&roll, "20 + 1 = 21"));
        assert!(!double_modifier(&roll, "Итог 20: ты замечаешь след в 21 шаге отсюда"));
        s.set_turn_ask(TurnAsk { roll: Some(roll), ..TurnAsk::default() });
        assert_eq!(check(&s, "Итог 20. Ты замечаешь след.").len(), 0);
        assert_eq!(check(&s, "Твой результат 21. Ты замечаешь след.").len(), 1);
        s.set_turn_ask(read(&s, "[Начало игры] Поприветствуй игрока"));
        assert_eq!(check(&s, "На текущий момент: День 32. ***").len(), 1);
        s.set_turn_ask(read(&s, "Я имею в виду нет её описания. Опиши её ещё раз"));
        assert_eq!(check(&s, "((Мастер: Я понял. Приступаю к вступлению.))").len(), 1);
        assert_eq!(check(&s, &"Туман клубится над мостовой. ".repeat(10)).len(), 0);
    }
}
