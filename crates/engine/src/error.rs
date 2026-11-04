//! Ошибки движка. Тексты на русском — они показываются игроку и передаются ИИ-мастеру
//! как причина отказа.

use std::fmt;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum EngineError {
    /// Пустая строка вместо выражения броска.
    EmptyExpression,
    /// Выражение броска не удалось разобрать.
    InvalidExpression(String),
    /// Количество кубов в одной группе вне допустимого диапазона.
    InvalidDiceCount(u32),
    /// Куб с недопустимым числом граней.
    InvalidDieSides(u32),
    /// Значение куба, заявленное игроком, вне диапазона граней.
    DieValueOutOfRange { value: u32, sides: u32 },
    /// Порог критического попадания вне диапазона 2–20.
    InvalidCritThreshold(u32),
    /// В заявке игрока нет значения куба.
    PlayerRollMissingValue(String),
    /// В заявке игрока несколько чисел, и неясно, какое из них — значение куба.
    PlayerRollAmbiguous(String),
    /// Попытка потратить ресурс сверх доступного.
    ResourceDepleted { name: String, requested: u32, current: u32, max: u32 },
    /// Текущее значение ресурса больше максимума.
    ResourceOverMax { name: String, current: u32, max: u32 },
    /// Попытка потратить или восстановить ноль единиц ресурса.
    ZeroAmount,
    /// У персонажа нет ресурса с таким ID.
    ResourceNotFound(String),
}

impl fmt::Display for EngineError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::EmptyExpression => write!(f, "Пустое выражение броска"),
            Self::InvalidExpression(s) => write!(f, "Неверное выражение броска «{s}»"),
            Self::InvalidDiceCount(n) => {
                write!(f, "Недопустимое количество кубов: {n} (допустимо от 1 до 100)")
            }
            Self::InvalidDieSides(n) => write!(
                f,
                "Недопустимый куб d{n} (допустимы d2, d3, d4, d6, d8, d10, d12, d20, d100)"
            ),
            Self::DieValueOutOfRange { value, sides } => {
                write!(f, "Значение {value} вне диапазона куба d{sides} (1–{sides})")
            }
            Self::InvalidCritThreshold(n) => {
                write!(f, "Недопустимый порог критического попадания: {n} (допустимо 2–20)")
            }
            Self::PlayerRollMissingValue(s) => {
                write!(f, "В заявке «{s}» нет значения на кубе")
            }
            Self::PlayerRollAmbiguous(s) => {
                write!(f, "В заявке «{s}» несколько чисел — укажите только значение на кубе")
            }
            Self::ResourceDepleted { name, requested, current, max } => write!(
                f,
                "Недостаточно зарядов «{name}»: нужно {requested}, доступно {current}/{max}"
            ),
            Self::ResourceOverMax { name, current, max } => {
                write!(f, "Значение ресурса «{name}» ({current}) больше максимума ({max})")
            }
            Self::ZeroAmount => write!(f, "Количество должно быть больше нуля"),
            Self::ResourceNotFound(id) => write!(f, "У персонажа нет ресурса «{id}»"),
        }
    }
}

impl std::error::Error for EngineError {}
