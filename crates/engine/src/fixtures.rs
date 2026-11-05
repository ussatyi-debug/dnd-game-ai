//! Демо-данные до появления импорта кампании и сохранений.
//!
//! Источник — лист персонажей кампании «Дом Стрэндж» на День 82: по механике лист является
//! главным источником (утверждённое правило разрешения противоречий).

use crate::character::{Ability, AbilityScores, Character, CharacterKind, ClassLevel, HitPoints};
use crate::resource::{Recovery, ResourcePool};
use crate::session::Scene;
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
    GrantedSpell {
        spell_id: spell.into(),
        source: source.into(),
        resource_id: resource.map(Into::into),
        cast_level: level,
        caster_id: Some("warlock".into()),
        slots_allowed: false,
    }
}

/// Заклинание черты, которое по её тексту можно накладывать и своими ячейками
/// («Затронутый Тенью», «Затронутый Феями»).
fn feat_spell(spell: &str, source: &str, resource: &str, level: u8) -> GrantedSpell {
    GrantedSpell { slots_allowed: true, ..granted(spell, source, Some(resource), level) }
}

fn scroll(spell: &str, level: u8, count: u32) -> ScrollStack {
    ScrollStack { spell_id: spell.into(), level, count, container: None }
}

/// Где начинается День 82. Строка «Текущая сцена: Мясной мост» в листе персонажей осталась
/// от Дня 46 (штурм красилен завершён в тот день). По правилу «по локациям — самые поздние
/// сведения» берутся хроника (вечер Дня 81) и заметки героя (график Дней 82–86).
pub const SCENE_LOCATION: &str = "Цитадель Кроу-Рок";

/// Обстановка начала Дня 82 по хронике и заметкам героя.
pub const SCENE_SITUATION: &str = "Утро Дня 82, Глава VI. Накануне вечером (День 81) сэр Никис \
вернулся в грот Кроу-Рока в лике Владыки Стрэнджа и вместе с Калебом и бухгалтером Вайгелем \
утвердил государственное устройство «Пять Столпов Альт-Вардена». Открыты вакансии: Старший \
Казначей Коронной Палаты, Земский Бургомистр посадов Шпиля, Коронный Судья-Асессор и \
Церемониймейстер Шпиля. На сегодня назначено прибытие кандидатов от барона Гуго фон Сталя \
(из «Стального Утёса» и Черноводья) — начинается смотр претендентов. Дальше по графику: \
День 83 — кандидаты от Старшины Хеккера и фактора Бранда (Вейденбург); День 84 — кандидаты от \
баронессы Элеоноры фон Хольц и Прокурора фон Рауха с первым обозом репараций на 20 000 ЗМ; \
День 85 — готова «Княжеская Астролябия Звёздного Моста» у Халида, прибывает делегация Мирры, \
отчёт Папаши Крота о слежке за Мадам Орели; День 86 — коронация в Серебряном Шпиле. Корвус \
как Хранитель Тайной Печати — в Шпиле (переход Звёздным Мостом из грота мгновенный), Гюнтер и \
Брокк — в Копях Альт-Вардена, Валерия — в Кроу-Роке. Штурм красилен у Мясного моста давно \
завершён (День 46).";

pub fn demo_scene() -> Scene {
    Scene {
        day: 82,
        time: Some("утро".into()),
        location: SCENE_LOCATION.into(),
        situation: SCENE_SITUATION.into(),
    }
}

/// Колдовство сэра Никиса: Колдун 7 (Исчадие), воззвания, «Затронутый Тенью», Окуляр, свитки.
fn nikis_spellcasting() -> Spellcasting {
    let warlock = Caster::new(
        "warlock",
        "Колдун",
        SpellClass::Warlock,
        Ability::Charisma,
        7,
        Progression::Pact,
        Preparation::Known,
    )
    .cantrips(3, &["eldritch-blast", "minor-illusion", "mage-hand"])
    .known(
        Some(8),
        &[
            "scorching-ray",
            "hellish-rebuke",
            "shadow-blade",
            "armor-of-agathys",
            "misty-step",
            "suggestion",
            "counterspell",
            "blight",
        ],
    )
    .expanded(
        "Покровитель: Исчадие",
        &[
            "burning-hands",
            "command",
            "blindness-deafness",
            "scorching-ray",
            "fireball",
            "stinking-cloud",
            "fire-shield",
            "wall-of-fire",
            "flame-strike",
            "hallow",
        ],
    )
    .item_bonus(2, "Жезл Хранителя Договора +2");

    Spellcasting {
        casters: vec![warlock],
        granted: vec![
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
        restorers: vec![SlotRestorer {
            resource_id: "item.pact_rod.slot".into(),
            label: "Жезл Хранителя Договора".into(),
            max_level: 5,
            pact_only: true,
        }],
        can_prepare: false,
    }
}

/// Сир Гюнтер: Паладин 8, Клятва Возмездия. В листе подготовлено 7 заклинаний при лимите 6
/// (ХАР +2 + половина уровня 4) — движок помечает превышение, а не скрывает его.
fn gunther_spellcasting() -> Spellcasting {
    Spellcasting {
        casters: vec![Caster::new(
            "paladin",
            "Паладин",
            SpellClass::Paladin,
            Ability::Charisma,
            8,
            Progression::Half,
            Preparation::Prepared,
        )
        .prepared(&[
            "bless",
            "shield-of-faith",
            "command",
            "find-steed",
            "protection-from-poison",
            "branding-smite",
            "magic-weapon",
        ])
        .always("Клятва Возмездия", &["bane", "hunters-mark", "hold-person", "misty-step"])],
        ..Spellcasting::default()
    }
}

/// Подготовленные заклинания Валерии по листу (13 = МДР 5 + уровень 8).
pub(crate) const VALERIA_PREPARED: &[&str] = &[
    "healing-word",
    "bless",
    "detect-magic",
    "detect-poison-and-disease",
    "zone-of-truth",
    "locate-object",
    "silence",
    "spiritual-weapon",
    "dispel-magic",
    "spirit-guardians",
    "sending",
    "divination",
    "banishment",
];

/// Сестра Валерия: Жрица 8, Домен Могилы. «Уход за умирающими» — доменный заговор сверх
/// четырёх жреческих.
fn valeria_spellcasting() -> Spellcasting {
    Spellcasting {
        casters: vec![Caster::new(
            "cleric",
            "Жрица",
            SpellClass::Cleric,
            Ability::Wisdom,
            8,
            Progression::Full,
            Preparation::Prepared,
        )
        .cantrips(5, &["spare-the-dying", "toll-the-dead", "sacred-flame", "guidance", "light"])
        .prepared(VALERIA_PREPARED)
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
            ],
        )],
        restorers: vec![SlotRestorer {
            resource_id: "item.pearl_of_power".into(),
            label: "Жемчужина Силы".into(),
            max_level: 3,
            pact_only: false,
        }],
        ..Spellcasting::default()
    }
}

/// Сэр Никис Стрэндж, 10 уровень (Плут 3 / Колдун 7).
pub fn demo_nikis() -> Character {
    Character {
        id: "pc.nikis".into(),
        kind: CharacterKind::Player,
        name: "Сэр Никис Стрэндж".into(),
        title: "Законный правящий Князь Альт-Вардена · Призрак Альт-Вардена".into(),
        race: "Человек".into(),
        classes: vec![
            class("Плут", Some("Фантом"), 3),
            class("Колдун", Some("Исчадие (Ксартас), Договор Цепи"), 7),
        ],
        // Интеллект: базовое 12, Обруч Интеллекта устанавливает 19.
        abilities: abilities([12, 14, 11, 19, 12, 15]),
        hit_points: hp(49, 8),
        armor_class: 18,
        speed_ft: 30,
        location: SCENE_LOCATION.into(),
        resources: with_slots(
            vec![
                ResourcePool::lucky(),
                pool("warlock.dark_ones_luck", "Удача Тёмного", 2, Recovery::LongRest),
                pool("rogue.wails_from_the_grave", "Вопли из могилы", 4, Recovery::LongRest),
                pool("item.pact_rod.slot", "Жезл: восстановление ячейки", 1, Recovery::LongRest),
                pool("item.ocular.hadar", "Окуляр: Голод Хадара", 1, Recovery::Daily),
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

/// Отряд Дома Стрэндж: сэр Никис, четыре спутника 8 уровня и фамильяр.
pub fn demo_party() -> Vec<Character> {
    vec![
        demo_nikis(),
        Character {
            id: "npc.corvus".into(),
            kind: CharacterKind::Companion,
            name: "Корвус «Немой»".into(),
            title: "Хранитель Тайной Печати и Первый Писец Двора".into(),
            race: "Человек".into(),
            classes: vec![class("Монах", Some("Путь Открытой Ладони"), 8)],
            abilities: abilities([12, 16, 14, 10, 16, 8]),
            hit_points: hp(59, 0),
            armor_class: 18,
            speed_ft: 50,
            location: "Серебряный Шпиль".into(),
            resources: vec![
                pool("monk.ki", "Очки Ци", 8, Recovery::ShortRest),
                pool("monk.wholeness_of_body", "Целостность тела", 1, Recovery::LongRest),
                pool("item.ki_beads", "Чётки: восстановить 2 Ци", 1, Recovery::Daily),
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
            classes: vec![class("Паладин", Some("Клятва Возмездия"), 8)],
            abilities: abilities([18, 10, 14, 10, 12, 14]),
            hit_points: hp(72, 0),
            armor_class: 22,
            speed_ft: 30,
            location: "Копи Альт-Вардена".into(),
            resources: with_slots(
                vec![
                    pool("paladin.lay_on_hands", "Наложение рук (хиты)", 40, Recovery::LongRest),
                    pool(
                        "paladin.channel_divinity",
                        "Канал Божественности",
                        1,
                        Recovery::ShortRest,
                    ),
                    pool("paladin.divine_sense", "Божественное чувство", 3, Recovery::LongRest),
                ],
                3,
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
            title: "Глава лазарета Кроу-Рока".into(),
            race: "Человек".into(),
            classes: vec![class("Жрица", Some("Домен Могилы"), 8)],
            abilities: abilities([12, 12, 14, 12, 20, 10]),
            hit_points: hp(59, 0),
            armor_class: 18,
            speed_ft: 30,
            location: "Цитадель Кроу-Рок".into(),
            resources: with_slots(
                vec![
                    pool("cleric.channel_divinity", "Канал Божественности", 2, Recovery::ShortRest),
                    pool("cleric.sentinel", "Часовой у двери смерти", 5, Recovery::LongRest),
                    pool("cleric.eyes_of_grave", "Взгляд за грань", 5, Recovery::LongRest),
                    pool("item.pearl_of_power", "Жемчужина Силы", 1, Recovery::Daily),
                ],
                3,
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
            title: "Сапёрный корпус · Нижний Бастион".into(),
            race: "Горный дварф".into(),
            classes: vec![class("Воин", Some("Мастер Боевых Искусств"), 8)],
            abilities: abilities([18, 12, 16, 10, 12, 8]),
            hit_points: hp(76, 0),
            armor_class: 19,
            speed_ft: 25,
            location: "Копи Альт-Вардена".into(),
            resources: vec![
                pool("fighter.superiority", "Кубы превосходства (d8)", 5, Recovery::ShortRest),
                pool("fighter.second_wind", "Второе дыхание", 1, Recovery::ShortRest),
                pool("fighter.action_surge", "Всплеск действий", 1, Recovery::ShortRest),
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
            location: SCENE_LOCATION.into(),
            resources: vec![],
            spellcasting: None,
            profile: sheets::yussach_profile(),
            inventory: sheets::empty_inventory(),
            edits: Vec::new(),
        },
    ]
}

const DAY_OPENING: u32 = 75;

/// Казна Дома Стрэндж по листу на День 82. Начальные остатки записаны на День 75,
/// а последующие операции (фонд «Серебряный Рассвет», доля «Северной Звезды» и др.)
/// — отдельными записями журнала, чтобы итог сходился с листом.
pub fn demo_treasury() -> Treasury {
    let locations = [
        ("purse", "При себе"),
        ("shadow_ring", "Кольцо Теневого Хранилища"),
        ("willow_safe", "Сейф особняка, ул. Зелёных Ив, 7"),
        ("crow_rock_vault", "Сокровищница Кроу-Рока"),
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
        ("sapphire", "Сапфир", AssetKind::Gem, gp(100)),
        ("amber", "Северный янтарь", AssetKind::Gem, gp(50)),
        ("river_pearls", "Речной жемчуг Лимана (россыпь)", AssetKind::Gem, gp(400)),
        ("select_gems", "Отборные самоцветы (набор)", AssetKind::Gem, gp(1_500)),
        ("moon_silver_ingot", "Лунное Адамантовое Серебро, слиток", AssetKind::Ingot, gp(1_000)),
        ("ether_core", "Сердечник адамантового эфира", AssetKind::Ingot, gp(500)),
        ("bedrock_ore", "Штуф коренной руды (не оценён)", AssetKind::Ingot, 0),
        ("vogel_mortgage", "Закладная полковника Фогеля", AssetKind::Note, gp(6_000)),
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

    let opening: [(&str, &str, i64); 22] = [
        ("purse", "gp", 500),
        ("purse", "select_gems", 1),
        ("purse", "river_pearls", 1),
        ("purse", "sapphire", 5),
        ("purse", "amber", 2),
        ("purse", "ring_wald", 1),
        ("purse", "ring_xavier", 1),
        ("purse", "ring_zubeir", 1),
        ("purse", "watch_eberhard", 1),
        ("shadow_ring", "diamond", 4),
        ("shadow_ring", "vogel_mortgage", 1),
        ("willow_safe", "gp", 2_000),
        ("willow_safe", "bills", 1),
        ("crow_rock_vault", "gp", 51_095),
        ("crow_rock_vault", "brock_deposit", 1),
        ("crow_rock_vault", "black_pearl", 12),
        ("crow_rock_vault", "diamond", 2),
        ("crow_rock_vault", "moon_silver_ingot", 25),
        ("crow_rock_vault", "ether_core", 3),
        ("crow_rock_vault", "bedrock_ore", 3),
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
                reason: "Начальный остаток (перенос кампании)".into(),
                source: EntrySource::Opening,
            })
            .expect("начальные остатки корректны");
    }

    let operations: [(u32, &str, &str, i64, &str); 5] = [
        (75, "crow_rock_vault", "gp", -5_000, "Фонд «Серебряный Рассвет» — мастеру Торвальду"),
        (75, "crow_rock_vault", "gp", -1_000, "Усиление пограничных разъездов"),
        (
            81,
            "crow_rock_vault",
            "moon_silver_ingot",
            -1,
            "Халиду аль-Басри на Княжескую Астролябию",
        ),
        (81, "purse", "gp", 480, "Первая доля прибыли мануфактуры «Северная Звезда» (40%)"),
        (81, "purse", "gp", -400, "Папаше Кроту на слежку за Мадам Орели"),
    ];
    for (day, location, asset, quantity, reason) in operations {
        treasury
            .record(NewEntry {
                day,
                time: None,
                asset_id: asset.into(),
                location_id: location.into(),
                quantity,
                reason: reason.into(),
                source: EntrySource::Master,
            })
            .expect("операции демо-казны корректны");
    }
    treasury
}
