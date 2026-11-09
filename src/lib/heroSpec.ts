// Лист героя для движка (crates/engine/src/creation.rs, HeroSpec). Имена полей — как в Rust.

import type { AbilityId, SkillId } from "../data/rules/types";

export interface SpecBonus {
  label: string;
  value: number;
}

export interface SpecSkill {
  skill: SkillId;
  proficiency: "none" | "proficient" | "expertise";
  source: string;
  bonuses: SpecBonus[];
  advantage: string[];
}

export interface SpecAttack {
  name: string;
  ability: AbilityId | null;
  caster_id: string | null;
  proficient: boolean | null;
  magic: number;
  damage_dice: string;
  damage_type: string;
  add_ability_to_damage: boolean;
  damage_bonus: number;
  extra: string;
  range: string;
  notes: string;
  save: AbilityId | null;
}

export interface SpecFeature {
  name: string;
  source: string;
  text: string;
  resource_id: string | null;
}

export interface SpecProficiency {
  kind: string;
  text: string;
  from_rules: boolean;
}

export type SpellClassId = "bard" | "cleric" | "druid" | "paladin" | "ranger" | "sorcerer" | "warlock" | "wizard";

export interface SpecCaster {
  id: string;
  label: string;
  class: SpellClassId;
  ability: AbilityId;
  level: number;
  progression: "full" | "half_2024" | "pact" | "innate";
  preparation: "known" | "prepared" | "spellbook";
  cantrips: string[];
  max_cantrips: number;
  known: string[];
  max_known: number | null;
  max_prepared: number | null;
  prepared: string[];
  always: string[];
  always_source: string;
  expanded: string[];
  expanded_source: string;
  item_bonus: number;
  item_bonus_source: string;
  attack_item_bonus: number;
  attack_item_bonus_source: string;
  dc_item_bonus: number;
  dc_item_bonus_source: string;
}

export interface SpecGranted {
  spell_id: string;
  source: string;
  resource_id: string | null;
  cast_level: number;
  caster_id: string | null;
  slots_allowed: boolean;
}

export interface HeroSpec {
  id: string;
  kind: "player" | "companion";
  name: string;
  title: string;
  species: string;
  background: string;
  alignment: string;
  appearance: string;
  portrait: string;
  classes: { id: string; name: string; subclass: string | null; level: number; hit_die: number }[];
  abilities: Record<AbilityId, number>;
  hp: { rolls: number[]; per_level: number; flat: number };
  armor_class: number;
  armor_class_breakdown: SpecBonus[];
  speed_ft: number;
  xp: number;
  save_proficiencies: AbilityId[];
  skills: SpecSkill[];
  initiative_bonuses: SpecBonus[];
  attacks: SpecAttack[];
  features: SpecFeature[];
  proficiencies: SpecProficiency[];
  resources: { id: string; name: string; max: number; recovery: "short_rest" | "long_rest" | "one_on_short_rest" }[];
  casters: SpecCaster[];
  granted: SpecGranted[];
  items: { name: string; quantity: number; category: string; notes: string }[];
  /** Прибавки ко всем спасброскам (Плащ защиты). */
  save_bonuses: SpecBonus[];
  /** Предметы, требующие настройки. */
  attunement: { name: string; effect: string }[];
  notes: string[];
}

/** Новая кампания для движка. */
export interface CampaignSpec {
  id: string;
  title: string;
  heroes: HeroSpec[];
}
