//! Игровая сессия: генератор кубов и ресурсы текущего персонажа.
//!
//! Один и тот же код обслуживает приложение (Tauri) и веб-версию, поэтому поведение
//! бросков везде одинаковое.

use crate::check::{roll_d20, D20Roll, Modifier, RollMode};
use crate::error::EngineError;
use crate::expr::{DiceExpr, ExprRoll};
use crate::notation::resolve_player_d20;
use crate::resource::{ResourcePool, RestKind};
use crate::rng::Xoshiro256;

/// Состояние сессии.
#[derive(Debug, Clone)]
pub struct Session {
    rng: Xoshiro256,
    lucky: ResourcePool,
}

impl Session {
    /// Сессия с заданным генератором и полным пулом «Везунчика».
    pub fn new(rng: Xoshiro256) -> Self {
        Self { rng, lucky: ResourcePool::lucky() }
    }

    /// Бросок выражения, например `2d6+3`; `critical` удваивает кубы.
    pub fn roll_expression(
        &mut self,
        expression: &str,
        critical: bool,
    ) -> Result<ExprRoll, EngineError> {
        let expr = DiceExpr::parse(expression)?;
        Ok(expr.roll(&mut self.rng, critical))
    }

    /// Бросок d20 кубом движка.
    pub fn roll_check(
        &mut self,
        mode: RollMode,
        modifiers: Vec<Modifier>,
        crit_threshold: u32,
    ) -> Result<D20Roll, EngineError> {
        roll_d20(&mut self.rng, mode, modifiers, crit_threshold)
    }

    /// Бросок с настоящего куба, заявленный игроком: «16», «12 - везунчик».
    pub fn submit_player_roll(
        &mut self,
        input: &str,
        mode: RollMode,
        modifiers: Vec<Modifier>,
        crit_threshold: u32,
    ) -> Result<D20Roll, EngineError> {
        resolve_player_d20(input, mode, modifiers, crit_threshold, &mut self.lucky)
    }

    pub fn lucky(&self) -> &ResourcePool {
        &self.lucky
    }

    /// Отдых: восстанавливает ресурсы по их правилам.
    pub fn take_rest(&mut self, kind: RestKind) -> &ResourcePool {
        self.lucky.apply_rest(kind);
        &self.lucky
    }
}

impl Default for Session {
    fn default() -> Self {
        Self::new(Xoshiro256::from_entropy())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn full_lucky_cycle() {
        let mut s = Session::new(Xoshiro256::from_seed(3));
        let roll = s
            .submit_player_roll(
                "12 - везунчик",
                RollMode::Normal,
                vec![Modifier::new("ЛОВ", 2)],
                20,
            )
            .unwrap();
        assert_eq!(roll.total, 14);
        assert_eq!(s.lucky().current(), 2);
        assert_eq!(s.take_rest(RestKind::Short).current(), 2);
        assert_eq!(s.take_rest(RestKind::Long).current(), 3);
    }

    #[test]
    fn expression_and_check_use_shared_rng() {
        let mut a = Session::new(Xoshiro256::from_seed(8));
        let mut b = Session::new(Xoshiro256::from_seed(8));
        assert_eq!(a.roll_expression("8d6", false), b.roll_expression("8d6", false));
        assert_eq!(
            a.roll_check(RollMode::Advantage, vec![], 20),
            b.roll_check(RollMode::Advantage, vec![], 20)
        );
    }

    #[test]
    fn errors_are_reported() {
        let mut s = Session::new(Xoshiro256::from_seed(1));
        assert!(s.roll_expression("2d7", false).is_err());
        assert!(s.roll_check(RollMode::Normal, vec![], 1).is_err());
        assert!(s.submit_player_roll("30", RollMode::Normal, vec![], 20).is_err());
        assert_eq!(s.lucky().current(), 3);
    }
}
