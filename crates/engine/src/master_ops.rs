//! Действия ИИ-мастера над состоянием: хиты, ресурсы, состояния, казна, инвентарь, сцена,
//! отдых и записи в базу знаний. Каждое действие проверяется движком и пишется в журнал;
//! ход мастера можно отменить целиком.

use crate::character::{Character, HitPoints};
use crate::error::EngineError;
use crate::inventory::{InventoryView, NewItem};
use crate::knowledge::{CustomCard, KbOverride, MasterNote};
use crate::profile::SheetDetails;
use crate::resource::{ResourcePool, RestKind};
use crate::session::{Scene, Session};
use crate::treasury::{Asset, AssetKind, EntrySource, NewEntry, Treasury};

/// Изменение хитов.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum HpChange {
    /// Урон: сначала снимаются временные хиты.
    Damage(u32),
    /// Лечение до максимума.
    Heal(u32),
    /// Временные хиты: не складываются, остаётся большее значение.
    Temporary(u32),
}

/// Изменения сцены. `None` — без изменений.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct SceneChange {
    pub day: Option<u32>,
    pub time: Option<String>,
    pub location: Option<String>,
    pub situation: Option<String>,
}

/// Состояние, которое отменяется вместе с ходом мастера (генератор кубов не откатывается).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Checkpoint {
    scene: Scene,
    party: Vec<Character>,
    treasury: Treasury,
    engine_log: Vec<String>,
    notes: Vec<MasterNote>,
    next_note_id: u64,
    kb_overrides: Vec<KbOverride>,
    custom_cards: Vec<CustomCard>,
}

/// Отменяемый ход мастера.
#[derive(Debug, Clone)]
pub(crate) struct UndoPoint {
    before: Checkpoint,
    after: Checkpoint,
    actions: Vec<String>,
}

/// Что можно отменить.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct UndoInfo {
    /// Действия хода мастера, которые будут отменены.
    pub actions: Vec<String>,
    /// Отмена ещё возможна: после хода состояние не менялось.
    pub available: bool,
}

fn normalize(s: &str) -> String {
    s.trim().to_lowercase().replace('ё', "е")
}

fn find_resource<'a>(
    c: &'a mut Character,
    query: &str,
) -> Result<&'a mut ResourcePool, EngineError> {
    let q = normalize(query);
    let index = c
        .resources
        .iter()
        .position(|r| r.id() == query.trim() || normalize(r.name()) == q)
        .or_else(|| {
            let mut partial =
                c.resources.iter().enumerate().filter(|(_, r)| normalize(r.name()).contains(&q));
            match (partial.next(), partial.next()) {
                (Some((i, _)), None) => Some(i),
                _ => None,
            }
        })
        .ok_or_else(|| EngineError::ResourceNotFound(query.to_string()))?;
    Ok(&mut c.resources[index])
}

fn hp_line(hp: HitPoints) -> String {
    if hp.temporary > 0 {
        format!("{}/{} (+{} врем.)", hp.current, hp.max, hp.temporary)
    } else {
        format!("{}/{}", hp.current, hp.max)
    }
}

impl Session {
    // ─────────────────────── отмена хода мастера ───────────────────────

    /// Снимок состояния перед ходом мастера.
    pub fn checkpoint(&self) -> Checkpoint {
        Checkpoint {
            scene: self.scene.clone(),
            party: self.party.clone(),
            treasury: self.treasury.clone(),
            engine_log: self.engine_log.clone(),
            notes: self.notes.clone(),
            next_note_id: self.next_note_id,
            kb_overrides: self.kb_overrides.clone(),
            custom_cards: self.custom_cards.clone(),
        }
    }

    fn restore(&mut self, c: Checkpoint) {
        self.scene = c.scene;
        self.party = c.party;
        self.treasury = c.treasury;
        self.engine_log = c.engine_log;
        self.notes = c.notes;
        self.next_note_id = c.next_note_id;
        self.kb_overrides = c.kb_overrides;
        self.custom_cards = c.custom_cards;
    }

    /// Завершает ход мастера: если состояние изменилось, ход можно будет отменить.
    pub fn commit_master_turn(&mut self, before: Checkpoint, actions: Vec<String>) {
        let after = self.checkpoint();
        if after.notes != before.notes || after.custom_cards != before.custom_cards {
            self.turns_without_notes = 0;
        } else {
            self.turns_without_notes += 1;
        }
        // Отменяется только последний ход мастера: ход без изменений убирает точку отмены.
        self.undo = (after != before).then(|| Box::new(UndoPoint { before, after, actions }));
    }

    /// Последний отменяемый ход мастера.
    pub fn master_undo_info(&self) -> Option<UndoInfo> {
        self.undo.as_ref().map(|u| UndoInfo {
            actions: u.actions.clone(),
            available: u.after == self.checkpoint(),
        })
    }

    /// Отменяет последний ход мастера. Если после него что-то менялось (игрок потратил
    /// ячейку, записал в казну), отмена отклоняется, чтобы не стереть чужие изменения.
    pub fn undo_master_turn(&mut self) -> Result<Vec<String>, EngineError> {
        let point = self.undo.take().ok_or(EngineError::NothingToUndo)?;
        if point.after != self.checkpoint() {
            self.undo = Some(point);
            return Err(EngineError::UndoStale);
        }
        let actions = point.actions;
        self.restore(point.before);
        self.log(format!("Отменён ход мастера: действий — {}", actions.len()));
        Ok(actions)
    }

    // ─────────────────────────── лист персонажа ───────────────────────────

    /// Полный лист персонажа.
    pub fn details(&self, id: &str) -> Result<SheetDetails, EngineError> {
        self.character(id).map(Character::details)
    }

    /// Инвентарь персонажа по местам хранения.
    pub fn inventory(&self, id: &str) -> Result<InventoryView, EngineError> {
        Ok(self.character(id)?.inventory_view(&self.treasury))
    }

    /// Урон, лечение или временные хиты.
    pub fn change_hp(&mut self, id: &str, change: HpChange) -> Result<HitPoints, EngineError> {
        let c = self.character_mut(id)?;
        let name = c.name.clone();
        let result = (|| {
            let hp = &mut c.hit_points;
            let text = match change {
                HpChange::Damage(0) | HpChange::Heal(0) => return Err(EngineError::ZeroAmount),
                HpChange::Damage(n) => {
                    let absorbed = n.min(hp.temporary);
                    hp.temporary -= absorbed;
                    hp.current = hp.current.saturating_sub(n - absorbed);
                    format!("урон {n}")
                }
                HpChange::Heal(n) => {
                    hp.current = (hp.current + n).min(hp.max);
                    format!("лечение {n}")
                }
                HpChange::Temporary(n) => {
                    hp.temporary = hp.temporary.max(n);
                    format!("временные хиты {n}")
                }
            };
            Ok((*hp, text))
        })();
        self.logged(
            result,
            |(hp, text)| {
                let down = if hp.current == 0 { " — без сознания" } else { "" };
                format!("{name}: {text} → хиты {}{down}", hp_line(*hp))
            },
            || format!("хиты, {name}"),
        )
        .map(|(hp, _)| hp)
    }

    /// Трата (`delta` < 0) или восстановление (`delta` > 0) ресурса по ID или названию.
    pub fn adjust_resource(
        &mut self,
        id: &str,
        resource: &str,
        delta: i32,
    ) -> Result<ResourcePool, EngineError> {
        let c = self.character_mut(id)?;
        let name = c.name.clone();
        let result = find_resource(c, resource).and_then(|pool| {
            match delta {
                0 => return Err(EngineError::ZeroAmount),
                d if d < 0 => pool.spend(d.unsigned_abs())?,
                d => pool.restore(d.unsigned_abs())?,
            };
            Ok(pool.clone())
        });
        let verb = if delta < 0 { "потрачено" } else { "восстановлено" };
        self.logged(
            result,
            |p| {
                format!(
                    "{name}: {} — {verb} {}, {}/{}",
                    p.name(),
                    delta.abs(),
                    p.current(),
                    p.max()
                )
            },
            || format!("ресурс «{resource}», {name}"),
        )
    }

    /// Добавляет или снимает состояние.
    pub fn set_condition(
        &mut self,
        id: &str,
        condition: &str,
        active: bool,
    ) -> Result<Vec<String>, EngineError> {
        let c = self.character_mut(id)?;
        let name = c.name.clone();
        let result = c.set_condition(condition, active);
        self.logged(result, Clone::clone, || format!("состояние, {name}"))?;
        Ok(self.character(id)?.profile.conditions.clone())
    }

    // ───────────────────────────── инвентарь ─────────────────────────────

    /// Добавляет предмет в контейнер (по ID или названию; пусто — «При себе»).
    pub fn add_item(
        &mut self,
        id: &str,
        name: &str,
        quantity: u32,
        container: Option<&str>,
        category: &str,
        notes: &str,
    ) -> Result<String, EngineError> {
        let c = self.character_mut(id)?;
        let who = c.name.clone();
        let result = (|| {
            let target = match container {
                Some(q) if !q.trim().is_empty() => c.inventory.find_container(q)?.clone(),
                _ => c
                    .inventory
                    .containers
                    .first()
                    .cloned()
                    .ok_or_else(|| EngineError::UnknownContainer("При себе".into()))?,
            };
            c.inventory.add(NewItem {
                name: name.to_string(),
                quantity,
                container: target.id.clone(),
                category: category.to_string(),
                notes: notes.to_string(),
            })?;
            Ok(target.name)
        })();
        self.logged(
            result,
            |place| format!("{who}: получен предмет «{}» ×{quantity} → {place}", name.trim()),
            || format!("предмет «{name}», {who}"),
        )
    }

    /// Убирает предмет (израсходован, отдан, потерян).
    pub fn remove_item(&mut self, id: &str, item: &str, quantity: u32) -> Result<u32, EngineError> {
        let c = self.character_mut(id)?;
        let who = c.name.clone();
        let result = c.inventory.find_item(item).map(|i| (i.id.clone(), i.name.clone())).and_then(
            |(item_id, item_name)| Ok((c.inventory.remove(&item_id, quantity)?, item_name)),
        );
        self.logged(
            result,
            |(left, item_name)| {
                format!("{who}: убран предмет «{item_name}» ×{quantity}, осталось {left}")
            },
            || format!("предмет «{item}», {who}"),
        )
        .map(|(left, _)| left)
    }

    /// Перекладывает предмет в другой контейнер.
    pub fn move_item(
        &mut self,
        id: &str,
        item: &str,
        quantity: u32,
        to: &str,
    ) -> Result<(), EngineError> {
        let c = self.character_mut(id)?;
        let who = c.name.clone();
        let result = (|| {
            let found = c.inventory.find_item(item)?.clone();
            let target = c.inventory.find_container(to)?.clone();
            let quantity = if quantity == 0 { found.quantity } else { quantity };
            c.inventory.move_item(&found.id, quantity, &target.id)?;
            Ok(format!("{who}: «{}» ×{quantity} → {}", found.name, target.name))
        })();
        self.logged(result, Clone::clone, || format!("перенос «{item}», {who}")).map(|_| ())
    }

    // ─────────────────────────────── казна ───────────────────────────────

    /// Приход (`quantity` > 0) или расход ценности в месте хранения казны.
    pub fn master_treasury_entry(
        &mut self,
        asset: &str,
        location: &str,
        quantity: i64,
        reason: &str,
    ) -> Result<u64, EngineError> {
        let result = (|| {
            let asset = self.treasury.find_asset(asset)?.clone();
            let place = self.treasury.find_location(location)?.clone();
            let id = self.treasury.record(NewEntry {
                day: self.scene.day,
                time: self.scene.time.clone(),
                asset_id: asset.id.clone(),
                location_id: place.id.clone(),
                quantity,
                reason: reason.trim().to_string(),
                source: EntrySource::Master,
            })?;
            Ok((id, asset.name, place.name))
        })();
        self.logged(
            result,
            |(_, a, p)| {
                let sign = if quantity > 0 { "+" } else { "" };
                format!("Казна: {a} {sign}{quantity} ({p}) — {}", reason.trim())
            },
            || format!("казна, «{asset}»"),
        )
        .map(|(id, _, _)| id)
    }

    /// Перемещение ценности между местами хранения.
    pub fn master_treasury_transfer(
        &mut self,
        asset: &str,
        quantity: i64,
        from: &str,
        to: &str,
        reason: &str,
    ) -> Result<u64, EngineError> {
        let result = (|| {
            let asset = self.treasury.find_asset(asset)?.clone();
            let src = self.treasury.find_location(from)?.clone();
            let dst = self.treasury.find_location(to)?.clone();
            let id = self.treasury.transfer(
                self.scene.day,
                self.scene.time.clone(),
                &asset.id,
                quantity,
                &src.id,
                &dst.id,
                reason.trim(),
                EntrySource::Master,
            )?;
            Ok((id, format!("Казна: {} ×{quantity}: {} → {}", asset.name, src.name, dst.name)))
        })();
        self.logged(result, |(_, text)| text.clone(), || format!("перемещение «{asset}»"))
            .map(|(id, _)| id)
    }

    /// Новая ценность в казне (трофей, покупка).
    pub fn master_new_asset(
        &mut self,
        name: &str,
        kind: AssetKind,
        unit_value_gp: i64,
    ) -> Result<String, EngineError> {
        let base: String =
            normalize(name).chars().map(|ch| if ch.is_alphanumeric() { ch } else { '_' }).collect();
        let mut id = format!("new.{base}");
        let mut n = 2;
        while self.treasury.assets().iter().any(|a| a.id == id) {
            id = format!("new.{base}.{n}");
            n += 1;
        }
        let result = self
            .treasury
            .add_asset(Asset {
                id: id.clone(),
                name: name.trim().to_string(),
                kind,
                unit_value: unit_value_gp * 100,
            })
            .map(|()| id);
        self.logged(
            result,
            |_| format!("Казна: новая ценность «{}» ({unit_value_gp} ЗМ за шт.)", name.trim()),
            || format!("новая ценность «{name}»"),
        )
    }

    // ───────────────────────────── сцена ─────────────────────────────

    /// Меняет день, время, место или обстановку сцены. Перемещение сцены переносит туда и
    /// персонажа игрока.
    pub fn change_scene(&mut self, change: SceneChange) -> Result<Scene, EngineError> {
        if change == SceneChange::default() {
            return Err(EngineError::ZeroAmount);
        }
        if let Some(day) = change.day {
            if day < self.scene.day {
                let e = EngineError::DayInPast { current: self.scene.day, requested: day };
                self.log(format!("Отказ (сцена): {e}"));
                return Err(e);
            }
            self.scene.day = day;
        }
        if let Some(time) = change.time {
            let time = time.trim().to_string();
            self.scene.time = (!time.is_empty()).then_some(time);
        }
        if let Some(location) = change.location {
            let location = location.trim().to_string();
            if !location.is_empty() {
                let player_id = self.player_id();
                if let Some(player) = self.party.iter_mut().find(|c| c.id == player_id) {
                    player.location = location.clone();
                }
                self.scene.location = location;
            }
        }
        if let Some(situation) = change.situation {
            self.scene.situation = situation.trim().to_string();
        }
        let s = &self.scene;
        let time = s.time.as_deref().map(|t| format!(", {t}")).unwrap_or_default();
        self.log(format!("Сцена: День {}{time} — {}", s.day, s.location));
        Ok(self.scene.clone())
    }

    fn player_id(&self) -> String {
        self.party
            .iter()
            .find(|c| c.kind == crate::character::CharacterKind::Player)
            .map(|c| c.id.clone())
            .unwrap_or_default()
    }

    /// Перемещает спутника или фамильяра.
    pub fn move_character(&mut self, id: &str, location: &str) -> Result<(), EngineError> {
        let location = location.trim();
        if location.is_empty() {
            return Err(EngineError::UnknownLocation(String::new()));
        }
        let c = self.character_mut(id)?;
        c.location = location.to_string();
        let name = c.name.clone();
        self.log(format!("{name} → {location}"));
        Ok(())
    }

    /// Отдых отряда с записью в журнал.
    pub fn master_rest(&mut self, kind: RestKind) -> Vec<String> {
        let result = self.take_rest(kind);
        let label = match kind {
            RestKind::Short => "Короткий отдых",
            RestKind::Long => "Длительный отдых",
        };
        let restored: usize = result.characters.iter().map(|c| c.restored.len()).sum();
        self.log(format!("{label}: восстановлено ресурсов — {restored}"));
        result
            .characters
            .into_iter()
            .filter(|c| !c.restored.is_empty())
            .map(|c| format!("{}: {}", c.name, c.restored.join(", ")))
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::knowledge::NoteLayer;
    use crate::rng::Xoshiro256;

    fn session() -> Session {
        Session::demo(Xoshiro256::from_seed(1))
    }

    #[test]
    fn damage_uses_temporary_hp_first_and_heal_caps() {
        let mut s = session();
        let hp = s.change_hp("pc.nikis", HpChange::Damage(10)).unwrap();
        assert_eq!((hp.current, hp.temporary), (47, 0));
        let hp = s.change_hp("pc.nikis", HpChange::Heal(100)).unwrap();
        assert_eq!(hp.current, 49);
        let hp = s.change_hp("pc.nikis", HpChange::Temporary(5)).unwrap();
        assert_eq!(hp.temporary, 5);
        let hp = s.change_hp("pc.nikis", HpChange::Damage(200)).unwrap();
        assert_eq!(hp.current, 0);
        assert!(s.engine_log().last().unwrap().ends_with("без сознания"));
        assert!(s.change_hp("pc.nikis", HpChange::Heal(0)).is_err());
    }

    #[test]
    fn resources_by_name_and_conditions() {
        let mut s = session();
        let p = s.adjust_resource("pc.nikis", "Везунчик", -2).unwrap();
        assert_eq!(p.current(), 1);
        assert!(s.adjust_resource("pc.nikis", "Везунчик", -2).is_err());
        assert!(s.engine_log().last().unwrap().starts_with("Отказ"));
        let p = s.adjust_resource("pc.nikis", "feat.lucky", 5).unwrap();
        assert_eq!(p.current(), 3);
        let list = s.set_condition("npc.corvus", "испуган", true).unwrap();
        assert_eq!(list, vec!["Испуган".to_string()]);
    }

    #[test]
    fn items_and_treasury_by_names() {
        let mut s = session();
        s.add_item("pc.nikis", "Карта шахт", 1, Some("Кольцо Теневого"), "Документы", "").unwrap();
        s.move_item("pc.nikis", "Карта шахт", 0, "сейф особняка").unwrap();
        assert_eq!(s.remove_item("pc.nikis", "Карта шахт", 1).unwrap(), 0);
        assert!(s.remove_item("pc.nikis", "Зелье", 1).is_err());
        assert_eq!(s.remove_item("pc.nikis", "Зелье Героизма", 1).unwrap(), 0);

        let before = s.treasury_view().total;
        s.master_treasury_entry("Золотые монеты", "При себе", -80, "Ужин").unwrap();
        assert_eq!(s.treasury_view().total, before - 8_000);
        s.master_treasury_transfer("gp", 100, "Сокровищница", "При себе", "На расходы").unwrap();
        assert!(s.master_treasury_entry("gp", "purse", -1_000_000, "x").is_err());
        let id = s.master_new_asset("Изумруд Шпиля", AssetKind::Gem, 500).unwrap();
        s.master_treasury_entry(&id, "purse", 1, "Трофей").unwrap();
        assert_eq!(s.treasury().quantity(&id, "purse"), 1);
    }

    #[test]
    fn scene_moves_player_and_rejects_past_days() {
        let mut s = session();
        let scene = s
            .change_scene(SceneChange {
                time: Some("полдень".into()),
                location: Some("Серебряный Шпиль".into()),
                ..SceneChange::default()
            })
            .unwrap();
        assert_eq!(scene.time.as_deref(), Some("полдень"));
        assert_eq!(s.character("pc.nikis").unwrap().location, "Серебряный Шпиль");
        assert!(s.change_scene(SceneChange { day: Some(10), ..SceneChange::default() }).is_err());
        s.move_character("npc.valeria", "Серебряный Шпиль").unwrap();
        assert!(s.party_view().members.iter().find(|m| m.id == "npc.valeria").unwrap().in_scene);
    }

    #[test]
    fn undo_restores_state_and_refuses_when_stale() {
        let mut s = session();
        assert_eq!(s.undo_master_turn(), Err(EngineError::NothingToUndo));
        let before = s.checkpoint();
        s.change_hp("pc.nikis", HpChange::Damage(20)).unwrap();
        s.add_note(NoteLayer::Player, "Пароль", "Серый рассвет").unwrap();
        s.commit_master_turn(before, vec!["урон".into(), "запись".into()]);
        assert!(s.master_undo_info().unwrap().available);
        let actions = s.undo_master_turn().unwrap();
        assert_eq!(actions.len(), 2);
        assert_eq!(s.character("pc.nikis").unwrap().hit_points.current, 49);
        assert!(s.notes().is_empty());
        assert!(s.engine_log().last().unwrap().starts_with("Отменён ход мастера"));

        let before = s.checkpoint();
        s.change_hp("pc.nikis", HpChange::Damage(5)).unwrap();
        s.commit_master_turn(before, vec!["урон".into()]);
        s.lucky_reroll().unwrap();
        assert!(!s.master_undo_info().unwrap().available);
        assert_eq!(s.undo_master_turn(), Err(EngineError::UndoStale));

        // Ход без изменений не создаёт точку отмены.
        let mut fresh = session();
        let cp = fresh.checkpoint();
        fresh.commit_master_turn(cp, vec![]);
        assert!(fresh.master_undo_info().is_none());
    }

    #[test]
    fn rest_is_logged() {
        let mut s = session();
        s.adjust_resource("pc.nikis", "Везунчик", -1).unwrap();
        let lines = s.master_rest(RestKind::Long);
        assert!(lines.iter().any(|l| l.contains("Везунчик")));
        assert!(s.engine_log().last().unwrap().starts_with("Длительный отдых"));
    }
}
