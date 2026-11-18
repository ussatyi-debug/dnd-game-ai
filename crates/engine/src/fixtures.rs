//! Кампания «Дом Стрэндж» на утро Дня 98 (заливка данных владельца, 18.11.2026).
//!
//! Боевая часть листов — из «Копии … Листы персонажей» (правила 2024 года), состояние,
//! снаряжение и казна — из «Листов персонажей 1» (День 98). Где лист расходится с правилами
//! 2024 года, лист приведён к правилам (решения владельца 8 и 10), а расхождение записано
//! в заметки листа.

use crate::character::{Ability, AbilityScores, Character, CharacterKind, ClassLevel, HitPoints};
use crate::resource::{Recovery, ResourcePool};
use crate::session::{Mood, Scene};
use crate::sheets;
use crate::spellcasting::{
    Caster, GrantedSpell, Preparation, Progression, ScrollStack, SlotRestorer, Spellcasting,
};
use crate::spells::SpellClass;
use crate::treasury::{gp, Asset, AssetKind, EntrySource, Location, NewEntry, Treasury};

fn class(name: &str, subclass: Option<&str>, level: u32) -> ClassLevel {
    ClassLevel { class: name.into(), subclass: subclass.map(Into::into), level }
}

fn abilities(values: [u8; 6]) -> AbilityScores {
    let [strength, dexterity, constitution, intelligence, wisdom, charisma] = values;
    AbilityScores { strength, dexterity, constitution, intelligence, wisdom, charisma }
}

fn hp(max: u32, temporary: u32) -> HitPoints {
    HitPoints { current: max, max, temporary }
}

fn pool(id: &str, name: &str, max: u32, recovery: Recovery) -> ResourcePool {
    ResourcePool::new(id, name, max, recovery)
}

/// Ресурсы с пулами ячеек, вставленными после первых `before` ресурсов.
fn with_slots(
    mut resources: Vec<ResourcePool>,
    before: usize,
    sc: &Spellcasting,
) -> Vec<ResourcePool> {
    let tail = resources.split_off(before.min(resources.len()));
    resources.extend(sc.slot_pools());
    resources.extend(tail);
    resources
}

fn granted(spell: &str, source: &str, resource: Option<&str>, level: u8) -> GrantedSpell {
    granted_by("warlock", spell, source, resource, level)
}

fn granted_by(
    caster: &str,
    spell: &str,
    source: &str,
    resource: Option<&str>,
    level: u8,
) -> GrantedSpell {
    GrantedSpell {
        spell_id: spell.into(),
        source: source.into(),
        resource_id: resource.map(Into::into),
        cast_level: level,
        caster_id: Some(caster.into()),
        slots_allowed: false,
    }
}

/// Героическое вдохновение вида «Человек» (Находчивый, правила 2024 года).
fn heroic_inspiration() -> ResourcePool {
    pool(HEROIC_INSPIRATION_ID, "Героическое вдохновение", 1, Recovery::LongRest)
}

/// ID пула героического вдохновения.
pub const HEROIC_INSPIRATION_ID: &str = "species.heroic_inspiration";

/// Заклинание черты, которое по её тексту можно накладывать и своими ячейками
/// («Затронутый Тенью», «Затронутый Феями»).
fn feat_spell(spell: &str, source: &str, resource: &str, level: u8) -> GrantedSpell {
    GrantedSpell { slots_allowed: true, ..granted(spell, source, Some(resource), level) }
}

fn scroll(spell: &str, level: u8, count: u32) -> ScrollStack {
    ScrollStack { spell_id: spell.into(), level, count, container: None }
}

/// Где начинается День 98: конспиративный особняк Дома Стрэндж в Вейденбурге.
pub const SCENE_LOCATION: &str = "Вейденбург, ул. Зелёных Ив, 7";

/// Обстановка утра Дня 98 по вводной владельца.
pub const SCENE_SITUATION: &str = "День 98, 08:00, Глава VI. Вейденбург, конспиративный особняк \
Дома Стрэндж на ул. Зелёных Ив, 7 — подвал, экранированный соляными плитами. Корвус стоит у \
двери. Ночные пленники — Фабрицио Лоренци и матросы Таранто — переданы Триумвирату Соли через \
подземный шлюз, их фелюга лежит на дне Лимана. В Кольце Теневого Хранилища — шифры Коллегии \
Семи Навигаторов, письма Малика аль-Джабари, шифровальная книга Валленштейна и 2 080 зм. Через \
Соколиный Перстень Мысли отзывается Утопленник Морган: на рассвете у Багряной отмели потоплены \
4 бригантины Брагадина, караван Дожа Касима и шейхи Зулейки с серебром идут чистым морем. \
Открытые узлы дня. Сухой док № 1: Изабелла дель Торро, Клаус фон Цайс и Валерия ведут закладку \
броненосца (4\" наклонная броня под 45°, двухконтурный реактор); к вечеру мастер Халид в \
«Северной Звезде» закончит 7-й перстень. Подполье и Собор: Консильери Фубуа вчера выделил \
Папаше Кроту 500 зм на перевербовку банды Шрама (Красный Яр) и подставу Ван дер Хольтов; \
глашатаи Хеккера объявили о даре 2 000 зм собору Св. Юлиана; Юссач в Нойштадте передаёт ноту \
Архиепископу Иоахиму. Три Ключа и Сеть: на Астролябии ждут склеп Вольфрика Стрэнджа («Чёрного \
Ворона») в Ущелье Безмолвных Сосен у утёса Вороний Зуб (Третий Ключ к Шестому Столпу) и \
терминал в Карак-Думе за Хребтом Железных Рёбер. Гюнтер — на карауле в отеле «Золотой Фазан», \
Брокк — комендант обороны Кроу-Рока.";

/// День начала кампании.
pub const START_DAY: u32 = 98;

pub fn demo_scene() -> Scene {
    Scene {
        day: START_DAY,
        time: Some("08:00".into()),
        location: SCENE_LOCATION.into(),
        situation: SCENE_SITUATION.into(),
        now: String::new(),
        mood: Mood::Calm,
    }
}

/// Колдовство сэра Никиса: Колдун 9 (Исчадие, правила 2024 года), воззвания,
/// «Затронутый Тенью», Окуляр, свитки.
fn nikis_spellcasting() -> Spellcasting {
    let warlock = Caster::new(
        "warlock",
        "Колдун",
        SpellClass::Warlock,
        Ability::Charisma,
        9,
        Progression::Pact,
        Preparation::Known,
    )
    .cantrips(3, &["eldritch-blast", "minor-illusion", "mage-hand"])
    .known(
        Some(10),
        &[
            "scorching-ray",
            "hellish-rebuke",
            "shadow-blade",
            "armor-of-agathys",
            "far-step",
            "suggestion",
            "counterspell",
            "blight",
            "fireball",
            "synaptic-static",
        ],
    )
    .always(
        "Покровитель: Исчадие",
        &[
            "burning-hands",
            "command",
            "scorching-ray",
            "suggestion",
            "fireball",
            "stinking-cloud",
            "fire-shield",
            "wall-of-fire",
            "geas",
            "insect-plague",
        ],
    )
    .item_bonus(2, "Жезл Хранителя Договора +2");

    Spellcasting {
        casters: vec![warlock],
        granted: vec![
            granted("find-familiar", "Воззвание: Договор Цепи", None, 1),
            granted("disguise-self", "Воззвание: Маска многих обличий", None, 1),
            granted("speak-with-dead", "Воззвание: Шёпот могилы", None, 3),
            feat_spell(
                "invisibility",
                "Черта: Затронутый Тенью",
                "feat.shadow_touched.invisibility",
                2,
            ),
            feat_spell("cause-fear", "Черта: Затронутый Тенью", "feat.shadow_touched.fear", 1),
            granted("hunger-of-hadar", "Великий Окуляр", Some("item.ocular.hadar"), 3),
        ],
        scrolls: vec![
            scroll("counterspell", 3, 2),
            scroll("dispel-magic", 3, 2),
            scroll("wall-of-water", 3, 1),
            scroll("fire-shield", 4, 1),
            scroll("spider-climb", 2, 1),
            scroll("levitate", 2, 1),
            scroll("darkness", 2, 1),
            scroll("gust-of-wind", 2, 1),
            scroll("fog-cloud", 1, 1),
            scroll("fog-cloud", 2, 1),
            scroll("inflict-wounds", 1, 1),
            scroll("detect-magic", 1, 1),
            scroll("identify", 1, 1),
            ScrollStack { container: Some("shadow_ring".into()), ..scroll("wall-of-force", 5, 1) },
            ScrollStack {
                container: Some("shadow_ring".into()),
                ..scroll("globe-of-invulnerability", 6, 1)
            },
        ],
        restorers: vec![
            SlotRestorer {
                resource_id: "item.pact_rod.slot".into(),
                label: "Жезл Хранителя Договора".into(),
                max_level: 5,
                pact_only: true,
            },
            // Половина ячеек договора с округлением вверх: при 2 ячейках — одна.
            SlotRestorer {
                resource_id: MAGICAL_CUNNING_ID.into(),
                label: "Магическое коварство".into(),
                max_level: 5,
                pact_only: true,
            },
        ],
        can_prepare: false,
    }
}

/// ID пула «Магического коварства» колдуна (правила 2024 года).
pub const MAGICAL_CUNNING_ID: &str = "warlock.magical_cunning";

/// Сир Гюнтер: Паладин 10, Клятва Возмездия (правила 2024 года: 9 подготовленных).
fn gunther_spellcasting() -> Spellcasting {
    Spellcasting {
        casters: vec![Caster::new(
            "paladin",
            "Паладин",
            SpellClass::Paladin,
            Ability::Charisma,
            10,
            Progression::Half2024,
            Preparation::Prepared,
        )
        .prepared(GUNTHER_PREPARED)
        .max_prepared(9)
        .always("Паладин", &["divine-smite", "find-steed"])
        .always(
            "Клятва Возмездия",
            &[
                "bane",
                "hunters-mark",
                "hold-person",
                "misty-step",
                "haste",
                "protection-from-energy",
            ],
        )],
        granted: vec![
            granted_by(
                "paladin",
                "divine-smite",
                "Паладин: Божественная кара",
                Some("paladin.free_smite"),
                1,
            ),
            granted_by(
                "paladin",
                "find-steed",
                "Паладин: Верный скакун",
                Some("paladin.faithful_steed"),
                2,
            ),
        ],
        ..Spellcasting::default()
    }
}

/// Подготовленные заклинания Гюнтера по листу (правила 2024 года).
pub(crate) const GUNTHER_PREPARED: &[&str] = &[
    "bless",
    "shield-of-faith",
    "command",
    "cure-wounds",
    "protection-from-poison",
    "magic-weapon",
    "shining-smite",
    "aura-of-vitality",
    "revivify",
];

/// Подготовленные заклинания Валерии по листу: 15 по правилам 2024 года, «Послание» остаётся
/// (решение владельца 9).
pub(crate) const VALERIA_PREPARED: &[&str] = &[
    "healing-word",
    "cure-wounds",
    "bless",
    "spiritual-weapon",
    "silence",
    "zone-of-truth",
    "spirit-guardians",
    "dispel-magic",
    "remove-curse",
    "sending",
    "banishment",
    "divination",
    "mass-cure-wounds",
    "greater-restoration",
    "flame-strike",
];

/// Сестра Валерия: Жрица 10, Домен Могилы (заклинания домена 2014 года в шаблоне жреца 2024),
/// Божественный орден «Тауматург» (+1 заговор), «Посвящённый в магию» (друид).
fn valeria_spellcasting() -> Spellcasting {
    let mut initiate = Caster::new(
        "druid_mi",
        "Посвящённый в магию (друид)",
        SpellClass::Druid,
        Ability::Wisdom,
        10,
        Progression::Innate,
        Preparation::Prepared,
    )
    .cantrips(2, &["thorn-whip", "druidcraft"])
    .max_prepared(0);
    initiate.expanded = Vec::new();
    Spellcasting {
        casters: vec![
            Caster::new(
                "cleric",
                "Жрица",
                SpellClass::Cleric,
                Ability::Wisdom,
                10,
                Progression::Full,
                Preparation::Prepared,
            )
            .cantrips(
                6,
                &[
                    "sacred-flame",
                    "toll-the-dead",
                    "spare-the-dying",
                    "guidance",
                    "thaumaturgy",
                    "light",
                ],
            )
            .prepared(VALERIA_PREPARED)
            .max_prepared(15)
            .attack_item_bonus(1, "Палочка военного мага +1")
            .always(
                "Домен Могилы",
                &[
                    "bane",
                    "false-life",
                    "gentle-repose",
                    "ray-of-enfeeblement",
                    "revivify",
                    "vampiric-touch",
                    "blight",
                    "death-ward",
                    "antilife-shell",
                    "raise-dead",
                ],
            ),
            initiate,
        ],
        granted: vec![GrantedSpell {
            slots_allowed: true,
            ..granted_by(
                "druid_mi",
                "healing-word",
                "Черта: Посвящённый в магию (друид)",
                Some("feat.magic_initiate"),
                1,
            )
        }],
        restorers: vec![SlotRestorer {
            resource_id: "item.pearl_of_power".into(),
            label: "Жемчужина Силы".into(),
            max_level: 3,
            pact_only: false,
        }],
        ..Spellcasting::default()
    }
}

/// Сэр Никис Стрэндж, 12 уровень (Плут 3 / Колдун 9), правила 2024 года.
pub fn demo_nikis() -> Character {
    Character {
        id: "pc.nikis".into(),
        kind: CharacterKind::Player,
        name: "Сэр Никис Стрэндж".into(),
        title: "Законный правящий Князь Альт-Вардена · Призрак Альт-Вардена".into(),
        race: "Человек".into(),
        classes: vec![
            class("Плут", Some("Фантом"), 3),
            class("Колдун", Some("Исчадие (Ксартас), Договор Цепи"), 9),
        ],
        // Интеллект: базовое 12, Обруч Интеллекта устанавливает 19.
        abilities: abilities([12, 14, 11, 19, 12, 15]),
        hit_points: hp(59, 11),
        armor_class: 18,
        speed_ft: 30,
        location: SCENE_LOCATION.into(),
        resources: with_slots(
            vec![
                ResourcePool::lucky(5),
                heroic_inspiration(),
                pool("warlock.dark_ones_luck", "Удача Тёмного", 2, Recovery::LongRest),
                pool(MAGICAL_CUNNING_ID, "Магическое коварство", 1, Recovery::LongRest),
                pool("invocation.tomb_of_levistus", "Гробница Левистуса", 1, Recovery::ShortRest),
                pool("rogue.wails_from_the_grave", "Вопли из могилы", 5, Recovery::LongRest),
                pool("feat.metamagic_adept", "Единицы чародейства", 2, Recovery::LongRest),
                pool("item.pact_rod.slot", "Жезл: восстановление ячейки", 1, Recovery::LongRest),
                pool("item.ocular.hadar", "Окуляр: Голод Хадара", 1, Recovery::Daily),
                pool("item.sunset_blade.step", "Клинок: прыжок сквозь Саван", 1, Recovery::Daily),
                pool("item.astrolabe.return", "Астролябия: Эфирный Возврат", 1, Recovery::LongRest),
                pool(
                    "feat.shadow_touched.invisibility",
                    "Невидимость (Затронутый Тенью)",
                    1,
                    Recovery::LongRest,
                ),
                pool(
                    "feat.shadow_touched.fear",
                    "Вызывание страха (Затронутый Тенью)",
                    1,
                    Recovery::LongRest,
                ),
            ],
            1,
            &nikis_spellcasting(),
        ),
        spellcasting: Some(nikis_spellcasting()),
        profile: sheets::nikis_profile(),
        inventory: sheets::nikis_inventory(),
        edits: Vec::new(),
    }
}

/// Отряд Дома Стрэндж: сэр Никис, четыре спутника 10 уровня и фамильяр.
pub fn demo_party() -> Vec<Character> {
    vec![
        demo_nikis(),
        Character {
            id: "npc.corvus".into(),
            kind: CharacterKind::Companion,
            name: "Корвус «Немой»".into(),
            title: "Хранитель Тайной Печати и Первый Писец Двора".into(),
            race: "Человек".into(),
            classes: vec![class("Монах", Some("Воин Открытой Ладони"), 10)],
            abilities: abilities([12, 18, 14, 10, 16, 8]),
            hit_points: hp(73, 0),
            armor_class: 19,
            speed_ft: 50,
            location: SCENE_LOCATION.into(),
            resources: vec![
                pool("monk.ki", "Очки концентрации", 10, Recovery::ShortRest),
                pool("monk.uncanny_metabolism", "Невероятный метаболизм", 1, Recovery::LongRest),
                pool("monk.wholeness_of_body", "Целостность тела", 3, Recovery::LongRest),
                heroic_inspiration(),
                pool("item.ki_beads", "Чётки: восстановить 2 очка", 1, Recovery::Daily),
            ],
            spellcasting: None,
            profile: sheets::corvus_profile(),
            inventory: sheets::corvus_inventory(),
            edits: Vec::new(),
        },
        Character {
            id: "npc.gunther".into(),
            kind: CharacterKind::Companion,
            name: "Сир Гюнтер «Бастион»".into(),
            title: "Командир Латной Гвардии Шпиля".into(),
            race: "Человек".into(),
            classes: vec![class("Паладин", Some("Клятва Возмездия"), 10)],
            abilities: abilities([18, 10, 14, 10, 12, 16]),
            hit_points: hp(104, 0),
            armor_class: 22,
            speed_ft: 30,
            location: "Вейденбург, отель «Золотой Фазан»".into(),
            resources: with_slots(
                vec![
                    pool("paladin.lay_on_hands", "Наложение рук (хиты)", 50, Recovery::LongRest),
                    pool(
                        "paladin.channel_divinity",
                        "Канал Божественности",
                        2,
                        Recovery::OneOnShortRest,
                    ),
                    pool(
                        "paladin.free_smite",
                        "Божественная кара без ячейки",
                        1,
                        Recovery::LongRest,
                    ),
                    pool(
                        "paladin.faithful_steed",
                        "Верный скакун без ячейки",
                        1,
                        Recovery::LongRest,
                    ),
                    heroic_inspiration(),
                ],
                5,
                &gunther_spellcasting(),
            ),
            spellcasting: Some(gunther_spellcasting()),
            profile: sheets::gunther_profile(),
            inventory: sheets::gunther_inventory(),
            edits: Vec::new(),
        },
        Character {
            id: "npc.valeria".into(),
            kind: CharacterKind::Companion,
            name: "Сестра Валерия «Пепельная Дева»".into(),
            title: "Око Инквизиции · при адмирале Изабелле дель Торро".into(),
            race: "Человек".into(),
            classes: vec![class("Жрица", Some("Домен Могилы"), 10)],
            abilities: abilities([12, 12, 14, 12, 20, 10]),
            hit_points: hp(73, 0),
            armor_class: 18,
            speed_ft: 30,
            location: "Вейденбург, верфи (сухой док № 1)".into(),
            resources: with_slots(
                vec![
                    pool(
                        "cleric.channel_divinity",
                        "Канал Божественности",
                        3,
                        Recovery::OneOnShortRest,
                    ),
                    pool(
                        "cleric.divine_intervention",
                        "Божественное вмешательство",
                        1,
                        Recovery::LongRest,
                    ),
                    pool("cleric.sentinel", "Часовой у двери смерти", 5, Recovery::LongRest),
                    pool("cleric.eyes_of_grave", "Взгляд за грань", 5, Recovery::LongRest),
                    pool("feat.magic_initiate", "Лечащее слово без ячейки", 1, Recovery::LongRest),
                    heroic_inspiration(),
                    pool("item.pearl_of_power", "Жемчужина Силы", 1, Recovery::Daily),
                ],
                4,
                &valeria_spellcasting(),
            ),
            spellcasting: Some(valeria_spellcasting()),
            profile: sheets::valeria_profile(),
            inventory: sheets::valeria_inventory(),
            edits: Vec::new(),
        },
        Character {
            id: "npc.brokk".into(),
            kind: CharacterKind::Companion,
            name: "Брокк Железнолом".into(),
            title: "Комендант обороны Кроу-Рока".into(),
            race: "Дварф".into(),
            classes: vec![class("Воин", Some("Мастер Боевых Искусств"), 10)],
            abilities: abilities([20, 12, 16, 10, 12, 8]),
            hit_points: hp(124, 0),
            armor_class: 20,
            speed_ft: 30,
            location: "Цитадель Кроу-Рок".into(),
            resources: vec![
                pool("fighter.superiority", "Кубы превосходства (d10)", 5, Recovery::ShortRest),
                pool("fighter.second_wind", "Второе дыхание", 4, Recovery::OneOnShortRest),
                pool("fighter.action_surge", "Всплеск действий", 1, Recovery::ShortRest),
                pool("fighter.indomitable", "Несгибаемый", 1, Recovery::LongRest),
                pool("fighter.know_your_enemy", "Познай своего врага", 1, Recovery::LongRest),
                pool("species.stonecunning", "Чувство камня", 4, Recovery::LongRest),
                pool("item.titan_helm", "Шлем Горного Титана", 1, Recovery::Daily),
            ],
            spellcasting: None,
            profile: sheets::brokk_profile(),
            inventory: sheets::brokk_inventory(),
            edits: Vec::new(),
        },
        Character {
            id: "npc.yussach".into(),
            kind: CharacterKind::Familiar,
            name: "Юссач".into(),
            title: "Квазит, фамильяр Договора Цепи".into(),
            race: "Исчадие (квазит)".into(),
            classes: vec![],
            abilities: abilities([5, 17, 10, 7, 10, 10]),
            hit_points: hp(7, 0),
            armor_class: 13,
            speed_ft: 40,
            location: "Нойштадт".into(),
            resources: vec![],
            spellcasting: None,
            profile: sheets::yussach_profile(),
            inventory: sheets::empty_inventory(),
            edits: Vec::new(),
        },
    ]
}

const DAY_OPENING: u32 = START_DAY;

/// Казна Дома Стрэндж по «Листам персонажей 1» на утро Дня 98: начальные остатки.
/// Самоцветы: «1 500 зм в самоцветах», «камни и жемчуг на 1 000 зм» и «4 алмаза на 4 000 зм» —
/// разные ценности (решение владельца 12); состав первых задан при заливке. Слитки Лунного
/// Серебра ушли с караваном в Мирру (24 шт.), остаток в листе не указан — в казне их нет.
pub fn demo_treasury() -> Treasury {
    let locations = [
        ("purse", "При себе"),
        ("shadow_ring", "Кольцо Теневого Хранилища"),
        ("willow_safe", "Сейф особняка, ул. Зелёных Ив, 7"),
        ("crow_rock_vault", "Сокровищница Кроу-Рока"),
        ("spire_treasury", "Казна Серебряного Шпиля"),
        ("concordat_flagship", "Казна Конкордата (флагман в Кашаре)"),
        ("fleet_stores", "Склады флота"),
    ]
    .into_iter()
    .map(|(id, name)| Location { id: id.into(), name: name.into() })
    .collect();

    let assets = [
        ("gp", "Золотые монеты", AssetKind::Coin, gp(1)),
        ("diamond", "Алмаз", AssetKind::Gem, gp(1_000)),
        ("black_pearl", "Чёрная жемчужина", AssetKind::Gem, gp(250)),
        ("emerald", "Изумруд", AssetKind::Gem, gp(500)),
        ("fire_opal", "Огненный опал", AssetKind::Gem, gp(500)),
        ("sapphire", "Сапфир Сапфирового Берега", AssetKind::Gem, gp(100)),
        ("amber", "Северный янтарь", AssetKind::Gem, gp(50)),
        ("river_pearls", "Речной жемчуг Лимана (россыпь)", AssetKind::Gem, gp(400)),
        ("moon_silver_ingot", "Лунное Адамантовое Серебро, слиток", AssetKind::Ingot, gp(1_000)),
        ("ether_core", "Сердечник адамантового эфира", AssetKind::Ingot, gp(500)),
        ("bedrock_ore", "Штуф коренной руды (не оценён)", AssetKind::Ingot, 0),
        ("vogel_mortgage", "Закладная полковника Фогеля", AssetKind::Note, gp(6_000)),
        ("brock_bill", "Вексель банка Брок", AssetKind::Note, gp(2_500)),
        ("bills", "Векселя", AssetKind::Note, gp(12_300)),
        ("brock_deposit", "Депозиты Банка Броков", AssetKind::Note, gp(14_000)),
        ("ring_wald", "Перстень-печатка канцлера Вальда", AssetKind::Valuable, gp(150)),
        ("ring_xavier", "Рубиновый перстень Коллегии Арканы", AssetKind::Valuable, gp(150)),
        (
            "ring_zubeir",
            "Сапфировый перстень командующего Аль-Зубейр",
            AssetKind::Valuable,
            gp(250),
        ),
        ("watch_eberhard", "Серебряные часы Эберхарда", AssetKind::Valuable, gp(80)),
        ("sapphire_silk", "Тюк сапфирового шёлка", AssetKind::Valuable, gp(30)),
    ]
    .into_iter()
    .map(|(id, name, kind, unit_value)| Asset {
        id: id.into(),
        name: name.into(),
        kind,
        unit_value,
    })
    .collect();

    let mut treasury = Treasury::new("Казна Дома Стрэндж", locations, assets);

    let opening: [(&str, &str, i64); 24] = [
        // «1 500 зм в самоцветах».
        ("purse", "emerald", 2),
        ("purse", "fire_opal", 1),
        // «Камни и жемчуг на 1 000 зм».
        ("purse", "river_pearls", 1),
        ("purse", "sapphire", 5),
        ("purse", "amber", 2),
        ("purse", "ring_wald", 1),
        ("purse", "ring_xavier", 1),
        ("purse", "ring_zubeir", 1),
        ("purse", "watch_eberhard", 1),
        ("shadow_ring", "gp", 2_080),
        ("shadow_ring", "diamond", 4),
        ("shadow_ring", "vogel_mortgage", 1),
        ("shadow_ring", "brock_bill", 1),
        ("willow_safe", "gp", 2_000),
        ("willow_safe", "bills", 1),
        ("crow_rock_vault", "gp", 33_095),
        ("crow_rock_vault", "brock_deposit", 1),
        // «Жемчуг и алмазы на 5 000 зм».
        ("crow_rock_vault", "black_pearl", 12),
        ("crow_rock_vault", "diamond", 2),
        ("crow_rock_vault", "ether_core", 3),
        ("crow_rock_vault", "bedrock_ore", 3),
        ("spire_treasury", "gp", 32_040),
        ("concordat_flagship", "gp", 7_500),
        ("fleet_stores", "sapphire_silk", 12),
    ];
    for (location, asset, quantity) in opening {
        treasury
            .record(NewEntry {
                day: DAY_OPENING,
                time: None,
                asset_id: asset.into(),
                location_id: location.into(),
                quantity,
                reason: "Начальный остаток (День 98, листы владельца)".into(),
                source: EntrySource::Opening,
            })
            .expect("начальные остатки корректны");
    }
    treasury
}
