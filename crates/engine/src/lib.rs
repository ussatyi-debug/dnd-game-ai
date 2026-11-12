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
//! - [`knowledge`] — записи мастера и игрока, статусы карточек базы знаний;
//! - [`fixtures`] — демо-персонаж до появления импорта кампании;
//! - [`treasury`] — казна отряда с журналом операций;
//! - [`creation`] — герои из мастера создания и новые кампании;
//! - [`session`] — сессия, общая для приложения и веб-версии.

pub mod character;
pub mod check;
pub mod creation;
pub mod error;
pub mod experience;
pub mod expr;
pub mod fixtures;
pub mod inventory;
pub mod knowledge;
pub mod master_ops;
pub mod notation;
pub mod profile;
pub mod recruit;
pub mod resource;
pub mod rng;
pub mod savegame;
pub mod session;
pub mod sheet_edits;
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
pub use creation::{
    build_hero, build_party, level_for_xp, starting_treasury, validate_hero, Campaign, HeroSpec,
    SpecClass, SpecHp, SpecItem, SpecResource, MAX_HERO_LEVEL, XP_THRESHOLDS,
};
pub use error::EngineError;
pub use expr::{DiceExpr, DiceGroupRoll, ExprRoll, Term};
pub use inventory::{
    Container, ContainerView, Inventory, InventoryView, Item, ItemGroup, ItemLine, NewItem,
    ON_PERSON,
};
pub use knowledge::{
    CardDraft, CardFact, CustomCard, Goal, GoalEdit, GoalLog, GoalStep, KbCard, KbOverride,
    MasterNote, NewNote, NoteEdit, NoteKind, NoteLayer, KB_SECTIONS, KB_STATUSES,
    NOTE_REMINDER_TURNS, TIMER_AUTO_DONE_TURNS,
};
pub use experience::{XpAward, XpMember, XpNote, XpStatus};
pub use master_ops::{Checkpoint, HpChange, SceneChange, UndoInfo};
pub use notation::{parse_player_roll, resolve_player_d20, PlayerRollInput};
pub use profile::{
    Attack, AttackLine, Attunement, Bonus, Feature, HitDice, Proficiency, ProficiencyLine, Profile,
    SaveLine, SheetDetails, Skill, SkillEntry, SkillLine, CONDITIONS,
};
pub use recruit::{RecruitInfo, RecruitRequest, MAX_COMPANIONS, RECRUIT_FROM_LEVEL};
pub use resource::{Recovery, ResourcePool, RestKind};
pub use rng::{DiceRng, Xoshiro256};
pub use savegame::{LoadReport, SaveData, SavedCharacter};
pub use session::{
    LuckyReroll, MasterMemo, Mood, PartyMember, PartyView, RestResult, RestedCharacter, SaveState,
    Scene, Session, ENGINE_LOG_LIMIT, LUCKY_ID, MIN_SAVE_FORMAT, SAVE_FORMAT_VERSION,
};
pub use sheet_edits::{SheetEdit, SheetProposal};
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
