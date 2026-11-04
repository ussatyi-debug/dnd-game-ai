//! Выражения бросков: `d20`, `2d6+3`, `8d6`, `1d8+5+2d8`, `4d4-1`.
//!
//! Поддерживаются латинская `d` и кириллические `к`/`д` (`2к6+3`), пробелы игнорируются.
//! При критическом попадании количество кубов в каждой группе удваивается,
//! а постоянные модификаторы — нет (правило 5e).

use std::fmt;
use std::str::FromStr;

use crate::error::EngineError;
use crate::rng::DiceRng;

/// Допустимые кубы.
pub const ALLOWED_SIDES: [u32; 9] = [2, 3, 4, 6, 8, 10, 12, 20, 100];
/// Максимум кубов в одной группе выражения.
pub const MAX_DICE_PER_TERM: u32 = 100;
/// Максимальная абсолютная величина постоянного модификатора.
pub const MAX_FLAT: i64 = 10_000;

/// Слагаемое выражения.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(tag = "kind", rename_all = "snake_case"))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Term {
    /// Группа кубов, например `2d6`; `negative` — вычитается из суммы.
    Dice { count: u32, sides: u32, negative: bool },
    /// Постоянное число со знаком.
    Flat { value: i64 },
}

/// Разобранное выражение броска.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DiceExpr {
    terms: Vec<Term>,
}

/// Результат броска одной группы кубов.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DiceGroupRoll {
    /// Сколько кубов брошено (при крите — удвоенное количество).
    pub count: u32,
    pub sides: u32,
    pub negative: bool,
    /// Значения на каждом кубе.
    pub values: Vec<u32>,
    /// Сумма группы с учётом знака.
    pub subtotal: i64,
}

/// Результат броска всего выражения.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ExprRoll {
    /// Каноническая запись выражения, например `2d6+3`.
    pub expression: String,
    pub groups: Vec<DiceGroupRoll>,
    /// Сумма постоянных модификаторов.
    pub flat: i64,
    /// Итог.
    pub total: i64,
    /// Был ли бросок критическим (кубы удвоены).
    pub critical: bool,
}

impl ExprRoll {
    /// Итог для урона и лечения: не может быть меньше нуля.
    pub fn total_non_negative(&self) -> i64 {
        self.total.max(0)
    }
}

impl DiceExpr {
    /// Разбирает строку выражения.
    pub fn parse(input: &str) -> Result<Self, EngineError> {
        let normalized: String = input
            .chars()
            .filter(|c| !c.is_whitespace())
            .map(|c| match c {
                'к' | 'К' | 'д' | 'Д' | 'D' => 'd',
                other => other,
            })
            .collect();

        if normalized.is_empty() {
            return Err(EngineError::EmptyExpression);
        }

        let invalid = || EngineError::InvalidExpression(input.trim().to_string());

        let mut terms = Vec::new();
        let mut negative = false;
        let mut current = String::new();
        let mut chars = normalized.chars().peekable();

        // Необязательный знак в начале выражения.
        if let Some(&first) = chars.peek() {
            if first == '+' || first == '-' {
                negative = first == '-';
                chars.next();
            }
        }

        for c in chars {
            match c {
                '+' | '-' => {
                    if current.is_empty() {
                        return Err(invalid());
                    }
                    terms.push(parse_term(&current, negative, input)?);
                    current.clear();
                    negative = c == '-';
                }
                _ => current.push(c),
            }
        }
        if current.is_empty() {
            return Err(invalid());
        }
        terms.push(parse_term(&current, negative, input)?);

        Ok(Self { terms })
    }

    /// Выражение из одной группы кубов, например `DiceExpr::dice(8, 6)` = `8d6`.
    pub fn dice(count: u32, sides: u32) -> Result<Self, EngineError> {
        validate_dice(count, sides)?;
        Ok(Self { terms: vec![Term::Dice { count, sides, negative: false }] })
    }

    pub fn terms(&self) -> &[Term] {
        &self.terms
    }

    /// Минимально возможный итог.
    pub fn min(&self) -> i64 {
        self.terms
            .iter()
            .map(|t| match *t {
                Term::Dice { count, negative: false, .. } => i64::from(count),
                Term::Dice { count, sides, negative: true } => -i64::from(count * sides),
                Term::Flat { value } => value,
            })
            .sum()
    }

    /// Максимально возможный итог.
    pub fn max(&self) -> i64 {
        self.terms
            .iter()
            .map(|t| match *t {
                Term::Dice { count, sides, negative: false } => i64::from(count * sides),
                Term::Dice { count, negative: true, .. } => -i64::from(count),
                Term::Flat { value } => value,
            })
            .sum()
    }

    /// Бросает выражение. При `critical` кубы каждой группы бросаются дважды.
    pub fn roll<R: DiceRng + ?Sized>(&self, rng: &mut R, critical: bool) -> ExprRoll {
        let mut groups = Vec::new();
        let mut flat = 0i64;

        for term in &self.terms {
            match *term {
                Term::Dice { count, sides, negative } => {
                    let rolled = if critical { count * 2 } else { count };
                    let values: Vec<u32> = (0..rolled).map(|_| rng.roll_die(sides)).collect();
                    let sum: i64 = values.iter().map(|&v| i64::from(v)).sum();
                    groups.push(DiceGroupRoll {
                        count: rolled,
                        sides,
                        negative,
                        values,
                        subtotal: if negative { -sum } else { sum },
                    });
                }
                Term::Flat { value } => flat += value,
            }
        }

        let total = groups.iter().map(|g| g.subtotal).sum::<i64>() + flat;
        ExprRoll { expression: self.to_string(), groups, flat, total, critical }
    }
}

impl FromStr for DiceExpr {
    type Err = EngineError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::parse(s)
    }
}

impl fmt::Display for DiceExpr {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        for (i, term) in self.terms.iter().enumerate() {
            let (negative, body) = match *term {
                Term::Dice { count, sides, negative } => (negative, format!("{count}d{sides}")),
                Term::Flat { value } => (value < 0, value.unsigned_abs().to_string()),
            };
            match (i, negative) {
                (0, true) => write!(f, "-{body}")?,
                (0, false) => write!(f, "{body}")?,
                (_, true) => write!(f, "-{body}")?,
                (_, false) => write!(f, "+{body}")?,
            }
        }
        Ok(())
    }
}

fn parse_term(token: &str, negative: bool, original: &str) -> Result<Term, EngineError> {
    let invalid = || EngineError::InvalidExpression(original.trim().to_string());

    if let Some((count_str, sides_str)) = token.split_once('d') {
        let count =
            if count_str.is_empty() { 1 } else { parse_digits(count_str).ok_or_else(invalid)? };
        let sides = parse_digits(sides_str).ok_or_else(invalid)?;
        validate_dice(count, sides)?;
        Ok(Term::Dice { count, sides, negative })
    } else {
        let magnitude = i64::from(parse_digits(token).ok_or_else(invalid)?);
        if magnitude > MAX_FLAT {
            return Err(invalid());
        }
        Ok(Term::Flat { value: if negative { -magnitude } else { magnitude } })
    }
}

/// Разбирает строку только из десятичных цифр.
fn parse_digits(s: &str) -> Option<u32> {
    if s.is_empty() || !s.bytes().all(|b| b.is_ascii_digit()) {
        return None;
    }
    s.parse().ok()
}

fn validate_dice(count: u32, sides: u32) -> Result<(), EngineError> {
    if !(1..=MAX_DICE_PER_TERM).contains(&count) {
        return Err(EngineError::InvalidDiceCount(count));
    }
    if !ALLOWED_SIDES.contains(&sides) {
        return Err(EngineError::InvalidDieSides(sides));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::rng::{ScriptedRng, Xoshiro256};

    fn dice(count: u32, sides: u32, negative: bool) -> Term {
        Term::Dice { count, sides, negative }
    }

    #[test]
    fn parses_simple_and_compound_expressions() {
        assert_eq!(DiceExpr::parse("d20").unwrap().terms(), &[dice(1, 20, false)]);
        assert_eq!(
            DiceExpr::parse("2d6+3").unwrap().terms(),
            &[dice(2, 6, false), Term::Flat { value: 3 }]
        );
        assert_eq!(
            DiceExpr::parse("1d8 + 5 + 2d8").unwrap().terms(),
            &[dice(1, 8, false), Term::Flat { value: 5 }, dice(2, 8, false)]
        );
        assert_eq!(
            DiceExpr::parse("4d4-1").unwrap().terms(),
            &[dice(4, 4, false), Term::Flat { value: -1 }]
        );
        assert_eq!(
            DiceExpr::parse("-1d4+2").unwrap().terms(),
            &[dice(1, 4, true), Term::Flat { value: 2 }]
        );
    }

    #[test]
    fn accepts_cyrillic_and_uppercase_dice_letters() {
        let expected = DiceExpr::parse("2d6+3").unwrap();
        assert_eq!(DiceExpr::parse("2к6+3").unwrap(), expected);
        assert_eq!(DiceExpr::parse("2Д6 + 3").unwrap(), expected);
        assert_eq!(DiceExpr::parse("2D6+3").unwrap(), expected);
    }

    #[test]
    fn canonical_display() {
        assert_eq!(DiceExpr::parse(" 8к6 ").unwrap().to_string(), "8d6");
        assert_eq!(DiceExpr::parse("1d8+5+2d8").unwrap().to_string(), "1d8+5+2d8");
        assert_eq!(DiceExpr::parse("-1d4-2").unwrap().to_string(), "-1d4-2");
        assert_eq!(DiceExpr::parse("d20").unwrap().to_string(), "1d20");
    }

    #[test]
    fn rejects_invalid_expressions() {
        assert_eq!(DiceExpr::parse("   "), Err(EngineError::EmptyExpression));
        for bad in ["2d", "d", "2d6+", "2d6++3", "+", "abc", "2d6*2", "1.5d6", "2d6+x", "d-6"] {
            assert!(
                matches!(DiceExpr::parse(bad), Err(EngineError::InvalidExpression(_))),
                "должно быть отклонено: {bad}"
            );
        }
    }

    #[test]
    fn rejects_unsupported_dice_and_counts() {
        assert_eq!(DiceExpr::parse("1d7"), Err(EngineError::InvalidDieSides(7)));
        assert_eq!(DiceExpr::parse("0d6"), Err(EngineError::InvalidDiceCount(0)));
        assert_eq!(DiceExpr::parse("101d6"), Err(EngineError::InvalidDiceCount(101)));
        assert!(DiceExpr::parse("1d6+10001").is_err());
        assert!(DiceExpr::parse("99999999999d6").is_err());
    }

    #[test]
    fn min_and_max() {
        let e = DiceExpr::parse("2d6+3").unwrap();
        assert_eq!((e.min(), e.max()), (5, 15));
        let e = DiceExpr::parse("1d20-1d4").unwrap();
        assert_eq!((e.min(), e.max()), (-3, 19));
    }

    #[test]
    fn rolls_with_breakdown() {
        let e = DiceExpr::parse("2d6+3").unwrap();
        let mut rng = ScriptedRng::new(&[4, 6]);
        let r = e.roll(&mut rng, false);
        assert_eq!(r.groups.len(), 1);
        assert_eq!(r.groups[0].values, vec![4, 6]);
        assert_eq!(r.groups[0].subtotal, 10);
        assert_eq!(r.flat, 3);
        assert_eq!(r.total, 13);
        assert!(!r.critical);
        assert_eq!(r.expression, "2d6+3");
    }

    #[test]
    fn critical_doubles_dice_but_not_flat_bonus() {
        // Клинок Закатного Савана: 1d8+5 + 2d8 силовым. На крите — 2d8+5 + 4d8.
        let e = DiceExpr::parse("1d8+5+2d8").unwrap();
        let mut rng = ScriptedRng::new(&[8, 1, 3, 3, 3, 3]);
        let r = e.roll(&mut rng, true);
        assert!(r.critical);
        assert_eq!(r.groups[0].count, 2);
        assert_eq!(r.groups[0].values, vec![8, 1]);
        assert_eq!(r.groups[1].count, 4);
        assert_eq!(r.flat, 5);
        assert_eq!(r.total, 9 + 5 + 12);
        assert_eq!(rng.remaining(), 0);
    }

    #[test]
    fn negative_groups_subtract() {
        let e = DiceExpr::parse("1d4-1d4").unwrap();
        let mut rng = ScriptedRng::new(&[1, 4]);
        let r = e.roll(&mut rng, false);
        assert_eq!(r.total, -3);
        assert_eq!(r.total_non_negative(), 0);
    }

    #[test]
    fn totals_always_within_bounds() {
        let mut rng = Xoshiro256::from_seed(5);
        for text in ["8d6", "1d8+5+2d8", "4d4+4", "1d20-1d4", "3d10-2"] {
            let e = DiceExpr::parse(text).unwrap();
            for _ in 0..500 {
                let t = e.roll(&mut rng, false).total;
                assert!((e.min()..=e.max()).contains(&t), "{text}: {t}");
            }
        }
    }

    #[test]
    fn dice_constructor() {
        assert_eq!(DiceExpr::dice(8, 6).unwrap().to_string(), "8d6");
        assert!(DiceExpr::dice(8, 5).is_err());
    }
}
