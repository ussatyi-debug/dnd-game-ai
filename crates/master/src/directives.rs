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
    all_spells, AssetKind, CardDraft, CardFact, CastMethod, CastRequest, Character, GoalEdit,
    HpChange, Mood, NewNote, NoteEdit, NoteKind, NoteLayer, RecruitRequest, RestKind, SceneChange,
    Session, SheetEdit, SlotRef,
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
    /// Образец команды для повтора после отказа (игроку не показывается).
    #[serde(skip)]
    pub sample: Option<String>,
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
    // Локальные модели иногда пишут команды без блока ```engine: в ```json или просто JSON.
    let (prose, bare) = bare_commands(&prose);
    blocks.extend(bare);
    (prose.trim().to_string(), blocks)
}

/// Конец JSON-значения, начатого `{` или `[` в позиции `start` (с учётом строк).
fn json_end(text: &str, start: usize) -> Option<usize> {
    let mut depth = 0usize;
    let mut in_string = false;
    let mut escaped = false;
    for (i, c) in text[start..].char_indices() {
        if in_string {
            match c {
                _ if escaped => escaped = false,
                '\\' => escaped = true,
                '"' => in_string = false,
                _ => {}
            }
            continue;
        }
        match c {
            '"' => in_string = true,
            '{' | '[' => depth += 1,
            '}' | ']' => {
                depth = depth.checked_sub(1)?;
                if depth == 0 {
                    return Some(start + i + c.len_utf8());
                }
            }
            _ => {}
        }
    }
    None
}

/// Есть ли в JSON команда движка (объект с полем `cmd` или массив таких объектов).
fn is_command(value: &Value) -> bool {
    match value {
        Value::Object(map) => map.get("cmd").is_some_and(Value::is_string),
        Value::Array(items) => !items.is_empty() && items.iter().all(is_command),
        _ => false,
    }
}

/// Вырезает из текста команды, записанные без блока ```engine: блоки ```json и голый JSON
/// с полем `cmd`, начинающийся с новой строки.
fn bare_commands(text: &str) -> (String, Vec<String>) {
    let mut prose = String::new();
    let mut blocks = Vec::new();
    let mut pos = 0;
    while pos < text.len() {
        let line_end = text[pos..].find('\n').map_or(text.len(), |i| pos + i + 1);
        let line = &text[pos..line_end];
        let trimmed = line.trim_start();
        let indent = line.len() - trimmed.len();
        // Блок ```json … ``` или ``` … ``` с командами.
        if let Some(tag) = trimmed.strip_prefix(FENCE) {
            let tag = tag.trim();
            if tag.is_empty() || tag.eq_ignore_ascii_case("json") {
                if let Some(close) = text[line_end..].find(FENCE) {
                    let inner = &text[line_end..line_end + close];
                    if commands(inner).iter().any(|c| c.as_ref().is_ok_and(is_command)) {
                        blocks.push(inner.to_string());
                        let after = line_end + close + FENCE.len();
                        pos = text[after..].find('\n').map_or(text.len(), |i| after + i + 1);
                        continue;
                    }
                }
            }
        }
        // Голый JSON с новой строки.
        if trimmed.starts_with('{') || trimmed.starts_with('[') {
            let start = pos + indent;
            if let Some(end) = json_end(text, start) {
                let candidate = &text[start..end];
                if serde_json::from_str::<Value>(candidate).is_ok_and(|v| is_command(&v)) {
                    blocks.push(candidate.to_string());
                    pos = text[end..].find('\n').map_or(text.len(), |i| end + i + 1);
                    continue;
                }
            }
        }
        prose.push_str(line);
        pos = line_end;
    }
    (prose, blocks)
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

/// Иероглифы и другие азиатские письменности: локальные модели (Qwen) изредка вставляют их
/// посреди русского текста.
fn is_cjk(c: char) -> bool {
    matches!(c as u32,
        0x3000..=0x30FF | 0x3400..=0x4DBF | 0x4E00..=0x9FFF | 0xAC00..=0xD7AF | 0xF900..=0xFAFF | 0xFF00..=0xFF60)
}

/// Чистит ответ мастера: без строк-эха «[ДВИЖОК] …» и без иероглифов.
pub(crate) fn clean_reply(text: &str) -> String {
    text.lines()
        .filter(|l| !l.trim_start().starts_with("[ДВИЖОК]"))
        .filter(|l| !is_service_line(l))
        .filter(|l| !is_empty_aside(l))
        .filter_map(protocol_line)
        .map(|l| {
            strip_html(&cyrillic_words(&l.chars().filter(|c| !is_cjk(*c)).collect::<String>()))
        })
        .collect::<Vec<_>>()
        .join("\n")
        .trim()
        .to_string()
}

/// Строки протокола в рассказе (Gemma, 25.11.2026): «roll Обнаружение магии (магия)» —
/// убирается; «roll [[…]]» и «roll (бросок за игроком)» — без слова «roll»; одинокая «***» —
/// убирается.
fn protocol_line(line: &str) -> Option<String> {
    let t = line.trim();
    if t == "***" || t == "* * *" {
        return None;
    }
    let word = t.get(..4).is_some_and(|w| w.eq_ignore_ascii_case("roll"));
    let rest = t.get(4..).unwrap_or("");
    if !word || !(rest.is_empty() || rest.starts_with(' ')) {
        return Some(line.to_string());
    }
    (rest.contains("[[") || rest.contains("(бросок")).then(|| rest.trim().to_string())
}

/// Пустая пометка вне игры посреди хода: «((Вне игры: нет.))» (лог 22.11, 23:20).
fn is_empty_aside(line: &str) -> bool {
    let t = line.trim();
    let Some(inner) = t.strip_prefix("((").and_then(|r| r.strip_suffix("))")) else {
        return false;
    };
    let inner: String =
        inner.to_lowercase().chars().filter(|c| c.is_alphabetic() || *c == ' ').collect();
    let inner = inner.split_whitespace().collect::<Vec<_>>().join(" ");
    matches!(inner.as_str(), "нет" | "вне игры нет" | "вопросов нет" | "вне игры вопросов нет")
}

/// HTML в рассказе (лог 22.11: «<br>»): переносы — переводом строки, прочие теги — прочь.
/// Убираются только знакомые теги, чтобы «a < b» или «<3» остались как есть.
fn strip_html(line: &str) -> String {
    const BREAKS: &[&str] = &["br", "p", "div", "hr"];
    const TAGS: &[&str] = &["b", "i", "u", "em", "strong", "span", "small", "s"];
    let mut out = String::with_capacity(line.len());
    let mut rest = line;
    while let Some(start) = rest.find('<') {
        out.push_str(&rest[..start]);
        let after = &rest[start + 1..];
        let tag = after.find('>').map(|end| &after[..end]).filter(|t| {
            t.len() <= 40 && t.starts_with(|c: char| c.is_ascii_alphabetic() || c == '/')
        });
        let name = tag.map(|t| {
            t.trim_start_matches('/')
                .trim()
                .split(|c: char| !c.is_ascii_alphabetic())
                .next()
                .unwrap_or("")
                .to_ascii_lowercase()
        });
        match (tag, name) {
            (Some(t), Some(n)) if BREAKS.contains(&n.as_str()) => {
                out.push('\n');
                rest = &after[t.len() + 1..];
            }
            (Some(t), Some(n)) if TAGS.contains(&n.as_str()) => rest = &after[t.len() + 1..],
            _ => {
                out.push('<');
                rest = after;
            }
        }
    }
    out.push_str(rest);
    out
}

/// Слово, где модель смешала алфавиты («interesует»), — целиком кириллицей («интересует»).
/// Слова только латиницей (имена, термины) не трогаются.
fn cyrillic_words(line: &str) -> String {
    let is_cyr = |c: char| matches!(c, 'а'..='я' | 'А'..='Я' | 'ё' | 'Ё');
    let mut out = String::with_capacity(line.len());
    let mut word = String::new();
    let flush = |word: &mut String, out: &mut String| {
        let mixed = word.chars().any(is_cyr) && word.chars().any(|c| c.is_ascii_alphabetic());
        if mixed {
            for c in word.chars() {
                out.push_str(&latin_to_cyrillic(c));
            }
        } else {
            out.push_str(word);
        }
        word.clear();
    };
    for c in line.chars() {
        if c.is_alphabetic() {
            word.push(c);
        } else {
            flush(&mut word, &mut out);
            out.push(c);
        }
    }
    flush(&mut word, &mut out);
    out
}

/// Латинская буква — кириллицей по звучанию; остальные символы — как есть.
fn latin_to_cyrillic(c: char) -> String {
    let lower = match c.to_ascii_lowercase() {
        'a' => "а",
        'b' => "б",
        'c' | 'k' | 'q' => "к",
        'd' => "д",
        'e' => "е",
        'f' => "ф",
        'g' => "г",
        'h' => "х",
        'i' => "и",
        'j' => "й",
        'l' => "л",
        'm' => "м",
        'n' => "н",
        'o' => "о",
        'p' => "п",
        'r' => "р",
        's' => "с",
        't' => "т",
        'u' => "у",
        'v' | 'w' => "в",
        'x' => "кс",
        'y' => "ы",
        'z' => "з",
        _ => return c.to_string(),
    };
    if c.is_ascii_uppercase() {
        lower.to_uppercase()
    } else {
        lower.to_string()
    }
}

/// Служебная строка: мастер рассуждает вслух и показывает игроку внутренние имена движка
/// («feat.mi.wizard.spell», «pc.hero», «slots.1»). В рассказе таких строк быть не должно.
fn is_service_line(line: &str) -> bool {
    let text = line.trim();
    if text.is_empty() {
        return false;
    }
    let id_like = |word: &str| {
        let word = word.trim_matches(|c: char| !c.is_ascii_alphanumeric() && c != '.' && c != '_');
        word.contains('.')
            && word.len() >= 5
            && word
                .chars()
                .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '.' || c == '_')
            && word.split('.').filter(|p| !p.is_empty()).count() >= 2
            && !word.ends_with('.')
    };
    text.split_whitespace().any(id_like)
}

/// Текст без блоков команд (для показа ответа, пока он печатается).
pub fn strip_directives(text: &str) -> String {
    split(text).0
}

/// Отделяет живую сводку «СЕЙЧАС» от рассказа: мастер пишет её в конце ответа, игрок видит
/// сводку в «Обстановке», а не в чате. Возвращает (рассказ, сводка).
pub(crate) fn split_now(text: &str) -> (String, String) {
    let mut prose: Vec<&str> = Vec::new();
    let mut now: Vec<&str> = Vec::new();
    let mut in_now = false;
    for line in text.lines() {
        if let Some(rest) = now_header(line) {
            in_now = true;
            if !rest.is_empty() {
                now.push(rest);
            }
            continue;
        }
        if in_now {
            now.push(line);
        } else {
            prose.push(line);
        }
    }
    let now: Vec<&str> = now
        .iter()
        .map(|l| l.trim().trim_start_matches(['-', '*', '•']).trim())
        .filter(|l| !l.is_empty() && !is_now_noise(l))
        .collect();
    (prose.join("\n").trim().to_string(), now.join("\n"))
}

/// Заголовок сводки: «СЕЙЧАС» отдельной строкой (как угодно оформленный) или «СЕЙЧАС: текст»
/// в одну строку (лог 22.11: Haiku перешла на такой вид, и сводка застыла). Текст на строке
/// заголовка — только после заглавного «СЕЙЧАС», чтобы не спутать с «Сейчас, князь…» в рассказе.
/// Возвращает текст после заголовка (пустой — заголовок без текста).
fn now_header(line: &str) -> Option<&str> {
    let bare = line.trim().trim_matches(|c: char| !c.is_alphanumeric());
    if bare.to_lowercase() == "сейчас" {
        return Some("");
    }
    let rest = line.trim_start().trim_start_matches(|c: char| !c.is_alphanumeric());
    let rest = rest.strip_prefix("СЕЙЧАС")?;
    if rest.starts_with(char::is_alphanumeric) {
        return None;
    }
    let rest = rest.trim_start_matches([' ', ':', '—', '–', '-', '*', '»', '"', '.', ')', '_']);
    // Без двоеточия или тире после «СЕЙЧАС» и с текстом — это строчка рассказа заглавными.
    let marked = line.contains("СЕЙЧАС:")
        || line.contains("СЕЙЧАС —")
        || line.contains("СЕЙЧАС –")
        || line.contains("СЕЙЧАС -")
        || line.contains("СЕЙЧАС**")
        || line.contains("СЕЙЧАС»");
    marked.then_some(rest.trim())
}

/// Служебная строка в сводке «СЕЙЧАС»: внутренние имена («loc.mole_hole») или слова о движке
/// («Движок не нашёл карточку по этому id»). Игрок видит сводку в «Обстановке».
fn is_now_noise(line: &str) -> bool {
    is_service_line(line)
        || line.split(|c: char| !c.is_alphabetic()).any(|w| {
            let w = w.to_lowercase();
            w == "движок" || w.starts_with("движк")
        })
}

/// Живая сводка «СЕЙЧАС» из ответа мастера (двухшаговый ход: её сохраняет вызывающий код).
pub fn scene_now(text: &str) -> String {
    split_now(&split(text).0).1
}

/// Пометка мастера «ход ничего не изменил»: второй шаг можно не делать.
fn no_changes_line(line: &str) -> bool {
    let line = line.trim().trim_matches(|c: char| !c.is_alphanumeric()).to_lowercase();
    line == "без изменений"
}

/// Двухшаговый ход: рассказ для игрока, команды, которые мастер написал в рассказе
/// (подсказка второму шагу; броски и запросы отброшены), и пометка «без изменений».
pub fn narration_parts(text: &str) -> (String, String, bool) {
    let (prose, blocks) = split(text);
    let (prose, _) = split_now(&prose);
    let no_changes = prose.lines().any(no_changes_line);
    let prose: String =
        prose.lines().filter(|l| !no_changes_line(l)).collect::<Vec<_>>().join("\n");
    let lines: Vec<String> = blocks
        .iter()
        .flat_map(|b| commands(b))
        .filter_map(Result::ok)
        .filter(|v| !matches!(v.get("cmd").and_then(Value::as_str), Some("roll" | "query")))
        .map(|v| v.to_string())
        .collect();
    let written = if lines.is_empty() {
        String::new()
    } else {
        format!("```engine\n{}\n```", lines.join("\n"))
    };
    (clean_reply(&prose), written, no_changes && lines.is_empty())
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
pub(crate) fn find_character(session: &Session, key: &str) -> Result<String, String> {
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

/// Поля цели из команды `new_card` / `edit_card` / `goal` (без статуса).
fn goal_edit(cmd: &Value) -> GoalEdit {
    let text = |key: &str| cmd.get(key).and_then(Value::as_str).map(str::to_string);
    let number =
        |key: &str| cmd.get(key).and_then(Value::as_u64).and_then(|n| usize::try_from(n).ok());
    GoalEdit {
        giver: text("giver"),
        reward: text("reward"),
        due_day: cmd.get("due_day").and_then(Value::as_u64).and_then(|d| u32::try_from(d).ok()),
        steps: cmd
            .get("steps")
            .and_then(Value::as_array)
            .map(|items| items.iter().filter_map(|v| v.as_str().map(str::to_string)).collect()),
        add_step: text("add_step"),
        step_done: number("step_done"),
        step_undone: number("step_undone"),
        log: text("log"),
        status: None,
    }
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
            // «advance»: сколько прошло — числом минут или словами («30 мин», «1 ч 15 мин»).
            let advance = match cmd.get("advance") {
                None | Some(Value::Null) => None,
                Some(Value::Number(n)) => Some(
                    n.as_i64()
                        .filter(|m| *m > 0)
                        .ok_or_else(|| format!("неверное «advance» {n} — минуты больше нуля"))?,
                ),
                Some(Value::String(text)) => {
                    Some(dnd_engine::clock::duration(text).ok_or_else(|| {
                        format!("не понял «advance»: «{text}» — пиши «30 мин», «2 ч», «1 ч 15 мин»")
                    })?)
                }
                Some(other) => return Err(format!("неверное «advance» {other}")),
            };
            let change = SceneChange {
                day,
                time: opt_text(cmd, "time").map(Into::into),
                advance,
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
        "roll" | "query" => {
            Err("лимит запросов за ход исчерпан (3) — броски и запросы делай раньше, до итога хода"
                .into())
        }
        "chronicle" => (|| -> Result<String, String> {
            let day = int_field(cmd, "day").unwrap_or_else(|| i64::from(session.scene().day));
            let day = u32::try_from(day).map_err(|_| format!("неверный день {day}"))?;
            engine(session.write_chronicle(day, opt_text(cmd, "text").unwrap_or("")))?;
            Ok(last_log(session))
        })(),
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
            // Слой мастер называет и «scope», и «target» (лог 22.11): поле не теряется.
            let layer_field = opt_text(cmd, "layer")
                .or_else(|| opt_text(cmd, "scope"))
                .or_else(|| opt_text(cmd, "target"));
            let layer = match layer_field {
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
            // Тайна, план и таймер без слоя — журнал мастера: игроку их видеть нельзя.
            let layer = layer.unwrap_or(match kind {
                Some(NoteKind::Secret | NoteKind::Plan | NoteKind::Timer) => NoteLayer::Master,
                _ => NoteLayer::Player,
            });
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
            let goal = goal_edit(cmd);
            let draft = CardDraft {
                layer: field("layer"),
                section: field("section"),
                title: field("title"),
                subtitle: field("subtitle"),
                summary: field("summary"),
                facts,
                status: field("status"),
                text: field("text"),
                parent: field("parent"),
                goal: (goal != GoalEdit::default()).then_some(goal),
            };
            if name == "new_card" {
                engine(session.create_card(draft, false))?;
            } else {
                engine(session.update_card(text_field(cmd, "card")?, draft))?;
            }
            Ok(last_log(session))
        })(),
        "recruit" => (|| -> Result<String, String> {
            let text = |key: &str| opt_text(cmd, key).unwrap_or("").to_string();
            let level = int_field(cmd, "level").and_then(|l| u32::try_from(l).ok()).unwrap_or(0);
            engine(session.request_recruit(RecruitRequest {
                id: 0,
                name: text("name"),
                species: text("species"),
                class: text("class"),
                subclass: text("subclass"),
                background: text("background"),
                level,
                gender: text("gender"),
                alignment: text("alignment"),
                appearance: text("appearance"),
                note: text("note"),
            }))?;
            Ok(last_log(session))
        })(),
        "buy" => (|| -> Result<String, String> {
            let what = text_field(cmd, "item").or_else(|_| text_field(cmd, "what"))?;
            let price = text_field(cmd, "price")?;
            // Без места — движок платит из того, что при себе (кошелёк, затем Кольцо Теневого Хранилища).
            let location = opt_text(cmd, "location").unwrap_or("");
            engine(session.master_buy(what, price, location))?;
            Ok(last_log(session))
        })(),
        "xp_note" => (|| -> Result<String, String> {
            let xp = int_field(cmd, "xp").and_then(|v| u32::try_from(v).ok()).unwrap_or(0);
            // Опыт — по таблице за противников и испытания по замыслу сцены, не за проверки.
            let note = text_field(cmd, "text")?.to_lowercase();
            if ["проверк", "спасброс", "скрытност", "анализ", "внимательност", "бросок "]
                .iter()
                .any(|w| note.contains(w))
                && !["бой", "противник", "враг", "побе", "одолел"].iter().any(|w| note.contains(w))
            {
                return Err(
                    "опыт за проверки не даётся: пометка — за противников (ПО по таблице), \
испытание или веху сцены"
                        .into(),
                );
            }
            engine(session.note_xp(text_field(cmd, "text")?, xp))?;
            Ok(last_log(session))
        })(),
        "xp" => (|| -> Result<String, String> {
            let each = int_field(cmd, "each")
                .and_then(|v| u32::try_from(v).ok())
                .ok_or("у xp нет числа each — опыт каждому члену отряда")?;
            engine(session.award_xp(each, opt_text(cmd, "reason").unwrap_or("")))?;
            Ok(last_log(session))
        })(),
        "goal" => (|| -> Result<String, String> {
            let mut edit = goal_edit(cmd);
            edit.status = opt_text(cmd, "status").map(Into::into);
            if edit == GoalEdit::default() {
                return Err(
                    "у goal нечего менять: step_done, add_step, log, status, due_day…".into()
                );
            }
            engine(session.update_goal(text_field(cmd, "card")?, edit))?;
            Ok(last_log(session))
        })(),
        "combat" => crate::combat::run_combat(session, cmd),
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
            // Ячейку этого круга мастер уже потратил командой slot в этом ходу (лог 25.11.2026:
            // slot + исправленный cast — две ячейки за одно заклинание): cast берёт её.
            let wanted = slot_ref(cmd.get("slot"))?;
            let spent = wanted.and_then(|slot| spent_slot_this_turn(session, &character, slot));
            if let (Some(slot), Some(key)) = (wanted, &spent) {
                session.change_slot(&character, slot, false).map_err(|e| e.to_string())?;
                session.record_turn_command(format!("refund:{key}"));
            }
            let cast = session.cast_spell(&character, &request);
            if let (Err(_), Some(slot), Some(_)) = (&cast, wanted, &spent) {
                let _ = session.change_slot(&character, slot, true);
            }
            let note = if spent.is_some() {
                " (ячейка — та, что потрачена командой slot)"
            } else {
                ""
            };
            cast.map(|o| format!("{}{note}", o.summary)).map_err(|e| e.to_string())
        }
        "copy_spell" => {
            let spell = find_spell(text_field(cmd, "spell")?);
            let from_scroll = opt_text(cmd, "source") == Some("scroll");
            session.copy_spell(&character, &spell, from_scroll).map_err(|e| e.to_string())
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
            let resource = text_field(cmd, "resource")?;
            // Заряд предмета-восстановителя (жезл договора) списан тратой ресурса вместо
            // restore: заряд без ячейки пропадал (лог 23.11.2026) — движок делает restore.
            if delta == -1 {
                if let Some(slot) = session.restorer_slot(&character, resource) {
                    return session
                        .restore_slot_with(&character, resource, slot)
                        .map(|o| o.summary)
                        .map_err(|e| e.to_string());
                }
            }
            engine(session.adjust_resource(&character, resource, delta))?;
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
            let mut lines = Vec::new();
            if let Some(location) = opt_text(cmd, "location") {
                engine(session.move_character(&character, location))?;
                lines.push(last_log(session));
            }
            // Поручение спутника: "task" — дать (пустое — снять), "done":true — выполнено.
            // «done» решает первым: с ним пустой "task" не делает поручение отменённым, а
            // непустой — новое поручение после выполненного.
            let done = cmd.get("done").and_then(Value::as_bool) == Some(true);
            let task = cmd.get("task").and_then(Value::as_str).map(str::trim);
            let closing = done || task == Some("");
            if done {
                lines.extend(session.clear_task(&character, "выполнено"));
            }
            match task {
                Some("") if !done => lines.extend(session.clear_task(&character, "отменено")),
                Some("") | None => {}
                Some(task) => lines.push(engine(session.set_task(&character, task))?),
            }
            // Снимать нечего — не ошибка: повтор с исправлением стоил бы лишнего запроса.
            if lines.is_empty() && closing {
                lines.push(format!("{character}: поручения не было"));
            }
            if lines.is_empty() {
                return Err("у move нужно поле «location», «task» или «done»".into());
            }
            Ok(lines.join("; "))
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
    let (text, now) = split_now(&text);
    let before = session.checkpoint();
    session.begin_turn_commands();
    // Ответ вне игры «((…))»: мир стоит — без сводки, команд, хода времени и счётчика боя.
    // Решает ответ мастера, а не заявка игрока.
    let out_of_game = is_out_of_game(&text);
    session.set_turn_out_of_game(out_of_game);
    if out_of_game {
        // Учёт и исправления по просьбе игрока («начисли опыт», «поправь место») вне игры
        // выполняются; время, отдых, бой, найм и действия — только игровым ходом (логи 22.11).
        let (allowed, skipped) = out_of_game_commands(&blocks);
        if !skipped.is_empty() {
            session.log(format!(
                "Ответ вне игры: не выполнено — {} (время, отдых, бой, найм и действия — только \
игровым ходом)",
                skipped.join(", ")
            ));
        }
        let actions = run_blocks(session, &allowed, false);
        let summaries = actions.iter().filter(|a| a.ok).map(|a| a.summary.clone()).collect();
        session.commit_master_turn(before, summaries);
        return MasterTurn { text: clean_reply(&text), actions, fabricated: Vec::new() };
    }
    if !now.is_empty() {
        session.set_scene_now(&now);
    }
    let actions = run_blocks(session, &blocks, false);
    if !text.trim().is_empty() {
        session.note_met_in_narration(&text);
    }
    // Пропуски и пустые команды в список «отменить действия мастера» не идут.
    let summaries = actions
        .iter()
        .filter(|a| a.ok && !a.summary.starts_with("ничего не изменилось"))
        .map(|a| a.summary.clone())
        .collect();
    session.commit_master_turn(before, summaries);
    MasterTurn { text: clean_reply(&text), actions, fabricated: Vec::new() }
}

/// Команды, которые вне игры двигают мир: отдых, бой, найм, покупка, заклинание, переписывание
/// свитка. Время (`scene` с `time`, `day`, `advance`) — тоже; остальное — учёт и исправления
/// (решение владельца 23.11.2026).
const OUT_OF_GAME_REFUSED: &[&str] = &["rest", "combat", "recruit", "buy", "cast", "copy_spell"];

/// Делит команды ответа вне игры: учёт и исправления (одним блоком) и названия остальных — для
/// журнала. Броски и запросы движок уже обслужил до итога хода — их не считаем.
fn out_of_game_commands(blocks: &[String]) -> (Vec<String>, Vec<String>) {
    let mut allowed = Vec::new();
    let mut skipped = Vec::new();
    for cmd in blocks.iter().flat_map(|b| commands(b)) {
        match cmd {
            Ok(value) => {
                let name = value.get("cmd").and_then(Value::as_str).unwrap_or("?").to_string();
                let moves_time = name == "scene"
                    && ["time", "day", "advance"]
                        .iter()
                        .any(|f| value.get(f).is_some_and(|v| !v.is_null()));
                if matches!(name.as_str(), "roll" | "query") {
                    continue;
                }
                if OUT_OF_GAME_REFUSED.contains(&name.as_str()) || moves_time {
                    skipped.push(if moves_time {
                        "scene со временем".into()
                    } else {
                        name
                    });
                } else {
                    allowed.push(value.to_string());
                }
            }
            Err(_) => skipped.push("неразобранная команда".into()),
        }
    }
    let block = if allowed.is_empty() { Vec::new() } else { vec![allowed.join("\n")] };
    (block, skipped)
}

/// Рассказ (без блоков команд и «СЕЙЧАС») целиком в двойных скобках «((…))».
fn is_out_of_game(prose: &str) -> bool {
    let t = prose.trim();
    if !t.starts_with("((") {
        return false;
    }
    if t.ends_with("))") {
        return true;
    }
    // Фраза из кодекса за скобками («Это по вопросу вне игры… продолжаем?») — всё равно ответ вне
    // игры (лог 22.11, 23:19).
    t.rfind("))").is_some_and(|end| {
        let tail = t[end + 2..].trim().to_lowercase();
        tail.chars().count() <= 160 && (tail.contains("вне игры") || tail.contains("продолжаем"))
    })
}

/// Ответ мастера вне игры: весь рассказ в двойных скобках «((…))» (решение 22.11.2026).
/// По нему движок не двигает время, сводку «СЕЙЧАС» и бой; из команд — только учёт.
pub fn out_of_game_reply(reply: &str) -> bool {
    let (text, _) = split(reply);
    let (text, _) = split_now(&text);
    is_out_of_game(&text)
}

/// Отказ, после которого ничего делать не нужно: ячейки уже свободны, количество нулевое.
/// Такие команды мастер часто шлёт после отдыха; просить за них исправление — пустая трата
/// запроса к модели, поэтому движок отвечает «ничего не изменилось».
fn nothing_to_do(reason: &str) -> bool {
    let reason = reason.to_lowercase();
    ["и так свободны", "уже полон", "уже восстановлен", "больше нуля", "не пересказывает"]
        .iter()
        .any(|mark| reason.contains(mark))
}

/// Канонический вид команды: ключи JSON отсортированы, поэтому одинаковые команды дают
/// одинаковую строку.
fn command_key(cmd: &Value) -> String {
    cmd.to_string()
}

/// Имя команды для пропуска-повтора; без `cmd` — «без имени».
fn command_name(cmd: &Value) -> String {
    cmd.get("cmd").and_then(Value::as_str).unwrap_or("без имени").to_string()
}

/// Выполняет команды блоков. `skip_repeats` — пропускать команды, уже выполненные в этом ходу
/// (исправление отказов: мастер часто присылает весь ход заново, и движок выполнял его дважды).
fn run_blocks(session: &mut Session, blocks: &[String], skip_repeats: bool) -> Vec<MasterAction> {
    let mut actions = Vec::new();
    let mut deferred: Vec<(usize, Value)> = Vec::new();
    for block in blocks {
        for cmd in commands(block) {
            if skip_repeats {
                if let Ok(cmd) = &cmd {
                    let key = command_key(cmd);
                    if session.turn_command_done(&key) {
                        let name = command_name(cmd);
                        session.log(format!("Повтор пропущен: «{name}» уже выполнена в этом ходу"));
                        actions.push(MasterAction {
                            ok: true,
                            summary: format!("повтор пропущен: «{name}»"),
                            sample: None,
                        });
                        continue;
                    }
                }
            }
            let key = cmd.as_ref().ok().map(command_key);
            let name = cmd.as_ref().ok().map(command_name);
            let value = cmd.as_ref().ok().cloned();
            let result = cmd.and_then(|cmd| run(session, &cmd));
            if result.is_ok() {
                if let Some(key) = key {
                    session.record_turn_command(key);
                }
            }
            // Ячейку вернули раньше, чем потратили (заявка «накладываю и восстанавливаю»):
            // восстановление повторяется в конце команд хода.
            if let (Err(reason), Some(value)) = (&result, value) {
                if slots_full(reason) && restores_slot(&value) {
                    deferred.push((actions.len(), value));
                }
            }
            actions.push(match result {
                Ok(summary) => MasterAction { ok: true, summary, sample: None },
                Err(reason) if nothing_to_do(&reason) => {
                    session.log(format!("Ничего не изменилось: {reason}"));
                    MasterAction {
                        ok: true,
                        summary: format!("ничего не изменилось: {reason}"),
                        sample: None,
                    }
                }
                Err(reason) => {
                    // Ошибки самого движка уже записаны в журнал; ошибки формата — нет.
                    if session.engine_log().last().is_none_or(|l| !l.contains(&reason)) {
                        session.log(format!("Отказ (команда мастера): {reason}"));
                    }
                    MasterAction {
                        ok: false,
                        summary: reason,
                        sample: name.as_deref().and_then(crate::codex::command_sample),
                    }
                }
            });
        }
    }
    for (index, value) in deferred {
        if let Ok(summary) = run(session, &value) {
            session.record_turn_command(command_key(&value));
            actions[index] = MasterAction { ok: true, summary, sample: None };
        }
    }
    actions
}

/// Команда slot этого хода, которой потрачена такая ячейка героя и которую ещё не забрал cast.
fn spent_slot_this_turn(session: &Session, character: &str, slot: SlotRef) -> Option<String> {
    session
        .turn_commands()
        .iter()
        .filter(|key| !session.turn_command_done(&format!("refund:{key}")))
        .find(|key| {
            let Ok(cmd) = serde_json::from_str::<Value>(key) else { return false };
            cmd.get("cmd").and_then(Value::as_str) == Some("slot")
                && cmd.get("spend").and_then(Value::as_bool) != Some(false)
                && slot_ref(cmd.get("level")).ok().flatten() == Some(slot)
                && cmd
                    .get("character")
                    .and_then(Value::as_str)
                    .and_then(|c| find_character(session, c).ok())
                    .as_deref()
                    == Some(character)
        })
        .cloned()
}

/// Отказ «все ячейки и так свободны».
fn slots_full(reason: &str) -> bool {
    reason.contains("и так свободны")
}

/// Команда возвращает ячейку предметом: restore или трата заряда восстановителя.
fn restores_slot(cmd: &Value) -> bool {
    match cmd.get("cmd").and_then(Value::as_str) {
        Some("restore") => true,
        Some("resource") => cmd.get("delta").and_then(Value::as_i64) == Some(-1),
        _ => false,
    }
}

/// Сообщение мастеру об отказах движка: просьба прислать исправленные команды.
/// `None` — все команды выполнены.
pub fn repair_request(actions: &[MasterAction]) -> Option<String> {
    let failed: Vec<&MasterAction> = actions.iter().filter(|a| !a.ok).collect();
    if failed.is_empty() {
        return None;
    }
    let mut text = String::from("[ДВИЖОК] Эти команды не выполнены:\n");
    for a in failed {
        text.push_str(&format!("- {}\n", a.summary));
        if let Some(sample) = &a.sample {
            text.push_str(&format!("  Образец: {sample}\n"));
        }
    }
    text.push_str(
        "Пришли ТОЛЬКО исправленные команды в одном блоке ```engine, без рассказа. Остальные \
команды этого хода уже выполнены — не присылай их снова (движок их пропустит). Формат — по \
кодексу: временные хиты — {\"cmd\":\"hp\",\"character\":\"…\",\"temp\":N}, id ресурсов — из «листы». \
Если команда не нужна — ответь пустым блоком ```engine```.",
    );
    Some(text)
}

/// Выполняет исправленные команды из ответа на [`repair_request`] и дописывает их к текущему
/// ходу мастера (одна отмена откатывает весь ход). Текст ответа игнорируется.
pub fn apply_repair(session: &mut Session, reply: &str) -> Vec<MasterAction> {
    let (_, blocks) = split(reply);
    let before = session.checkpoint();
    let actions = run_blocks(session, &blocks, true);
    let summaries = actions
        .iter()
        .filter(|a| {
            a.ok && !a.summary.starts_with("ничего не изменилось")
                && !a.summary.starts_with("повтор пропущен")
        })
        .map(|a| a.summary.clone())
        .collect();
    session.extend_master_turn(before, summaries);
    actions
}

#[cfg(test)]
mod tests {
    use super::*;
    use dnd_engine::Xoshiro256;

    fn session() -> Session {
        Session::demo(Xoshiro256::from_seed(5))
    }

    #[test]
    fn move_with_task_keeps_order_and_done_clears_it() {
        let mut s = session();
        let turn = apply_directives(
            &mut s,
            "Гюнтер уходит.\n```engine\n{\"cmd\":\"move\",\"character\":\"npc.gunther\",\"location\":\"ратуша\",\"task\":\"найти капитана стражи\"}\n```",
        );
        assert!(turn.actions[0].ok, "{:?}", turn.actions);
        assert_eq!(s.task_of("npc.gunther").unwrap().text, "найти капитана стражи");
        let done = apply_directives(
            &mut s,
            "Гюнтер справился.\n```engine\n{\"cmd\":\"move\",\"character\":\"npc.gunther\",\"done\":true}\n```",
        );
        assert!(done.actions[0].ok, "{:?}", done.actions);
        assert!(s.tasks().is_empty());
        // Пустой "task" вместе с "done" — выполнено, а не отменено (лог 22.11).
        apply_directives(
            &mut s,
            "```engine\n{\"cmd\":\"move\",\"character\":\"npc.gunther\",\"task\":\"привести наряд\"}\n```",
        );
        let done = apply_directives(
            &mut s,
            "```engine\n{\"cmd\":\"move\",\"character\":\"npc.gunther\",\"task\":\"\",\"done\":true}\n```",
        );
        assert!(done.actions[0].summary.contains("выполнено"), "{:?}", done.actions);
        assert!(s.tasks().is_empty());
        // Снимать нечего — без отказа и повтора.
        let again = apply_directives(
            &mut s,
            "```engine\n{\"cmd\":\"move\",\"character\":\"npc.gunther\",\"done\":true}\n```",
        );
        assert!(again.actions[0].ok, "{:?}", again.actions);
    }

    #[test]
    fn now_summary_drops_service_lines() {
        let (text, now) = split_now(
            "Крот молчит.\nСЕЙЧАС\n- Кротовая Нора, вечер\n- Движок не нашёл карточку по этому id\n- loc.mole_hole рядом\n- Движение у пристани",
        );
        assert_eq!(text, "Крот молчит.");
        assert_eq!(now, "Кротовая Нора, вечер\nДвижение у пристани");
    }

    #[test]
    fn note_layer_by_scope_and_kind() {
        let mut s = session();
        let turn = apply_directives(
            &mut s,
            concat!(
                "```engine\n",
                "{\"cmd\":\"note\",\"scope\":\"master\",\"kind\":\"timer\",\"due_day\":100,\"title\":\"Встреча\",\"text\":\"Шрам придёт\"}\n",
                "{\"cmd\":\"note\",\"kind\":\"secret\",\"title\":\"Предупреждение\",\"text\":\"Брока предупредили\"}\n",
                "{\"cmd\":\"note\",\"kind\":\"plan\",\"title\":\"Аванс\",\"text\":\"Крот проверит баржи\"}\n",
                "{\"cmd\":\"note\",\"target\":\"player\",\"title\":\"Отчёт\",\"text\":\"Брок ушёл утром\"}\n",
                "{\"cmd\":\"note\",\"title\":\"Награда\",\"text\":\"Объявлена награда\"}\n",
                "```"
            ),
        );
        assert!(turn.actions.iter().all(|a| a.ok), "{:?}", turn.actions);
        let layers: Vec<NoteLayer> = s.notes().iter().map(|n| n.layer).collect();
        assert_eq!(
            layers,
            vec![
                NoteLayer::Master,
                NoteLayer::Master,
                NoteLayer::Master,
                NoteLayer::Player,
                NoteLayer::Player
            ]
        );
    }

    #[test]
    fn out_of_game_reply_keeps_world_and_now() {
        let mut s = session();
        let time = s.scene().time.clone();
        s.set_scene_now("Склад, Гюнтер у лестницы");
        let reply = "((Вне игры: бонусное действие у тебя ещё есть. Это по вопросу вне игры. \
Если вопросов больше нет — продолжаем?))\n```engine\n{\"cmd\":\"rest\",\"kind\":\"short\"}\n{\"cmd\":\"scene\",\"time\":\"23:00\"}\n```\nСЕЙЧАС\n- Лист на ящике";
        assert!(out_of_game_reply(reply));
        let turn = apply_directives(&mut s, reply);
        assert!(turn.actions.is_empty());
        assert!(turn.text.starts_with("(("));
        assert_eq!(s.scene().time, time);
        assert_eq!(s.scene().now, "Склад, Гюнтер у лестницы");
        assert!(!out_of_game_reply("Гюнтер (молча) кивает."));
        // Фраза из кодекса за скобками — тоже вне игры (лог 22.11, 23:19).
        assert!(out_of_game_reply(
            "((Бросок 7 записан.))\n\nЭто по вопросу вне игры. Если вопросов больше нет, продолжаем?"
        ));
        assert!(!out_of_game_reply("((Шёпот.)) Стражник поворачивается к вам и долго смотрит."));
    }

    #[test]
    fn out_of_game_runs_corrections() {
        let mut s = session();
        let hp = s.character("npc.gunther").unwrap().hit_points.current;
        let time = s.scene().time.clone();
        let reply = concat!(
            "((Место исправлено, Гюнтер остаётся в гостинице.))\n",
            "```engine\n",
            "{\"cmd\":\"scene\",\"location\":\"Застава «Железные Врата»\"}\n",
            "{\"cmd\":\"move\",\"character\":\"npc.gunther\",\"location\":\"Гостиница\"}\n",
            "{\"cmd\":\"hp\",\"character\":\"npc.gunther\",\"damage\":3}\n",
            "```"
        );
        let turn = apply_directives(&mut s, reply);
        assert!(turn.actions.iter().all(|a| a.ok), "{:?}", turn.actions);
        assert_eq!(turn.actions.len(), 3);
        assert_eq!(s.scene().location, "Застава «Железные Врата»");
        assert_eq!(s.scene().time, time);
        assert_eq!(s.character("npc.gunther").unwrap().location, "Гостиница");
        assert_eq!(s.character("npc.gunther").unwrap().hit_points.current, hp - 3);
    }

    #[test]
    fn html_and_empty_asides_are_cleaned() {
        assert_eq!(clean_reply("Корвус ждёт.<br>Ворота близко."), "Корвус ждёт.\nВорота близко.");
        assert_eq!(clean_reply("Он <b>молчит</b>, a < b и <3."), "Он молчит, a < b и <3.");
        assert_eq!(clean_reply("Вы выезжаете.\n\n((Вне игры: нет.))"), "Вы выезжаете.");
        assert_eq!(
            clean_reply("((Вне игры: у Корвуса 3 хита.))"),
            "((Вне игры: у Корвуса 3 хита.))"
        );
    }

    #[test]
    fn out_of_game_runs_bookkeeping_only() {
        let mut s = session();
        let time = s.scene().time.clone();
        let reply = concat!(
            "((Опыт за день начисляю. Это по вопросу вне игры. Если вопросов больше нет — продолжаем?))\n",
            "```engine\n",
            "{\"cmd\":\"xp\",\"each\":140,\"reason\":\"День 98: допрос\"}\n",
            "{\"cmd\":\"scene\",\"advance\":\"2 ч\"}\n",
            "```"
        );
        let turn = apply_directives(&mut s, reply);
        assert_eq!(turn.actions.len(), 1, "{:?}", turn.actions);
        assert!(
            turn.actions[0].ok && turn.actions[0].summary.contains("140"),
            "{:?}",
            turn.actions
        );
        assert_eq!(s.scene().time, time);
        assert!(
            s.engine_log().iter().any(|l| l.contains("не выполнено — scene")),
            "{:?}",
            s.engine_log()
        );
    }

    #[test]
    fn inline_now_summary_is_recognised() {
        for (text, now) in [
            (
                "Ужин подан.\n\nСЕЙЧАС: Малый зал, 19:20. Ужин подан.",
                "Малый зал, 19:20. Ужин подан.",
            ),
            ("Двор.\n**СЕЙЧАС:** Двор, вечер.\n- Корвус у ворот", "Двор, вечер.\nКорвус у ворот"),
            ("Двор.\n«СЕЙЧАС»\nДвор, утро", "Двор, утро"),
            ("Двор.\nСЕЙЧАС — Двор, утро", "Двор, утро"),
        ] {
            let (prose, got) = split_now(text);
            assert_eq!(got, now, "{text}");
            assert!(!prose.contains("СЕЙЧАС"), "{prose}");
        }
        // Обычное «Сейчас» в рассказе и строка заглавными без двоеточия — не сводка.
        let (prose, now) = split_now("Сейчас, князь, вы всё поймёте.\nСЕЙЧАС ВСЁ РЕШИТСЯ!");
        assert!(now.is_empty());
        assert!(prose.contains("СЕЙЧАС ВСЁ РЕШИТСЯ!"));
    }

    #[test]
    fn scene_advance_in_words() {
        let mut s = session();
        apply_directives(&mut s, "```engine\n{\"cmd\":\"scene\",\"time\":\"18:10\"}\n```");
        let turn = apply_directives(
            &mut s,
            "```engine\n{\"cmd\":\"scene\",\"advance\":\"1 ч 15 мин\"}\n```",
        );
        assert!(turn.actions[0].ok, "{:?}", turn.actions);
        assert_eq!(s.scene().time.as_deref(), Some("19:25"));
        let turn = apply_directives(&mut s, "```engine\n{\"cmd\":\"scene\",\"advance\":30}\n```");
        assert!(turn.actions[0].ok, "{:?}", turn.actions);
        assert_eq!(s.scene().time.as_deref(), Some("19:55"));
        let turn = apply_directives(
            &mut s,
            "```engine\n{\"cmd\":\"scene\",\"advance\":\"чуть позже\"}\n```",
        );
        assert!(!turn.actions[0].ok);
    }

    #[test]
    fn mixed_alphabet_words_become_cyrillic() {
        assert_eq!(clean_reply("Меня interesует не это."), "Меня интересует не это.");
        assert_eq!(clean_reply("Капитан взял iPhone и XP."), "Капитан взял iPhone и XP.");
    }

    #[test]
    fn failed_command_brings_a_sample() {
        let mut s = session();
        let turn = apply_directives(
            &mut s,
            "```engine\n{\"cmd\":\"move\",\"character\":\"npc.gunther\"}\n```",
        );
        assert!(!turn.actions[0].ok);
        let repair = repair_request(&turn.actions).unwrap();
        assert!(repair.contains("Образец: {\"cmd\":\"move\""), "{repair}");
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
        let reply = "Свет.\n```engine\n{\"cmd\":\"cast\",\"character\":\"npc.valeria\",\"spell\":\"bless\",\"slot\":2}\n{\"cmd\":\"slot\",\"character\":\"gunther\",\"level\":1}\n{\"cmd\":\"cast\",\"character\":\"pc.nikis\",\"spell\":\"Далёкий шаг\",\"slot\":\"pact\"}\n```";
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
    fn failed_commands_are_repaired_in_the_same_turn() {
        let mut s = session();
        let hp = s.character("pc.nikis").unwrap().hit_points.current;
        let turn = apply_directives(
            &mut s,
            "Удар.\n```engine\n{\"cmd\":\"hp\",\"character\":\"pc.nikis\",\"damage\":5}\n{\"cmd\":\"resource\",\"character\":\"pc.nikis\",\"resource\":\"temp_hp\",\"delta\":-8}\n```",
        );
        let request = repair_request(&turn.actions).unwrap();
        assert!(request.contains("temp_hp"));
        let fixed = apply_repair(
            &mut s,
            "```engine\n{\"cmd\":\"hp\",\"character\":\"pc.nikis\",\"temp\":8}\n```",
        );
        assert!(fixed[0].ok, "{fixed:?}");
        assert_eq!(s.master_undo_info().unwrap().actions.len(), 2);
        s.undo_master_turn().unwrap();
        assert_eq!(s.character("pc.nikis").unwrap().hit_points.current, hp);
        assert!(repair_request(&fixed).is_none());
    }

    #[test]
    fn repair_does_not_run_commands_twice() {
        let mut s = session();
        let before = s.character("npc.gunther").unwrap().resource("slots.1").unwrap().current();
        let reply = "Бой.\n```engine\n{\"cmd\":\"slot\",\"character\":\"gunther\",\"level\":1}\n{\"cmd\":\"resource\",\"character\":\"pc.nikis\",\"resource\":\"temp_hp\",\"delta\":-8}\n```";
        let turn = apply_directives(&mut s, reply);
        let spent = s.character("npc.gunther").unwrap().resource("slots.1").unwrap().current();
        assert_eq!(spent, before - 1);
        // Мастер прислал весь ход заново: выполненную ячейку движок пропускает.
        let fixed = apply_repair(&mut s, reply);
        assert!(fixed.iter().any(|a| a.summary.contains("повтор пропущен")), "{fixed:?}");
        assert_eq!(
            s.character("npc.gunther").unwrap().resource("slots.1").unwrap().current(),
            spent,
            "ячейка потрачена дважды"
        );
        assert!(repair_request(&turn.actions).is_some());
    }

    #[test]
    fn replies_are_cleaned() {
        assert_eq!(
            clean_reply("[ДВИЖОК] Результаты бросков приняты.\nТвои хиты гаснут, уступая место реальному灼痛.\n"),
            "Твои хиты гаснут, уступая место реальному."
        );
    }

    #[test]
    fn commands_without_engine_fence_are_found() {
        let text = "Инициатива!\n{\n  \"cmd\": \"roll\",\n  \"who\": \"npc.valeria\",\n  \"dice\": \"1d20+1\"\n}\nКонец {не JSON}.\n```json\n{\"cmd\":\"scene\",\"mood\":\"battle\"}\n```\nХвост.";
        let (prose, blocks) = split(text);
        assert_eq!(blocks.len(), 2, "{blocks:?}");
        assert_eq!(prose, "Инициатива!\nКонец {не JSON}.\nХвост.");
        assert!(crate::has_roll_requests(text));
        // Обычный JSON без команд и код в других блоках остаются в тексте.
        let (prose, blocks) = split("Пример: {\"a\":1}\n```rust\nlet x = 1;\n```");
        assert!(blocks.is_empty());
        assert!(prose.contains("```rust"));
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
        let reply = "```engine\n[{\"cmd\":\"cast\",\"character\":\"pc.nikis\",\"spell\":\"cone-of-cold\"},{\"cmd\":\"fly\",\"character\":\"pc.nikis\"},{\"cmd\":\"cast\",\"character\":\"Мордехай\",\"spell\":\"bless\"}]\n```";
        let turn = apply_directives(&mut s, reply);
        assert_eq!(turn.text, "");
        assert_eq!(turn.actions.len(), 3);
        assert!(turn.actions.iter().all(|a| !a.ok));
        assert!(turn.actions[0].summary.contains("Конус холода"));
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
    fn protocol_lines_leave_the_story() {
        assert_eq!(protocol_line("roll Обнаружение магии (магия)"), None);
        assert_eq!(protocol_line("***"), None);
        assert_eq!(
            protocol_line("roll [[1d20+2 | атака: Волк]]").as_deref(),
            Some("[[1d20+2 | атака: Волк]]")
        );
        assert_eq!(protocol_line("Ролло кивает.").as_deref(), Some("Ролло кивает."));
        assert_eq!(protocol_line("rollo").as_deref(), Some("rollo"));
    }

    #[test]
    fn slot_then_cast_spends_one_slot() {
        let first = |s: &Session| {
            s.character("pc.nikis").unwrap().resource("pact.slots").unwrap().current()
        };
        let mut s = session();
        let before = first(&s);
        // Лог 25.11.2026: slot в ходе, cast — в исправлении того же хода.
        let turn = apply_directives(
            &mut s,
            "```engine\n{\"cmd\":\"slot\",\"character\":\"pc.nikis\",\"level\":\"pact\"}\n```",
        );
        assert!(turn.actions[0].ok, "{:?}", turn.actions);
        let actions = apply_repair(
            &mut s,
            "```engine\n{\"cmd\":\"cast\",\"character\":\"pc.nikis\",\"spell\":\"armor-of-agathys\",\"slot\":\"pact\"}\n```",
        );
        assert!(actions[0].ok, "{:?}", actions);
        assert_eq!(first(&s), before - 1);
    }

    #[test]
    fn rod_charge_spent_as_resource_restores_the_slot() {
        let rod = |s: &Session| {
            s.character("pc.nikis").unwrap().resource("item.pact_rod.slot").unwrap().current()
        };
        let pact = |s: &Session| {
            s.character("pc.nikis").unwrap().resource("pact.slots").unwrap().current()
        };
        // Лог 23.11.2026: ячейка потрачена, заряд жезла списан тратой ресурса — ячейка вернулась.
        let mut s = session();
        let (charges, slots) = (rod(&s), pact(&s));
        let turn = apply_directives(
            &mut s,
            concat!(
                "```engine\n",
                "{\"cmd\":\"cast\",\"character\":\"pc.nikis\",\"spell\":\"armor-of-agathys\",\"slot\":\"pact\"}\n",
                "{\"cmd\":\"resource\",\"character\":\"pc.nikis\",\"resource\":\"item.pact_rod.slot\",\"delta\":-1}\n",
                "```"
            ),
        );
        assert!(turn.actions.iter().all(|a| a.ok), "{:?}", turn.actions);
        assert_eq!((rod(&s), pact(&s)), (charges - 1, slots));
        // Восстановление раньше траты: повтор в конце хода.
        let mut s = session();
        let turn = apply_directives(
            &mut s,
            concat!(
                "```engine\n",
                "{\"cmd\":\"restore\",\"character\":\"pc.nikis\",\"item\":\"item.pact_rod.slot\",\"level\":\"pact\"}\n",
                "{\"cmd\":\"cast\",\"character\":\"pc.nikis\",\"spell\":\"armor-of-agathys\",\"slot\":\"pact\"}\n",
                "```"
            ),
        );
        assert!(
            turn.actions[0].ok && !turn.actions[0].summary.contains("ничего"),
            "{:?}",
            turn.actions
        );
        assert_eq!((rod(&s), pact(&s)), (charges - 1, slots));
        // Ячейки полны — заряд не тратится.
        let mut s = session();
        let turn = apply_directives(
            &mut s,
            "```engine\n{\"cmd\":\"resource\",\"character\":\"pc.nikis\",\"resource\":\"item.pact_rod.slot\",\"delta\":-1}\n```",
        );
        assert!(turn.actions[0].summary.contains("ничего не изменилось"), "{:?}", turn.actions);
        assert_eq!(rod(&s), charges);
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
            "{\"cmd\":\"transfer\",\"asset\":\"gp\",\"quantity\":100,\"from\":\"crow_rock_vault\",\"to\":\"purse\"}\n",
            "{\"cmd\":\"treasury\",\"asset\":\"gp\",\"location\":\"При себе\",\"quantity\":-50,\"reason\":\"Взятка\"}\n",
            "{\"cmd\":\"scene\",\"time\":\"полдень\"}\n",
            "{\"cmd\":\"move\",\"character\":\"valeria\",\"location\":\"Серебряный Шпиль\"}\n",
            "{\"cmd\":\"note\",\"layer\":\"player\",\"title\":\"Пароль гати\",\"text\":\"Серый рассвет\"}\n",
            "{\"cmd\":\"hp\",\"character\":\"nikis\",\"damage\":0}\n",
            "{\"cmd\":\"hp\",\"character\":\"никого-нет\",\"damage\":5}\n",
            "```"
        );
        let turn = apply_directives(&mut s, reply);
        assert_eq!(turn.text, "Удар.");
        let ok: Vec<_> = turn.actions.iter().filter(|a| a.ok).collect();
        // Урон 0 менять нечего — движок не просит исправление; неизвестный персонаж — отказ.
        assert_eq!(ok.len(), 10, "{:?}", turn.actions);
        assert_eq!(turn.actions.len(), 11);
        assert!(turn.actions[9].summary.contains("ничего не изменилось"));
        assert!(!turn.actions[10].ok);
        // 12 урона: 11 временных хитов (Благословение Тёмного) и 1 хит.
        let nikis = s.character("pc.nikis").unwrap();
        assert_eq!(nikis.hit_points.current, 58);
        assert_eq!(nikis.hit_points.temporary, 0);
        assert_eq!(s.scene().time.as_deref(), Some("12:00"));
        assert_eq!(s.notes().len(), 1);
        let info = s.master_undo_info().unwrap();
        assert_eq!(info.actions.len(), 9);
        s.undo_master_turn().unwrap();
        let nikis = s.character("pc.nikis").unwrap();
        assert_eq!((nikis.hit_points.current, nikis.hit_points.temporary), (59, 11));
        assert!(s.notes().is_empty());
        assert_eq!(s.scene().time.as_deref(), Some("08:00"));
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
            summary: String::new(),
            text: String::new(),
            parent: None,
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
                "{\"cmd\":\"note\",\"layer\":\"master\",\"kind\":\"timer\",\"due_day\":100,\"title\":\"Хвост на тракте\",\"text\":\"Засада 2–3 всадника\",\"card\":\"Соглядатай у Шпиля\"}\n",
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
