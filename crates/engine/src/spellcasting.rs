//! Колдовство персонажа: известные и подготовленные заклинания, ячейки, свитки,
//! заклинания от черт и предметов. Все проверки правил 5e (2014) выполняются здесь,
//! поэтому ни игрок, ни ИИ-мастер не могут сотворить то, чего у персонажа нет.
//!
//! Три способа владеть заклинаниями:
//! - [`Preparation::Known`] — список известных заклинаний (колдун, бард, чародей, следопыт);
//! - [`Preparation::Prepared`] — подготовка из всего списка класса после длительного отдыха
//!   (жрец, друид, паладин); заклинания домена или клятвы подготовлены всегда;
//! - [`Preparation::Spellbook`] — подготовка из собственной книги (волшебник).
//!
//! Ячейки — обычные пулы ресурсов персонажа: `slots.N` (длительный отдых) и `pact.slots`
//! (ячейки договора колдуна, короткий отдых).

use crate::character::{Ability, Character};
use crate::error::EngineError;
use crate::resource::{Recovery, ResourcePool};
use crate::spells::{class_list, spell, SpellClass, SpellMeta};

/// ID пула ячеек договора колдуна.
pub const PACT_SLOTS_ID: &str = "pact.slots";

/// ID пула обычных ячеек круга `level`.
pub fn slot_id(level: u8) -> String {
    format!("slots.{level}")
}

/// Таблица ячеек заклинателя по уровню заклинателя (1–20), круги 1–9.
const SLOT_TABLE: [[u32; 9]; 20] = [
    [2, 0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0, 0],
    [4, 2, 0, 0, 0, 0, 0, 0, 0],
    [4, 3, 0, 0, 0, 0, 0, 0, 0],
    [4, 3, 2, 0, 0, 0, 0, 0, 0],
    [4, 3, 3, 0, 0, 0, 0, 0, 0],
    [4, 3, 3, 1, 0, 0, 0, 0, 0],
    [4, 3, 3, 2, 0, 0, 0, 0, 0],
    [4, 3, 3, 3, 1, 0, 0, 0, 0],
    [4, 3, 3, 3, 2, 0, 0, 0, 0],
    [4, 3, 3, 3, 2, 1, 0, 0, 0],
    [4, 3, 3, 3, 2, 1, 0, 0, 0],
    [4, 3, 3, 3, 2, 1, 1, 0, 0],
    [4, 3, 3, 3, 2, 1, 1, 0, 0],
    [4, 3, 3, 3, 2, 1, 1, 1, 0],
    [4, 3, 3, 3, 2, 1, 1, 1, 0],
    [4, 3, 3, 3, 2, 1, 1, 1, 1],
    [4, 3, 3, 3, 3, 1, 1, 1, 1],
    [4, 3, 3, 3, 3, 2, 1, 1, 1],
    [4, 3, 3, 3, 3, 2, 2, 1, 1],
];

/// Как класс получает ячейки.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "snake_case"))]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Progression {
    /// Полный заклинатель: жрец, друид, волшебник, бард, чародей.
    Full,
    /// Половинный: паладин, следопыт (правила 2014 года — ячейки со 2 уровня).
    Half,
    /// Половинный по правилам 2024 года: ячейки с 1 уровня, в мультиклассе уровни делятся
    /// пополам с округлением вверх.
    #[cfg_attr(feature = "serde", serde(rename = "half_2024"))]
    Half2024,
    /// Третичный: Мистический рыцарь, Мистический ловкач.
    Third,
    /// Магия договора колдуна: отдельные ячейки одного круга.
    Pact,
    /// Врождённая магия вида или таланта (наследие эльфа, «Посвящённый в магию»): своих
    /// ячеек нет, класс задаёт только список и заклинательную характеристику.
    Innate,
}

/// Как класс выбирает заклинания.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "snake_case"))]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Preparation {
    Known,
    Prepared,
    Spellbook,
}

/// Чем оплачено заклинание.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "snake_case"))]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CastMethod {
    /// Заговор, без ячейки.
    Cantrip,
    /// Обычная ячейка.
    Slot,
    /// Ячейка договора колдуна.
    Pact,
    /// Ритуал: без ячейки, на 10 минут дольше.
    Ritual,
    /// Заклинание от черты, воззвания или предмета.
    Granted,
    /// Свиток.
    Scroll,
}

/// Ячейка: обычная определённого круга или ячейка договора.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "snake_case"))]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SlotRef {
    Pact,
    Level(u8),
}

/// Класс-заклинатель персонажа.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Caster {
    /// ID внутри персонажа: `warlock`, `cleric`.
    pub id: String,
    /// «Колдун», «Жрица».
    pub label: String,
    pub class: SpellClass,
    pub ability: Ability,
    /// Уровень в этом классе.
    pub level: u32,
    pub progression: Progression,
    pub preparation: Preparation,
    pub cantrips: Vec<String>,
    pub max_cantrips: u32,
    /// Известные заклинания (`Known`) или книга заклинаний (`Spellbook`).
    pub known: Vec<String>,
    /// Лимит известных заклинаний (`Known`).
    pub max_known: Option<u32>,
    /// Лимит подготовки по таблице класса (правила 2024 года); `None` — по формуле 2014 года.
    #[cfg_attr(feature = "serde", serde(default))]
    pub max_prepared: Option<u32>,
    /// Подготовленные заклинания (`Prepared`, `Spellbook`), без всегда подготовленных.
    pub prepared: Vec<String>,
    /// Заклинания, подготовленные всегда (домен, клятва), и откуда они.
    pub always: Vec<String>,
    pub always_source: String,
    /// Расширенный список (покровитель колдуна): считается частью списка класса.
    pub expanded: Vec<String>,
    pub expanded_source: String,
    /// Бонус предметов к КС спасброска и к атакам заклинаниями.
    pub item_bonus: i32,
    pub item_bonus_source: String,
    /// Бонус предметов только к атакам заклинаниями (Палочка военного мага).
    #[cfg_attr(feature = "serde", serde(default))]
    pub attack_item_bonus: i32,
    #[cfg_attr(feature = "serde", serde(default))]
    pub attack_item_bonus_source: String,
    /// Бонус только к КС спасбросков.
    #[cfg_attr(feature = "serde", serde(default))]
    pub dc_item_bonus: i32,
    #[cfg_attr(feature = "serde", serde(default))]
    pub dc_item_bonus_source: String,
}

fn ids(list: &[&str]) -> Vec<String> {
    list.iter().map(|s| (*s).to_string()).collect()
}

impl Caster {
    pub fn new(
        id: &str,
        label: &str,
        class: SpellClass,
        ability: Ability,
        level: u32,
        progression: Progression,
        preparation: Preparation,
    ) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
            class,
            ability,
            level,
            progression,
            preparation,
            cantrips: Vec::new(),
            max_cantrips: 0,
            known: Vec::new(),
            max_known: None,
            max_prepared: None,
            prepared: Vec::new(),
            always: Vec::new(),
            always_source: String::new(),
            expanded: Vec::new(),
            expanded_source: String::new(),
            item_bonus: 0,
            item_bonus_source: String::new(),
            attack_item_bonus: 0,
            attack_item_bonus_source: String::new(),
            dc_item_bonus: 0,
            dc_item_bonus_source: String::new(),
        }
    }

    pub fn cantrips(mut self, max: u32, list: &[&str]) -> Self {
        self.max_cantrips = max;
        self.cantrips = ids(list);
        self
    }

    pub fn known(mut self, max: Option<u32>, list: &[&str]) -> Self {
        self.max_known = max;
        self.known = ids(list);
        self
    }

    /// Лимит подготовки по таблице класса (правила 2024 года).
    pub fn max_prepared(mut self, max: u32) -> Self {
        self.max_prepared = Some(max);
        self
    }

    pub fn prepared(mut self, list: &[&str]) -> Self {
        self.prepared = ids(list);
        self
    }

    pub fn always(mut self, source: &str, list: &[&str]) -> Self {
        self.always_source = source.into();
        self.always = ids(list);
        self
    }

    pub fn expanded(mut self, source: &str, list: &[&str]) -> Self {
        self.expanded_source = source.into();
        self.expanded = ids(list);
        self
    }

    pub fn item_bonus(mut self, bonus: i32, source: &str) -> Self {
        self.item_bonus = bonus;
        self.item_bonus_source = source.into();
        self
    }

    /// Бонус предмета только к броскам атаки заклинаниями (КС не меняется).
    pub fn attack_item_bonus(mut self, bonus: i32, source: &str) -> Self {
        self.attack_item_bonus = bonus;
        self.attack_item_bonus_source = source.into();
        self
    }

    /// Бонус только к КС спасбросков (атаки заклинаниями не меняются).
    pub fn dc_item_bonus(mut self, bonus: i32, source: &str) -> Self {
        self.dc_item_bonus = bonus;
        self.dc_item_bonus_source = source.into();
        self
    }

    /// Источники бонусов предметов для подписи в книге заклинаний.
    pub fn item_bonus_sources(&self) -> Option<String> {
        let mut parts = Vec::new();
        if self.item_bonus != 0 {
            parts.push(self.item_bonus_source.clone());
        }
        if self.attack_item_bonus != 0 {
            parts.push(format!("{} (только атаки)", self.attack_item_bonus_source));
        }
        if self.dc_item_bonus != 0 {
            parts.push(format!("{} (только КС)", self.dc_item_bonus_source));
        }
        (!parts.is_empty()).then(|| parts.join(", "))
    }

    /// Высший круг заклинаний, доступный этому классу.
    pub fn max_spell_level(&self) -> u8 {
        let l = self.level;
        let level = match self.progression {
            Progression::Full => l.div_ceil(2),
            Progression::Half if l >= 2 => l.div_ceil(4),
            Progression::Half2024 => l.div_ceil(4),
            Progression::Third if l >= 3 => match l {
                3..=6 => 1,
                7..=12 => 2,
                13..=18 => 3,
                _ => 4,
            },
            Progression::Pact => l.div_ceil(2),
            _ => 0,
        };
        let cap = match self.progression {
            Progression::Full => 9,
            Progression::Half | Progression::Half2024 | Progression::Pact => 5,
            Progression::Third => 4,
            Progression::Innate => 0,
        };
        level.min(cap) as u8
    }

    /// Лимит подготовки: модификатор + уровень (паладин — половина уровня), не меньше 1.
    pub fn prepared_limit(&self, ability_modifier: i32) -> Option<u32> {
        if let Some(max) = self.max_prepared {
            return (self.preparation != Preparation::Known).then_some(max);
        }
        let level = match (self.preparation, self.progression) {
            (Preparation::Known, _) => return None,
            (_, Progression::Half) => self.level / 2,
            (_, Progression::Third) => self.level / 3,
            _ => self.level,
        };
        Some((ability_modifier + level as i32).max(1) as u32)
    }

    /// Входит ли заклинание в список класса (с расширенным списком и всегда подготовленными).
    pub fn has_on_list(&self, meta: &SpellMeta) -> bool {
        meta.on_list(self.class)
            || self.expanded.iter().any(|id| id == meta.id)
            || self.always.iter().any(|id| id == meta.id)
    }

    /// Готово ли заклинание к накладыванию этим классом.
    pub fn is_ready(&self, meta: &SpellMeta) -> bool {
        let has = |list: &[String]| list.iter().any(|id| id == meta.id);
        if meta.is_cantrip() {
            return has(&self.cantrips);
        }
        match self.preparation {
            Preparation::Known => has(&self.known) || has(&self.always),
            Preparation::Prepared | Preparation::Spellbook => {
                has(&self.prepared) || has(&self.always)
            }
        }
    }

    /// Может ли класс провести это заклинание как ритуал (умение «Ритуальное колдовство»).
    pub fn can_ritual(&self, meta: &SpellMeta) -> bool {
        if !meta.ritual {
            return false;
        }
        match (self.class, self.preparation) {
            (SpellClass::Wizard, Preparation::Spellbook) => {
                self.known.iter().any(|id| id == meta.id)
            }
            (SpellClass::Bard | SpellClass::Cleric | SpellClass::Druid, _) => self.is_ready(meta),
            _ => false,
        }
    }
}

/// Заклинание от черты, воззвания или предмета.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct GrantedSpell {
    pub spell_id: String,
    /// «Затронутый Тенью», «Воззвание: Маска многих обличий».
    pub source: String,
    /// Пул применений; `None` — неограниченно.
    pub resource_id: Option<String>,
    /// Круг, на котором накладывается.
    pub cast_level: u8,
    /// Класс, чьи КС и атака используются.
    pub caster_id: Option<String>,
    /// Можно ли накладывать и своими ячейками (так позволяют черты «Затронутый Тенью»
    /// и «Затронутый Феями»; заклинания предметов и воззваний — нет).
    #[cfg_attr(feature = "serde", serde(default))]
    pub slots_allowed: bool,
}

/// Свитки одного заклинания.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ScrollStack {
    pub spell_id: String,
    /// Круг, на котором записан свиток.
    pub level: u8,
    pub count: u32,
    /// Контейнер инвентаря; `None` — «При себе».
    #[cfg_attr(feature = "serde", serde(default))]
    pub container: Option<String>,
}

/// Предмет или умение, восстанавливающее ячейку (Жезл хранителя договора, Жемчужина силы).
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SlotRestorer {
    /// Пул применений предмета.
    pub resource_id: String,
    pub label: String,
    /// Высший круг восстанавливаемой ячейки.
    pub max_level: u8,
    /// Только ячейки договора.
    pub pact_only: bool,
}

/// Колдовство персонажа.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq, Default)]
pub struct Spellcasting {
    pub casters: Vec<Caster>,
    pub granted: Vec<GrantedSpell>,
    pub scrolls: Vec<ScrollStack>,
    pub restorers: Vec<SlotRestorer>,
    /// Подготовка открыта: после длительного отдыха и до первого потраченного заклинания.
    pub can_prepare: bool,
}

impl Spellcasting {
    /// Круг ячеек договора (0 — нет магии договора).
    pub fn pact_level(&self) -> u8 {
        self.casters
            .iter()
            .filter(|c| c.progression == Progression::Pact)
            .map(Caster::max_spell_level)
            .max()
            .unwrap_or(0)
    }

    fn pact_slot_count(&self) -> u32 {
        let level: u32 = self
            .casters
            .iter()
            .filter(|c| c.progression == Progression::Pact)
            .map(|c| c.level)
            .sum();
        match level {
            0 => 0,
            1 => 1,
            2..=10 => 2,
            11..=16 => 3,
            _ => 4,
        }
    }

    /// Уровень заклинателя для таблицы ячеек: один класс — по своей таблице (половинный
    /// округляется вверх), мультикласс — по правилам мультикласса (вниз).
    pub fn caster_level(&self) -> u32 {
        let slotted: Vec<&Caster> = self
            .casters
            .iter()
            .filter(|c| !matches!(c.progression, Progression::Pact | Progression::Innate))
            .collect();
        match slotted.as_slice() {
            [] => 0,
            [single] => match single.progression {
                Progression::Full => single.level,
                Progression::Half if single.level >= 2 => single.level.div_ceil(2),
                Progression::Half2024 => single.level.div_ceil(2),
                Progression::Third if single.level >= 3 => single.level.div_ceil(3),
                _ => 0,
            },
            many => many
                .iter()
                .map(|c| match c.progression {
                    Progression::Full => c.level,
                    Progression::Half => c.level / 2,
                    Progression::Half2024 => c.level.div_ceil(2),
                    Progression::Third => c.level / 3,
                    Progression::Pact | Progression::Innate => 0,
                })
                .sum(),
        }
    }

    /// Полные пулы ячеек по классам и уровням.
    pub fn slot_pools(&self) -> Vec<ResourcePool> {
        let mut pools = Vec::new();
        let pact = self.pact_level();
        if pact > 0 {
            pools.push(ResourcePool::new(
                PACT_SLOTS_ID,
                format!("Ячейки договора ({pact} круг)"),
                self.pact_slot_count(),
                Recovery::ShortRest,
            ));
        }
        let level = self.caster_level().min(20) as usize;
        if level > 0 {
            for (i, &count) in SLOT_TABLE[level - 1].iter().enumerate() {
                if count > 0 {
                    let circle = i as u8 + 1;
                    pools.push(ResourcePool::new(
                        slot_id(circle),
                        format!("Ячейки {circle} круга"),
                        count,
                        Recovery::LongRest,
                    ));
                }
            }
        }
        pools
    }

    fn caster(&self, id: &str) -> Result<&Caster, EngineError> {
        self.casters
            .iter()
            .find(|c| c.id == id)
            .ok_or_else(|| EngineError::CasterNotFound(id.to_string()))
    }

    /// Все ID заклинаний, на которые ссылается колдовство (для проверки данных).
    pub fn referenced_spells(&self) -> Vec<&str> {
        let mut out: Vec<&str> = Vec::new();
        for c in &self.casters {
            for list in [&c.cantrips, &c.known, &c.prepared, &c.always, &c.expanded] {
                out.extend(list.iter().map(String::as_str));
            }
        }
        out.extend(self.granted.iter().map(|g| g.spell_id.as_str()));
        out.extend(self.scrolls.iter().map(|s| s.spell_id.as_str()));
        out
    }
}

/// Строка заклинания в книге.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SpellEntry {
    pub id: String,
    pub name: String,
    pub level: u8,
    pub ritual: bool,
    pub concentration: bool,
    /// Готово к накладыванию (подготовлено или известно).
    pub ready: bool,
    /// Подготовлено всегда (домен, клятва) — не входит в лимит.
    pub always: bool,
    /// Откуда заклинание, если не из базового списка: «Домен Могилы», «Исчадие».
    pub tag: Option<String>,
}

/// Ячейки одного круга.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SlotView {
    pub level: u8,
    pub pact: bool,
    pub pool: ResourcePool,
}

/// Класс-заклинатель в книге.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CasterView {
    pub id: String,
    pub label: String,
    pub class: SpellClass,
    pub ability: Ability,
    pub ability_label: &'static str,
    pub save_dc: i32,
    pub attack_bonus: i32,
    pub item_bonus_source: Option<String>,
    pub preparation: Preparation,
    pub progression: Progression,
    pub max_spell_level: u8,
    pub cantrips: Vec<SpellEntry>,
    pub max_cantrips: u32,
    /// Готовые заклинания: известные или подготовленные вместе с всегда подготовленными.
    pub spells: Vec<SpellEntry>,
    pub known_count: Option<u32>,
    pub max_known: Option<u32>,
    pub prepared_count: Option<u32>,
    pub prepared_limit: Option<u32>,
    /// Лимит взят из таблицы класса (правила 2024 года), а не из формулы.
    pub prepared_by_table: bool,
    /// Подготовлено больше лимита (данные листа нарушают правила).
    pub over_limit: bool,
    /// Книга волшебника.
    pub spellbook: Vec<SpellEntry>,
}

/// Заклинание от черты или предмета.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct GrantedView {
    pub spell: SpellEntry,
    pub source: String,
    pub cast_level: u8,
    /// `None` — неограниченно.
    pub uses: Option<ResourcePool>,
    /// Можно ли накладывать и своими ячейками.
    pub slots_allowed: bool,
}

/// Стопка свитков.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ScrollView {
    pub spell: SpellEntry,
    pub level: u8,
    pub count: u32,
    /// Есть ли заклинание в списке хотя бы одного класса персонажа.
    pub usable: bool,
    /// КС проверки, если круг свитка выше доступного персонажу.
    pub check_dc: Option<u32>,
}

/// Предмет, восстанавливающий ячейку.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RestorerView {
    pub label: String,
    pub max_level: u8,
    pub pact_only: bool,
    pub uses: ResourcePool,
}

/// Книга заклинаний персонажа.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SpellbookView {
    pub character_id: String,
    pub can_prepare: bool,
    pub slots: Vec<SlotView>,
    pub casters: Vec<CasterView>,
    pub granted: Vec<GrantedView>,
    pub scrolls: Vec<ScrollView>,
    pub restorers: Vec<RestorerView>,
}

/// Заявка на заклинание.
#[cfg_attr(feature = "serde", derive(serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CastRequest {
    pub spell_id: String,
    /// `None` — движок выбирает сам: заговор, ячейка договора, обычная ячейка,
    /// заклинание черты или свиток.
    pub method: Option<CastMethod>,
    /// Круг ячейки (усиление). Для ячеек договора — только их круг.
    pub slot_level: Option<u8>,
}

impl CastRequest {
    pub fn new(spell_id: &str) -> Self {
        Self { spell_id: spell_id.into(), method: None, slot_level: None }
    }

    pub fn with_method(mut self, method: CastMethod) -> Self {
        self.method = Some(method);
        self
    }

    pub fn at_level(mut self, level: u8) -> Self {
        self.slot_level = Some(level);
        self
    }
}

/// Итог накладывания.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CastOutcome {
    pub character_id: String,
    pub character_name: String,
    pub spell_id: String,
    pub spell_name: String,
    pub spell_level: u8,
    pub cast_level: u8,
    pub method: CastMethod,
    /// Пул после траты (ячейка или применения черты/предмета).
    pub spent: Option<ResourcePool>,
    /// Сколько свитков осталось.
    pub scrolls_left: Option<u32>,
    /// КС проверки Магии при свитке выше доступного круга.
    pub check_dc: Option<u32>,
    pub concentration: bool,
    pub save_dc: Option<i32>,
    pub attack_bonus: Option<i32>,
    /// Строка для журнала и ИИ-мастера.
    pub summary: String,
}

/// Итог восстановления ячейки предметом.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SlotRestoreOutcome {
    pub slot: ResourcePool,
    pub item: ResourcePool,
    pub summary: String,
}

fn meta(id: &str) -> Result<&'static SpellMeta, EngineError> {
    spell(id).ok_or_else(|| EngineError::UnknownSpell(id.to_string()))
}

fn slot_ref_id(slot: SlotRef) -> String {
    match slot {
        SlotRef::Pact => PACT_SLOTS_ID.to_string(),
        SlotRef::Level(l) => slot_id(l),
    }
}

/// План накладывания, составленный до изменения состояния.
enum Plan {
    Free { method: CastMethod, caster: Option<String> },
    Pool { method: CastMethod, resource: String, cast_level: u8, caster: Option<String> },
    Scroll { index: usize, check_dc: Option<u32>, caster: Option<String> },
}

impl Character {
    fn spellcasting_ref(&self) -> Result<&Spellcasting, EngineError> {
        self.spellcasting.as_ref().ok_or_else(|| EngineError::NotASpellcaster(self.name.clone()))
    }

    fn pool_nonempty(&self, id: &str) -> bool {
        self.resource(id).is_some_and(|p| !p.is_empty())
    }

    fn has_pool(&self, id: &str) -> bool {
        self.resource(id).is_some_and(|p| p.max() > 0)
    }

    /// КС спасброска и бонус атаки заклинаниями класса.
    pub fn caster_numbers(&self, caster: &Caster) -> (i32, i32) {
        let base = self.proficiency_bonus() + self.abilities.modifier(caster.ability);
        (
            8 + base + caster.item_bonus + caster.dc_item_bonus,
            base + caster.item_bonus + caster.attack_item_bonus,
        )
    }

    /// Высший круг, который персонаж может сотворить своими ячейками.
    pub fn max_castable_level(&self) -> u8 {
        let pact = self.spellcasting.as_ref().map_or(0, Spellcasting::pact_level);
        let slots = (1..=9).rev().find(|&l| self.has_pool(&slot_id(l))).unwrap_or(0);
        pact.max(slots)
    }

    fn entry(
        &self,
        meta: &SpellMeta,
        ready: bool,
        always: bool,
        tag: Option<String>,
    ) -> SpellEntry {
        SpellEntry {
            id: meta.id.to_string(),
            name: meta.name.to_string(),
            level: meta.level,
            ritual: meta.ritual,
            concentration: meta.concentration,
            ready,
            always,
            tag,
        }
    }

    fn caster_tag(caster: &Caster, meta: &SpellMeta) -> Option<String> {
        if caster.always.iter().any(|id| id == meta.id) {
            Some(caster.always_source.clone())
        } else if caster.expanded.iter().any(|id| id == meta.id) {
            Some(caster.expanded_source.clone())
        } else {
            None
        }
    }

    fn entries(&self, caster: &Caster, list: &[String]) -> Vec<SpellEntry> {
        let mut out: Vec<SpellEntry> = list
            .iter()
            .filter_map(|id| spell(id))
            .map(|m| {
                let always = caster.always.iter().any(|id| id == m.id);
                self.entry(m, caster.is_ready(m), always, Self::caster_tag(caster, m))
            })
            .collect();
        out.sort_by(|a, b| a.level.cmp(&b.level).then_with(|| a.name.cmp(&b.name)));
        out.dedup_by(|a, b| a.id == b.id);
        out
    }

    /// Книга заклинаний для интерфейса и мастера. `None` — персонаж не колдует.
    pub fn spellbook(&self) -> Option<SpellbookView> {
        let sc = self.spellcasting.as_ref()?;
        let pact = sc.pact_level();
        let mut slots = Vec::new();
        if let Some(pool) = self.resource(PACT_SLOTS_ID) {
            slots.push(SlotView { level: pact, pact: true, pool: pool.clone() });
        }
        for level in 1..=9 {
            if let Some(pool) = self.resource(&slot_id(level)) {
                slots.push(SlotView { level, pact: false, pool: pool.clone() });
            }
        }

        let casters = sc
            .casters
            .iter()
            .map(|c| {
                let (save_dc, attack_bonus) = self.caster_numbers(c);
                let modifier = self.abilities.modifier(c.ability);
                let ready: Vec<String> = match c.preparation {
                    Preparation::Known => c.known.clone(),
                    _ => c.always.iter().chain(&c.prepared).cloned().collect(),
                };
                let prepared_count = match c.preparation {
                    Preparation::Known => None,
                    _ => Some(c.prepared.iter().filter(|id| !c.always.contains(id)).count() as u32),
                };
                let prepared_limit = c.prepared_limit(modifier);
                CasterView {
                    id: c.id.clone(),
                    label: c.label.clone(),
                    class: c.class,
                    ability: c.ability,
                    ability_label: c.ability.short_name(),
                    save_dc,
                    attack_bonus,
                    item_bonus_source: c.item_bonus_sources(),
                    preparation: c.preparation,
                    progression: c.progression,
                    max_spell_level: c.max_spell_level(),
                    cantrips: self.entries(c, &c.cantrips),
                    max_cantrips: c.max_cantrips,
                    spells: self.entries(c, &ready),
                    known_count: (c.preparation == Preparation::Known)
                        .then_some(c.known.len() as u32),
                    max_known: c.max_known,
                    prepared_count,
                    prepared_limit,
                    prepared_by_table: c.max_prepared.is_some(),
                    over_limit: matches!((prepared_count, prepared_limit), (Some(n), Some(l)) if n > l),
                    spellbook: if c.preparation == Preparation::Spellbook {
                        self.entries(c, &c.known)
                    } else {
                        Vec::new()
                    },
                }
            })
            .collect();

        let granted = sc
            .granted
            .iter()
            .filter_map(|g| {
                let m = spell(&g.spell_id)?;
                Some(GrantedView {
                    spell: self.entry(m, true, false, Some(g.source.clone())),
                    source: g.source.clone(),
                    cast_level: g.cast_level.max(m.level),
                    uses: g.resource_id.as_deref().and_then(|id| self.resource(id)).cloned(),
                    slots_allowed: g.slots_allowed,
                })
            })
            .collect();

        let max_castable = self.max_castable_level();
        let scrolls = sc
            .scrolls
            .iter()
            .filter_map(|s| {
                let m = spell(&s.spell_id)?;
                let usable = sc.casters.iter().any(|c| c.has_on_list(m));
                Some(ScrollView {
                    spell: self.entry(m, usable, false, None),
                    level: s.level,
                    count: s.count,
                    usable,
                    check_dc: (usable && s.level > max_castable).then(|| 10 + u32::from(s.level)),
                })
            })
            .collect();

        let restorers = sc
            .restorers
            .iter()
            .filter_map(|r| {
                Some(RestorerView {
                    label: r.label.clone(),
                    max_level: r.max_level,
                    pact_only: r.pact_only,
                    uses: self.resource(&r.resource_id)?.clone(),
                })
            })
            .collect();

        Some(SpellbookView {
            character_id: self.id.clone(),
            can_prepare: sc.can_prepare,
            slots,
            casters,
            granted,
            scrolls,
            restorers,
        })
    }

    /// Заклинания, из которых класс может подготовить (список класса до доступного круга
    /// и расширенный список; для волшебника — его книга).
    pub fn preparation_options(&self, caster_id: &str) -> Result<Vec<SpellEntry>, EngineError> {
        let sc = self.spellcasting_ref()?;
        let c = sc.caster(caster_id)?;
        let max = c.max_spell_level();
        let pool: Vec<String> = match c.preparation {
            Preparation::Known => return Err(EngineError::NotPreparedCaster(c.label.clone())),
            Preparation::Spellbook => c.known.clone(),
            Preparation::Prepared => class_list(c.class)
                .filter(|m| m.level >= 1 && m.level <= max)
                .map(|m| m.id.to_string())
                .chain(c.expanded.iter().cloned())
                .chain(c.always.iter().cloned())
                .collect(),
        };
        Ok(self.entries(c, &pool).into_iter().filter(|e| e.level >= 1 && e.level <= max).collect())
    }

    /// Подготовка заклинаний класса. Всегда подготовленные в список не входят.
    pub fn prepare_spells(
        &mut self,
        caster_id: &str,
        spells: &[String],
    ) -> Result<(), EngineError> {
        let modifier_of = |ability: Ability| self.abilities.modifier(ability);
        let sc = self.spellcasting_ref()?;
        if !sc.can_prepare {
            return Err(EngineError::PreparationClosed);
        }
        let c = sc.caster(caster_id)?;
        if c.preparation == Preparation::Known {
            return Err(EngineError::NotPreparedCaster(c.label.clone()));
        }
        let max = c.max_spell_level();
        let mut chosen: Vec<String> = Vec::new();
        for id in spells {
            let m = meta(id)?;
            if c.always.iter().any(|a| a == id) || chosen.contains(id) {
                continue;
            }
            if m.is_cantrip() {
                return Err(EngineError::CantripNotPrepared(m.name.to_string()));
            }
            if m.level > max {
                return Err(EngineError::SpellLevelTooHigh {
                    spell: m.name.to_string(),
                    level: m.level,
                    max,
                });
            }
            let allowed = match c.preparation {
                Preparation::Spellbook => c.known.iter().any(|k| k == id),
                _ => c.has_on_list(m),
            };
            if !allowed {
                return Err(EngineError::NotOnClassList {
                    spell: m.name.to_string(),
                    list: if c.preparation == Preparation::Spellbook {
                        "книги заклинаний".into()
                    } else {
                        c.class.genitive().into()
                    },
                });
            }
            chosen.push(id.clone());
        }
        let limit = c.prepared_limit(modifier_of(c.ability)).unwrap_or(0);
        if chosen.len() as u32 > limit {
            return Err(EngineError::PreparedLimit { limit, requested: chosen.len() as u32 });
        }
        let index = sc.casters.iter().position(|x| x.id == caster_id).unwrap_or_default();
        if let Some(sc) = self.spellcasting.as_mut() {
            sc.casters[index].prepared = chosen;
        }
        Ok(())
    }

    fn plan_cast(&self, req: &CastRequest, m: &SpellMeta) -> Result<Plan, EngineError> {
        let sc = self.spellcasting_ref()?;
        let ready = sc.casters.iter().find(|c| c.is_ready(m)).map(|c| c.id.clone());
        let granted = sc.granted.iter().find(|g| g.spell_id == m.id);
        let scroll = sc.scrolls.iter().position(|s| s.spell_id == m.id && s.count > 0);
        let pact = sc.pact_level();
        let not_available = || EngineError::SpellNotAvailable {
            character: self.name.clone(),
            spell: m.name.to_string(),
        };

        // Ячейками можно творить подготовленное/известное и заклинания черт, где это разрешено.
        let feat_slots = granted.filter(|g| g.slots_allowed);
        let can_slot = ready.is_some() || feat_slots.is_some();
        let slot_caster = ready.clone().or_else(|| feat_slots.and_then(|g| g.caster_id.clone()));
        let slot_kind = || {
            let pact_fits = pact >= m.level && req.slot_level.is_none_or(|l| l == pact);
            let has_regular = (m.level..=9).any(|l| self.has_pool(&slot_id(l)));
            if (pact_fits && self.pool_nonempty(PACT_SLOTS_ID)) || (pact > 0 && !has_regular) {
                CastMethod::Pact
            } else {
                CastMethod::Slot
            }
        };
        let granted_has_uses = granted
            .is_some_and(|g| g.resource_id.as_deref().is_none_or(|id| self.pool_nonempty(id)));

        let method = match req.method {
            Some(method) => method,
            None if m.is_cantrip() => {
                if ready.is_some() {
                    CastMethod::Cantrip
                } else if granted.is_some() {
                    CastMethod::Granted
                } else {
                    return Err(not_available());
                }
            }
            None if ready.is_some() => slot_kind(),
            // Сначала бесплатное применение черты, когда оно кончилось — ячейка, если можно.
            None if granted_has_uses && req.slot_level.is_none() => CastMethod::Granted,
            None if feat_slots.is_some() => slot_kind(),
            None if granted.is_some() => CastMethod::Granted,
            None if scroll.is_some() => CastMethod::Scroll,
            None => return Err(not_available()),
        };

        match method {
            CastMethod::Cantrip => {
                if !m.is_cantrip() {
                    return Err(EngineError::NotACantrip(m.name.to_string()));
                }
                if ready.is_none() {
                    return Err(not_available());
                }
                Ok(Plan::Free { method, caster: ready })
            }
            CastMethod::Slot => {
                if m.is_cantrip() {
                    return Err(EngineError::CantripNoSlot(m.name.to_string()));
                }
                if !can_slot {
                    return Err(not_available());
                }
                let level = match req.slot_level {
                    Some(l) if l < m.level => {
                        return Err(EngineError::SlotTooLow {
                            spell: m.name.to_string(),
                            spell_level: m.level,
                            slot_level: l,
                        })
                    }
                    Some(l) if !(1..=9).contains(&l) => {
                        return Err(EngineError::InvalidSlotLevel(l))
                    }
                    Some(l) => {
                        if !self.pool_nonempty(&slot_id(l)) {
                            return Err(EngineError::NoSlotAvailable { level: l, exact: true });
                        }
                        l
                    }
                    None => (m.level..=9)
                        .find(|&l| self.pool_nonempty(&slot_id(l)))
                        .ok_or(EngineError::NoSlotAvailable { level: m.level, exact: false })?,
                };
                Ok(Plan::Pool {
                    method,
                    resource: slot_id(level),
                    cast_level: level,
                    caster: ready,
                })
            }
            CastMethod::Pact => {
                if m.is_cantrip() {
                    return Err(EngineError::CantripNoSlot(m.name.to_string()));
                }
                if !can_slot {
                    return Err(not_available());
                }
                if pact == 0 {
                    return Err(EngineError::NoPactMagic(self.name.clone()));
                }
                if m.level > pact {
                    return Err(EngineError::SlotTooLow {
                        spell: m.name.to_string(),
                        spell_level: m.level,
                        slot_level: pact,
                    });
                }
                if let Some(l) = req.slot_level.filter(|&l| l != pact) {
                    return Err(EngineError::PactSlotLevel { pact_level: pact, requested: l });
                }
                Ok(Plan::Pool {
                    method,
                    resource: PACT_SLOTS_ID.into(),
                    cast_level: pact,
                    caster: slot_caster,
                })
            }
            CastMethod::Ritual => {
                if !m.ritual {
                    return Err(EngineError::NotARitual(m.name.to_string()));
                }
                let caster = sc.casters.iter().find(|c| c.can_ritual(m)).ok_or_else(|| {
                    EngineError::RitualNotAllowed {
                        character: self.name.clone(),
                        spell: m.name.to_string(),
                    }
                })?;
                Ok(Plan::Free { method, caster: Some(caster.id.clone()) })
            }
            CastMethod::Granted => {
                let g = granted.ok_or_else(|| EngineError::NotGranted {
                    character: self.name.clone(),
                    spell: m.name.to_string(),
                })?;
                let cast_level = g.cast_level.max(m.level);
                Ok(match &g.resource_id {
                    Some(resource) => Plan::Pool {
                        method,
                        resource: resource.clone(),
                        cast_level,
                        caster: g.caster_id.clone(),
                    },
                    None => Plan::Free { method, caster: g.caster_id.clone() },
                })
            }
            CastMethod::Scroll => {
                let index = scroll.ok_or_else(|| EngineError::NoScroll(m.name.to_string()))?;
                let caster = sc.casters.iter().find(|c| c.has_on_list(m)).ok_or_else(|| {
                    EngineError::ScrollNotOnList {
                        character: self.name.clone(),
                        spell: m.name.to_string(),
                    }
                })?;
                let level = sc.scrolls[index].level;
                let check_dc = (level > self.max_castable_level()).then(|| 10 + u32::from(level));
                Ok(Plan::Scroll { index, check_dc, caster: Some(caster.id.clone()) })
            }
        }
    }

    /// Накладывание заклинания: проверка, списание ячейки/применения/свитка и итог.
    pub fn cast_spell(&mut self, req: &CastRequest) -> Result<CastOutcome, EngineError> {
        let m = meta(&req.spell_id)?;
        let plan = self.plan_cast(req, m)?;

        let numbers = |this: &Self, caster: &Option<String>| {
            caster
                .as_deref()
                .and_then(|id| this.spellcasting.as_ref()?.casters.iter().find(|c| c.id == id))
                .map(|c| this.caster_numbers(c))
        };

        let (method, cast_level, spent, scrolls_left, check_dc, caster) = match plan {
            Plan::Free { method, caster } => (method, m.level, None, None, None, caster),
            Plan::Pool { method, resource, cast_level, caster } => {
                let pool = self.resource_mut(&resource)?;
                pool.spend(1)?;
                (method, cast_level, Some(pool.clone()), None, None, caster)
            }
            Plan::Scroll { index, check_dc, caster } => {
                let sc = self
                    .spellcasting
                    .as_mut()
                    .ok_or_else(|| EngineError::NotASpellcaster(self.name.clone()))?;
                let stack = &mut sc.scrolls[index];
                stack.count -= 1;
                let left = stack.count;
                let level = stack.level;
                if left == 0 {
                    sc.scrolls.remove(index);
                }
                (CastMethod::Scroll, level, None, Some(left), check_dc, caster)
            }
        };
        let (save_dc, attack_bonus) = numbers(self, &caster).unzip();

        if method != CastMethod::Cantrip {
            if let Some(sc) = self.spellcasting.as_mut() {
                sc.can_prepare = false;
            }
        }

        let level_text = if cast_level == 0 {
            "заговор".to_string()
        } else {
            format!("{cast_level} круг")
        };
        let mut summary = format!("{}: «{}» ({level_text})", self.name, m.name);
        match method {
            CastMethod::Cantrip => summary.push_str(" — без ячейки"),
            CastMethod::Ritual => summary.push_str(" — ритуалом, без ячейки, на 10 минут дольше"),
            CastMethod::Scroll => {
                summary.push_str(&format!(" — со свитка, осталось {}", scrolls_left.unwrap_or(0)));
                if let Some(dc) = check_dc {
                    summary.push_str(&format!(
                        "; круг свитка выше доступного — нужна проверка заклинательной характеристики КС {dc}, при провале свиток пропадает впустую"
                    ));
                }
            }
            _ => {
                if let Some(pool) = &spent {
                    summary.push_str(&format!(
                        " — {}, осталось {}/{}",
                        pool.name(),
                        pool.current(),
                        pool.max()
                    ));
                } else {
                    summary.push_str(" — неограниченно");
                }
            }
        }
        if m.concentration {
            summary.push_str(" · концентрация");
        }

        Ok(CastOutcome {
            character_id: self.id.clone(),
            character_name: self.name.clone(),
            spell_id: m.id.to_string(),
            spell_name: m.name.to_string(),
            spell_level: m.level,
            cast_level,
            method,
            spent,
            scrolls_left,
            check_dc,
            concentration: m.concentration,
            save_dc,
            attack_bonus,
            summary,
        })
    }

    /// Ручная трата (`spend = true`) или возврат ячейки.
    pub fn change_slot(&mut self, slot: SlotRef, spend: bool) -> Result<ResourcePool, EngineError> {
        self.spellcasting_ref()?;
        let id = slot_ref_id(slot);
        let pool = self.resource_mut(&id)?;
        if spend {
            pool.spend(1)?;
        } else if pool.restore(1)? == 0 {
            return Err(EngineError::SlotFull(pool.name().to_string()));
        }
        let pool = pool.clone();
        if spend {
            if let Some(sc) = self.spellcasting.as_mut() {
                sc.can_prepare = false;
            }
        }
        Ok(pool)
    }

    /// Восстановление ячейки предметом (Жезл хранителя договора, Жемчужина силы).
    pub fn restore_slot_with(
        &mut self,
        item_resource_id: &str,
        slot: SlotRef,
    ) -> Result<SlotRestoreOutcome, EngineError> {
        let sc = self.spellcasting_ref()?;
        let restorer = sc
            .restorers
            .iter()
            .find(|r| r.resource_id == item_resource_id)
            .ok_or_else(|| EngineError::ResourceNotFound(item_resource_id.to_string()))?
            .clone();
        let slot_level = match slot {
            SlotRef::Pact => sc.pact_level(),
            SlotRef::Level(l) => l,
        };
        if restorer.pact_only && slot != SlotRef::Pact {
            return Err(EngineError::RestorerPactOnly(restorer.label));
        }
        if slot_level > restorer.max_level {
            return Err(EngineError::RestorerLevel {
                item: restorer.label,
                max: restorer.max_level,
                requested: slot_level,
            });
        }
        let slot_pool_id = slot_ref_id(slot);
        let slot_pool = self
            .resource(&slot_pool_id)
            .ok_or_else(|| EngineError::ResourceNotFound(slot_pool_id.clone()))?;
        if slot_pool.current() == slot_pool.max() {
            return Err(EngineError::SlotFull(slot_pool.name().to_string()));
        }
        let item = self.resource_mut(item_resource_id)?;
        item.spend(1)?;
        let item = item.clone();
        let slot_pool = self.resource_mut(&slot_pool_id)?;
        slot_pool.restore(1)?;
        let slot_pool = slot_pool.clone();
        let summary = format!(
            "{}: {} восстанавливает ячейку — {} {}/{}",
            self.name,
            restorer.label,
            slot_pool.name(),
            slot_pool.current(),
            slot_pool.max()
        );
        Ok(SlotRestoreOutcome { slot: slot_pool, item, summary })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::fixtures::demo_party;
    use crate::resource::RestKind;

    fn member(id: &str) -> Character {
        demo_party().into_iter().find(|c| c.id == id).unwrap()
    }

    fn strings(list: &[&str]) -> Vec<String> {
        list.iter().map(|s| (*s).to_string()).collect()
    }

    #[test]
    fn party_data_references_only_known_spells() {
        for c in demo_party() {
            if let Some(sc) = &c.spellcasting {
                for id in sc.referenced_spells() {
                    assert!(spell(id).is_some(), "{}: неизвестное заклинание «{id}»", c.name);
                }
            }
        }
    }

    #[test]
    fn slot_tables() {
        let nikis = member("pc.nikis");
        let sc = nikis.spellcasting.as_ref().unwrap();
        assert_eq!(sc.pact_level(), 4);
        assert_eq!(nikis.resource(PACT_SLOTS_ID).unwrap().max(), 2);
        assert!(nikis.resource("slots.1").is_none());

        let valeria = member("npc.valeria");
        let maxes: Vec<u32> =
            (1..=4).map(|l| valeria.resource(&slot_id(l)).unwrap().max()).collect();
        assert_eq!(maxes, vec![4, 3, 3, 2]);
        assert!(valeria.resource("slots.5").is_none());

        let gunther = member("npc.gunther");
        assert_eq!(gunther.spellcasting.as_ref().unwrap().caster_level(), 4);
        assert_eq!(gunther.resource("slots.1").unwrap().max(), 4);
        assert_eq!(gunther.resource("slots.2").unwrap().max(), 3);
    }

    #[test]
    fn multiclass_caster_level_rounds_down() {
        let mut sc = Spellcasting::default();
        sc.casters.push(Caster::new(
            "paladin",
            "Паладин",
            SpellClass::Paladin,
            Ability::Charisma,
            5,
            Progression::Half,
            Preparation::Prepared,
        ));
        assert_eq!(sc.caster_level(), 3);
        sc.casters.push(Caster::new(
            "cleric",
            "Жрец",
            SpellClass::Cleric,
            Ability::Wisdom,
            3,
            Progression::Full,
            Preparation::Prepared,
        ));
        assert_eq!(sc.caster_level(), 5);
        let pools = sc.slot_pools();
        assert_eq!(pools.iter().map(|p| p.max()).collect::<Vec<_>>(), vec![4, 3, 2]);
    }

    #[test]
    fn numbers_match_sheets() {
        let nikis = member("pc.nikis");
        let book = nikis.spellbook().unwrap();
        assert_eq!(book.casters[0].save_dc, 17);
        assert_eq!(book.casters[0].attack_bonus, 8);
        let valeria = member("npc.valeria").spellbook().unwrap();
        assert_eq!(valeria.casters[0].save_dc, 16);
        assert_eq!(valeria.casters[0].prepared_limit, Some(13));
        let gunther = member("npc.gunther").spellbook().unwrap();
        assert_eq!(gunther.casters[0].save_dc, 13);
        assert_eq!(gunther.casters[0].prepared_limit, Some(6));
    }

    #[test]
    fn warlock_casts_with_pact_slots_at_pact_level() {
        let mut nikis = member("pc.nikis");
        let out = nikis.cast_spell(&CastRequest::new("misty-step")).unwrap();
        assert_eq!(out.method, CastMethod::Pact);
        assert_eq!(out.cast_level, 4);
        assert_eq!(out.spent.as_ref().unwrap().current(), 1);
        assert!(out.summary.contains("«Туманный шаг» (4 круг)"));

        assert_eq!(
            nikis.cast_spell(&CastRequest::new("scorching-ray").at_level(2)),
            Err(EngineError::PactSlotLevel { pact_level: 4, requested: 2 })
        );
        nikis.cast_spell(&CastRequest::new("scorching-ray")).unwrap();
        assert!(matches!(
            nikis.cast_spell(&CastRequest::new("blight")),
            Err(EngineError::ResourceDepleted { .. })
        ));
        nikis.apply_rest(RestKind::Short);
        assert_eq!(nikis.resource(PACT_SLOTS_ID).unwrap().current(), 2);
    }

    #[test]
    fn unknown_and_unprepared_spells_are_rejected() {
        let mut nikis = member("pc.nikis");
        assert!(matches!(
            nikis.cast_spell(&CastRequest::new("cone-of-cold")),
            Err(EngineError::SpellNotAvailable { .. })
        ));
        assert_eq!(
            nikis.cast_spell(&CastRequest::new("no-such-spell")),
            Err(EngineError::UnknownSpell("no-such-spell".into()))
        );
        let mut corvus = member("npc.corvus");
        assert!(matches!(
            corvus.cast_spell(&CastRequest::new("bless")),
            Err(EngineError::NotASpellcaster(_))
        ));
    }

    #[test]
    fn cantrips_and_at_will_spells_cost_nothing() {
        let mut nikis = member("pc.nikis");
        let out = nikis.cast_spell(&CastRequest::new("eldritch-blast")).unwrap();
        assert_eq!(out.method, CastMethod::Cantrip);
        assert!(out.spent.is_none());
        let out = nikis.cast_spell(&CastRequest::new("speak-with-dead")).unwrap();
        assert_eq!(out.method, CastMethod::Granted);
        assert!(out.spent.is_none());
        assert_eq!(nikis.resource(PACT_SLOTS_ID).unwrap().current(), 2);
    }

    #[test]
    fn granted_spells_spend_their_own_uses() {
        let mut nikis = member("pc.nikis");
        let out = nikis.cast_spell(&CastRequest::new("hunger-of-hadar")).unwrap();
        assert_eq!(out.method, CastMethod::Granted);
        assert_eq!(out.save_dc, Some(17));
        assert_eq!(out.spent.unwrap().current(), 0);
        assert!(matches!(
            nikis.cast_spell(&CastRequest::new("hunger-of-hadar")),
            Err(EngineError::ResourceDepleted { .. })
        ));
        nikis.cast_spell(&CastRequest::new("invisibility")).unwrap();
        assert_eq!(nikis.resource(PACT_SLOTS_ID).unwrap().current(), 2);
    }

    #[test]
    fn shadow_touched_spells_use_free_cast_then_slots() {
        let mut nikis = member("pc.nikis");
        let free = nikis.cast_spell(&CastRequest::new("cause-fear")).unwrap();
        assert_eq!((free.method, free.cast_level), (CastMethod::Granted, 1));
        assert_eq!(nikis.resource(PACT_SLOTS_ID).unwrap().current(), 2);
        // Бесплатное применение потрачено — дальше ячейкой договора на 4 круге.
        let slot = nikis.cast_spell(&CastRequest::new("cause-fear")).unwrap();
        assert_eq!((slot.method, slot.cast_level), (CastMethod::Pact, 4));
        assert_eq!(slot.save_dc, Some(17));
        assert_eq!(nikis.resource(PACT_SLOTS_ID).unwrap().current(), 1);
        // Явный выбор ячейки, пока бесплатное применение ещё есть.
        let out = nikis
            .cast_spell(&CastRequest::new("invisibility").with_method(CastMethod::Pact))
            .unwrap();
        assert_eq!(out.method, CastMethod::Pact);
        assert_eq!(nikis.resource("feat.shadow_touched.invisibility").unwrap().current(), 1);
        // Заклинание предмета ячейкой не творится.
        assert!(matches!(
            nikis.cast_spell(&CastRequest::new("hunger-of-hadar").with_method(CastMethod::Pact)),
            Err(EngineError::SpellNotAvailable { .. })
        ));
        let book = nikis.spellbook().unwrap();
        let fear = book.granted.iter().find(|g| g.spell.id == "cause-fear").unwrap();
        assert!(fear.slots_allowed);
        assert!(
            !book.granted.iter().find(|g| g.spell.id == "hunger-of-hadar").unwrap().slots_allowed
        );
    }

    #[test]
    fn cleric_slots_upcast_and_lowest_free_slot() {
        let mut valeria = member("npc.valeria");
        let out = valeria.cast_spell(&CastRequest::new("bless")).unwrap();
        assert_eq!((out.method, out.cast_level), (CastMethod::Slot, 1));
        let out = valeria.cast_spell(&CastRequest::new("bless").at_level(3)).unwrap();
        assert_eq!(out.cast_level, 3);
        assert_eq!(valeria.resource("slots.3").unwrap().current(), 2);
        assert!(matches!(
            valeria.cast_spell(&CastRequest::new("spirit-guardians").at_level(2)),
            Err(EngineError::SlotTooLow { spell_level: 3, slot_level: 2, .. })
        ));
        for _ in 0..3 {
            valeria.cast_spell(&CastRequest::new("bless").at_level(1)).unwrap();
        }
        let out = valeria.cast_spell(&CastRequest::new("bless")).unwrap();
        assert_eq!(out.cast_level, 2);
        let out = valeria.cast_spell(&CastRequest::new("death-ward")).unwrap();
        assert_eq!(out.cast_level, 4);
        assert!(out.summary.contains("Ячейки 4 круга"));
    }

    #[test]
    fn domain_spells_are_always_prepared() {
        let mut valeria = member("npc.valeria");
        let book = valeria.spellbook().unwrap();
        let cleric = &book.casters[0];
        let blight = cleric.spells.iter().find(|s| s.id == "blight").unwrap();
        assert!(blight.always);
        assert_eq!(blight.tag.as_deref(), Some("Домен Могилы"));
        assert_eq!(cleric.prepared_count, Some(13));
        valeria.cast_spell(&CastRequest::new("blight")).unwrap();
    }

    #[test]
    fn ritual_casting_rules() {
        let mut valeria = member("npc.valeria");
        let out = valeria
            .cast_spell(&CastRequest::new("detect-magic").with_method(CastMethod::Ritual))
            .unwrap();
        assert!(out.spent.is_none());
        assert!(out.summary.contains("ритуалом"));
        assert!(matches!(
            valeria.cast_spell(&CastRequest::new("bless").with_method(CastMethod::Ritual)),
            Err(EngineError::NotARitual(_))
        ));
        let mut nikis = member("pc.nikis");
        nikis.spellcasting.as_mut().unwrap().casters[0].known.push("comprehend-languages".into());
        assert!(matches!(
            nikis.cast_spell(
                &CastRequest::new("comprehend-languages").with_method(CastMethod::Ritual)
            ),
            Err(EngineError::RitualNotAllowed { .. })
        ));
    }

    #[test]
    fn scrolls_follow_class_lists() {
        let mut nikis = member("pc.nikis");
        let book = nikis.spellbook().unwrap();
        let usable = |id: &str| book.scrolls.iter().find(|s| s.spell.id == id).unwrap().usable;
        assert!(usable("counterspell"));
        assert!(usable("fire-shield"));
        assert!(!usable("identify"));
        assert!(!usable("wall-of-force"));

        let out = nikis
            .cast_spell(&CastRequest::new("dispel-magic").with_method(CastMethod::Scroll))
            .unwrap();
        assert_eq!(out.scrolls_left, Some(1));
        assert_eq!(out.check_dc, None);
        assert_eq!(nikis.resource(PACT_SLOTS_ID).unwrap().current(), 2);
        assert!(matches!(
            nikis.cast_spell(&CastRequest::new("identify").with_method(CastMethod::Scroll)),
            Err(EngineError::ScrollNotOnList { .. })
        ));
        let wall = nikis.cast_spell(&CastRequest::new("wall-of-force"));
        assert!(matches!(wall, Err(EngineError::ScrollNotOnList { .. })));

        let mut darkness_left = None;
        for _ in 0..2 {
            darkness_left = nikis
                .cast_spell(&CastRequest::new("darkness").with_method(CastMethod::Scroll))
                .ok()
                .and_then(|o| o.scrolls_left);
        }
        assert_eq!(darkness_left, None);
        assert!(!nikis.spellbook().unwrap().scrolls.iter().any(|s| s.spell.id == "darkness"));
    }

    #[test]
    fn scroll_above_castable_level_needs_a_check() {
        let mut valeria = member("npc.valeria");
        valeria.spellcasting.as_mut().unwrap().scrolls.push(ScrollStack {
            spell_id: "heal".into(),
            level: 6,
            count: 1,
            container: None,
        });
        let out = valeria.cast_spell(&CastRequest::new("heal")).unwrap();
        assert_eq!(out.method, CastMethod::Scroll);
        assert_eq!(out.check_dc, Some(16));
        assert!(out.summary.contains("КС 16"));
    }

    #[test]
    fn preparation_window_and_limits() {
        let mut valeria = member("npc.valeria");
        let list = strings(&["bless", "healing-word", "spirit-guardians"]);
        assert_eq!(valeria.prepare_spells("cleric", &list), Err(EngineError::PreparationClosed));

        valeria.apply_rest(RestKind::Long);
        valeria.prepare_spells("cleric", &list).unwrap();
        let book = valeria.spellbook().unwrap();
        assert_eq!(book.casters[0].prepared_count, Some(3));
        assert!(book.casters[0].spells.iter().any(|s| s.id == "bane" && s.always));

        assert!(matches!(
            valeria.prepare_spells("cleric", &strings(&["fireball"])),
            Err(EngineError::NotOnClassList { .. })
        ));
        assert!(matches!(
            valeria.prepare_spells("cleric", &strings(&["flame-strike"])),
            Err(EngineError::SpellLevelTooHigh { level: 5, max: 4, .. })
        ));
        assert!(matches!(
            valeria.prepare_spells("cleric", &strings(&["guidance"])),
            Err(EngineError::CantripNotPrepared(_))
        ));
        let too_many: Vec<String> = valeria
            .preparation_options("cleric")
            .unwrap()
            .into_iter()
            .filter(|e| !e.always)
            .take(14)
            .map(|e| e.id)
            .collect();
        assert_eq!(
            valeria.prepare_spells("cleric", &too_many),
            Err(EngineError::PreparedLimit { limit: 13, requested: 14 })
        );
        // Всегда подготовленные не считаются в лимит.
        let mut with_domain = too_many[..13].to_vec();
        with_domain.push("blight".into());
        valeria.prepare_spells("cleric", &with_domain).unwrap();

        valeria.cast_spell(&CastRequest::new("bless")).unwrap();
        assert_eq!(valeria.prepare_spells("cleric", &list), Err(EngineError::PreparationClosed));

        let mut nikis = member("pc.nikis");
        nikis.apply_rest(RestKind::Long);
        assert!(matches!(
            nikis.prepare_spells("warlock", &list),
            Err(EngineError::NotPreparedCaster(_))
        ));
    }

    #[test]
    fn gunther_sheet_is_over_limit_and_flagged() {
        let gunther = member("npc.gunther").spellbook().unwrap();
        let paladin = &gunther.casters[0];
        assert_eq!(paladin.prepared_count, Some(7));
        assert!(paladin.over_limit);
        let options = member("npc.gunther").preparation_options("paladin").unwrap();
        assert!(options.iter().all(|e| e.level <= 2));
        assert!(options.iter().any(|e| e.id == "hold-person" && e.always));
    }

    #[test]
    fn manual_slot_changes_and_restorers() {
        let mut nikis = member("pc.nikis");
        assert_eq!(
            nikis.change_slot(SlotRef::Pact, false).unwrap_err(),
            EngineError::SlotFull("Ячейки договора (4 круг)".into())
        );
        assert_eq!(nikis.change_slot(SlotRef::Pact, true).unwrap().current(), 1);
        assert!(matches!(
            nikis.change_slot(SlotRef::Level(1), true),
            Err(EngineError::ResourceNotFound(_))
        ));
        let out = nikis.restore_slot_with("item.pact_rod.slot", SlotRef::Pact).unwrap();
        assert_eq!(out.slot.current(), 2);
        assert_eq!(out.item.current(), 0);
        nikis.change_slot(SlotRef::Pact, true).unwrap();
        assert!(matches!(
            nikis.restore_slot_with("item.pact_rod.slot", SlotRef::Pact),
            Err(EngineError::ResourceDepleted { .. })
        ));

        let mut valeria = member("npc.valeria");
        valeria.change_slot(SlotRef::Level(4), true).unwrap();
        assert!(matches!(
            valeria.restore_slot_with("item.pearl_of_power", SlotRef::Level(4)),
            Err(EngineError::RestorerLevel { max: 3, requested: 4, .. })
        ));
        assert!(matches!(
            valeria.restore_slot_with("item.pearl_of_power", SlotRef::Level(3)),
            Err(EngineError::SlotFull(_))
        ));
        valeria.change_slot(SlotRef::Level(3), true).unwrap();
        valeria.restore_slot_with("item.pearl_of_power", SlotRef::Level(3)).unwrap();
        assert_eq!(valeria.resource("slots.3").unwrap().current(), 3);
    }
}
