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
    /// Пересказ дня для хроники: описываемый день — в поле `day`.
    Day,
}

impl NoteKind {
    pub fn label(self) -> &'static str {
        match self {
            NoteKind::Event => "событие",
            NoteKind::Secret => "тайна",
            NoteKind::Plan => "план NPC",
            NoteKind::Timer => "таймер",
            NoteKind::Day => "день",
        }
    }

    pub fn parse(s: &str) -> Option<Self> {
        match s.trim().to_lowercase().as_str() {
            "event" | "событие" => Some(NoteKind::Event),
            "secret" | "тайна" => Some(NoteKind::Secret),
            "plan" | "план" | "план npc" => Some(NoteKind::Plan),
            "timer" | "таймер" => Some(NoteKind::Timer),
            "day" | "день" => Some(NoteKind::Day),
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
    /// Сколько ходов мастера таймер уже висит сработавшим: после
    /// [`TIMER_AUTO_DONE_TURNS`] движок сам отмечает его отработанным.
    #[cfg_attr(feature = "serde", serde(default))]
    pub due_turns: u32,
}

/// Через сколько ходов мастера сработавший таймер закрывается сам.
pub const TIMER_AUTO_DONE_TURNS: u32 = 3;

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
    /// Развёрнутое описание (абзацы через пустую строку).
    #[cfg_attr(feature = "serde", serde(default))]
    pub text: String,
    /// Карточка, внутри которой находится эта: место внутри локации.
    #[cfg_attr(feature = "serde", serde(default))]
    pub parent: Option<String>,
    /// Данные цели (раздел `goals`): заказчик, награда, срок, шаги, ход выполнения.
    #[cfg_attr(feature = "serde", serde(default))]
    pub goal: Option<Goal>,
}

/// Цель героя: что обещано, к какому сроку, из каких шагов состоит и как продвигается.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct Goal {
    /// Кто поручил.
    #[cfg_attr(feature = "serde", serde(default))]
    pub giver: String,
    #[cfg_attr(feature = "serde", serde(default))]
    pub reward: String,
    /// Срок: день кампании.
    #[cfg_attr(feature = "serde", serde(default))]
    pub due_day: Option<u32>,
    #[cfg_attr(feature = "serde", serde(default))]
    pub steps: Vec<GoalStep>,
    /// Ход выполнения: записи не затирают друг друга.
    #[cfg_attr(feature = "serde", serde(default))]
    pub log: Vec<GoalLog>,
}

#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct GoalStep {
    pub text: String,
    #[cfg_attr(feature = "serde", serde(default))]
    pub done: bool,
}

#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct GoalLog {
    pub day: u32,
    pub text: String,
}

/// Изменение цели одной командой. `None` — поле не меняется.
#[cfg_attr(feature = "serde", derive(serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(default))]
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct GoalEdit {
    pub giver: Option<String>,
    pub reward: Option<String>,
    /// `Some(0)` — убрать срок.
    pub due_day: Option<u32>,
    /// Заменить список шагов.
    pub steps: Option<Vec<String>>,
    /// Добавить шаг.
    pub add_step: Option<String>,
    /// Отметить шаг выполненным: номер с единицы.
    pub step_done: Option<usize>,
    /// Снять отметку с шага: номер с единицы.
    pub step_undone: Option<usize>,
    /// Строка в ход выполнения.
    pub log: Option<String>,
    pub status: Option<String>,
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
    pub text: Option<String>,
    /// Пустая строка — убрать родителя.
    pub parent: Option<String>,
    pub goal: Option<GoalEdit>,
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
    /// Одно-два предложения для оглавления и хроники.
    #[cfg_attr(feature = "serde", serde(default))]
    pub summary: String,
    /// Полный текст карточки — ответ движка на запрос мастера `query card`.
    #[cfg_attr(feature = "serde", serde(default))]
    pub text: String,
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

/// Слова запроса для поиска: от трёх букв (числа — любые), с основой без окончания.
pub fn query_stems(text: &str) -> Vec<String> {
    let lower = text.to_lowercase().replace('ё', "е");
    let mut stems: Vec<String> = lower
        .split(|c: char| !c.is_alphanumeric())
        .filter(|w| {
            w.chars().count() >= 3 || (!w.is_empty() && w.chars().all(|c| c.is_ascii_digit()))
        })
        .filter(|w| !STOP_WORDS.contains(w))
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

/// Частые короткие слова: в поиске по базе только шумят.
const STOP_WORDS: [&str; 40] = [
    "что", "как", "это", "его", "она", "они", "мне", "мой", "моя", "мои", "тут", "там", "все",
    "всё", "для", "при", "под", "над", "без", "или", "уже", "еще", "ещё", "так", "вот", "вам",
    "нас", "вас", "них", "ним", "ней", "был", "кто", "где", "раз", "ему", "тем", "чем", "про",
    "иду",
];

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
            // Запись важнее привязки: с несуществующей карточкой она сохраняется без неё,
            // иначе мастер теряет память о событии.
            let mut unlinked = None;
            let card = match new.card.as_deref().map(str::trim).filter(|c| !c.is_empty()) {
                Some(c) => self.resolve_card(c).map_err(|_| unlinked = Some(c.to_string())).ok(),
                None => None,
            };
            if new.kind == NoteKind::Timer && new.due_day.is_none() {
                return Err(EngineError::TimerWithoutDay);
            }
            // Защита от дублей: мастер повторил запись за тот же день — обновляется прежняя.
            if !new.by_player {
                let (t, x) = (fold(title), fold(text));
                let today = self.scene.day;
                if let Some(old) = self.notes.iter_mut().find(|n| {
                    !n.by_player
                        && n.layer == layer
                        && n.day == today
                        && n.kind == new.kind
                        && ((!t.is_empty() && fold(&n.title) == t)
                            || (x.chars().count() >= 20 && fold(&n.text) == x))
                }) {
                    if !text.is_empty() && fold(&old.text) != x {
                        old.text = text.into();
                    }
                    if old.card.is_none() {
                        old.card = card;
                    }
                    return Ok((old.id, old.title.clone(), new.kind, new.due_day, unlinked, true));
                }
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
                due_turns: 0,
            });
            Ok((id, title, new.kind, new.due_day, unlinked, false))
        })();
        self.logged(
            result,
            |(id, title, kind, due, unlinked, existing)| {
                if *existing {
                    return format!(
                        "База знаний ({}): запись «{title}» уже есть — обновлена [запись {id}]",
                        layer.section()
                    );
                }
                let extra = match (kind, due) {
                    (NoteKind::Event, _) => String::new(),
                    (k, Some(d)) => format!(", {} на День {d}", k.label()),
                    (k, None) => format!(", {}", k.label()),
                };
                format!(
                    "База знаний ({}): «{title}» [запись {id}{extra}]{}",
                    layer.section(),
                    unlinked_note(unlinked.as_deref())
                )
            },
            || "запись в базу знаний".into(),
        )
        .map(|(id, ..)| id)
    }

    /// Правка записи.
    pub fn update_note(&mut self, id: u64, edit: NoteEdit) -> Result<MasterNote, EngineError> {
        let result = (|| {
            // Неизвестная карточка не отменяет правку записи: привязка просто не меняется.
            let mut unlinked = None;
            let card = match edit.card.as_deref().map(str::trim) {
                Some("") => Some(None),
                Some(c) => match self.resolve_card(c) {
                    Ok(id) => Some(Some(id)),
                    Err(_) => {
                        unlinked = Some(c.to_string());
                        None
                    }
                },
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
            Ok((next, unlinked))
        })();
        self.logged(
            result,
            |(n, unlinked)| {
                format!(
                    "База знаний: исправлена запись {} «{}»{}",
                    n.id,
                    n.title,
                    unlinked_note(unlinked.as_deref())
                )
            },
            || format!("запись {id}"),
        )
        .map(|(n, _)| n)
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
    ///
    /// Карточка не теряется и не дублируется: неизвестный раздел заменяется запасным
    /// («Заметки» у игрока, «Журнал мастера» у мастера, «Лор» у мира), а повтор мастером
    /// карточки с тем же названием в том же разделе обновляет прежнюю.
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
            let mut layer = draft.layer.as_deref().unwrap_or("master").trim().to_string();
            let mut section = draft.section.as_deref().unwrap_or_default().trim().to_string();
            let mut moved = None;
            if check_section(&layer, &section).is_err() {
                let asked = format!("{layer}/{section}");
                if by_player {
                    check_section(&layer, &section)?;
                }
                (layer, section) = match layer.as_str() {
                    "player" => ("player".into(), "notes".into()),
                    "world" => ("world".into(), "lore".into()),
                    _ => ("master".into(), "journal".into()),
                };
                moved = Some(asked);
            }
            let status = match draft.status.as_deref().map(str::trim).filter(|s| !s.is_empty()) {
                Some(s) => {
                    Some(status_id(s).ok_or_else(|| EngineError::UnknownStatus(s.into()))?.into())
                }
                None if section == "goals" => Some("active".to_string()),
                None => None,
            };
            let parent = self.resolve_parent(draft.parent.as_deref());
            let day = self.scene.day;
            if !by_player {
                let key = fold(&title);
                if let Some(old) = self
                    .custom_cards
                    .iter_mut()
                    .find(|c| c.layer == layer && c.section == section && fold(&c.title) == key)
                {
                    for (field, value) in [
                        (&mut old.subtitle, draft.subtitle.as_deref()),
                        (&mut old.summary, draft.summary.as_deref()),
                        (&mut old.text, draft.text.as_deref()),
                    ] {
                        if let Some(v) = value.map(str::trim).filter(|v| !v.is_empty()) {
                            *field = v.to_string();
                        }
                    }
                    if let Some(f) = draft.facts.filter(|f| !f.is_empty()) {
                        old.facts = f;
                    }
                    if draft.status.is_some() {
                        old.status = status;
                    }
                    if parent.is_some() {
                        old.parent = parent;
                    }
                    if let Some(edit) = &draft.goal {
                        apply_goal(old.goal.get_or_insert_with(Goal::default), edit, day)?;
                    }
                    return Ok((old.id.clone(), title, Some("уже есть — обновлена".to_string())));
                }
            }
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
            let goal = if section == "goals" {
                let mut goal = Goal::default();
                if let Some(edit) = &draft.goal {
                    apply_goal(&mut goal, edit, day)?;
                }
                Some(goal)
            } else {
                None
            };
            self.custom_cards.push(CustomCard {
                id: id.clone(),
                layer,
                section,
                title: title.clone(),
                subtitle: draft.subtitle.unwrap_or_default().trim().to_string(),
                summary: draft.summary.unwrap_or_default().trim().to_string(),
                facts: draft.facts.unwrap_or_default(),
                status,
                day,
                by_player,
                text: draft.text.unwrap_or_default().trim().to_string(),
                parent,
                goal,
            });
            Ok((id, title, moved.map(|m| format!("раздела «{m}» нет — положена в запасной"))))
        })();
        self.logged(
            result,
            |(id, title, note)| match note {
                Some(n) => format!("База знаний: карточка «{title}» [{id}] — {n}"),
                None => format!("База знаний: новая карточка «{title}» [{id}]"),
            },
            || "новая карточка".into(),
        )
        .map(|(id, _, _)| id)
    }

    /// Родитель карточки: существующая карточка или `None` (неизвестный родитель не мешает).
    fn resolve_parent(&self, parent: Option<&str>) -> Option<String> {
        let p = parent.map(str::trim).filter(|p| !p.is_empty())?;
        self.resolve_card(p).ok().filter(|_| !self.kb_cards.is_empty() || p.starts_with("dyn."))
    }

    /// Правка карточки, созданной по ходу игры.
    pub fn update_card(&mut self, id: &str, draft: CardDraft) -> Result<(), EngineError> {
        if !self.custom_cards.iter().any(|c| c.id == id) {
            if let Some(card) = self.kb_cards.iter().find(|c| c.id == id).cloned() {
                return self.add_to_builtin(&card, draft);
            }
        }
        let parent = draft.parent.as_deref().map(|p| self.resolve_parent(Some(p)));
        let day = self.scene.day;
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
            if let Some(t) = draft.text {
                next.text = t.trim().into();
            }
            if let Some(p) = parent {
                next.parent = p.filter(|p| p != id);
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
            if let Some(edit) = &draft.goal {
                apply_goal(next.goal.get_or_insert_with(Goal::default), edit, day)?;
                if let Some(s) = edit.status.as_deref().map(str::trim).filter(|s| !s.is_empty()) {
                    next.status = Some(
                        status_id(s).ok_or_else(|| EngineError::UnknownStatus(s.into()))?.into(),
                    );
                }
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

    /// Дополнение встроенной карточки: файл базы не меняется, новое о карточке становится
    /// записью, привязанной к ней (видна в карточке как «Дополнено в игре»). Статус — как
    /// командой `card`. Слой записи — слой карточки (тайны мастера остаются у мастера).
    fn add_to_builtin(&mut self, card: &KbCard, draft: CardDraft) -> Result<(), EngineError> {
        if let Some(status) = draft.status.as_deref().map(str::trim).filter(|s| !s.is_empty()) {
            self.set_card_status(&card.id, Some(status), "")?;
        }
        let mut parts: Vec<String> = Vec::new();
        for t in [draft.summary.as_deref(), draft.text.as_deref()].into_iter().flatten() {
            let t = t.trim();
            if !t.is_empty() && !parts.iter().any(|p| p == t) {
                parts.push(t.to_string());
            }
        }
        for f in draft.facts.unwrap_or_default() {
            if !f.label.trim().is_empty() || !f.value.trim().is_empty() {
                parts.push(format!("{}: {}", f.label.trim(), f.value.trim()));
            }
        }
        if parts.is_empty() {
            return if draft.status.is_some() {
                Ok(())
            } else {
                self.logged(
                    Err(EngineError::EmptyNote),
                    |()| String::new(),
                    || format!("карточка «{}»", card.title),
                )
            };
        }
        let layer = if card.layer == "master" { NoteLayer::Master } else { NoteLayer::Player };
        let mut note =
            NewNote::new(layer, &format!("Дополнение: {}", card.title), &parts.join("\n"));
        note.card = Some(card.id.clone());
        self.create_note(note).map(|_| ())
    }

    /// Ход цели: шаги, срок, запись о продвижении, статус. У цели из встроенной базы
    /// меняется только статус (с пояснением из `log`).
    pub fn update_goal(&mut self, card: &str, edit: GoalEdit) -> Result<(), EngineError> {
        let id = match self.resolve_card(card) {
            Ok(id) => id,
            Err(e) => return self.logged(Err(e), |()| String::new(), || format!("цель «{card}»")),
        };
        if self.custom_cards.iter().any(|c| c.id == id) {
            return self.update_card(&id, CardDraft { goal: Some(edit), ..CardDraft::default() });
        }
        match edit.status.as_deref() {
            Some(status) => {
                self.set_card_status(&id, Some(status), edit.log.as_deref().unwrap_or(""))
            }
            None => self.logged(
                Err(EngineError::NotCustomCard(id.clone())),
                |()| String::new(),
                || format!("цель «{card}»"),
            ),
        }
    }

    /// Цели героя, которые ещё не закрыты (созданные по ходу игры).
    pub fn active_goals(&self) -> Vec<&CustomCard> {
        self.custom_cards
            .iter()
            .filter(|c| c.section == "goals" && c.layer == "player")
            .filter(|c| !matches!(c.status.as_deref(), Some("done" | "failed")))
            .collect()
    }

    /// Подготовка новой игры своей кампании (скрытый шаг перед вступлением): чего ещё нет.
    /// Пусто — подготовка готова или это кампания «Дома Стрэндж».
    pub fn start_prep_missing(&self) -> Vec<&'static str> {
        if self.campaign().is_none() {
            return Vec::new();
        }
        let mut out = Vec::new();
        let player = |n: &&MasterNote| n.layer == NoteLayer::Player;
        let master = |n: &&MasterNote| n.layer == NoteLayer::Master;
        if !self.notes.iter().filter(player).any(|n| fold(&n.title).contains("предыстория героя"))
        {
            out.push("запись слоя игрока «Предыстория героя» — кто герой и как он связан с событиями начала кампании");
        }
        if self.active_goals().len() < 2 {
            out.push("2–3 начальные цели героя (new_card в разделе goals слоя игрока, с заказчиком и шагами)");
        }
        if !self
            .notes
            .iter()
            .filter(master)
            .any(|n| matches!(n.kind, NoteKind::Secret | NoteKind::Plan | NoteKind::Event))
        {
            out.push("в слой мастера: зацепки, связанные с героем NPC и тайна героя (kind secret или plan)");
        }
        if !self.notes.iter().filter(master).any(|n| n.kind == NoteKind::Timer) {
            out.push("в слой мастера: 1–2 таймера — что случится, если герой ничего не сделает (kind timer, due_day)");
        }
        out
    }

    /// После загрузки: привязки записей и статусы карточек, которых больше нет в базе
    /// (изменился состав встроенной базы), снимаются, а не висят молча.
    pub fn repair_links(&mut self) -> usize {
        if self.kb_cards.is_empty() {
            return 0;
        }
        let known = |id: &str| {
            self.kb_cards.iter().any(|c| c.id == id) || self.custom_cards.iter().any(|c| c.id == id)
        };
        let lost: Vec<String> = self
            .notes
            .iter()
            .filter_map(|n| n.card.clone())
            .chain(self.kb_overrides.iter().map(|o| o.card_id.clone()))
            .filter(|id| !known(id))
            .collect();
        if lost.is_empty() {
            return 0;
        }
        for n in &mut self.notes {
            if n.card.as_ref().is_some_and(|c| lost.contains(c)) {
                n.card = None;
            }
        }
        self.kb_overrides.retain(|o| !lost.contains(&o.card_id));
        let mut ids = lost.clone();
        ids.sort();
        ids.dedup();
        self.log(format!(
            "База знаний: карточек больше нет в базе, привязки и статусы сняты — {}",
            ids.join(", ")
        ));
        ids.len()
    }

    /// Конец хода мастера: сработавший таймер, который мастер так и не закрыл, движок
    /// закрывает сам через [`TIMER_AUTO_DONE_TURNS`] ходов — иначе он «срабатывает» вечно.
    pub(crate) fn age_due_timers(&mut self) {
        let today = self.scene.day;
        let mut closed = Vec::new();
        for n in &mut self.notes {
            if n.done || !n.due_day.is_some_and(|d| d <= today) {
                continue;
            }
            n.due_turns += 1;
            if n.due_turns >= TIMER_AUTO_DONE_TURNS {
                n.done = true;
                closed.push(format!("«{}» [запись {}]", n.title, n.id));
            }
        }
        if !closed.is_empty() {
            self.log(format!(
                "База знаний: сработавшие таймеры закрыты движком (мастер не отметил) — {}",
                closed.join(", ")
            ));
        }
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

    /// Хроника по дням: пересказы дней по порядку.
    pub fn chronicle(&self) -> Vec<&MasterNote> {
        let mut days: Vec<&MasterNote> =
            self.notes.iter().filter(|n| n.kind == NoteKind::Day).collect();
        days.sort_by_key(|n| n.day);
        days
    }

    /// Записать или обновить пересказ дня в хронике (слой игрока: его видно и можно править).
    pub fn write_chronicle(&mut self, day: u32, text: &str) -> Result<u64, EngineError> {
        let result = (|| {
            let text = text.trim();
            if text.is_empty() {
                return Err(EngineError::EmptyNote);
            }
            if day == 0 || day > self.scene.day {
                return Err(EngineError::ChronicleDay { day, today: self.scene.day });
            }
            if day == self.scene.day {
                self.turns_since_chronicle = 0;
            }
            if let Some(note) =
                self.notes.iter_mut().find(|n| n.kind == NoteKind::Day && n.day == day)
            {
                note.text = text.to_string();
                return Ok((note.id, false));
            }
            let id = self.next_note_id;
            self.next_note_id += 1;
            self.notes.push(MasterNote {
                id,
                layer: NoteLayer::Player,
                day,
                time: None,
                title: format!("День {day}"),
                text: text.to_string(),
                card: None,
                by_player: false,
                kind: NoteKind::Day,
                due_day: None,
                done: false,
                due_turns: 0,
            });
            Ok((id, true))
        })();
        self.logged(
            result,
            |(id, new)| {
                let what = if *new { "записан" } else { "обновлён" };
                format!("Хроника: пересказ Дня {day} {what} [запись {id}]")
            },
            || "хроника".into(),
        )
        .map(|(id, _)| id)
    }

    /// Прошедшие дни этой игры без пересказа в хронике (не больше трёх последних).
    pub fn chronicle_missing(&self) -> Vec<u32> {
        let mut missing: Vec<u32> = (self.chronicle_from..self.scene.day)
            .filter(|d| !self.notes.iter().any(|n| n.kind == NoteKind::Day && n.day == *d))
            .collect();
        let excess = missing.len().saturating_sub(3);
        missing.drain(..excess);
        missing
    }

    /// Ходов мастера подряд без обновления пересказа текущего дня.
    pub fn turns_since_chronicle(&self) -> u32 {
        self.turns_since_chronicle
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

/// Текст для сравнения: без регистра, «ё» и лишних пробелов.
fn fold(text: &str) -> String {
    text.to_lowercase().replace('ё', "е").split_whitespace().collect::<Vec<_>>().join(" ")
}

/// Применяет изменение к цели.
fn apply_goal(goal: &mut Goal, edit: &GoalEdit, day: u32) -> Result<(), EngineError> {
    if let Some(g) = &edit.giver {
        goal.giver = g.trim().into();
    }
    if let Some(r) = &edit.reward {
        goal.reward = r.trim().into();
    }
    if let Some(d) = edit.due_day {
        goal.due_day = (d > 0).then_some(d);
    }
    if let Some(steps) = &edit.steps {
        goal.steps = steps
            .iter()
            .map(|t| t.trim())
            .filter(|t| !t.is_empty())
            .map(|t| {
                let done = goal.steps.iter().any(|s| s.done && fold(&s.text) == fold(t));
                GoalStep { text: t.into(), done }
            })
            .collect();
    }
    if let Some(step) = edit.add_step.as_deref().map(str::trim).filter(|t| !t.is_empty()) {
        if !goal.steps.iter().any(|s| fold(&s.text) == fold(step)) {
            goal.steps.push(GoalStep { text: step.into(), done: false });
        }
    }
    for (number, done) in [(edit.step_done, true), (edit.step_undone, false)] {
        if let Some(n) = number {
            let count = goal.steps.len();
            let step = n
                .checked_sub(1)
                .and_then(|i| goal.steps.get_mut(i))
                .ok_or(EngineError::GoalStep { step: n, count })?;
            step.done = done;
        }
    }
    if let Some(line) = edit.log.as_deref().map(str::trim).filter(|t| !t.is_empty()) {
        if goal.log.last().is_none_or(|l| fold(&l.text) != fold(line)) {
            goal.log.push(GoalLog { day, text: line.into() });
        }
    }
    Ok(())
}

/// Пометка в журнале движка: запись сохранена без привязки к несуществующей карточке.
fn unlinked_note(card: Option<&str>) -> String {
    card.map_or_else(String::new, |c| {
        format!(
            " — без привязки: карточки «{c}» нет (бери id из «карточки_базы» или создай карточку new_card)"
        )
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::rng::Xoshiro256;

    #[test]
    fn note_with_unknown_card_is_saved_without_link() {
        let mut s = session();
        let id = s
            .create_note(NewNote {
                card: Some("event.payroll_lead".into()),
                ..NewNote::new(NoteLayer::Master, "След жалованья", "Казначей платит наёмникам")
            })
            .expect("запись сохраняется");
        let note = s.notes().iter().find(|n| n.id == id).expect("запись есть");
        assert_eq!(note.card, None);
        assert!(s.engine_log().last().is_some_and(|l| l.contains("без привязки")));
        let edited = s
            .update_note(
                id,
                NoteEdit {
                    card: Some("нет.такой".into()),
                    text: Some("Новый текст".into()),
                    ..NoteEdit::default()
                },
            )
            .expect("правка проходит");
        assert_eq!(edited.text, "Новый текст");
        assert_eq!(edited.card, None);
    }

    #[test]
    fn goals_keep_steps_and_progress() {
        let mut s = session();
        let id = s
            .create_card(
                CardDraft {
                    layer: Some("player".into()),
                    section: Some("goals".into()),
                    title: Some("Найти курьера".into()),
                    goal: Some(GoalEdit {
                        giver: Some("Сержант Хольм".into()),
                        reward: Some("50 зм".into()),
                        steps: Some(vec!["Расспросить в доках".into(), "Найти след".into()]),
                        ..GoalEdit::default()
                    }),
                    ..CardDraft::default()
                },
                false,
            )
            .unwrap();
        assert_eq!(s.active_goals().len(), 1);
        assert_eq!(s.custom_cards()[0].status.as_deref(), Some("active"));
        s.update_goal(
            &id,
            GoalEdit {
                step_done: Some(1),
                log: Some("Докеры видели его".into()),
                ..GoalEdit::default()
            },
        )
        .unwrap();
        s.update_goal(
            &id,
            GoalEdit {
                log: Some("След ведёт на склад".into()), ..GoalEdit::default()
            },
        )
        .unwrap();
        let goal = s.custom_cards()[0].goal.clone().unwrap();
        assert!(goal.steps[0].done && !goal.steps[1].done);
        assert_eq!(goal.log.len(), 2);
        assert!(s
            .update_goal(&id, GoalEdit { step_done: Some(5), ..GoalEdit::default() })
            .is_err());
        s.update_goal(&id, GoalEdit { status: Some("done".into()), ..GoalEdit::default() })
            .unwrap();
        assert!(s.active_goals().is_empty());
    }

    #[test]
    fn master_note_repeat_updates_and_timer_closes_itself() {
        let mut s = session();
        let a = s.add_note(NoteLayer::Master, "Слух о складе", "Крот знает о складе").unwrap();
        let b = s.add_note(NoteLayer::Master, "слух о складе", "Крот продал сведения").unwrap();
        assert_eq!(a, b);
        assert_eq!(s.notes().iter().filter(|n| n.id == a).count(), 1);
        assert_eq!(s.notes().iter().find(|n| n.id == a).unwrap().text, "Крот продал сведения");
        let today = s.scene().day;
        let timer = s
            .create_note(NewNote {
                kind: NoteKind::Timer,
                due_day: Some(today),
                ..NewNote::new(NoteLayer::Master, "Гонец", "Прибывает гонец")
            })
            .unwrap();
        for _ in 0..TIMER_AUTO_DONE_TURNS {
            assert!(!s.notes().iter().find(|n| n.id == timer).unwrap().done);
            s.age_due_timers();
        }
        assert!(s.notes().iter().find(|n| n.id == timer).unwrap().done);
        assert!(s.due_notes().is_empty());
    }

    fn session() -> Session {
        let mut s = Session::demo(Xoshiro256::from_seed(1));
        s.set_kb_cards(vec![
            KbCard {
                id: "goal.astrolabe".into(),
                title: "Получить Княжескую Астролябию".into(),
                layer: "player".into(),
                status: Some("progress".into()),
                summary: String::new(),
                text: String::new(),
            },
            KbCard {
                id: "npc.orelie".into(),
                title: "Мадам Орели".into(),
                layer: "world".into(),
                status: Some("watch".into()),
                summary: String::new(),
                text: String::new(),
            },
        ]);
        s
    }

    #[test]
    fn start_prep_is_checked_only_in_own_campaign() {
        use crate::creation::tests::wizard_spec;
        use crate::creation::Campaign;
        assert!(session().start_prep_missing().is_empty(), "Дом Стрэндж — без подготовки");
        let campaign =
            Campaign {
                id: "camp.t".into(), title: "Проба".into(), heroes: vec![wizard_spec()]
            };
        let scene = crate::session::Scene {
            day: 20,
            time: None,
            location: "Нойштадт".into(),
            situation: String::new(),
            mood: crate::session::Mood::Calm,
        };
        let mut s = Session::new_campaign(Xoshiro256::from_seed(2), campaign, scene, 10).unwrap();
        assert_eq!(s.start_prep_missing().len(), 4);
        s.create_note(NewNote::new(
            NoteLayer::Player,
            "Предыстория героя",
            "Бывший писарь гарнизона.",
        ))
        .unwrap();
        for title in ["Найти брата", "Вернуть долг"] {
            s.create_card(
                CardDraft {
                    layer: Some("player".into()),
                    section: Some("goals".into()),
                    title: Some(title.into()),
                    ..CardDraft::default()
                },
                false,
            )
            .unwrap();
        }
        let mut secret =
            NewNote::new(NoteLayer::Master, "Тайна героя", "Брат жив и служит культу.");
        secret.kind = NoteKind::Secret;
        s.create_note(secret).unwrap();
        assert_eq!(s.start_prep_missing().len(), 1, "остался таймер");
        let mut timer = NewNote::new(NoteLayer::Master, "Культ уходит", "Культ покидает город.");
        timer.kind = NoteKind::Timer;
        timer.due_day = Some(23);
        s.create_note(timer).unwrap();
        assert!(s.start_prep_missing().is_empty());
        // Листы Стрэнджей видны в своей кампании, но в отряд не входят и не меняются.
        assert_eq!(s.sheet("pc.nikis").unwrap().name, "Сэр Никис Стрэндж");
        assert!(s.details("pc.nikis").is_ok());
        assert!(s.character("pc.nikis").is_err());
        assert!(session().world_character("pc.nikis").is_none(), "в Доме Стрэндж — обычный отряд");
    }

    #[test]
    fn builtin_card_edit_becomes_linked_addition() {
        let mut s = session();
        s.update_card(
            "npc.orelie",
            CardDraft {
                text: Some("Должна ростовщику сорок золотых".into()),
                status: Some("ally".into()),
                ..CardDraft::default()
            },
        )
        .unwrap();
        let note = s.notes().iter().find(|n| n.card.as_deref() == Some("npc.orelie")).unwrap();
        assert_eq!(note.title, "Дополнение: Мадам Орели");
        assert_eq!(note.layer, NoteLayer::Player);
        assert_eq!(s.kb_overrides()[0].status, "ally");
        // Пустое дополнение без статуса — ошибка, а не тихий пропуск.
        assert!(s.update_card("npc.orelie", CardDraft::default()).is_err());
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
        // Неизвестная карточка не отменяет запись — она сохраняется без привязки.
        let loose = s.add_note_full(NoteLayer::Player, "x", "", Some("npc.nobody"), false).unwrap();
        assert_eq!(s.notes().iter().find(|n| n.id == loose).and_then(|n| n.card.as_deref()), None);
        s.delete_note(loose).unwrap();
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
        // Неизвестный раздел: карточка мастера не теряется, а ложится в запасной раздел;
        // игроку интерфейс такого не даёт — для него это ошибка.
        let stray = CardDraft {
            title: Some("x".into()),
            section: Some("tavern".into()),
            ..CardDraft::default()
        };
        assert!(s.create_card(stray.clone(), true).is_err());
        let stray_id = s.create_card(stray, false).unwrap();
        assert_eq!(s.custom_cards()[1].section, "journal");
        s.delete_card(&stray_id).unwrap();
        // Повтор карточки мастером обновляет прежнюю, а не плодит копию.
        let again = s
            .create_card(
                CardDraft {
                    layer: Some("master".into()),
                    section: Some("prisoners".into()),
                    title: Some("соглядатай в серо-бурой робе".into()),
                    summary: Some("Заговорил на допросе".into()),
                    ..CardDraft::default()
                },
                false,
            )
            .unwrap();
        assert_eq!(again, id);
        assert_eq!(s.custom_cards().len(), 1);
        assert_eq!(s.custom_cards()[0].summary, "Заговорил на допросе");
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
