//! Поручения спутников (пак 0.10.2): зачем член отряда ушёл из сцены.
//!
//! Приказ спутнику жил только в истории чата и терялся, когда история уходила за окно
//! (тест 22.11.2026: Гюнтер ушёл в ратушу за капитаном стражи, а мастер через час игры
//! «не помнил» задачи). Теперь поручение хранит движок: оно в сохранении, мастер видит его
//! каждый ход, игрок — в окне «Отряд».

use crate::character::CharacterKind;
use crate::combat::time_jump;
use crate::error::EngineError;
use crate::session::Session;

/// Поручение члена отряда.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq, Default)]
pub struct CompanionTask {
    /// id члена отряда.
    pub character: String,
    /// Что ему поручено.
    pub text: String,
    /// Когда поручено: день и время сцены.
    pub day: u32,
    #[cfg_attr(feature = "serde", serde(default))]
    pub time: Option<String>,
}

impl CompanionTask {
    /// «с 18:14, День 98».
    pub fn since(&self) -> String {
        match self.time.as_deref().map(str::trim).filter(|t| !t.is_empty()) {
            Some(time) => format!("с {time}, День {}", self.day),
            None => format!("с Дня {}", self.day),
        }
    }
}

impl Session {
    /// Поручения членов отряда.
    pub fn tasks(&self) -> &[CompanionTask] {
        &self.tasks
    }

    /// Поручение члена отряда.
    pub fn task_of(&self, id: &str) -> Option<&CompanionTask> {
        self.tasks.iter().find(|t| t.character == id)
    }

    /// Даёт члену отряда поручение (прежнее заменяется).
    pub fn set_task(&mut self, id: &str, text: &str) -> Result<String, EngineError> {
        let result = (|| {
            let c = self.character(id)?;
            if c.kind == CharacterKind::Player {
                return Err(EngineError::Combat(
                    "поручение даётся спутнику, а не герою игрока".into(),
                ));
            }
            let name = c.name.clone();
            let text = text.trim().to_string();
            self.tasks.retain(|t| t.character != id);
            self.tasks.push(CompanionTask {
                character: id.to_string(),
                text: text.clone(),
                day: self.scene.day,
                time: self.scene.time.clone(),
            });
            Ok(format!("Поручение: {name} — {text}"))
        })();
        self.logged(result, Clone::clone, || "поручение спутника".into())
    }

    /// Снимает поручение: выполнено, отменено или спутник вернулся. `None` — поручения не было.
    pub fn clear_task(&mut self, id: &str, why: &str) -> Option<String> {
        let i = self.tasks.iter().position(|t| t.character == id)?;
        let task = self.tasks.remove(i);
        let name = self.character(id).map_or_else(|_| id.to_string(), |c| c.name.clone());
        let line = format!("Поручение снято ({why}): {name} — {}", task.text);
        self.log(line.clone());
        Some(line)
    }

    /// Спутник пришёл туда, где герой, — поручение закрывается само.
    pub(crate) fn close_task_if_back(&mut self, id: &str) {
        let hero_here =
            self.party.iter().find(|c| c.kind == CharacterKind::Player).map(|h| h.location.clone());
        let back = self
            .party
            .iter()
            .find(|c| c.id == id)
            .zip(hero_here)
            .is_some_and(|(c, here)| c.location == here);
        if back {
            self.clear_task(id, "вернулся к герою");
        }
    }

    /// Строки поручений для мастера: «Гюнтер (ратуша) — найти капитана… (с 18:14, День 98)».
    pub fn task_lines(&self) -> Vec<String> {
        self.tasks
            .iter()
            .map(|t| {
                let (name, place) = self
                    .party
                    .iter()
                    .find(|c| c.id == t.character)
                    .map_or((t.character.clone(), String::new()), |c| {
                        (c.name.clone(), c.location.clone())
                    });
                let place = if place.is_empty() { String::new() } else { format!(" ({place})") };
                format!("{name}{place} — {} ({})", t.text, t.since())
            })
            .collect()
    }

    /// Поручения, с которых время сцены ушло вперёд больше чем на час (или наступил новый день):
    /// мастеру пора решить, чем они кончились.
    pub fn stale_tasks(&self) -> Vec<&CompanionTask> {
        self.tasks
            .iter()
            .filter(|t| {
                self.scene.day > t.day || time_jump(t.time.as_deref(), self.scene.time.as_deref())
            })
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use crate::rng::Xoshiro256;
    use crate::session::Session;

    fn session() -> Session {
        Session::demo(Xoshiro256::from_seed(11))
    }

    fn companion(s: &Session) -> String {
        s.party()
            .iter()
            .find(|c| c.kind == crate::character::CharacterKind::Companion)
            .unwrap()
            .id
            .clone()
    }

    #[test]
    fn task_is_kept_shown_and_closed_on_return() {
        let mut s = session();
        let id = companion(&s);
        s.move_character(&id, "ратуша Вейденбурга").unwrap();
        s.set_task(&id, "найти капитана стражи").unwrap();
        assert!(s.task_lines()[0].contains("ратуша Вейденбурга"));
        assert!(s.task_lines()[0].contains("найти капитана стражи"));
        assert!(s
            .party_view()
            .members
            .iter()
            .any(|m| m.task.as_deref() == Some("найти капитана стражи")));
        assert!(s.stale_tasks().is_empty());
        let here = s.scene().location.clone();
        s.move_character(&id, &here).unwrap();
        assert!(s.tasks().is_empty());
    }

    #[test]
    fn hero_gets_no_task() {
        let mut s = session();
        let hero = s
            .party()
            .iter()
            .find(|c| c.kind == crate::character::CharacterKind::Player)
            .unwrap()
            .id
            .clone();
        assert!(s.set_task(&hero, "что-то").is_err());
    }
}
