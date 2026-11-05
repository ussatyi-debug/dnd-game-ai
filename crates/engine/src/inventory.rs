//! Инвентарь персонажа по местам хранения (контейнерам).
//!
//! Деньги и ценности учитывает казна; если место хранения общее с казной (сейф, сокровищница),
//! в контейнере показывается ссылка на казну, а не копия её содержимого. Свитки заклинаний
//! хранятся в книге заклинаний ([`crate::spellcasting::ScrollStack`]) и в инвентаре
//! показываются оттуда же, поэтому расход свитка сразу виден в обоих местах.

use crate::character::Character;
use crate::error::EngineError;
use crate::spells;
use crate::treasury::Treasury;

/// ID контейнера «При себе».
pub const ON_PERSON: &str = "on_person";

/// Место хранения.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Container {
    pub id: String,
    pub name: String,
    /// Вместимость, как в листе: «до 50 фунтов». Вес предметов не учитывается.
    pub capacity: String,
    pub note: String,
    /// Место хранения казны с тем же содержимым (ID из казны).
    pub treasury_location: Option<String>,
}

impl Container {
    pub fn new(id: &str, name: &str) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
            capacity: String::new(),
            note: String::new(),
            treasury_location: None,
        }
    }

    pub fn capacity(mut self, text: &str) -> Self {
        self.capacity = text.into();
        self
    }

    pub fn note(mut self, text: &str) -> Self {
        self.note = text.into();
        self
    }

    pub fn treasury(mut self, location_id: &str) -> Self {
        self.treasury_location = Some(location_id.into());
        self
    }
}

/// Предмет.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Item {
    pub id: String,
    pub name: String,
    pub quantity: u32,
    pub container: String,
    /// Группа внутри контейнера: «Оружие и боеприпасы», «Зелья».
    pub category: String,
    pub notes: String,
}

/// Инвентарь.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq, Default)]
pub struct Inventory {
    pub containers: Vec<Container>,
    pub items: Vec<Item>,
    #[cfg_attr(feature = "serde", serde(default))]
    next_id: u32,
}

/// Новый предмет (ID присваивает инвентарь).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct NewItem {
    pub name: String,
    pub quantity: u32,
    pub container: String,
    pub category: String,
    pub notes: String,
}

/// Строка предмета в виде инвентаря.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ItemLine {
    pub id: String,
    pub name: String,
    pub quantity: u32,
    pub notes: String,
    /// Свиток из книги заклинаний (только просмотр — расходуется через накладывание).
    pub scroll: bool,
}

/// Группа предметов внутри контейнера.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ItemGroup {
    pub category: String,
    pub items: Vec<ItemLine>,
}

/// Контейнер с содержимым.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ContainerView {
    pub id: String,
    pub name: String,
    pub capacity: String,
    pub note: String,
    pub groups: Vec<ItemGroup>,
    pub item_count: u32,
    /// Название места в казне и итог его ценностей в медных монетах.
    pub treasury_name: Option<String>,
    pub treasury_total: Option<i64>,
}

/// Инвентарь для интерфейса.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct InventoryView {
    pub character_id: String,
    pub containers: Vec<ContainerView>,
}

/// Название категории для свитков.
pub const SCROLL_CATEGORY: &str = "Свитки заклинаний";

fn normalize(s: &str) -> String {
    s.trim().to_lowercase().replace('ё', "е")
}

impl Inventory {
    pub fn new(containers: Vec<Container>) -> Self {
        Self { containers, items: Vec::new(), next_id: 1 }
    }

    pub fn container(&self, id: &str) -> Result<&Container, EngineError> {
        self.containers
            .iter()
            .find(|c| c.id == id)
            .ok_or_else(|| EngineError::UnknownContainer(id.to_string()))
    }

    /// Контейнер по ID или названию (без учёта регистра, допускается начало названия).
    pub fn find_container(&self, query: &str) -> Result<&Container, EngineError> {
        let q = normalize(query);
        self.containers
            .iter()
            .find(|c| c.id == query || normalize(&c.name) == q)
            .or_else(|| self.containers.iter().find(|c| normalize(&c.name).contains(&q)))
            .ok_or_else(|| EngineError::UnknownContainer(query.to_string()))
    }

    /// Предмет по ID или названию (точное совпадение важнее частичного).
    pub fn find_item(&self, query: &str) -> Result<&Item, EngineError> {
        let q = normalize(query);
        if let Some(item) = self.items.iter().find(|i| i.id == query || normalize(&i.name) == q) {
            return Ok(item);
        }
        let partial: Vec<&Item> =
            self.items.iter().filter(|i| normalize(&i.name).contains(&q)).collect();
        match partial.as_slice() {
            [one] => Ok(one),
            [] => Err(EngineError::UnknownItem(query.to_string())),
            many => Err(EngineError::AmbiguousItem {
                query: query.to_string(),
                options: many.iter().take(4).map(|i| i.name.clone()).collect(),
            }),
        }
    }

    /// Проверка инвентаря из сохранения: предметы лежат в известных местах, счётчик номеров
    /// после последнего предмета.
    pub fn validate_loaded(&mut self) -> Result<(), EngineError> {
        if let Some(item) =
            self.items.iter().find(|i| !self.containers.iter().any(|c| c.id == i.container))
        {
            return Err(EngineError::InvalidSave(format!(
                "предмет «{}» лежит в неизвестном месте «{}»",
                item.name, item.container
            )));
        }
        let last = self
            .items
            .iter()
            .filter_map(|i| i.id.strip_prefix("item.").and_then(|n| n.parse::<u32>().ok()))
            .max()
            .unwrap_or(0);
        self.next_id = self.next_id.max(last + 1);
        Ok(())
    }

    /// Добавляет предмет. Одинаковый предмет в том же контейнере складывается в стопку.
    pub fn add(&mut self, item: NewItem) -> Result<String, EngineError> {
        if item.quantity == 0 {
            return Err(EngineError::InvalidQuantity(0));
        }
        let name = item.name.trim();
        if name.is_empty() {
            return Err(EngineError::UnknownItem(String::new()));
        }
        self.container(&item.container)?;
        if let Some(existing) = self
            .items
            .iter_mut()
            .find(|i| i.container == item.container && normalize(&i.name) == normalize(name))
        {
            existing.quantity += item.quantity;
            return Ok(existing.id.clone());
        }
        let id = format!("item.{}", self.next_id);
        self.next_id += 1;
        self.items.push(Item {
            id: id.clone(),
            name: name.to_string(),
            quantity: item.quantity,
            container: item.container,
            category: if item.category.trim().is_empty() {
                "Прочее".into()
            } else {
                item.category.trim().to_string()
            },
            notes: item.notes,
        });
        Ok(id)
    }

    /// Убирает `quantity` штук; стопка из нуля предметов удаляется. Возвращает остаток.
    pub fn remove(&mut self, item_id: &str, quantity: u32) -> Result<u32, EngineError> {
        if quantity == 0 {
            return Err(EngineError::InvalidQuantity(0));
        }
        let index = self
            .items
            .iter()
            .position(|i| i.id == item_id)
            .ok_or_else(|| EngineError::UnknownItem(item_id.to_string()))?;
        let held = self.items[index].quantity;
        if quantity > held {
            return Err(EngineError::NotEnoughItems {
                item: self.items[index].name.clone(),
                held,
                requested: quantity,
            });
        }
        if quantity == held {
            self.items.remove(index);
            Ok(0)
        } else {
            self.items[index].quantity -= quantity;
            Ok(held - quantity)
        }
    }

    /// Перекладывает `quantity` штук в другой контейнер.
    pub fn move_item(
        &mut self,
        item_id: &str,
        quantity: u32,
        to: &str,
    ) -> Result<String, EngineError> {
        self.container(to)?;
        let item = self
            .items
            .iter()
            .find(|i| i.id == item_id)
            .cloned()
            .ok_or_else(|| EngineError::UnknownItem(item_id.to_string()))?;
        if item.container == to {
            return Err(EngineError::SameContainer);
        }
        self.remove(item_id, quantity)?;
        self.add(NewItem {
            name: item.name,
            quantity,
            container: to.to_string(),
            category: item.category,
            notes: item.notes,
        })
    }
}

impl Character {
    /// Инвентарь по контейнерам; свитки берутся из книги заклинаний.
    pub fn inventory_view(&self, treasury: &Treasury) -> InventoryView {
        let inv = &self.inventory;
        let scrolls = self.spellcasting.as_ref().map(|sc| sc.scrolls.as_slice()).unwrap_or(&[]);
        let containers = inv
            .containers
            .iter()
            .map(|c| {
                let mut groups: Vec<ItemGroup> = Vec::new();
                for item in inv.items.iter().filter(|i| i.container == c.id) {
                    let line = ItemLine {
                        id: item.id.clone(),
                        name: item.name.clone(),
                        quantity: item.quantity,
                        notes: item.notes.clone(),
                        scroll: false,
                    };
                    match groups.iter_mut().find(|g| g.category == item.category) {
                        Some(g) => g.items.push(line),
                        None => groups
                            .push(ItemGroup { category: item.category.clone(), items: vec![line] }),
                    }
                }
                let scroll_lines: Vec<ItemLine> = scrolls
                    .iter()
                    .filter(|s| s.count > 0)
                    .filter(|s| s.container.as_deref().unwrap_or(ON_PERSON) == c.id)
                    .map(|s| {
                        let name = spells::spell(&s.spell_id)
                            .map_or_else(|| s.spell_id.clone(), |m| m.name.to_string());
                        ItemLine {
                            id: format!("scroll.{}.{}", s.spell_id, s.level),
                            name: format!("Свиток: {name}"),
                            quantity: s.count,
                            notes: format!("{} круг", s.level),
                            scroll: true,
                        }
                    })
                    .collect();
                if !scroll_lines.is_empty() {
                    groups
                        .push(ItemGroup { category: SCROLL_CATEGORY.into(), items: scroll_lines });
                }
                let item_count = groups.iter().flat_map(|g| &g.items).map(|i| i.quantity).sum();
                let treasury_view = c
                    .treasury_location
                    .as_ref()
                    .and_then(|loc| treasury.view().locations.into_iter().find(|l| &l.id == loc));
                ContainerView {
                    id: c.id.clone(),
                    name: c.name.clone(),
                    capacity: c.capacity.clone(),
                    note: c.note.clone(),
                    groups,
                    item_count,
                    treasury_name: treasury_view.as_ref().map(|l| l.name.clone()),
                    treasury_total: treasury_view.map(|l| l.total),
                }
            })
            .collect();
        InventoryView { character_id: self.id.clone(), containers }
    }

    /// Краткая сводка инвентаря для контекста мастера: контейнер → предметы.
    pub fn inventory_summary(&self) -> Vec<(String, Vec<String>)> {
        self.inventory
            .containers
            .iter()
            .filter_map(|c| {
                let items: Vec<String> = self
                    .inventory
                    .items
                    .iter()
                    .filter(|i| i.container == c.id)
                    .map(|i| {
                        if i.quantity > 1 {
                            format!("{} ×{}", i.name, i.quantity)
                        } else {
                            i.name.clone()
                        }
                    })
                    .collect();
                (!items.is_empty()).then(|| (c.name.clone(), items))
            })
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::fixtures::{demo_nikis, demo_treasury};

    fn new_item(name: &str, quantity: u32, container: &str) -> NewItem {
        NewItem {
            name: name.into(),
            quantity,
            container: container.into(),
            category: String::new(),
            notes: String::new(),
        }
    }

    #[test]
    fn add_stacks_remove_and_move() {
        let mut inv = Inventory::new(vec![Container::new(ON_PERSON, "При себе"), {
            Container::new("bag", "Сумка").capacity("до 30 фунтов")
        }]);
        let id = inv.add(new_item("Зелье лечения", 2, ON_PERSON)).unwrap();
        assert_eq!(inv.add(new_item("зелье лечения", 1, ON_PERSON)).unwrap(), id);
        assert_eq!(inv.items[0].quantity, 3);
        assert_eq!(inv.items[0].category, "Прочее");
        let moved = inv.move_item(&id, 2, "bag").unwrap();
        assert_ne!(moved, id);
        assert_eq!(inv.items.iter().map(|i| i.quantity).sum::<u32>(), 3);
        assert_eq!(inv.remove(&id, 1).unwrap(), 0);
        assert!(inv.find_item(&id).is_err());
        assert!(matches!(inv.remove(&moved, 5), Err(EngineError::NotEnoughItems { .. })));
        assert!(inv.add(new_item("Камень", 1, "нигде")).is_err());
        assert_eq!(inv.move_item(&moved, 1, "bag"), Err(EngineError::SameContainer));
    }

    #[test]
    fn find_by_name_reports_ambiguity() {
        let mut inv = Inventory::new(vec![Container::new(ON_PERSON, "При себе")]);
        inv.add(new_item("Зелье Большого Исцеления", 1, ON_PERSON)).unwrap();
        inv.add(new_item("Зелье Героизма", 1, ON_PERSON)).unwrap();
        assert!(inv.find_item("героизма").is_ok());
        assert!(matches!(inv.find_item("зелье"), Err(EngineError::AmbiguousItem { .. })));
        assert_eq!(inv.find_container("при себе").unwrap().id, ON_PERSON);
    }

    #[test]
    fn nikis_inventory_by_containers_with_scrolls_and_treasury_links() {
        let nikis = demo_nikis();
        let view = nikis.inventory_view(&demo_treasury());
        let on_person = view.containers.iter().find(|c| c.id == ON_PERSON).unwrap();
        let scrolls = on_person.groups.iter().find(|g| g.category == SCROLL_CATEGORY).unwrap();
        assert!(scrolls.items.iter().all(|i| i.scroll));
        let ring = view.containers.iter().find(|c| c.id == "shadow_ring").unwrap();
        assert_eq!(ring.capacity, "до 50 фунтов");
        assert!(ring.treasury_total.unwrap() > 0);
        let ring_scrolls = ring.groups.iter().find(|g| g.category == SCROLL_CATEGORY).unwrap();
        assert_eq!(ring_scrolls.items.len(), 2);
        // Деньги не дублируются предметами: в контейнерах нет монет.
        assert!(!nikis.inventory.items.iter().any(|i| i.name.contains("ЗМ монет")));
    }
}
