//! Броски d20: проверки характеристик, спасброски, атаки.
//!
//! - Преимущество и помеха: бросаются два d20, берётся больший/меньший; при наличии
//!   обоих они взаимно гасятся (правило 5e).
//! - Модификаторы хранятся по отдельности с подписью, чтобы игрок видел разбивку.
//! - Порог крита настраивается: обычно 20, у Великого Окуляра для заклинаний — 19.

use crate::error::EngineError;
use crate::rng::DiceRng;

/// Режим броска d20.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "snake_case"))]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum RollMode {
    #[default]
    Normal,
    Advantage,
    Disadvantage,
}

impl RollMode {
    /// Итоговый режим по наличию источников преимущества и помехи.
    pub fn from_flags(advantage: bool, disadvantage: bool) -> Self {
        match (advantage, disadvantage) {
            (true, false) => Self::Advantage,
            (false, true) => Self::Disadvantage,
            _ => Self::Normal,
        }
    }
}

/// Модификатор броска с подписью: «ЛОВ», «Мастерство», «Перчатки Воровства».
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Modifier {
    pub label: String,
    pub value: i32,
}

impl Modifier {
    pub fn new(label: impl Into<String>, value: i32) -> Self {
        Self { label: label.into(), value }
    }
}

/// Кто бросил куб.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "snake_case"))]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RollSource {
    /// Генератор движка (NPC, враги, спутники, виртуальные кубы игрока).
    Engine,
    /// Значение заявлено игроком (настоящие кубы).
    Player,
}

/// Результат атаки.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "snake_case"))]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AttackResult {
    CriticalHit,
    Hit,
    Miss,
    /// Натуральная 1 — автоматический промах.
    CriticalMiss,
}

/// Бросок d20 с полной разбивкой.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct D20Roll {
    pub mode: RollMode,
    /// Все выпавшие кубы (один или два).
    pub dice: Vec<u32>,
    /// Засчитанное значение куба.
    pub natural: u32,
    pub modifiers: Vec<Modifier>,
    pub modifier_total: i32,
    pub total: i32,
    pub crit_threshold: u32,
    /// Натуральное значение не ниже порога крита.
    pub critical: bool,
    /// Натуральная 1.
    pub fumble: bool,
    pub source: RollSource,
    /// Был ли использован переброс чертой «Везунчик».
    pub lucky_used: bool,
}

impl D20Roll {
    /// Проверка против Класса Сложности: успех при итоге не ниже КС.
    /// Для проверок и спасбросков натуральные 1 и 20 не дают автоматического результата.
    pub fn meets_dc(&self, dc: i32) -> bool {
        self.total >= dc
    }

    /// Атака против Класса Доспеха: натуральная 1 — промах, крит — попадание,
    /// иначе попадание при итоге не ниже КД.
    pub fn attack_result(&self, armor_class: i32) -> AttackResult {
        if self.fumble {
            AttackResult::CriticalMiss
        } else if self.critical {
            AttackResult::CriticalHit
        } else if self.total >= armor_class {
            AttackResult::Hit
        } else {
            AttackResult::Miss
        }
    }

    /// Текстовая разбивка для лога: «d20: 16 (везунчик) + ЛОВ 2 + Мастерство 4 = 22».
    pub fn breakdown(&self) -> String {
        let mut text = match self.mode {
            RollMode::Normal => format!("d20: {}", self.natural),
            RollMode::Advantage => {
                format!("d20 с преимуществом {:?} → {}", self.dice, self.natural)
            }
            RollMode::Disadvantage => format!("d20 с помехой {:?} → {}", self.dice, self.natural),
        };
        if self.lucky_used {
            text.push_str(" (везунчик)");
        }
        for m in &self.modifiers {
            let sign = if m.value < 0 { '-' } else { '+' };
            text.push_str(&format!(" {sign} {} {}", m.label, m.value.unsigned_abs()));
        }
        text.push_str(&format!(" = {}", self.total));
        if self.critical {
            text.push_str(" — КРИТ");
        } else if self.fumble {
            text.push_str(" — натуральная 1");
        }
        text
    }
}

/// Бросок d20 генератором движка.
pub fn roll_d20<R: DiceRng + ?Sized>(
    rng: &mut R,
    mode: RollMode,
    modifiers: Vec<Modifier>,
    crit_threshold: u32,
) -> Result<D20Roll, EngineError> {
    validate_crit_threshold(crit_threshold)?;
    let dice = match mode {
        RollMode::Normal => vec![rng.roll_die(20)],
        RollMode::Advantage | RollMode::Disadvantage => vec![rng.roll_die(20), rng.roll_die(20)],
    };
    let natural = match mode {
        RollMode::Normal => dice[0],
        RollMode::Advantage => dice[0].max(dice[1]),
        RollMode::Disadvantage => dice[0].min(dice[1]),
    };
    Ok(build(mode, dice, natural, modifiers, crit_threshold, RollSource::Engine, false))
}

/// Бросок d20, значение которого заявил игрок (засчитанный куб после преимущества,
/// помехи или переброса). Движок только проверяет значение и применяет модификаторы.
pub fn player_d20(
    natural: u32,
    mode: RollMode,
    modifiers: Vec<Modifier>,
    crit_threshold: u32,
    lucky_used: bool,
) -> Result<D20Roll, EngineError> {
    validate_crit_threshold(crit_threshold)?;
    if !(1..=20).contains(&natural) {
        return Err(EngineError::DieValueOutOfRange { value: natural, sides: 20 });
    }
    Ok(build(
        mode,
        vec![natural],
        natural,
        modifiers,
        crit_threshold,
        RollSource::Player,
        lucky_used,
    ))
}

fn validate_crit_threshold(threshold: u32) -> Result<(), EngineError> {
    if (2..=20).contains(&threshold) {
        Ok(())
    } else {
        Err(EngineError::InvalidCritThreshold(threshold))
    }
}

fn build(
    mode: RollMode,
    dice: Vec<u32>,
    natural: u32,
    modifiers: Vec<Modifier>,
    crit_threshold: u32,
    source: RollSource,
    lucky_used: bool,
) -> D20Roll {
    let modifier_total: i32 = modifiers.iter().map(|m| m.value).sum();
    D20Roll {
        mode,
        dice,
        natural,
        modifier_total,
        total: natural as i32 + modifier_total,
        crit_threshold,
        critical: natural >= crit_threshold,
        fumble: natural == 1,
        modifiers,
        source,
        lucky_used,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::rng::{ScriptedRng, Xoshiro256};

    fn mods() -> Vec<Modifier> {
        vec![Modifier::new("ЛОВ", 2), Modifier::new("Мастерство", 4)]
    }

    #[test]
    fn normal_roll_applies_modifiers() {
        let mut rng = ScriptedRng::new(&[12]);
        let r = roll_d20(&mut rng, RollMode::Normal, mods(), 20).unwrap();
        assert_eq!(r.dice, vec![12]);
        assert_eq!(r.natural, 12);
        assert_eq!(r.modifier_total, 6);
        assert_eq!(r.total, 18);
        assert!(!r.critical && !r.fumble);
        assert_eq!(r.source, RollSource::Engine);
    }

    #[test]
    fn advantage_takes_higher_disadvantage_lower() {
        let mut rng = ScriptedRng::new(&[5, 17, 5, 17]);
        let adv = roll_d20(&mut rng, RollMode::Advantage, vec![], 20).unwrap();
        assert_eq!((adv.dice.clone(), adv.natural), (vec![5, 17], 17));
        let dis = roll_d20(&mut rng, RollMode::Disadvantage, vec![], 20).unwrap();
        assert_eq!((dis.dice.clone(), dis.natural), (vec![5, 17], 5));
    }

    #[test]
    fn advantage_and_disadvantage_cancel() {
        assert_eq!(RollMode::from_flags(true, true), RollMode::Normal);
        assert_eq!(RollMode::from_flags(true, false), RollMode::Advantage);
        assert_eq!(RollMode::from_flags(false, true), RollMode::Disadvantage);
        assert_eq!(RollMode::from_flags(false, false), RollMode::Normal);
    }

    #[test]
    fn critical_and_fumble_detection() {
        let mut rng = ScriptedRng::new(&[20, 1, 19]);
        assert!(roll_d20(&mut rng, RollMode::Normal, vec![], 20).unwrap().critical);
        assert!(roll_d20(&mut rng, RollMode::Normal, vec![], 20).unwrap().fumble);
        // Великий Окуляр: крит заклинаниями на 19–20.
        assert!(roll_d20(&mut rng, RollMode::Normal, vec![], 19).unwrap().critical);
    }

    #[test]
    fn attack_resolution() {
        let hit =
            player_d20(10, RollMode::Normal, vec![Modifier::new("Атака", 8)], 20, false).unwrap();
        assert_eq!(hit.attack_result(18), AttackResult::Hit);
        assert_eq!(hit.attack_result(19), AttackResult::Miss);

        // Натуральная 1 промахивается даже при огромном бонусе.
        let one =
            player_d20(1, RollMode::Normal, vec![Modifier::new("Атака", 30)], 20, false).unwrap();
        assert_eq!(one.attack_result(10), AttackResult::CriticalMiss);

        // Крит попадает даже по недосягаемому КД.
        let crit = player_d20(19, RollMode::Normal, vec![], 19, false).unwrap();
        assert_eq!(crit.attack_result(40), AttackResult::CriticalHit);
    }

    #[test]
    fn checks_have_no_automatic_success() {
        let nat20 =
            player_d20(20, RollMode::Normal, vec![Modifier::new("СИЛ", -1)], 20, false).unwrap();
        assert!(!nat20.meets_dc(20));
        assert!(nat20.meets_dc(19));
    }

    #[test]
    fn player_roll_validation() {
        assert_eq!(
            player_d20(21, RollMode::Normal, vec![], 20, false),
            Err(EngineError::DieValueOutOfRange { value: 21, sides: 20 })
        );
        assert_eq!(
            player_d20(0, RollMode::Normal, vec![], 20, false),
            Err(EngineError::DieValueOutOfRange { value: 0, sides: 20 })
        );
        let r = player_d20(16, RollMode::Advantage, mods(), 20, true).unwrap();
        assert_eq!(r.source, RollSource::Player);
        assert!(r.lucky_used);
        assert_eq!(r.total, 22);
    }

    #[test]
    fn crit_threshold_validation() {
        let mut rng = Xoshiro256::from_seed(1);
        for bad in [0, 1, 21] {
            assert_eq!(
                roll_d20(&mut rng, RollMode::Normal, vec![], bad),
                Err(EngineError::InvalidCritThreshold(bad))
            );
        }
    }

    #[test]
    fn breakdown_text() {
        let r = player_d20(16, RollMode::Normal, vec![Modifier::new("Скрытность", 6)], 20, true)
            .unwrap();
        assert_eq!(r.breakdown(), "d20: 16 (везунчик) + Скрытность 6 = 22");

        let mut rng = ScriptedRng::new(&[20, 3]);
        let r =
            roll_d20(&mut rng, RollMode::Advantage, vec![Modifier::new("СИЛ", -1)], 20).unwrap();
        assert_eq!(r.breakdown(), "d20 с преимуществом [20, 3] → 20 - СИЛ 1 = 19 — КРИТ");
    }

    #[test]
    fn advantage_raises_average() {
        let mut rng = Xoshiro256::from_seed(11);
        let n = 20_000;
        let avg = |mode, rng: &mut Xoshiro256| {
            (0..n).map(|_| roll_d20(rng, mode, vec![], 20).unwrap().natural as f64).sum::<f64>()
                / n as f64
        };
        let normal = avg(RollMode::Normal, &mut rng);
        let adv = avg(RollMode::Advantage, &mut rng);
        let dis = avg(RollMode::Disadvantage, &mut rng);
        // Теоретически: 10.5, 13.825, 7.175.
        assert!((normal - 10.5).abs() < 0.2, "{normal}");
        assert!((adv - 13.825).abs() < 0.2, "{adv}");
        assert!((dis - 7.175).abs() < 0.2, "{dis}");
    }
}
