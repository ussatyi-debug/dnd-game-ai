//! Правки постоянной части листа игроком — отдельным слоем поверх листа из приложения.
//!
//! Постоянная часть листа (характеристики, владения, навыки, атаки, умения) берётся из
//! приложения, поэтому исправления листа в новых версиях не пропадают. Правки игрока
//! хранятся списком операций и в сохранении; лист = лист приложения + операции. Операцию
//! можно отменить («вернуть как в приложении»): лист пересобирается без неё.
//!
//! Мастер правит лист только через предложение ([`SheetProposal`]): игрок принимает его
//! или отклоняет.

use crate::character::{Ability, Character};
use crate::error::EngineError;
use crate::fixtures::demo_party;
use crate::profile::{
    Attack, Attunement, Bonus, Feature, Proficiency, ProficiencyLine, Skill, SkillEntry,
};
use crate::session::Session;

/// Одна правка листа.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(tag = "op", rename_all = "snake_case"))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SheetEdit {
    /// Текстовое поле: `background`, `alignment`, `appearance`, `attunement_note`.
    Text { field: String, value: String },
    /// Число: `armor_class`, `speed_ft`, `hp_max`, `xp`, `xp_next`.
    Number { field: String, value: i64 },
    /// Значение характеристики (1–30).
    Ability { ability: Ability, score: u8 },
    /// Владение спасброском.
    Save { ability: Ability, proficient: bool },
    /// Владение навыком и прочие бонусы (бонусы предметов из листа сохраняются).
    Skill {
        skill: Skill,
        proficiency: Proficiency,
        #[cfg_attr(feature = "serde", serde(default))]
        source: String,
    },
    /// Строка владений («Языки», «Оружие»…); пустой текст — убрать строку.
    Proficiency { kind: String, text: String },
    /// Умение или черта; пустой текст — убрать.
    Feature { name: String, source: String, text: String },
    /// Настроенный предмет; `remove` — снять настройку.
    Attunement {
        name: String,
        effect: String,
        #[cfg_attr(feature = "serde", serde(default))]
        remove: bool,
    },
    /// Атака целиком; `remove` — убрать атаку с этим названием.
    Attack {
        attack: Attack,
        #[cfg_attr(feature = "serde", serde(default))]
        remove: bool,
    },
}

impl SheetEdit {
    /// Ключ правки: новая правка с тем же ключом заменяет прежнюю.
    pub fn key(&self) -> String {
        match self {
            SheetEdit::Text { field, .. } | SheetEdit::Number { field, .. } => field.clone(),
            SheetEdit::Ability { ability, .. } => format!("ability.{}", ability.short_name()),
            SheetEdit::Save { ability, .. } => format!("save.{}", ability.short_name()),
            SheetEdit::Skill { skill, .. } => format!("skill.{}", skill.name()),
            SheetEdit::Proficiency { kind, .. } => format!("proficiency.{}", kind.trim()),
            SheetEdit::Feature { name, .. } => format!("feature.{}", name.trim()),
            SheetEdit::Attunement { name, .. } => format!("attunement.{}", name.trim()),
            SheetEdit::Attack { attack, .. } => format!("attack.{}", attack.name.trim()),
        }
    }

    /// Описание для журнала и подтверждения.
    pub fn summary(&self) -> String {
        match self {
            SheetEdit::Text { field, value } => format!("{}: {value}", field_label(field)),
            SheetEdit::Number { field, value } => format!("{}: {value}", field_label(field)),
            SheetEdit::Ability { ability, score } => format!("{} {score}", ability.short_name()),
            SheetEdit::Save { ability, proficient } => format!(
                "спасбросок {}: {}",
                ability.short_name(),
                if *proficient { "владение" } else { "без владения" }
            ),
            SheetEdit::Skill { skill, proficiency, .. } => format!(
                "{}: {}",
                skill.name(),
                match proficiency {
                    Proficiency::None => "без владения",
                    Proficiency::Proficient => "владение",
                    Proficiency::Expertise => "компетентность",
                }
            ),
            SheetEdit::Proficiency { kind, text } if text.trim().is_empty() => {
                format!("убрать строку владений «{kind}»")
            }
            SheetEdit::Proficiency { kind, text } => format!("{kind}: {text}"),
            SheetEdit::Feature { name, text, .. } if text.trim().is_empty() => {
                format!("убрать умение «{name}»")
            }
            SheetEdit::Feature { name, .. } => format!("умение «{name}»"),
            SheetEdit::Attunement { name, remove: true, .. } => format!("снять настройку «{name}»"),
            SheetEdit::Attunement { name, .. } => format!("настройка «{name}»"),
            SheetEdit::Attack { attack, remove: true } => format!("убрать атаку «{}»", attack.name),
            SheetEdit::Attack { attack, .. } => format!("атака «{}»", attack.name),
        }
    }
}

fn field_label(field: &str) -> &str {
    match field {
        "background" => "предыстория",
        "alignment" => "мировоззрение",
        "appearance" => "внешность",
        "attunement_note" => "настройка (примечание)",
        "armor_class" => "КД",
        "speed_ft" => "скорость",
        "hp_max" => "максимум хитов",
        "xp" => "опыт",
        "xp_next" => "опыт до уровня",
        other => other,
    }
}

/// Предложение мастера изменить лист: ждёт решения игрока.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SheetProposal {
    pub id: u64,
    pub character_id: String,
    pub character_name: String,
    pub edit: SheetEdit,
    pub summary: String,
    pub reason: String,
}

fn apply_edit(c: &mut Character, edit: &SheetEdit) -> Result<(), EngineError> {
    let p = &mut c.profile;
    match edit {
        SheetEdit::Text { field, value } => {
            let v = value.trim().to_string();
            match field.as_str() {
                "background" => p.background = v,
                "alignment" => p.alignment = v,
                "appearance" => p.appearance = v,
                "attunement_note" => p.attunement_note = v,
                other => return Err(EngineError::UnknownSheetField(other.into())),
            }
        }
        SheetEdit::Number { field, value } => {
            let bad = || EngineError::InvalidSheetValue(format!("{}: {value}", field_label(field)));
            match field.as_str() {
                "armor_class" => {
                    c.armor_class = i32::try_from(*value)
                        .ok()
                        .filter(|v| (1..=40).contains(v))
                        .ok_or_else(bad)?;
                }
                "speed_ft" => {
                    c.speed_ft =
                        u32::try_from(*value).ok().filter(|v| *v <= 200).ok_or_else(bad)?;
                }
                "hp_max" => {
                    let max = u32::try_from(*value)
                        .ok()
                        .filter(|v| (1..=999).contains(v))
                        .ok_or_else(bad)?;
                    c.hit_points.max = max;
                    c.hit_points.current = c.hit_points.current.min(max);
                }
                "xp" => p.xp = Some(u32::try_from(*value).map_err(|_| bad())?),
                "xp_next" => p.xp_next = Some(u32::try_from(*value).map_err(|_| bad())?),
                other => return Err(EngineError::UnknownSheetField(other.into())),
            }
        }
        SheetEdit::Ability { ability, score } => {
            if !(1..=30).contains(score) {
                return Err(EngineError::InvalidSheetValue(format!(
                    "{} {score}",
                    ability.short_name()
                )));
            }
            let a = &mut c.abilities;
            match ability {
                Ability::Strength => a.strength = *score,
                Ability::Dexterity => a.dexterity = *score,
                Ability::Constitution => a.constitution = *score,
                Ability::Intelligence => a.intelligence = *score,
                Ability::Wisdom => a.wisdom = *score,
                Ability::Charisma => a.charisma = *score,
            }
        }
        SheetEdit::Save { ability, proficient } => {
            p.save_proficiencies.retain(|a| a != ability);
            if *proficient {
                p.save_proficiencies.push(*ability);
                p.save_proficiencies.sort_by_key(|a| Ability::ALL.iter().position(|x| x == a));
            }
        }
        SheetEdit::Skill { skill, proficiency, source } => {
            p.skills_listed = true;
            match p.skills.iter_mut().find(|e| e.skill == *skill) {
                Some(e) => {
                    e.proficiency = *proficiency;
                    if !source.trim().is_empty() {
                        e.source = source.trim().into();
                    }
                }
                None => p.skills.push(SkillEntry {
                    skill: *skill,
                    proficiency: *proficiency,
                    source: source.trim().into(),
                    bonuses: Vec::<Bonus>::new(),
                    advantage: Vec::new(),
                }),
            }
        }
        SheetEdit::Proficiency { kind, text } => {
            let kind = kind.trim();
            if kind.is_empty() {
                return Err(EngineError::InvalidSheetValue("пустой вид владения".into()));
            }
            let text = text.trim();
            match p.proficiencies.iter().position(|l| l.kind == kind) {
                Some(i) if text.is_empty() => {
                    p.proficiencies.remove(i);
                }
                Some(i) => {
                    p.proficiencies[i].text = text.into();
                    p.proficiencies[i].from_rules = false;
                }
                None if text.is_empty() => {}
                None => p.proficiencies.push(ProficiencyLine {
                    kind: kind.into(),
                    text: text.into(),
                    from_rules: false,
                }),
            }
        }
        SheetEdit::Feature { name, source, text } => {
            let name = name.trim();
            if name.is_empty() {
                return Err(EngineError::InvalidSheetValue("умение без названия".into()));
            }
            match p.features.iter().position(|f| f.name == name) {
                Some(i) if text.trim().is_empty() => {
                    p.features.remove(i);
                }
                Some(i) => {
                    p.features[i].text = text.trim().into();
                    if !source.trim().is_empty() {
                        p.features[i].source = source.trim().into();
                    }
                }
                None if text.trim().is_empty() => {}
                None => p.features.push(Feature {
                    name: name.into(),
                    source: source.trim().into(),
                    text: text.trim().into(),
                    resource_id: None,
                }),
            }
        }
        SheetEdit::Attunement { name, effect, remove } => {
            let name = name.trim();
            match p.attunement.iter().position(|a| a.name == name) {
                Some(i) if *remove => {
                    p.attunement.remove(i);
                }
                Some(i) => p.attunement[i].effect = effect.trim().into(),
                None if *remove => {}
                None => {
                    if p.attunement.len() >= 3 {
                        return Err(EngineError::InvalidSheetValue(
                            "настроено уже 3 предмета — сначала снимите один".into(),
                        ));
                    }
                    p.attunement
                        .push(Attunement { name: name.into(), effect: effect.trim().into() });
                }
            }
        }
        SheetEdit::Attack { attack, remove } => {
            let name = attack.name.trim();
            if name.is_empty() {
                return Err(EngineError::InvalidSheetValue("атака без названия".into()));
            }
            match p.attacks.iter().position(|a| a.name == name) {
                Some(i) if *remove => {
                    p.attacks.remove(i);
                }
                Some(i) => p.attacks[i] = attack.clone(),
                None if *remove => {}
                None => p.attacks.push(attack.clone()),
            }
        }
    }
    Ok(())
}

/// Переносит постоянную часть листа из `base` (лист приложения), сохраняя то, что меняет игра.
fn reset_static(c: &mut Character, base: &Character) {
    let dynamic = (
        c.hit_points,
        c.profile.conditions.clone(),
        c.profile.exhaustion,
        c.profile.hit_dice.clone(),
    );
    c.abilities = base.abilities;
    c.armor_class = base.armor_class;
    c.speed_ft = base.speed_ft;
    c.hit_points.max = base.hit_points.max;
    c.hit_points.current = dynamic.0.current.min(base.hit_points.max);
    let mut profile = base.profile.clone();
    profile.conditions = dynamic.1;
    profile.exhaustion = dynamic.2;
    profile.hit_dice = dynamic.3;
    c.profile = profile;
}

/// Пересобирает постоянную часть листа: лист приложения + правки игрока.
pub(crate) fn rebuild(c: &mut Character) -> Vec<String> {
    let Some(base) = demo_party().into_iter().find(|b| b.id == c.id) else {
        return Vec::new();
    };
    reset_static(c, &base);
    let edits = c.edits.clone();
    let mut skipped = Vec::new();
    for e in &edits {
        if let Err(err) = apply_edit(c, e) {
            skipped.push(format!("{}: правка «{}» не применена ({err})", c.name, e.summary()));
        }
    }
    skipped
}

impl Character {
    /// Ключи полей, изменённых игроком.
    pub fn edited_keys(&self) -> Vec<String> {
        self.edits.iter().map(SheetEdit::key).collect()
    }
}

impl Session {
    /// Правка листа игроком.
    pub fn edit_sheet(&mut self, id: &str, edit: SheetEdit) -> Result<(), EngineError> {
        let c = self.character_mut(id)?;
        let name = c.name.clone();
        let mut trial = c.clone();
        let result = apply_edit(&mut trial, &edit).map(|()| {
            let key = edit.key();
            trial.edits.retain(|e| e.key() != key);
            trial.edits.push(edit.clone());
            *c = trial;
        });
        self.logged(
            result,
            |()| format!("{name}: лист изменён — {}", edit.summary()),
            || format!("правка листа, {name}"),
        )
    }

    /// Вернуть поле как в приложении (убрать правку игрока).
    pub fn revert_sheet_edit(&mut self, id: &str, key: &str) -> Result<(), EngineError> {
        let c = self.character_mut(id)?;
        let name = c.name.clone();
        let before = c.edits.len();
        c.edits.retain(|e| e.key() != key);
        let result = if c.edits.len() == before {
            Err(EngineError::UnknownSheetField(key.into()))
        } else {
            rebuild(c);
            Ok(())
        };
        self.logged(
            result,
            |()| format!("{name}: лист — возвращено как в приложении ({key})"),
            || format!("правка листа, {name}"),
        )
    }

    pub fn sheet_proposals(&self) -> &[SheetProposal] {
        &self.proposals
    }

    /// Предложение мастера изменить лист (применяется, когда игрок примет).
    pub fn propose_sheet_edit(
        &mut self,
        id: &str,
        edit: SheetEdit,
        reason: &str,
    ) -> Result<u64, EngineError> {
        let c = self.character(id)?;
        let mut trial = c.clone();
        let name = c.name.clone();
        let check = apply_edit(&mut trial, &edit);
        let result = check.map(|()| {
            let pid = self.next_proposal_id;
            self.next_proposal_id += 1;
            self.proposals.push(SheetProposal {
                id: pid,
                character_id: id.to_string(),
                character_name: name.clone(),
                summary: edit.summary(),
                edit,
                reason: reason.trim().to_string(),
            });
            pid
        });
        self.logged(
            result,
            |pid| format!("Мастер предлагает изменить лист ({name}) [предложение {pid}] — ждёт решения игрока"),
            || format!("предложение правки листа, {name}"),
        )
    }

    /// Решение игрока по предложению мастера.
    pub fn resolve_proposal(&mut self, proposal_id: u64, accept: bool) -> Result<(), EngineError> {
        let index = self
            .proposals
            .iter()
            .position(|p| p.id == proposal_id)
            .ok_or(EngineError::UnknownProposal(proposal_id))?;
        let p = self.proposals.remove(index);
        if accept {
            self.edit_sheet(&p.character_id, p.edit)
        } else {
            self.log(format!(
                "{}: предложение мастера отклонено — {}",
                p.character_name, p.summary
            ));
            Ok(())
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::rng::Xoshiro256;

    fn session() -> Session {
        Session::demo(Xoshiro256::from_seed(1))
    }

    #[test]
    fn edits_apply_and_revert_to_app_sheet() {
        let mut s = session();
        s.edit_sheet(
            "npc.gunther",
            SheetEdit::Save { ability: Ability::Strength, proficient: true },
        )
        .unwrap();
        assert_eq!(s.details("npc.gunther").unwrap().saves[0].total, 9);
        s.edit_sheet(
            "npc.gunther",
            SheetEdit::Proficiency {
                kind: "Языки".into(), text: "Общий, дварфский".into()
            },
        )
        .unwrap();
        s.edit_sheet("npc.gunther", SheetEdit::Number { field: "hp_max".into(), value: 60 })
            .unwrap();
        let g = s.character("npc.gunther").unwrap();
        assert_eq!(g.hit_points.max, 60);
        assert_eq!(g.hit_points.current, 60);
        assert_eq!(g.edited_keys().len(), 3);
        s.revert_sheet_edit("npc.gunther", "save.СИЛ").unwrap();
        assert_eq!(s.details("npc.gunther").unwrap().saves[0].total, 6);
        let g = s.character("npc.gunther").unwrap();
        assert_eq!(g.hit_points.max, 60, "другие правки остаются");
        assert!(g.profile.proficiencies.iter().any(|l| l.text == "Общий, дварфский"));
        assert!(s
            .edit_sheet("npc.gunther", SheetEdit::Number { field: "hp_max".into(), value: 0 })
            .is_err());
        assert!(s
            .edit_sheet("npc.gunther", SheetEdit::Text { field: "магия".into(), value: "x".into() })
            .is_err());
    }

    #[test]
    fn master_proposals_wait_for_player() {
        let mut s = session();
        let id = s
            .propose_sheet_edit(
                "pc.nikis",
                SheetEdit::Proficiency {
                    kind: "Языки".into(), text: "Общий, Бездны".into()
                },
                "Игрок назвал языки героя",
            )
            .unwrap();
        assert!(!s
            .character("pc.nikis")
            .unwrap()
            .profile
            .proficiencies
            .iter()
            .any(|l| l.text == "Общий, Бездны"));
        s.resolve_proposal(id, true).unwrap();
        assert!(s
            .character("pc.nikis")
            .unwrap()
            .profile
            .proficiencies
            .iter()
            .any(|l| l.text == "Общий, Бездны"));
        let id = s
            .propose_sheet_edit(
                "pc.nikis",
                SheetEdit::Ability { ability: Ability::Charisma, score: 20 },
                "",
            )
            .unwrap();
        s.resolve_proposal(id, false).unwrap();
        assert_eq!(s.character("pc.nikis").unwrap().abilities.charisma, 15);
        assert!(s.resolve_proposal(id, true).is_err());
    }
}
