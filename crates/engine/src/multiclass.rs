//! Повышение уровня с выбором класса: тот же класс или новый (мультикласс по правилам 2024 года).
//!
//! Интерфейс присылает [`LevelGain`]: какой класс растёт, кость хитов, значение хитов уровня,
//! магию класса (если класс колдует), новые умения и итоговые строки владений. Движок проверяет
//! порог опыта, открытое повышение и требования мультикласса (13 в основных характеристиках
//! прежних классов и нового), затем:
//! - лист из мастера создания — дописывает лист героя (`HeroSpec`) и пересобирает героя;
//! - лист «Дома Стрэндж» — записывает правки листа (уровень класса, максимум хитов, опыт до
//!   следующего уровня, умения, владения): они переживают обновления приложения и сохранения.

use crate::character::{Ability, Character, ClassLevel};
use crate::creation::SpecClass;
use crate::error::EngineError;
use crate::profile::{Feature, HitDice, ProficiencyLine};
use crate::resource::ResourcePool;
use crate::spellcasting::{Caster, Preparation, Progression, Spellcasting, PACT_SLOTS_ID};
use crate::spells::SpellClass;

/// Классы: id, названия в листах (в том числе женские), основные характеристики для мультикласса
/// (`any` — достаточно одной из них).
struct ClassInfo {
    id: &'static str,
    names: &'static [&'static str],
    requires: &'static [Ability],
    any: bool,
}

const CLASSES: [ClassInfo; 12] = [
    ClassInfo {
        id: "barbarian",
        names: &["Варвар", "Варварка"],
        requires: &[Ability::Strength],
        any: false,
    },
    ClassInfo {
        id: "bard",
        names: &["Бард", "Бардесса"],
        requires: &[Ability::Charisma],
        any: false,
    },
    ClassInfo {
        id: "cleric", names: &["Жрец", "Жрица"], requires: &[Ability::Wisdom], any: false
    },
    ClassInfo {
        id: "druid",
        names: &["Друид", "Друидка"],
        requires: &[Ability::Wisdom],
        any: false,
    },
    ClassInfo {
        id: "fighter",
        names: &["Воин", "Воительница"],
        requires: &[Ability::Strength, Ability::Dexterity],
        any: true,
    },
    ClassInfo {
        id: "monk",
        names: &["Монах", "Монахиня"],
        requires: &[Ability::Dexterity, Ability::Wisdom],
        any: false,
    },
    ClassInfo {
        id: "paladin",
        names: &["Паладин", "Паладинша"],
        requires: &[Ability::Strength, Ability::Charisma],
        any: false,
    },
    ClassInfo {
        id: "ranger",
        names: &["Следопыт", "Следопытка"],
        requires: &[Ability::Dexterity, Ability::Wisdom],
        any: false,
    },
    ClassInfo {
        id: "rogue",
        names: &["Плут", "Плутовка"],
        requires: &[Ability::Dexterity],
        any: false,
    },
    ClassInfo {
        id: "sorcerer",
        names: &["Чародей", "Чародейка"],
        requires: &[Ability::Charisma],
        any: false,
    },
    ClassInfo {
        id: "warlock",
        names: &["Колдун", "Колдунья"],
        requires: &[Ability::Charisma],
        any: false,
    },
    ClassInfo {
        id: "wizard",
        names: &["Волшебник", "Волшебница"],
        requires: &[Ability::Intelligence],
        any: false,
    },
];

/// Наименьшее значение основной характеристики для мультикласса.
pub const MULTICLASS_MIN: u8 = 13;

fn info(id_or_name: &str) -> Option<&'static ClassInfo> {
    let q = id_or_name.trim().to_lowercase().replace('ё', "е");
    CLASSES.iter().find(|c| c.id == q || c.names.iter().any(|n| n.to_lowercase() == q))
}

/// ID класса по id или названию из листа («Жрица» → `cleric`).
pub fn class_id_of(id_or_name: &str) -> Option<&'static str> {
    info(id_or_name).map(|c| c.id)
}

/// Чего не хватает для мультикласса в этом классе (пусто — требования выполнены).
fn missing_requirement(class: &str, score: impl Fn(Ability) -> u8) -> Option<String> {
    let c = info(class)?;
    let ok = |a: &Ability| score(*a) >= MULTICLASS_MIN;
    let met = if c.any { c.requires.iter().any(ok) } else { c.requires.iter().all(ok) };
    if met {
        return None;
    }
    let names: Vec<&str> = c.requires.iter().map(|a| a.short_name()).collect();
    let joiner = if c.any { " или " } else { " и " };
    Some(format!("{}: нужно {} {MULTICLASS_MIN}+", c.names[0], names.join(joiner)))
}

/// Магия растущего класса: параметры заклинателя на новом уровне класса.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LevelCasting {
    pub spell_class: SpellClass,
    pub ability: Ability,
    pub progression: Progression,
    pub preparation: Preparation,
    #[cfg_attr(feature = "serde", serde(default))]
    pub max_cantrips: u32,
    #[cfg_attr(feature = "serde", serde(default))]
    pub max_known: Option<u32>,
    #[cfg_attr(feature = "serde", serde(default))]
    pub max_prepared: Option<u32>,
}

/// Новый уровень в выбранном классе.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LevelGain {
    /// ID класса в данных правил: `rogue`.
    pub class: String,
    /// Название класса: «Плут».
    pub class_name: String,
    /// Подкласс (выбирается на 3 уровне класса); `None` — без изменений.
    #[cfg_attr(feature = "serde", serde(default))]
    pub subclass: Option<String>,
    pub hit_die: u32,
    /// Значение кости хитов на этом уровне (без Телосложения); `None` — среднее.
    #[cfg_attr(feature = "serde", serde(default))]
    pub hp_roll: Option<u32>,
    /// Прибавка к максимуму хитов сверх кости и Телосложения (дварф, «Крепкий») — для листов
    /// «Дома Стрэндж»; в листе из мастера создания прибавки за уровень уже учтены.
    #[cfg_attr(feature = "serde", serde(default))]
    pub hp_bonus: u32,
    #[cfg_attr(feature = "serde", serde(default))]
    pub casting: Option<LevelCasting>,
    /// Умения нового уровня класса (и владения мультикласса текстом).
    #[cfg_attr(feature = "serde", serde(default))]
    pub features: Vec<Feature>,
    /// Строки владений целиком (как станут после повышения).
    #[cfg_attr(feature = "serde", serde(default))]
    pub proficiencies: Vec<ProficiencyLine>,
}

impl LevelGain {
    /// Значение кости на уровне: выбранное или среднее (d8 → 5).
    pub fn roll(&self) -> u32 {
        self.hp_roll.filter(|r| (1..=self.hit_die).contains(r)).unwrap_or(self.hit_die / 2 + 1)
    }

    pub(crate) fn check(&self) -> Result<&'static str, EngineError> {
        let id = class_id_of(&self.class).ok_or_else(|| {
            EngineError::Experience(format!("неизвестный класс «{}»", self.class))
        })?;
        if ![6, 8, 10, 12].contains(&self.hit_die) {
            return Err(EngineError::Experience(format!(
                "кость хитов d{} не бывает",
                self.hit_die
            )));
        }
        Ok(id)
    }
}

/// Проверка мультикласса: класс новый — требования нового и всех прежних классов.
pub(crate) fn check_multiclass(
    classes: &[&str],
    new_class: &str,
    score: impl Fn(Ability) -> u8 + Copy,
) -> Result<bool, EngineError> {
    let new_id = class_id_of(new_class);
    let is_new = !classes.iter().any(|c| class_id_of(c) == new_id);
    if !is_new {
        return Ok(false);
    }
    let mut missing: Vec<String> = Vec::new();
    for c in classes.iter().copied().chain(std::iter::once(new_class)) {
        if let Some(m) = missing_requirement(c, score) {
            missing.push(m);
        }
    }
    if missing.is_empty() {
        Ok(true)
    } else {
        Err(EngineError::Experience(format!("мультикласс невозможен — {}", missing.join("; "))))
    }
}

/// Уровень класса и магия на листе персонажа (правка листа «Дома Стрэндж»).
#[allow(clippy::too_many_arguments)]
pub(crate) fn apply_class_level(
    c: &mut Character,
    class: &str,
    name: &str,
    subclass: Option<&str>,
    level: u32,
    hit_die: u32,
    hit_dice_total: u32,
    casting: Option<&LevelCasting>,
) -> Result<(), EngineError> {
    if level == 0 || level > 20 {
        return Err(EngineError::InvalidSheetValue(format!("уровень класса {level}")));
    }
    let id = class_id_of(class).or_else(|| class_id_of(name));
    match c.classes.iter_mut().find(|cl| class_id_of(&cl.class) == id && id.is_some()) {
        Some(cl) => {
            cl.level = level;
            if let Some(s) = subclass.filter(|s| !s.trim().is_empty()) {
                cl.subclass = Some(s.trim().into());
            }
        }
        None => c.classes.push(ClassLevel {
            class: name.trim().into(),
            subclass: subclass.map(|s| s.trim().to_string()).filter(|s| !s.is_empty()),
            level,
        }),
    }
    if c.level() > 20 {
        return Err(EngineError::InvalidSheetValue("уровень персонажа больше 20".into()));
    }
    // Кости хитов: итог по этой кости записан в правке (повторное применение ничего не меняет).
    let dice = &mut c.profile.hit_dice;
    match dice.iter_mut().find(|d| d.die == hit_die) {
        Some(d) => {
            d.total = hit_dice_total;
            d.current = d.current.min(d.total);
        }
        None => dice.push(HitDice { die: hit_die, current: hit_dice_total, total: hit_dice_total }),
    }
    // Бонус мастерства по таблице догнал число из листа владельца — правка листа больше не нужна.
    if let Some(o) = c.profile.proficiency_override {
        if o <= crate::character::proficiency_bonus(c.level()) {
            c.profile.proficiency_override = None;
        }
    }
    // Магия класса.
    let caster_id = id.unwrap_or(class);
    let label = name.trim();
    if let Some(sc) = c.spellcasting.as_mut() {
        if let Some(k) = sc.casters.iter_mut().find(|k| k.id == caster_id) {
            k.level = level;
            if let Some(cast) = casting {
                k.max_cantrips = cast.max_cantrips;
                k.max_known = cast.max_known;
                k.max_prepared = cast.max_prepared;
            }
        } else if let Some(cast) = casting {
            sc.casters.push(new_caster(caster_id, label, level, cast));
        }
    } else if let Some(cast) = casting {
        c.spellcasting = Some(Spellcasting {
            casters: vec![new_caster(caster_id, label, level, cast)],
            granted: Vec::new(),
            scrolls: Vec::new(),
            restorers: Vec::new(),
            can_prepare: true,
        });
    }
    refresh_slot_pools(c);
    Ok(())
}

fn new_caster(id: &str, label: &str, level: u32, cast: &LevelCasting) -> Caster {
    let mut k = Caster::new(
        id,
        label,
        cast.spell_class,
        cast.ability,
        level,
        cast.progression,
        cast.preparation,
    );
    k.max_cantrips = cast.max_cantrips;
    k.max_known = cast.max_known;
    k.max_prepared = cast.max_prepared;
    k
}

/// Пулы ячеек по текущим уровням заклинателей; потраченное сохраняется.
pub(crate) fn refresh_slot_pools(c: &mut Character) {
    let fresh = c.spellcasting.as_ref().map(Spellcasting::slot_pools).unwrap_or_default();
    let is_slot = |id: &str| id == PACT_SLOTS_ID || id.starts_with("slots.");
    let old: Vec<ResourcePool> = c.resources.iter().filter(|p| is_slot(p.id())).cloned().collect();
    let first = c.resources.iter().position(|p| is_slot(p.id())).unwrap_or(c.resources.len());
    c.resources.retain(|p| !is_slot(p.id()));
    let pools: Vec<ResourcePool> = fresh
        .into_iter()
        .map(|p| match old.iter().find(|o| o.id() == p.id()) {
            Some(o) => {
                let spent = o.max().saturating_sub(o.current());
                ResourcePool::with_current(
                    p.id(),
                    p.name(),
                    p.max().saturating_sub(spent),
                    p.max(),
                    p.recovery(),
                )
                .unwrap_or(p)
            }
            None => p,
        })
        .collect();
    let at = first.min(c.resources.len());
    c.resources.splice(at..at, pools);
}

/// Возвращает классы, кости хитов и уровни заклинателей к листу приложения (перед правками).
pub(crate) fn reset_classes(c: &mut Character, base: &Character) {
    c.classes = base.classes.clone();
    let mut dice: Vec<HitDice> = Vec::new();
    for b in &base.profile.hit_dice {
        let current =
            c.profile.hit_dice.iter().find(|d| d.die == b.die).map_or(b.current, |d| d.current);
        dice.push(HitDice { die: b.die, current: current.min(b.total), total: b.total });
    }
    c.profile.hit_dice = dice;
    match (c.spellcasting.as_mut(), base.spellcasting.as_ref()) {
        (Some(sc), Some(bsc)) => {
            sc.casters.retain(|k| bsc.casters.iter().any(|b| b.id == k.id));
            for k in &mut sc.casters {
                if let Some(b) = bsc.casters.iter().find(|b| b.id == k.id) {
                    k.level = b.level;
                    k.max_cantrips = b.max_cantrips;
                    k.max_known = b.max_known;
                    k.max_prepared = b.max_prepared;
                }
            }
        }
        (Some(_), None) => c.spellcasting = None,
        _ => {}
    }
    refresh_slot_pools(c);
}

/// Новый уровень в листе из мастера создания.
pub(crate) fn grow_spec(spec: &mut crate::creation::HeroSpec, gain: &LevelGain, id: &str) {
    match spec.classes.iter_mut().find(|c| class_id_of(&c.id) == Some(id)) {
        Some(c) => {
            c.level += 1;
            if let Some(s) = gain.subclass.as_ref().filter(|s| !s.trim().is_empty()) {
                c.subclass = Some(s.trim().into());
            }
        }
        None => spec.classes.push(SpecClass {
            id: id.into(),
            name: gain.class_name.trim().into(),
            subclass: gain.subclass.clone().filter(|s| !s.trim().is_empty()),
            level: 1,
            hit_die: gain.hit_die,
        }),
    }
    spec.hp.rolls.push(gain.roll());
    let level = spec.classes.iter().find(|c| c.id == id).map_or(1, |c| c.level);
    if let Some(cast) = &gain.casting {
        match spec.casters.iter_mut().find(|k| k.id == id) {
            Some(k) => {
                k.level = level;
                k.max_cantrips = cast.max_cantrips;
                k.max_known = cast.max_known;
                k.max_prepared = cast.max_prepared;
            }
            None => spec.casters.push(new_caster(id, gain.class_name.trim(), level, cast)),
        }
    } else if let Some(k) = spec.casters.iter_mut().find(|k| k.id == id) {
        k.level = level;
    }
    for f in &gain.features {
        match spec.features.iter_mut().find(|x| x.name == f.name) {
            Some(x) => *x = f.clone(),
            None => spec.features.push(f.clone()),
        }
    }
    for line in &gain.proficiencies {
        match spec.proficiencies.iter_mut().find(|l| l.kind == line.kind) {
            Some(l) => l.text = line.text.clone(),
            None => spec.proficiencies.push(line.clone()),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn multiclass_requires_thirteen_in_both_classes() {
        let score = |a: Ability| match a {
            Ability::Dexterity => 16,
            Ability::Charisma => 18,
            Ability::Intelligence => 10,
            _ => 12,
        };
        // Тот же класс — не мультикласс.
        assert!(!check_multiclass(&["Колдун"], "warlock", score).unwrap());
        // Плут ← Колдун: ЛОВ 16 и ХАР 18 — можно.
        assert!(check_multiclass(&["Колдун"], "rogue", score).unwrap());
        // Волшебник: ИНТ 10 — нельзя.
        let err = check_multiclass(&["Колдун"], "wizard", score).unwrap_err().to_string();
        assert!(err.contains("ИНТ"), "{err}");
        // Монах: нужны и ЛОВ, и МДР.
        assert!(check_multiclass(&["Плут"], "monk", score).is_err());
        assert_eq!(class_id_of("Жрица"), Some("cleric"));
    }
}
