//! Загрузка сохранения.
//!
//! Правило кампании: из файла берётся только то, что меняется в игре (хиты, ресурсы,
//! подготовка, свитки, состояния, инвентарь, место, сцена, казна, записи). Постоянная часть
//! листа — владения, спасброски, навыки, атаки, умения, известные заклинания — берётся из
//! приложения, поэтому исправления листа не пропадают при загрузке старого файла. Чего нет
//! в файле, дополняется из приложения, и загрузка сообщает, что именно дополнено.

use crate::character::{Character, HitPoints};
use crate::creation::{build_party, Campaign};
use crate::error::EngineError;
use crate::fixtures::{demo_party, VALERIA_PREPARED};
use crate::inventory::{Inventory, NewItem, ON_PERSON};
use crate::knowledge::{CustomCard, KbOverride, MasterNote};
use crate::profile::HitDice;
use crate::resource::ResourcePool;
use crate::session::{Scene, Session, MIN_SAVE_FORMAT, SAVE_FORMAT_VERSION};
use crate::sheet_edits::{rebuild, SheetEdit, SheetProposal};
use crate::spellcasting::ScrollStack;
use crate::spells;
use crate::treasury::Treasury;

/// Значение пула ресурса в файле.
#[cfg_attr(feature = "serde", derive(serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SavedPool {
    pub id: String,
    pub current: u32,
}

/// Подготовленные заклинания класса в файле.
#[cfg_attr(feature = "serde", derive(serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SavedCaster {
    pub id: String,
    #[cfg_attr(feature = "serde", serde(default))]
    pub prepared: Vec<String>,
}

#[cfg_attr(feature = "serde", derive(serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq, Default)]
pub struct SavedSpellcasting {
    #[cfg_attr(feature = "serde", serde(default))]
    pub casters: Vec<SavedCaster>,
    #[cfg_attr(feature = "serde", serde(default))]
    pub scrolls: Vec<ScrollStack>,
    #[cfg_attr(feature = "serde", serde(default))]
    pub can_prepare: bool,
}

#[cfg_attr(feature = "serde", derive(serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq, Default)]
pub struct SavedProfile {
    #[cfg_attr(feature = "serde", serde(default))]
    pub conditions: Vec<String>,
    #[cfg_attr(feature = "serde", serde(default))]
    pub exhaustion: u8,
    #[cfg_attr(feature = "serde", serde(default))]
    pub hit_dice: Vec<HitDice>,
    /// Опыт (с 0.9.8; у героев своей кампании — ещё и в листе кампании).
    #[cfg_attr(feature = "serde", serde(default))]
    pub xp: Option<u32>,
}

/// Персонаж в файле: только то, что меняется в игре (лишние поля файла не читаются).
#[cfg_attr(feature = "serde", derive(serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SavedCharacter {
    pub id: String,
    #[cfg_attr(feature = "serde", serde(default))]
    pub hit_points: Option<HitPoints>,
    #[cfg_attr(feature = "serde", serde(default))]
    pub location: Option<String>,
    #[cfg_attr(feature = "serde", serde(default))]
    pub resources: Option<Vec<SavedPool>>,
    #[cfg_attr(feature = "serde", serde(default))]
    pub spellcasting: Option<SavedSpellcasting>,
    #[cfg_attr(feature = "serde", serde(default))]
    pub profile: Option<SavedProfile>,
    #[cfg_attr(feature = "serde", serde(default))]
    pub inventory: Option<Inventory>,
    /// Правки листа игроком.
    #[cfg_attr(feature = "serde", serde(default))]
    pub edits: Vec<SheetEdit>,
}

/// Состояние движка из файла сохранения.
#[cfg_attr(feature = "serde", derive(serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SaveData {
    pub format_version: u32,
    pub scene: Scene,
    #[cfg_attr(feature = "serde", serde(default))]
    pub party: Vec<SavedCharacter>,
    pub treasury: Treasury,
    #[cfg_attr(feature = "serde", serde(default))]
    pub engine_log: Vec<String>,
    #[cfg_attr(feature = "serde", serde(default))]
    pub notes: Vec<MasterNote>,
    #[cfg_attr(feature = "serde", serde(default))]
    pub kb_overrides: Vec<KbOverride>,
    #[cfg_attr(feature = "serde", serde(default))]
    pub custom_cards: Vec<CustomCard>,
    #[cfg_attr(feature = "serde", serde(default))]
    pub turns_without_notes: u32,
    #[cfg_attr(feature = "serde", serde(default))]
    pub proposals: Vec<SheetProposal>,
    /// Своя кампания с листами созданных героев (формат 8+); нет — «Дом Стрэндж».
    #[cfg_attr(feature = "serde", serde(default))]
    pub campaign: Option<Campaign>,
    #[cfg_attr(feature = "serde", serde(default))]
    pub xp_log: Vec<crate::experience::XpNote>,
    #[cfg_attr(feature = "serde", serde(default))]
    pub level_up_open: Vec<String>,
}

/// Итог загрузки.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct LoadReport {
    pub format_version: u32,
    pub day: u32,
    pub location: String,
    /// Что дополнено из приложения или исправлено при загрузке.
    pub supplemented: Vec<String>,
}

pub(crate) fn apply_character(c: &mut Character, saved: SavedCharacter, report: &mut Vec<String>) {
    let name = c.name.clone();
    // Сначала правки листа игроком (они могут менять максимум хитов), затем то, что менялось в игре.
    if !saved.edits.is_empty() {
        c.edits = saved.edits.clone();
        report.extend(rebuild(c));
    }

    match saved.hit_points {
        Some(hp) => {
            let max = c.hit_points.max;
            if hp.current > max {
                report
                    .push(format!("{name}: хиты {} больше максимума {max} — снижены", hp.current));
            }
            c.hit_points = HitPoints { current: hp.current.min(max), max, temporary: hp.temporary };
        }
        None => report.push(format!("{name}: хиты — из приложения")),
    }
    if let Some(location) = saved.location.filter(|l| !l.trim().is_empty()) {
        c.location = location;
    }

    match saved.resources {
        Some(pools) => {
            let mut missing = Vec::new();
            c.resources = c
                .resources
                .iter()
                .map(|pool| match pools.iter().find(|p| p.id == pool.id()) {
                    Some(p) => ResourcePool::with_current(
                        pool.id(),
                        pool.name(),
                        p.current.min(pool.max()),
                        pool.max(),
                        pool.recovery(),
                    )
                    .unwrap_or_else(|_| pool.clone()),
                    None => {
                        missing.push(pool.name().to_string());
                        pool.clone()
                    }
                })
                .collect();
            if !missing.is_empty() {
                report.push(format!("{name}: ресурсы из приложения — {}", missing.join(", ")));
            }
        }
        None => report.push(format!("{name}: ресурсы — из приложения")),
    }

    if let (Some(sc), Some(saved_sc)) = (c.spellcasting.as_mut(), saved.spellcasting) {
        for caster in &mut sc.casters {
            if let Some(sv) = saved_sc.casters.iter().find(|s| s.id == caster.id) {
                let (known, unknown): (Vec<String>, Vec<String>) =
                    sv.prepared.iter().cloned().partition(|id| spells::spell(id).is_some());
                if !unknown.is_empty() {
                    report.push(format!(
                        "{name}: неизвестные заклинания пропущены — {}",
                        unknown.join(", ")
                    ));
                }
                caster.prepared = known;
            }
        }
        let (scrolls, unknown): (Vec<ScrollStack>, Vec<ScrollStack>) =
            saved_sc.scrolls.into_iter().partition(|s| spells::spell(&s.spell_id).is_some());
        if !unknown.is_empty() {
            let ids: Vec<String> = unknown.into_iter().map(|s| s.spell_id).collect();
            report.push(format!(
                "{name}: свитки неизвестных заклинаний пропущены — {}",
                ids.join(", ")
            ));
        }
        sc.scrolls = scrolls;
        sc.can_prepare = saved_sc.can_prepare;
    }

    match saved.profile {
        Some(p) => {
            c.profile.conditions = p.conditions;
            c.profile.exhaustion = p.exhaustion.min(6);
            if let Some(xp) = p.xp {
                c.profile.xp = Some(xp);
            }
            for dice in &mut c.profile.hit_dice {
                if let Some(saved) = p.hit_dice.iter().find(|d| d.die == dice.die) {
                    dice.current = saved.current.min(dice.total);
                }
            }
        }
        None => report.push(format!("{name}: состояния и кости хитов — из приложения")),
    }

    match saved.inventory {
        Some(mut inv) => match inv.validate_loaded() {
            Ok(()) => c.inventory = inv,
            Err(e) => report.push(format!("{name}: инвентарь из приложения ({e})")),
        },
        None => report.push(format!("{name}: инвентарь — из приложения")),
    }
}

/// Разовые исправления сохранений до 0.8.0 (формат 4): лист Валерии приведён к правилам —
/// подготовленные заклинания по листу и Палочка военного мага у неё, а не в сейфе особняка.
fn migrate_to_v5(party: &mut [Character]) -> Vec<String> {
    const WAND: &str = "Палочка военного мага +1";
    let mut report = Vec::new();
    let Some(vi) = party.iter().position(|c| c.id == "npc.valeria") else {
        return report;
    };
    let cleric = party[vi]
        .spellcasting
        .as_mut()
        .and_then(|sc| sc.casters.iter_mut().find(|c| c.id == "cleric"));
    if let Some(caster) = cleric {
        caster.prepared = VALERIA_PREPARED.iter().map(|s| (*s).to_string()).collect();
        report.push("Валерия: подготовленные заклинания — по исправленному листу (0.8.0)".into());
    }
    if party[vi].inventory.items.iter().any(|i| i.name == WAND) {
        return report;
    }
    let item = NewItem {
        name: WAND.into(),
        quantity: 1,
        container: ON_PERSON.into(),
        category: "Снаряжение".into(),
        notes: "настроена; +1 к атакам заклинаниями".into(),
    };
    if party[vi].inventory.add(item).is_err() {
        return report;
    }
    if let Some(nikis) = party.iter_mut().find(|c| c.id == "pc.nikis") {
        let wand = nikis.inventory.items.iter().find(|i| i.name == WAND).map(|i| i.id.clone());
        if let Some(id) = wand {
            // Одна из палочек сейфа теперь у Валерии.
            let _ = nikis.inventory.remove(&id, 1);
        }
    }
    report.push(format!("Валерия: {WAND} теперь у неё (из сейфа особняка)"));
    report
}

/// Разовые исправления сохранений до 0.9.0 (формат 5): Брокк получил 9 уровень.
fn migrate_to_v6(party: &mut [Character]) -> Vec<String> {
    let mut report = Vec::new();
    let Some(brokk) = party.iter_mut().find(|c| c.id == "npc.brokk") else {
        return report;
    };
    // Был с полными хитами 8 уровня — остаётся с полными.
    if brokk.hit_points.current >= 76 {
        brokk.hit_points.current = brokk.hit_points.max;
    }
    for dice in &mut brokk.profile.hit_dice {
        dice.current = (dice.current + 1).min(dice.total);
    }
    for item in &mut brokk.inventory.items {
        if item.name == "Латная кираса" {
            item.name = "Дварфийские латы".into();
        }
    }
    report.push("Брокк: 9 уровень — хиты, кость хитов и доспех по новому листу (0.9.0)".into());
    report
}

/// Разовые исправления сохранений до 0.9.1 (формат 6): Никис получил 11 уровень (Колдун 8).
fn migrate_to_v7(party: &mut [Character]) -> Vec<String> {
    let Some(nikis) = party.iter_mut().find(|c| c.id == "pc.nikis") else {
        return Vec::new();
    };
    // Был с полными хитами 10 уровня — остаётся с полными.
    if nikis.hit_points.current >= 49 {
        nikis.hit_points.current = nikis.hit_points.max;
    }
    for dice in &mut nikis.profile.hit_dice {
        dice.current = (dice.current + 1).min(dice.total);
    }
    vec!["Никис: 11 уровень (Колдун 8) — хиты и кость хитов по новому листу (0.9.1)".into()]
}

impl Session {
    /// Загружает сохранение вместо текущей игры. При ошибке игра не меняется.
    /// Генератор кубов и указатель базы знаний остаются текущими, отмена хода сбрасывается.
    pub fn load(&mut self, save: SaveData) -> Result<LoadReport, EngineError> {
        if save.format_version < MIN_SAVE_FORMAT {
            return Err(EngineError::InvalidSave(format!(
                "формат {} — сохранения до версии 0.5.0 не поддерживаются",
                save.format_version
            )));
        }
        if save.format_version > SAVE_FORMAT_VERSION {
            return Err(EngineError::InvalidSave(format!(
                "формат {} из более новой версии приложения (эта понимает до {SAVE_FORMAT_VERSION}) — обновите приложение",
                save.format_version
            )));
        }
        let mut treasury = save.treasury;
        treasury.validate_loaded()?;

        let mut report = Vec::new();
        let mut party = match &save.campaign {
            Some(campaign) => build_party(campaign, &save.scene.location)
                .map_err(|e| EngineError::InvalidSave(e.to_string()))?,
            None => demo_party(),
        };
        let mut saved_party = save.party;
        for c in &mut party {
            match saved_party.iter().position(|s| s.id == c.id) {
                Some(i) => apply_character(c, saved_party.remove(i), &mut report),
                None => report.push(format!("{}: нет в файле — взят из приложения", c.name)),
            }
        }
        for s in saved_party {
            report.push(format!("Персонаж «{}» из файла не найден в приложении — пропущен", s.id));
        }
        let strange = save.campaign.is_none();
        if strange && save.format_version < 5 {
            report.extend(migrate_to_v5(&mut party));
        }
        if strange && save.format_version < 6 {
            report.extend(migrate_to_v6(&mut party));
        }
        if strange && save.format_version < 7 {
            report.extend(migrate_to_v7(&mut party));
        }

        let mut notes = save.notes;
        notes.sort_by_key(|n| n.id);
        notes.dedup_by_key(|n| n.id);
        let next_note_id = notes.last().map_or(1, |n| n.id + 1);

        self.scene = save.scene;
        self.party = party;
        self.treasury = treasury;
        self.engine_log = save.engine_log;
        self.notes = notes;
        self.next_note_id = next_note_id;
        self.kb_overrides = save.kb_overrides;
        self.custom_cards = save.custom_cards;
        self.turns_without_notes = save.turns_without_notes;
        self.next_proposal_id = save.proposals.iter().map(|p| p.id).max().unwrap_or(0) + 1;
        self.proposals = save.proposals;
        self.undo = None;
        self.campaign = save.campaign;
        self.xp_log = save.xp_log;
        let ids: Vec<String> = self.party.iter().map(|c| c.id.clone()).collect();
        self.level_up_open = save.level_up_open.into_iter().filter(|id| ids.contains(id)).collect();
        self.master_memo = None;
        self.repair_links();
        self.chronicle_from = self.scene.day;
        self.turns_since_chronicle = 0;
        self.log(format!("Загружено сохранение: День {}", self.scene.day));

        Ok(LoadReport {
            format_version: save.format_version,
            day: self.scene.day,
            location: self.scene.location.clone(),
            supplemented: report,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::knowledge::NoteLayer;
    use crate::master_ops::HpChange;
    use crate::rng::Xoshiro256;
    use crate::spellcasting::CastRequest;

    fn session() -> Session {
        Session::demo(Xoshiro256::from_seed(1))
    }

    /// Сохранение текущей сессии в виде, в каком его прочитает загрузка.
    fn round_trip(s: &Session) -> SaveData {
        let state = s.save_state();
        SaveData {
            format_version: state.format_version,
            scene: state.scene,
            party: state
                .party
                .iter()
                .map(|c| SavedCharacter {
                    id: c.id.clone(),
                    hit_points: Some(c.hit_points),
                    location: Some(c.location.clone()),
                    resources: Some(
                        c.resources()
                            .iter()
                            .map(|r| SavedPool { id: r.id().into(), current: r.current() })
                            .collect(),
                    ),
                    spellcasting: c.spellcasting.as_ref().map(|sc| SavedSpellcasting {
                        casters: sc
                            .casters
                            .iter()
                            .map(|k| SavedCaster { id: k.id.clone(), prepared: k.prepared.clone() })
                            .collect(),
                        scrolls: sc.scrolls.clone(),
                        can_prepare: sc.can_prepare,
                    }),
                    profile: Some(SavedProfile {
                        conditions: c.profile.conditions.clone(),
                        exhaustion: c.profile.exhaustion,
                        hit_dice: c.profile.hit_dice.clone(),
                        xp: c.profile.xp,
                    }),
                    inventory: Some(c.inventory.clone()),
                    edits: c.edits.clone(),
                })
                .collect(),
            treasury: state.treasury,
            engine_log: state.engine_log,
            notes: state.notes,
            kb_overrides: state.kb_overrides,
            custom_cards: state.custom_cards,
            turns_without_notes: state.turns_without_notes,
            proposals: state.proposals,
            campaign: state.campaign,
            xp_log: state.xp_log,
            level_up_open: state.level_up_open,
        }
    }

    #[test]
    fn dynamic_state_survives_round_trip() {
        let mut s = session();
        s.change_hp("pc.nikis", HpChange::Damage(20)).unwrap();
        s.cast_spell("pc.nikis", &CastRequest::new("misty-step")).unwrap();
        s.cast_spell(
            "pc.nikis",
            &CastRequest::new("counterspell").with_method(crate::CastMethod::Scroll),
        )
        .unwrap();
        s.set_condition("npc.corvus", "Отравлен", true).unwrap();
        s.add_item("pc.nikis", "Печать Вернера", 1, None, "Документы", "").unwrap();
        s.add_note(NoteLayer::Player, "Пароль", "Серый рассвет").unwrap();
        s.master_treasury_entry("gp", "purse", -80, "Ужин").unwrap();
        let save = round_trip(&s);

        let mut loaded = Session::demo(Xoshiro256::from_seed(9));
        let report = loaded.load(save).unwrap();
        assert!(report.supplemented.is_empty(), "{:?}", report.supplemented);
        let nikis = loaded.character("pc.nikis").unwrap();
        assert_eq!(nikis.hit_points.current, s.character("pc.nikis").unwrap().hit_points.current);
        assert_eq!(nikis.resource("pact.slots").unwrap().current(), 1);
        let scrolls = &nikis.spellcasting.as_ref().unwrap().scrolls;
        assert_eq!(scrolls.iter().find(|x| x.spell_id == "counterspell").unwrap().count, 1);
        assert!(nikis.inventory.find_item("Печать Вернера").is_ok());
        assert_eq!(loaded.character("npc.corvus").unwrap().profile.conditions, vec!["Отравлен"]);
        assert_eq!(loaded.treasury_view().total, s.treasury_view().total);
        assert_eq!(loaded.notes().len(), 1);
        // Номера продолжаются после загруженных.
        let id = loaded.add_note(NoteLayer::Master, "Ещё", "x").unwrap();
        assert_eq!(id, 2);
        assert!(loaded.master_undo_info().is_none());
    }

    #[test]
    fn static_sheet_comes_from_app_and_gaps_are_reported() {
        let s = session();
        let mut save = round_trip(&s);
        let gunther = save.party.iter_mut().find(|c| c.id == "npc.gunther").unwrap();
        gunther.resources = None;
        gunther.hit_points = Some(HitPoints { current: 500, max: 500, temporary: 0 });
        save.party.retain(|c| c.id != "npc.brokk");
        save.party.push(SavedCharacter {
            id: "npc.ghost".into(),
            hit_points: None,
            location: None,
            resources: None,
            spellcasting: None,
            profile: None,
            inventory: None,
            edits: Vec::new(),
        });
        let mut loaded = session();
        let report = loaded.load(save).unwrap();
        let gunther = loaded.character("npc.gunther").unwrap();
        assert_eq!(gunther.hit_points.current, 72);
        assert_eq!(gunther.hit_points.max, 72);
        assert_eq!(gunther.details().saves[0].total, 6);
        let text = report.supplemented.join("\n");
        assert!(text.contains("хиты 500"));
        assert!(text.contains("ресурсы — из приложения"));
        assert!(text.contains("Брокк"));
        assert!(text.contains("npc.ghost"));
    }

    #[test]
    fn old_saves_get_valeria_fixes_once() {
        const WAND: &str = "Палочка военного мага +1";
        let s = session();
        let mut save = round_trip(&s);
        save.format_version = 4;
        let wands = |save: &mut SaveData, id: &str| -> u32 {
            let c = save.party.iter_mut().find(|c| c.id == id).unwrap();
            c.inventory
                .as_ref()
                .unwrap()
                .items
                .iter()
                .filter(|i| i.name == WAND)
                .map(|i| i.quantity)
                .sum()
        };
        // Как в файле 0.7.0: палочек в сейфе две, у Валерии нет, подготовлено старое.
        let valeria = save.party.iter_mut().find(|c| c.id == "npc.valeria").unwrap();
        valeria.inventory.as_mut().unwrap().items.retain(|i| i.name != WAND);
        valeria.spellcasting.as_mut().unwrap().casters[0].prepared =
            vec!["bless".into(), "remove-curse".into()];
        let nikis = save.party.iter_mut().find(|c| c.id == "pc.nikis").unwrap();
        nikis
            .inventory
            .as_mut()
            .unwrap()
            .items
            .iter_mut()
            .find(|i| i.name == WAND)
            .unwrap()
            .quantity = 2;
        assert_eq!(wands(&mut save, "pc.nikis"), 2);

        let mut loaded = session();
        let report = loaded.load(save).unwrap();
        assert!(report.supplemented.iter().any(|r| r.contains("Палочка")));
        let valeria = loaded.character("npc.valeria").unwrap();
        assert!(valeria.inventory.find_item(WAND).is_ok());
        let prepared = &valeria.spellcasting.as_ref().unwrap().casters[0].prepared;
        assert_eq!(prepared.len(), 13);
        assert!(!prepared.contains(&"remove-curse".to_string()));
        let nikis = loaded.character("pc.nikis").unwrap();
        assert_eq!(nikis.inventory.find_item(WAND).unwrap().quantity, 1);

        // Новый формат повторно не исправляется.
        let again = round_trip(&loaded);
        let report = session().load(again).unwrap();
        assert!(report.supplemented.is_empty(), "{:?}", report.supplemented);
    }

    #[test]
    fn nikis_level_eleven() {
        let s = session();
        let n = s.character("pc.nikis").unwrap();
        assert_eq!(n.level(), 11);
        assert_eq!(n.proficiency_bonus(), 4);
        let book = n.spellbook().unwrap();
        assert_eq!(book.casters[0].save_dc, 17);
        assert_eq!(book.casters[0].attack_bonus, 8);
        assert_eq!(n.skill_total(crate::Skill::Deception), 10);
        assert_eq!(n.skill_total(crate::Skill::SleightOfHand), 15);
        assert_eq!(n.skill_total(crate::Skill::Perception), 5);
        assert_eq!(n.resource("feat.metamagic_adept").unwrap().max(), 2);
        let pact = book.slots.iter().find(|s| s.pact).unwrap();
        assert_eq!((pact.level, pact.pool.max()), (4, 2));
    }

    #[test]
    fn brokk_level_nine() {
        let s = session();
        let b = s.character("npc.brokk").unwrap();
        let d = b.details();
        assert_eq!(b.proficiency_bonus(), 4);
        assert_eq!(
            d.saves.iter().find(|x| x.ability == crate::Ability::Strength).unwrap().total,
            9
        );
        assert_eq!(b.skill_total(crate::Skill::Athletics), 9);
        assert_eq!(b.skill_total(crate::Skill::Perception), 5);
        let hammer = &d.attacks[0];
        assert_eq!(hammer.to_hit, 10);
        assert_eq!(hammer.damage, "1d8+8 дробящий");
        assert_eq!(d.attacks[1].to_hit, 9);
        assert_eq!(b.resource("fighter.indomitable").unwrap().max(), 1);

        let mut save = round_trip(&s);
        save.format_version = 5;
        let brokk = save.party.iter_mut().find(|c| c.id == "npc.brokk").unwrap();
        brokk.hit_points = Some(HitPoints { current: 76, max: 76, temporary: 0 });
        let inv = brokk.inventory.as_mut().unwrap();
        inv.items.iter_mut().find(|i| i.name == "Дварфийские латы").unwrap().name =
            "Латная кираса".into();
        let mut loaded = session();
        loaded.load(save).unwrap();
        let b = loaded.character("npc.brokk").unwrap();
        assert_eq!(b.hit_points.current, 103);
        assert!(b.inventory.find_item("Дварфийские латы").is_ok());
    }

    #[test]
    fn valeria_sheet_matches_rules() {
        let s = session();
        let v = s.character("npc.valeria").unwrap();
        let d = v.details();
        let attack = |name: &str| d.attacks.iter().find(|a| a.name == name).unwrap().clone();
        assert_eq!(attack("Кадило-булава").to_hit, 4);
        assert_eq!(attack("Кадило-булава").damage, "1d6+1 дробящий");
        let toll = attack("Погребальный звон");
        assert_eq!(toll.save_dc, Some(16));
        assert!(toll.damage.starts_with("2d8+5 некротический"));
        let book = v.spellbook().unwrap();
        assert_eq!(book.casters[0].save_dc, 16);
        assert_eq!(book.casters[0].attack_bonus, 9);
        assert_eq!(book.casters[0].prepared_count, Some(13));
        assert_eq!(v.skill_total(crate::Skill::Perception), 8);
        assert_eq!(v.skill_total(crate::Skill::Religion), 4);
        assert_eq!(v.skill_total(crate::Skill::Persuasion), 3);
        assert_eq!(v.resource("cleric.sentinel").unwrap().max(), 5);
        assert_eq!(v.resource("cleric.eyes_of_grave").unwrap().max(), 5);
    }

    #[test]
    fn custom_campaign_round_trip_rebuilds_heroes() {
        use crate::creation::tests::wizard_spec;
        use crate::creation::Campaign;
        let campaign =
            Campaign {
                id: "camp.test".into(), title: "Проба".into(), heroes: vec![wizard_spec()]
            };
        let scene = Scene {
            day: 30,
            time: None,
            location: "Перекрёсток".into(),
            situation: String::new(),
            mood: crate::session::Mood::Calm,
        };
        let mut s = Session::new_campaign(Xoshiro256::from_seed(4), campaign, scene, 30).unwrap();
        assert_eq!(s.party().len(), 1);
        assert_eq!(s.treasury().quantity("gp", "purse"), 30);
        s.character_mut("pc.hero").unwrap().hit_points.current = 7;
        let save = round_trip(&s);
        assert!(save.campaign.is_some());

        let mut other = session();
        let report = other.load(save).unwrap();
        assert_eq!(report.day, 30);
        assert_eq!(other.party().len(), 1);
        let hero = other.character("pc.hero").unwrap();
        assert_eq!(hero.hit_points.current, 7);
        assert_eq!(hero.hit_points.max, 20);
        assert_eq!(other.campaign().map(|c| c.title.as_str()), Some("Проба"));
        // Миграции «Дома Стрэндж» к своей кампании не применяются.
        assert!(report.supplemented.iter().all(|r| !r.contains("Валерия")));
    }

    #[test]
    fn bad_saves_are_rejected_without_changes() {
        let mut s = session();
        let mut old = round_trip(&s);
        old.format_version = 2;
        assert!(matches!(s.load(old), Err(EngineError::InvalidSave(_))));
        let mut future = round_trip(&s);
        future.format_version = SAVE_FORMAT_VERSION + 1;
        assert!(s.load(future).is_err());
        let before = s.checkpoint();
        let mut broken = round_trip(&s);
        broken.treasury.record_unchecked_for_test("gp", "purse", -1_000_000);
        assert!(s.load(broken).is_err());
        assert_eq!(s.checkpoint(), before);
    }
}
