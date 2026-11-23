//! Время сцены: часы «ЧЧ:ММ», части суток и промежутки («30 мин», «1 ч 15 мин»).
//!
//! Время в игре знает движок: мастер двигает его командой `scene` (`time` или `advance`), а
//! движок по нему проверяет сводку и рассказ мастера. Игрок и мастер видят часть суток
//! («позднее утро»), внутри движок считает минуты.

/// Минут в сутках.
pub const DAY_MINUTES: i64 = 24 * 60;

/// Минуты от полуночи по записи времени сцены («19:40», «около 19:40»). `None` — время
/// записано словом («вечер») или не похоже на часы.
pub fn minutes(time: &str) -> Option<i64> {
    let digits: String = time.trim().chars().filter(|c| c.is_ascii_digit() || *c == ':').collect();
    let (h, m) = digits.split_once(':')?;
    let (h, m) = (h.parse::<i64>().ok()?, m.parse::<i64>().ok()?);
    (h < 24 && m < 60).then_some(h * 60 + m)
}

/// «ЧЧ:ММ» по минутам (с переходом через полночь).
pub fn hhmm(minutes: i64) -> String {
    let m = minutes.rem_euclid(DAY_MINUTES);
    format!("{:02}:{:02}", m / 60, m % 60)
}

/// Часть суток (решение владельца 23.11.2026): игрок и мастер видят её, а не часы; часы
/// движок держит внутри и называет мастеру только по запросу `query time`.
pub struct DayPart {
    /// Название: «позднее утро».
    pub name: &'static str,
    /// С какой минуты суток начинается.
    pub from: i64,
    /// Опорное время: его ставит движок, когда мастер пишет время словом («утро» → 07:00).
    pub reference: i64,
}

const fn hm(h: i64, m: i64) -> i64 {
    h * 60 + m
}

/// Шкала частей суток — по порядку от полуночи.
pub const DAY_PARTS: &[DayPart] = &[
    DayPart { name: "глубокая ночь", from: hm(0, 0), reference: hm(2, 0) },
    DayPart { name: "рассвет", from: hm(4, 0), reference: hm(5, 0) },
    DayPart { name: "утро", from: hm(6, 0), reference: hm(7, 0) },
    DayPart { name: "позднее утро", from: hm(9, 0), reference: hm(10, 0) },
    DayPart { name: "полдень", from: hm(11, 30), reference: hm(12, 0) },
    DayPart { name: "день", from: hm(13, 0), reference: hm(14, 0) },
    DayPart { name: "предвечерье", from: hm(16, 0), reference: hm(17, 0) },
    DayPart { name: "вечер", from: hm(18, 0), reference: hm(19, 0) },
    DayPart { name: "поздний вечер", from: hm(21, 0), reference: hm(22, 0) },
    DayPart { name: "ночь", from: hm(23, 0), reference: hm(23, 0) },
];

/// Часть суток по минутам от полуночи.
pub fn day_part(minutes: i64) -> &'static DayPart {
    let m = minutes.rem_euclid(DAY_MINUTES);
    DAY_PARTS.iter().rev().find(|p| p.from <= m).unwrap_or(&DAY_PARTS[0])
}

/// Часть суток, названная словом: «позднее утро», «к вечеру», «после полудня», «полночь».
/// Возвращает часть и опорную минуту (у полуночи — 00:00).
pub fn day_part_word(text: &str) -> Option<(&'static DayPart, i64)> {
    let t = text.trim().to_lowercase().replace('ё', "е");
    if t.is_empty() || t.chars().any(|c| c.is_ascii_digit()) {
        return None;
    }
    let part = |name: &str| DAY_PARTS.iter().find(|p| p.name == name);
    let has = |stems: &[&str]| stems.iter().any(|s| t.contains(s));
    let name = if has(&["полноч"]) {
        return part("глубокая ночь").map(|p| (p, 0));
    } else if has(&["глубок", "за полноч", "предрассвет"]) && has(&["ноч", "предрассвет"])
    {
        "глубокая ночь"
    } else if has(&["поздн", "ближе к полуд"]) && has(&["утр", "полуд"]) {
        "позднее утро"
    } else if has(&["после полуд", "после полдн", "пополудн"]) {
        "день"
    } else if has(&["поздн"]) && has(&["вечер"]) {
        "поздний вечер"
    } else if has(&["предвечер", "ближе к вечер", "клонится к вечер"])
    {
        "предвечерье"
    } else if has(&[
        "рассвет",
        "заря",
        "зари",
        "светает",
        "раннее утро",
        "ранним утр",
        "ранее утро",
    ]) {
        "рассвет"
    } else if has(&["полден", "полдн", "полуд"]) {
        "полдень"
    } else if has(&["утр"]) {
        "утро"
    } else if has(&["сумерк", "закат", "вечер"]) {
        "вечер"
    } else if has(&["ноч"]) {
        "ночь"
    } else if has(&["день", "дня", "днем"]) {
        "день"
    } else {
        return None;
    };
    part(name).map(|p| (p, p.reference))
}

/// Часть суток по записи времени сцены: по часам, а если время записано словом — по слову.
pub fn day_part_of(time: &str) -> Option<&'static DayPart> {
    match minutes(time) {
        Some(m) => Some(day_part(m)),
        None => day_part_word(time).map(|(p, _)| p),
    }
}

/// Время сцены для игрока и мастера: часть суток («позднее утро»), без часов.
pub fn shown(time: Option<&str>) -> String {
    match time.map(str::trim).filter(|t| !t.is_empty()) {
        None => "время не указано".to_string(),
        Some(t) => day_part_of(t).map_or_else(|| t.to_string(), |p| p.name.to_string()),
    }
}

/// Запись времени сцены в часах «ЧЧ:ММ»: часы — как есть, слово — опорный час его части
/// суток. `None` — не часы и не часть суток.
pub fn normalize(time: &str) -> Option<String> {
    match minutes(time) {
        Some(m) => Some(hhmm(m)),
        None => day_part_word(time).map(|(_, m)| hhmm(m)),
    }
}

/// Промежуток словами: «20 мин», «2 ч», «1 ч 15 мин», «1 сут 2 ч».
pub fn duration_label(minutes: i64) -> String {
    let (days, rest) = (minutes / DAY_MINUTES, minutes % DAY_MINUTES);
    let (h, m) = (rest / 60, rest % 60);
    let mut parts = Vec::new();
    if days > 0 {
        parts.push(format!("{days} сут"));
    }
    if h > 0 {
        parts.push(format!("{h} ч"));
    }
    if m > 0 || parts.is_empty() {
        parts.push(format!("{m} мин"));
    }
    parts.join(" ")
}

/// Все часы «Ч:ММ» / «ЧЧ:ММ» в тексте (сводка мастера), в минутах от полуночи.
pub fn clock_times(text: &str) -> Vec<i64> {
    let chars: Vec<char> = text.chars().collect();
    let mut out = Vec::new();
    for (i, c) in chars.iter().enumerate() {
        if *c != ':' || i == 0 {
            continue;
        }
        let mut start = i;
        while start > 0 && i - start < 2 && chars[start - 1].is_ascii_digit() {
            start -= 1;
        }
        let hour_ok = start < i && (start == 0 || !chars[start - 1].is_ascii_digit());
        let minute_ok = chars.get(i + 1).is_some_and(char::is_ascii_digit)
            && chars.get(i + 2).is_some_and(char::is_ascii_digit)
            && !chars.get(i + 3).is_some_and(char::is_ascii_digit);
        if hour_ok && minute_ok {
            let clock: String = chars[start..i + 3].iter().collect();
            if let Some(m) = minutes(&clock) {
                out.push(m);
            }
        }
    }
    out
}

/// Промежуток времени в минутах: «30», «30 мин», «2 ч», «1 ч 15 мин», «1:30», «полчаса»,
/// «час», «полтора часа». `None` — не похоже на промежуток или он нулевой.
pub fn duration(text: &str) -> Option<i64> {
    let t = text.trim().to_lowercase().replace('ё', "е");
    let named = [("полтора час", 90), ("полчаса", 30), ("пол часа", 30)];
    if let Some((_, m)) = named.iter().find(|(name, _)| t.contains(name)) {
        return Some(*m);
    }
    if !t.chars().any(|c| c.is_ascii_digit()) {
        return (t.starts_with("час") || t == "ч").then_some(60);
    }
    if let Some((h, m)) = t.split_once(':') {
        let (h, m) = (h.trim().parse::<i64>().ok()?, m.trim().parse::<i64>().ok()?);
        return (m < 60 && h * 60 + m > 0).then_some(h * 60 + m);
    }
    let mut total = 0;
    let mut number: Option<i64> = None;
    let mut rest = t.as_str();
    while !rest.is_empty() {
        let c = rest.chars().next()?;
        if c.is_ascii_digit() {
            let len = rest.find(|ch: char| !ch.is_ascii_digit()).unwrap_or(rest.len());
            if let Some(n) = number.take() {
                total += n;
            }
            number = Some(rest[..len].parse().ok()?);
            rest = &rest[len..];
        } else if c.is_alphabetic() {
            let len = rest.find(|ch: char| !ch.is_alphabetic()).unwrap_or(rest.len());
            let word = &rest[..len];
            let unit = if word.starts_with('ч') {
                60
            } else if word.starts_with("мин") || word == "м" {
                1
            } else if word.starts_with("сут") || word.starts_with("ден") || word.starts_with("дн")
            {
                DAY_MINUTES
            } else {
                return None;
            };
            total += number.take()? * unit;
            rest = &rest[len..];
        } else {
            rest = &rest[c.len_utf8()..];
        }
    }
    total += number.unwrap_or(0);
    (total > 0).then_some(total)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn clock_and_parts_of_day() {
        assert_eq!(minutes("около 19:40"), Some(19 * 60 + 40));
        assert_eq!(minutes("вечер"), None);
        assert_eq!(hhmm(25 * 60 + 5), "01:05");
        assert_eq!(day_part(7 * 60 + 30).name, "утро");
        assert_eq!(day_part(10 * 60).name, "позднее утро");
        assert_eq!(day_part(11 * 60 + 30).name, "полдень");
        assert_eq!(day_part(19 * 60).name, "вечер");
        assert_eq!(day_part(23 * 60 + 30).name, "ночь");
        assert_eq!(day_part(2 * 60).name, "глубокая ночь");
        assert_eq!(day_part(25 * 60).name, "глубокая ночь");
        assert_eq!(day_part_of("06:30").map(|p| p.name), Some("утро"));
        assert_eq!(day_part_of("?").map(|p| p.name), None);
        assert_eq!(shown(Some("09:15")), "позднее утро");
        assert_eq!(shown(None), "время не указано");
    }

    #[test]
    fn day_part_words() {
        let word = |t: &str| day_part_word(t).map(|(p, m)| (p.name, hhmm(m)));
        assert_eq!(word("утро"), Some(("утро", "07:00".into())));
        assert_eq!(word("Позднее утро"), Some(("позднее утро", "10:00".into())));
        assert_eq!(word("полдень"), Some(("полдень", "12:00".into())));
        assert_eq!(word("после полудня"), Some(("день", "14:00".into())));
        assert_eq!(word("поздний вечер"), Some(("поздний вечер", "22:00".into())));
        assert_eq!(word("закат"), Some(("вечер", "19:00".into())));
        assert_eq!(word("полночь"), Some(("глубокая ночь", "00:00".into())));
        assert_eq!(word("глубокая ночь"), Some(("глубокая ночь", "02:00".into())));
        assert_eq!(word("рассвет"), Some(("рассвет", "05:00".into())));
        assert_eq!(word("ночь"), Some(("ночь", "23:00".into())));
        assert_eq!(word("днём"), Some(("день", "14:00".into())));
        assert_eq!(word("07:00"), None);
        assert_eq!(word("скоро"), None);
        assert_eq!(normalize("утро").as_deref(), Some("07:00"));
        assert_eq!(normalize("около 7:05").as_deref(), Some("07:05"));
        assert_eq!(normalize("когда-нибудь"), None);
        // Шкала идёт по порядку и покрывает сутки.
        assert!(DAY_PARTS.windows(2).all(|w| w[0].from < w[1].from));
        assert!(DAY_PARTS.iter().all(|p| day_part(p.reference).name == p.name));
    }

    #[test]
    fn clock_times_in_summary() {
        assert_eq!(
            clock_times("Малый зал, около 19:40. Встреча в 7:05, День 99"),
            vec![19 * 60 + 40, 7 * 60 + 5]
        );
        assert!(clock_times("счёт 3:2 и 123:45").is_empty());
    }

    #[test]
    fn durations() {
        assert_eq!(duration("30"), Some(30));
        assert_eq!(duration("30 мин"), Some(30));
        assert_eq!(duration("2 ч"), Some(120));
        assert_eq!(duration("1 ч 15 мин"), Some(75));
        assert_eq!(duration("2 часа"), Some(120));
        assert_eq!(duration("1:30"), Some(90));
        assert_eq!(duration("полчаса"), Some(30));
        assert_eq!(duration("полтора часа"), Some(90));
        assert_eq!(duration("час"), Some(60));
        assert_eq!(duration("0"), None);
        assert_eq!(duration("вечер"), None);
        assert_eq!(duration("5 лет"), None);
        assert_eq!(duration_label(75), "1 ч 15 мин");
        assert_eq!(duration_label(20), "20 мин");
        assert_eq!(duration_label(24 * 60 + 120), "1 сут 2 ч");
    }
}
