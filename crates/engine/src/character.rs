//! Персонаж: исходные данные и вычисляемые значения.
//!
//! Хранятся только исходные данные (значения характеристик, уровни классов, ресурсы);
//! модификаторы, бонус мастерства и инициатива вычисляются, поэтому не могут разойтись.

use crate::error::EngineError;
use crate::resource::{ResourcePool, RestKind};
use crate::spellcasting::Spellcasting;

/// Характеристика.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "snake_case"))]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Ability {
    Strength,
    Dexterity,
    Constitution,
    Intelligence,
    Wisdom,
    Charisma,
}

impl Ability {
    pub const ALL: [Ability; 6] = [
        Ability::Strength,
        Ability::Dexterity,
        Ability::Constitution,
        Ability::Intelligence,
        Ability::Wisdom,
        Ability::Charisma,
    ];

    /// Сокращение, как в листе персонажа.
    pub fn short_name(self) -> &'static str {
        match self {
            Ability::Strength => "СИЛ",
            Ability::Dexterity => "ЛОВ",
            Ability::Constitution => "ТЕЛ",
            Ability::Intelligence => "ИНТ",
            Ability::Wisdom => "МДР",
            Ability::Charisma => "ХАР",
        }
    }
}

/// Значения характеристик.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct AbilityScores {
    pub strength: u8,
    pub dexterity: u8,
    pub constitution: u8,
    pub intelligence: u8,
    pub wisdom: u8,
    pub charisma: u8,
}

impl AbilityScores {
    pub fn get(&self, ability: Ability) -> u8 {
        match ability {
            Ability::Strength => self.strength,
            Ability::Dexterity => self.dexterity,
            Ability::Constitution => self.constitution,
            Ability::Intelligence => self.intelligence,
            Ability::Wisdom => self.wisdom,
            Ability::Charisma => self.charisma,
        }
    }

    pub fn modifier(&self, ability: Ability) -> i32 {
        ability_modifier(self.get(ability))
    }
}

/// Модификатор характеристики: (значение − 10) / 2 с округлением вниз.
pub fn ability_modifier(score: u8) -> i32 {
    (i32::from(score) - 10).div_euclid(2)
}

/// Бонус мастерства по общему уровню: +2 на 1–4, +3 на 5–8, … +6 на 17–20.
pub fn proficiency_bonus(level: u32) -> i32 {
    2 + (level.clamp(1, 20) as i32 - 1) / 4
}

/// Уровень в одном классе (мультикласс — несколько записей).
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ClassLevel {
    pub class: String,
    pub subclass: Option<String>,
    pub level: u32,
}

/// Хиты.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct HitPoints {
    pub current: u32,
    pub max: u32,
    pub temporary: u32,
}

/// Роль в отряде.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "snake_case"))]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CharacterKind {
    /// Персонаж игрока.
    Player,
    /// Спутник под управлением мастера.
    Companion,
    /// Фамильяр.
    Familiar,
}

/// Персонаж (исходные данные).
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Character {
    pub id: String,
    pub kind: CharacterKind,
    pub name: String,
    pub title: String,
    pub race: String,
    pub classes: Vec<ClassLevel>,
    pub abilities: AbilityScores,
    pub hit_points: HitPoints,
    pub armor_class: i32,
    pub speed_ft: u32,
    /// Где персонаж сейчас.
    pub location: String,
    pub(crate) resources: Vec<ResourcePool>,
    /// Колдовство; `None` — персонаж не владеет магией.
    pub spellcasting: Option<Spellcasting>,
}

/// Строка характеристики в листе.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AbilityLine {
    pub ability: Ability,
    pub label: &'static str,
    pub score: u8,
    pub modifier: i32,
}

/// Лист персонажа для интерфейса: исходные данные плюс вычисленные значения.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CharacterSheet {
    pub id: String,
    pub kind: CharacterKind,
    pub name: String,
    pub title: String,
    pub race: String,
    pub location: String,
    pub classes: Vec<ClassLevel>,
    pub level: u32,
    pub proficiency_bonus: i32,
    pub abilities: Vec<AbilityLine>,
    pub hit_points: HitPoints,
    pub armor_class: i32,
    pub initiative: i32,
    pub speed_ft: u32,
    pub resources: Vec<ResourcePool>,
}

impl Character {
    /// Общий уровень (сумма уровней классов).
    pub fn level(&self) -> u32 {
        self.classes.iter().map(|c| c.level).sum()
    }

    pub fn proficiency_bonus(&self) -> i32 {
        proficiency_bonus(self.level())
    }

    pub fn initiative(&self) -> i32 {
        self.abilities.modifier(Ability::Dexterity)
    }

    pub fn resources(&self) -> &[ResourcePool] {
        &self.resources
    }

    pub fn resource(&self, id: &str) -> Option<&ResourcePool> {
        self.resources.iter().find(|r| r.id() == id)
    }

    /// Ресурс по ID; ошибка, если у персонажа его нет.
    pub fn resource_mut(&mut self, id: &str) -> Result<&mut ResourcePool, EngineError> {
        self.resources
            .iter_mut()
            .find(|r| r.id() == id)
            .ok_or_else(|| EngineError::ResourceNotFound(id.to_string()))
    }

    /// Отдых. Длительный отдых также восстанавливает хиты до максимума.
    /// Возвращает названия восстановленных ресурсов.
    pub fn apply_rest(&mut self, rest: RestKind) -> Vec<String> {
        if rest == RestKind::Long {
            self.hit_points.current = self.hit_points.max;
            if let Some(sc) = self.spellcasting.as_mut() {
                sc.can_prepare = true;
            }
        }
        self.resources
            .iter_mut()
            .filter_map(|r| r.apply_rest(rest).then(|| r.name().to_string()))
            .collect()
    }

    /// Наступление нового дня: восстанавливает ресурсы «1/день».
    pub fn apply_new_day(&mut self) -> Vec<String> {
        self.resources
            .iter_mut()
            .filter_map(|r| r.apply_new_day().then(|| r.name().to_string()))
            .collect()
    }

    /// Лист для интерфейса.
    pub fn sheet(&self) -> CharacterSheet {
        CharacterSheet {
            id: self.id.clone(),
            kind: self.kind,
            name: self.name.clone(),
            title: self.title.clone(),
            race: self.race.clone(),
            location: self.location.clone(),
            classes: self.classes.clone(),
            level: self.level(),
            proficiency_bonus: self.proficiency_bonus(),
            abilities: Ability::ALL
                .iter()
                .map(|&a| AbilityLine {
                    ability: a,
                    label: a.short_name(),
                    score: self.abilities.get(a),
                    modifier: self.abilities.modifier(a),
                })
                .collect(),
            hit_points: self.hit_points,
            armor_class: self.armor_class,
            initiative: self.initiative(),
            speed_ft: self.speed_ft,
            resources: self.resources.clone(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::fixtures::demo_nikis;
    use crate::resource::Recovery;

    #[test]
    fn ability_modifiers_round_down() {
        let cases =
            [(1, -5), (8, -1), (9, -1), (10, 0), (11, 0), (12, 1), (15, 2), (19, 4), (20, 5)];
        for (score, expected) in cases {
            assert_eq!(ability_modifier(score), expected, "значение {score}");
        }
    }

    #[test]
    fn proficiency_by_level() {
        let cases = [(1, 2), (4, 2), (5, 3), (8, 3), (9, 4), (10, 4), (13, 5), (17, 6), (20, 6)];
        for (level, expected) in cases {
            assert_eq!(proficiency_bonus(level), expected, "уровень {level}");
        }
    }

    #[test]
    fn nikis_derived_values_match_sheet() {
        let nikis = demo_nikis();
        assert_eq!(nikis.level(), 10);
        assert_eq!(nikis.proficiency_bonus(), 4);
        assert_eq!(nikis.initiative(), 2);
        let sheet = nikis.sheet();
        let mods: Vec<i32> = sheet.abilities.iter().map(|a| a.modifier).collect();
        assert_eq!(mods, vec![1, 2, 0, 4, 1, 2]);
        assert_eq!(sheet.abilities[3].label, "ИНТ");
        assert_eq!(nikis.resource("feat.lucky").unwrap().to_string(), "Везунчик 3/3");
    }

    #[test]
    fn rests_follow_resource_rules() {
        let mut nikis = demo_nikis();
        nikis.hit_points.current = 20;
        nikis.resource_mut("feat.lucky").unwrap().spend(2).unwrap();
        nikis.resource_mut("pact.slots").unwrap().spend(2).unwrap();

        let restored = nikis.apply_rest(RestKind::Short);
        assert_eq!(restored, vec!["Ячейки договора (4 круг)".to_string()]);
        assert_eq!(nikis.resource("feat.lucky").unwrap().current(), 1);
        assert_eq!(nikis.hit_points.current, 20);

        let restored = nikis.apply_rest(RestKind::Long);
        assert!(restored.contains(&"Везунчик".to_string()));
        assert_eq!(nikis.resource("feat.lucky").unwrap().current(), 3);
        assert_eq!(nikis.hit_points.current, nikis.hit_points.max);
    }

    #[test]
    fn missing_resource_is_an_error() {
        let mut c = Character {
            id: "test".into(),
            kind: CharacterKind::Player,
            name: "Тест".into(),
            title: String::new(),
            race: "Человек".into(),
            classes: vec![ClassLevel { class: "Воин".into(), subclass: None, level: 1 }],
            abilities: AbilityScores {
                strength: 10,
                dexterity: 10,
                constitution: 10,
                intelligence: 10,
                wisdom: 10,
                charisma: 10,
            },
            hit_points: HitPoints { current: 10, max: 10, temporary: 0 },
            armor_class: 10,
            speed_ft: 30,
            location: "Тестовая".into(),
            resources: vec![ResourcePool::new("x", "X", 1, Recovery::Manual)],
            spellcasting: None,
        };
        assert_eq!(
            c.resource_mut("feat.lucky"),
            Err(EngineError::ResourceNotFound("feat.lucky".into()))
        );
        assert!(c.resource_mut("x").is_ok());
    }
}
