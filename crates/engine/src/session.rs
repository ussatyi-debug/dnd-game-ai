//! Игровая сессия: генератор кубов, сцена, отряд и казна.
//!
//! Один и тот же код обслуживает приложение (Tauri) и веб-версию, поэтому поведение
//! везде одинаковое.
//!
//! По механике кампании игрок сообщает только результат на кубе; модификаторы прибавляет
//! мастер, беря их из базы. Поэтому лоток кубов работает с «чистыми» бросками, а функции с
//! модификаторами ([`Session::roll_check`], [`Session::submit_player_roll`]) предназначены
//! для мастера и движка.

use crate::character::{Character, CharacterKind, CharacterSheet, HitPoints};
use crate::check::{roll_d20, D20Roll, Modifier, RollMode};
use crate::error::EngineError;
use crate::expr::{DiceExpr, ExprRoll};
use crate::fixtures::{demo_party, demo_treasury};
use crate::notation::resolve_player_d20;
use crate::resource::{ResourcePool, RestKind};
use crate::rng::{DiceRng, Xoshiro256};
use crate::treasury::{EntrySource, NewEntry, Treasury, TreasuryView};

/// ID ресурса черты «Везунчик».
pub const LUCKY_ID: &str = "feat.lucky";

/// Версия формата сохранения.
pub const SAVE_FORMAT_VERSION: u32 = 1;

/// Текущая сцена.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Scene {
    /// Игровой день кампании.
    pub day: u32,
    /// Время суток, если известно.
    pub time: Option<String>,
    /// Где находится персонаж игрока.
    pub location: String,
}

/// Результат переброса d20 чертой «Везунчик».
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LuckyReroll {
    /// Новое значение на кубе d20.
    pub value: u32,
    /// Состояние зарядов после переброса.
    pub lucky: ResourcePool,
}

/// Что восстановил отдых у одного персонажа.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RestedCharacter {
    pub id: String,
    pub name: String,
    pub restored: Vec<String>,
}

/// Итог отдыха отряда.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RestResult {
    pub kind: RestKind,
    pub characters: Vec<RestedCharacter>,
}

/// Карточка персонажа в окне «Отряд».
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PartyMember {
    pub id: String,
    pub kind: CharacterKind,
    pub name: String,
    /// «Плут 3 / Колдун 7» или вид для фамильяра.
    pub summary: String,
    pub level: u32,
    pub hit_points: HitPoints,
    pub armor_class: i32,
    pub location: String,
    /// Находится ли персонаж там же, где персонаж игрока.
    pub in_scene: bool,
    /// Ресурсы для значков на карточке (не больше трёх).
    pub key_resources: Vec<ResourcePool>,
}

/// Окно «Отряд»: сцена, участники, итог казны.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PartyView {
    pub scene: Scene,
    pub members: Vec<PartyMember>,
    pub treasury_name: String,
    pub treasury_total: i64,
}

/// Состояние движка для файла сохранения.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SaveState {
    pub format_version: u32,
    pub scene: Scene,
    pub party: Vec<Character>,
    pub treasury: Treasury,
}

/// Состояние сессии.
#[derive(Debug, Clone)]
pub struct Session {
    rng: Xoshiro256,
    scene: Scene,
    party: Vec<Character>,
    treasury: Treasury,
}

impl Session {
    pub fn new(rng: Xoshiro256, scene: Scene, party: Vec<Character>, treasury: Treasury) -> Self {
        Self { rng, scene, party, treasury }
    }

    /// Сессия с демо-данными кампании на День 82 (до появления импорта).
    pub fn demo(rng: Xoshiro256) -> Self {
        let party = demo_party();
        let location = party
            .iter()
            .find(|c| c.kind == CharacterKind::Player)
            .map(|c| c.location.clone())
            .unwrap_or_default();
        Self::new(rng, Scene { day: 82, time: None, location }, party, demo_treasury())
    }

    pub fn scene(&self) -> &Scene {
        &self.scene
    }

    pub fn party(&self) -> &[Character] {
        &self.party
    }

    fn player_mut(&mut self) -> Result<&mut Character, EngineError> {
        self.party
            .iter_mut()
            .find(|c| c.kind == CharacterKind::Player)
            .ok_or_else(|| EngineError::CharacterNotFound("персонаж игрока".into()))
    }

    pub fn character(&self, id: &str) -> Result<&Character, EngineError> {
        self.party
            .iter()
            .find(|c| c.id == id)
            .ok_or_else(|| EngineError::CharacterNotFound(id.to_string()))
    }

    /// Лист персонажа по ID.
    pub fn sheet(&self, id: &str) -> Result<CharacterSheet, EngineError> {
        self.character(id).map(Character::sheet)
    }

    /// Окно «Отряд».
    pub fn party_view(&self) -> PartyView {
        let members = self
            .party
            .iter()
            .map(|c| PartyMember {
                id: c.id.clone(),
                kind: c.kind,
                name: c.name.clone(),
                summary: if c.classes.is_empty() {
                    c.race.clone()
                } else {
                    c.classes
                        .iter()
                        .map(|cl| format!("{} {}", cl.class, cl.level))
                        .collect::<Vec<_>>()
                        .join(" / ")
                },
                level: c.level(),
                hit_points: c.hit_points,
                armor_class: c.armor_class,
                location: c.location.clone(),
                in_scene: c.location == self.scene.location,
                key_resources: c.resources().iter().take(3).cloned().collect(),
            })
            .collect();
        PartyView {
            scene: self.scene.clone(),
            members,
            treasury_name: self.treasury.name().to_string(),
            treasury_total: self.treasury.view().total,
        }
    }

    pub fn treasury(&self) -> &Treasury {
        &self.treasury
    }

    pub fn treasury_view(&self) -> TreasuryView {
        self.treasury.view()
    }

    /// Запись казны, добавленная игроком вручную (помечается источником «вручную»).
    pub fn add_manual_treasury_entry(
        &mut self,
        asset_id: &str,
        location_id: &str,
        quantity: i64,
        reason: &str,
    ) -> Result<TreasuryView, EngineError> {
        let reason = reason.trim();
        self.treasury.record(NewEntry {
            day: self.scene.day,
            time: self.scene.time.clone(),
            asset_id: asset_id.to_string(),
            location_id: location_id.to_string(),
            quantity,
            reason: if reason.is_empty() {
                "Без пояснения".into()
            } else {
                reason.into()
            },
            source: EntrySource::Manual,
        })?;
        Ok(self.treasury.view())
    }

    /// Бросок выражения, например `8d6`; `critical` удваивает кубы.
    pub fn roll_expression(
        &mut self,
        expression: &str,
        critical: bool,
    ) -> Result<ExprRoll, EngineError> {
        let expr = DiceExpr::parse(expression)?;
        Ok(expr.roll(&mut self.rng, critical))
    }

    /// Переброс d20 чертой «Везунчик» персонажа игрока: сначала списывается заряд,
    /// затем бросается куб. Без зарядов бросок не выполняется.
    pub fn lucky_reroll(&mut self) -> Result<LuckyReroll, EngineError> {
        let lucky = self.player_mut()?.resource_mut(LUCKY_ID)?;
        lucky.spend(1)?;
        let lucky = lucky.clone();
        Ok(LuckyReroll { value: self.rng.roll_die(20), lucky })
    }

    /// Бросок d20 с модификаторами кубом движка (для мастера).
    pub fn roll_check(
        &mut self,
        mode: RollMode,
        modifiers: Vec<Modifier>,
        crit_threshold: u32,
    ) -> Result<D20Roll, EngineError> {
        roll_d20(&mut self.rng, mode, modifiers, crit_threshold)
    }

    /// Заявка игрока «16», «12 - везунчик» с модификаторами, которые подставил мастер.
    pub fn submit_player_roll(
        &mut self,
        input: &str,
        mode: RollMode,
        modifiers: Vec<Modifier>,
        crit_threshold: u32,
    ) -> Result<D20Roll, EngineError> {
        let lucky = self.player_mut()?.resource_mut(LUCKY_ID)?;
        resolve_player_d20(input, mode, modifiers, crit_threshold, lucky)
    }

    /// Отдых всего отряда: каждый персонаж восстанавливает ресурсы по их правилам.
    pub fn take_rest(&mut self, kind: RestKind) -> RestResult {
        let characters = self
            .party
            .iter_mut()
            .map(|c| RestedCharacter {
                id: c.id.clone(),
                name: c.name.clone(),
                restored: c.apply_rest(kind),
            })
            .collect();
        RestResult { kind, characters }
    }

    /// Состояние для файла сохранения.
    pub fn save_state(&self) -> SaveState {
        SaveState {
            format_version: SAVE_FORMAT_VERSION,
            scene: self.scene.clone(),
            party: self.party.clone(),
            treasury: self.treasury.clone(),
        }
    }
}

impl Default for Session {
    fn default() -> Self {
        Self::demo(Xoshiro256::from_entropy())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn session(seed: u64) -> Session {
        Session::demo(Xoshiro256::from_seed(seed))
    }

    fn lucky_current(s: &Session) -> u32 {
        s.character("pc.nikis").unwrap().resource(LUCKY_ID).unwrap().current()
    }

    #[test]
    fn lucky_reroll_spends_charges_until_empty() {
        let mut s = session(3);
        for expected in [2, 1, 0] {
            let r = s.lucky_reroll().unwrap();
            assert!((1..=20).contains(&r.value));
            assert_eq!(r.lucky.current(), expected);
        }
        assert!(matches!(
            s.lucky_reroll(),
            Err(EngineError::ResourceDepleted { current: 0, max: 3, .. })
        ));
        assert_eq!(lucky_current(&s), 0);
    }

    #[test]
    fn party_rest_follows_each_resource_rule() {
        let mut s = session(4);
        s.lucky_reroll().unwrap();
        let short = s.take_rest(RestKind::Short);
        let nikis = short.characters.iter().find(|c| c.id == "pc.nikis").unwrap();
        assert!(!nikis.restored.contains(&"Везунчик".to_string()));
        assert_eq!(lucky_current(&s), 2);
        let long = s.take_rest(RestKind::Long);
        let nikis = long.characters.iter().find(|c| c.id == "pc.nikis").unwrap();
        assert!(nikis.restored.contains(&"Везунчик".to_string()));
        assert_eq!(lucky_current(&s), 3);
    }

    #[test]
    fn party_view_marks_who_is_in_scene() {
        let s = session(1);
        let view = s.party_view();
        assert_eq!(view.scene.day, 82);
        assert_eq!(view.members.len(), 6);
        let by_id = |id: &str| view.members.iter().find(|m| m.id == id).unwrap();
        assert!(by_id("pc.nikis").in_scene);
        assert!(by_id("npc.valeria").in_scene);
        assert!(!by_id("npc.gunther").in_scene);
        assert_eq!(by_id("npc.corvus").summary, "Монах 8");
        assert_eq!(by_id("npc.yussach").summary, "Исчадие (квазит)");
        assert!(by_id("pc.nikis").key_resources.len() <= 3);
        assert_eq!(view.treasury_total, s.treasury_view().total);
    }

    #[test]
    fn sheets_for_companions() {
        let s = session(1);
        let gunther = s.sheet("npc.gunther").unwrap();
        assert_eq!(gunther.level, 8);
        assert_eq!(gunther.proficiency_bonus, 3);
        assert_eq!(gunther.abilities[0].modifier, 4);
        assert!(matches!(s.sheet("npc.nobody"), Err(EngineError::CharacterNotFound(_))));
    }

    #[test]
    fn player_roll_with_master_modifiers_uses_player_lucky() {
        let mut s = session(1);
        let roll = s
            .submit_player_roll(
                "12 - везунчик",
                RollMode::Normal,
                vec![Modifier::new("Скрытность", 6)],
                20,
            )
            .unwrap();
        assert_eq!(roll.total, 18);
        assert_eq!(lucky_current(&s), 2);
    }

    #[test]
    fn expressions_are_reproducible_by_seed() {
        let mut a = session(8);
        let mut b = session(8);
        assert_eq!(a.roll_expression("8d6", false), b.roll_expression("8d6", false));
        assert_eq!(a.lucky_reroll(), b.lucky_reroll());
        assert_eq!(
            a.roll_check(RollMode::Advantage, vec![], 20),
            b.roll_check(RollMode::Advantage, vec![], 20)
        );
    }

    #[test]
    fn save_state_contains_everything() {
        let mut s = session(2);
        s.lucky_reroll().unwrap();
        let save = s.save_state();
        assert_eq!(save.format_version, SAVE_FORMAT_VERSION);
        assert_eq!(save.party.len(), 6);
        assert_eq!(save.party[0].resource(LUCKY_ID).unwrap().current(), 2);
        assert!(!save.treasury.entries().is_empty());
    }

    #[test]
    fn manual_treasury_entries_are_marked_and_validated() {
        let mut s = session(1);
        let before = s.treasury_view().total;
        let view =
            s.add_manual_treasury_entry("gp", "purse", -80, "  Ужин в «Золотом Фазане» ").unwrap();
        assert_eq!(view.total, before - 8_000);
        assert_eq!(view.entries[0].source, EntrySource::Manual);
        assert_eq!(view.entries[0].day, 82);
        assert_eq!(view.entries[0].reason, "Ужин в «Золотом Фазане»");
        assert!(s.add_manual_treasury_entry("gp", "purse", -10_000, "").is_err());
        assert!(s.add_manual_treasury_entry("gp", "nowhere", 1, "").is_err());
    }

    #[test]
    fn errors_are_reported() {
        let mut s = session(1);
        assert!(s.roll_expression("2d7", false).is_err());
        assert!(s.roll_check(RollMode::Normal, vec![], 1).is_err());
        assert!(s.submit_player_roll("30", RollMode::Normal, vec![], 20).is_err());
        assert_eq!(lucky_current(&s), 3);
    }
}
