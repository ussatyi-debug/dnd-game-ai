//! Каталог заклинаний: метаданные, нужные движку для проверок (круг, ритуал,
//! концентрация, списки классов). Полные описания живут в интерфейсе; оба каталога
//! собираются из одних исходных данных скриптом `scripts/build-spells.ts`.

use crate::spell_catalog::SPELLS;

pub(crate) const C_BARD: u8 = 1 << 0;
pub(crate) const C_CLERIC: u8 = 1 << 1;
pub(crate) const C_DRUID: u8 = 1 << 2;
pub(crate) const C_PALADIN: u8 = 1 << 3;
pub(crate) const C_RANGER: u8 = 1 << 4;
pub(crate) const C_SORCERER: u8 = 1 << 5;
pub(crate) const C_WARLOCK: u8 = 1 << 6;
pub(crate) const C_WIZARD: u8 = 1 << 7;

/// Класс со своим списком заклинаний.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "snake_case"))]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum SpellClass {
    Bard,
    Cleric,
    Druid,
    Paladin,
    Ranger,
    Sorcerer,
    Warlock,
    Wizard,
}

impl SpellClass {
    pub const ALL: [SpellClass; 8] = [
        SpellClass::Bard,
        SpellClass::Cleric,
        SpellClass::Druid,
        SpellClass::Paladin,
        SpellClass::Ranger,
        SpellClass::Sorcerer,
        SpellClass::Warlock,
        SpellClass::Wizard,
    ];

    fn bit(self) -> u8 {
        match self {
            SpellClass::Bard => C_BARD,
            SpellClass::Cleric => C_CLERIC,
            SpellClass::Druid => C_DRUID,
            SpellClass::Paladin => C_PALADIN,
            SpellClass::Ranger => C_RANGER,
            SpellClass::Sorcerer => C_SORCERER,
            SpellClass::Warlock => C_WARLOCK,
            SpellClass::Wizard => C_WIZARD,
        }
    }

    /// Название списка: «колдуна», «жреца».
    pub fn genitive(self) -> &'static str {
        match self {
            SpellClass::Bard => "барда",
            SpellClass::Cleric => "жреца",
            SpellClass::Druid => "друида",
            SpellClass::Paladin => "паладина",
            SpellClass::Ranger => "следопыта",
            SpellClass::Sorcerer => "чародея",
            SpellClass::Warlock => "колдуна",
            SpellClass::Wizard => "волшебника",
        }
    }
}

/// Метаданные заклинания.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct SpellMeta {
    pub id: &'static str,
    pub name: &'static str,
    /// 0 — заговор.
    pub level: u8,
    pub ritual: bool,
    pub concentration: bool,
    #[cfg_attr(feature = "serde", serde(skip))]
    pub(crate) classes: u8,
    /// Из SRD 5.1 (иначе — заклинание вне SRD, описанное своими словами).
    pub srd: bool,
}

impl SpellMeta {
    /// Есть ли заклинание в базовом списке класса.
    pub fn on_list(&self, class: SpellClass) -> bool {
        self.classes & class.bit() != 0
    }

    pub fn classes(&self) -> impl Iterator<Item = SpellClass> + '_ {
        SpellClass::ALL.into_iter().filter(|c| self.on_list(*c))
    }

    pub fn is_cantrip(&self) -> bool {
        self.level == 0
    }
}

/// Все заклинания каталога (отсортированы по ID).
pub fn all_spells() -> &'static [SpellMeta] {
    SPELLS
}

/// Заклинание по ID.
pub fn spell(id: &str) -> Option<&'static SpellMeta> {
    SPELLS.binary_search_by(|s| s.id.cmp(id)).ok().map(|i| &SPELLS[i])
}

/// Базовый список класса.
pub fn class_list(class: SpellClass) -> impl Iterator<Item = &'static SpellMeta> {
    SPELLS.iter().filter(move |s| s.on_list(class))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn catalog_is_sorted_and_unique() {
        assert!(SPELLS.len() >= 319);
        assert!(SPELLS.windows(2).all(|w| w[0].id < w[1].id));
    }

    #[test]
    fn lookup_and_lists() {
        let fireball = spell("fireball").unwrap();
        assert_eq!(fireball.name, "Огненный шар");
        assert_eq!(fireball.level, 3);
        assert!(fireball.on_list(SpellClass::Wizard));
        assert!(!fireball.on_list(SpellClass::Warlock));
        assert!(spell("detect-magic").unwrap().ritual);
        assert!(spell("bless").unwrap().concentration);
        assert!(spell("nonexistent").is_none());

        let agathys = spell("armor-of-agathys").unwrap();
        assert!(!agathys.srd);
        assert_eq!(agathys.classes().collect::<Vec<_>>(), vec![SpellClass::Warlock]);

        assert!(class_list(SpellClass::Paladin).all(|s| s.level <= 5));
        assert!(class_list(SpellClass::Cleric).any(|s| s.id == "spirit-guardians"));
    }
}
