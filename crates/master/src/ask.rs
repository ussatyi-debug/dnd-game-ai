//! Заявка игрока этого хода (решения владельца 25–26.11.2026): бросок игрока с итогом по листу
//! героя, просьба описать сцену, вступление новой игры. Из неё движок строит заявку мастеру и
//! проверяет его ответ до показа игроку.
//!
//! Броски игрока (пак 0.10.8, схема «вариант 3»):
//! - путь A — мастер объявил бросок командой `expect_roll`: число берётся из заявки любой длины;
//! - путь B — броска не объявлено, но в заявке навык или спасбросок рядом с числом;
//! - путь C — числа есть, а бросок не определён: мастер видит «[ЧИСЛА В ЗАЯВКЕ: …]» и сам
//!   просит итог командой `roll_total` (или переспрашивает игрока).
//!
//! Число, за которым сразу идёт слово («10 монет», «3 шага»), — не бросок.

use crate::rolls::{ability_word, hero_roll, skill_in, stem};
use dnd_engine::{DiceExpr, ExpectedRoll, PlayerRoll, PlayerRollSource, Session, Term, TurnAsk};
use serde_json::Value;

/// Служебная заявка начала игры (её шлёт интерфейс).
pub const OPENING_MARK: &str = "[Начало игры]";
/// Вступление короче — сцена не описана (тест 25.11.2026: две фразы и «***»).
const OPENING_MIN_CHARS: usize = 500;
/// Ответ на просьбу описать короче — описания нет.
const DESCRIBE_MIN_CHARS: usize = 200;
/// Сколько слов может стоять между навыком и числом в пути B («внимательность, на кубе 19»).
const PAIR_DISTANCE: usize = 3;

/// Слова, после которых число остаётся «голым» (бросок): «18 и 7», «17 на скрытность».
const CONNECTORS: &[&str] = &[
    "и",
    "на",
    "по",
    "с",
    "со",
    "в",
    "а",
    "это",
    "итог",
    "итого",
    "результат",
    "выпало",
    "выпадает",
    "вышло",
    "кубе",
    "куб",
    "или",
    "ну",
    "же",
    "у",
    "мой",
    "моя",
    "мое",
];

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

/// Слово заявки и его место в тексте.
#[derive(Debug, Clone)]
struct Token {
    word: String,
    start: usize,
    end: usize,
    /// Перед словом знак препинания («17 — везунчик», «14, и слушаю»).
    gap: bool,
}

impl Token {
    fn number(&self) -> Option<i32> {
        if self.word.len() <= 3 && self.word.bytes().all(|b| b.is_ascii_digit()) {
            self.word.parse().ok()
        } else {
            None
        }
    }
}

fn tokens(text: &str) -> Vec<Token> {
    let mut out = Vec::new();
    let mut start = None;
    let mut gap = false;
    for (i, c) in text.char_indices() {
        if c.is_alphanumeric() {
            start.get_or_insert(i);
            continue;
        }
        if let Some(s) = start.take() {
            out.push(Token { word: fold(&text[s..i]), start: s, end: i, gap });
            gap = false;
        }
        if !c.is_whitespace() {
            gap = true;
        }
    }
    if let Some(s) = start {
        out.push(Token { word: fold(&text[s..]), start: s, end: text.len(), gap });
    }
    out
}

/// Слово самого броска: навык, спасбросок, характеристика, режим.
fn roll_word(word: &str) -> bool {
    const PREFIXES: &[&str] = &[
        "спас",
        "атак",
        "урон",
        "иниц",
        "преимущ",
        "помех",
        "везунч",
        "провер",
        "бросок",
        "крит",
        "d20",
        "к20",
        "д20",
    ];
    PREFIXES.iter().any(|p| word.starts_with(p))
        || ability_word(word).is_some()
        || skill_in(&[word.to_string()]).is_some()
}

/// Индексы «голых» чисел: за числом нет слова-предмета («10 монет», «12 футов», «2 часа»).
fn bare_numbers(toks: &[Token]) -> Vec<usize> {
    (0..toks.len())
        .filter(|&i| toks[i].number().is_some())
        .filter(|&i| match toks.get(i + 1) {
            None => true,
            Some(next) => {
                next.gap
                    || next.number().is_some()
                    || CONNECTORS.contains(&next.word.as_str())
                    || roll_word(&next.word)
            }
        })
        .collect()
}

/// Режим броска d20.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum Mode {
    Normal,
    Advantage,
    Disadvantage,
}

impl Mode {
    fn parse(text: &str) -> Option<Mode> {
        match fold(text.trim()).as_str() {
            "" | "normal" => Some(Mode::Normal),
            "advantage" | "adv" | "преимущество" => Some(Mode::Advantage),
            "disadvantage" | "dis" | "помеха" => Some(Mode::Disadvantage),
            _ => None,
        }
    }

    /// Режим из слов игрока («с преимуществом», «везунчик», «с помехой»), иначе объявленный.
    fn of(words: &[String], declared: Mode) -> (Mode, bool) {
        let lucky = words.iter().any(|w| w.starts_with("везунч"));
        let adv = lucky || words.iter().any(|w| w.starts_with("преимущ"));
        let dis = words.iter().any(|w| w.starts_with("помех"));
        let mode = match (adv, dis) {
            (true, false) => Mode::Advantage,
            (false, true) => Mode::Disadvantage,
            (true, true) => Mode::Normal,
            (false, false) => declared,
        };
        (mode, lucky)
    }
}

/// Куб d20 из чисел игрока: одно число — уже выбранный куб; два — больший при преимуществе,
/// меньший при помехе; «17 — преимущество (8 и 17)» — первое число.
fn pick_d20(numbers: &[i32], mode: Mode, lucky: bool) -> Option<(i32, String)> {
    let label = |pair: Option<(i32, i32)>| {
        let base = match (mode, lucky) {
            (_, true) => "Везунчик".to_string(),
            (Mode::Advantage, _) => "с преимуществом".to_string(),
            (Mode::Disadvantage, _) => "с помехой".to_string(),
            (Mode::Normal, _) => String::new(),
        };
        match pair {
            Some((a, b)) if !base.is_empty() => format!("{base} ({a} и {b})"),
            _ => base,
        }
    };
    if numbers.iter().any(|n| !(1..=20).contains(n)) {
        return None;
    }
    match *numbers {
        [one] => Some((one, label(None))),
        [a, b] if mode != Mode::Normal => {
            let die = if mode == Mode::Advantage { a.max(b) } else { a.min(b) };
            Some((die, label(Some((a, b)))))
        }
        [first, a, b] if mode != Mode::Normal && (first == a || first == b) => {
            Some((first, label(Some((a, b)))))
        }
        _ => None,
    }
}

/// Кубы урона из чисел игрока: по числу на куб, вдвое больше (крит) или одна сумма.
fn pick_damage(numbers: &[i32], dice: &str) -> Option<(Vec<i32>, String)> {
    let expr = DiceExpr::parse(dice).ok()?;
    let (mut count, mut sides) = (0i32, 0i32);
    for term in expr.terms() {
        if let Term::Dice { count: c, sides: s, negative: false } = term {
            count += i32::try_from(*c).ok()?;
            sides = sides.max(i32::try_from(*s).ok()?);
        }
    }
    if count == 0 || numbers.is_empty() || numbers.iter().any(|n| *n < 1) {
        return None;
    }
    let each = numbers.iter().all(|n| *n <= sides);
    let len = i32::try_from(numbers.len()).ok()?;
    if each && len == count {
        return Some((numbers.to_vec(), String::new()));
    }
    if each && len == 2 * count {
        return Some((numbers.to_vec(), "крит".into()));
    }
    match *numbers {
        [sum] if (count..=count * sides).contains(&sum) => Some((vec![sum], String::new())),
        _ => None,
    }
}

/// Бросок героя по `what` и числам игрока. Ошибка — почему итога нет.
fn roll_of(
    session: &Session,
    what: &str,
    dice: &str,
    mode: Mode,
    lucky: bool,
    numbers: &[i32],
    source: PlayerRollSource,
) -> Result<PlayerRoll, String> {
    let sheet = hero_roll(session, what)?;
    let shown = |n: &[i32]| n.iter().map(i32::to_string).collect::<Vec<_>>().join(", ");
    if sheet.d20 && dice.trim().is_empty() {
        let (die, mode) = pick_d20(numbers, mode, lucky).ok_or_else(|| {
            format!(
                "числа {} — не бросок d20: одно число 1–20, или два при преимуществе или помехе \
(укажи mode)",
                shown(numbers)
            )
        })?;
        return Ok(PlayerRoll {
            label: sheet.label,
            dice: vec![die],
            modifier: sheet.modifier,
            d20: true,
            mode,
            source,
        });
    }
    let kind = if dice.trim().is_empty() { sheet.dice.as_str() } else { dice };
    if kind.is_empty() {
        return Err(format!("у «{}» нет кубов урона в листе — укажи dice", sheet.label));
    }
    let (dice, mode) = pick_damage(numbers, kind)
        .ok_or_else(|| format!("числа {} — не бросок {kind}", shown(numbers)))?;
    // Урон — только кубы и бонус из листа; для проверки с другими кубами бонус тот же.
    Ok(PlayerRoll { label: sheet.label, dice, modifier: sheet.modifier, d20: false, mode, source })
}

/// Строка броска для мастера: «[БРОСОК ИГРОКА] Внимательность — итог 19 (модификатор +1 уже
/// прибавлен; к итогу ничего не прибавляй)».
pub fn roll_line(roll: &PlayerRoll) -> String {
    let mode = if roll.mode.is_empty() { String::new() } else { format!(", {}", roll.mode) };
    let natural = match roll.natural() {
        Some(20) => ", натуральная 20",
        Some(1) => ", натуральная 1",
        _ => "",
    };
    format!(
        "[БРОСОК ИГРОКА] {}{mode} — итог {}{natural} (модификатор {:+} уже прибавлен; к итогу \
ничего не прибавляй)",
        roll.label,
        roll.total(),
        roll.modifier
    )
}

/// Путь B: один навык или спасбросок рядом с «голым» числом. Что бросал игрок.
fn pair_what(toks: &[Token], bare: &[usize]) -> Option<String> {
    let mut found: Vec<(String, usize, usize)> = Vec::new();
    let words: Vec<String> = toks.iter().map(|t| t.word.clone()).collect();
    for (i, t) in toks.iter().enumerate() {
        if t.number().is_some() {
            continue;
        }
        let item = if t.word.starts_with("спас") {
            toks.get(i + 1)
                .and_then(|n| ability_word(&n.word))
                .map(|_| (format!("спасбросок {}", toks[i + 1].word), i, i + 1))
        } else if t.word.starts_with("инициатив") {
            Some(("инициатива".to_string(), i, i))
        } else if let Some(skill) = skill_in(&words[i..(i + 2).min(words.len())]) {
            // «ловкость рук» — два слова; иначе одно слово навыка.
            let name = fold(skill.name());
            let end = if name.contains(' ') && i + 1 < words.len() { i + 1 } else { i };
            let first = name.split(' ').next().unwrap_or("");
            let single = !name.contains(' ') && t.word.starts_with(&stem(&name));
            (single || t.word == first).then(|| (skill.name().to_string(), i, end))
        } else {
            None
        };
        if let Some(item) = item {
            // Спасбросок поглощает слово характеристики; «ловкость рук» — слово «ловкость».
            if found.last().is_some_and(|(_, _, end)| *end >= item.1) {
                continue;
            }
            found.push(item);
        }
    }
    let near: Vec<&(String, usize, usize)> = found
        .iter()
        .filter(|(_, from, to)| {
            bare.iter().any(|&n| {
                (n < *from && from - n <= PAIR_DISTANCE) || (n > *to && n - to <= PAIR_DISTANCE)
            })
        })
        .collect();
    let first = near.first()?;
    near.iter().all(|f| f.0 == first.0).then(|| first.0.clone())
}

/// Заявка игрока этого хода и текст заявки для мастера. Объявленный бросок (`expect_roll`)
/// снимает запрос мастеру сразу после чтения заявки (живёт до следующей заявки игрока).
pub fn prepare(session: &Session, player_text: &str) -> (TurnAsk, String) {
    let t = fold(player_text);
    let opening = player_text.trim_start().starts_with(OPENING_MARK);
    let describe = !opening
        && !crate::scene::out_of_game(player_text)
        && ["опиши", "допиши", "продолжи", "еще раз", "подробнее"].iter().any(|w| t.contains(w));
    let mut ask = TurnAsk { roll: None, describe, opening };
    if opening {
        return (ask, player_text.to_string());
    }
    let toks = tokens(player_text);
    let bare = bare_numbers(&toks);
    if bare.is_empty() {
        return (ask, player_text.to_string());
    }
    let words: Vec<String> = toks.iter().map(|t| t.word.clone()).collect();
    let numbers: Vec<i32> = bare.iter().filter_map(|&i| toks[i].number()).collect();
    let declared = session.expected_roll();
    let roll = match declared {
        Some(e) => {
            let (mode, lucky) = Mode::of(&words, Mode::parse(&e.mode).unwrap_or(Mode::Normal));
            roll_of(session, &e.what, &e.dice, mode, lucky, &numbers, PlayerRollSource::Declared)
                .ok()
        }
        None => pair_what(&toks, &bare).and_then(|what| {
            let (mode, lucky) = Mode::of(&words, Mode::Normal);
            let d20: Vec<i32> = numbers.iter().copied().filter(|n| (1..=20).contains(n)).collect();
            roll_of(session, &what, "", mode, lucky, &d20, PlayerRollSource::Pair).ok()
        }),
    };
    let Some(roll) = roll else {
        let shown: Vec<String> = numbers.iter().map(i32::to_string).collect();
        let text =
            format!("[ЧИСЛА В ЗАЯВКЕ: {} — бросок не определён]\n{player_text}", shown.join(", "));
        return (ask, text);
    };
    // Числа кубов мастер не видит: в рассказе игрока они заменены, итог — строкой движка.
    let mut story = String::new();
    let mut at = 0;
    for &i in &bare {
        story.push_str(&player_text[at..toks[i].start]);
        story.push_str("(бросок)");
        at = toks[i].end;
    }
    story.push_str(&player_text[at..]);
    let rest = toks
        .iter()
        .filter(|t| {
            t.number().is_none() && !CONNECTORS.contains(&t.word.as_str()) && !roll_word(&t.word)
        })
        .count();
    let line = roll_line(&roll);
    let text = if rest >= 3 { format!("{line}\n{}", story.trim()) } else { line };
    ask.roll = Some(roll);
    (ask, text)
}

/// Заявка игрока этого хода (без текста для мастера).
#[cfg(test)]
fn read(session: &Session, player_text: &str) -> TurnAsk {
    prepare(session, player_text).0
}

fn numbers_field(cmd: &Value) -> Result<Vec<i32>, String> {
    let one = |v: &Value| v.as_i64().and_then(|n| i32::try_from(n).ok());
    match cmd.get("dice") {
        Some(Value::Array(items)) => {
            items.iter().map(|v| one(v).ok_or_else(|| format!("в «dice» не число: {v}"))).collect()
        }
        Some(v) if v.is_i64() => Ok(vec![one(v).unwrap_or_default()]),
        _ => Err("нет поля «dice» — числа игрока: [18] или [18, 7]".into()),
    }
}

fn text_of<'a>(cmd: &'a Value, key: &str) -> &'a str {
    cmd.get(key).and_then(Value::as_str).map(str::trim).unwrap_or("")
}

/// `{"cmd":"roll_total","what":"Внимательность","dice":[18]}` — итог по числам игрока, когда
/// бросок не был объявлен. Ответ — в круге запросов, как `query`; бросок идёт в проверку хода.
pub fn roll_total(session: &mut Session, cmd: &Value) -> Result<String, String> {
    let numbers = numbers_field(cmd)?;
    let mode = Mode::parse(text_of(cmd, "mode")).ok_or_else(|| {
        format!("неизвестный mode «{}»: advantage или disadvantage", text_of(cmd, "mode"))
    })?;
    let roll = roll_of(
        session,
        text_of(cmd, "what"),
        text_of(cmd, "kind"),
        mode,
        false,
        &numbers,
        PlayerRollSource::Total,
    )?;
    let line = roll_line(&roll);
    session.log(format!("Бросок игрока по запросу мастера: {line}"));
    let mut ask = session.turn_ask().clone();
    ask.roll = Some(roll);
    session.set_turn_ask(ask);
    Ok(line)
}

/// `{"cmd":"expect_roll","what":"Внимательность"}` — мастер объявляет бросок игрока для его
/// следующей заявки: "dice" — кубы без модификатора ("2d6", "d4"), "mode" — "advantage" или
/// "disadvantage", "cancel":true — снять. Новое объявление заменяет старое.
pub fn expect_roll(session: &mut Session, cmd: &Value) -> Result<String, String> {
    if cmd.get("cancel").and_then(Value::as_bool) == Some(true) {
        session.set_expected_roll(None);
        session.log("Объявленный бросок игрока снят");
        return Ok("Объявленный бросок игрока снят".into());
    }
    let sheet = hero_roll(session, text_of(cmd, "what"))?;
    let mut dice = text_of(cmd, "dice").replace(' ', "");
    if !dice.is_empty() {
        if dice.starts_with(['d', 'к', 'д', 'D']) {
            dice.insert(0, '1');
        }
        let expr = DiceExpr::parse(&dice).map_err(|e| format!("dice «{dice}»: {e}"))?;
        if expr.terms().iter().any(|t| !matches!(t, Term::Dice { negative: false, .. })) {
            return Err(format!(
                "dice «{dice}» — только кубы без модификатора («2d6», «d4»): модификатор движок \
прибавит из листа"
            ));
        }
    } else if !sheet.d20 {
        dice = sheet.dice.clone();
    }
    let mode = text_of(cmd, "mode");
    let mode = match Mode::parse(mode) {
        Some(Mode::Advantage) => "advantage",
        Some(Mode::Disadvantage) => "disadvantage",
        Some(Mode::Normal) => "",
        None => return Err(format!("неизвестный mode «{mode}»: advantage или disadvantage")),
    };
    let roll = ExpectedRoll { what: sheet.label.clone(), dice: dice.clone(), mode: mode.into() };
    let kind = if dice.is_empty() { "d20".to_string() } else { dice };
    let mode = match mode {
        "advantage" => ", преимущество",
        "disadvantage" => ", помеха",
        _ => "",
    };
    let line = format!("Объявлен бросок игрока: {} ({kind}{mode})", sheet.label);
    session.set_expected_roll(Some(roll));
    session.log(line.clone());
    Ok(line)
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
            || ["итог", "результат", "бросок", "провер", "спасброс", "урон"]
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
    use dnd_engine::Skill;
    use serde_json::json;

    fn session() -> Session {
        Session::demo(dnd_engine::Xoshiro256::from_seed(11))
    }

    fn perception(s: &Session) -> i32 {
        let (hero, _) = crate::rolls::hero(s).unwrap();
        s.character(&hero).unwrap().skill_total(Skill::Perception)
    }

    fn declare(s: &mut Session, cmd: Value) {
        expect_roll(s, &cmd).unwrap();
    }

    #[test]
    fn pair_of_skill_and_number_in_any_length() {
        let s = session();
        let p = perception(&s);
        let roll = read(&s, "на кубе 19 внимательность.").roll.unwrap();
        assert_eq!(
            (roll.label.as_str(), roll.dice.clone(), roll.modifier),
            ("Внимательность", vec![19], p)
        );
        assert_eq!(roll.source, PlayerRollSource::Pair);
        let save = read(&s, "12 спасбросок ЛОВ").roll.unwrap();
        assert_eq!(save.label, "спасбросок ЛОВ");
        // Длинная заявка с парой «навык + число» — бросок (в 0.10.7 «до 10 слов»).
        let long = "Подхожу к двери склада, прикладываю ухо к доскам и долго слушаю, что \
происходит внутри, а потом осматриваю замок: внимательность 17";
        assert_eq!(read(&s, long).roll.unwrap().dice, vec![17]);
        assert!(read(&s, "Иду к двери и внимательно слушаю, что за ней").roll.is_none());
        assert!(read(&s, "25 внимательность").roll.is_none());
        // Число с предметом — не бросок: «даю 10 монет» больше не подменяет заявку.
        let (ask, text) = prepare(&s, "Даю стражнику 10 монет и спрашиваю про внимательность");
        assert!(ask.roll.is_none());
        assert!(!text.contains("[ЧИСЛА В ЗАЯВКЕ"), "{text}");
        // Бросок без навыка — путь C: пометка мастеру.
        let (ask, text) = prepare(&s, "осматриваюсь 18");
        assert!(ask.roll.is_none());
        assert!(text.starts_with("[ЧИСЛА В ЗАЯВКЕ: 18 — бросок не определён]\n"), "{text}");
        // Без объявления «17» — не бросок.
        assert!(read(&s, "17").roll.is_none());
    }

    #[test]
    fn master_sees_total_not_the_die() {
        let s = session();
        let p = perception(&s);
        let (ask, text) = prepare(&s, "19 внимательность");
        assert!(ask.roll.is_some());
        assert_eq!(
            text,
            format!(
                "[БРОСОК ИГРОКА] Внимательность — итог {} (модификатор {:+} уже прибавлен; к итогу \
ничего не прибавляй)",
                19 + p,
                p
            )
        );
        let (_, text) =
            prepare(&s, "Осторожно заглядываю за угол и прислушиваюсь, внимательность 14");
        assert!(text.contains("Внимательность — итог"), "{text}");
        assert!(text.contains("прислушиваюсь, внимательность (бросок)"), "{text}");
        assert!(!text.contains("14"), "{text}");
    }

    #[test]
    fn declared_roll_takes_a_bare_number() {
        let mut s = session();
        let p = perception(&s);
        declare(&mut s, json!({"cmd":"expect_roll","what":"Внимательность"}));
        assert_eq!(s.expected_roll().unwrap().what, "Внимательность");
        let roll = read(&s, "17").roll.unwrap();
        assert_eq!(
            (roll.dice.clone(), roll.total(), roll.source),
            (vec![17], 17 + p, PlayerRollSource::Declared)
        );
        assert_eq!(read(&s, "иду к двери, 14, и слушаю").roll.unwrap().dice, vec![14]);
        // Число с предметом — не бросок, остаётся голое.
        assert_eq!(read(&s, "кладу 10 монет на стол и смотрю: 15").roll.unwrap().dice, vec![15]);
        assert!(read(&s, "иду 3 шага вперёд").roll.is_none());
        // Два голых числа без режима — путь C.
        let (ask, text) = prepare(&s, "14 и 9");
        assert!(ask.roll.is_none());
        assert!(text.contains("[ЧИСЛА В ЗАЯВКЕ: 14, 9"), "{text}");
        // Новое объявление заменяет старое, cancel снимает.
        declare(&mut s, json!({"cmd":"expect_roll","what":"спасбросок ЛОВ"}));
        assert_eq!(read(&s, "12").roll.unwrap().label, "спасбросок ЛОВ");
        declare(&mut s, json!({"cmd":"expect_roll","cancel":true}));
        assert!(s.expected_roll().is_none());
        assert!(expect_roll(&mut s, &json!({"cmd":"expect_roll","what":"Полёт"})).is_err());
        assert!(expect_roll(&mut s, &json!({"cmd":"expect_roll","what":"Сила","dice":"1d6+2"}))
            .is_err());
    }

    #[test]
    fn advantage_disadvantage_and_lucky() {
        let mut s = session();
        declare(&mut s, json!({"cmd":"expect_roll","what":"Внимательность","mode":"advantage"}));
        let roll = read(&s, "18 и 7").roll.unwrap();
        assert_eq!((roll.dice.clone(), roll.mode.as_str()), (vec![18], "с преимуществом (18 и 7)"));
        assert_eq!(read(&s, "17").roll.unwrap().dice, vec![17]);
        declare(&mut s, json!({"cmd":"expect_roll","what":"Внимательность","mode":"disadvantage"}));
        assert_eq!(read(&s, "18 и 7").roll.unwrap().dice, vec![7]);
        // Слова игрока сильнее объявления.
        assert_eq!(read(&s, "18 и 7 с преимуществом").roll.unwrap().dice, vec![18]);
        declare(&mut s, json!({"cmd":"expect_roll","what":"Внимательность"}));
        assert_eq!(read(&s, "17 — везунчик").roll.unwrap().dice, vec![17]);
        assert_eq!(read(&s, "8 и 17, везунчик").roll.unwrap().dice, vec![17]);
        assert_eq!(read(&s, "17 - преимущество (8 и 17)").roll.unwrap().dice, vec![17]);
        // Без объявления — пара и режим из слов.
        s.set_expected_roll(None);
        assert_eq!(read(&s, "внимательность 4 и 15 с преимуществом").roll.unwrap().dice, vec![15]);
        let roll = read(&s, "внимательность 20").roll.unwrap();
        assert!(roll_line(&roll).contains("натуральная 20"));
    }

    #[test]
    fn damage_dice_from_the_sheet() {
        let mut s = session();
        let (hero, _) = crate::rolls::hero(&s).unwrap();
        let attacks = s.character(&hero).unwrap().details().attacks;
        let (what, sheet) = attacks
            .iter()
            .map(|a| format!("урон: {}", a.name))
            .find_map(|w| hero_roll(&s, &w).ok().filter(|r| !r.dice.is_empty()).map(|r| (w, r)))
            .expect("у героя есть атака с кубами урона");
        declare(&mut s, json!({"cmd":"expect_roll","what": what,"dice":"2d6"}));
        assert_eq!(s.expected_roll().unwrap().dice, "2d6");
        let roll = read(&s, "4 и 5").roll.unwrap();
        assert_eq!((roll.dice.clone(), roll.total()), (vec![4, 5], 9 + sheet.modifier));
        assert!(!roll.d20);
        assert_eq!(read(&s, "9").roll.unwrap().total(), 9 + sheet.modifier);
        assert!(read(&s, "7 и 9").roll.is_none());
        // Без «dice» — кубы урона из листа.
        declare(&mut s, json!({"cmd":"expect_roll","what": what}));
        assert_eq!(s.expected_roll().unwrap().dice, sheet.dice);
    }

    #[test]
    fn roll_total_goes_to_the_turn_check() {
        let mut s = session();
        let p = perception(&s);
        let line =
            roll_total(&mut s, &json!({"cmd":"roll_total","what":"Внимательность","dice":[18]}))
                .unwrap();
        assert!(line.starts_with(&format!("[БРОСОК ИГРОКА] Внимательность — итог {}", 18 + p)));
        assert_eq!(s.turn_ask().roll.as_ref().unwrap().source, PlayerRollSource::Total);
        let two = json!({"cmd":"roll_total","what":"Внимательность","dice":[18, 7]});
        assert!(roll_total(&mut s, &two).is_err());
        let two = json!({"cmd":"roll_total","what":"Внимательность","dice":[18, 7],"mode":"disadvantage"});
        assert!(roll_total(&mut s, &two).unwrap().contains(&format!("итог {}", 7 + p)));
    }

    #[test]
    fn double_modifier_and_empty_scene_are_caught() {
        let mut s = session();
        let roll = PlayerRoll {
            label: "Внимательность".into(),
            dice: vec![19],
            modifier: 1,
            d20: true,
            ..PlayerRoll::default()
        };
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
