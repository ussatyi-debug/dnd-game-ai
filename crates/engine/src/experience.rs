//! Опыт и повышение уровня (решения владельца 11–12.11.2026).
//!
//! - Опыт — очками по таблице правил, не вехами.
//! - По ходу игры мастер оставляет пометки, за что положен опыт (`xp_note`), шкалу не трогает.
//! - В конце дня, на отдыхе или по заявке игрока мастер подсчитывает опыт по пометкам и
//!   начисляет его всему отряду, включая отсутствующих (`award_xp`); журнал очищается.
//! - Порог пройден — повышение открывается на ближайшем длительном отдыхе.
//! - Повышают уровень герои и спутники своей кампании (по правилам 2024 года): интерфейс
//!   собирает лист нового уровня мастером создания, движок проверяет его и меняет лист,
//!   сохраняя то, что менялось в игре. Отряд «Дома Стрэндж» копит опыт; повышение для него —
//!   после перевода на правила 2024 года.

use crate::character::Character;
use crate::creation::{build_hero, HeroSpec, XP_THRESHOLDS};
use crate::error::EngineError;
use crate::savegame::{
    apply_character, SavedCaster, SavedCharacter, SavedPool, SavedProfile, SavedSpellcasting,
};
use crate::session::Session;

/// Наибольший уровень по правилам.
pub const MAX_LEVEL: u32 = 20;
/// Больше пометок журнал не держит (старые сливаются в одну).
const MAX_XP_NOTES: usize = 60;

/// Пометка мастера: за что положен опыт.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(default))]
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct XpNote {
    pub day: u32,
    pub text: String,
    /// Оценка мастера в очках на каждого (0 — без оценки).
    pub xp: u32,
}

/// Опыт одного члена отряда.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct XpMember {
    pub id: String,
    pub name: String,
    pub level: u32,
    pub xp: u32,
    /// Порог следующего уровня (`None` — 20 уровень).
    pub xp_next: Option<u32>,
    /// Порог следующего уровня пройден.
    pub ready: bool,
    /// Повышение открыто (был длительный отдых после порога).
    pub open: bool,
    /// Лист можно повысить в этой кампании (герой или спутник своей кампании).
    pub can_level: bool,
    /// Почему повысить нельзя (пусто, если можно или порог не пройден).
    pub reason: String,
}

/// Журнал и опыт отряда.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct XpStatus {
    pub notes: Vec<XpNote>,
    /// Сумма оценок мастера по пометкам (на каждого).
    pub pending: u32,
    pub members: Vec<XpMember>,
}

/// Итог начисления.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct XpAward {
    pub each: u32,
    /// Кто прошёл порог следующего уровня.
    pub ready: Vec<String>,
}

/// Порог уровня `level` (1–20).
fn threshold(level: u32) -> u32 {
    XP_THRESHOLDS[(level.clamp(1, MAX_LEVEL) - 1) as usize]
}

/// Порог следующего уровня после `level`.
pub fn next_threshold(level: u32) -> Option<u32> {
    (level < MAX_LEVEL).then(|| threshold(level + 1))
}

/// Состояние персонажа в виде записи сохранения — чтобы перенести его на новый лист.
fn dynamic_state(c: &Character) -> SavedCharacter {
    SavedCharacter {
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
    }
}

impl Session {
    fn xp_of(c: &Character) -> u32 {
        c.profile.xp.unwrap_or_else(|| threshold(c.level()))
    }

    fn level_up_block(&self, c: &Character) -> String {
        match &self.campaign {
            None => {
                "отряд «Дома Стрэндж» повышает уровень после перевода на правила 2024 года".into()
            }
            Some(campaign) => match campaign.heroes.iter().find(|h| h.id == c.id) {
                None => "лист не из мастера создания".into(),
                Some(h) if h.classes.len() > 1 => "мультикласс пока не поддерживается".into(),
                Some(_) if c.level() >= MAX_LEVEL => "20 уровень — наибольший".into(),
                Some(_) => String::new(),
            },
        }
    }

    /// Опыт отряда и журнал мастера.
    pub fn xp_status(&self) -> XpStatus {
        let members = self
            .party
            .iter()
            .map(|c| {
                let level = c.level();
                let xp = Self::xp_of(c);
                let xp_next = next_threshold(level);
                let ready = xp_next.is_some_and(|t| xp >= t);
                let reason = self.level_up_block(c);
                XpMember {
                    id: c.id.clone(),
                    name: c.name.clone(),
                    level,
                    xp,
                    xp_next,
                    ready,
                    open: ready && self.level_up_open.contains(&c.id),
                    can_level: reason.is_empty(),
                    reason,
                }
            })
            .collect();
        XpStatus {
            notes: self.xp_log.clone(),
            pending: self.xp_log.iter().map(|n| n.xp).sum(),
            members,
        }
    }

    /// Пометка мастера в журнал опыта.
    pub fn note_xp(&mut self, text: &str, xp: u32) -> Result<usize, EngineError> {
        let result = (|| {
            let text = text.trim();
            if text.is_empty() {
                return Err(EngineError::Experience("пустая пометка опыта".into()));
            }
            if self.xp_log.len() >= MAX_XP_NOTES {
                let merged: Vec<XpNote> = self.xp_log.drain(..2).collect();
                self.xp_log.insert(
                    0,
                    XpNote {
                        day: merged[0].day,
                        text: merged.iter().map(|n| n.text.as_str()).collect::<Vec<_>>().join("; "),
                        xp: merged.iter().map(|n| n.xp).sum(),
                    },
                );
            }
            self.xp_log.push(XpNote { day: self.scene.day, text: text.to_string(), xp });
            Ok(self.xp_log.len())
        })();
        self.logged(
            result,
            |n| format!("Пометка опыта: {} (в журнале {n})", text.trim()),
            || "пометка опыта".into(),
        )
    }

    /// Начисляет опыт каждому члену отряда (включая отсутствующих) и очищает журнал.
    pub fn award_xp(&mut self, each: u32, reason: &str) -> Result<XpAward, EngineError> {
        let result = (|| {
            if each == 0 {
                return Err(EngineError::Experience("опыт должен быть больше нуля".into()));
            }
            if each > 100_000 {
                return Err(EngineError::Experience(format!(
                    "{each} очков за раз — слишком много"
                )));
            }
            let mut ready = Vec::new();
            for c in &mut self.party {
                let xp = Self::xp_of(c).saturating_add(each);
                c.profile.xp = Some(xp);
                c.profile.xp_next = next_threshold(c.level());
                // Правка опыта игроком заменена начислением.
                c.edits.retain(|e| {
                    !matches!(e, crate::sheet_edits::SheetEdit::Number { field, .. } if field == "xp" || field == "xp_next")
                });
                if c.profile.xp_next.is_some_and(|t| xp >= t) {
                    ready.push(c.name.clone());
                }
                if let Some(campaign) = self.campaign.as_mut() {
                    if let Some(spec) = campaign.heroes.iter_mut().find(|h| h.id == c.id) {
                        spec.xp = xp;
                    }
                }
            }
            self.xp_log.clear();
            Ok(XpAward { each, ready })
        })();
        let reason = reason.trim().to_string();
        self.logged(
            result,
            |a| {
                let mut line = format!("Опыт: +{} каждому", a.each);
                if !reason.is_empty() {
                    line.push_str(&format!(" ({reason})"));
                }
                if !a.ready.is_empty() {
                    line.push_str(&format!(
                        "; порог уровня пройден — {} (повышение на длительном отдыхе)",
                        a.ready.join(", ")
                    ));
                }
                line
            },
            || "начисление опыта".into(),
        )
    }

    /// Длительный отдых: тем, кто прошёл порог, открывается повышение уровня.
    pub(crate) fn open_level_ups(&mut self) {
        let ready: Vec<(String, String)> = self
            .party
            .iter()
            .filter(|c| next_threshold(c.level()).is_some_and(|t| Self::xp_of(c) >= t))
            .filter(|c| !self.level_up_open.contains(&c.id))
            .map(|c| (c.id.clone(), c.name.clone()))
            .collect();
        for (id, name) in ready {
            self.level_up_open.push(id);
            self.log(format!("{name}: можно повысить уровень"));
        }
    }

    /// Повышение уровня по листу нового уровня из мастера создания.
    ///
    /// Лист проверяется движком; всё, что менялось в игре (текущие хиты с прибавкой, ресурсы,
    /// подготовленные заклинания, состояния, кости хитов, снаряжение, правки), переносится.
    pub fn level_up(&mut self, mut spec: HeroSpec) -> Result<String, EngineError> {
        let result =
            (|| {
                let index = self.party.iter().position(|c| c.id == spec.id).ok_or_else(|| {
                    EngineError::Experience(format!("нет члена отряда {}", spec.id))
                })?;
                let old = &self.party[index];
                let block = self.level_up_block(old);
                if !block.is_empty() {
                    return Err(EngineError::Experience(block));
                }
                if !self.level_up_open.contains(&old.id) {
                    return Err(EngineError::Experience(
                        "повышение открывается на длительном отдыхе после порога опыта".into(),
                    ));
                }
                let level = old.level();
                let xp = Self::xp_of(old);
                if spec.level() != level + 1 {
                    return Err(EngineError::Experience(format!(
                        "новый лист {} уровня, а должен быть {}",
                        spec.level(),
                        level + 1
                    )));
                }
                if xp < threshold(level + 1) {
                    return Err(EngineError::Experience(format!(
                        "опыта {xp} меньше порога {} уровня ({})",
                        level + 1,
                        threshold(level + 1)
                    )));
                }
                let campaign = self
                    .campaign
                    .as_ref()
                    .ok_or_else(|| EngineError::Experience("нет своей кампании".into()))?;
                let prev =
                    campaign.heroes.iter().find(|h| h.id == spec.id).cloned().ok_or_else(|| {
                        EngineError::Experience("лист не из мастера создания".into())
                    })?;
                if prev.classes.first().map(|c| &c.id) != spec.classes.first().map(|c| &c.id) {
                    return Err(EngineError::Experience("класс при повышении не меняется".into()));
                }
                spec.kind = prev.kind;
                spec.xp = xp;
                spec.portrait =
                    if spec.portrait.is_empty() { prev.portrait.clone() } else { spec.portrait };

                let mut hero = build_hero(&spec, &old.location)?;
                let mut state = dynamic_state(old);
                // Прибавка максимума хитов приходит и к текущим.
                let gained = hero.hit_points.max.saturating_sub(old.hit_points.max);
                if let Some(hp) = state.hit_points.as_mut() {
                    hp.current = hp.current.saturating_add(gained);
                }
                // Новая кость хитов — заполненной.
                if let Some(profile) = state.profile.as_mut() {
                    for dice in &mut profile.hit_dice {
                        dice.current = dice.current.saturating_add(1);
                    }
                }
                let mut report = Vec::new();
                apply_character(&mut hero, state, &mut report);
                hero.profile.xp = Some(xp);
                hero.profile.xp_next = next_threshold(level + 1);
                let name = hero.name.clone();
                self.party[index] = hero;
                if let Some(campaign) = self.campaign.as_mut() {
                    if let Some(h) = campaign.heroes.iter_mut().find(|h| h.id == spec.id) {
                        *h = spec;
                    }
                }
                self.level_up_open.retain(|id| id != &self.party[index].id);
                Ok(format!("{name}: {} уровень", level + 1))
            })();
        self.logged(
            result,
            |line| format!("Повышение уровня — {line}"),
            || "повышение уровня".into(),
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::resource::RestKind;
    use crate::rng::Xoshiro256;
    use crate::session::Session;

    #[test]
    fn award_reaches_everyone_and_clears_log() {
        let mut s = Session::demo(Xoshiro256::from_seed(1));
        s.note_xp("победа над стражами склепа", 300).unwrap();
        s.note_xp("разгадали загадку", 100).unwrap();
        assert_eq!(s.xp_status().pending, 400);
        let before: Vec<u32> = s.xp_status().members.iter().map(|m| m.xp).collect();
        s.award_xp(400, "склеп").unwrap();
        let st = s.xp_status();
        assert!(st.notes.is_empty());
        for (m, b) in st.members.iter().zip(before) {
            assert_eq!(m.xp, b + 400);
            // Отряд Стрэнджей уровень пока не повышает.
            assert!(!m.can_level);
        }
        assert!(s.award_xp(0, "").is_err());
    }

    #[test]
    fn long_rest_opens_level_up_after_threshold() {
        let mut s = Session::demo(Xoshiro256::from_seed(2));
        let id = s.xp_status().members[0].id.clone();
        let need = {
            let m = &s.xp_status().members[0];
            m.xp_next.unwrap() - m.xp
        };
        s.award_xp(need, "").unwrap();
        let m = s.xp_status().members.into_iter().find(|m| m.id == id).unwrap();
        assert!(m.ready && !m.open);
        s.take_rest(RestKind::Short);
        assert!(!s.xp_status().members[0].open);
        s.take_rest(RestKind::Long);
        assert!(s.xp_status().members[0].open);
    }

    #[test]
    fn own_hero_levels_up_keeping_game_state() {
        use crate::creation::tests::wizard_spec;
        use crate::master_ops::HpChange;
        use crate::recruit::tests::{at_level, own};
        let mut s = own(3);
        let id = s.party()[0].id.clone();
        s.change_hp(&id, HpChange::Damage(5)).unwrap();
        let before = s.party()[0].hit_points;
        // Без порога и отдыха — нельзя.
        assert!(s.level_up(at_level(wizard_spec(), 4)).is_err());
        let need = next_threshold(3).unwrap() - s.xp_status().members[0].xp;
        s.award_xp(need, "проба").unwrap();
        assert!(s.level_up(at_level(wizard_spec(), 4)).is_err(), "нужен длительный отдых");
        s.take_rest(RestKind::Long);
        s.change_hp(&id, HpChange::Damage(5)).unwrap();
        let rested = s.party()[0].hit_points;
        assert!(s.level_up(at_level(wizard_spec(), 5)).is_err(), "только на один уровень");
        s.level_up(at_level(wizard_spec(), 4)).unwrap();
        let hero = &s.party()[0];
        assert_eq!(hero.level(), 4);
        assert!(hero.hit_points.max > before.max);
        assert_eq!(hero.hit_points.current, rested.current + (hero.hit_points.max - rested.max));
        assert_eq!(hero.profile.xp, Some(next_threshold(3).unwrap()));
        assert_eq!(s.save_state().campaign.unwrap().heroes[0].classes[0].level, 4);
        assert!(!s.xp_status().members[0].open);
    }

    #[test]
    fn xp_survives_save_round_trip() {
        let mut s = Session::demo(Xoshiro256::from_seed(3));
        s.note_xp("находка", 50).unwrap();
        let state = s.save_state();
        assert_eq!(state.xp_log.len(), 1);
    }
}
