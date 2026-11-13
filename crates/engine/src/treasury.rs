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

/// Монета правил: ID, название, стоимость в медяках и то, как её называют мастер и игрок.
pub struct Coin {
    pub id: &'static str,
    pub name: &'static str,
    pub unit_value: Copper,
    pub aliases: &'static [&'static str],
}

/// Монеты D&D от крупной к мелкой. Синонимы — русские сокращения, слова и латинские коды.
pub const COINS: [Coin; 5] = [
    Coin {
        id: "pp",
        name: "Платиновые монеты",
        unit_value: 1_000,
        aliases: &["pp", "пм", "платина", "платиновая", "платиновые"],
    },
    Coin {
        id: "gp",
        name: "Золотые монеты",
        unit_value: 100,
        aliases: &["gp", "зм", "зол", "золото", "золотая", "золотые"],
    },
    Coin {
        id: "ep",
        name: "Электрумовые монеты",
        unit_value: 50,
        aliases: &["ep", "эм", "электрум", "электрумовая", "электрумовые"],
    },
    Coin {
        id: "sp",
        name: "Серебряные монеты",
        unit_value: 10,
        aliases: &["sp", "см", "ср", "сер", "серебро", "серебряная", "серебряные"],
    },
    Coin {
        id: "cp",
        name: "Медные монеты",
        unit_value: 1,
        aliases: &["cp", "мм", "мед", "медь", "медная", "медные"],
    },
];

/// Монета по ID, названию или сокращению: «sp», «см», «серебряные монеты».
pub fn coin_by_query(query: &str) -> Option<&'static Coin> {
    let q = normalize(query);
    let q = q.trim_end_matches('.');
    COINS.iter().find(|c| {
        c.id == q
            || normalize(c.name) == q
            || c.aliases.contains(&q)
            || q == format!("{} монет", c.aliases[1])
    })
}

/// Цена в медяках: «1 зм», «5 см», «2 зм 5 см», «10 gp». `None` — непонятная запись.
pub fn parse_price(text: &str) -> Option<Copper> {
    let text = normalize(text);
    let mut total: Copper = 0;
    let mut number: Option<Copper> = None;
    let mut parsed = false;
    for word in text.split(|c: char| c.is_whitespace() || c == ',' || c == '+') {
        let word = word.trim();
        if word.is_empty() {
            continue;
        }
        if let Ok(n) = word.parse::<Copper>() {
            if let Some(prev) = number.take() {
                // Два числа подряд: «1 2 зм» — непонятно.
                let _ = prev;
                return None;
            }
            number = Some(n);
            continue;
        }
        // Число и монета слитно: «5зм».
        let digits: String = word.chars().take_while(char::is_ascii_digit).collect();
        let (n, rest) = if digits.is_empty() {
            (number.take()?, word)
        } else {
            (digits.parse::<Copper>().ok()?, &word[digits.len()..])
        };
        let coin = coin_by_query(rest)?;
        total = total.checked_add(n.checked_mul(coin.unit_value)?)?;
        parsed = true;
    }
    // Голое число без монеты — золотые (так пишет мастер чаще всего).
    if let Some(n) = number {
        total = total.checked_add(n.checked_mul(100)?)?;
        parsed = true;
    }
    (parsed && total > 0).then_some(total)
}

/// Место хранения.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Location {
    pub id: String,
    pub name: String,
}

fn normalize(s: &str) -> String {
    s.trim().to_lowercase().replace('ё', "е")
}

fn find_named<'a, T>(
    items: &'a [T],
    query: &str,
    key: impl Fn(&T) -> (&String, &String),
) -> Option<&'a T> {
    let q = normalize(query);
    if q.is_empty() {
        return None;
    }
    if let Some(exact) = items.iter().find(|i| {
        let (id, name) = key(i);
        id == query.trim() || normalize(name) == q
    }) {
        return Some(exact);
    }
    let mut partial = items.iter().filter(|i| normalize(key(i).1).contains(&q));
    match (partial.next(), partial.next()) {
        (Some(one), None) => Some(one),
        _ => None,
    }
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
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
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

    pub fn assets(&self) -> &[Asset] {
        &self.assets
    }

    pub fn locations(&self) -> &[Location] {
        &self.locations
    }

    /// Ценность по ID или названию (точное совпадение, затем единственное частичное).
    pub fn find_asset(&self, query: &str) -> Result<&Asset, EngineError> {
        find_named(&self.assets, query, |a| (&a.id, &a.name))
            .ok_or_else(|| EngineError::UnknownAsset(query.to_string()))
    }

    /// Место хранения по ID или названию.
    pub fn find_location(&self, query: &str) -> Result<&Location, EngineError> {
        find_named(&self.locations, query, |l| (&l.id, &l.name))
            .ok_or_else(|| EngineError::UnknownLocation(query.to_string()))
    }

    /// Монета по запросу; если такой монеты в казне ещё нет — заводит её.
    /// Мастер часто платит серебром или медью там, где их не было: это не ошибка.
    pub fn ensure_coin(&mut self, query: &str) -> Result<&Asset, EngineError> {
        if let Some(coin) = coin_by_query(query) {
            if !self.assets.iter().any(|a| a.id == coin.id) {
                self.assets.push(Asset {
                    id: coin.id.to_string(),
                    name: coin.name.to_string(),
                    kind: AssetKind::Coin,
                    unit_value: coin.unit_value,
                });
            }
            let id = coin.id;
            return self
                .assets
                .iter()
                .find(|a| a.id == id)
                .ok_or_else(|| EngineError::UnknownAsset(query.to_string()));
        }
        self.find_asset(query)
    }

    /// Монеты места хранения: (ID, название, стоимость, остаток), от мелких к крупным.
    pub fn coins_at(&self, location_id: &str) -> Vec<(String, String, Copper, i64)> {
        let mut coins: Vec<(String, String, Copper, i64)> = self
            .assets
            .iter()
            .filter(|a| a.kind == AssetKind::Coin)
            .map(|a| {
                (a.id.clone(), a.name.clone(), a.unit_value, self.quantity(&a.id, location_id))
            })
            .filter(|(.., q)| *q > 0)
            .collect();
        coins.sort_by_key(|(.., value, _)| *value);
        coins
    }

    /// Новая ценность (например, трофейный самоцвет). ID должен быть уникальным.
    pub fn add_asset(&mut self, asset: Asset) -> Result<(), EngineError> {
        if asset.id.trim().is_empty() || asset.name.trim().is_empty() {
            return Err(EngineError::UnknownAsset(asset.id));
        }
        if self.assets.iter().any(|a| a.id == asset.id) {
            return Err(EngineError::DuplicateAsset(asset.id));
        }
        self.assets.push(asset);
        Ok(())
    }

    /// Проверка казны из сохранения: записи ссылаются на известные ценности и места,
    /// остатки не уходят в минус, счётчик номеров после последней записи.
    pub fn validate_loaded(&mut self) -> Result<(), EngineError> {
        let bad = |reason: String| EngineError::InvalidSave(format!("казна: {reason}"));
        for e in &self.entries {
            if !self.assets.iter().any(|a| a.id == e.asset_id) {
                return Err(bad(format!(
                    "запись {} — неизвестная ценность «{}»",
                    e.id, e.asset_id
                )));
            }
            if !self.locations.iter().any(|l| l.id == e.location_id) {
                return Err(bad(format!(
                    "запись {} — неизвестное место «{}»",
                    e.id, e.location_id
                )));
            }
        }
        for a in &self.assets {
            for l in &self.locations {
                let held = self.quantity(&a.id, &l.id);
                if held < 0 {
                    return Err(bad(format!("«{}» в «{}»: остаток {held}", a.name, l.name)));
                }
            }
        }
        let last = self.entries.iter().map(|e| e.id).max().unwrap_or(0);
        self.next_id = self.next_id.max(last + 1);
        Ok(())
    }

    /// Запись в обход проверок — для тестов загрузки повреждённых сохранений.
    #[cfg(test)]
    pub(crate) fn record_unchecked_for_test(&mut self, asset: &str, location: &str, quantity: i64) {
        self.push(
            NewEntry {
                day: 1,
                time: None,
                asset_id: asset.into(),
                location_id: location.into(),
                quantity,
                reason: String::new(),
                source: EntrySource::Manual,
            },
            None,
        );
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

    #[test]
    fn coins_are_found_by_short_names() {
        assert_eq!(coin_by_query("ср").unwrap().id, "sp");
        assert_eq!(coin_by_query("см").unwrap().id, "sp");
        assert_eq!(coin_by_query("Серебряные монеты").unwrap().id, "sp");
        assert_eq!(coin_by_query("GP").unwrap().id, "gp");
        assert_eq!(coin_by_query("мм").unwrap().id, "cp");
        assert!(coin_by_query("алмаз").is_none());
    }

    #[test]
    fn prices_are_parsed() {
        assert_eq!(parse_price("1 зм"), Some(100));
        assert_eq!(parse_price("5 см"), Some(50));
        assert_eq!(parse_price("2 зм 5 см"), Some(250));
        assert_eq!(parse_price("10gp"), Some(1_000));
        assert_eq!(parse_price("7"), Some(700), "голое число — золотые");
        assert_eq!(parse_price("бесплатно"), None);
        assert_eq!(parse_price("0 зм"), None);
    }

    #[test]
    fn missing_coin_is_created_on_demand() {
        let mut t = small();
        assert!(t.find_asset("sp").is_err());
        assert_eq!(t.ensure_coin("ср").unwrap().id, "sp");
        assert_eq!(t.ensure_coin("sp").unwrap().name, "Серебряные монеты");
        assert!(t.find_asset("алмаз").is_err());
    }

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
