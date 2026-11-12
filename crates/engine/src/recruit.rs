//! Новые члены отряда своей кампании (решения владельца 10.11.2026).
//!
//! - Набирать спутников можно, когда главный герой достиг 3 уровня.
//! - Уровень нового спутника — не выше уровня главного героя − 1.
//! - В отряде не больше 5 спутников; спутников ведёт мастер.
//!
//! Два пути: мастер по ходу сцены командой `recruit` предлагает персонажа (имя, вид, класс,
//! уровень…) — интерфейс собирает лист мастером создания и передаёт его сюда; или игрок
//! добавляет спутника кнопкой в окне отряда. Лист проверяется движком, как при создании.

use crate::character::CharacterKind;
use crate::creation::{build_hero, HeroSpec};
use crate::error::EngineError;
use crate::session::Session;

/// Больше спутников в отряде не бывает.
pub const MAX_COMPANIONS: usize = 5;
/// С какого уровня главного героя можно набирать спутников.
pub const RECRUIT_FROM_LEVEL: u32 = 3;

/// Предложение мастера принять персонажа в отряд: ждёт листа из интерфейса.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(default))]
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct RecruitRequest {
    pub id: u64,
    pub name: String,
    /// ID вида из данных создания (human, elf…); пусто — на выбор игрока.
    pub species: String,
    /// ID класса (fighter, rogue, cleric, wizard…).
    pub class: String,
    pub subclass: String,
    pub background: String,
    pub level: u32,
    /// `m` или `f`.
    pub gender: String,
    pub alignment: String,
    pub appearance: String,
    /// Кто это и как попал в отряд — для листа и рассказа.
    pub note: String,
}

/// Возможность набора сейчас.
#[cfg_attr(feature = "serde", derive(serde::Serialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RecruitInfo {
    pub allowed: bool,
    /// Почему нельзя (пусто, если можно).
    pub reason: String,
    pub hero_level: u32,
    /// Наибольший уровень нового спутника.
    pub max_level: u32,
    pub companions: usize,
    pub max_companions: usize,
}

impl Session {
    fn hero_level(&self) -> u32 {
        self.party.iter().find(|c| c.kind == CharacterKind::Player).map(|c| c.level()).unwrap_or(0)
    }

    /// Можно ли сейчас принять спутника и какого уровня.
    pub fn recruit_info(&self) -> RecruitInfo {
        let hero_level = self.hero_level();
        let companions = self.party.iter().filter(|c| c.kind == CharacterKind::Companion).count();
        let reason = if self.campaign.is_none() {
            "в кампании «Дом Стрэндж» отряд уже собран".to_string()
        } else if hero_level < RECRUIT_FROM_LEVEL {
            format!("спутников можно набирать с {RECRUIT_FROM_LEVEL} уровня главного героя (сейчас {hero_level})")
        } else if companions >= MAX_COMPANIONS {
            format!("в отряде уже {MAX_COMPANIONS} спутников — больше нельзя")
        } else {
            String::new()
        };
        RecruitInfo {
            allowed: reason.is_empty(),
            reason,
            hero_level,
            max_level: hero_level.saturating_sub(1).max(1),
            companions,
            max_companions: MAX_COMPANIONS,
        }
    }

    /// Предложения мастера принять персонажа в отряд.
    pub fn recruit_requests(&self) -> &[RecruitRequest] {
        &self.recruits
    }

    /// Мастер предлагает принять персонажа: проверяются правила набора, лист соберёт интерфейс.
    pub fn request_recruit(&mut self, mut request: RecruitRequest) -> Result<u64, EngineError> {
        let result = (|| {
            let info = self.recruit_info();
            if !info.allowed {
                return Err(EngineError::Recruit(info.reason));
            }
            if request.name.trim().is_empty() {
                return Err(EngineError::Recruit("у нового спутника нет имени".into()));
            }
            if request.class.trim().is_empty() {
                return Err(EngineError::Recruit("не указан класс нового спутника".into()));
            }
            if request.level == 0 || request.level > info.max_level {
                request.level = info.max_level;
            }
            self.next_recruit_id += 1;
            request.id = self.next_recruit_id;
            request.name = request.name.trim().to_string();
            let id = request.id;
            self.recruits.push(request);
            Ok(id)
        })();
        self.logged(
            result,
            |id| format!("предложение принять в отряд записано (№{id}) — игрок подтвердит лист"),
            || "новый член отряда".to_string(),
        )
    }

    /// Убирает предложение (игрок отказался или лист принят).
    pub fn dismiss_recruit(&mut self, id: u64) -> bool {
        let before = self.recruits.len();
        self.recruits.retain(|r| r.id != id);
        self.recruits.len() != before
    }

    /// Принимает спутника по листу: правила набора, проверка листа, место — место сцены.
    pub fn add_member(
        &mut self,
        mut spec: HeroSpec,
        request: Option<u64>,
    ) -> Result<String, EngineError> {
        let result = (|| {
            let info = self.recruit_info();
            if !info.allowed {
                return Err(EngineError::Recruit(info.reason));
            }
            let level = spec.level();
            if level > info.max_level {
                return Err(EngineError::Recruit(format!(
                    "уровень спутника {level} выше допустимого {} (уровень героя − 1)",
                    info.max_level
                )));
            }
            spec.kind = CharacterKind::Companion;
            let base = if spec.id.starts_with("npc.") && spec.id.len() > 4 {
                spec.id.clone()
            } else {
                format!("npc.member{}", self.party.len() + 1)
            };
            let mut id = base.clone();
            let mut n = 2;
            while self.party.iter().any(|c| c.id == id) {
                id = format!("{base}_{n}");
                n += 1;
            }
            spec.id = id.clone();
            let character = build_hero(&spec, &self.scene.location)?;
            let name = character.name.clone();
            self.party.push(character);
            if let Some(campaign) = self.campaign.as_mut() {
                campaign.heroes.push(spec);
            }
            if let Some(r) = request {
                self.dismiss_recruit(r);
            }
            // Состав отряда изменился — у мастера новая сцена; появление спутника он опишет сам.
            let line = format!(
                "В отряд вступил(а) {name} — опиши появление спутника в новой сцене, опираясь на предыдущую."
            );
            if !self.scene.situation.contains(&line) {
                self.scene.situation =
                    format!("{} {line}", self.scene.situation.trim()).trim().to_string();
            }
            Ok((id, name))
        })();
        self.logged(
            result,
            |(_, name)| format!("{name} вступает в отряд"),
            || "новый член отряда".to_string(),
        )
        .map(|(id, _)| id)
    }
}

#[cfg(test)]
pub(crate) mod tests {
    use crate::creation::tests::wizard_spec;
    use crate::creation::Campaign;
    use crate::session::{Mood, Scene};
    use crate::{Session, Xoshiro256};

    use super::*;

    /// Волшебник из проб создания на нужном уровне (хиты, заклинатель, опыт — согласованы).
    pub(crate) fn at_level(mut spec: HeroSpec, level: u32) -> HeroSpec {
        const XP: [u32; 10] = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000];
        spec.classes[0].level = level;
        spec.hp.rolls = vec![4; level as usize - 1];
        for caster in &mut spec.casters {
            caster.level = level;
        }
        spec.xp = XP[level as usize - 1];
        spec
    }

    pub(crate) fn own(level: u32) -> Session {
        let hero = at_level(wizard_spec(), level);
        let campaign =
            Campaign { id: "camp.r".into(), title: "Проба".into(), heroes: vec![hero] };
        let scene = Scene {
            day: 20,
            time: None,
            location: "Нойштадт".into(),
            situation: String::new(),
            mood: Mood::Calm,
        };
        Session::new_campaign(Xoshiro256::from_seed(9), campaign, scene, 10).unwrap()
    }

    fn companion(level: u32) -> HeroSpec {
        let mut spec = at_level(wizard_spec(), level);
        spec.id = "npc.eda".into();
        spec.name = "Эда".into();
        spec
    }

    #[test]
    fn recruiting_follows_level_and_size_rules() {
        let mut strange = Session::demo(Xoshiro256::from_seed(1));
        assert!(!strange.recruit_info().allowed, "в Доме Стрэндж отряд собран");
        assert!(strange.add_member(companion(3), None).is_err());
        assert_eq!(own(3).recruit_info().max_level, 2);

        let mut s = own(4);
        let info = s.recruit_info();
        assert!(info.allowed);
        assert_eq!(info.max_level, 3);
        assert!(s.add_member(companion(4), None).is_err(), "выше уровня героя − 1");
        let id = s.add_member(companion(3), None).unwrap();
        assert_eq!(id, "npc.eda");
        assert_eq!(s.character("npc.eda").unwrap().kind, CharacterKind::Companion);
        assert_eq!(s.campaign().unwrap().heroes.len(), 2, "спутник сохраняется с кампанией");
        // Тот же ID — новый спутник получает другой.
        assert_eq!(s.add_member(companion(3), None).unwrap(), "npc.eda_2");
        for _ in 0..3 {
            s.add_member(companion(3), None).unwrap();
        }
        assert_eq!(s.recruit_info().companions, MAX_COMPANIONS);
        assert!(s.add_member(companion(3), None).is_err(), "не больше 5 спутников");
    }

    #[test]
    fn master_request_waits_for_sheet() {
        let mut s = own(5);
        let id = s
            .request_recruit(RecruitRequest {
                name: "Брам".into(),
                class: "cleric".into(),
                level: 9,
                ..RecruitRequest::default()
            })
            .unwrap();
        assert_eq!(s.recruit_requests()[0].level, 4, "уровень урезан до героя − 1");
        s.add_member(companion(4), Some(id)).unwrap();
        assert!(s.recruit_requests().is_empty());
        assert!(own(3)
            .request_recruit(RecruitRequest {
                name: " ".into(),
                class: "rogue".into(),
                ..RecruitRequest::default()
            })
            .is_err());
    }
}
