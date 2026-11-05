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

/// Вид записи журнала.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "snake_case"))]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum NoteKind {
    /// Что произошло.
    #[default]
    Event,
    /// Скрытая правда за событием.
    Secret,
    /// Что NPC или фракция собирается сделать.
    Plan,
    /// Событие, назначенное на день (`due_day`).
    Timer,
}

impl NoteKind {
    pub fn label(self) -> &'static str {
        match self {
            NoteKind::Event => "событие",
            NoteKind::Secret => "тайна",
            NoteKind::Plan => "план NPC",
            NoteKind::Timer => "таймер",
        }
    }

    pub fn parse(s: &str) -> Option<Self> {
        match s.trim().to_lowercase().as_str() {
            "event" | "событие" => Some(NoteKind::Event),
            "secret" | "тайна" => Some(NoteKind::Secret),
            "plan" | "план" | "план npc" => Some(NoteKind::Plan),
            "timer" | "таймер" => Some(NoteKind::Timer),
            _ => None,
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
    #[cfg_attr(feature = "serde", serde(default))]
    pub kind: NoteKind,
    /// День срабатывания таймера.
    #[cfg_attr(feature = "serde", serde(default))]
    pub due_day: Option<u32>,
    /// Таймер отработан (или план исполнен) — в напоминания не попадает.
    #[cfg_attr(feature = "serde", serde(default))]
    pub done: bool,
}

/// Изменение записи. `None` — поле не меняется; пустая карточка — отвязать.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct NoteEdit {
    pub title: Option<String>,
    pub text: Option<String>,
    pub card: Option<String>,
    pub layer: Option<NoteLayer>,
    pub kind: Option<NoteKind>,
    /// `Some(None)` — убрать день таймера.
    pub due_day: Option<Option<u32>>,
    pub done: Option<bool>,
}

/// Новая запись.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct NewNote {
    pub layer: NoteLayer,
    pub title: String,
    pub text: String,
    pub card: Option<String>,
    pub by_player: bool,
    pub kind: NoteKind,
    pub due_day: Option<u32>,
}

impl NewNote {
    pub fn new(layer: NoteLayer, title: &str, text: &str) -> Self {
        Self {
            layer,
            title: title.into(),
            text: text.into(),
            card: None,
            by_player: false,
            kind: NoteKind::Event,
            due_day: None,
        }
    }
}

/// Поле «название — значение» карточки.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CardFact {
    pub label: String,
    pub value: String,
}

/// Карточка базы, созданная по ходу игры (NPC, место, угроза, пленник).
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CustomCard {
    pub id: String,
    /// `player`, `master` или `world`.
    pub layer: String,
    /// Раздел слоя (ID из базы), например `prisoners`.
    pub section: String,
    pub title: String,
    #[cfg_attr(feature = "serde", serde(default))]
    pub subtitle: String,
    pub summary: String,
    #[cfg_attr(feature = "serde", serde(default))]
    pub facts: Vec<CardFact>,
    #[cfg_attr(feature = "serde", serde(default))]
    pub status: Option<String>,
    pub day: u32,
    #[cfg_attr(feature = "serde", serde(default))]
    pub by_player: bool,
}

/// Данные новой или изменённой карточки. `None` — поле не меняется.
#[cfg_attr(feature = "serde", derive(serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(default))]
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct CardDraft {
    pub layer: Option<String>,
    pub section: Option<String>,
    pub title: Option<String>,
    pub subtitle: Option<String>,
    pub summary: Option<String>,
    pub facts: Option<Vec<CardFact>>,
    pub status: Option<String>,
}

/// Разделы слоёв базы (совпадают с интерфейсом).
pub const KB_SECTIONS: [(&str, &[&str]); 3] = [
    ("player", &["goals", "personas", "secrets", "known", "chronicle", "notes"]),
    ("master", &["schedule", "threats", "prisoners", "secrets", "journal"]),
    ("world", &["locations", "npc", "factions", "lore", "artifacts", "rules", "maps"]),
];

/// Сколько ходов мастера без записей в базу, прежде чем ему напомнят.
pub const NOTE_REMINDER_TURNS: u32 = 6;

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

fn check_section(layer: &str, section: &str) -> Result<(), EngineError> {
    let sections = KB_SECTIONS
        .iter()
        .find(|(l, _)| *l == layer)
        .map(|(_, s)| *s)
        .ok_or_else(|| EngineError::UnknownSection(format!("слой «{layer}»")))?;
    if sections.contains(&section) {
        Ok(())
    } else {
        Err(EngineError::UnknownSection(format!(
            "{layer}/{section}: можно {}",
            sections.join(", ")
        )))
    }
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
        let lower = q.to_lowercase().replace('ё', "е");
        if let Some(c) = self
            .custom_cards
            .iter()
            .find(|c| c.id == q || c.title.to_lowercase().replace('ё', "е") == lower)
        {
            return Ok(c.id.clone());
        }
        if self.kb_cards.is_empty() {
            return Ok(q.to_string());
        }
        self.kb_cards
            .iter()
            .find(|c| c.id == q)
            .or_else(|| {
                self.kb_cards.iter().find(|c| c.title.to_lowercase().replace('ё', "е") == lower)
            })
            .map(|c| c.id.clone())
            .ok_or_else(|| EngineError::UnknownCard(q.to_string()))
    }

    /// Название карточки (из базы или созданной по ходу игры).
    pub fn card_title(&self, id: &str) -> String {
        self.custom_cards
            .iter()
            .find(|c| c.id == id)
            .map(|c| c.title.clone())
            .or_else(|| self.kb_cards.iter().find(|c| c.id == id).map(|c| c.title.clone()))
            .unwrap_or_else(|| id.to_string())
    }

    /// Запись мастера в базу знаний.
    pub fn add_note(
        &mut self,
        layer: NoteLayer,
        title: &str,
        text: &str,
    ) -> Result<u64, EngineError> {
        self.create_note(NewNote::new(layer, title, text))
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
        self.create_note(NewNote {
            card: card.map(Into::into),
            by_player,
            ..NewNote::new(layer, title, text)
        })
    }

    /// Новая запись любого вида (событие, тайна, план, таймер).
    pub fn create_note(&mut self, new: NewNote) -> Result<u64, EngineError> {
        let layer = new.layer;
        let result = (|| {
            let (title, text) = (new.title.trim(), new.text.trim());
            if title.is_empty() && text.is_empty() {
                return Err(EngineError::EmptyNote);
            }
            let card = match new.card.as_deref().map(str::trim).filter(|c| !c.is_empty()) {
                Some(c) => Some(self.resolve_card(c)?),
                None => None,
            };
            if new.kind == NoteKind::Timer && new.due_day.is_none() {
                return Err(EngineError::TimerWithoutDay);
            }
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
                by_player: new.by_player,
                kind: new.kind,
                due_day: new.due_day,
                done: false,
            });
            Ok((id, title, new.kind, new.due_day))
        })();
        self.logged(
            result,
            |(id, title, kind, due)| {
                let extra = match (kind, due) {
                    (NoteKind::Event, _) => String::new(),
                    (k, Some(d)) => format!(", {} на День {d}", k.label()),
                    (k, None) => format!(", {}", k.label()),
                };
                format!("База знаний ({}): «{title}» [запись {id}{extra}]", layer.section())
            },
            || "запись в базу знаний".into(),
        )
        .map(|(id, ..)| id)
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
            if let Some(k) = edit.kind {
                next.kind = k;
            }
            if let Some(d) = edit.due_day {
                next.due_day = d;
            }
            if let Some(d) = edit.done {
                next.done = d;
            }
            if next.kind == NoteKind::Timer && next.due_day.is_none() {
                return Err(EngineError::TimerWithoutDay);
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

    pub fn custom_cards(&self) -> &[CustomCard] {
        &self.custom_cards
    }

    /// Новая карточка базы. ID строится из названия: `dyn.<слова>`.
    pub fn create_card(
        &mut self,
        draft: CardDraft,
        by_player: bool,
    ) -> Result<String, EngineError> {
        let result = (|| {
            let title = draft.title.as_deref().map(str::trim).unwrap_or_default().to_string();
            if title.is_empty() {
                return Err(EngineError::EmptyNote);
            }
            let layer = draft.layer.as_deref().unwrap_or("master").trim().to_string();
            let section = draft.section.as_deref().unwrap_or_default().trim().to_string();
            check_section(&layer, &section)?;
            let status = match draft.status.as_deref().map(str::trim).filter(|s| !s.is_empty()) {
                Some(s) => {
                    Some(status_id(s).ok_or_else(|| EngineError::UnknownStatus(s.into()))?.into())
                }
                None => None,
            };
            let base = title
                .to_lowercase()
                .chars()
                .map(|c| if c.is_alphanumeric() { c } else { ' ' })
                .collect::<String>()
                .split_whitespace()
                .take(4)
                .collect::<Vec<_>>()
                .join("_");
            let mut id = format!("dyn.{base}");
            let mut n = 2;
            while self.custom_cards.iter().any(|c| c.id == id)
                || self.kb_cards.iter().any(|c| c.id == id)
            {
                id = format!("dyn.{base}_{n}");
                n += 1;
            }
            self.custom_cards.push(CustomCard {
                id: id.clone(),
                layer,
                section,
                title: title.clone(),
                subtitle: draft.subtitle.unwrap_or_default().trim().to_string(),
                summary: draft.summary.unwrap_or_default().trim().to_string(),
                facts: draft.facts.unwrap_or_default(),
                status,
                day: self.scene.day,
                by_player,
            });
            Ok((id, title))
        })();
        self.logged(
            result,
            |(id, title)| format!("База знаний: новая карточка «{title}» [{id}]"),
            || "новая карточка".into(),
        )
        .map(|(id, _)| id)
    }

    /// Правка карточки, созданной по ходу игры.
    pub fn update_card(&mut self, id: &str, draft: CardDraft) -> Result<(), EngineError> {
        let result = (|| {
            let card = self
                .custom_cards
                .iter_mut()
                .find(|c| c.id == id)
                .ok_or_else(|| EngineError::NotCustomCard(id.to_string()))?;
            let mut next = card.clone();
            if let Some(l) = draft.layer {
                next.layer = l.trim().into();
            }
            if let Some(s) = draft.section {
                next.section = s.trim().into();
            }
            check_section(&next.layer, &next.section)?;
            if let Some(t) = draft.title.filter(|t| !t.trim().is_empty()) {
                next.title = t.trim().into();
            }
            if let Some(t) = draft.subtitle {
                next.subtitle = t.trim().into();
            }
            if let Some(t) = draft.summary {
                next.summary = t.trim().into();
            }
            if let Some(f) = draft.facts {
                next.facts = f;
            }
            if let Some(s) = draft.status {
                let s = s.trim();
                next.status = if s.is_empty() {
                    None
                } else {
                    Some(status_id(s).ok_or_else(|| EngineError::UnknownStatus(s.into()))?.into())
                };
            }
            *card = next.clone();
            Ok(next.title)
        })();
        self.logged(
            result,
            |t| format!("База знаний: исправлена карточка «{t}»"),
            || format!("карточка «{id}»"),
        )
        .map(|_| ())
    }

    /// Удаление карточки, созданной по ходу игры; записи отвязываются от неё.
    pub fn delete_card(&mut self, id: &str) -> Result<(), EngineError> {
        let result = self
            .custom_cards
            .iter()
            .position(|c| c.id == id)
            .ok_or_else(|| EngineError::NotCustomCard(id.to_string()))
            .map(|i| self.custom_cards.remove(i));
        if result.is_ok() {
            for n in self.notes.iter_mut().filter(|n| n.card.as_deref() == Some(id)) {
                n.card = None;
            }
            self.kb_overrides.retain(|o| o.card_id != id);
        }
        self.logged(
            result,
            |c| format!("База знаний: удалена карточка «{}»", c.title),
            || format!("карточка «{id}»"),
        )
        .map(|_| ())
    }

    /// Таймеры и планы с наступившим днём, ещё не отработанные.
    pub fn due_notes(&self) -> Vec<&MasterNote> {
        self.notes
            .iter()
            .filter(|n| !n.done && n.due_day.is_some_and(|d| d <= self.scene.day))
            .collect()
    }

    /// Сколько ходов мастера подряд прошло без записей и карточек.
    pub fn turns_without_notes(&self) -> u32 {
        self.turns_without_notes
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

    #[test]
    fn custom_cards_and_timers() {
        let mut s = session();
        let id = s
            .create_card(
                CardDraft {
                    layer: Some("master".into()),
                    section: Some("prisoners".into()),
                    title: Some("Соглядатай в серо-бурой робе".into()),
                    summary: Some("Задержан Корвусом у Шпиля".into()),
                    status: Some("в плену".into()),
                    ..CardDraft::default()
                },
                false,
            )
            .unwrap();
        assert_eq!(id, "dyn.соглядатай_в_серо_бурой");
        assert_eq!(s.custom_cards()[0].status.as_deref(), Some("prisoner"));
        assert!(s
            .create_card(
                CardDraft {
                    title: Some("x".into()),
                    section: Some("tavern".into()),
                    ..CardDraft::default()
                },
                false
            )
            .is_err());
        let note = s
            .create_note(NewNote {
                kind: NoteKind::Timer,
                due_day: Some(83),
                card: Some("Соглядатай в серо-бурой робе".into()),
                ..NewNote::new(NoteLayer::Master, "Хвост на тракте", "Сообщники выслеживают князя")
            })
            .unwrap();
        assert!(s.due_notes().is_empty());
        s.change_scene(crate::master_ops::SceneChange { day: Some(83), ..Default::default() })
            .unwrap();
        assert_eq!(s.due_notes().len(), 1);
        s.update_note(note, NoteEdit { done: Some(true), ..NoteEdit::default() }).unwrap();
        assert!(s.due_notes().is_empty());
        assert!(s
            .create_note(NewNote {
                kind: NoteKind::Timer,
                ..NewNote::new(NoteLayer::Master, "t", "")
            })
            .is_err());
        s.update_card(&id, CardDraft { status: Some("dead".into()), ..CardDraft::default() })
            .unwrap();
        assert!(s.update_card("goal.astrolabe", CardDraft::default()).is_err());
        s.delete_card(&id).unwrap();
        assert!(s.notes()[0].card.is_none());
    }
}
