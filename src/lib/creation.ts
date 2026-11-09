// Мастер создания героя (правила 2024 года): черновик, выборы по шагам, итоговый лист.
//
// Черновик хранит только решения игрока. Всё остальное — доступные варианты, бонусы, хиты,
// ресурсы, лист для движка — вычисляется из черновика и данных правил, поэтому возврат к
// любому шагу безопасен: выборы, которые стали недоступны, просто не попадают в лист и
// подсвечиваются как незаполненные.

import { BACKGROUND_BY_ID, TOOL_CHOICE } from "../data/rules/backgrounds.ts";
import { CLASS_BY_ID, CLASSES } from "../data/rules/classes/index.ts";
import {
  ABILITIES,
  ABILITY_SHORT,
  ARMOR_BY_NAME,
  ARTISAN_TOOLS,
  GAMING_SETS,
  MASTERY,
  modifier,
  MUSICAL_INSTRUMENTS,
  POINT_BUY_COST,
  POINT_BUY_TOTAL,
  proficiencyBonus,
  RARE_LANGUAGES,
  SKILL_NAME,
  SKILLS,
  STANDARD_LANGUAGES,
  WEAPONS,
  XP_THRESHOLDS,
} from "../data/rules/common.ts";
import { FEAT_BY_ID, FEATS } from "../data/rules/feats.ts";
import { SPECIES_BY_ID } from "../data/rules/species.ts";
import type {
  AbilityId,
  Choice,
  ClassData,
  FeatData,
  Feature,
  ResourceRule,
  SkillId,
  SpeciesData,
  SubclassData,
  WeaponData,
} from "../data/rules/types";
import { SPELL_BY_ID, SPELLS, type SpellData } from "../data/spells/index.ts";
import type { HeroSpec, SpecCaster, SpecFeature, SpecGranted, SpecSkill, SpellClassId } from "./heroSpec";

// ───────────────────────────── черновик ─────────────────────────────

export const STEPS = [
  { id: "species", title: "Вид" },
  { id: "background", title: "Предыстория" },
  { id: "class", title: "Класс" },
  { id: "feats", title: "Таланты" },
  { id: "spells", title: "Заклинания" },
  { id: "abilities", title: "Характеристики" },
  { id: "details", title: "Личность" },
  { id: "sheet", title: "Лист героя" },
] as const;
export type StepId = (typeof STEPS)[number]["id"];

/** Ступени начала игры: уровни и день кампании, в который появляется герой. */
export const TIERS = [
  { id: 1, label: "Уровни 1–3", levels: [1, 2, 3], days: [20, 50] as [number, number] | null },
  { id: 2, label: "Уровни 4–6", levels: [4, 5, 6], days: [50, 70] as [number, number] | null },
  { id: 3, label: "Уровни 7–9", levels: [7, 8, 9], days: null },
] as const;

/** День «актуального времени» для ступени 7–9. */
export const CURRENT_DAY = 87;

/** Пол героя (для портрета). */
export type Gender = "m" | "f";

/** Ключ портрета: `elf-f`. */
export function portraitKey(species: string, gender: Gender): string {
  return `${species}-${gender}`;
}

export type AbilityMethod = "point" | "roll";
export type HpMode = "average" | "roll" | "manual";

export interface Draft {
  version: 1;
  tier: 1 | 2 | 3;
  level: number;
  speciesId: string | null;
  backgroundId: string | null;
  classId: string | null;
  /** Все выборы по ключам (навыки, варианты, таланты, заклинания). */
  picks: Record<string, string[]>;
  abilityMethod: AbilityMethod;
  base: Record<AbilityId, number>;
  /** Результаты бросков 4d6 (метод «бросок»), ещё не расставленные. */
  rolled: number[];
  hpMode: HpMode;
  /** Значения костей хитов после 1 уровня (бросок или ручной ввод). */
  hpRolls: number[];
  name: string;
  gender: Gender;
  alignment: string;
  appearance: string;
}

const EIGHTS: Record<AbilityId, number> = {
  strength: 8,
  dexterity: 8,
  constitution: 8,
  intelligence: 8,
  wisdom: 8,
  charisma: 8,
};

export function newDraft(): Draft {
  return {
    version: 1,
    tier: 1,
    level: 1,
    speciesId: null,
    backgroundId: null,
    classId: null,
    picks: {},
    abilityMethod: "point",
    base: { ...EIGHTS },
    rolled: [],
    hpMode: "average",
    hpRolls: [],
    name: "",
    gender: "m",
    alignment: "",
    appearance: "",
  };
}

export const pick = (d: Draft, key: string): string[] => d.picks[key] ?? [];
const one = (d: Draft, key: string): string | undefined => pick(d, key)[0];

// ───────────────────────────── основа ─────────────────────────────

export interface Resolved {
  level: number;
  pb: number;
  species: SpeciesData | null;
  lineageId: string | undefined;
  cls: ClassData | null;
  subclass: SubclassData | null;
  bgName: string;
}

export function resolve(d: Draft): Resolved {
  const species = d.speciesId ? (SPECIES_BY_ID.get(d.speciesId) ?? null) : null;
  const cls = d.classId ? (CLASS_BY_ID.get(d.classId) ?? null) : null;
  const subId = one(d, "class.subclass");
  const subclass = cls && d.level >= cls.subclassLevel ? (cls.subclasses.find((s) => s.id === subId) ?? null) : null;
  const bg = d.backgroundId ? BACKGROUND_BY_ID.get(d.backgroundId) : undefined;
  return {
    level: d.level,
    pb: proficiencyBonus(d.level),
    species,
    lineageId: one(d, "species.lineage"),
    cls,
    subclass,
    bgName: bg?.name ?? "",
  };
}

/** Значение колонки таблицы класса на уровне: число или `null`. */
export function columnValue(cls: ClassData, column: string, level: number): string | null {
  const col = cls.columns.find((c) => c.name === column);
  const v = col?.values[level - 1];
  return v && v !== "—" ? v : null;
}

function columnNumber(cls: ClassData, column: string, level: number): number {
  const v = columnValue(cls, column, level);
  const n = v ? parseInt(v.replace(/[^\d-]/g, ""), 10) : 0;
  return Number.isFinite(n) ? n : 0;
}

// ───────────────────────────── таланты ─────────────────────────────

/** Слот таланта: стартовый (предыстория, человек) или на уровне класса. */
export interface FeatSlot {
  key: string;
  label: string;
  categories: FeatData["category"][];
  fixed?: string;
  level?: number;
}

export function featSlots(d: Draft): FeatSlot[] {
  const r = resolve(d);
  const slots: FeatSlot[] = [];
  const bg = d.backgroundId ? BACKGROUND_BY_ID.get(d.backgroundId) : undefined;
  if (bg) slots.push({ key: "bg.feat", label: `Стартовый талант (${bg.name})`, categories: ["origin"], fixed: bg.feat });
  if (r.species?.id === "human") slots.push({ key: "species.feat", label: "Разносторонность (человек)", categories: ["origin"] });
  if (r.cls) {
    const all = [...r.cls.features, ...(r.subclass?.features ?? [])].filter((f) => f.level <= r.level);
    for (const f of all) {
      for (const c of f.choices ?? []) {
        if (c.kind !== "feat") continue;
        const categories = (c.from ?? ["general"]) as FeatData["category"][];
        slots.push({ key: c.id, label: categories.includes("fighting_style") ? f.name : `${f.name} (${f.level} ур.)`, categories, level: f.level });
      }
    }
  }
  return slots;
}

/** Выбранный талант в слоте. */
export function slotFeat(d: Draft, slot: FeatSlot): FeatData | undefined {
  const id = slot.fixed ?? one(d, slot.key);
  return id ? FEAT_BY_ID.get(id) : undefined;
}

/** Таланты, которые можно взять в слот. */
export function featOptions(d: Draft, slot: FeatSlot): FeatData[] {
  const taken = new Set(
    featSlots(d)
      .filter((s) => s.key !== slot.key)
      .map((s) => slotFeat(d, s)?.id)
      .filter(Boolean),
  );
  return FEATS.filter((f) => {
    if (!slot.categories.includes(f.category)) return false;
    if (f.minLevel && d.level < f.minLevel) return false;
    if (f.id === "blessed_warrior" && d.classId !== "paladin") return false;
    if (f.id === "druidic_warrior" && d.classId !== "ranger") return false;
    if (taken.has(f.id) && !f.repeatable) return false;
    return true;
  });
}

/** Списки, по которым видна Посвящённость в магию в слоте. */
function magicInitiateList(d: Draft, slot: FeatSlot): string | undefined {
  const bg = d.backgroundId ? BACKGROUND_BY_ID.get(d.backgroundId) : undefined;
  if (slot.key === "bg.feat" && bg?.featNote) return bg.featNote;
  return one(d, `${slot.key}:magic_initiate.list`);
}

// ───────────────────────────── характеристики ─────────────────────────────

export function pointsSpent(base: Record<AbilityId, number>): number {
  return ABILITIES.reduce((sum, a) => sum + (POINT_BUY_COST[base[a.id]] ?? 99), 0);
}

/** Бросок 4d6 с отбрасыванием меньшего. */
export function roll4d6(random: () => number = Math.random): number {
  const dice = Array.from({ length: 4 }, () => 1 + Math.floor(random() * 6)).sort((a, b) => a - b);
  return (dice[1] ?? 0) + (dice[2] ?? 0) + (dice[3] ?? 0);
}

/** Прибавки к характеристикам: предыстория и таланты. */
export function abilityBonuses(d: Draft): { ability: AbilityId; value: number; source: string }[] {
  const out: { ability: AbilityId; value: number; source: string }[] = [];
  const bg = d.backgroundId ? BACKGROUND_BY_ID.get(d.backgroundId) : undefined;
  if (bg) {
    if (one(d, "bg.mode") === "1-1-1") {
      for (const a of bg.abilities) out.push({ ability: a, value: 1, source: bg.name });
    } else {
      const p2 = one(d, "bg.plus2") as AbilityId | undefined;
      const p1 = one(d, "bg.plus1") as AbilityId | undefined;
      if (p2 && bg.abilities.includes(p2)) out.push({ ability: p2, value: 2, source: bg.name });
      if (p1 && p1 !== p2 && bg.abilities.includes(p1)) out.push({ ability: p1, value: 1, source: bg.name });
    }
  }
  for (const slot of featSlots(d)) {
    const feat = slotFeat(d, slot);
    if (!feat?.abilityIncrease) continue;
    const chosen = pick(d, `${slot.key}:abilities`) as AbilityId[];
    if (feat.id === "ability_score_improvement") {
      for (const a of chosen.slice(0, 2)) out.push({ ability: a, value: 1, source: feat.name });
    } else {
      const a = chosen[0] ?? (feat.abilityIncrease.length === 1 ? feat.abilityIncrease[0] : undefined);
      if (a && feat.abilityIncrease.includes(a)) out.push({ ability: a, value: 1, source: feat.name });
    }
  }
  return out;
}

export function finalAbilities(d: Draft): Record<AbilityId, number> {
  const scores = { ...d.base };
  for (const b of abilityBonuses(d)) scores[b.ability] = Math.min(20, scores[b.ability] + b.value);
  return scores;
}

// ───────────────────────────── выборы ─────────────────────────────

export interface ChoiceOption {
  id: string;
  name: string;
  text?: string;
}

/** Выбор, который нужно сделать на шаге. */
export interface ChoiceSlot {
  key: string;
  label: string;
  source: string;
  count: number;
  options: ChoiceOption[];
  step: StepId;
}

const skillOptions = (from?: SkillId[] | string[]): ChoiceOption[] =>
  SKILLS.filter((s) => !from || from.length === 0 || (from as string[]).includes(s.id)).map((s) => ({ id: s.id, name: s.name }));

function toolOptions(from?: string[]): ChoiceOption[] {
  const lists: Record<string, string[]> = { artisan: ARTISAN_TOOLS, instrument: MUSICAL_INSTRUMENTS, gaming: GAMING_SETS };
  const names = (from ?? ["artisan", "instrument", "gaming"]).flatMap((k) => lists[k] ?? []);
  return names.map((n) => ({ id: n, name: n }));
}

function weaponOptions(cls: ClassData): ChoiceOption[] {
  return WEAPONS.filter((w) => canUseWeapon(cls, w)).map((w) => ({
    id: w.id,
    name: w.name,
    text: `${MASTERY[w.mastery]?.name ?? w.mastery}: ${MASTERY[w.mastery]?.text ?? ""}`,
  }));
}

function canUseWeapon(cls: ClassData, w: WeaponData): boolean {
  if (cls.weaponTraining.includes("martial")) return true;
  if (w.category === "simple") return cls.weaponTraining.includes("simple");
  if (cls.weaponTraining.includes("martial_finesse_light")) {
    return w.properties.includes("фехтовальное") || w.properties.includes("лёгкое");
  }
  return false;
}

/** Выборы из правил (вид, предыстория, класс, таланты) без заклинаний. */
function ruleChoice(d: Draft, c: Choice, key: string, source: string, step: StepId): ChoiceSlot {
  const r = resolve(d);
  let count = c.count;
  if (c.column && r.cls) count = columnNumber(r.cls, c.column, d.level);
  let options: ChoiceOption[] = [];
  switch (c.kind) {
    case "skill":
      options = skillOptions(c.from);
      break;
    case "expertise":
      options = skillOptions(c.from);
      break;
    case "tool":
      options = toolOptions(c.from);
      break;
    case "language":
      options = [...STANDARD_LANGUAGES, ...RARE_LANGUAGES].map((n) => ({ id: n, name: n }));
      break;
    case "weapon_mastery":
      options = r.cls ? weaponOptions(r.cls) : [];
      break;
    case "option":
      options = (c.options ?? [])
        .filter((o) => !o.minLevel || d.level >= o.minLevel)
        .map((o) => ({ id: o.id, name: o.name, text: o.text }));
      break;
    default:
      break;
  }
  return { key, label: c.label, source, count, options, step };
}

/** Все выборы черновика, кроме заклинаний и ячеек талантов. */
export function choiceSlots(d: Draft): ChoiceSlot[] {
  const r = resolve(d);
  const out: ChoiceSlot[] = [];
  if (r.species) {
    for (const c of r.species.choices ?? []) out.push(ruleChoice(d, c, c.id, r.species.name, "species"));
  }
  if (r.cls) {
    out.push({
      key: "class.skills",
      label: "Навыки класса",
      source: r.cls.name,
      count: r.cls.skills.count,
      options: skillOptions(r.cls.skills.from === "any" ? undefined : r.cls.skills.from),
      step: "class",
    });
    const features = [...r.cls.features, ...(r.subclass?.features ?? [])].filter((f) => f.level <= d.level);
    for (const f of features) {
      for (const c of f.choices ?? []) {
        if (c.kind === "feat") continue;
        out.push(ruleChoice(d, c, c.id, `${f.name} (${f.level} ур.)`, "class"));
      }
    }
  }
  for (const slot of featSlots(d)) {
    const feat = slotFeat(d, slot);
    if (!feat) continue;
    for (const c of feat.choices ?? []) {
      if (feat.id === "magic_initiate" && slot.key === "bg.feat" && magicInitiateList(d, slot)) continue;
      out.push(ruleChoice(d, c, `${slot.key}:${c.id}`, feat.name, slot.key.startsWith("bg.") ? "background" : "feats"));
    }
  }
  out.push({
    key: "lang.choice",
    label: "Языки (кроме Общего)",
    source: "Происхождение",
    count: 2,
    options: STANDARD_LANGUAGES.map((n) => ({ id: n, name: n })),
    step: "details",
  });
  // Экспертиза — только в навыках, которыми герой уже владеет.
  const proficient = new Set(skillProficiencies(d, false).map((s) => s.skill));
  for (const slot of out) {
    if (slot.key.includes("expertise") || slot.key === "wizard.scholar") {
      slot.options = slot.options.filter((o) => proficient.has(o.id as SkillId));
    }
  }
  return out;
}

// ───────────────────────────── заклинания ─────────────────────────────

export interface SpellSlotChoice {
  key: string;
  label: string;
  count: number;
  options: SpellData[];
}

/** Наибольший круг заклинаний класса на уровне. */
export function maxSpellLevel(cls: ClassData, level: number): number {
  const sc = cls.spellcasting;
  if (!sc) return 0;
  if (sc.progression === "full") return Math.min(9, Math.ceil(level / 2));
  if (sc.progression === "half") return Math.min(5, Math.ceil(level / 4));
  return Math.min(5, Math.ceil(level / 2));
}

const onList = (s: SpellData, list: string) => s.classes.includes(list);

export function spellChoices(d: Draft): SpellSlotChoice[] {
  const r = resolve(d);
  const out: SpellSlotChoice[] = [];
  const sc = r.cls?.spellcasting;
  if (r.cls && sc) {
    const maxLevel = maxSpellLevel(r.cls, d.level);
    let cantrips = sc.cantrips[d.level - 1] ?? 0;
    const order = one(d, "cleric.order") ?? one(d, "druid.order");
    if (order === "thaumaturge" || order === "magician") cantrips += 1;
    const lists = [sc.spellClass];
    if (r.cls.id === "bard" && d.level >= 10) lists.push("cleric", "druid", "wizard");
    if (cantrips > 0) {
      out.push({
        key: "spells.cantrips",
        label: "Заговоры",
        count: cantrips,
        options: SPELLS.filter((s) => s.level === 0 && onList(s, sc.spellClass)),
      });
    }
    const leveled = SPELLS.filter((s) => s.level >= 1 && s.level <= maxLevel && lists.some((l) => onList(s, l)));
    const count = sc.prepared[d.level - 1] ?? 0;
    if (sc.preparation === "spellbook") {
      const book = columnNumber(r.cls, "Заклинаний в книге", d.level);
      out.push({ key: "spells.book", label: "Книга заклинаний", count: book, options: leveled });
      const inBook = new Set(pick(d, "spells.book"));
      out.push({
        key: "spells.list",
        label: "Подготовленные заклинания",
        count,
        options: leveled.filter((s) => inBook.has(s.id)),
      });
    } else {
      out.push({
        key: "spells.list",
        label: sc.preparation === "known" ? "Известные заклинания" : "Подготовленные заклинания",
        count,
        options: leveled,
      });
    }
    if (r.cls.id === "warlock") {
      for (const [lvl, circle] of [
        [11, 6],
        [13, 7],
        [15, 8],
      ] as const) {
        if (d.level < lvl) continue;
        out.push({
          key: `spells.arcanum.${circle}`,
          label: `Таинственный арканум (${circle} круг)`,
          count: 1,
          options: SPELLS.filter((s) => s.level === circle && onList(s, "warlock")),
        });
      }
    }
    if (r.subclass?.id === "lore" && d.level >= 6) {
      out.push({
        key: "spells.lore",
        label: "Магические открытия",
        count: 2,
        options: SPELLS.filter(
          (s) => s.level <= maxLevel && ["cleric", "druid", "wizard"].some((l) => onList(s, l)),
        ),
      });
    }
  }
  for (const slot of featSlots(d)) {
    const feat = slotFeat(d, slot);
    if (!feat) continue;
    if (feat.id === "magic_initiate") {
      const list = magicInitiateList(d, slot);
      if (!list) continue;
      out.push({
        key: `${slot.key}:mi.cantrips`,
        label: `${feat.name}: заговоры`,
        count: 2,
        options: SPELLS.filter((s) => s.level === 0 && onList(s, list)),
      });
      out.push({
        key: `${slot.key}:mi.spell`,
        label: `${feat.name}: заклинание 1 круга`,
        count: 1,
        options: SPELLS.filter((s) => s.level === 1 && onList(s, list)),
      });
    }
    const touched: Record<string, string[]> = {
      fey_touched: ["Прорицание", "Очарование"],
      shadow_touched: ["Иллюзия", "Некромантия"],
    };
    const schools = touched[feat.id];
    if (schools) {
      out.push({
        key: `${slot.key}:touched.spell`,
        label: `${feat.name}: заклинание 1 круга`,
        count: 1,
        options: SPELLS.filter((s) => s.level === 1 && schools.includes(s.school)),
      });
    }
  }
  return out;
}

// ───────────────────────────── владения ─────────────────────────────

/** Навыки героя; `withExpertise = false` — без экспертизы (для выбора экспертизы). */
export function skillProficiencies(d: Draft, withExpertise = true): SpecSkill[] {
  const r = resolve(d);
  const map = new Map<SkillId, SpecSkill>();
  const add = (skill: string, source: string) => {
    if (!SKILL_NAME[skill as SkillId] || map.has(skill as SkillId)) return;
    map.set(skill as SkillId, { skill: skill as SkillId, proficiency: "proficient", source, bonuses: [], advantage: [] });
  };
  const bg = d.backgroundId ? BACKGROUND_BY_ID.get(d.backgroundId) : undefined;
  if (bg) for (const s of bg.skills) add(s, bg.name);
  if (r.species) for (const c of r.species.choices ?? []) for (const s of pick(d, c.id)) add(s, r.species.name);
  if (r.cls) {
    for (const s of pick(d, "class.skills")) add(s, r.cls.name);
    for (const f of [...r.cls.features, ...(r.subclass?.features ?? [])]) {
      if (f.level > d.level) continue;
      for (const c of f.choices ?? []) if (c.kind === "skill") for (const s of pick(d, c.id)) add(s, f.name);
    }
  }
  for (const slot of featSlots(d)) {
    const feat = slotFeat(d, slot);
    for (const c of feat?.choices ?? []) {
      if (c.kind === "skill") for (const s of pick(d, `${slot.key}:${c.id}`)) add(s, feat!.name);
    }
  }
  if (withExpertise && r.cls) {
    for (const f of r.cls.features) {
      if (f.level > d.level) continue;
      for (const c of f.choices ?? []) {
        if (c.kind !== "expertise") continue;
        for (const s of pick(d, c.id)) {
          const e = map.get(s as SkillId);
          if (e) e.proficiency = "expertise";
        }
      }
    }
  }
  return [...map.values()];
}

/** Языки героя. */
export function languages(d: Draft): string[] {
  const r = resolve(d);
  const set = new Set<string>(["Общий", ...pick(d, "lang.choice")]);
  if (r.cls?.id === "rogue") {
    set.add("Воровской жаргон");
    for (const l of pick(d, "rogue.language")) set.add(l);
  }
  if (r.cls?.id === "druid") set.add("Друидский");
  if (r.cls?.id === "ranger" && d.level >= 2) for (const l of pick(d, "ranger.languages")) set.add(l);
  return [...set];
}

function tools(d: Draft): string[] {
  const r = resolve(d);
  const set = new Set<string>();
  const bg = d.backgroundId ? BACKGROUND_BY_ID.get(d.backgroundId) : undefined;
  if (bg) set.add(TOOL_CHOICE[bg.tool] ? (one(d, "bg.tool") ?? "") : bg.tool);
  if (r.cls?.id === "rogue") set.add("Воровские инструменты");
  if (r.cls?.id === "druid") set.add("Набор травника");
  for (const t of pick(d, "monk.tool")) set.add(t);
  for (const t of pick(d, "bard.instruments")) set.add(t);
  for (const slot of featSlots(d)) {
    const feat = slotFeat(d, slot);
    for (const c of feat?.choices ?? []) if (c.kind === "tool") for (const t of pick(d, `${slot.key}:${c.id}`)) set.add(t);
  }
  set.delete("");
  return [...set];
}

// ───────────────────────────── снаряжение ─────────────────────────────

const AMMO = /стрел|болт|игл|снаряд/;
const ALIASES: [RegExp, string][] = [
  [/ручн\S* топор/, "handaxe"],
  [/метательн\S* копь/, "javelin"],
  [/кинжал/, "dagger"],
  [/^копь/, "spear"],
];

/** «4 ручных топора» → количество и оружие (если это оружие). */
export function parseItem(text: string): { name: string; quantity: number; weapon?: WeaponData } {
  const m = /^(\d+)\s+(.+)$/.exec(text.trim());
  const quantity = m?.[1] ? parseInt(m[1], 10) : 1;
  const name = m?.[2] ?? text.trim();
  const lower = name.toLowerCase();
  let weapon = WEAPONS.find((w) => w.name.toLowerCase() === lower);
  if (!weapon && !AMMO.test(lower)) {
    const alias = ALIASES.find(([re]) => re.test(lower));
    if (alias) weapon = WEAPONS.find((w) => w.id === alias[1]);
  }
  return { name, quantity, weapon };
}

export function equipment(d: Draft): { items: string[]; gold: number } {
  const r = resolve(d);
  const bg = d.backgroundId ? BACKGROUND_BY_ID.get(d.backgroundId) : undefined;
  const items: string[] = [];
  let gold = 0;
  if (r.cls) {
    if (one(d, "equip.class") === "gold") gold += r.cls.equipment.altGold;
    else {
      items.push(...r.cls.equipment.items);
      gold += r.cls.equipment.gold;
    }
  }
  if (bg) {
    if (one(d, "equip.bg") === "gold") gold += bg.equipment.altGold;
    else {
      items.push(...bg.equipment.items.map((i) => (i === "Инструменты ремесленника" || i === "Музыкальный инструмент" || i === "Игровой набор" ? (one(d, "bg.tool") ?? i) : i)));
      gold += bg.equipment.gold;
    }
  }
  return { items, gold };
}

// ───────────────────────────── итоговые числа ─────────────────────────────

export function averageHitDie(die: number): number {
  return die / 2 + 1;
}

export function hpValues(d: Draft): number[] {
  const r = resolve(d);
  const die = r.cls?.hitDie ?? 8;
  return Array.from({ length: Math.max(0, d.level - 1) }, (_, i) =>
    d.hpMode === "average" ? averageHitDie(die) : Math.min(die, Math.max(1, d.hpRolls[i] ?? averageHitDie(die))),
  );
}

export function hpPerLevelBonus(d: Draft): number {
  const r = resolve(d);
  let bonus = r.species?.hpPerLevel ?? 0;
  for (const slot of featSlots(d)) bonus += slotFeat(d, slot)?.effects?.hpPerLevel ?? 0;
  if (r.subclass?.id === "draconic") bonus += 1;
  return bonus;
}

export function maxHp(d: Draft): number {
  const r = resolve(d);
  const con = modifier(finalAbilities(d).constitution);
  const die = r.cls?.hitDie ?? 8;
  let total = Math.max(1, die + con);
  for (const v of hpValues(d)) total += Math.max(1, v + con);
  return total + hpPerLevelBonus(d) * d.level;
}

export function armorClass(d: Draft): { total: number; parts: { label: string; value: number }[] } {
  const r = resolve(d);
  const ab = finalAbilities(d);
  const dex = modifier(ab.dexterity);
  const { items } = equipment(d);
  const worn = items.map((i) => ARMOR_BY_NAME.get(i)).filter((a) => a && a.type !== "shield");
  const armor = worn.sort((a, b) => b!.ac - a!.ac)[0];
  const trained = (t: string) => r.cls?.armorTraining.includes(t as never) ?? false;
  const shield = items.includes("Щит") && trained("shield") && r.cls?.id !== "monk";
  let parts: { label: string; value: number }[];
  if (armor && trained(armor.type)) {
    const dexPart = armor.dex === "all" ? dex : armor.dex === 2 ? Math.min(2, dex) : 0;
    parts = [{ label: armor.name, value: armor.ac }];
    if (dexPart) parts.push({ label: "ЛОВ", value: dexPart });
    const style = slotFeat(d, { key: "fighter.style", label: "", categories: ["fighting_style"] });
    const styles = featSlots(d).map((s) => slotFeat(d, s)?.id);
    if (styles.includes("defense") || style?.id === "defense") parts.push({ label: "Оборона", value: 1 });
  } else {
    parts = [{ label: "Без доспеха", value: 10 }];
    if (dex) parts.push({ label: "ЛОВ", value: dex });
    if (r.cls?.id === "barbarian") parts.push({ label: "ТЕЛ", value: modifier(ab.constitution) });
    if (r.cls?.id === "monk" && !items.includes("Щит")) parts.push({ label: "МДР", value: modifier(ab.wisdom) });
    if (r.subclass?.id === "draconic") parts.push({ label: "ХАР", value: modifier(ab.charisma) });
  }
  if (shield) parts.push({ label: "Щит", value: 2 });
  parts = parts.filter((p) => p.value !== 0 || p.label === "Без доспеха");
  return { total: parts.reduce((s, p) => s + p.value, 0), parts };
}

export function speed(d: Draft): number {
  const r = resolve(d);
  let s = r.species?.speed ?? 30;
  if (r.species?.id === "elf" && r.lineageId === "wood") s = 35;
  if (r.cls?.id === "barbarian" && d.level >= 5) s += 10;
  if (r.cls?.id === "monk") s += columnNumber(r.cls, "Движение без доспехов", d.level);
  if (r.cls?.id === "ranger" && d.level >= 6) s += 10;
  for (const slot of featSlots(d)) s += slotFeat(d, slot)?.effects?.speed ?? 0;
  return s;
}

// ───────────────────────────── проверка шагов ─────────────────────────────

function countIssue(label: string, have: number, need: number): string | null {
  if (need <= 0) return null;
  if (have < need) return `${label}: выбрано ${have} из ${need}`;
  if (have > need) return `${label}: выбрано ${have}, нужно ${need}`;
  return null;
}

/** Что ещё не заполнено на шаге. Пустой список — шаг готов. */
export function stepIssues(d: Draft, step: StepId): string[] {
  const r = resolve(d);
  const issues: (string | null)[] = [];
  const slotIssues = (s: StepId) => {
    for (const c of choiceSlots(d).filter((x) => x.step === s)) {
      const need = Math.min(c.count, c.options.length);
      issues.push(countIssue(`${c.label} (${c.source})`, pick(d, c.key).length, need));
    }
  };
  switch (step) {
    case "species":
      if (!r.species) issues.push("Выберите вид");
      if (r.species?.lineage && !r.lineageId) issues.push(`Выберите: ${r.species.lineage.label}`);
      if (r.species?.lineage?.spellAbilityChoice && !one(d, "species.ability"))
        issues.push("Выберите заклинательную характеристику наследия");
      slotIssues("species");
      break;
    case "background": {
      const bg = d.backgroundId ? BACKGROUND_BY_ID.get(d.backgroundId) : undefined;
      if (!bg) {
        issues.push("Выберите предысторию");
        break;
      }
      if (one(d, "bg.mode") !== "1-1-1") {
        const p2 = one(d, "bg.plus2");
        const p1 = one(d, "bg.plus1");
        if (!p2 || !p1) issues.push("Распределите +2 и +1");
        else if (p1 === p2) issues.push("+2 и +1 — к разным характеристикам");
      }
      const toolLabel = TOOL_CHOICE[bg.tool];
      if (toolLabel && !one(d, "bg.tool")) issues.push(toolLabel);
      slotIssues("background");
      break;
    }
    case "class":
      if (!r.cls) {
        issues.push("Выберите класс");
        break;
      }
      if (d.level >= r.cls.subclassLevel && !r.subclass) issues.push("Выберите подкласс");
      slotIssues("class");
      break;
    case "feats":
      for (const slot of featSlots(d)) {
        if (slot.fixed) continue;
        const feat = slotFeat(d, slot);
        if (!feat) {
          issues.push(`${slot.label}: выберите талант`);
          continue;
        }
        if (feat.abilityIncrease && !(feat.abilityIncrease.length === 1)) {
          const need = feat.id === "ability_score_improvement" ? 2 : 1;
          issues.push(countIssue(`${feat.name}: характеристики`, pick(d, `${slot.key}:abilities`).length, need));
        }
      }
      slotIssues("feats");
      break;
    case "spells":
      for (const c of spellChoices(d)) {
        issues.push(countIssue(c.label, pick(d, c.key).length, Math.min(c.count, c.options.length)));
      }
      for (const slot of featSlots(d)) {
        const feat = slotFeat(d, slot);
        const needsAbility = feat && ["magic_initiate"].includes(feat.id);
        if (needsAbility && !one(d, `${slot.key}:mi.ability`)) issues.push(`${feat!.name}: выберите характеристику`);
      }
      break;
    case "abilities":
      if (d.abilityMethod === "point") {
        const spent = pointsSpent(d.base);
        if (spent > POINT_BUY_TOTAL) issues.push(`Потрачено ${spent} очков из ${POINT_BUY_TOTAL}`);
        if (ABILITIES.some((a) => d.base[a.id] < 8 || d.base[a.id] > 15)) issues.push("При покупке значения — от 8 до 15");
      } else if (ABILITIES.some((a) => d.base[a.id] < 3 || d.base[a.id] > 18)) {
        issues.push("Распределите выпавшие значения по всем характеристикам");
      }
      break;
    case "details":
      if (!d.name.trim()) issues.push("Введите имя");
      if (!d.alignment) issues.push("Выберите мировоззрение");
      if (d.hpMode !== "average" && d.hpRolls.length < d.level - 1) issues.push("Задайте хиты за каждый уровень");
      slotIssues("details");
      break;
    case "sheet":
      for (const s of STEPS) if (s.id !== "sheet") issues.push(...stepIssues(d, s.id).map((x) => `${s.title}: ${x}`));
      break;
  }
  return issues.filter((x): x is string => Boolean(x));
}

// ───────────────────────────── лист для движка ─────────────────────────────

function resourceMax(rule: ResourceRule, d: Draft, cls: ClassData | null): number {
  const m = rule.max;
  let v = 0;
  if (m.value !== undefined) v = m.value;
  else if (m.column && cls) v = columnNumber(cls, m.column, d.level);
  else if (m.ability) v = modifier(finalAbilities(d)[m.ability]);
  else if (m.proficiency) v = proficiencyBonus(d.level);
  else if (m.perLevel) v = m.perLevel * d.level;
  return Math.max(v, m.min ?? 0);
}

const RECOVERY = { short: "short_rest", long: "long_rest", short_one: "one_on_short_rest" } as const;

const SPELL_CLASS_BY_ABILITY: Record<AbilityId, SpellClassId> = {
  strength: "wizard",
  dexterity: "wizard",
  constitution: "wizard",
  intelligence: "wizard",
  wisdom: "druid",
  charisma: "sorcerer",
};

function caster(partial: Partial<SpecCaster> & Pick<SpecCaster, "id" | "label" | "class" | "ability" | "level" | "progression" | "preparation">): SpecCaster {
  return {
    cantrips: [],
    max_cantrips: 0,
    known: [],
    max_known: null,
    max_prepared: null,
    prepared: [],
    always: [],
    always_source: "",
    expanded: [],
    expanded_source: "",
    item_bonus: 0,
    item_bonus_source: "",
    attack_item_bonus: 0,
    attack_item_bonus_source: "",
    dc_item_bonus: 0,
    dc_item_bonus_source: "",
    ...partial,
  };
}

export function slugify(name: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
    н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ы: "y",
    э: "e", ю: "yu", я: "ya",
  };
  const s = name
    .toLowerCase()
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s.slice(0, 24) || "hero";
}

/** Итоговый лист героя для движка. */
export function buildSpec(d: Draft, kind: "player" | "companion" = "player"): HeroSpec {
  const r = resolve(d);
  const cls = r.cls;
  const ab = finalAbilities(d);
  const pb = r.pb;
  const features: SpecFeature[] = [];
  const resources: HeroSpec["resources"] = [];
  const casters: SpecCaster[] = [];
  const granted: SpecGranted[] = [];
  const addResource = (rule: ResourceRule, name?: string): string | null => {
    const max = resourceMax(rule, d, cls);
    if (max < 1 || resources.some((x) => x.id === rule.id)) return max < 1 ? null : rule.id;
    resources.push({ id: rule.id, name: name ?? rule.name, max, recovery: RECOVERY[rule.recovery] });
    return rule.id;
  };

  // Вид.
  const species = r.species;
  const lineage = species?.lineage?.options.find((o) => o.id === r.lineageId);
  if (species) {
    const resById = new Map((species.resources ?? []).map((x) => [x.id, x]));
    const traitRes: Record<string, string> = {
      "Оружие дыхания": "species.breath_weapon",
      "Знание камня": "species.stonecunning",
      "Великанье наследие": "species.giant_ancestry",
      "Прилив адреналина": "species.adrenaline_rush",
      "Непоколебимая стойкость": "species.relentless_endurance",
      "Исцеляющие руки": "species.healing_hands",
      "Небесное откровение": "species.celestial_revelation",
    };
    for (const t of species.traits) {
      if (t.name === "Небесное откровение" && d.level < 3) continue;
      const rule = resById.get(traitRes[t.name] ?? "");
      features.push({ name: t.name, source: species.name, text: t.text, resource_id: rule ? addResource(rule) : null });
    }
    if (lineage) features.push({ name: lineage.name, source: species.lineage?.label ?? species.name, text: lineage.text ?? "", resource_id: null });
    // Магия наследия.
    const spells = r.lineageId ? species.lineageSpells?.[r.lineageId] : undefined;
    const innateCantrips: string[] = [];
    const innateAlways: string[] = [];
    if (species.id === "tiefling") innateCantrips.push("thaumaturgy");
    if (species.id === "aasimar") innateCantrips.push("light");
    if (species.id === "gnome" && r.lineageId === "rock") innateCantrips.push("prestidigitation");
    for (const [lvl, id] of Object.entries(spells ?? {})) {
      const meta = SPELL_BY_ID.get(id);
      if (!meta || Number(lvl) > d.level) continue;
      if (meta.level === 0) innateCantrips.push(id);
      else {
        innateAlways.push(id);
        const resId = `species.spell.${id}`;
        resources.push({ id: resId, name: `${meta.name} (наследие)`, max: 1, recovery: "long_rest" });
        granted.push({ spell_id: id, source: lineage?.name ?? species.name, resource_id: resId, cast_level: meta.level, caster_id: "species", slots_allowed: true });
      }
    }
    if (species.id === "gnome" && r.lineageId === "forest") {
      innateAlways.push("speak-with-animals");
      resources.push({ id: "species.spell.speak-with-animals", name: "Разговор с животными (наследие)", max: pb, recovery: "long_rest" });
      granted.push({ spell_id: "speak-with-animals", source: "Лесной гном", resource_id: "species.spell.speak-with-animals", cast_level: 1, caster_id: "species", slots_allowed: true });
    }
    if (innateCantrips.length || innateAlways.length) {
      const ability = (species.id === "aasimar" ? "charisma" : (one(d, "species.ability") ?? "intelligence")) as AbilityId;
      const all = [...innateCantrips, ...innateAlways];
      casters.push(
        caster({
          id: "species",
          label: lineage ? `${species.name}: ${lineage.name}` : species.name,
          class: SPELL_CLASS_BY_ABILITY[ability],
          ability,
          level: d.level,
          progression: "innate",
          preparation: "prepared",
          cantrips: innateCantrips,
          max_cantrips: innateCantrips.length,
          max_prepared: 0,
          always: innateAlways,
          always_source: lineage?.name ?? species.name,
          expanded: all,
          expanded_source: lineage?.name ?? species.name,
        }),
      );
    }
  }

  // Класс.
  const classes: HeroSpec["classes"] = [];
  if (cls) {
    classes.push({ id: cls.id, name: cls.name, subclass: r.subclass?.name ?? null, level: d.level, hit_die: cls.hitDie });
    const all: { f: Feature; src: string }[] = [
      ...cls.features.map((f) => ({ f, src: `${cls.name} ${f.level}` })),
      ...(r.subclass?.features ?? []).map((f) => ({ f, src: `${r.subclass!.name} ${f.level}` })),
    ].filter(({ f }) => f.level <= d.level);
    const seen = new Set<string>();
    for (const { f, src } of all.sort((a, b) => a.f.level - b.f.level)) {
      if (f.choices?.some((c) => c.kind === "feat") && f.name === "Увеличение характеристик") continue;
      // Повтор умения на старшем уровне (экспертиза) — одна строка.
      const key = f.name;
      let text = f.text;
      for (const c of f.choices ?? []) {
        if (c.kind === "option") {
          const chosen = pick(d, c.id)
            .map((id) => c.options?.find((o) => o.id === id))
            .filter(Boolean);
          if (chosen.length) text += `\nВыбрано: ${chosen.map((o) => o!.name).join(", ")}.`;
        }
        if (c.kind === "weapon_mastery") {
          const names = pick(d, c.id).map((id) => WEAPONS.find((w) => w.id === id)?.name ?? id);
          if (names.length) text += `\nОружие: ${names.join(", ")}.`;
        }
      }
      if (seen.has(key) && !f.resource) {
        const prev = features.find((x) => x.name === key);
        if (prev) prev.text += `\n${f.level} ур.: ${f.text}`;
        continue;
      }
      seen.add(key);
      features.push({ name: f.name, source: src, text, resource_id: f.resource ? addResource(f.resource) : null });
      // Выбранные варианты (воззвания, метамагия, порядок) — отдельными строками.
      for (const c of f.choices ?? []) {
        if (c.kind !== "option" || (c.options?.length ?? 0) < 6) continue;
        for (const id of pick(d, c.id)) {
          const o = c.options?.find((x) => x.id === id);
          if (o) features.push({ name: o.name, source: f.name, text: o.text ?? "", resource_id: null });
        }
      }
    }
  }

  // Таланты.
  for (const slot of featSlots(d)) {
    const feat = slotFeat(d, slot);
    if (!feat) continue;
    let resId: string | null = null;
    if (feat.resource) resId = addResource(feat.resource);
    features.push({ name: feat.name, source: `Талант: ${slot.label}`, text: feat.text, resource_id: resId });
    if (feat.id === "magic_initiate") {
      const list = magicInitiateList(d, slot) as SpellClassId | undefined;
      const ability = (one(d, `${slot.key}:mi.ability`) ?? "intelligence") as AbilityId;
      const cantrips = pick(d, `${slot.key}:mi.cantrips`);
      const spell = one(d, `${slot.key}:mi.spell`);
      if (list) {
        const id = `feat.mi.${list}`;
        const resource = `${id}.spell`;
        casters.push(
          caster({
            id,
            label: `Посвящённый в магию (${list === "cleric" ? "жрец" : list === "druid" ? "друид" : "волшебник"})`,
            class: list,
            ability,
            level: d.level,
            progression: "innate",
            preparation: "prepared",
            cantrips,
            max_cantrips: 2,
            max_prepared: 0,
            always: spell ? [spell] : [],
            always_source: "Посвящённый в магию",
          }),
        );
        if (spell) {
          resources.push({ id: resource, name: `${SPELL_BY_ID.get(spell)?.name ?? spell} (талант)`, max: 1, recovery: "long_rest" });
          granted.push({ spell_id: spell, source: "Посвящённый в магию", resource_id: resource, cast_level: 1, caster_id: id, slots_allowed: true });
        }
      }
    }
    const fixedGrants: Record<string, string[]> = { fey_touched: ["misty-step"], shadow_touched: ["invisibility"], telepathic: ["detect-thoughts"] };
    if (feat.id in fixedGrants) {
      const ability = (pick(d, `${slot.key}:abilities`)[0] ?? "intelligence") as AbilityId;
      const list = [...(fixedGrants[feat.id] ?? []), ...pick(d, `${slot.key}:touched.spell`)];
      const id = `feat.${feat.id}`;
      casters.push(
        caster({
          id,
          label: feat.name,
          class: SPELL_CLASS_BY_ABILITY[ability],
          ability,
          level: d.level,
          progression: "innate",
          preparation: "prepared",
          max_prepared: 0,
          always: list,
          always_source: feat.name,
          expanded: list,
          expanded_source: feat.name,
        }),
      );
      for (const spellId of list) {
        const meta = SPELL_BY_ID.get(spellId);
        if (!meta) continue;
        const res = `${id}.${spellId}`;
        resources.push({ id: res, name: `${meta.name} (талант)`, max: 1, recovery: "long_rest" });
        granted.push({ spell_id: spellId, source: feat.name, resource_id: res, cast_level: meta.level, caster_id: id, slots_allowed: true });
      }
    }
  }

  // Заклинания класса.
  const sc = cls?.spellcasting;
  if (cls && sc) {
    const always: string[] = [];
    const sub = r.subclass;
    for (const [lvl, list] of Object.entries(sub?.spells ?? {})) if (Number(lvl) <= d.level) always.push(...list);
    if (sub?.spellsByOption) {
      const opt = one(d, sub.spellsByOption.choice);
      for (const [lvl, list] of Object.entries(opt ? (sub.spellsByOption.spells[opt] ?? {}) : {}))
        if (Number(lvl) <= d.level) always.push(...list);
    }
    if (cls.id === "paladin" && d.level >= 2) always.push("divine-smite");
    if (cls.id === "paladin" && d.level >= 5) always.push("find-steed");
    if (cls.id === "ranger") always.push("hunters-mark");
    if (cls.id === "druid") always.push("speak-with-animals");
    const lore = pick(d, "spells.lore");
    always.push(...lore);
    const list = pick(d, "spells.list");
    const offList = list.filter((id) => !SPELL_BY_ID.get(id)?.classes.includes(sc.spellClass));
    const known = sc.preparation === "known" ? list : sc.preparation === "spellbook" ? pick(d, "spells.book") : [];
    const prepared = sc.preparation === "known" ? [] : list;
    const uniqueAlways = [...new Set(always)].filter((id) => SPELL_BY_ID.has(id));
    let cantripMax = sc.cantrips[d.level - 1] ?? 0;
    const order = one(d, "cleric.order") ?? one(d, "druid.order");
    if (order === "thaumaturge" || order === "magician") cantripMax += 1;
    casters.push(
      caster({
        id: cls.id,
        label: cls.name,
        class: sc.spellClass,
        ability: sc.ability,
        level: d.level,
        progression: sc.progression === "half" ? "half_2024" : sc.progression,
        preparation: sc.preparation,
        cantrips: pick(d, "spells.cantrips"),
        max_cantrips: cantripMax,
        known,
        max_known: sc.preparation === "known" ? (sc.prepared[d.level - 1] ?? 0) : null,
        max_prepared: sc.preparation === "known" ? null : (sc.prepared[d.level - 1] ?? 0),
        prepared,
        always: uniqueAlways,
        always_source: sub ? `Умения класса, ${sub.name}` : "Умения класса",
        expanded: [...offList, ...lore.filter((id) => !SPELL_BY_ID.get(id)?.classes.includes(sc.spellClass))],
        expanded_source: cls.id === "bard" ? "Магические тайны" : "",
      }),
    );
    for (const circle of [6, 7, 8]) {
      const id = one(d, `spells.arcanum.${circle}`);
      if (!id) continue;
      const res = `warlock.arcanum.${circle}`;
      resources.push({ id: res, name: `Арканум ${circle} круга`, max: 1, recovery: "long_rest" });
      granted.push({ spell_id: id, source: "Таинственный арканум", resource_id: res, cast_level: circle, caster_id: "warlock", slots_allowed: false });
    }
    if (cls.id === "paladin" && d.level >= 2) {
      resources.push({ id: "paladin.free_smite", name: "Кара без ячейки", max: 1, recovery: "long_rest" });
      granted.push({ spell_id: "divine-smite", source: "Кара паладина", resource_id: "paladin.free_smite", cast_level: 1, caster_id: "paladin", slots_allowed: true });
    }
    if (cls.id === "ranger") {
      const res = resources.find((x) => x.id === "ranger.favored_enemy");
      if (res) granted.push({ spell_id: "hunters-mark", source: "Избранный враг", resource_id: res.id, cast_level: 1, caster_id: "ranger", slots_allowed: true });
    }
  }

  // Атаки оружием.
  const { items } = equipment(d);
  const mastered = new Set(pick(d, "weapon_mastery"));
  const attacks: HeroSpec["attacks"] = [];
  const seenWeapons = new Set<string>();
  for (const text of items) {
    const { weapon } = parseItem(text);
    if (!weapon || seenWeapons.has(weapon.id)) continue;
    seenWeapons.add(weapon.id);
    const finesse = weapon.properties.includes("фехтовальное") || (cls?.id === "monk" && canUseWeapon(cls, weapon));
    const ability: AbilityId = weapon.ranged
      ? "dexterity"
      : finesse && ab.dexterity > ab.strength
        ? "dexterity"
        : "strength";
    const notes = [weapon.properties.join(", ")];
    if (mastered.has(weapon.id)) notes.push(`Мастерство: ${MASTERY[weapon.mastery]?.name ?? weapon.mastery}`);
    attacks.push({
      name: weapon.name,
      ability,
      caster_id: null,
      proficient: cls ? canUseWeapon(cls, weapon) : false,
      magic: 0,
      damage_dice: weapon.damage,
      damage_type: weapon.damageType,
      add_ability_to_damage: true,
      damage_bonus: 0,
      extra: "",
      range: weapon.range ?? (weapon.properties.includes("досягаемость") ? "10 фт" : "5 фт"),
      notes: notes.filter(Boolean).join(". "),
      save: null,
    });
  }
  if (cls?.id === "monk") {
    attacks.push({
      name: "Безоружный удар",
      ability: ab.dexterity >= ab.strength ? "dexterity" : "strength",
      caster_id: null,
      proficient: true,
      magic: 0,
      damage_dice: columnValue(cls, "Боевые искусства", d.level) ?? "1d6",
      damage_type: "дробящий",
      add_ability_to_damage: true,
      damage_bonus: 0,
      extra: "",
      range: "5 фт",
      notes: "Боевые искусства",
      save: null,
    });
  }

  // Владения.
  const proficiencies: HeroSpec["proficiencies"] = [];
  if (cls) {
    proficiencies.push({ kind: "Доспехи", text: cls.armor, from_rules: true });
    proficiencies.push({ kind: "Оружие", text: cls.weapons, from_rules: true });
  }
  const toolList = tools(d);
  if (toolList.length) proficiencies.push({ kind: "Инструменты", text: toolList.join(", "), from_rules: true });
  proficiencies.push({ kind: "Языки", text: languages(d).join(", "), from_rules: true });
  if (species) {
    const senses = species.darkvision
      ? `Тёмное зрение ${species.id === "elf" && r.lineageId === "drow" ? 120 : species.darkvision} фт`
      : "";
    proficiencies.push({ kind: "Размер и чувства", text: [species.size, senses].filter(Boolean).join(", "), from_rules: true });
  }

  const initiative = slotFeatIds(d).includes("alert") ? [{ label: "Бдительный", value: pb }] : [];
  const ac = armorClass(d);
  const bg = d.backgroundId ? BACKGROUND_BY_ID.get(d.backgroundId) : undefined;
  const speciesName = species ? (lineage ? `${species.name} (${lineage.name.toLowerCase()})` : species.name) : "";

  return {
    id: kind === "player" ? "pc.hero" : `npc.${slugify(d.name)}`,
    kind,
    name: d.name.trim(),
    title: "",
    species: speciesName,
    background: bg?.name ?? "",
    alignment: d.alignment,
    appearance: d.appearance.trim(),
    portrait: species ? portraitKey(species.id, d.gender) : "",
    classes,
    abilities: ab,
    hp: { rolls: hpValues(d), per_level: hpPerLevelBonus(d), flat: 0 },
    armor_class: ac.total,
    armor_class_breakdown: ac.parts,
    speed_ft: speed(d),
    xp: XP_THRESHOLDS[d.level - 1] ?? 0,
    save_proficiencies: cls?.saves ?? [],
    skills: skillProficiencies(d),
    initiative_bonuses: initiative,
    attacks,
    features,
    proficiencies,
    resources,
    casters,
    granted,
    items: items.map((text) => {
      const p = parseItem(text);
      const armor = ARMOR_BY_NAME.get(p.name);
      return {
        name: p.name,
        quantity: p.quantity,
        category: p.weapon ? "Оружие" : armor ? "Доспехи" : "Снаряжение",
        notes: "",
      };
    }),
    notes: [],
  };
}

function slotFeatIds(d: Draft): string[] {
  return featSlots(d)
    .map((s) => slotFeat(d, s)?.id)
    .filter((x): x is string => Boolean(x));
}

/** Краткая подпись героя: «Эльф · Волшебник 3». */
export function heroSummary(d: Draft): string {
  const r = resolve(d);
  return [r.species?.name, r.cls ? `${r.cls.name} ${d.level}` : null].filter(Boolean).join(" · ");
}

/** Модификатор со знаком: +2 / −1. */
export function signed(n: number): string {
  return n >= 0 ? `+${n}` : `−${Math.abs(n)}`;
}

export { ABILITY_SHORT, CLASSES };
