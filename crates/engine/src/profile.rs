//! Полный лист персонажа: спасброски, навыки, атаки, умения, владения, настройка,
//! состояния и кости хитов.
//!
//! Хранятся исходные данные (владения, бонусы предметов, кости атак), а итоговые числа
//! движок считает сам и показывает, из чего они сложены, например
//! «Ловкость рук +15 = ЛОВ +2 + компетентность +8 + Перчатки Воровства +5».

use crate::character::{Ability, Character};
use crate::error::EngineError;

/// Навык.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "snake_case"))]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Skill {
    Acrobatics,
    AnimalHandling,
    Arcana,
    Athletics,
    Deception,
    History,
    Insight,
    Intimidation,
    Investigation,
    Medicine,
    Nature,
    Perception,
    Performance,
    Persuasion,
    Religion,
    SleightOfHand,
    Stealth,
    Survival,
}

impl Skill {
    pub const ALL: [Skill; 18] = [
        Skill::Athletics,
        Skill::Acrobatics,
        Skill::SleightOfHand,
        Skill::Stealth,
        Skill::Arcana,
        Skill::History,
        Skill::Investigation,
        Skill::Nature,
        Skill::Religion,
        Skill::AnimalHandling,
        Skill::Insight,
        Skill::Medicine,
        Skill::Perception,
        Skill::Survival,
        Skill::Deception,
        Skill::Intimidation,
        Skill::Performance,
        Skill::Persuasion,
    ];

    pub fn ability(self) -> Ability {
        match self {
            Skill::Athletics => Ability::Strength,
            Skill::Acrobatics | Skill::SleightOfHand | Skill::Stealth => Ability::Dexterity,
            Skill::Arcana
            | Skill::History
            | Skill::Investigation
            | Skill::Nature
            | Skill::Religion => Ability::Intelligence,
            Skill::AnimalHandling
            | Skill::Insight
            | Skill::Medicine
            | Skill::Perception
            | Skill::Survival => Ability::Wisdom,
            Skill::Deception | Skill::Intimidation | Skill::Performance | Skill::Persuasion => {
                Ability::Charisma
            }
        }
    }

    pub fn name(self) -> &'static str {
        match self {
            Skill::Acrobatics => "Акробатика",
            Skill::AnimalHandling => "Уход за животными",
            Skill::Arcana => "Магия",
            Skill::Athletics => "Атлетика",
            Skill::Deception => "Обман",
            Skill::History => "История",
            Skill::Insight => "Проницательность",
            Skill::Intimidation => "Запугивание",
            Skill::Investigation => "Анализ",
            Skill::Medicine => "Медицина",
            Skill::Nature => "Природа",
            Skill::Perception => "Внимательность",
            Skill::Performance => "Выступление",
            Skill::Persuasion => "Убеждение",
            Skill::Religion => "Религия",
            Skill::SleightOfHand => "Ловкость рук",
            Skill::Stealth => "Скрытность",
            Skill::Survival => "Выживание",
        }
    }
}

/// Степень владения.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "snake_case"))]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum Proficiency {
    #[default]
    None,
    Proficient,
    Expertise,
}

/// Слагаемое итогового значения.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Bonus {
    pub label: String,
    pub value: i32,
}

impl Bonus {
    pub fn new(label: &str, value: i32) -> Self {
        Self { label: label.into(), value }
    }
}

/// Данные одного навыка (навыки без записи — просто модификатор характеристики).
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SkillEntry {
    pub skill: Skill,
    pub proficiency: Proficiency,
    /// Откуда владение: «Плут: компетентность», «Шёпот мертвецов».
    pub source: String,
    pub bonuses: Vec<Bonus>,
    /// Условные преимущества: «в темноте и полумраке — Плащ Теневого Савана».
    pub advantage: Vec<String>,
}

/// Атака оружием или заклинанием.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Attack {
    pub name: String,
    /// Характеристика атаки и урона; для атаки заклинанием — `None` (берётся класс).
    pub ability: Option<Ability>,
    /// ID класса-заклинателя для атак заклинанием.
    pub caster_id: Option<String>,
    /// Владение: `None` — в листе не указано (бонус мастерства не прибавляется).
    pub proficient: Option<bool>,
    /// Магический бонус оружия (+1, +2, +3).
    pub magic: i32,
    /// Кость урона: «1d8», «1d10».
    pub damage_dice: String,
    pub damage_type: String,
    /// Прибавлять ли модификатор характеристики к урону.
    pub add_ability_to_damage: bool,
    /// Прочие бонусы к урону (боевой стиль «Дуэлянт» и т. п.).
    pub damage_bonus: i32,
    /// Дополнительный урон и свойства: «+ 2d8 силовым/некротическим».
    pub extra: String,
    pub range: String,
    pub notes: String,
}

/// Умение класса, расы, черта или воззвание.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Feature {
    pub name: String,
    /// «Колдун 1», «Черта», «Воззвание».
    pub source: String,
    pub text: String,
    /// Пул ресурса, если у умения есть заряды.
    pub resource_id: Option<String>,
}

/// Строка владений: доспехи, оружие, инструменты, языки.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ProficiencyLine {
    pub kind: String,
    pub text: String,
    /// Взято по правилам класса, а не из листа.
    pub from_rules: bool,
}

/// Настроенный предмет.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Attunement {
    pub name: String,
    pub effect: String,
}

/// Кости хитов одного размера.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct HitDice {
    pub die: u32,
    pub current: u32,
    pub total: u32,
}

/// Состояния 5e (истощение хранится отдельно уровнем).
pub const CONDITIONS: [&str; 14] = [
    "Ослеплён",
    "Очарован",
    "Оглох",
    "Испуган",
    "Схвачен",
    "Недееспособен",
    "Невидим",
    "Парализован",
    "Окаменел",
    "Отравлен",
    "Лежит ничком",
    "Опутан",
    "Ошеломлён",
    "Без сознания",
];

/// Полный лист (исходные данные).
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq, Default)]
pub struct Profile {
    pub background: String,
    pub alignment: String,
    pub xp: Option<u32>,
    pub xp_next: Option<u32>,
    pub appearance: String,
    pub save_proficiencies: Vec<Ability>,
    /// Бонусы ко всем спасброскам (Аура Защиты, Кольцо Защиты).
    pub save_bonuses: Vec<Bonus>,
    pub save_notes: Vec<String>,
    /// Указаны ли навыки в листе (иначе навыки — просто модификаторы характеристик).
    pub skills_listed: bool,
    pub skills: Vec<SkillEntry>,
    pub initiative_bonuses: Vec<Bonus>,
    pub armor_class_breakdown: Vec<Bonus>,
    pub hit_dice: Vec<HitDice>,
    pub attacks: Vec<Attack>,
    pub features: Vec<Feature>,
    pub proficiencies: Vec<ProficiencyLine>,
    pub attunement: Vec<Attunement>,
    pub attunement_note: String,
    /// Текущие состояния (меняет мастер или игрок).
    pub conditions: Vec<String>,
    pub exhaustion: u8,
    /// Расхождения листа с правилами, найденные при переносе.
    pub notes: Vec<String>,
}

/// Строка спасброска.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SaveLine {
    pub ability: Ability,
    pub label: &'static str,
    pub total: i32,
    pub proficient: bool,
    pub breakdown: Vec<Bonus>,
}

/// Строка навыка.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SkillLine {
    pub skill: Skill,
    pub name: &'static str,
    pub ability_label: &'static str,
    pub total: i32,
    pub proficiency: Proficiency,
    pub source: String,
    pub breakdown: Vec<Bonus>,
    pub advantage: Vec<String>,
    pub passive: i32,
}

/// Строка атаки.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct AttackLine {
    pub name: String,
    pub to_hit: i32,
    pub to_hit_breakdown: Vec<Bonus>,
    pub damage: String,
    pub range: String,
    pub notes: String,
    /// Владение не указано в листе.
    pub proficiency_unknown: bool,
}

/// Вычисленный полный лист.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SheetDetails {
    pub background: String,
    pub alignment: String,
    pub xp: Option<u32>,
    pub xp_next: Option<u32>,
    pub appearance: String,
    pub saves: Vec<SaveLine>,
    pub save_notes: Vec<String>,
    pub skills_listed: bool,
    pub skills: Vec<SkillLine>,
    pub passive_perception: i32,
    pub passive_insight: i32,
    pub passive_investigation: i32,
    pub initiative_breakdown: Vec<Bonus>,
    pub armor_class_breakdown: Vec<Bonus>,
    pub hit_dice: Vec<HitDice>,
    pub attacks: Vec<AttackLine>,
    pub features: Vec<Feature>,
    pub proficiencies: Vec<ProficiencyLine>,
    pub attunement: Vec<Attunement>,
    pub attunement_note: String,
    pub conditions: Vec<String>,
    pub exhaustion: u8,
    pub notes: Vec<String>,
}

fn signed(v: i32) -> String {
    if v >= 0 {
        format!("+{v}")
    } else {
        format!("−{}", v.abs())
    }
}

impl Character {
    fn ability_bonus(&self, ability: Ability) -> Bonus {
        Bonus::new(ability.short_name(), self.abilities.modifier(ability))
    }

    /// Спасброски с разбивкой.
    pub fn saves(&self) -> Vec<SaveLine> {
        let pb = self.proficiency_bonus();
        Ability::ALL
            .into_iter()
            .map(|a| {
                let proficient = self.profile.save_proficiencies.contains(&a);
                let mut breakdown = vec![self.ability_bonus(a)];
                if proficient {
                    breakdown.push(Bonus::new("владение", pb));
                }
                breakdown.extend(self.profile.save_bonuses.iter().cloned());
                SaveLine {
                    ability: a,
                    label: a.short_name(),
                    total: breakdown.iter().map(|b| b.value).sum(),
                    proficient,
                    breakdown,
                }
            })
            .collect()
    }

    /// Навыки с разбивкой.
    pub fn skills(&self) -> Vec<SkillLine> {
        let pb = self.proficiency_bonus();
        Skill::ALL
            .into_iter()
            .map(|skill| {
                let entry = self.profile.skills.iter().find(|e| e.skill == skill);
                let proficiency = entry.map_or(Proficiency::None, |e| e.proficiency);
                let mut breakdown = vec![self.ability_bonus(skill.ability())];
                match proficiency {
                    Proficiency::Proficient => breakdown.push(Bonus::new("владение", pb)),
                    Proficiency::Expertise => breakdown.push(Bonus::new("компетентность", pb * 2)),
                    Proficiency::None => {}
                }
                if let Some(e) = entry {
                    breakdown.extend(e.bonuses.iter().cloned());
                }
                let total: i32 = breakdown.iter().map(|b| b.value).sum();
                let advantage = entry.map(|e| e.advantage.clone()).unwrap_or_default();
                SkillLine {
                    skill,
                    name: skill.name(),
                    ability_label: skill.ability().short_name(),
                    total,
                    proficiency,
                    source: entry.map(|e| e.source.clone()).unwrap_or_default(),
                    breakdown,
                    advantage,
                    passive: 10 + total,
                }
            })
            .collect()
    }

    /// Итог навыка.
    pub fn skill_total(&self, skill: Skill) -> i32 {
        self.skills().into_iter().find(|s| s.skill == skill).map_or(0, |s| s.total)
    }

    fn attack_line(&self, attack: &Attack) -> AttackLine {
        let pb = self.proficiency_bonus();
        let mut breakdown = Vec::new();
        let mut damage_mod = 0;
        if let Some(caster_id) = &attack.caster_id {
            let caster = self
                .spellcasting
                .as_ref()
                .and_then(|sc| sc.casters.iter().find(|c| &c.id == caster_id));
            if let Some(c) = caster {
                breakdown.push(self.ability_bonus(c.ability));
                breakdown.push(Bonus::new("владение", pb));
                if c.item_bonus != 0 {
                    breakdown.push(Bonus::new(&c.item_bonus_source, c.item_bonus));
                }
                if attack.add_ability_to_damage {
                    damage_mod += self.abilities.modifier(c.ability);
                }
            }
        } else if let Some(ability) = attack.ability {
            breakdown.push(self.ability_bonus(ability));
            if attack.proficient == Some(true) {
                breakdown.push(Bonus::new("владение", pb));
            }
            if attack.magic != 0 {
                breakdown.push(Bonus::new("магия оружия", attack.magic));
            }
            if attack.add_ability_to_damage {
                damage_mod += self.abilities.modifier(ability);
            }
            damage_mod += attack.magic;
        }
        damage_mod += attack.damage_bonus;
        let mut damage = attack.damage_dice.clone();
        if damage_mod != 0 {
            damage.push_str(&signed(damage_mod));
        }
        damage.push(' ');
        damage.push_str(&attack.damage_type);
        if !attack.extra.is_empty() {
            damage.push(' ');
            damage.push_str(&attack.extra);
        }
        AttackLine {
            name: attack.name.clone(),
            to_hit: breakdown.iter().map(|b| b.value).sum(),
            to_hit_breakdown: breakdown,
            damage,
            range: attack.range.clone(),
            notes: attack.notes.clone(),
            proficiency_unknown: attack.caster_id.is_none() && attack.proficient.is_none(),
        }
    }

    /// Полный лист с вычисленными значениями.
    pub fn details(&self) -> SheetDetails {
        let p = &self.profile;
        let skills = self.skills();
        let passive = |s: Skill| skills.iter().find(|l| l.skill == s).map_or(10, |l| l.passive);
        let mut initiative_breakdown = vec![self.ability_bonus(Ability::Dexterity)];
        initiative_breakdown.extend(p.initiative_bonuses.iter().cloned());
        SheetDetails {
            background: p.background.clone(),
            alignment: p.alignment.clone(),
            xp: p.xp,
            xp_next: p.xp_next,
            appearance: p.appearance.clone(),
            saves: self.saves(),
            save_notes: p.save_notes.clone(),
            skills_listed: p.skills_listed,
            passive_perception: passive(Skill::Perception),
            passive_insight: passive(Skill::Insight),
            passive_investigation: passive(Skill::Investigation),
            skills,
            initiative_breakdown,
            armor_class_breakdown: p.armor_class_breakdown.clone(),
            hit_dice: p.hit_dice.clone(),
            attacks: p.attacks.iter().map(|a| self.attack_line(a)).collect(),
            features: p.features.clone(),
            proficiencies: p.proficiencies.clone(),
            attunement: p.attunement.clone(),
            attunement_note: p.attunement_note.clone(),
            conditions: p.conditions.clone(),
            exhaustion: p.exhaustion,
            notes: p.notes.clone(),
        }
    }

    /// Добавляет или снимает состояние. Истощение задаётся как «Истощение N» (0–6).
    pub fn set_condition(&mut self, condition: &str, active: bool) -> Result<String, EngineError> {
        let name = condition.trim();
        let lower = name.to_lowercase();
        if let Some(rest) = lower.strip_prefix("истощение") {
            let level: u8 = rest.trim().parse().unwrap_or(if active { 1 } else { 0 });
            if level > 6 {
                return Err(EngineError::UnknownCondition(name.to_string()));
            }
            self.profile.exhaustion = if active { level } else { 0 };
            return Ok(format!("{}: истощение {}", self.name, self.profile.exhaustion));
        }
        let canonical = CONDITIONS
            .iter()
            .find(|c| c.to_lowercase() == lower || c.to_lowercase().starts_with(&lower))
            .ok_or_else(|| EngineError::UnknownCondition(name.to_string()))?;
        let list = &mut self.profile.conditions;
        if active {
            if !list.iter().any(|c| c == canonical) {
                list.push((*canonical).to_string());
            }
            Ok(format!("{}: состояние «{canonical}»", self.name))
        } else {
            list.retain(|c| c != canonical);
            Ok(format!("{}: снято состояние «{canonical}»", self.name))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::fixtures::demo_party;

    fn member(id: &str) -> Character {
        demo_party().into_iter().find(|c| c.id == id).unwrap()
    }

    #[test]
    fn nikis_skills_match_sheet() {
        let nikis = member("pc.nikis");
        let total = |s| nikis.skill_total(s);
        assert_eq!(total(Skill::SleightOfHand), 15);
        assert_eq!(total(Skill::Deception), 10);
        assert_eq!(total(Skill::Stealth), 6);
        assert_eq!(total(Skill::Perception), 5);
        assert_eq!(total(Skill::Insight), 5);
        assert_eq!(total(Skill::Persuasion), 6);
        assert_eq!(total(Skill::Investigation), 4);
        assert_eq!(total(Skill::Athletics), 1);
        let details = nikis.details();
        assert_eq!(details.passive_perception, 15);
        let hand = details.skills.iter().find(|s| s.skill == Skill::SleightOfHand).unwrap();
        let labels: Vec<&str> = hand.breakdown.iter().map(|b| b.label.as_str()).collect();
        assert_eq!(labels, vec!["ЛОВ", "компетентность", "Перчатки Воровства"]);
        let stealth = details.skills.iter().find(|s| s.skill == Skill::Stealth).unwrap();
        assert_eq!(stealth.advantage.len(), 2);
    }

    #[test]
    fn saves_match_sheets() {
        let totals = |id: &str| member(id).saves().iter().map(|s| s.total).collect::<Vec<_>>();
        assert_eq!(totals("pc.nikis"), vec![1, 6, 0, 4, 1, 6]);
        assert_eq!(totals("npc.corvus"), vec![4, 6, 2, 0, 3, -1]);
        assert_eq!(totals("npc.gunther"), vec![6, 2, 4, 2, 6, 7]);
        assert_eq!(totals("npc.valeria"), vec![1, 1, 2, 1, 8, 3]);
        assert_eq!(totals("npc.brokk"), vec![7, 1, 6, 0, 1, -1]);
    }

    #[test]
    fn attacks_are_computed() {
        let nikis = member("pc.nikis").details();
        let blade = nikis.attacks.iter().find(|a| a.name.starts_with("Клинок")).unwrap();
        assert_eq!(blade.to_hit, 9);
        assert!(blade.damage.starts_with("1d8+5"));
        let blast = nikis.attacks.iter().find(|a| a.name.starts_with("Мистический")).unwrap();
        assert_eq!(blast.to_hit, 8);
        let crossbow = nikis.attacks.iter().find(|a| a.name.contains("арбалет")).unwrap();
        assert_eq!(crossbow.to_hit, 2);
        assert!(!crossbow.proficiency_unknown);
        let pistol = nikis.attacks.iter().find(|a| a.name.contains("пистоль")).unwrap();
        assert_eq!(pistol.to_hit, 3);
        let gunther = member("npc.gunther").details();
        assert_eq!(gunther.attacks[0].to_hit, 8);
        let brokk = member("npc.brokk").details();
        assert_eq!(brokk.attacks[0].to_hit, 8);
    }

    #[test]
    fn conditions_and_exhaustion() {
        let mut nikis = member("pc.nikis");
        nikis.set_condition("отравлен", true).unwrap();
        nikis.set_condition("Отравлен", true).unwrap();
        assert_eq!(nikis.profile.conditions, vec!["Отравлен".to_string()]);
        nikis.set_condition("Истощение 2", true).unwrap();
        assert_eq!(nikis.profile.exhaustion, 2);
        nikis.set_condition("отравлен", false).unwrap();
        assert!(nikis.profile.conditions.is_empty());
        assert!(nikis.set_condition("Окрылён", true).is_err());
    }
}
