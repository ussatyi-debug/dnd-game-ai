//! Поиск мастера по старому чату (пак 0.10.2): `{"cmd":"query","what":"chat","text":"…"}`.
//!
//! Мастер видит только последние 6–20 заявок; раньше было — в базе, хронике и в старом чате.
//! Интерфейс присылает движку сообщения вне окна истории, а поиск отдаёт не больше трёх
//! фрагментов (заявка игрока и кусок ответа мастера вокруг найденного) — запрос не раздувается.

use dnd_engine::{ChatLine, Session};

/// Сколько фрагментов отдаёт поиск.
const CHAT_HITS: usize = 3;
/// Предел ответа поиска, знаков.
const CHAT_LIMIT: usize = 1500;
/// Длина куска заявки игрока и ответа мастера во фрагменте.
const PLAYER_CHARS: usize = 220;
const MASTER_CHARS: usize = 260;

fn fold(text: &str) -> String {
    text.to_lowercase().replace('ё', "е")
}

/// Основы слов запроса: от трёх букв; у длинных слов — без окончания (любой падеж).
fn stems(query: &str) -> Vec<String> {
    let mut out: Vec<String> = fold(query)
        .split(|c: char| !c.is_alphanumeric())
        .filter(|w| w.chars().count() >= 3)
        .map(|w| {
            let n = w.chars().count();
            let keep = if n > 5 {
                n - 2
            } else if n > 3 {
                n - 1
            } else {
                n
            };
            w.chars().take(keep.max(3)).collect()
        })
        .collect();
    out.sort();
    out.dedup();
    out
}

/// Кусок текста вокруг первого совпадения, не длиннее `max` знаков.
fn excerpt(text: &str, stems: &[String], max: usize) -> String {
    let flat: String = text.split_whitespace().collect::<Vec<_>>().join(" ");
    let chars: Vec<char> = flat.chars().collect();
    if chars.len() <= max {
        return flat;
    }
    let lower: Vec<char> = fold(&flat).chars().collect();
    let lower_s: String = lower.iter().collect();
    let hit = stems
        .iter()
        .filter_map(|s| lower_s.find(s.as_str()).map(|b| lower_s[..b].chars().count()))
        .min()
        .unwrap_or(0);
    let start = hit.saturating_sub(max / 3).min(chars.len().saturating_sub(max));
    let end = (start + max).min(chars.len());
    let mut out: String = chars[start..end].iter().collect();
    if start > 0 {
        out = format!("…{out}");
    }
    if end < chars.len() {
        out.push('…');
    }
    out
}

/// Поиск по старому чату: до [`CHAT_HITS`] обменов «заявка — ответ», где больше всего слов
/// запроса; при равенстве — более поздние.
pub(crate) fn search_chat(session: &Session, query: &str) -> String {
    let lines = session.chat_archive();
    if lines.is_empty() {
        return "старого чата нет: всё, что было в этой игре, уже в истории сообщений".into();
    }
    let stems = stems(query);
    if stems.is_empty() {
        return "для поиска по чату нужны слова от трёх букв: имена, места, предметы".into();
    }
    // Обмен: заявка игрока и следующий за ней ответ мастера.
    let mut exchanges: Vec<(Option<&ChatLine>, Option<&ChatLine>)> = Vec::new();
    for line in lines {
        match line.author.as_str() {
            "player" => exchanges.push((Some(line), None)),
            _ => match exchanges.last_mut() {
                Some((_, master @ None)) => *master = Some(line),
                _ => exchanges.push((None, Some(line))),
            },
        }
    }
    let score = |text: &str| {
        let t = fold(text);
        stems.iter().filter(|s| t.contains(s.as_str())).count()
    };
    let mut found: Vec<(usize, usize)> = exchanges
        .iter()
        .enumerate()
        .map(|(i, (p, m))| {
            let both = format!(
                "{} {}",
                p.map_or("", |l| l.text.as_str()),
                m.map_or("", |l| l.text.as_str())
            );
            (i, score(&both))
        })
        .filter(|(_, s)| *s > 0)
        .collect();
    if found.is_empty() {
        return format!("в старом чате ничего не найдено по «{}»", query.trim());
    }
    found.sort_by(|a, b| b.1.cmp(&a.1).then(b.0.cmp(&a.0)));
    found.truncate(CHAT_HITS);
    found.sort_by_key(|(i, _)| *i);
    let mut out = format!("Старый чат по «{}» (вне истории сообщений):", query.trim());
    for (i, _) in found {
        let (player, master) = exchanges[i];
        let id = player.or(master).map_or(0, |l| l.id);
        let mut part = format!("\n[сообщение {id}]");
        if let Some(p) = player {
            part.push_str(&format!("\nИгрок: {}", excerpt(&p.text, &stems, PLAYER_CHARS)));
        }
        if let Some(m) = master {
            part.push_str(&format!("\nМастер: {}", excerpt(&m.text, &stems, MASTER_CHARS)));
        }
        if out.chars().count() + part.chars().count() > CHAT_LIMIT {
            break;
        }
        out.push_str(&part);
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    use dnd_engine::Xoshiro256;

    fn line(id: u64, author: &str, text: &str) -> ChatLine {
        ChatLine { id, author: author.into(), text: text.into() }
    }

    #[test]
    fn finds_old_order_in_any_case_and_stays_short() {
        let mut s = Session::demo(Xoshiro256::from_seed(1));
        assert!(search_chat(&s, "Гюнтер").contains("старого чата нет"));
        let long = "Пирс скрипит. ".repeat(200);
        s.set_chat_archive(vec![
            line(10, "player", "Идём к Бранду в контору"),
            line(11, "master", &long),
            line(186, "player", "Гюнтер, отправляйся в ратушу и разыщи капитана стражи"),
            line(187, "master", "Гюнтер коротко кивает и уходит к ратуше за капитаном."),
            line(190, "system", "Загружено сохранение"),
        ]);
        let found = search_chat(&s, "Гюнтера ратуши капитан");
        assert!(found.contains("[сообщение 186]"), "{found}");
        assert!(found.contains("разыщи капитана"), "{found}");
        assert!(!found.contains("сообщение 10"), "{found}");
        assert!(found.chars().count() <= CHAT_LIMIT + 80);
        assert!(search_chat(&s, "дракон").contains("ничего не найдено"));
        let pier = search_chat(&s, "пирс");
        assert!(pier.chars().count() < 700, "{pier}");
    }
}
