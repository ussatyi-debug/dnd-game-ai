//! Время глазами мастера (решение владельца 23.11.2026): время двигает только мастер
//! командой `scene`, движок помогает ему не ошибиться — сам пишет первую строку «СЕЙЧАС»
//! (день, часы, время суток, место), напоминает, когда сводка мастера разошлась со сценой, и до
//! показа игроку проверяет, не сменил ли рассказчик время суток без команды.

use dnd_engine::{clock, Session};
use serde::Serialize;

use crate::directives::{apply_repair, clean_reply, split, split_now, MasterAction};

/// Первая строка блока «[СЕЙЧАС]»: день, часы, время суток и место — из сцены движка.
pub(crate) fn scene_clock_line(session: &Session) -> String {
    let scene = session.scene();
    let when = match scene.time.as_deref().map(str::trim).filter(|t| !t.is_empty()) {
        Some(t) => match clock::minutes(t) {
            Some(m) => format!("{} ({})", clock::hhmm(m), clock::part_of_day(m)),
            None => t.to_string(),
        },
        None => "время не указано".to_string(),
    };
    format!("День {}, {when} — {}", scene.day, session.card_title(&scene.location))
}

/// Разница двух часов по кругу суток, в минутах.
fn clock_gap(a: i64, b: i64) -> i64 {
    let d = (a - b).rem_euclid(clock::DAY_MINUTES);
    d.min(clock::DAY_MINUTES - d)
}

/// «день 99» в тексте сводки.
fn day_mentions(text: &str) -> Vec<u32> {
    let lower = text.to_lowercase();
    let words: Vec<&str> =
        lower.split(|c: char| !c.is_alphanumeric()).filter(|w| !w.is_empty()).collect();
    words.windows(2).filter(|w| w[0] == "день").filter_map(|w| w[1].parse::<u32>().ok()).collect()
}

/// Напоминание: мастер написал в сводке «СЕЙЧАС» часы (на полчаса и больше) или день не те, что
/// в сцене. Время сцену не двигает — решает мастер.
pub(crate) fn summary_time_reminder(session: &Session) -> Option<String> {
    let scene = session.scene();
    let now = scene.now.trim();
    if now.is_empty() {
        return None;
    }
    let shown = scene
        .time
        .as_deref()
        .map(str::trim)
        .filter(|t| !t.is_empty())
        .unwrap_or("время не указано");
    let clock_off = scene.time.as_deref().and_then(clock::minutes).and_then(|s| {
        clock::clock_times(now).into_iter().find(|t| clock_gap(*t, s) >= 30).map(clock::hhmm)
    });
    let what = clock_off.or_else(|| {
        day_mentions(now).into_iter().find(|d| *d != scene.day).map(|d| format!("День {d}"))
    })?;
    Some(format!(
        "в твоей сводке «СЕЙЧАС» — {what}, а в сцене День {}, {shown}. Время и день идут только \
командой scene: прошло время — {{\"cmd\":\"scene\",\"advance\":\"30 мин\"}}, новый день — с \"day\"; \
в сводку время не пиши — его ставит движок",
        scene.day
    ))
}

/// Смена времени суток в словах рассказчика: какие слова и при каком времени суток они верны.
struct Phase {
    /// Подпись для мастера.
    label: &'static str,
    /// Любая из фраз (строчными, «ё» как «е»).
    phrases: &'static [&'static str],
    /// Слово и глагол смены в одном предложении («ночь на город уже опускается»).
    noun_verb: Option<(&'static [&'static str], &'static [&'static str])>,
    /// Время суток, при котором так сказать можно.
    parts: &'static [&'static str],
}

/// Ночь и сумерки — вместе с глаголом смены («опускается», «сгустились»).
const NIGHT_NOUNS: &[&str] = &["ночь", "сумерк"];

const FALL_VERBS: &[&str] = &[
    "опуска",
    "опусти",
    "наступа",
    "наступи",
    "спуска",
    "спусти",
    "сгуща",
    "сгусти",
    "окутыва",
    "окутал",
    "ложится",
    "легла",
    "пала",
    "падает",
    "вступа",
    "вступи",
];

const PHASES: &[Phase] = &[
    Phase {
        label: "ночь прошла",
        phrases: &["ночь проходит", "ночь прошла", "ночь минула", "ночь миновала"],
        noun_verb: None,
        parts: &["ночь", "утро"],
    },
    Phase {
        label: "наступает ночь или вечер",
        phrases: &[
            "стемнело",
            "темнеет",
            "солнце садится",
            "солнце село",
            "солнце уже село",
            "солнце клонится",
            "догорает закат",
            "закат догорает",
            "на закате",
        ],
        noun_verb: Some((NIGHT_NOUNS, FALL_VERBS)),
        parts: &["вечер", "ночь"],
    },
    Phase {
        label: "рассвет",
        phrases: &[
            "рассвет",
            "светает",
            "рассвело",
            "занимается заря",
            "солнце встает",
            "солнце взошло",
            "солнце поднимается",
            "утро разгорается",
            "наступило утро",
            "наступает утро",
        ],
        noun_verb: None,
        parts: &["ночь", "утро"],
    },
    Phase {
        label: "полдень",
        phrases: &["полдень", "солнце в зените"],
        noun_verb: None,
        parts: &["утро", "день"],
    },
    Phase {
        label: "полночь", phrases: &["полночь"], noun_verb: None, parts: &["вечер", "ночь"]
    },
];

/// Слова о другом времени — не о «сейчас»: прошлое, будущее, условие, срок.
const NOT_NOW: &[&str] = &[
    "вчера",
    "завтра",
    "до рассвета",
    "до заката",
    "до ночи",
    "до утра",
    "до вечера",
    "до полуночи",
    "до полудня",
    "до темноты",
    "к ночи",
    "к вечеру",
    "к утру",
    "к рассвету",
    "к полуночи",
    "к полудню",
    "после",
    "будет",
    "через",
    "прошлой",
    "прошлую",
    "прошлым",
    "назад",
    "когда",
    "если",
    "помн",
    "вспомин",
    "обещ",
    "еще не",
    "скоро",
    "вот-вот",
    "кажд",
    "всю ночь",
];

/// Предложения рассказчика: без реплик («> — [имя] …») и без слов в кавычках.
fn narrator_sentences(text: &str) -> Vec<String> {
    let mut narration = String::new();
    for line in text.lines() {
        let t = line.trim_start();
        if t.starts_with('>') || t.starts_with("— [") || t.starts_with("((") {
            continue;
        }
        let mut depth = 0usize;
        for c in line.chars() {
            match c {
                '«' => depth += 1,
                '»' => depth = depth.saturating_sub(1),
                _ if depth == 0 => narration.push(c),
                _ => {}
            }
        }
        narration.push('\n');
    }
    narration
        .split(['.', '!', '?', '…', '\n'])
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .collect()
}

/// Что в рассказе не сходится со временем сцены: (предложение, подпись).
fn phase_mismatch(session: &Session, text: &str) -> Option<(String, &'static str)> {
    let part = session.scene().time.as_deref().and_then(clock::part_of_day_of)?;
    for sentence in narrator_sentences(text) {
        let lower = format!(" {} ", sentence.to_lowercase().replace('ё', "е"));
        if NOT_NOW.iter().any(|m| lower.contains(m)) {
            continue;
        }
        for phase in PHASES {
            let said = phase.phrases.iter().any(|p| lower.contains(p))
                || phase.noun_verb.is_some_and(|(nouns, verbs)| {
                    nouns.iter().any(|n| lower.contains(n))
                        && verbs.iter().any(|v| lower.contains(v))
                });
            if said && !phase.parts.contains(&part) {
                return Some((sentence, phase.label));
            }
        }
    }
    None
}

/// Проверка рассказа до показа игроку: рассказчик сменил время суток, а сцена — нет. Возвращает
/// просьбу к мастеру (один запрос) или `None`.
pub fn time_check(session: &Session, text: &str) -> Option<String> {
    // Ответ вне игры «((…))» — разговор за столом, мир стоит.
    if text.trim_start().starts_with("((") {
        return None;
    }
    let (sentence, label) = phase_mismatch(session, text)?;
    let scene = session.scene();
    let time = scene.time.as_deref().unwrap_or("время не указано");
    let part = scene.time.as_deref().and_then(clock::part_of_day_of).unwrap_or("?");
    Some(format!(
        "[ПРОВЕРКА ВРЕМЕНИ]\nВ твоём рассказе: «{sentence}» — {label}, а в сцене День {}, {time} \
({part}).\n- Время действительно прошло — пришли ТОЛЬКО команду в блоке ```engine: \
{{\"cmd\":\"scene\",\"advance\":\"…\"}} (новый день — с \"day\"), без рассказа.\n- Это оговорка — \
перепиши ответ этого хода целиком с верным временем суток, без блоков команд (они уже \
выполнены), со строкой «СЕЙЧАС» в конце.",
        scene.day
    ))
}

/// Ответ мастера на проверку времени: переписанный ход (текст заменяет прежний) и/или команды.
#[derive(Debug, Clone, Serialize)]
pub struct TimeFix {
    /// Новый текст хода — если мастер переписал ответ.
    pub text: Option<String>,
    /// Выполненные команды (обычно `scene`).
    pub actions: Vec<MasterAction>,
}

/// Короче этого — не переписанный ход, а пометка («время верное»).
const REWRITE_MIN_CHARS: usize = 200;

/// Выполняет ответ на проверку времени: команды — как исправление хода, рассказ — замена текста.
pub fn apply_time_check(session: &mut Session, reply: &str) -> TimeFix {
    let (prose, _) = split(reply);
    let (prose, now) = split_now(&prose);
    let prose = clean_reply(&prose);
    let actions = apply_repair(session, reply);
    let rewrite =
        prose.chars().count() >= REWRITE_MIN_CHARS && !prose.trim_start().starts_with("((");
    if rewrite && !now.is_empty() {
        session.set_scene_now(&now);
    }
    TimeFix { text: rewrite.then_some(prose), actions }
}

#[cfg(test)]
mod tests {
    use super::*;
    use dnd_engine::{SceneChange, Xoshiro256};

    fn at(time: &str) -> Session {
        let mut s = Session::demo(Xoshiro256::from_seed(3));
        s.change_scene(SceneChange { time: Some(time.into()), ..SceneChange::default() }).unwrap();
        s
    }

    #[test]
    fn clock_line_names_part_of_day() {
        let s = at("07:30");
        let line = scene_clock_line(&s);
        assert!(line.contains("07:30 (утро)"), "{line}");
        assert!(line.starts_with(&format!("День {}", s.scene().day)), "{line}");
    }

    #[test]
    fn summary_reminder_on_other_clock_or_day() {
        let mut s = at("19:00");
        s.set_scene_now("Малый зал, около 19:20. Ужин подан.");
        assert!(summary_time_reminder(&s).is_none());
        s.set_scene_now("Коридор, около 21:30. Изабелла у двери.");
        let r = summary_time_reminder(&s).expect("часы разошлись");
        assert!(r.contains("21:30") && r.contains("advance"), "{r}");
        let day = s.scene().day;
        s.set_scene_now(&format!("Двор, утро, день {}", day + 1));
        assert!(summary_time_reminder(&s).unwrap().contains(&format!("День {}", day + 1)));
        s.set_scene_now("Двор, без часов");
        assert!(summary_time_reminder(&s).is_none());
    }

    #[test]
    fn narration_phase_against_scene() {
        let s = at("07:30");
        // Лог 22.11: утро в сцене, «ночь опускается» в рассказе.
        let text = "Вы выходите во двор. Дорога до Кроу-Рока займёт часы, а ночь на Вейденбург уже опускается.";
        let (sentence, label) = phase_mismatch(&s, text).expect("ночь утром");
        assert!(sentence.contains("ночь на Вейденбург"), "{sentence}");
        assert_eq!(label, "наступает ночь или вечер");
        assert!(time_check(&s, text).unwrap().contains("advance"));
        // Реплики, кавычки, прошлое и будущее не считаются.
        for ok in [
            "> — [Изабелла, ж] Спокойной ночи, князь. Ночь опускается быстро.",
            "Она шепчет: «ночь уже опускается». Вы молчите.",
            "Вчера ночь опустилась рано.",
            "До рассвета ещё далеко, но вы встаёте.",
            "Утренний свет ложится на стол.",
        ] {
            assert!(phase_mismatch(&s, ok).is_none(), "{ok}");
        }
        let evening = at("18:30");
        assert!(phase_mismatch(&evening, "Над рекой уже сгустились сумерки.").is_none());
        let late = at("22:40");
        assert!(phase_mismatch(&late, "Ночь опускается на город.").is_none());
        assert!(phase_mismatch(&late, "Светает, и город просыпается.").is_some());
    }

    #[test]
    fn time_fix_rewrites_or_runs_commands() {
        let mut s = at("07:30");
        let fix =
            apply_time_check(&mut s, "```engine\n{\"cmd\":\"scene\",\"advance\":\"12 ч\"}\n```");
        assert!(fix.text.is_none());
        assert!(fix.actions.iter().all(|a| a.ok), "{:?}", fix.actions);
        assert_eq!(s.scene().time.as_deref(), Some("19:30"));
        let rewrite = format!(
            "{}\n\nСЕЙЧАС: Двор, утро.",
            "Утро только разгорается над Вейденбургом. ".repeat(8)
        );
        let fix = apply_time_check(&mut s, &rewrite);
        assert!(fix.text.as_deref().unwrap().starts_with("Утро только разгорается"));
        assert_eq!(s.scene().now, "Двор, утро.");
    }
}
