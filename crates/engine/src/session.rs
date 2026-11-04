//! Игровая сессия: генератор кубов и персонаж игрока.
//!
//! Один и тот же код обслуживает приложение (Tauri) и веб-версию, поэтому поведение
//! бросков везде одинаковое.
//!
//! По механике кампании игрок сообщает только результат на кубе; модификаторы прибавляет
//! мастер, беря их из базы. Поэтому лоток кубов работает с «чистыми» бросками, а функции с
//! модификаторами ([`Session::roll_check`], [`Session::submit_player_roll`]) предназначены
//! для мастера и движка.

use crate::character::{Character, CharacterSheet};
use crate::check::{roll_d20, D20Roll, Modifier, RollMode};
use crate::error::EngineError;
use crate::expr::{DiceExpr, ExprRoll};
use crate::fixtures::demo_nikis;
use crate::notation::resolve_player_d20;
use crate::resource::{ResourcePool, RestKind};
use crate::rng::{DiceRng, Xoshiro256};

/// ID ресурса черты «Везунчик».
pub const LUCKY_ID: &str = "feat.lucky";

/// Результат переброса d20 чертой «Везунчик».
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LuckyReroll {
    /// Новое значение на кубе d20.
    pub value: u32,
    /// Состояние зарядов после переброса.
    pub lucky: ResourcePool,
}

/// Итог отдыха.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RestResult {
    /// Названия восстановленных ресурсов.
    pub restored: Vec<String>,
    pub sheet: CharacterSheet,
}

/// Состояние сессии.
#[derive(Debug, Clone)]
pub struct Session {
    rng: Xoshiro256,
    character: Character,
}

impl Session {
    pub fn new(rng: Xoshiro256, character: Character) -> Self {
        Self { rng, character }
    }

    /// Сессия с демо-персонажем (до появления сохранений).
    pub fn with_demo_character(rng: Xoshiro256) -> Self {
        Self::new(rng, demo_nikis())
    }

    pub fn character(&self) -> &Character {
        &self.character
    }

    pub fn sheet(&self) -> CharacterSheet {
        self.character.sheet()
    }

    /// Бросок выражения, например `8d6`; `critical` удваивает кубы.
    pub fn roll_expression(
        &mut self,
        expression: &str,
        critical: bool,
    ) -> Result<ExprRoll, EngineError> {
        let expr = DiceExpr::parse(expression)?;
        Ok(expr.roll(&mut self.rng, critical))
    }

    /// Переброс d20 чертой «Везунчик»: сначала списывается заряд, затем бросается куб.
    /// Без зарядов бросок не выполняется.
    pub fn lucky_reroll(&mut self) -> Result<LuckyReroll, EngineError> {
        let lucky = self.character.resource_mut(LUCKY_ID)?;
        lucky.spend(1)?;
        let lucky = lucky.clone();
        Ok(LuckyReroll { value: self.rng.roll_die(20), lucky })
    }

    /// Бросок d20 с модификаторами кубом движка (для мастера).
    pub fn roll_check(
        &mut self,
        mode: RollMode,
        modifiers: Vec<Modifier>,
        crit_threshold: u32,
    ) -> Result<D20Roll, EngineError> {
        roll_d20(&mut self.rng, mode, modifiers, crit_threshold)
    }

    /// Заявка игрока «16», «12 - везунчик» с модификаторами, которые подставил мастер.
    pub fn submit_player_roll(
        &mut self,
        input: &str,
        mode: RollMode,
        modifiers: Vec<Modifier>,
        crit_threshold: u32,
    ) -> Result<D20Roll, EngineError> {
        let lucky = self.character.resource_mut(LUCKY_ID)?;
        resolve_player_d20(input, mode, modifiers, crit_threshold, lucky)
    }

    /// Отдых: восстанавливает ресурсы персонажа по их правилам.
    pub fn take_rest(&mut self, kind: RestKind) -> RestResult {
        let restored = self.character.apply_rest(kind);
        RestResult { restored, sheet: self.character.sheet() }
    }
}

impl Default for Session {
    fn default() -> Self {
        Self::with_demo_character(Xoshiro256::from_entropy())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn session(seed: u64) -> Session {
        Session::with_demo_character(Xoshiro256::from_seed(seed))
    }

    #[test]
    fn lucky_reroll_spends_charges_until_empty() {
        let mut s = session(3);
        for expected in [2, 1, 0] {
            let r = s.lucky_reroll().unwrap();
            assert!((1..=20).contains(&r.value));
            assert_eq!(r.lucky.current(), expected);
        }
        assert!(matches!(
            s.lucky_reroll(),
            Err(EngineError::ResourceDepleted { current: 0, max: 3, .. })
        ));
        assert_eq!(s.sheet().resources[0].current(), 0);
    }

    #[test]
    fn lucky_restores_only_on_long_rest() {
        let mut s = session(4);
        s.lucky_reroll().unwrap();
        let short = s.take_rest(RestKind::Short);
        assert!(!short.restored.contains(&"Везунчик".to_string()));
        assert_eq!(short.sheet.resources[0].current(), 2);
        let long = s.take_rest(RestKind::Long);
        assert!(long.restored.contains(&"Везунчик".to_string()));
        assert_eq!(long.sheet.resources[0].current(), 3);
    }

    #[test]
    fn player_roll_with_master_modifiers_uses_character_lucky() {
        let mut s = session(1);
        let roll = s
            .submit_player_roll(
                "12 - везунчик",
                RollMode::Normal,
                vec![Modifier::new("Скрытность", 6)],
                20,
            )
            .unwrap();
        assert_eq!(roll.total, 18);
        assert_eq!(s.character().resource(LUCKY_ID).unwrap().current(), 2);
    }

    #[test]
    fn expressions_are_reproducible_by_seed() {
        let mut a = session(8);
        let mut b = session(8);
        assert_eq!(a.roll_expression("8d6", false), b.roll_expression("8d6", false));
        assert_eq!(a.lucky_reroll(), b.lucky_reroll());
        assert_eq!(
            a.roll_check(RollMode::Advantage, vec![], 20),
            b.roll_check(RollMode::Advantage, vec![], 20)
        );
    }

    #[test]
    fn errors_are_reported() {
        let mut s = session(1);
        assert!(s.roll_expression("2d7", false).is_err());
        assert!(s.roll_check(RollMode::Normal, vec![], 1).is_err());
        assert!(s.submit_player_roll("30", RollMode::Normal, vec![], 20).is_err());
        assert_eq!(s.character().resource(LUCKY_ID).unwrap().current(), 3);
    }
}
