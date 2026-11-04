//! Генератор случайных чисел для кубов.
//!
//! Используется xoshiro256** — быстрый генератор с хорошим статистическим качеством.
//! Значение куба выбирается без смещения (метод отбраковки), поэтому каждая грань
//! выпадает с равной вероятностью.

use std::collections::hash_map::RandomState;
use std::hash::{BuildHasher, Hasher};
use std::time::{SystemTime, UNIX_EPOCH};

/// Источник значений кубов. Движок принимает любую реализацию — это позволяет
/// подставлять в тестах заранее заданную последовательность.
pub trait DiceRng {
    /// Возвращает равномерно распределённое значение в диапазоне `1..=sides`.
    /// `sides` всегда больше нуля.
    fn roll_die(&mut self, sides: u32) -> u32;
}

/// Генератор xoshiro256**.
#[derive(Debug, Clone)]
pub struct Xoshiro256 {
    state: [u64; 4],
}

impl Xoshiro256 {
    /// Детерминированный генератор из числа-зерна (для воспроизводимых тестов и повторов).
    pub fn from_seed(seed: u64) -> Self {
        let mut sm = seed;
        let mut state = [0u64; 4];
        for slot in &mut state {
            *slot = splitmix64(&mut sm);
        }
        // Нулевое состояние — единственное недопустимое для xoshiro.
        if state == [0; 4] {
            state[0] = 0x9E37_79B9_7F4A_7C15;
        }
        Self { state }
    }

    /// Генератор с зерном из энтропии системы: случайные ключи хеширования стандартной
    /// библиотеки, текущее время и адрес на стеке.
    pub fn from_entropy() -> Self {
        let mut hasher = RandomState::new().build_hasher();
        let nanos =
            SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_nanos()).unwrap_or_default();
        hasher.write_u128(nanos);
        let marker = 0u8;
        hasher.write_usize(std::ptr::addr_of!(marker) as usize);
        hasher.write_u32(std::process::id());
        let a = hasher.finish();
        let b = RandomState::new().build_hasher().finish();
        Self::from_seed(a ^ b.rotate_left(32))
    }

    /// Следующее 64-битное значение.
    pub fn next_u64(&mut self) -> u64 {
        let s = &mut self.state;
        let result = s[1].wrapping_mul(5).rotate_left(7).wrapping_mul(9);
        let t = s[1] << 17;
        s[2] ^= s[0];
        s[3] ^= s[1];
        s[1] ^= s[2];
        s[0] ^= s[3];
        s[2] ^= t;
        s[3] = s[3].rotate_left(45);
        result
    }
}

impl Default for Xoshiro256 {
    fn default() -> Self {
        Self::from_entropy()
    }
}

impl DiceRng for Xoshiro256 {
    fn roll_die(&mut self, sides: u32) -> u32 {
        assert!(sides > 0, "куб должен иметь хотя бы одну грань");
        let bound = u64::from(sides);
        // Отбрасываем «хвост» диапазона u64, который дал бы смещение при взятии остатка.
        let threshold = bound.wrapping_neg() % bound;
        loop {
            let x = self.next_u64();
            if x >= threshold {
                return (x % bound) as u32 + 1;
            }
        }
    }
}

fn splitmix64(state: &mut u64) -> u64 {
    *state = state.wrapping_add(0x9E37_79B9_7F4A_7C15);
    let mut z = *state;
    z = (z ^ (z >> 30)).wrapping_mul(0xBF58_476D_1CE4_E5B9);
    z = (z ^ (z >> 27)).wrapping_mul(0x94D0_49BB_1331_11EB);
    z ^ (z >> 31)
}

/// Генератор с заранее заданной последовательностью значений — для тестов движка.
#[cfg(test)]
pub(crate) struct ScriptedRng {
    values: Vec<u32>,
    index: usize,
}

#[cfg(test)]
impl ScriptedRng {
    pub(crate) fn new(values: &[u32]) -> Self {
        Self { values: values.to_vec(), index: 0 }
    }

    pub(crate) fn remaining(&self) -> usize {
        self.values.len() - self.index
    }
}

#[cfg(test)]
impl DiceRng for ScriptedRng {
    fn roll_die(&mut self, sides: u32) -> u32 {
        let value = *self
            .values
            .get(self.index)
            .unwrap_or_else(|| panic!("ScriptedRng: значения закончились (запрошен d{sides})"));
        assert!(
            (1..=sides).contains(&value),
            "ScriptedRng: значение {value} не подходит для d{sides}"
        );
        self.index += 1;
        value
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn same_seed_gives_same_sequence() {
        let mut a = Xoshiro256::from_seed(42);
        let mut b = Xoshiro256::from_seed(42);
        for _ in 0..100 {
            assert_eq!(a.roll_die(20), b.roll_die(20));
        }
    }

    #[test]
    fn different_seeds_diverge() {
        let mut a = Xoshiro256::from_seed(1);
        let mut b = Xoshiro256::from_seed(2);
        let seq_a: Vec<u32> = (0..20).map(|_| a.roll_die(20)).collect();
        let seq_b: Vec<u32> = (0..20).map(|_| b.roll_die(20)).collect();
        assert_ne!(seq_a, seq_b);
    }

    #[test]
    fn values_stay_in_range_for_all_dice() {
        let mut rng = Xoshiro256::from_seed(7);
        for sides in [2, 3, 4, 6, 8, 10, 12, 20, 100] {
            for _ in 0..2_000 {
                let v = rng.roll_die(sides);
                assert!((1..=sides).contains(&v), "d{sides} выдал {v}");
            }
        }
    }

    #[test]
    fn d20_distribution_is_uniform() {
        // 200 000 бросков: каждая грань ожидается ~10 000 раз. Хи-квадрат при 19 степенях
        // свободы с порогом 43.8 (p = 0.001) — проверка на явное смещение.
        let mut rng = Xoshiro256::from_seed(2026);
        let n = 200_000u32;
        let mut counts = [0u32; 20];
        for _ in 0..n {
            counts[(rng.roll_die(20) - 1) as usize] += 1;
        }
        let expected = f64::from(n) / 20.0;
        let chi2: f64 = counts
            .iter()
            .map(|&c| {
                let d = f64::from(c) - expected;
                d * d / expected
            })
            .sum();
        assert!(chi2 < 43.8, "распределение d20 смещено: χ² = {chi2:.2}, {counts:?}");
    }

    #[test]
    fn every_face_appears() {
        let mut rng = Xoshiro256::from_seed(99);
        let mut seen = [false; 20];
        for _ in 0..1_000 {
            seen[(rng.roll_die(20) - 1) as usize] = true;
        }
        assert!(seen.iter().all(|&s| s));
    }

    #[test]
    fn entropy_generators_differ() {
        let mut a = Xoshiro256::from_entropy();
        let mut b = Xoshiro256::from_entropy();
        let seq_a: Vec<u64> = (0..4).map(|_| a.next_u64()).collect();
        let seq_b: Vec<u64> = (0..4).map(|_| b.next_u64()).collect();
        assert_ne!(seq_a, seq_b);
    }

    #[test]
    fn scripted_rng_returns_values_in_order() {
        let mut rng = ScriptedRng::new(&[3, 17]);
        assert_eq!(rng.roll_die(6), 3);
        assert_eq!(rng.roll_die(20), 17);
        assert_eq!(rng.remaining(), 0);
    }
}
