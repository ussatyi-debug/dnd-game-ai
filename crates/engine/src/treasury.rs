//! Казна отряда: места хранения, ценности и журнал операций.
//!
//! Остатки не хранятся — они всегда вычисляются из журнала, поэтому цифры не могут
//! разойтись. Каждая запись помечена источником: мастер (через движок), игрок вручную
//! или начальный остаток при переносе кампании.

use crate::error::EngineError;

/// Стоимость в медных монетах: 1 ЗМ = 100 мм. Целые числа исключают ошибки округления.
pub type Copper = i64;

/// Перевод золотых монет в медные.
pub const fn gp(amount: i64) -> Copper {
    amount * 100
}

/// Вид ценности.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "snake_case"))]
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum AssetKind {
    /// Монеты.
    Coin,
    /// Самоцветы и жемчуг.
    Gem,
    /// Слитки и руда.
    Ingot,
    /// Векселя, депозиты, закладные.
    Note,
    /// Прочие ценности: перстни, часы, ткани.
    Valuable,
}

impl AssetKind {
    pub fn label(self) -> &'static str {
        match self {
            AssetKind::Coin => "Монеты",
            AssetKind::Gem => "Самоцветы",
            AssetKind::Ingot => "Слитки и руда",
            AssetKind::Note => "Векселя и депозиты",
            AssetKind::Valuable => "Ценности",
        }
    }
}

/// Ценность: монета, самоцвет, слиток. Стоимость за единицу — примерная.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Asset {
    pub id: String,
    pub name: String,
    pub kind: AssetKind,
    pub unit_value: Copper,
}

/// Место хранения.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Location {
    pub id: String,
    pub name: String,
}

/// Кто создал запись журнала.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "snake_case"))]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EntrySource {
    /// Начальный остаток при переносе кампании.
    Opening,
    /// Мастер через движок.
    Master,
    /// Игрок вручную.
    Manual,
}

/// Запись журнала: изменение количества одной ценности в одном месте.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Entry {
    pub id: u64,
    pub day: u32,
    pub time: Option<String>,
    pub asset_id: String,
    pub location_id: String,
    /// Приход (+) или расход (−) в единицах ценности.
    pub quantity: i64,
    pub reason: String,
    pub source: EntrySource,
    /// Общий номер у двух записей перемещения между местами.
    pub transfer: Option<u64>,
}

/// Новая запись (номер присваивает казна).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct NewEntry {
    pub day: u32,
    pub time: Option<String>,
    pub asset_id: String,
    pub location_id: String,
    pub quantity: i64,
    pub reason: String,
    pub source: EntrySource,
}

/// Казна.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Treasury {
    name: String,
    locations: Vec<Location>,
    assets: Vec<Asset>,
    entries: Vec<Entry>,
    next_id: u64,
}

/// Строка состава: ценность в месте хранения.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct HoldingLine {
    pub asset_id: String,
    pub name: String,
    pub kind: AssetKind,
    pub quantity: i64,
    pub unit_value: Copper,
    pub total: Copper,
}

/// Место хранения с содержимым.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LocationView {
    pub id: String,
    pub name: String,
    pub lines: Vec<HoldingLine>,
    pub total: Copper,
}

/// Итог по виду ценностей.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct KindTotal {
    pub kind: AssetKind,
    pub label: &'static str,
    pub total: Copper,
}

/// Запись журнала для интерфейса.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct EntryView {
    pub id: u64,
    pub day: u32,
    pub time: Option<String>,
    pub asset_name: String,
    pub kind: AssetKind,
    pub location_name: String,
    pub quantity: i64,
    pub value: Copper,
    pub reason: String,
    pub source: EntrySource,
    pub transfer: Option<u64>,
}

/// Полный вид казны.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct TreasuryView {
    pub name: String,
    pub locations: Vec<LocationView>,
    pub by_kind: Vec<KindTotal>,
    pub total: Copper,
    /// Журнал от новых записей к старым.
    pub entries: Vec<EntryView>,
    /// Все ценности и места хранения — для формы ручной записи.
    pub assets: Vec<Asset>,
    pub storage: Vec<Location>,
}

impl Treasury {
    pub fn new(name: impl Into<String>, locations: Vec<Location>, assets: Vec<Asset>) -> Self {
        Self { name: name.into(), locations, assets, entries: Vec::new(), next_id: 1 }
    }

    pub fn name(&self) -> &str {
        &self.name
    }

    pub fn entries(&self) -> &[Entry] {
        &self.entries
    }

    fn asset(&self, id: &str) -> Result<&Asset, EngineError> {
        self.assets
            .iter()
            .find(|a| a.id == id)
            .ok_or_else(|| EngineError::UnknownAsset(id.to_string()))
    }

    fn location(&self, id: &str) -> Result<&Location, EngineError> {
        self.locations
            .iter()
            .find(|l| l.id == id)
            .ok_or_else(|| EngineError::UnknownLocation(id.to_string()))
    }

    /// Количество ценности в месте хранения.
    pub fn quantity(&self, asset_id: &str, location_id: &str) -> i64 {
        self.entries
            .iter()
            .filter(|e| e.asset_id == asset_id && e.location_id == location_id)
            .map(|e| e.quantity)
            .sum()
    }

    /// Добавляет запись. Расход больше остатка отклоняется — казна не уходит в минус.
    pub fn record(&mut self, entry: NewEntry) -> Result<u64, EngineError> {
        self.validate(&entry)?;
        Ok(self.push(entry, None))
    }

    /// Перемещение между местами хранения: две записи с общим номером.
    #[allow(clippy::too_many_arguments)]
    pub fn transfer(
        &mut self,
        day: u32,
        time: Option<String>,
        asset_id: &str,
        quantity: i64,
        from: &str,
        to: &str,
        reason: &str,
        source: EntrySource,
    ) -> Result<u64, EngineError> {
        if quantity <= 0 {
            return Err(EngineError::InvalidQuantity(quantity));
        }
        let outgoing = NewEntry {
            day,
            time: time.clone(),
            asset_id: asset_id.to_string(),
            location_id: from.to_string(),
            quantity: -quantity,
            reason: reason.to_string(),
            source,
        };
        let incoming = NewEntry { location_id: to.to_string(), quantity, ..outgoing.clone() };
        self.validate(&outgoing)?;
        self.validate(&incoming)?;
        let group = self.next_id;
        self.push(outgoing, Some(group));
        self.push(incoming, Some(group));
        Ok(group)
    }

    fn validate(&self, entry: &NewEntry) -> Result<(), EngineError> {
        let asset = self.asset(&entry.asset_id)?;
        let location = self.location(&entry.location_id)?;
        if entry.quantity == 0 {
            return Err(EngineError::InvalidQuantity(0));
        }
        let held = self.quantity(&entry.asset_id, &entry.location_id);
        if held + entry.quantity < 0 {
            return Err(EngineError::InsufficientFunds {
                asset: asset.name.clone(),
                location: location.name.clone(),
                held,
                requested: -entry.quantity,
            });
        }
        Ok(())
    }

    fn push(&mut self, entry: NewEntry, transfer: Option<u64>) -> u64 {
        let id = self.next_id;
        self.next_id += 1;
        self.entries.push(Entry {
            id,
            day: entry.day,
            time: entry.time,
            asset_id: entry.asset_id,
            location_id: entry.location_id,
            quantity: entry.quantity,
            reason: entry.reason,
            source: entry.source,
            transfer,
        });
        id
    }

    /// Полный вид: состав по местам, итоги по видам, журнал.
    pub fn view(&self) -> TreasuryView {
        let mut kinds: Vec<AssetKind> = self.assets.iter().map(|a| a.kind).collect();
        kinds.sort();
        kinds.dedup();

        let locations: Vec<LocationView> = self
            .locations
            .iter()
            .map(|location| {
                let mut lines: Vec<HoldingLine> = self
                    .assets
                    .iter()
                    .filter_map(|asset| {
                        let quantity = self.quantity(&asset.id, &location.id);
                        (quantity != 0).then(|| HoldingLine {
                            asset_id: asset.id.clone(),
                            name: asset.name.clone(),
                            kind: asset.kind,
                            quantity,
                            unit_value: asset.unit_value,
                            total: quantity * asset.unit_value,
                        })
                    })
                    .collect();
                lines.sort_by(|a, b| a.kind.cmp(&b.kind).then(b.total.cmp(&a.total)));
                let total = lines.iter().map(|l| l.total).sum();
                LocationView { id: location.id.clone(), name: location.name.clone(), lines, total }
            })
            .filter(|l| !l.lines.is_empty())
            .collect();

        let by_kind: Vec<KindTotal> = kinds
            .into_iter()
            .map(|kind| KindTotal {
                kind,
                label: kind.label(),
                total: locations
                    .iter()
                    .flat_map(|l| &l.lines)
                    .filter(|line| line.kind == kind)
                    .map(|line| line.total)
                    .sum(),
            })
            .collect();

        let entries = self
            .entries
            .iter()
            .rev()
            .map(|e| {
                let asset = self.asset(&e.asset_id).ok();
                EntryView {
                    id: e.id,
                    day: e.day,
                    time: e.time.clone(),
                    asset_name: asset.map(|a| a.name.clone()).unwrap_or_else(|| e.asset_id.clone()),
                    kind: asset.map(|a| a.kind).unwrap_or(AssetKind::Valuable),
                    location_name: self
                        .location(&e.location_id)
                        .map(|l| l.name.clone())
                        .unwrap_or_else(|_| e.location_id.clone()),
                    quantity: e.quantity,
                    value: e.quantity * asset.map(|a| a.unit_value).unwrap_or(0),
                    reason: e.reason.clone(),
                    source: e.source,
                    transfer: e.transfer,
                }
            })
            .collect();

        TreasuryView {
            name: self.name.clone(),
            total: locations.iter().map(|l| l.total).sum(),
            locations,
            by_kind,
            entries,
            assets: self.assets.clone(),
            storage: self.locations.clone(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::fixtures::demo_treasury;

    fn small() -> Treasury {
        Treasury::new(
            "Тест",
            vec![
                Location { id: "purse".into(), name: "При себе".into() },
                Location { id: "safe".into(), name: "Сейф".into() },
            ],
            vec![
                Asset {
                    id: "gp".into(),
                    name: "Золото".into(),
                    kind: AssetKind::Coin,
                    unit_value: gp(1),
                },
                Asset {
                    id: "sapphire".into(),
                    name: "Сапфир".into(),
                    kind: AssetKind::Gem,
                    unit_value: gp(100),
                },
            ],
        )
    }

    fn entry(asset: &str, location: &str, quantity: i64) -> NewEntry {
        NewEntry {
            day: 1,
            time: None,
            asset_id: asset.into(),
            location_id: location.into(),
            quantity,
            reason: "тест".into(),
            source: EntrySource::Master,
        }
    }

    #[test]
    fn balances_are_computed_from_entries() {
        let mut t = small();
        t.record(entry("gp", "purse", 500)).unwrap();
        t.record(entry("gp", "purse", -120)).unwrap();
        t.record(entry("sapphire", "safe", 3)).unwrap();
        assert_eq!(t.quantity("gp", "purse"), 380);
        let view = t.view();
        assert_eq!(view.total, gp(380) + gp(300));
        assert_eq!(view.locations.len(), 2);
        assert_eq!(view.entries[0].asset_name, "Сапфир");
        assert_eq!(view.entries[0].value, gp(300));
    }

    #[test]
    fn overspending_is_rejected_without_changes() {
        let mut t = small();
        t.record(entry("gp", "purse", 50)).unwrap();
        let err = t.record(entry("gp", "purse", -51)).unwrap_err();
        assert_eq!(
            err,
            EngineError::InsufficientFunds {
                asset: "Золото".into(),
                location: "При себе".into(),
                held: 50,
                requested: 51
            }
        );
        assert_eq!(t.entries().len(), 1);
    }

    #[test]
    fn transfer_moves_between_locations() {
        let mut t = small();
        t.record(entry("gp", "purse", 100)).unwrap();
        let group =
            t.transfer(2, None, "gp", 40, "purse", "safe", "в сейф", EntrySource::Manual).unwrap();
        assert_eq!(t.quantity("gp", "purse"), 60);
        assert_eq!(t.quantity("gp", "safe"), 40);
        let transfers: Vec<_> = t.entries().iter().filter(|e| e.transfer == Some(group)).collect();
        assert_eq!(transfers.len(), 2);
        assert!(t.transfer(2, None, "gp", 61, "purse", "safe", "", EntrySource::Manual).is_err());
        assert!(t.transfer(2, None, "gp", 0, "purse", "safe", "", EntrySource::Manual).is_err());
    }

    #[test]
    fn unknown_ids_and_zero_quantity_are_rejected() {
        let mut t = small();
        assert_eq!(
            t.record(entry("ruby", "purse", 1)),
            Err(EngineError::UnknownAsset("ruby".into()))
        );
        assert_eq!(
            t.record(entry("gp", "moon", 1)),
            Err(EngineError::UnknownLocation("moon".into()))
        );
        assert_eq!(t.record(entry("gp", "purse", 0)), Err(EngineError::InvalidQuantity(0)));
    }

    #[test]
    fn demo_treasury_matches_day_82_sheet() {
        let t = demo_treasury();
        let view = t.view();
        let find = |location: &str, asset: &str| {
            view.locations
                .iter()
                .find(|l| l.id == location)
                .and_then(|l| l.lines.iter().find(|line| line.asset_id == asset))
                .map(|line| line.quantity)
        };
        assert_eq!(find("purse", "gp"), Some(580));
        assert_eq!(find("crow_rock_vault", "gp"), Some(45_095));
        assert_eq!(find("crow_rock_vault", "moon_silver_ingot"), Some(24));
        assert_eq!(find("shadow_ring", "diamond"), Some(4));
        let ingots = view.by_kind.iter().find(|k| k.kind == AssetKind::Ingot).unwrap();
        assert_eq!(ingots.total, gp(24_000) + gp(1_500));
        assert!(view.total > gp(100_000));
        // Журнал содержит и начальные остатки, и операции после них.
        assert!(view.entries.iter().any(|e| e.source == EntrySource::Opening));
        assert!(view.entries.iter().any(|e| e.source == EntrySource::Master && e.day == 81));
    }
}
