//! Бой как состояние движка (пак 0.10.1).
//!
//! Бой ведёт мастер: попадания, крит и исходы решает он. Движок держит участников боя
//! (герои, спутники, противники со статблоком), очередь инициативы, журнал подписанных
//! бросков и счёт урона противникам, а в конце боя пишет итог в базу знаний и хронику и
//! напоминает о пометке опыта. Состояние боя уходит в сохранение.

use crate::character::CharacterKind;
use crate::error::EngineError;
use crate::knowledge::{name_in_text, NewNote, NoteLayer};
use crate::session::{Mood, Session};

/// Сторона участника боя.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "lowercase"))]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum Side {
    /// Отряд игрока.
    Party,
    /// Противник.
    #[default]
    Foe,
    /// Союзник отряда, не входящий в отряд.
    Ally,
}

impl Side {
    pub fn parse(text: &str) -> Option<Self> {
        match text.trim().to_lowercase().as_str() {
            "party" | "отряд" => Some(Self::Party),
            "foe" | "enemy" | "враг" | "противник" => Some(Self::Foe),
            "ally" | "союзник" => Some(Self::Ally),
            _ => None,
        }
    }
}

/// Состояние участника боя.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[cfg_attr(feature = "serde", serde(rename_all = "lowercase"))]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum FighterStatus {
    #[default]
    Active,
    /// Без сознания (0 хитов, не убит).
    Down,
    Dead,
    Fled,
    Surrendered,
}

impl FighterStatus {
    pub fn parse(text: &str) -> Option<Self> {
        match text.trim().to_lowercase().as_str() {
            "active" | "в бою" => Some(Self::Active),
            "down" | "unconscious" | "без сознания" => Some(Self::Down),
            "dead" | "killed" | "мёртв" | "мертв" | "мертва" | "мёртва" | "убит" => {
                Some(Self::Dead)
            }
            "fled" | "сбежал" | "бежал" => Some(Self::Fled),
            "surrendered" | "сдался" => Some(Self::Surrendered),
            _ => None,
        }
    }

    pub fn label(self) -> &'static str {
        match self {
            Self::Active => "в бою",
            Self::Down => "без сознания",
            Self::Dead => "мёртв",
            Self::Fled => "сбежал",
            Self::Surrendered => "сдался",
        }
    }
}

/// Участник боя.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq, Default)]
pub struct Fighter {
    pub name: String,
    pub side: Side,
    /// Роль безымянного NPC («простолюдин») или вид существа.
    #[cfg_attr(feature = "serde", serde(default))]
    pub role: String,
    /// Откуда числа: «лист», «бестиарий: Обычный человек», «мастер», «по броску инициативы».
    #[cfg_attr(feature = "serde", serde(default))]
    pub source: String,
    #[cfg_attr(feature = "serde", serde(default))]
    pub ac: Option<i32>,
    #[cfg_attr(feature = "serde", serde(default))]
    pub hp_max: Option<u32>,
    /// Урон из подписанных бросков (у членов отряда хиты ведёт лист).
    #[cfg_attr(feature = "serde", serde(default))]
    pub damage: u32,
    #[cfg_attr(feature = "serde", serde(default))]
    pub status: FighterStatus,
    /// Застигнут врасплох: инициатива с помехой (правила 2024 года).
    #[cfg_attr(feature = "serde", serde(default))]
    pub surprised: bool,
    /// Скрыт или в засаде: инициатива с преимуществом.
    #[cfg_attr(feature = "serde", serde(default))]
    pub hidden: bool,
    /// Краткий статблок для мастера: атаки, опасность.
    #[cfg_attr(feature = "serde", serde(default))]
    pub notes: String,
    /// Член отряда: его id (хиты — из листа).
    #[cfg_attr(feature = "serde", serde(default))]
    pub party_id: String,
    /// Опыт за противника по бестиарию (подсказка для пометки опыта).
    #[cfg_attr(feature = "serde", serde(default))]
    pub xp: u32,
}

impl Fighter {
    /// Хиты, которые остались по счёту урона; `None` — максимум не известен.
    pub fn hp_left(&self) -> Option<i64> {
        self.hp_max.map(|m| i64::from(m) - i64::from(self.damage))
    }

    /// Состояние словами, как его видит игрок: «цел / ранен / тяжело ранен / при смерти».
    pub fn health_word(&self) -> &'static str {
        match self.status {
            FighterStatus::Active => {}
            other => return other.label(),
        }
        let Some(max) = self.hp_max.filter(|m| *m > 0) else {
            return if self.damage == 0 { "цел" } else { "ранен" };
        };
        let left = i64::from(max) - i64::from(self.damage);
        let max = i64::from(max);
        if self.damage == 0 {
            "цел"
        } else if left * 4 <= max {
            "при смерти"
        } else if left * 2 <= max {
            "тяжело ранен"
        } else {
            "ранен"
        }
    }
}

/// Новый участник боя — из команды мастера.
#[derive(Debug, Clone, PartialEq, Eq, Default)]
pub struct NewFighter {
    pub name: String,
    pub side: Side,
    pub role: String,
    pub source: String,
    pub ac: Option<i32>,
    pub hp_max: Option<u32>,
    pub surprised: bool,
    pub hidden: bool,
    pub notes: String,
    pub xp: u32,
}

/// Кого участник атаковал последним (урон без цели привязывается к ней).
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq, Default)]
pub struct TargetLink {
    pub actor: String,
    pub target: String,
}

/// Инициатива участника (для сохранения).
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq, Default)]
pub struct InitiativeEntry {
    pub name: String,
    pub value: i64,
}

/// Текущий бой.
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[derive(Debug, Clone, PartialEq, Eq, Default)]
pub struct Combat {
    pub day: u32,
    #[cfg_attr(feature = "serde", serde(default))]
    pub time: Option<String>,
    #[cfg_attr(feature = "serde", serde(default))]
    pub location: String,
    pub fighters: Vec<Fighter>,
    /// Журнал боя: подписанные броски и события.
    #[cfg_attr(feature = "serde", serde(default))]
    pub log: Vec<String>,
    /// Ходы подряд без атак и урона (разговор вне игры не считается).
    #[cfg_attr(feature = "serde", serde(default))]
    pub quiet_turns: u8,
    #[cfg_attr(feature = "serde", serde(default))]
    pub links: Vec<TargetLink>,
    /// Запись «Бой: …» в журнале мастера.
    #[cfg_attr(feature = "serde", serde(default))]
    pub note_id: Option<u64>,
    /// Черновой бой: открыт броском «инициатива:» без команды combat — ждёт состава.
    #[cfg_attr(feature = "serde", serde(default))]
    pub draft: bool,
}

/// Напоминание о затихшем бое — раз в столько тихих ходов.
pub const COMBAT_QUIET_TURNS: u8 = 3;
/// Самое длинное в журнале боя (строки сверх — сжимаются, старые уходят).
const COMBAT_LOG_MAX: usize = 60;

/// Вид подписанного броска мастера.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CombatRollKind {
    Attack,
    Damage,
    Save,
    Initiative,
    Other,
}

impl Combat {
    /// Участник по имени в любом падеже: сперва точное совпадение.
    pub fn find(&self, name: &str) -> Option<usize> {
        let key = fold(name);
        if key.is_empty() {
            return None;
        }
        self.fighters
            .iter()
            .position(|f| fold(&f.name) == key)
            .or_else(|| self.fighters.iter().position(|f| name_in_text(&f.name, name)))
            .or_else(|| self.fighters.iter().position(|f| name_in_text(name, &f.name)))
    }

    fn push_log(&mut self, line: String) {
        self.log.push(line);
        if self.log.len() > COMBAT_LOG_MAX {
            let extra = self.log.len() - COMBAT_LOG_MAX;
            self.log.drain(..extra);
        }
    }

    fn roster(&self, side: Side) -> Vec<String> {
        self.fighters.iter().filter(|f| f.side == side).map(|f| f.name.clone()).collect()
    }
}

fn fold(text: &str) -> String {
    text.trim().to_lowercase().replace('ё', "е")
}

/// «08:30» → минуты.
fn minutes(time: &str) -> Option<i64> {
    let t = time.trim();
    let digits: String = t.chars().filter(|c| c.is_ascii_digit() || *c == ':').collect();
    let (h, m) = digits.split_once(':')?;
    let (h, m) = (h.parse::<i64>().ok()?, m.parse::<i64>().ok()?);
    (h < 24 && m < 60).then_some(h * 60 + m)
}

/// Время сцены ушло вперёд больше чем на час (или сменилось словом: «утро» → «вечер»).
pub(crate) fn time_jump(before: Option<&str>, after: Option<&str>) -> bool {
    match (before, after) {
        (Some(a), Some(b)) if fold(a) != fold(b) => match (minutes(a), minutes(b)) {
            (Some(x), Some(y)) => (y - x).rem_euclid(24 * 60) > 60,
            _ => true,
        },
        _ => false,
    }
}

impl Session {
    /// Текущий бой.
    pub fn combat(&self) -> Option<&Combat> {
        self.combat.as_ref()
    }

    /// Идёт бой (в том числе черновой).
    pub fn in_combat(&self) -> bool {
        self.combat.is_some()
    }

    /// Ход — разговор вне игры: счётчик затихшего боя стоит.
    pub fn set_turn_out_of_game(&mut self, ooc: bool) {
        self.turn_out_of_game = ooc;
    }

    /// Члены отряда на месте сцены — участники боя.
    fn party_fighters(&self) -> Vec<Fighter> {
        self.party
            .iter()
            .filter(|c| c.location == self.scene.location || c.kind == CharacterKind::Player)
            .map(|c| Fighter {
                name: c.name.clone(),
                side: Side::Party,
                source: "лист".into(),
                ac: Some(c.armor_class),
                hp_max: Some(c.hit_points.max),
                party_id: c.id.clone(),
                ..Fighter::default()
            })
            .collect()
    }

    fn new_combat(&self, draft: bool) -> Combat {
        Combat {
            day: self.scene.day,
            time: self.scene.time.clone(),
            location: self.scene.location.clone(),
            fighters: self.party_fighters(),
            draft,
            ..Combat::default()
        }
    }

    fn add_to(combat: &mut Combat, f: NewFighter) -> String {
        let name = f.name.trim().to_string();
        let fighter = Fighter {
            name: name.clone(),
            side: f.side,
            role: f.role,
            source: f.source,
            ac: f.ac,
            hp_max: f.hp_max,
            surprised: f.surprised,
            hidden: f.hidden,
            notes: f.notes,
            xp: f.xp,
            ..Fighter::default()
        };
        // Участник уже есть (открыт броском инициативы) — дополняется числами.
        match combat.fighters.iter_mut().find(|x| fold(&x.name) == fold(&name)) {
            Some(old) => {
                let keep_party = old.party_id.clone();
                let damage = old.damage;
                *old = Fighter { party_id: keep_party, damage, ..fighter };
            }
            None => combat.fighters.push(fighter),
        }
        name
    }

    fn fighter_line(f: &Fighter) -> String {
        let mut line = f.name.clone();
        if !f.role.is_empty() && fold(&f.role) != fold(&f.name) {
            line.push_str(&format!(" ({})", f.role));
        }
        line
    }

    /// Начало боя командой мастера.
    pub fn start_combat(
        &mut self,
        foes: Vec<NewFighter>,
        party_surprised: bool,
        ambush: &[String],
    ) -> Result<String, EngineError> {
        let result = (|| {
            if foes.is_empty() {
                return Err(EngineError::Combat(
                    "у боя нет участников — перечисли противников в «foes»".into(),
                ));
            }
            let mut combat = match self.combat.take() {
                Some(c) if !c.draft => {
                    self.combat = Some(c);
                    return Err(EngineError::Combat(
                        "бой уже идёт — новых участников добавь {\"cmd\":\"combat\",\"add\":[…]}, \
закончить — {\"cmd\":\"combat\",\"end\":true,\"outcome\":\"…\"}"
                            .into(),
                    ));
                }
                Some(mut c) => {
                    // Черновой бой: состав отряда — по текущему месту.
                    for f in self.party_fighters() {
                        if c.find(&f.name).is_none() {
                            c.fighters.push(f);
                        }
                    }
                    c.draft = false;
                    c
                }
                None => self.new_combat(false),
            };
            for f in foes {
                Self::add_to(&mut combat, f);
            }
            for f in combat.fighters.iter_mut().filter(|f| f.side == Side::Party) {
                f.surprised |= party_surprised;
            }
            for name in ambush {
                if let Some(i) = combat.find(name) {
                    combat.fighters[i].hidden = true;
                }
            }
            let names: Vec<String> = combat.fighters.iter().map(Self::fighter_line).collect();
            let mut summary = format!("Бой начат: {}", names.join(", "));
            let surprised: Vec<&str> =
                combat.fighters.iter().filter(|f| f.surprised).map(|f| f.name.as_str()).collect();
            if !surprised.is_empty() {
                summary.push_str(&format!(
                    "; застигнуты врасплох (инициатива с помехой): {}",
                    surprised.join(", ")
                ));
            }
            let hidden: Vec<&str> =
                combat.fighters.iter().filter(|f| f.hidden).map(|f| f.name.as_str()).collect();
            if !hidden.is_empty() {
                summary.push_str(&format!(
                    "; скрыты (инициатива с преимуществом): {}",
                    hidden.join(", ")
                ));
            }
            combat.push_log(summary.clone());
            self.combat = Some(combat);
            self.scene.mood = Mood::Battle;
            self.turn_damage = true;
            self.write_combat_note(None);
            Ok(summary)
        })();
        self.logged(result, Clone::clone, || "начало боя".into())
    }

    /// Новые участники идущего боя.
    pub fn add_fighters(&mut self, foes: Vec<NewFighter>) -> Result<String, EngineError> {
        let result = (|| {
            let combat = self.combat.as_mut().ok_or_else(no_combat)?;
            let names: Vec<String> = foes.into_iter().map(|f| Self::add_to(combat, f)).collect();
            if names.is_empty() {
                return Err(EngineError::Combat("некого добавить в бой".into()));
            }
            let line = format!("В бой вступают: {}", names.join(", "));
            combat.push_log(line.clone());
            Ok(line)
        })();
        self.logged(result, Clone::clone, || "участники боя".into())
    }

    /// Состояние участника: «без сознания», «мёртв», «сбежал», «сдался», «в бою».
    pub fn set_fighter(
        &mut self,
        name: &str,
        status: FighterStatus,
    ) -> Result<String, EngineError> {
        let result = (|| {
            let combat = self.combat.as_mut().ok_or_else(no_combat)?;
            let i = combat.find(name).ok_or_else(|| {
                EngineError::Combat(format!("в бою нет участника «{}»", name.trim()))
            })?;
            combat.fighters[i].status = status;
            let line = format!("{} — {}", combat.fighters[i].name, status.label());
            combat.push_log(line.clone());
            Ok(line)
        })();
        self.logged(result, Clone::clone, || "участник боя".into())
    }

    /// Итог боя по состояниям участников.
    fn outcome_by_status(combat: &Combat) -> String {
        let foes: Vec<String> = combat
            .fighters
            .iter()
            .filter(|f| f.side == Side::Foe)
            .map(|f| format!("{} — {}", f.name, f.health_word()))
            .collect();
        if foes.is_empty() {
            "исход не указан".into()
        } else {
            foes.join(", ")
        }
    }

    /// Запись «Бой: …» в журнале мастера (новая или обновлённая).
    fn write_combat_note(&mut self, outcome: Option<&str>) {
        let Some(combat) = self.combat.as_ref() else { return };
        let title = format!("Бой: {} (День {})", combat.location, combat.day);
        let mut text = format!(
            "Отряд: {}. Противники: {}.",
            combat.roster(Side::Party).join(", "),
            combat
                .fighters
                .iter()
                .filter(|f| f.side != Side::Party)
                .map(Self::fighter_line)
                .collect::<Vec<_>>()
                .join(", ")
        );
        if !combat.log.is_empty() {
            text.push_str("\nХод боя:\n");
            text.push_str(&combat.log.join("\n"));
        }
        if let Some(o) = outcome {
            text.push_str(&format!("\nИтог: {o}"));
        }
        let note_id = combat.note_id;
        let id = match note_id.and_then(|id| self.notes.iter_mut().find(|n| n.id == id)) {
            Some(note) => {
                note.text = text;
                Some(note.id)
            }
            None => self.create_note(NewNote::new(NoteLayer::Master, &title, &text)).ok(),
        };
        if let Some(c) = self.combat.as_mut() {
            c.note_id = id;
        }
    }

    /// Конец боя: итог в журнал мастера и хронику дня, напоминание об опыте.
    /// `reason` — бой закрыл сам движок (смена места, отдых, время).
    pub fn end_combat(
        &mut self,
        outcome: &str,
        reason: Option<&str>,
    ) -> Result<String, EngineError> {
        let Some(combat) = self.combat.as_ref() else {
            let e = no_combat();
            self.log(format!("Отказ (конец боя): {e}"));
            return Err(e);
        };
        let outcome = match outcome.trim() {
            "" => Self::outcome_by_status(combat),
            o => o.to_string(),
        };
        let outcome = match reason {
            Some(r) => format!("{outcome} (бой закрыт движком: {r})"),
            None => outcome,
        };
        let foes = combat
            .fighters
            .iter()
            .filter(|f| f.side != Side::Party)
            .map(|f| f.name.clone())
            .collect::<Vec<_>>()
            .join(", ");
        let place = combat.location.clone();
        let xp: u32 = combat.fighters.iter().filter(|f| f.side == Side::Foe).map(|f| f.xp).sum();
        self.write_combat_note(Some(&outcome));
        // Хроника дня: строка о бое дописывается к пересказу (мастер потом может его переписать).
        let line = format!("Бой ({place}) с: {foes}. Итог: {outcome}.");
        let today = self.scene.day;
        let existing = self
            .notes
            .iter()
            .find(|n| n.kind == crate::knowledge::NoteKind::Day && n.day == today)
            .map(|n| n.text.clone());
        let chronicle = match existing {
            Some(t) => format!("{}\n{line}", t.trim_end()),
            None => line,
        };
        let since = self.turns_since_chronicle;
        let _ = self.write_chronicle(today, &chronicle);
        self.turns_since_chronicle = since;
        self.combat = None;
        self.initiative.clear();
        if self.scene.mood == Mood::Battle {
            self.scene.mood = Mood::Calm;
        }
        self.battle_unrewarded = true;
        self.combat_xp_hint = xp;
        let summary = format!("Бой окончен: {outcome}");
        self.log(summary.clone());
        Ok(summary)
    }

    /// Подписанный бросок мастера в бою: журнал, последняя цель, счёт урона.
    /// Возвращает строку для мастера о цели урона (хиты, «0 — реши исход»).
    pub fn note_combat_roll(
        &mut self,
        kind: CombatRollKind,
        actor: &str,
        target: &str,
        total: i64,
        line: &str,
    ) -> Option<String> {
        let combat = self.combat.as_mut()?;
        let mut report = None;
        let target = match (kind, target.trim()) {
            // Урон без цели — по последней цели атакующего.
            (CombatRollKind::Damage, "") => combat
                .links
                .iter()
                .find(|l| fold(&l.actor) == fold(actor))
                .map(|l| l.target.clone())
                .unwrap_or_default(),
            (_, t) => t.to_string(),
        };
        match kind {
            CombatRollKind::Attack if !target.is_empty() => {
                let actor_key = fold(actor);
                combat.links.retain(|l| fold(&l.actor) != actor_key);
                combat
                    .links
                    .push(TargetLink { actor: actor.trim().into(), target: target.clone() });
                combat.quiet_turns = 0;
                self.turn_damage = true;
            }
            CombatRollKind::Attack => {
                combat.quiet_turns = 0;
                self.turn_damage = true;
            }
            CombatRollKind::Damage => {
                combat.quiet_turns = 0;
                self.turn_damage = true;
                if let Some(i) = combat.find(&target) {
                    let f = &mut combat.fighters[i];
                    if f.party_id.is_empty() {
                        f.damage =
                            f.damage.saturating_add(u32::try_from(total.max(0)).unwrap_or(0));
                        report = Some(match f.hp_left() {
                            Some(left) if left <= 0 => format!(
                                "{}: урон {} из {} хитов — 0 хитов: объяви, без сознания или мёртв(а), \
и отметь {{\"cmd\":\"combat\",\"set\":{{\"name\":\"{}\",\"status\":\"down|dead\"}}}}",
                                f.name,
                                f.damage,
                                f.hp_max.unwrap_or(0),
                                f.name
                            ),
                            Some(left) => format!(
                                "{}: урон {} из {} — осталось {left} хитов ({})",
                                f.name,
                                f.damage,
                                f.hp_max.unwrap_or(0),
                                f.health_word()
                            ),
                            None => format!("{}: урон всего {}", f.name, f.damage),
                        });
                    }
                }
            }
            _ => {}
        }
        let mut entry = line.trim().to_string();
        if kind == CombatRollKind::Damage
            && !target.is_empty()
            && !fold(line).contains(&fold(&target))
        {
            entry.push_str(&format!(" → {target}"));
        }
        if !entry.is_empty() {
            combat.push_log(entry);
        }
        if let Some(r) = &report {
            combat.push_log(r.clone());
        }
        if let Some(r) = &report {
            self.combat_reports.push(r.clone());
        }
        report
    }

    /// Черновой бой: мастер бросил «инициатива: <имя>», не начав бой командой.
    pub(crate) fn ensure_draft_combat(&mut self, name: &str) {
        if self.combat.is_none() {
            let mut combat = self.new_combat(true);
            combat.push_log("Бой открыт броском инициативы (черновой: состав не указан)".into());
            self.combat = Some(combat);
            self.scene.mood = Mood::Battle;
            self.log("Бой открыт броском инициативы — ждём состав командой combat");
        }
        if let Some(combat) = self.combat.as_mut() {
            if combat.find(name).is_none() && !name.trim().is_empty() {
                combat.fighters.push(Fighter {
                    name: name.trim().into(),
                    side: Side::Foe,
                    source: "по броску инициативы".into(),
                    ..Fighter::default()
                });
            }
        }
    }

    /// Счёт затихшего боя в конце хода мастера. Бой по тишине не закрывается — только
    /// напоминание мастеру; разговор вне игры счётчик не двигает.
    pub(crate) fn tick_combat(&mut self) {
        let active = self.turn_damage;
        let ooc = std::mem::take(&mut self.turn_out_of_game);
        if let Some(c) = self.combat.as_mut() {
            if active {
                c.quiet_turns = 0;
            } else if !ooc {
                c.quiet_turns = c.quiet_turns.saturating_add(1);
            }
        }
    }

    /// Бой затих: напоминать мастеру (каждые [`COMBAT_QUIET_TURNS`] тихих ходов).
    pub fn combat_quiet_reminder(&self) -> bool {
        self.combat
            .as_ref()
            .is_some_and(|c| c.quiet_turns > 0 && c.quiet_turns % COMBAT_QUIET_TURNS == 0)
    }

    /// Бой закрывается сам при явном признаке конца: новое место, новый день, время ушло
    /// больше чем на час, отдых, мастер сменил настроение сцены.
    pub(crate) fn close_combat_if(&mut self, reason: &str) {
        if self.combat.is_some() {
            let _ = self.end_combat("", Some(reason));
        }
    }

    /// Опыт за противников закрытого боя по бестиарию (подсказка мастеру; 0 — неизвестно).
    pub fn combat_xp_hint(&self) -> u32 {
        self.combat_xp_hint
    }

    /// Строки отчёта о счёте урона за ход (для мастера) — забирает их.
    pub fn take_combat_reports(&mut self) -> Vec<String> {
        std::mem::take(&mut self.combat_reports)
    }

    /// Блок «[БОЙ]» для хода мастера.
    pub fn combat_lines(&self) -> Vec<String> {
        let Some(c) = self.combat.as_ref() else { return Vec::new() };
        let mut out = Vec::new();
        if c.draft {
            out.push(
                "Бой открыт броском инициативы без команды — укажи состав: \
{\"cmd\":\"combat\",\"start\":true,\"foes\":[{\"name\":\"…\",\"role\":\"…\",\"surprised\":true}]}"
                    .into(),
            );
        }
        for f in &c.fighters {
            let mut line = format!("- {}", Self::fighter_line(f));
            match f.side {
                Side::Party => line.push_str(" [отряд]"),
                Side::Ally => line.push_str(" [союзник]"),
                Side::Foe => {}
            }
            if let Some(ac) = f.ac {
                line.push_str(&format!(", КД {ac}"));
            }
            if f.party_id.is_empty() {
                match (f.hp_max, f.hp_left()) {
                    (Some(max), Some(left)) => {
                        line.push_str(&format!(", хиты {}/{max}", left.max(0)));
                    }
                    _ if f.damage > 0 => line.push_str(&format!(", урон {}", f.damage)),
                    _ => line.push_str(", хиты неизвестны"),
                }
                line.push_str(&format!(" — игроку: «{}»", f.health_word()));
            } else if let Some(p) = self.party.iter().find(|p| p.id == f.party_id) {
                line.push_str(&format!(", хиты {}/{}", p.hit_points.current, p.hit_points.max));
            }
            if f.status != FighterStatus::Active {
                line.push_str(&format!(" — {}", f.status.label()));
            }
            if f.surprised {
                line.push_str(" — застигнут врасплох: инициатива с помехой");
            }
            if f.hidden {
                line.push_str(" — скрыт: инициатива с преимуществом");
            }
            if !f.notes.is_empty() {
                line.push_str(&format!(". {}", f.notes));
            }
            out.push(line);
        }
        let missing: Vec<&str> = c
            .fighters
            .iter()
            .filter(|f| f.status == FighterStatus::Active && self.initiative_of(&f.name).is_none())
            .map(|f| f.name.as_str())
            .collect();
        if !missing.is_empty() {
            out.push(format!("Не бросили инициативу: {}", missing.join(", ")));
        }
        if !c.links.is_empty() {
            let links: Vec<String> =
                c.links.iter().map(|l| format!("{} → {}", l.actor, l.target)).collect();
            out.push(format!("Последние цели: {}", links.join(", ")));
        }
        let recent: Vec<&String> = c.log.iter().rev().take(6).collect();
        if !recent.is_empty() {
            out.push("Журнал боя (последнее):".into());
            for l in recent.into_iter().rev() {
                out.push(format!("  {l}"));
            }
        }
        out
    }

    /// Инициатива для сохранения.
    pub(crate) fn initiative_entries(&self) -> Vec<InitiativeEntry> {
        self.initiative
            .iter()
            .map(|(name, value)| InitiativeEntry { name: name.clone(), value: *value })
            .collect()
    }
}

fn no_combat() -> EngineError {
    EngineError::Combat(
        "боя нет — начни его {\"cmd\":\"combat\",\"start\":true,\"foes\":[…]}".into(),
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::rng::Xoshiro256;

    fn session() -> Session {
        Session::demo(Xoshiro256::from_seed(7))
    }

    fn foe(name: &str, hp: u32) -> NewFighter {
        NewFighter {
            name: name.into(),
            role: "простолюдин".into(),
            ac: Some(10),
            hp_max: Some(hp),
            surprised: true,
            ..NewFighter::default()
        }
    }

    #[test]
    fn combat_counts_damage_and_closes_with_chronicle() {
        let mut s = session();
        let msg = s.start_combat(vec![foe("Нелла", 4)], false, &[]).unwrap();
        assert!(msg.contains("застигнуты врасплох"), "{msg}");
        assert_eq!(s.scene().mood, Mood::Battle);
        s.note_combat_roll(CombatRollKind::Attack, "Никис", "Нелла", 17, "атака: Никис → Нелла");
        let r = s.note_combat_roll(CombatRollKind::Damage, "Никис", "", 12, "урон: Никис").unwrap();
        assert!(r.contains("0 хитов"), "{r}");
        assert!(s.combat_lines().iter().any(|l| l.contains("при смерти")));
        s.set_fighter("Неллу", FighterStatus::Down).unwrap();
        let end = s.end_combat("", None).unwrap();
        assert!(end.contains("без сознания"), "{end}");
        assert!(s.combat().is_none());
        assert!(s.battle_unrewarded());
        assert!(s.chronicle().iter().any(|n| n.text.contains("Нелла")));
        assert!(s.notes.iter().any(|n| n.title.starts_with("Бой:") && n.text.contains("Итог")));
    }

    #[test]
    fn quiet_combat_only_reminds_and_ooc_does_not_count() {
        let mut s = session();
        s.start_combat(vec![foe("Рабочий", 4)], false, &[]).unwrap();
        s.turn_damage = false;
        for _ in 0..2 {
            s.tick_combat();
        }
        s.set_turn_out_of_game(true);
        s.tick_combat();
        assert!(!s.combat_quiet_reminder());
        s.tick_combat();
        assert!(s.combat_quiet_reminder());
        assert!(s.in_combat());
    }

    #[test]
    fn time_jump_rules() {
        assert!(time_jump(Some("08:00"), Some("10:00")));
        assert!(!time_jump(Some("08:00"), Some("08:30")));
        assert!(time_jump(Some("утро"), Some("вечер")));
        assert!(!time_jump(None, Some("вечер")));
    }

    #[test]
    fn second_start_is_refused_and_draft_upgrades() {
        let mut s = session();
        s.ensure_draft_combat("Вышибала");
        assert!(s.combat().unwrap().draft);
        s.start_combat(vec![foe("Вышибала", 32)], false, &[]).unwrap();
        let c = s.combat().unwrap();
        assert!(!c.draft);
        assert_eq!(c.fighters.iter().filter(|f| f.name == "Вышибала").count(), 1);
        assert!(s.start_combat(vec![foe("Ещё", 4)], false, &[]).is_err());
    }
}
