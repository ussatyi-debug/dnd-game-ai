//! Время сцены: часы «ЧЧ:ММ», время суток и промежутки («30 мин», «1 ч 15 мин»).
//!
//! Время в игре знает движок: мастер двигает его командой `scene` (`time` или `advance`), а
//! движок по нему проверяет сводку и рассказ мастера.

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

/// Время суток: утро 05–11, день 12–16, вечер 17–22, ночь 23–04.
pub fn part_of_day(minutes: i64) -> &'static str {
    match minutes.rem_euclid(DAY_MINUTES) / 60 {
        5..=11 => "утро",
        12..=16 => "день",
        17..=22 => "вечер",
        _ => "ночь",
    }
}

/// Время суток по записи сцены: по часам, а если время записано словом — по слову.
pub fn part_of_day_of(time: &str) -> Option<&'static str> {
    if let Some(m) = minutes(time) {
        return Some(part_of_day(m));
    }
    let t = time.to_lowercase();
    [
        ("рассвет", "утро"),
        ("утр", "утро"),
        ("полден", "день"),
        ("полдн", "день"),
        ("день", "день"),
        ("дня", "день"),
        ("вечер", "вечер"),
        ("сумерк", "вечер"),
        ("закат", "вечер"),
        ("полноч", "ночь"),
        ("ноч", "ночь"),
    ]
    .iter()
    .find(|(stem, _)| t.contains(stem))
    .map(|(_, part)| *part)
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
        assert_eq!(part_of_day(7 * 60 + 30), "утро");
        assert_eq!(part_of_day(19 * 60), "вечер");
        assert_eq!(part_of_day(23 * 60 + 30), "ночь");
        assert_eq!(part_of_day_of("полдень"), Some("день"));
        assert_eq!(part_of_day_of("06:30"), Some("утро"));
        assert_eq!(part_of_day_of("?"), None);
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
    }
}
