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
    /// В отряде нет персонажа с таким ID.
    CharacterNotFound(String),
    /// В казне нет ценности с таким ID.
    UnknownAsset(String),
    /// В казне нет места хранения с таким ID.
    UnknownLocation(String),
    /// Недопустимое количество в операции казны.
    InvalidQuantity(i64),
    /// Расход больше остатка.
    InsufficientFunds { asset: String, location: String, held: i64, requested: i64 },
    /// Неизвестное состояние.
    UnknownCondition(String),
    /// Нет такого места хранения в инвентаре.
    UnknownContainer(String),
    /// Нет такого предмета.
    UnknownItem(String),
    /// Под название подходит несколько предметов.
    AmbiguousItem { query: String, options: Vec<String> },
    /// Предметов меньше, чем требуется.
    NotEnoughItems { item: String, held: u32, requested: u32 },
    /// Предмет уже лежит в этом месте.
    SameContainer,
    /// День сцены нельзя вернуть назад.
    DayInPast { current: u32, requested: u32 },
    /// Пустая запись в базу знаний.
    EmptyNote,
    /// Нет записи базы знаний с таким номером.
    UnknownNote(u64),
    /// Нет карточки базы знаний.
    UnknownCard(String),
    /// Неизвестный статус карточки.
    UnknownStatus(String),
    /// Статус карточки и так из базы.
    NoCardOverride(String),
    /// Сохранение не подходит.
    InvalidSave(String),
    /// Ценность с таким ID уже есть.
    DuplicateAsset(String),
    /// После хода мастера состояние менялось — отмена вернула бы и чужие изменения.
    UndoStale,
    /// Нечего отменять: мастер ещё ничего не менял.
    NothingToUndo,
    /// В каталоге нет заклинания с таким ID.
    UnknownSpell(String),
    /// Персонаж не владеет магией.
    NotASpellcaster(String),
    /// Заклинание не известно, не подготовлено и не дано чертой или предметом.
    SpellNotAvailable { character: String, spell: String },
    /// Способ «заговор» для заклинания с кругом.
    NotACantrip(String),
    /// Заговоры не тратят ячеек.
    CantripNoSlot(String),
    /// Ячейка ниже круга заклинания.
    SlotTooLow { spell: String, spell_level: u8, slot_level: u8 },
    /// Круг ячейки вне 1–9.
    InvalidSlotLevel(u8),
    /// Нет свободной ячейки нужного круга (`exact`) или нужного круга и выше.
    NoSlotAvailable { level: u8, exact: bool },
    /// У персонажа нет магии договора.
    NoPactMagic(String),
    /// Ячейки договора бывают только одного круга.
    PactSlotLevel { pact_level: u8, requested: u8 },
    /// Заклинание не ритуальное.
    NotARitual(String),
    /// Персонаж не может провести это заклинание как ритуал.
    RitualNotAllowed { character: String, spell: String },
    /// Заклинание не дано персонажу чертой или предметом.
    NotGranted { character: String, spell: String },
    /// Нет свитка с этим заклинанием.
    NoScroll(String),
    /// Заклинания свитка нет в списках классов персонажа.
    ScrollNotOnList { character: String, spell: String },
    /// У персонажа нет такого класса-заклинателя.
    CasterNotFound(String),
    /// Класс знает заклинания, а не подготавливает их.
    NotPreparedCaster(String),
    /// Подготовка возможна только после длительного отдыха.
    PreparationClosed,
    /// Заговоры не подготавливают.
    CantripNotPrepared(String),
    /// Круг заклинания выше доступного классу.
    SpellLevelTooHigh { spell: String, level: u8, max: u8 },
    /// Заклинания нет в списке класса (или в книге волшебника).
    NotOnClassList { spell: String, list: String },
    /// Подготовлено больше лимита.
    PreparedLimit { limit: u32, requested: u32 },
    /// Все ячейки этого круга и так свободны.
    SlotFull(String),
    /// Предмет восстанавливает только ячейки договора.
    RestorerPactOnly(String),
    /// Предмет не восстанавливает ячейки такого круга.
    RestorerLevel { item: String, max: u8, requested: u8 },
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
            Self::CharacterNotFound(id) => write!(f, "В отряде нет персонажа «{id}»"),
            Self::UnknownAsset(id) => write!(f, "В казне нет ценности «{id}»"),
            Self::UnknownLocation(id) => write!(f, "В казне нет места хранения «{id}»"),
            Self::InvalidQuantity(n) => write!(f, "Недопустимое количество: {n}"),
            Self::InsufficientFunds { asset, location, held, requested } => write!(
                f,
                "Недостаточно «{asset}» в месте «{location}»: есть {held}, нужно {requested}"
            ),
            Self::UnknownSpell(id) => write!(f, "Неизвестное заклинание «{id}»"),
            Self::NotASpellcaster(name) => write!(f, "{name} не владеет магией"),
            Self::SpellNotAvailable { character, spell } => write!(
                f,
                "«{spell}» не известно и не подготовлено у персонажа {character}, и его не даёт ни черта, ни предмет, ни свиток"
            ),
            Self::NotACantrip(spell) => write!(f, "«{spell}» — не заговор, нужна ячейка"),
            Self::CantripNoSlot(spell) => write!(f, "«{spell}» — заговор, ячейка не нужна"),
            Self::SlotTooLow { spell, spell_level, slot_level } => write!(
                f,
                "«{spell}» — заклинание {spell_level} круга, ячейкой {slot_level} круга его не сотворить"
            ),
            Self::InvalidSlotLevel(l) => write!(f, "Недопустимый круг ячейки: {l} (допустимо 1–9)"),
            Self::NoSlotAvailable { level, exact: true } => {
                write!(f, "Нет свободных ячеек {level} круга")
            }
            Self::NoSlotAvailable { level, exact: false } => {
                write!(f, "Нет свободных ячеек {level} круга и выше")
            }
            Self::UnknownCondition(name) => write!(f, "Неизвестное состояние «{name}»"),
            Self::UnknownContainer(name) => write!(f, "Нет места хранения «{name}»"),
            Self::UnknownItem(name) => write!(f, "Нет предмета «{name}»"),
            Self::AmbiguousItem { query, options } => write!(
                f,
                "«{query}» подходит к нескольким предметам: {} — уточните название",
                options.join(", ")
            ),
            Self::NotEnoughItems { item, held, requested } => {
                write!(f, "«{item}»: есть {held} шт., а нужно {requested}")
            }
            Self::SameContainer => write!(f, "Предмет уже лежит в этом месте"),
            Self::DayInPast { current, requested } => write!(
                f,
                "Сейчас День {current} — вернуться в День {requested} нельзя"
            ),
            Self::EmptyNote => write!(f, "Пустая запись: нужен заголовок или текст"),
            Self::UnknownNote(id) => write!(f, "Нет записи базы знаний № {id}"),
            Self::UnknownCard(card) => write!(f, "В базе знаний нет карточки «{card}»"),
            Self::UnknownStatus(s) => write!(
                f,
                "Неизвестный статус «{s}»: active, ally, vassal, neutral, watch, enemy, prisoner, dead, open, progress, done, failed, planned"
            ),
            Self::NoCardOverride(title) => {
                write!(f, "У карточки «{title}» и так статус из базы знаний")
            }
            Self::InvalidSave(reason) => write!(f, "Сохранение не загружено: {reason}"),
            Self::DuplicateAsset(id) => write!(f, "Ценность «{id}» уже есть в казне"),
            Self::UndoStale => write!(
                f,
                "После хода мастера состояние уже менялось — отменить его действия нельзя"
            ),
            Self::NothingToUndo => write!(f, "Нечего отменять: мастер ничего не менял"),
            Self::NoPactMagic(name) => write!(f, "У персонажа {name} нет ячеек договора"),
            Self::PactSlotLevel { pact_level, requested } => write!(
                f,
                "Ячейки договора всегда {pact_level} круга — ячейку {requested} круга ими не взять"
            ),
            Self::NotARitual(spell) => write!(f, "«{spell}» нельзя провести как ритуал"),
            Self::RitualNotAllowed { character, spell } => write!(
                f,
                "{character} не может провести «{spell}» ритуалом: нужен класс с ритуальным колдовством и подготовленное (или записанное в книгу) заклинание"
            ),
            Self::NotGranted { character, spell } => {
                write!(f, "«{spell}» не дано персонажу {character} чертой или предметом")
            }
            Self::NoScroll(spell) => write!(f, "Нет свитка «{spell}»"),
            Self::ScrollNotOnList { character, spell } => write!(
                f,
                "{character} не может прочесть свиток «{spell}»: заклинания нет в списках его классов"
            ),
            Self::CasterNotFound(id) => write!(f, "У персонажа нет класса-заклинателя «{id}»"),
            Self::NotPreparedCaster(label) => {
                write!(f, "{label}: заклинания известны, а не подготавливаются")
            }
            Self::PreparationClosed => write!(
                f,
                "Подготовить заклинания можно только после длительного отдыха, до первого сотворённого заклинания"
            ),
            Self::CantripNotPrepared(spell) => {
                write!(f, "«{spell}» — заговор, заговоры не подготавливают")
            }
            Self::SpellLevelTooHigh { spell, level, max } => write!(
                f,
                "«{spell}» — {level} круг, а доступно только до {max} круга"
            ),
            Self::NotOnClassList { spell, list } => write!(f, "«{spell}» нет в списке {list}"),
            Self::PreparedLimit { limit, requested } => write!(
                f,
                "Можно подготовить не больше {limit} заклинаний, выбрано {requested}"
            ),
            Self::SlotFull(name) => write!(f, "«{name}»: все ячейки и так свободны"),
            Self::RestorerPactOnly(item) => {
                write!(f, "{item} восстанавливает только ячейки договора")
            }
            Self::RestorerLevel { item, max, requested } => write!(
                f,
                "{item} восстанавливает ячейки не выше {max} круга, а нужна ячейка {requested} круга"
            ),
        }
    }
}

impl std::error::Error for EngineError {}
