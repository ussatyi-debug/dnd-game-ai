// Повышение уровня с выбором класса: тот же класс или новый (мультикласс по правилам 2024 года).
// Здесь — расчёт по данным правил: доступные классы, требования мультикласса, умения нового
// уровня, магия класса и владения мультикласса. Движок проверяет всё ещё раз.

import { CLASSES } from "../data/rules/classes/index.ts";
import type { AbilityId, ClassData, SubclassData } from "../data/rules/types.ts";
import { ABILITY_SHORT } from "../data/rules/common.ts";
import type { CharacterSheet, LevelCasting, LevelGain } from "./engine";

/** Женские и прочие названия классов в листах «Дома Стрэндж». */
const NAME_ALIASES: Record<string, string> = {
  жрица: "cleric",
  колдунья: "warlock",
  волшебница: "wizard",
  чародейка: "sorcerer",
  плутовка: "rogue",
  воительница: "fighter",
  монахиня: "monk",
  варварка: "barbarian",
  следопытка: "ranger",
  друидка: "druid",
};

/** Класс по названию или id из листа. */
export function classOf(nameOrId: string): ClassData | undefined {
  const q = nameOrId.trim().toLowerCase().replace(/ё/g, "е");
  const id = NAME_ALIASES[q] ?? q;
  return CLASSES.find((c) => c.id === id || c.name.toLowerCase() === q);
}

/** Владения, которые даёт новый класс при мультиклассе (Книга игрока 2024 года). */
const MULTICLASS_PROFICIENCIES: Record<string, string> = {
  barbarian: "щиты, воинское оружие",
  bard: "лёгкие доспехи, один навык на выбор, один музыкальный инструмент",
  cleric: "лёгкие и средние доспехи, щиты",
  druid: "лёгкие доспехи, щиты",
  fighter: "лёгкие и средние доспехи, щиты, воинское оружие",
  monk: "",
  paladin: "лёгкие и средние доспехи, щиты, воинское оружие",
  ranger: "лёгкие и средние доспехи, щиты, воинское оружие, один навык из списка следопыта",
  rogue: "лёгкие доспехи, один навык из списка плута, воровские инструменты",
  sorcerer: "",
  warlock: "лёгкие доспехи",
  wizard: "",
};

export interface ClassOption {
  cls: ClassData;
  /** Уровень в классе после повышения. */
  level: number;
  /** Класс уже есть у героя. */
  current: boolean;
  /** Подкласс героя в этом классе (название из листа). */
  subclassName: string | null;
  /** Почему нельзя (пусто — можно). */
  blocked: string;
}

function score(sheet: CharacterSheet, a: AbilityId): number {
  return sheet.abilities.find((x) => x.ability === a)?.score ?? 10;
}

/** Чего не хватает для мультикласса в этом классе (пусто — требования выполнены). */
export function multiclassGap(sheet: CharacterSheet, cls: ClassData): string {
  const { abilities, any } = cls.multiclass;
  const ok = (a: AbilityId) => score(sheet, a) >= 13;
  const met = any ? abilities.some(ok) : abilities.every(ok);
  if (met) return "";
  return `${cls.name}: нужно ${abilities.map((a) => ABILITY_SHORT[a]).join(any ? " или " : " и ")} 13+`;
}

/** Классы, в которых герой может взять следующий уровень. */
export function classOptions(sheet: CharacterSheet): ClassOption[] {
  const owned = sheet.classes.map((c) => ({ line: c, cls: classOf(c.class) }));
  const ownedGaps = owned
    .map((o) => (o.cls ? multiclassGap(sheet, o.cls) : ""))
    .filter(Boolean);
  return CLASSES.map((cls) => {
    const mine = owned.find((o) => o.cls?.id === cls.id);
    if (mine) {
      return {
        cls,
        level: mine.line.level + 1,
        current: true,
        subclassName: mine.line.subclass,
        blocked: mine.line.level >= 20 ? "20 уровень класса" : "",
      };
    }
    const gaps = [...ownedGaps, multiclassGap(sheet, cls)].filter(Boolean);
    return { cls, level: 1, current: false, subclassName: null, blocked: gaps.join("; ") };
  }).sort((a, b) => Number(b.current) - Number(a.current));
}

/** Подкласс героя по названию из листа («Исчадие (Ксартас), Договор Цепи» → Исчадие). */
export function findSubclass(cls: ClassData, name: string | null): SubclassData | undefined {
  if (!name) return undefined;
  const q = name.toLowerCase();
  return cls.subclasses.find((s) => q.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(q));
}

const PROGRESSION: Record<string, LevelCasting["progression"]> = {
  full: "full",
  half: "half_2024",
  third: "third",
  pact: "pact",
};

/** Магия класса на уровне `level` (класс или подкласс-заклинатель: Мистический рыцарь, ловкач). */
export function castingAt(cls: ClassData, sub: SubclassData | undefined, level: number): LevelCasting | null {
  const sc = cls.spellcasting ?? sub?.spellcasting;
  if (!sc) return null;
  const known = sc.preparation === "known";
  return {
    spell_class: sc.spellClass,
    ability: sc.ability,
    progression: PROGRESSION[sc.progression] ?? "full",
    preparation: sc.preparation,
    max_cantrips: sc.cantrips[level - 1] ?? 0,
    max_known: known ? (sc.prepared[level - 1] ?? 0) : null,
    max_prepared: known ? null : (sc.prepared[level - 1] ?? 0),
  };
}

/** Умения класса и подкласса на уровне класса `level`. */
export function featuresAt(cls: ClassData, sub: SubclassData | undefined, level: number) {
  const own = cls.features.filter((f) => f.level === level);
  const extra = sub ? sub.features.filter((f) => f.level === level) : [];
  return [...own, ...extra.map((f) => ({ ...f, name: f.name, sub: sub!.name }))].map((f) => ({
    name: f.name,
    text: f.text,
    source: "sub" in f && f.sub ? `${f.sub} ${level}` : `${cls.name} ${level}`,
  }));
}

/** Средний результат кости хитов (d8 → 5). */
export function averageRoll(die: number): number {
  return Math.floor(die / 2) + 1;
}

/** Собирает новый уровень для движка. */
export function buildGain(
  option: ClassOption,
  sub: SubclassData | undefined,
  hpRoll: number | null,
  hpBonus: number,
): LevelGain {
  const { cls, level } = option;
  const features = featuresAt(cls, sub, level).map((f) => ({
    // Одноимённые умения разных уровней («Увеличение характеристик») — отдельными строками.
    name: `${f.name} (${f.source})`,
    source: f.source,
    text: f.text,
    resource_id: null,
  }));
  if (!option.current) {
    const prof = MULTICLASS_PROFICIENCIES[cls.id];
    features.unshift({
      name: `Мультикласс: ${cls.name}`,
      source: `${cls.name} 1`,
      text: prof
        ? `Владения нового класса: ${prof}. Спасброски и стартовое снаряжение класса не даются.`
        : "Новых владений класс при мультиклассе не даёт. Спасброски и стартовое снаряжение класса не даются.",
      resource_id: null,
    });
  }
  const choosesSubclass = level === cls.subclassLevel && sub;
  return {
    class: cls.id,
    class_name: cls.name,
    subclass: choosesSubclass ? sub!.name : null,
    hit_die: cls.hitDie,
    hp_roll: hpRoll,
    hp_bonus: hpBonus,
    casting: castingAt(cls, sub, level),
    features,
    proficiencies: [],
  };
}
