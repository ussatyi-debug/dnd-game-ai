//! Время и место глазами мастера (решения владельца 23.11.2026): их двигает только мастер
//! командой `scene`, движок помогает ему не ошибиться — сам пишет первую строку «СЕЙЧАС»
//! (день, часть суток, место; точные часы — только по запросу `query time`), напоминает, когда
//! сводка мастера разошлась со сценой, и до показа игроку проверяет ход: не сменил ли рассказчик
//! время суток без команды и не ушёл ли герой (по сводке) из места сцены.

use dnd_engine::{clock, Session};
use serde::Serialize;

use crate::directives::{apply_repair, clean_reply, split, split_now, MasterAction};

/// Первая строка блока «[СЕЙЧАС]»: день, часть суток и место — из сцены движка.
pub(crate) fn scene_clock_line(session: &Session) -> String {
    let scene = session.scene();
    format!("День {}, {} — {}", scene.day, scene.time_shown(), session.card_title(&scene.location))
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
    let shown = scene.time_shown();
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
    /// Части суток, при которых так сказать можно.
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
        parts: &["глубокая ночь", "рассвет", "утро", "позднее утро"],
    },
    Phase {
        label: "наступает ночь или вечер",
        // «темнеет» — не здесь: «ниже насыпи темнеет бочаг» — «виднеется тёмным» (лог 23.11).
        phrases: &[
            "стемнело",
            "солнце садится",
            "солнце село",
            "солнце уже село",
            "солнце клонится",
            "догорает закат",
            "закат догорает",
            "на закате",
        ],
        noun_verb: Some((NIGHT_NOUNS, FALL_VERBS)),
        parts: &["предвечерье", "вечер", "поздний вечер", "ночь", "глубокая ночь"],
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
        parts: &["глубокая ночь", "рассвет", "утро", "позднее утро"],
    },
    Phase {
        label: "полдень",
        phrases: &["полдень", "солнце в зените"],
        noun_verb: None,
        parts: &["позднее утро", "полдень", "день"],
    },
    Phase {
        label: "полночь",
        phrases: &["полночь"],
        noun_verb: None,
        parts: &["поздний вечер", "ночь", "глубокая ночь"],
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
    let part = session.scene().time.as_deref().and_then(clock::day_part_of)?.name;
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

/// Основы слов для сравнения мест: слова от четырёх букв, первые пять букв.
fn stems(text: &str) -> Vec<String> {
    text.to_lowercase()
        .replace('ё', "е")
        .split(|c: char| !c.is_alphabetic())
        .filter(|w| w.chars().count() >= 4)
        .map(|w| w.chars().take(5).collect())
        .collect()
}

/// Две основы об одном («пирс» и «пирсе»): одна начинается с другой.
fn same_stem(a: &str, b: &str) -> bool {
    a.starts_with(b) || b.starts_with(a)
}

/// Сводка этого хода говорит о другом месте, чем сцена: (первая строка сводки, название места).
/// Сверяется первая строка — там мастер пишет, где герой; место — название карточки и её
/// родителя (город для здания).
fn place_mismatch(session: &Session) -> Option<(String, String)> {
    if !session.scene_now_from_last_turn() {
        return None;
    }
    let scene = session.scene();
    let location = scene.location.trim();
    let title = session.card_title(location);
    // Место без названия (id без карточки) сравнить не с чем.
    let bare_id = title == location && !location.contains(' ') && location.contains('.');
    if location.is_empty() || bare_id {
        return None;
    }
    let first = scene
        .now
        .lines()
        .map(|l| l.trim().trim_start_matches(['-', '—', '–', '*', '•', ' ']).trim())
        .find(|l| !l.is_empty())?;
    let mut names = vec![title.clone()];
    if let Some(parent) = session.card_parent(location) {
        names.push(session.card_title(&parent));
    }
    let place: Vec<String> = names.iter().flat_map(|n| stems(n)).collect();
    let line = stems(first);
    let same = line.iter().any(|w| place.iter().any(|p| same_stem(w, p)));
    if place.is_empty() || line.is_empty() || same {
        return None;
    }
    Some((first.to_string(), title))
}

/// Проверка хода до показа игроку (решения 23.11.2026): рассказчик сменил время суток, а сцена —
/// нет; или сводка хода — о другом месте, чем сцена. Одна просьба к мастеру (один запрос) или
/// `None`.
pub fn turn_check(session: &Session, text: &str) -> Option<String> {
    // Заявка игрока: вступление, просьба описать, бросок с итогом (25.11.2026).
    let asked = crate::ask::check(session, text);
    // Ответ вне игры «((…))» — разговор за столом, мир стоит.
    let aside = text.trim_start().starts_with("((");
    let time = if aside { None } else { phase_mismatch(session, text) };
    let place = if aside { None } else { place_mismatch(session) };
    if time.is_none() && place.is_none() && asked.is_empty() {
        return None;
    }
    let scene = session.scene();
    let mut out = String::from("[ПРОВЕРКА ХОДА]\n");
    if let Some((sentence, label)) = time {
        out.push_str(&format!(
            "Время: в рассказе «{sentence}» — {label}, а в сцене День {}, {}.\n",
            scene.day,
            scene.time_shown()
        ));
    }
    if let Some((line, title)) = place {
        out.push_str(&format!("Место: в твоей сводке «{line}», а место сцены — «{title}».\n"));
    }
    for line in asked {
        out.push_str(&format!("{line}\n"));
    }
    out.push_str(
        "- Время прошло или герой ушёл — пришли ТОЛЬКО команды в блоке ```engine: \
{\"cmd\":\"scene\",\"advance\":\"…\"} и/или {\"cmd\":\"scene\",\"location\":\"…\"} (место из базы — \
его id; спутники, что ушли с героем, — move), без рассказа.\n- Ошибка в рассказе (не то время \
суток) — перепиши ответ этого хода целиком, без блоков команд (они уже выполнены), со строкой \
«СЕЙЧАС» в конце.\n- Всё верно — ответь одним словом «верно».",
    );
    Some(out)
}

/// Ответ мастера на проверку хода: переписанный ход (текст заменяет прежний) и/или команды.
#[derive(Debug, Clone, Serialize)]
pub struct TurnFix {
    /// Новый текст хода — если мастер переписал ответ.
    pub text: Option<String>,
    /// Выполненные команды (обычно `scene`).
    pub actions: Vec<MasterAction>,
}

/// Короче этого — не переписанный ход, а пометка («время верное»).
const REWRITE_MIN_CHARS: usize = 200;

/// Выполняет ответ на проверку хода: команды — как исправление хода, рассказ — замена текста.
pub fn apply_turn_check(session: &mut Session, reply: &str) -> TurnFix {
    let (prose, _) = split(reply);
    let (prose, now) = split_now(&prose);
    let prose = clean_reply(&prose);
    let actions = apply_repair(session, reply);
    let rewrite =
        prose.chars().count() >= REWRITE_MIN_CHARS && !prose.trim_start().starts_with("((");
    if rewrite && !now.is_empty() {
        session.set_scene_now(&now);
    }
    TurnFix { text: rewrite.then_some(prose), actions }
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
        assert!(line.starts_with(&format!("День {}, утро — ", s.scene().day)), "{line}");
        assert!(!line.contains("07:30"), "{line}");
        assert!(scene_clock_line(&at("10:15")).contains(", позднее утро — "));
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
        assert!(turn_check(&s, text).unwrap().contains("advance"));
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
        // Лог 23.11: «темнеет» — «виднеется тёмным», а не вечер.
        assert!(phase_mismatch(&at("09:00"), "Ниже насыпи темнеет бочаг.").is_none());
        let check = turn_check(&s, text).unwrap();
        assert!(check.contains(", утро.") && !check.contains("07:30"), "{check}");
    }

    #[test]
    fn place_check_by_this_turn_summary() {
        let mut s = at("07:30");
        let pheasant = "Гранд-отель «Золотой Фазан»";
        s.change_scene(SceneChange { location: Some(pheasant.into()), ..SceneChange::default() })
            .unwrap();
        let turn = |s: &mut Session, now: Option<&str>| {
            let before = s.checkpoint();
            if let Some(now) = now {
                s.set_scene_now(now);
            }
            s.commit_master_turn(before, Vec::new());
        };
        // Лог 22.11: герой у Бранда, сцена — всё ещё «Фазан».
        turn(&mut s, Some("Контора Бранда на Третьем пирсе, утро Дня 99.\nБранд колеблется."));
        let check = turn_check(&s, "Бранд молчит.").expect("место разошлось");
        assert!(check.contains("Контора Бранда") && check.contains(pheasant), "{check}");
        // Сводка о том же месте (другой падеж) — без проверки.
        turn(&mut s, Some("— Двор «Золотого Фазана», утро, конь оседлан."));
        assert!(turn_check(&s, "Корвус ждёт.").is_none());
        // Сводки в этом ходу нет — сверять нечего.
        turn(&mut s, None);
        assert!(place_mismatch(&s).is_none());
        // Вне игры не проверяется.
        turn(&mut s, Some("Контора Бранда на Третьем пирсе."));
        assert!(turn_check(&s, "((Это по вопросу вне игры.))").is_none());
        assert!(turn_check(&s, "Бранд молчит.").is_some());
    }

    #[test]
    fn turn_fix_rewrites_or_runs_commands() {
        let mut s = at("07:30");
        let fix =
            apply_turn_check(&mut s, "```engine\n{\"cmd\":\"scene\",\"advance\":\"12 ч\"}\n```");
        assert!(fix.text.is_none());
        assert!(fix.actions.iter().all(|a| a.ok), "{:?}", fix.actions);
        assert_eq!(s.scene().time.as_deref(), Some("19:30"));
        let rewrite = format!(
            "{}\n\nСЕЙЧАС: Двор, утро.",
            "Утро только разгорается над Вейденбургом. ".repeat(8)
        );
        let fix = apply_turn_check(&mut s, &rewrite);
        assert!(fix.text.as_deref().unwrap().starts_with("Утро только разгорается"));
        assert_eq!(s.scene().now, "Двор, утро.");
    }
}
