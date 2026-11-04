//! Разбор заявок игрока о бросках с настоящих кубов.
//!
//! Правило кодекса: запись «12 - везунчик» означает, что игрок УЖЕ перебросил куб
//! чертой «Везунчик», и 12 — итоговое значение на кубе. Движок не предлагает и не
//! делает переброс сам, а только списывает заряд.
//!
//! Допустимые формы: `16`, `16 - везунчик`, `12-Везунчик`, `нат 20`, `17 (везунчик)`,
//! `14 lucky`.

use crate::check::{player_d20, D20Roll, Modifier, RollMode};
use crate::error::EngineError;
use crate::resource::ResourcePool;

/// Разобранная заявка игрока.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct PlayerRollInput {
    /// Значение на кубе d20.
    pub natural: u32,
    /// Использован ли переброс чертой «Везунчик».
    pub lucky: bool,
}

/// Разбирает заявку игрока о броске d20.
pub fn parse_player_roll(input: &str) -> Result<PlayerRollInput, EngineError> {
    let lower = input.to_lowercase();
    let lucky = lower.contains("везунчик") || lower.contains("lucky");

    let mut numbers = Vec::new();
    let mut digits = String::new();
    for c in lower.chars().chain(std::iter::once(' ')) {
        if c.is_ascii_digit() {
            digits.push(c);
        } else if !digits.is_empty() {
            numbers.push(std::mem::take(&mut digits));
        }
    }

    let original = input.trim().to_string();
    let value_text = match numbers.as_slice() {
        [] => return Err(EngineError::PlayerRollMissingValue(original)),
        [single] => single,
        _ => return Err(EngineError::PlayerRollAmbiguous(original)),
    };
    // Длинная строка цифр заведомо вне диапазона d20.
    let natural = value_text.parse::<u32>().unwrap_or(u32::MAX);
    if !(1..=20).contains(&natural) {
        return Err(EngineError::DieValueOutOfRange { value: natural, sides: 20 });
    }
    Ok(PlayerRollInput { natural, lucky })
}

/// Полная обработка заявки: разбор, списание заряда «Везунчика» (если указан) и расчёт
/// итога. Операция атомарна: при любой ошибке заряд не списывается.
pub fn resolve_player_d20(
    input: &str,
    mode: RollMode,
    modifiers: Vec<Modifier>,
    crit_threshold: u32,
    lucky_pool: &mut ResourcePool,
) -> Result<D20Roll, EngineError> {
    let parsed = parse_player_roll(input)?;
    // Сначала строим бросок (проверка порога крита), затем списываем заряд.
    let roll = player_d20(parsed.natural, mode, modifiers, crit_threshold, parsed.lucky)?;
    if parsed.lucky {
        lucky_pool.spend(1)?;
    }
    Ok(roll)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn parsed(natural: u32, lucky: bool) -> Result<PlayerRollInput, EngineError> {
        Ok(PlayerRollInput { natural, lucky })
    }

    #[test]
    fn parses_plain_and_lucky_forms() {
        assert_eq!(parse_player_roll("16"), parsed(16, false));
        assert_eq!(parse_player_roll("12 - везунчик"), parsed(12, true));
        assert_eq!(parse_player_roll("12-Везунчик"), parsed(12, true));
        assert_eq!(parse_player_roll("17 (ВЕЗУНЧИК)"), parsed(17, true));
        assert_eq!(parse_player_roll("нат 20"), parsed(20, false));
        assert_eq!(parse_player_roll("Нат 20 - везунчик"), parsed(20, true));
        assert_eq!(parse_player_roll("14 lucky"), parsed(14, true));
        assert_eq!(parse_player_roll("  1 "), parsed(1, false));
    }

    #[test]
    fn rejects_missing_ambiguous_and_out_of_range() {
        assert!(matches!(
            parse_player_roll("везунчик"),
            Err(EngineError::PlayerRollMissingValue(_))
        ));
        assert!(matches!(parse_player_roll("16 + 6"), Err(EngineError::PlayerRollAmbiguous(_))));
        assert_eq!(
            parse_player_roll("21"),
            Err(EngineError::DieValueOutOfRange { value: 21, sides: 20 })
        );
        assert_eq!(
            parse_player_roll("0 - везунчик"),
            Err(EngineError::DieValueOutOfRange { value: 0, sides: 20 })
        );
        assert!(matches!(
            parse_player_roll("99999999999999"),
            Err(EngineError::DieValueOutOfRange { .. })
        ));
    }

    #[test]
    fn lucky_charge_is_spent_and_roll_is_flagged() {
        let mut lucky = ResourcePool::lucky();
        let roll = resolve_player_d20(
            "16 - везунчик",
            RollMode::Normal,
            vec![Modifier::new("Скрытность", 6)],
            20,
            &mut lucky,
        )
        .unwrap();
        assert_eq!(roll.total, 22);
        assert!(roll.lucky_used);
        assert_eq!(lucky.current(), 2);
    }

    #[test]
    fn plain_roll_does_not_touch_lucky() {
        let mut lucky = ResourcePool::lucky();
        let roll = resolve_player_d20("9", RollMode::Normal, vec![], 20, &mut lucky).unwrap();
        assert!(!roll.lucky_used);
        assert_eq!(lucky.current(), 3);
    }

    #[test]
    fn lucky_without_charges_fails_without_side_effects() {
        let mut lucky = ResourcePool::lucky();
        lucky.spend(3).unwrap();
        let err = resolve_player_d20("12 - везунчик", RollMode::Normal, vec![], 20, &mut lucky)
            .unwrap_err();
        assert!(matches!(err, EngineError::ResourceDepleted { current: 0, max: 3, .. }));
        assert_eq!(err.to_string(), "Недостаточно зарядов «Везунчик»: нужно 1, доступно 0/3");
        assert_eq!(lucky.current(), 0);
    }

    #[test]
    fn invalid_input_never_spends_charge() {
        let mut lucky = ResourcePool::lucky();
        assert!(
            resolve_player_d20("25 - везунчик", RollMode::Normal, vec![], 20, &mut lucky).is_err()
        );
        assert!(
            resolve_player_d20("15 - везунчик", RollMode::Normal, vec![], 25, &mut lucky).is_err()
        );
        assert_eq!(lucky.current(), 3);
    }
}
