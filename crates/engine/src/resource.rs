//! Пулы ресурсов: заряды черт, ячейки заклинаний, Ци, кубы превосходства.
//!
//! Каждый пул знает, когда восстанавливается. Это исполняет правила кодекса кампании,
//! например: «заряды Везунчика восстанавливаются СТРОГО на длительном отдыхе».

use std::fmt;

use crate::error::EngineError;

/// Когда пул восстанавливается.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "snake_case"))]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Recovery {
    /// На коротком и на длительном отдыхе (ячейки колдуна, Ци).
    ShortRest,
    /// Только на длительном отдыхе (Везунчик).
    LongRest,
    /// С наступлением нового игрового дня (свойства предметов «1/день»).
    Daily,
    /// Только вручную (заряды предметов, расходники).
    Manual,
}

/// Вид отдыха.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "snake_case"))]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RestKind {
    Short,
    Long,
}

/// Пул ресурса. Инвариант: `current <= max`.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ResourcePool {
    id: String,
    name: String,
    current: u32,
    max: u32,
    recovery: Recovery,
}

impl ResourcePool {
    /// Новый полный пул.
    pub fn new(
        id: impl Into<String>,
        name: impl Into<String>,
        max: u32,
        recovery: Recovery,
    ) -> Self {
        Self { id: id.into(), name: name.into(), current: max, max, recovery }
    }

    /// Пул с заданным текущим значением (загрузка сохранения).
    pub fn with_current(
        id: impl Into<String>,
        name: impl Into<String>,
        current: u32,
        max: u32,
        recovery: Recovery,
    ) -> Result<Self, EngineError> {
        let name = name.into();
        if current > max {
            return Err(EngineError::ResourceOverMax { name, current, max });
        }
        Ok(Self { id: id.into(), name, current, max, recovery })
    }

    /// Черта «Везунчик»: 3 заряда, восстановление только на длительном отдыхе.
    pub fn lucky() -> Self {
        Self::new("feat.lucky", "Везунчик", 3, Recovery::LongRest)
    }

    pub fn id(&self) -> &str {
        &self.id
    }

    pub fn name(&self) -> &str {
        &self.name
    }

    pub fn current(&self) -> u32 {
        self.current
    }

    pub fn max(&self) -> u32 {
        self.max
    }

    pub fn recovery(&self) -> Recovery {
        self.recovery
    }

    pub fn is_empty(&self) -> bool {
        self.current == 0
    }

    /// Тратит `amount` единиц. При нехватке ничего не меняет и возвращает ошибку.
    /// Возвращает остаток.
    pub fn spend(&mut self, amount: u32) -> Result<u32, EngineError> {
        if amount == 0 {
            return Err(EngineError::ZeroAmount);
        }
        if amount > self.current {
            return Err(EngineError::ResourceDepleted {
                name: self.name.clone(),
                requested: amount,
                current: self.current,
                max: self.max,
            });
        }
        self.current -= amount;
        Ok(self.current)
    }

    /// Восстанавливает до `amount` единиц, не выше максимума. Возвращает фактически
    /// восстановленное количество.
    pub fn restore(&mut self, amount: u32) -> Result<u32, EngineError> {
        if amount == 0 {
            return Err(EngineError::ZeroAmount);
        }
        let gained = amount.min(self.max - self.current);
        self.current += gained;
        Ok(gained)
    }

    pub fn restore_full(&mut self) {
        self.current = self.max;
    }

    /// Применяет отдых. Возвращает `true`, если пул восстановился.
    pub fn apply_rest(&mut self, rest: RestKind) -> bool {
        let recovers = matches!(
            (self.recovery, rest),
            (Recovery::ShortRest, _) | (Recovery::LongRest, RestKind::Long)
        );
        self.refill_if(recovers)
    }

    /// Наступление нового игрового дня. Возвращает `true`, если пул восстановился.
    pub fn apply_new_day(&mut self) -> bool {
        self.refill_if(self.recovery == Recovery::Daily)
    }

    fn refill_if(&mut self, condition: bool) -> bool {
        if condition && self.current < self.max {
            self.current = self.max;
            true
        } else {
            false
        }
    }
}

impl fmt::Display for ResourcePool {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{} {}/{}", self.name, self.current, self.max)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn lucky_spends_down_to_zero_then_errors() {
        let mut lucky = ResourcePool::lucky();
        assert_eq!(lucky.to_string(), "Везунчик 3/3");
        assert_eq!(lucky.spend(1), Ok(2));
        assert_eq!(lucky.spend(1), Ok(1));
        assert_eq!(lucky.spend(1), Ok(0));
        assert!(lucky.is_empty());
        assert_eq!(
            lucky.spend(1),
            Err(EngineError::ResourceDepleted {
                name: "Везунчик".into(),
                requested: 1,
                current: 0,
                max: 3
            })
        );
        assert_eq!(lucky.current(), 0);
    }

    #[test]
    fn failed_spend_changes_nothing() {
        let mut pool = ResourcePool::new("monk.ki", "Ци", 8, Recovery::ShortRest);
        pool.spend(6).unwrap();
        assert!(pool.spend(3).is_err());
        assert_eq!(pool.current(), 2);
    }

    #[test]
    fn lucky_recovers_only_on_long_rest() {
        let mut lucky = ResourcePool::lucky();
        lucky.spend(2).unwrap();
        assert!(!lucky.apply_rest(RestKind::Short));
        assert_eq!(lucky.current(), 1);
        assert!(!lucky.apply_new_day());
        assert!(lucky.apply_rest(RestKind::Long));
        assert_eq!(lucky.current(), 3);
    }

    #[test]
    fn short_rest_pools_recover_on_any_rest() {
        let mut slots =
            ResourcePool::new("warlock.slots", "Ячейки колдуна", 2, Recovery::ShortRest);
        slots.spend(2).unwrap();
        assert!(slots.apply_rest(RestKind::Short));
        assert_eq!(slots.current(), 2);
        slots.spend(1).unwrap();
        assert!(slots.apply_rest(RestKind::Long));
        assert_eq!(slots.current(), 2);
    }

    #[test]
    fn daily_and_manual_pools() {
        let mut daily =
            ResourcePool::new("item.ocular.hadar", "Голод Хадара (Окуляр)", 1, Recovery::Daily);
        daily.spend(1).unwrap();
        assert!(!daily.apply_rest(RestKind::Long));
        assert!(daily.apply_new_day());
        assert_eq!(daily.current(), 1);

        let mut charges = ResourcePool::new(
            "item.staff.charges",
            "Посох Пепельного Пламени",
            10,
            Recovery::Manual,
        );
        charges.spend(3).unwrap();
        assert!(!charges.apply_rest(RestKind::Long));
        assert!(!charges.apply_new_day());
        assert_eq!(charges.restore(5), Ok(3));
        assert_eq!(charges.current(), 10);
    }

    #[test]
    fn full_pool_does_not_report_recovery() {
        let mut lucky = ResourcePool::lucky();
        assert!(!lucky.apply_rest(RestKind::Long));
    }

    #[test]
    fn with_current_validates_and_zero_amounts_rejected() {
        let pool =
            ResourcePool::with_current("feat.lucky", "Везунчик", 1, 3, Recovery::LongRest).unwrap();
        assert_eq!(pool.current(), 1);
        assert!(ResourcePool::with_current("x", "X", 4, 3, Recovery::Manual).is_err());

        let mut lucky = ResourcePool::lucky();
        assert_eq!(lucky.spend(0), Err(EngineError::ZeroAmount));
        assert_eq!(lucky.restore(0), Err(EngineError::ZeroAmount));
    }
}
