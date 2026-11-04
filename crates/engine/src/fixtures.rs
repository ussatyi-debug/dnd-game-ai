//! Демо-персонаж до появления импорта кампании и сохранений.
//!
//! Данные — из листа персонажа кампании «Дом Стрэндж» на День 82: по механике лист
//! является главным источником (утверждённое правило разрешения противоречий).

use crate::character::{AbilityScores, Character, ClassLevel, HitPoints};
use crate::resource::{Recovery, ResourcePool};

/// Сэр Никис Стрэндж, 10 уровень (Плут 3 / Колдун 7).
pub fn demo_nikis() -> Character {
    Character::new(
        "pc.nikis",
        "Сэр Никис Стрэндж",
        "Законный правящий Князь Альт-Вардена · Призрак Альт-Вардена",
        vec![
            ClassLevel {
                class: "Плут".into(), subclass: Some("Фантом".into()), level: 3
            },
            ClassLevel {
                class: "Колдун".into(),
                subclass: Some("Исчадие (Ксартас), Договор Цепи".into()),
                level: 7,
            },
        ],
        AbilityScores {
            strength: 12,
            dexterity: 14,
            constitution: 11,
            // Базовое 12, Обруч Интеллекта устанавливает 19.
            intelligence: 19,
            wisdom: 12,
            charisma: 15,
        },
        HitPoints { current: 49, max: 49, temporary: 8 },
        18,
        30,
        vec![
            ResourcePool::lucky(),
            ResourcePool::new("warlock.slots", "Ячейки колдуна (4 круг)", 2, Recovery::ShortRest),
            ResourcePool::new("warlock.dark_ones_luck", "Удача Тёмного", 2, Recovery::LongRest),
            ResourcePool::new(
                "rogue.wails_from_the_grave",
                "Вопли из могилы",
                4,
                Recovery::LongRest,
            ),
            ResourcePool::new(
                "item.pact_rod.slot",
                "Жезл: восстановление ячейки",
                1,
                Recovery::LongRest,
            ),
            ResourcePool::new("item.ocular.hadar", "Окуляр: Голод Хадара", 1, Recovery::Daily),
            ResourcePool::new(
                "feat.shadow_touched.invisibility",
                "Невидимость (Затронутый Тенью)",
                1,
                Recovery::LongRest,
            ),
            ResourcePool::new(
                "feat.shadow_touched.fear",
                "Вызов страха (Затронутый Тенью)",
                1,
                Recovery::LongRest,
            ),
        ],
    )
}
