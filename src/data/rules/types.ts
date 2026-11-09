// Данные правил для создания героя и повышения уровня (правила D&D 2024 года).
// Механика — по System Reference Document 5.2.1 (CC-BY-4.0); варианты Книги игрока 2024 года,
// которых нет в SRD, описаны своими словами (source: "phb").

export type AbilityId = "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma";

export type SkillId =
  | "athletics"
  | "acrobatics"
  | "sleight_of_hand"
  | "stealth"
  | "arcana"
  | "history"
  | "investigation"
  | "nature"
  | "religion"
  | "animal_handling"
  | "insight"
  | "medicine"
  | "perception"
  | "survival"
  | "deception"
  | "intimidation"
  | "performance"
  | "persuasion";

/** Откуда запись: SRD 5.2.1 или Книга игрока 2024 года (своими словами). */
export type RulesSource = "srd" | "phb";

/** Вариант выбора: стиль боя, воззвание, наследие и т. п. */
export interface Option {
  id: string;
  name: string;
  text: string;
  /** Минимальный уровень класса, с которого вариант доступен. */
  minLevel?: number;
  /** Нужен другой выбранный вариант (например, Договор Клинка). */
  requires?: string;
}

/** Выбор, который игрок делает при создании или на новом уровне. */
export interface Choice {
  id: string;
  label: string;
  kind: "skill" | "expertise" | "option" | "weapon_mastery" | "language" | "tool" | "cantrip" | "feat";
  /** Сколько выбрать. */
  count: number;
  /** Итоговое число берётся из колонки таблицы класса на текущем уровне (воззвания, мастерство оружия). */
  column?: string;
  /** Навыки или id вариантов, из которых выбирать; пусто — любые. */
  from?: string[];
  options?: Option[];
}

/** Ресурс умения: заряды на отдых. */
export interface ResourceRule {
  id: string;
  name: string;
  /** Максимум: число, колонка таблицы класса, модификатор характеристики или бонус мастерства. */
  max: { value?: number; column?: string; ability?: AbilityId; proficiency?: boolean; perLevel?: number; min?: number };
  recovery: "short" | "long" | "short_one";
}

export interface Feature {
  level: number;
  name: string;
  text: string;
  choices?: Choice[];
  resource?: ResourceRule;
}

export interface SpellcastingRule {
  ability: AbilityId;
  /** full — полный заклинатель, half — паладин и следопыт (по правилам 2024 года ячейки с 1 уровня), pact — колдун. */
  progression: "full" | "half" | "pact";
  /** known — список меняется только с уровнем; prepared — готовит после отдыха; spellbook — книга волшебника. */
  preparation: "known" | "prepared" | "spellbook";
  /** Класс в каталоге заклинаний. */
  spellClass: "bard" | "cleric" | "druid" | "paladin" | "ranger" | "sorcerer" | "warlock" | "wizard";
  /** Заговоры по уровням 1–20 (индекс 0 — 1 уровень). */
  cantrips: number[];
  /** Подготовленные заклинания по уровням 1–20. */
  prepared: number[];
}

export interface SubclassData {
  id: string;
  name: string;
  source: RulesSource;
  summary: string;
  /** Всегда подготовленные заклинания подкласса: уровень класса → id заклинаний. */
  spells?: Record<number, string[]>;
  /** Заклинания, зависящие от выбора в подклассе (местность Круга земли): id варианта → уровень → заклинания. */
  spellsByOption?: { choice: string; spells: Record<string, Record<number, string[]>> };
  features: Feature[];
}

export interface ClassData {
  id: string;
  name: string;
  source: RulesSource;
  summary: string;
  hitDie: number;
  primary: AbilityId[];
  saves: AbilityId[];
  skills: { count: number; from: SkillId[] | "any" };
  armor: string;
  /** Доспехи для расчёта КД: какие разрешены. */
  armorTraining: ("light" | "medium" | "heavy" | "shield")[];
  weapons: string;
  /** Простое оружие, воинское, воинское с фехтовальным или лёгким свойством. */
  weaponTraining: ("simple" | "martial" | "martial_finesse_light")[];
  tools?: string;
  /** Стартовое снаряжение, вариант А: предметы и золото. Вариант Б — только золото. */
  equipment: { items: string[]; gold: number; altGold: number };
  spellcasting?: SpellcastingRule;
  /** Колонки таблицы класса по уровням 1–20. */
  columns: { name: string; values: string[] }[];
  /** Уровни таланта или повышения характеристик. */
  asiLevels: number[];
  subclassLevel: number;
  features: Feature[];
  subclasses: SubclassData[];
  /** Требования для мультикласса: значение 13 в этих характеристиках (any — хотя бы в одной). */
  multiclass: { abilities: AbilityId[]; any?: boolean };
}

export interface SpeciesData {
  id: string;
  name: string;
  source: RulesSource;
  summary: string;
  size: string;
  speed: number;
  darkvision?: number;
  traits: { name: string; text: string }[];
  /** Наследие (вместо подрасы, без бонусов к характеристикам). */
  lineage?: { label: string; options: Option[]; spellAbilityChoice?: boolean };
  /** Заклинания наследия: id варианта наследия → уровень персонажа → заклинание. */
  lineageSpells?: Record<string, Record<number, string>>;
  /** Дополнительные выборы вида (навык человека, чувства эльфа). */
  choices?: Choice[];
  resources?: ResourceRule[];
  /** Сопротивления и прочее, что меняет лист (кроме выборов). */
  hpPerLevel?: number;
}

export interface BackgroundData {
  id: string;
  name: string;
  source: RulesSource;
  summary: string;
  abilities: [AbilityId, AbilityId, AbilityId];
  feat: string;
  /** Уточнение таланта: Посвящённый в магию (жрец/волшебник/друид). */
  featNote?: string;
  skills: [SkillId, SkillId];
  tool: string;
  equipment: { items: string[]; gold: number; altGold: number };
}

export interface FeatData {
  id: string;
  name: string;
  source: RulesSource;
  category: "origin" | "general" | "fighting_style" | "epic";
  prerequisite?: string;
  /** Минимальный уровень персонажа. */
  minLevel?: number;
  repeatable?: boolean;
  text: string;
  /** Повышение характеристики: какие можно поднять на 1. */
  abilityIncrease?: AbilityId[];
  choices?: Choice[];
  resource?: ResourceRule;
  /** Изменения листа, которые считает мастер создания. */
  effects?: { hpPerLevel?: number; initiativeProficiency?: boolean; speed?: number };
}

export interface WeaponData {
  id: string;
  name: string;
  category: "simple" | "martial";
  ranged: boolean;
  damage: string;
  damageType: string;
  properties: string[];
  mastery: string;
  range?: string;
}

export interface ArmorData {
  id: string;
  name: string;
  type: "light" | "medium" | "heavy" | "shield";
  ac: number;
  /** Сколько ЛОВ прибавлять: all — полностью, 2 — не больше 2, 0 — не прибавлять. */
  dex: "all" | 2 | 0;
  strength?: number;
  stealthDisadvantage?: boolean;
}
