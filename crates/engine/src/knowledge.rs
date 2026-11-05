//! Живая часть базы знаний: записи мастера и игрока, статусы карточек поверх файлов базы.
//!
//! Карточки базы (NPC, цели, хроника) лежат в данных интерфейса и не меняются. Движок
//! знает их указатель (ID, название, слой, статус) — его передаёт интерфейс при запуске, —
//! чтобы проверять ссылки мастера на карточки и показывать мастеру оглавление базы.
//! Изменения статусов хранятся отдельно (в сессии и в сохранении) и отменяются вместе
//! с ходом мастера.

use crate::error::EngineError;
use crate::session::Session;

/// Слой базы знаний для записи.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "snake_case"))]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum NoteLayer {
    /// Видно игроку: «Записи мастера».
    Player,
    /// Только мастеру: «Журнал мастера».
    Master,
}

impl NoteLayer {
    pub fn section(self) -> &'static str {
        match self {
            NoteLayer::Player => "Записи мастера",
            NoteLayer::Master => "Журнал мастера",
        }
    }
}

/// Запись в базе знаний.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct MasterNote {
    pub id: u64,
    pub layer: NoteLayer,
    pub day: u32,
    pub time: Option<String>,
    pub title: String,
    pub text: String,
    /// Карточка базы, к которой относится запись.
    #[cfg_attr(feature = "serde", serde(default))]
    pub card: Option<String>,
    /// Запись сделал игрок (а не мастер).
    #[cfg_attr(feature = "serde", serde(default))]
    pub by_player: bool,
}

/// Изменение записи. `None` — поле не меняется; пустая карточка — отвязать.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct NoteEdit {
    pub title: Option<String>,
    pub text: Option<String>,
    pub card: Option<String>,
    pub layer: Option<NoteLayer>,
}

/// Карточка базы в указателе.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct KbCard {
    pub id: String,
    pub title: String,
    /// `player`, `master` или `world`.
    pub layer: String,
    /// Статус из файла базы.
    #[cfg_attr(feature = "serde", serde(default))]
    pub status: Option<String>,
}

/// Статус карточки, изменённый по ходу игры.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct KbOverride {
    pub card_id: String,
    pub status: String,
    /// Пояснение: «Астролябия получена у Халида».
    pub note: String,
    pub day: u32,
}

/// Статусы карточек (как в интерфейсе базы знаний).
pub const KB_STATUSES: [(&str, &str); 13] = [
    ("active", "активен"),
    ("ally", "союзник"),
    ("vassal", "вассал"),
    ("neutral", "нейтрален"),
    ("watch", "под наблюдением"),
    ("enemy", "враг"),
    ("prisoner", "в плену"),
    ("dead", "мёртв"),
    ("open", "открыто"),
    ("progress", "в процессе"),
    ("done", "выполнено"),
    ("failed", "провалено"),
    ("planned", "запланировано"),
];

/// Статус по ID или русскому названию.
pub fn status_id(query: &str) -> Option<&'static str> {
    let q = query.trim().to_lowercase().replace('ё', "е");
    KB_STATUSES
        .iter()
        .find(|(id, label)| *id == q || label.replace('ё', "е") == q)
        .map(|(id, _)| *id)
}

pub fn status_label(id: &str) -> &str {
    KB_STATUSES.iter().find(|(s, _)| *s == id).map_or(id, |(_, label)| label)
}

/// Слова запроса для поиска: от четырёх букв, с основой без окончания.
pub fn query_stems(text: &str) -> Vec<String> {
    let lower = text.to_lowercase().replace('ё', "е");
    let mut stems: Vec<String> = lower
        .split(|c: char| !c.is_alphanumeric())
        .filter(|w| w.chars().count() >= 4)
        .map(|w| {
            let chars: Vec<char> = w.chars().collect();
            let cut = match chars.len() {
                0..=4 => 0,
                5 => 1,
                _ => 2,
            };
            chars[..chars.len() - cut].iter().collect()
        })
        .collect();
    stems.sort();
    stems.dedup();
    stems
}

/// Сколько слов запроса встречается в тексте.
pub fn matches(stems: &[String], text: &str) -> usize {
    let lower = text.to_lowercase().replace('ё', "е");
    stems.iter().filter(|s| lower.contains(s.as_str())).count()
}

impl Session {
    pub fn notes(&self) -> &[MasterNote] {
        &self.notes
    }

    /// Указатель карточек базы (передаёт интерфейс).
    pub fn set_kb_cards(&mut self, cards: Vec<KbCard>) {
        self.kb_cards = cards;
    }

    pub fn kb_cards(&self) -> &[KbCard] {
        &self.kb_cards
    }

    pub fn kb_overrides(&self) -> &[KbOverride] {
        &self.kb_overrides
    }

    /// Карточка по ID или по названию. Пока указатель не передан, принимается любой ID.
    fn resolve_card(&self, query: &str) -> Result<String, EngineError> {
        let q = query.trim();
        if q.is_empty() {
            return Err(EngineError::UnknownCard(String::new()));
        }
        if self.kb_cards.is_empty() {
            return Ok(q.to_string());
        }
        let lower = q.to_lowercase().replace('ё', "е");
        self.kb_cards
            .iter()
            .find(|c| c.id == q)
            .or_else(|| {
                self.kb_cards.iter().find(|c| c.title.to_lowercase().replace('ё', "е") == lower)
            })
            .map(|c| c.id.clone())
            .ok_or_else(|| EngineError::UnknownCard(q.to_string()))
    }

    fn card_title(&self, id: &str) -> String {
        self.kb_cards
            .iter()
            .find(|c| c.id == id)
            .map_or_else(|| id.to_string(), |c| c.title.clone())
    }

    /// Запись мастера в базу знаний.
    pub fn add_note(
        &mut self,
        layer: NoteLayer,
        title: &str,
        text: &str,
    ) -> Result<u64, EngineError> {
        self.add_note_full(layer, title, text, None, false)
    }

    /// Запись в базу знаний с привязкой к карточке; `by_player` — запись игрока.
    pub fn add_note_full(
        &mut self,
        layer: NoteLayer,
        title: &str,
        text: &str,
        card: Option<&str>,
        by_player: bool,
    ) -> Result<u64, EngineError> {
        let result = (|| {
            let (title, text) = (title.trim(), text.trim());
            if title.is_empty() && text.is_empty() {
                return Err(EngineError::EmptyNote);
            }
            let card = match card.map(str::trim).filter(|c| !c.is_empty()) {
                Some(c) => Some(self.resolve_card(c)?),
                None => None,
            };
            let id = self.next_note_id;
            self.next_note_id += 1;
            let title: String =
                if title.is_empty() { "Без названия".into() } else { title.into() };
            self.notes.push(MasterNote {
                id,
                layer,
                day: self.scene.day,
                time: self.scene.time.clone(),
                title: title.clone(),
                text: text.into(),
                card,
                by_player,
            });
            Ok((id, title))
        })();
        self.logged(
            result,
            |(id, title)| format!("База знаний ({}): «{title}» [запись {id}]", layer.section()),
            || "запись в базу знаний".into(),
        )
        .map(|(id, _)| id)
    }

    /// Правка записи.
    pub fn update_note(&mut self, id: u64, edit: NoteEdit) -> Result<MasterNote, EngineError> {
        let result = (|| {
            let card = match edit.card.as_deref().map(str::trim) {
                Some("") => Some(None),
                Some(c) => Some(Some(self.resolve_card(c)?)),
                None => None,
            };
            let note =
                self.notes.iter_mut().find(|n| n.id == id).ok_or(EngineError::UnknownNote(id))?;
            let mut next = note.clone();
            if let Some(t) = edit.title {
                next.title = t.trim().to_string();
            }
            if let Some(t) = edit.text {
                next.text = t.trim().to_string();
            }
            if let Some(c) = card {
                next.card = c;
            }
            if let Some(l) = edit.layer {
                next.layer = l;
            }
            if next.title.is_empty() && next.text.is_empty() {
                return Err(EngineError::EmptyNote);
            }
            if next.title.is_empty() {
                next.title = "Без названия".into();
            }
            *note = next.clone();
            Ok(next)
        })();
        self.logged(
            result,
            |n| format!("База знаний: исправлена запись {} «{}»", n.id, n.title),
            || format!("запись {id}"),
        )
    }

    /// Удаление записи.
    pub fn delete_note(&mut self, id: u64) -> Result<(), EngineError> {
        let result = self
            .notes
            .iter()
            .position(|n| n.id == id)
            .ok_or(EngineError::UnknownNote(id))
            .map(|i| self.notes.remove(i));
        self.logged(
            result,
            |n| format!("База знаний: удалена запись {} «{}»", n.id, n.title),
            || format!("запись {id}"),
        )
        .map(|_| ())
    }

    /// Статус карточки по ходу игры; `status = None` — вернуть статус из файла базы.
    pub fn set_card_status(
        &mut self,
        card: &str,
        status: Option<&str>,
        note: &str,
    ) -> Result<(), EngineError> {
        let result = (|| {
            let card_id = self.resolve_card(card)?;
            let title = self.card_title(&card_id);
            match status {
                None => {
                    let before = self.kb_overrides.len();
                    self.kb_overrides.retain(|o| o.card_id != card_id);
                    if before == self.kb_overrides.len() {
                        return Err(EngineError::NoCardOverride(title));
                    }
                    Ok(format!("Карточка «{title}»: статус из базы восстановлен"))
                }
                Some(s) => {
                    let status =
                        status_id(s).ok_or_else(|| EngineError::UnknownStatus(s.to_string()))?;
                    let entry = KbOverride {
                        card_id: card_id.clone(),
                        status: status.to_string(),
                        note: note.trim().to_string(),
                        day: self.scene.day,
                    };
                    match self.kb_overrides.iter_mut().find(|o| o.card_id == card_id) {
                        Some(o) => *o = entry,
                        None => self.kb_overrides.push(entry),
                    }
                    Ok(format!("Карточка «{title}»: {}", status_label(status)))
                }
            }
        })();
        self.logged(result, Clone::clone, || format!("карточка «{card}»")).map(|_| ())
    }

    /// Записи, подходящие к запросу (для контекста мастера), лучшие первыми.
    pub fn notes_matching(&self, query: &str, layer: NoteLayer) -> Vec<&MasterNote> {
        let stems = query_stems(query);
        if stems.is_empty() {
            return Vec::new();
        }
        let mut scored: Vec<(usize, &MasterNote)> = self
            .notes
            .iter()
            .filter(|n| n.layer == layer)
            .map(|n| {
                let card = n.card.as_deref().map(|c| self.card_title(c)).unwrap_or_default();
                (matches(&stems, &format!("{} {} {card}", n.title, n.text)), n)
            })
            .filter(|(score, _)| *score > 0)
            .collect();
        scored.sort_by(|a, b| b.0.cmp(&a.0).then(b.1.id.cmp(&a.1.id)));
        scored.into_iter().map(|(_, n)| n).collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::rng::Xoshiro256;

    fn session() -> Session {
        let mut s = Session::demo(Xoshiro256::from_seed(1));
        s.set_kb_cards(vec![
            KbCard {
                id: "goal.astrolabe".into(),
                title: "Получить Княжескую Астролябию".into(),
                layer: "player".into(),
                status: Some("progress".into()),
            },
            KbCard {
                id: "npc.orelie".into(),
                title: "Мадам Орели".into(),
                layer: "world".into(),
                status: Some("watch".into()),
            },
        ]);
        s
    }

    #[test]
    fn notes_link_edit_and_delete() {
        let mut s = session();
        let id = s
            .add_note_full(
                NoteLayer::Player,
                "Слежка",
                "Орели ходит к ростовщику",
                Some("Мадам Орели"),
                false,
            )
            .unwrap();
        assert_eq!(s.notes()[0].card.as_deref(), Some("npc.orelie"));
        assert!(s.add_note_full(NoteLayer::Player, "x", "", Some("npc.nobody"), false).is_err());
        let edited = s
            .update_note(
                id,
                NoteEdit {
                    text: Some("Ходит дважды в день".into()),
                    card: Some(String::new()),
                    ..NoteEdit::default()
                },
            )
            .unwrap();
        assert_eq!(edited.text, "Ходит дважды в день");
        assert!(edited.card.is_none());
        assert!(s
            .update_note(
                id,
                NoteEdit {
                    title: Some(String::new()),
                    text: Some(" ".into()),
                    ..NoteEdit::default()
                }
            )
            .is_err());
        s.delete_note(id).unwrap();
        assert!(s.notes().is_empty());
        assert_eq!(s.delete_note(id), Err(EngineError::UnknownNote(id)));
    }

    #[test]
    fn card_status_overrides() {
        let mut s = session();
        s.set_card_status("goal.astrolabe", Some("выполнено"), "Получена у Халида").unwrap();
        assert_eq!(s.kb_overrides()[0].status, "done");
        s.set_card_status("goal.astrolabe", Some("failed"), "").unwrap();
        assert_eq!(s.kb_overrides().len(), 1);
        assert!(s.set_card_status("goal.astrolabe", Some("победа"), "").is_err());
        s.set_card_status("goal.astrolabe", None, "").unwrap();
        assert!(s.kb_overrides().is_empty());
        assert!(s.set_card_status("goal.astrolabe", None, "").is_err());
    }

    #[test]
    fn notes_are_found_by_query_words() {
        let mut s = session();
        s.add_note(NoteLayer::Master, "План Вернера", "Готовит засаду на обоз репараций").unwrap();
        s.add_note(NoteLayer::Master, "Погода", "Дождь").unwrap();
        let found = s.notes_matching("Что слышно про обоз и засады?", NoteLayer::Master);
        assert_eq!(found.len(), 1);
        assert_eq!(found[0].title, "План Вернера");
        assert!(query_stems("и да").is_empty());
    }
}
