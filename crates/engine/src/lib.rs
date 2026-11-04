//! Игровой движок D&D 5e.
//!
//! Принцип: **ИИ рассказывает, движок считает.** Все значения кубов, модификаторы,
//! расход ресурсов и проверки выполняет этот крейт; ИИ-мастер только запрашивает
//! действия и описывает результат.
//!
//! Модули:
//! - [`rng`] — генератор случайных чисел для кубов;
//! - [`expr`] — выражения бросков (`2d6+3`, `8d6`, `1d8+5+2d8`), в т.ч. критический урон;
//! - [`check`] — броски d20 с преимуществом/помехой, модификаторами и критами;
//! - [`notation`] — разбор заявок игрока вида «16 - везунчик»;
//! - [`resource`] — пулы ресурсов (Везунчик, ячейки, Ци) и восстановление на отдыхе;
//! - [`character`] — персонаж: исходные данные и вычисляемые значения листа;
//! - [`spells`] — каталог заклинаний (метаданные для проверок);
//! - [`spellcasting`] — книга заклинаний персонажа: подготовка, ячейки, накладывание;
//! - [`profile`] — полный лист: спасброски, навыки, атаки, умения, владения;
//! - [`inventory`] — инвентарь по местам хранения;
//! - [`master_ops`] — действия ИИ-мастера над состоянием и отмена его хода;
//! - [`fixtures`] — демо-персонаж до появления импорта кампании;
//! - [`treasury`] — казна отряда с журналом операций;
//! - [`session`] — сессия, общая для приложения и веб-версии.

pub mod character;
pub mod check;
pub mod error;
pub mod expr;
pub mod fixtures;
pub mod inventory;
pub mod master_ops;
pub mod notation;
pub mod profile;
pub mod resource;
pub mod rng;
pub mod session;
mod sheets;
mod spell_catalog;
pub mod spellcasting;
pub mod spells;
pub mod treasury;

pub use character::{
    ability_modifier, proficiency_bonus, Ability, AbilityLine, AbilityScores, Character,
    CharacterKind, CharacterSheet, ClassLevel, HitPoints,
};
pub use check::{player_d20, roll_d20, AttackResult, D20Roll, Modifier, RollMode, RollSource};
pub use error::EngineError;
pub use expr::{DiceExpr, DiceGroupRoll, ExprRoll, Term};
pub use inventory::{
    Container, ContainerView, Inventory, InventoryView, Item, ItemGroup, ItemLine, NewItem,
    ON_PERSON,
};
pub use master_ops::{Checkpoint, HpChange, MasterNote, NoteLayer, SceneChange, UndoInfo};
pub use notation::{parse_player_roll, resolve_player_d20, PlayerRollInput};
pub use profile::{
    Attack, AttackLine, Attunement, Bonus, Feature, HitDice, Proficiency, ProficiencyLine, Profile,
    SaveLine, SheetDetails, Skill, SkillEntry, SkillLine, CONDITIONS,
};
pub use resource::{Recovery, ResourcePool, RestKind};
pub use rng::{DiceRng, Xoshiro256};
pub use session::{
    LuckyReroll, PartyMember, PartyView, RestResult, RestedCharacter, SaveState, Scene, Session,
    ENGINE_LOG_LIMIT, LUCKY_ID, SAVE_FORMAT_VERSION,
};
pub use spellcasting::{
    slot_id, CastMethod, CastOutcome, CastRequest, Caster, CasterView, GrantedSpell, GrantedView,
    Preparation, Progression, RestorerView, ScrollStack, ScrollView, SlotRef, SlotRestoreOutcome,
    SlotRestorer, SlotView, SpellEntry, SpellbookView, Spellcasting, PACT_SLOTS_ID,
};
pub use spells::{all_spells, class_list, spell, SpellClass, SpellMeta};
pub use treasury::{
    gp, Asset, AssetKind, Copper, Entry, EntrySource, EntryView, Location, NewEntry, Treasury,
    TreasuryView,
};
