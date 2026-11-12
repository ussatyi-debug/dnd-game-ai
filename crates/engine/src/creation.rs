//! Созданные игроком герои и новые кампании.
//!
//! Правила 2024 года (виды, предыстории, классы, таланты) живут в данных интерфейса: мастер
//! создания собирает из них готовый лист — [`HeroSpec`]. Движок не доверяет листу вслепую:
//! [`build_hero`] проверяет то, что можно проверить без таблиц правил (диапазоны
//! характеристик, хиты по костям, заклинания по каталогу и спискам классов, лимиты), и
//! собирает из листа персонажа. В сохранение кампании идёт сам лист, а при загрузке персонаж
//! собирается заново — так же, как демо-отряд берётся из приложения.

use crate::character::{
    ability_modifier, Ability, AbilityScores, Character, CharacterKind, ClassLevel, HitPoints,
};
use crate::error::EngineError;
use crate::inventory::{Container, Inventory, NewItem, ON_PERSON};
use crate::profile::{
    Attack, Attunement, Bonus, Feature, HitDice, ProficiencyLine, Profile, SkillEntry,
};
use crate::resource::{Recovery, ResourcePool};
use crate::spellcasting::{Caster, GrantedSpell, Preparation, Progression, Spellcasting};
use crate::spells;
use crate::treasury::{gp, Asset, AssetKind, EntrySource, Location, NewEntry, Treasury};

/// Высший уровень героя, который пока умеет собирать мастер создания.
pub const MAX_HERO_LEVEL: u32 = 15;

/// Опыт для уровней 1–20.
pub const XP_THRESHOLDS: [u32; 20] = [
    0, 300, 900, 2_700, 6_500, 14_000, 23_000, 34_000, 48_000, 64_000, 85_000, 100_000, 120_000,
    140_000, 165_000, 195_000, 225_000, 265_000, 305_000, 355_000,
];

/// Уровень по опыту.
pub fn level_for_xp(xp: u32) -> u32 {
    XP_THRESHOLDS.iter().filter(|&&t| xp >= t).count() as u32
}

/// Класс героя.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SpecClass {
    /// ID класса в данных правил: `wizard`.
    pub id: String,
    /// Название: «Волшебник».
    pub name: String,
    pub subclass: Option<String>,
    pub level: u32,
    pub hit_die: u32,
}

/// Хиты: броски (или выбранные значения) костей хитов после 1 уровня и прибавки за уровень.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq, Default)]
pub struct SpecHp {
    /// Значение кости хитов на каждом уровне после первого — по порядку классов.
    pub rolls: Vec<u32>,
    /// Прибавка к максимуму за каждый уровень (дварф +1, «Крепкий» +2).
    #[cfg_attr(feature = "serde", serde(default))]
    pub per_level: u32,
    /// Разовая прибавка (Драконья стойкость чародея +3 на 3 уровне учтена через per_level и это поле).
    #[cfg_attr(feature = "serde", serde(default))]
    pub flat: i32,
}

/// Ресурс героя.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SpecResource {
    pub id: String,
    pub name: String,
    pub max: u32,
    pub recovery: Recovery,
}

/// Предмет стартового снаряжения.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SpecItem {
    pub name: String,
    pub quantity: u32,
    pub category: String,
    #[cfg_attr(feature = "serde", serde(default))]
    pub notes: String,
}

/// Лист героя из мастера создания.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HeroSpec {
    pub id: String,
    pub kind: CharacterKind,
    pub name: String,
    #[cfg_attr(feature = "serde", serde(default))]
    pub title: String,
    /// Вид с наследием: «Эльф (высший эльф)».
    pub species: String,
    pub background: String,
    pub alignment: String,
    #[cfg_attr(feature = "serde", serde(default))]
    pub appearance: String,
    /// Портрет: ключ из набора портретов интерфейса.
    #[cfg_attr(feature = "serde", serde(default))]
    pub portrait: String,
    pub classes: Vec<SpecClass>,
    pub abilities: AbilityScores,
    pub hp: SpecHp,
    pub armor_class: i32,
    pub armor_class_breakdown: Vec<Bonus>,
    pub speed_ft: u32,
    pub xp: u32,
    pub save_proficiencies: Vec<Ability>,
    pub skills: Vec<SkillEntry>,
    #[cfg_attr(feature = "serde", serde(default))]
    pub initiative_bonuses: Vec<Bonus>,
    #[cfg_attr(feature = "serde", serde(default))]
    pub attacks: Vec<Attack>,
    pub features: Vec<Feature>,
    pub proficiencies: Vec<ProficiencyLine>,
    #[cfg_attr(feature = "serde", serde(default))]
    pub resources: Vec<SpecResource>,
    #[cfg_attr(feature = "serde", serde(default))]
    pub casters: Vec<Caster>,
    #[cfg_attr(feature = "serde", serde(default))]
    pub granted: Vec<GrantedSpell>,
    #[cfg_attr(feature = "serde", serde(default))]
    pub items: Vec<SpecItem>,
    /// Прибавки ко всем спасброскам (например, Плащ защиты).
    #[cfg_attr(feature = "serde", serde(default))]
    pub save_bonuses: Vec<Bonus>,
    /// Предметы, требующие настройки (не больше трёх).
    #[cfg_attr(feature = "serde", serde(default))]
    pub attunement: Vec<Attunement>,
    #[cfg_attr(feature = "serde", serde(default))]
    pub notes: Vec<String>,
    /// Черновик мастера создания (JSON интерфейса) — для повышения уровня; движок его не читает.
    #[cfg_attr(feature = "serde", serde(default))]
    pub draft: String,
}

impl HeroSpec {
    pub fn level(&self) -> u32 {
        self.classes.iter().map(|c| c.level).sum()
    }

    /// Максимум хитов: 1 уровень — максимум кости, дальше — значения костей; на каждом уровне
    /// прибавляется модификатор Телосложения (уровень даёт не меньше 1 хита) и прибавки.
    pub fn max_hit_points(&self) -> i32 {
        let con = ability_modifier(self.abilities.constitution);
        let first = self.classes.first().map_or(0, |c| c.hit_die as i32);
        let mut total = (first + con).max(1);
        for roll in &self.hp.rolls {
            total += (*roll as i32 + con).max(1);
        }
        total + self.hp.per_level as i32 * self.level() as i32 + self.hp.flat
    }
}

/// Проверяет лист героя. Возвращает все найденные нарушения (пусто — лист в порядке).
pub fn validate_hero(spec: &HeroSpec) -> Vec<String> {
    let mut errors = Vec::new();
    let mut err = |m: String| errors.push(m);

    if spec.id.trim().is_empty() {
        err("у героя нет ID".into());
    }
    if spec.attunement.len() > 3 {
        err(format!("настроено предметов: {} (максимум 3)", spec.attunement.len()));
    }
    let name = spec.name.trim();
    if name.is_empty() {
        err("у героя нет имени".into());
    } else if name.chars().count() > 60 {
        err("имя длиннее 60 знаков".into());
    }
    for ability in Ability::ALL {
        let score = spec.abilities.get(ability);
        if !(3..=20).contains(&score) {
            err(format!("{} = {score}: допустимо 3–20", ability.short_name()));
        }
    }

    if spec.classes.is_empty() {
        err("не выбран класс".into());
    }
    let level = spec.level();
    if level == 0 || level > MAX_HERO_LEVEL {
        err(format!("уровень {level}: допустимо 1–{MAX_HERO_LEVEL}"));
    }
    for c in &spec.classes {
        if c.level == 0 {
            err(format!("{}: уровень класса 0", c.name));
        }
        if ![6, 8, 10, 12].contains(&c.hit_die) {
            err(format!("{}: кость хитов d{} не бывает", c.name, c.hit_die));
        }
    }
    let mut ids: Vec<&str> = spec.classes.iter().map(|c| c.id.as_str()).collect();
    ids.sort_unstable();
    if ids.windows(2).any(|w| w[0] == w[1]) {
        err("один класс указан дважды".into());
    }

    // Кости хитов после 1 уровня — по порядку классов.
    let dice: Vec<u32> = spec
        .classes
        .iter()
        .flat_map(|c| std::iter::repeat_n(c.hit_die, c.level as usize))
        .skip(1)
        .collect();
    if spec.hp.rolls.len() != dice.len() {
        err(format!(
            "хиты: нужно {} значений костей после 1 уровня, указано {}",
            dice.len(),
            spec.hp.rolls.len()
        ));
    } else {
        for (i, (roll, die)) in spec.hp.rolls.iter().zip(&dice).enumerate() {
            if *roll == 0 || roll > die {
                err(format!("хиты: {} уровень — значение {roll} вне d{die}", i + 2));
            }
        }
    }
    if spec.max_hit_points() < 1 {
        err("максимум хитов меньше 1".into());
    }

    if spec.xp < XP_THRESHOLDS[(level.clamp(1, 20) - 1) as usize] {
        err(format!("опыт {} меньше порога {level} уровня", spec.xp));
    }
    if !spec.armor_class_breakdown.is_empty() {
        let sum: i32 = spec.armor_class_breakdown.iter().map(|b| b.value).sum();
        if sum != spec.armor_class {
            err(format!("КД {}: слагаемые дают {sum}", spec.armor_class));
        }
    }
    if !(5..=30).contains(&spec.armor_class) {
        err(format!("КД {}: недопустимое значение", spec.armor_class));
    }

    let mut skills: Vec<String> = spec.skills.iter().map(|s| format!("{:?}", s.skill)).collect();
    skills.sort_unstable();
    if skills.windows(2).any(|w| w[0] == w[1]) {
        err("навык указан дважды".into());
    }

    let mut pools: Vec<&str> = spec.resources.iter().map(|r| r.id.as_str()).collect();
    pools.sort_unstable();
    if pools.windows(2).any(|w| w[0] == w[1]) {
        err("ресурс указан дважды".into());
    }
    for r in &spec.resources {
        if r.max == 0 {
            err(format!("ресурс «{}»: максимум 0", r.name));
        }
    }
    for f in &spec.features {
        if let Some(id) = &f.resource_id {
            if !spec.resources.iter().any(|r| &r.id == id) {
                err(format!("умение «{}»: нет ресурса {id}", f.name));
            }
        }
    }

    for c in &spec.casters {
        validate_caster(c, spec, &mut err);
    }
    for g in &spec.granted {
        if spells::spell(&g.spell_id).is_none() {
            err(format!("{}: заклинания «{}» нет в каталоге", g.source, g.spell_id));
        }
        if let Some(id) = &g.resource_id {
            if !spec.resources.iter().any(|r| &r.id == id) {
                err(format!("{}: нет ресурса {id}", g.source));
            }
        }
        if let Some(id) = &g.caster_id {
            if !spec.casters.iter().any(|c| &c.id == id) {
                err(format!("{}: нет заклинателя {id}", g.source));
            }
        }
    }
    for item in &spec.items {
        if item.name.trim().is_empty() || item.quantity == 0 {
            err("пустой предмет в снаряжении".into());
        }
    }
    errors
}

fn validate_caster(c: &Caster, spec: &HeroSpec, err: &mut impl FnMut(String)) {
    let label = &c.label;
    let innate = c.progression == Progression::Innate;
    if !innate {
        match spec.classes.iter().find(|k| k.id == c.id) {
            Some(k) if k.level == c.level => {}
            Some(k) => {
                err(format!("{label}: уровень заклинателя {} ≠ уровню класса {}", c.level, k.level))
            }
            None => err(format!("{label}: нет такого класса у героя")),
        }
    }
    let max_level = c.max_spell_level();
    let check = |list: &[String], cantrip: bool, what: &str, err: &mut dyn FnMut(String)| {
        for id in list {
            let Some(meta) = spells::spell(id) else {
                err(format!("{label}: заклинания «{id}» нет в каталоге"));
                continue;
            };
            if meta.is_cantrip() != cantrip {
                err(format!("{label}: «{}» — {what}", meta.name));
            } else if !c.has_on_list(meta) {
                err(format!("{label}: «{}» нет в списке класса", meta.name));
            } else if !cantrip && !innate && meta.level > max_level {
                err(format!("{label}: «{}» выше доступного круга {max_level}", meta.name));
            }
        }
    };
    let mut sink = |m: String| err(m);
    check(&c.cantrips, true, "не заговор", &mut sink);
    check(&c.known, false, "заговор в списке заклинаний", &mut sink);
    check(&c.prepared, false, "заговор в списке заклинаний", &mut sink);
    for id in c.always.iter().chain(&c.expanded) {
        if spells::spell(id).is_none() {
            sink(format!("{label}: заклинания «{id}» нет в каталоге"));
        }
    }
    let unique = |list: &[String]| {
        let mut v: Vec<&String> = list.iter().collect();
        v.sort_unstable();
        v.windows(2).all(|w| w[0] != w[1])
    };
    if !unique(&c.cantrips) || !unique(&c.known) || !unique(&c.prepared) {
        sink(format!("{label}: заклинание выбрано дважды"));
    }
    if c.cantrips.len() as u32 > c.max_cantrips {
        sink(format!("{label}: заговоров {} при лимите {}", c.cantrips.len(), c.max_cantrips));
    }
    match c.preparation {
        Preparation::Known => {
            if let Some(max) = c.max_known {
                if c.known.len() as u32 > max {
                    sink(format!("{label}: известно {} при лимите {max}", c.known.len()));
                }
            }
        }
        Preparation::Prepared | Preparation::Spellbook => {
            let limit = c.prepared_limit(spec.abilities.modifier(c.ability)).unwrap_or(0);
            if c.prepared.len() as u32 > limit {
                sink(format!("{label}: подготовлено {} при лимите {limit}", c.prepared.len()));
            }
            if c.preparation == Preparation::Spellbook {
                for id in &c.prepared {
                    if !c.known.contains(id) {
                        sink(format!("{label}: «{id}» подготовлено, но нет в книге"));
                    }
                }
            }
        }
    }
}

/// Собирает персонажа из проверенного листа.
pub fn build_hero(spec: &HeroSpec, location: &str) -> Result<Character, EngineError> {
    let errors = validate_hero(spec);
    if !errors.is_empty() {
        return Err(EngineError::InvalidHero(errors.join("; ")));
    }
    let level = spec.level();
    let max_hp = spec.max_hit_points().max(1) as u32;

    let spellcasting =
        (!spec.casters.is_empty() || !spec.granted.is_empty()).then(|| Spellcasting {
            casters: spec.casters.clone(),
            granted: spec.granted.clone(),
            scrolls: Vec::new(),
            restorers: Vec::new(),
            can_prepare: true,
        });
    let mut resources: Vec<ResourcePool> = spec
        .resources
        .iter()
        .map(|r| ResourcePool::new(r.id.clone(), r.name.clone(), r.max, r.recovery))
        .collect();
    if let Some(sc) = &spellcasting {
        resources.extend(sc.slot_pools());
    }

    let mut hit_dice: Vec<HitDice> = Vec::new();
    for c in &spec.classes {
        match hit_dice.iter_mut().find(|d| d.die == c.hit_die) {
            Some(d) => {
                d.total += c.level;
                d.current += c.level;
            }
            None => hit_dice.push(HitDice { die: c.hit_die, current: c.level, total: c.level }),
        }
    }
    hit_dice.sort_by_key(|d| std::cmp::Reverse(d.die));

    let mut inventory = Inventory::new(vec![
        Container::new(ON_PERSON, "При себе"),
        Container::new("pack", "Рюкзак"),
    ]);
    for item in &spec.items {
        inventory.add(NewItem {
            name: item.name.clone(),
            quantity: item.quantity,
            container: ON_PERSON.into(),
            category: item.category.clone(),
            notes: item.notes.clone(),
        })?;
    }

    let next = XP_THRESHOLDS.get(level as usize).copied();
    let profile = Profile {
        background: spec.background.clone(),
        alignment: spec.alignment.clone(),
        xp: Some(spec.xp),
        xp_next: next,
        appearance: spec.appearance.clone(),
        save_proficiencies: spec.save_proficiencies.clone(),
        skills_listed: true,
        skills: spec.skills.clone(),
        initiative_bonuses: spec.initiative_bonuses.clone(),
        save_bonuses: spec.save_bonuses.clone(),
        attunement: spec.attunement.clone(),
        attunement_note: if spec.attunement.is_empty() {
            String::new()
        } else {
            format!("{} / 3 слота.", spec.attunement.len())
        },
        armor_class_breakdown: spec.armor_class_breakdown.clone(),
        hit_dice,
        attacks: spec.attacks.clone(),
        features: spec.features.clone(),
        proficiencies: spec.proficiencies.clone(),
        notes: spec.notes.clone(),
        ..Profile::default()
    };

    Ok(Character {
        id: spec.id.clone(),
        kind: spec.kind,
        name: spec.name.trim().to_string(),
        title: spec.title.clone(),
        race: spec.species.clone(),
        classes: spec
            .classes
            .iter()
            .map(|c| ClassLevel {
                class: c.name.clone(),
                subclass: c.subclass.clone(),
                level: c.level,
            })
            .collect(),
        abilities: spec.abilities,
        hit_points: HitPoints { current: max_hp, max: max_hp, temporary: 0 },
        armor_class: spec.armor_class,
        speed_ft: spec.speed_ft,
        location: location.to_string(),
        resources,
        spellcasting,
        profile,
        inventory,
        edits: Vec::new(),
    })
}

/// Новая кампания: созданные герои, стартовый день и место.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Campaign {
    pub id: String,
    pub title: String,
    pub heroes: Vec<HeroSpec>,
}

/// Казна новой кампании: кошелёк отряда со стартовым золотом.
pub fn starting_treasury(day: u32, gold: u32) -> Treasury {
    let mut treasury = Treasury::new(
        "Казна отряда",
        vec![Location { id: "purse".into(), name: "При себе".into() }],
        vec![Asset {
            id: "gp".into(),
            name: "Золотые монеты".into(),
            kind: AssetKind::Coin,
            unit_value: gp(1),
        }],
    );
    if gold > 0 {
        treasury
            .record(NewEntry {
                day,
                time: None,
                asset_id: "gp".into(),
                location_id: "purse".into(),
                quantity: i64::from(gold),
                reason: "Стартовое золото героев".into(),
                source: EntrySource::Opening,
            })
            .expect("стартовая запись казны корректна");
    }
    treasury
}

/// Собирает отряд кампании. Первый герой-игрок обязателен.
pub fn build_party(campaign: &Campaign, location: &str) -> Result<Vec<Character>, EngineError> {
    if !campaign.heroes.iter().any(|h| h.kind == CharacterKind::Player) {
        return Err(EngineError::InvalidHero("в кампании нет героя игрока".into()));
    }
    let mut ids: Vec<&str> = campaign.heroes.iter().map(|h| h.id.as_str()).collect();
    ids.sort_unstable();
    if ids.windows(2).any(|w| w[0] == w[1]) {
        return Err(EngineError::InvalidHero("два героя с одним ID".into()));
    }
    campaign.heroes.iter().map(|h| build_hero(h, location)).collect()
}

#[cfg(test)]
pub(crate) mod tests {
    use super::*;
    use crate::profile::{Proficiency, Skill};
    use crate::spells::SpellClass;

    /// Высший эльф-волшебник 3 уровня (Воплотитель).
    pub(crate) fn wizard_spec() -> HeroSpec {
        let wizard = Caster::new(
            "wizard",
            "Волшебник",
            SpellClass::Wizard,
            Ability::Intelligence,
            3,
            Progression::Full,
            Preparation::Spellbook,
        )
        .cantrips(3, &["fire-bolt", "light", "mage-hand"])
        .known(
            None,
            &[
                "magic-missile",
                "shield",
                "mage-armor",
                "detect-magic",
                "sleep",
                "burning-hands",
                "misty-step",
                "scorching-ray",
                "shatter",
                "web",
            ],
        )
        .prepared(&["magic-missile", "shield", "mage-armor", "misty-step", "scorching-ray", "web"])
        .max_prepared(6);
        let mut elf = Caster::new(
            "species",
            "Эльфийское наследие",
            SpellClass::Wizard,
            Ability::Intelligence,
            3,
            Progression::Innate,
            Preparation::Prepared,
        )
        .cantrips(1, &["prestidigitation"])
        .always("Высший эльф", &["detect-magic"])
        .max_prepared(0);
        elf.expanded = Vec::new();
        HeroSpec {
            id: "pc.hero".into(),
            kind: CharacterKind::Player,
            name: "Ирэль".into(),
            title: String::new(),
            species: "Эльф (высший эльф)".into(),
            background: "Мудрец".into(),
            alignment: "Нейтральный добрый".into(),
            appearance: String::new(),
            portrait: "elf_f".into(),
            classes: vec![SpecClass {
                id: "wizard".into(),
                name: "Волшебник".into(),
                subclass: Some("Воплотитель".into()),
                level: 3,
                hit_die: 6,
            }],
            abilities: AbilityScores {
                strength: 8,
                dexterity: 14,
                constitution: 14,
                intelligence: 17,
                wisdom: 12,
                charisma: 10,
            },
            hp: SpecHp { rolls: vec![4, 4], per_level: 0, flat: 0 },
            armor_class: 12,
            armor_class_breakdown: vec![Bonus::new("Без доспеха", 10), Bonus::new("ЛОВ", 2)],
            speed_ft: 30,
            xp: 900,
            save_proficiencies: vec![Ability::Intelligence, Ability::Wisdom],
            skills: vec![
                SkillEntry {
                    skill: Skill::Arcana,
                    proficiency: Proficiency::Proficient,
                    source: "Мудрец".into(),
                    bonuses: Vec::new(),
                    advantage: Vec::new(),
                },
                SkillEntry {
                    skill: Skill::Perception,
                    proficiency: Proficiency::Proficient,
                    source: "Эльф".into(),
                    bonuses: Vec::new(),
                    advantage: Vec::new(),
                },
            ],
            initiative_bonuses: Vec::new(),
            attacks: Vec::new(),
            features: vec![Feature {
                name: "Магическое восстановление".into(),
                source: "Волшебник 1".into(),
                text: "Ячейки на коротком отдыхе.".into(),
                resource_id: Some("wizard.arcane_recovery".into()),
            }],
            proficiencies: vec![ProficiencyLine {
                kind: "Языки".into(),
                text: "Общий, эльфийский, драконий".into(),
                from_rules: true,
            }],
            resources: vec![
                SpecResource {
                    id: "wizard.arcane_recovery".into(),
                    name: "Магическое восстановление".into(),
                    max: 1,
                    recovery: Recovery::LongRest,
                },
                SpecResource {
                    id: "species.detect-magic".into(),
                    name: "Обнаружение магии (наследие)".into(),
                    max: 1,
                    recovery: Recovery::LongRest,
                },
            ],
            casters: vec![wizard, elf],
            granted: vec![GrantedSpell {
                spell_id: "detect-magic".into(),
                source: "Высший эльф".into(),
                resource_id: Some("species.detect-magic".into()),
                cast_level: 1,
                caster_id: Some("species".into()),
                slots_allowed: true,
            }],
            items: vec![SpecItem {
                name: "Книга заклинаний".into(),
                quantity: 1,
                category: "Снаряжение".into(),
                notes: String::new(),
            }],
            save_bonuses: Vec::new(),
            attunement: Vec::new(),
            notes: Vec::new(),
            draft: String::new(),
        }
    }

    #[test]
    fn valid_wizard_builds() {
        let spec = wizard_spec();
        assert_eq!(validate_hero(&spec), Vec::<String>::new());
        let hero = build_hero(&spec, "Тракт").unwrap();
        // 6 + 2 (1 ур.) + 4 + 2 + 4 + 2
        assert_eq!(hero.hit_points.max, 20);
        assert_eq!(hero.level(), 3);
        assert_eq!(hero.resource("slots.1").map(ResourcePool::max), Some(4));
        assert_eq!(hero.resource("slots.2").map(ResourcePool::max), Some(2));
        assert!(hero.resource("slots.3").is_none());
        assert_eq!(hero.profile.xp_next, Some(2_700));
        assert_eq!(hero.profile.hit_dice, vec![HitDice { die: 6, current: 3, total: 3 }]);
    }

    #[test]
    fn invalid_sheet_is_rejected_with_reasons() {
        let mut spec = wizard_spec();
        spec.abilities.intelligence = 21;
        spec.hp.rolls = vec![7, 4];
        spec.casters[0].prepared.push("fireball".into());
        spec.casters[0].cantrips.push("eldritch-blast".into());
        let errors = validate_hero(&spec);
        let all = errors.join(" | ");
        assert!(all.contains("ИНТ = 21"), "{all}");
        assert!(all.contains("значение 7 вне d6"), "{all}");
        assert!(all.contains("подготовлено 7 при лимите 6"), "{all}");
        assert!(all.contains("нет в книге"), "{all}");
        assert!(all.contains("нет в списке класса"), "{all}");
        assert!(build_hero(&spec, "x").is_err());
    }

    #[test]
    fn half_caster_2024_has_slots_from_first_level() {
        let paladin = Caster::new(
            "paladin",
            "Паладин",
            SpellClass::Paladin,
            Ability::Charisma,
            1,
            Progression::Half2024,
            Preparation::Prepared,
        )
        .max_prepared(2);
        let sc = Spellcasting { casters: vec![paladin], ..Spellcasting::default() };
        let pools = sc.slot_pools();
        assert_eq!(pools.len(), 1);
        assert_eq!(pools[0].max(), 2);
        let mut five = sc.clone();
        five.casters[0].level = 5;
        assert_eq!(five.casters[0].max_spell_level(), 2);
        let maxes: Vec<u32> = five.slot_pools().iter().map(ResourcePool::max).collect();
        assert_eq!(maxes, vec![4, 2]);
    }

    #[test]
    fn levels_follow_xp() {
        assert_eq!(level_for_xp(0), 1);
        assert_eq!(level_for_xp(899), 2);
        assert_eq!(level_for_xp(900), 3);
        assert_eq!(level_for_xp(355_000), 20);
    }

    #[test]
    fn one_on_short_rest_pool() {
        use crate::resource::RestKind;
        let mut rage = ResourcePool::new("barbarian.rage", "Ярость", 3, Recovery::OneOnShortRest);
        rage.spend(3).unwrap();
        assert!(rage.apply_rest(RestKind::Short));
        assert_eq!(rage.current(), 1);
        assert!(rage.apply_rest(RestKind::Long));
        assert_eq!(rage.current(), 3);
    }
}
