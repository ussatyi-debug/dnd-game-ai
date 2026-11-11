// Быстрый старт: готовые герои для новой кампании (решение владельца 11.11.2026).
//
// Набор постоянный, только бесплатные классы (воин, плут, жрец, волшебник), по 4 героя
// на ступени 1 (3 уровень) и 2 (5 уровень). Лист собирается мастером создания из черновика:
// заданы вид, класс, предыстория, характеристики и предпочтения выбора, остальное
// заполняется первым подходящим вариантом. Лист, как обычно, проверяет движок.

import { BACKGROUNDS } from "../data/rules/backgrounds.ts";
import { CLASSES } from "../data/rules/classes/index.ts";
import { SPECIES } from "../data/rules/species.ts";
import {
  choiceSlots,
  featOptions,
  featSlots,
  newDraft,
  slotFeat,
  spellChoices,
  type Draft,
  type Gender,
} from "./creation.ts";

type AbilityId = "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma";

export interface QuickHero {
  id: string;
  tier: 1 | 2;
  level: number;
  name: string;
  gender: Gender;
  speciesId: string;
  classId: string;
  subclassId: string;
  backgroundId: string;
  alignment: string;
  appearance: string;
  /** Одна строка для карточки выбора. */
  pitch: string;
  /** Стандартный набор 27 очков. */
  base: Record<AbilityId, number>;
  /** Происхождение вида (эльф, тифлинг, гном), если есть выбор. */
  lineage?: string;
  /** Предпочтения в выборах (навыки, стиль боя, заклинания) — по названию варианта. */
  prefer: string[];
}

const FIGHTER = { strength: 15, constitution: 14, dexterity: 13, wisdom: 12, charisma: 10, intelligence: 8 };
const ROGUE = { dexterity: 15, constitution: 14, wisdom: 13, intelligence: 12, charisma: 10, strength: 8 };
const CLERIC = { wisdom: 15, constitution: 14, strength: 13, charisma: 12, dexterity: 10, intelligence: 8 };
const WIZARD = { intelligence: 15, constitution: 14, dexterity: 13, wisdom: 12, charisma: 10, strength: 8 };

const FIGHTER_PREFS = ["Оборона", "Внимательность", "Выживание", "Двуручный меч", "Длинный меч", "Копьё", "Алебарда"];
const ROGUE_PREFS = [
  "Скрытность",
  "Ловкость рук",
  "Внимательность",
  "Акробатика",
  "Обман",
  "Анализ",
  "Короткий меч",
  "Кинжал",
  "Воровской жаргон",
];
const CLERIC_PREFS = [
  "Священное пламя",
  "Указание",
  "Свет",
  "Лечение ран",
  "Благословение",
  "Щит веры",
  "Направленный снаряд",
  "Духовное оружие",
  "Малое восстановление",
  "Духовные стражи",
  "Возрождение",
  "Медицина",
  "Проницательность",
];
const WIZARD_PREFS = [
  "Огненный снаряд",
  "Волшебная рука",
  "Свет",
  "Волшебная стрела",
  "Щит",
  "Доспехи мага",
  "Усыпление",
  "Обнаружение магии",
  "Громовая волна",
  "Туманный шаг",
  "Палящий луч",
  "Паутина",
  "Огненный шар",
  "Контрзаклинание",
  "Магия",
  "Анализ",
];

export const QUICK_HEROES: QuickHero[] = [
  {
    id: "q1-fighter",
    tier: 1,
    level: 3,
    name: "Хельмут Варг",
    gender: "m",
    speciesId: "human",
    classId: "fighter",
    subclassId: "champion",
    backgroundId: "soldier",
    alignment: "Законопослушный нейтральный",
    appearance: "Широкоплечий, с короткой седеющей бородой и старым шрамом через бровь; кольчуга чинена не раз.",
    pitch: "Ветеран пограничных гарнизонов: щит, меч и привычка держать строй.",
    base: FIGHTER,
    prefer: FIGHTER_PREFS,
  },
  {
    id: "q1-rogue",
    tier: 1,
    level: 3,
    name: "Лисса Тёрн",
    gender: "f",
    speciesId: "halfling",
    classId: "rogue",
    subclassId: "thief",
    backgroundId: "criminal",
    alignment: "Хаотичный нейтральный",
    appearance: "Маленькая и юркая, рыжие волосы стянуты в хвост, на поясе — связка отмычек и два ножа.",
    pitch: "Воровка из речных доков: замки, крыши и чужие кошельки.",
    base: ROGUE,
    prefer: ROGUE_PREFS,
  },
  {
    id: "q1-cleric",
    tier: 1,
    level: 3,
    name: "Брам Камнелоб",
    gender: "m",
    speciesId: "dwarf",
    classId: "cleric",
    subclassId: "life",
    backgroundId: "acolyte",
    alignment: "Законопослушный добрый",
    appearance: "Коренастый, с заплетённой в две косы бородой; на груди — потёртый священный символ.",
    pitch: "Храмовый лекарь: лечит, благословляет и не боится взяться за молот.",
    base: CLERIC,
    prefer: CLERIC_PREFS,
  },
  {
    id: "q1-wizard",
    tier: 1,
    level: 3,
    name: "Эйлин Морвен",
    gender: "f",
    speciesId: "elf",
    lineage: "high",
    classId: "wizard",
    subclassId: "evoker",
    backgroundId: "sage",
    alignment: "Нейтральный добрый",
    appearance: "Высокая, с тёмными волосами и чернильными пятнами на пальцах; книга заклинаний всегда под рукой.",
    pitch: "Учёная-заклинательница: огонь, щиты и знание, где искать ответы.",
    base: WIZARD,
    prefer: WIZARD_PREFS,
  },
  {
    id: "q2-fighter",
    tier: 2,
    level: 5,
    name: "Гордра Тяжкий Шаг",
    gender: "f",
    speciesId: "orc",
    classId: "fighter",
    subclassId: "champion",
    backgroundId: "guard",
    alignment: "Законопослушный нейтральный",
    appearance: "Рослая, с выбритыми висками и клыками в серебряных колпачках; тяжёлые латы без украшений.",
    pitch: "Бывшая начальница городской стражи: две атаки за ход и железная выдержка.",
    base: FIGHTER,
    prefer: FIGHTER_PREFS,
  },
  {
    id: "q2-rogue",
    tier: 2,
    level: 5,
    name: "Касс Ноктэ",
    gender: "m",
    speciesId: "tiefling",
    lineage: "infernal",
    classId: "rogue",
    subclassId: "thief",
    backgroundId: "charlatan",
    alignment: "Хаотичный нейтральный",
    appearance: "Стройный, с завитыми рогами и обаятельной улыбкой; дорогой камзол с потайными карманами.",
    pitch: "Шарлатан и вор: слово отвлекает, клинок довершает.",
    base: ROGUE,
    prefer: ROGUE_PREFS,
  },
  {
    id: "q2-cleric",
    tier: 2,
    level: 5,
    name: "Ильва Светлая",
    gender: "f",
    speciesId: "aasimar",
    classId: "cleric",
    subclassId: "life",
    backgroundId: "hermit",
    alignment: "Нейтральный добрый",
    appearance: "Светловолосая, с мягким сиянием в глазах; простая дорожная ряса и посох с фонарём.",
    pitch: "Странствующая целительница: духовные стражи и возвращение с порога смерти.",
    base: CLERIC,
    prefer: CLERIC_PREFS,
  },
  {
    id: "q2-wizard",
    tier: 2,
    level: 5,
    name: "Оттокар Флинц",
    gender: "m",
    speciesId: "gnome",
    lineage: "rock",
    classId: "wizard",
    subclassId: "evoker",
    backgroundId: "scribe",
    alignment: "Нейтральный",
    appearance: "Невысокий, в очках с толстыми линзами и мантии с подпалинами; говорит быстро и много.",
    pitch: "Писарь-волшебник: огненный шар, контрзаклинание и аккуратные заметки.",
    base: WIZARD,
    prefer: WIZARD_PREFS,
  },
];

const fold = (s: string) => s.toLowerCase().replace(/ё/g, "е");

/** Варианты по предпочтениям героя: сначала названные, потом остальные по порядку. */
function ordered<T extends { id: string; name: string }>(options: T[], prefer: string[]): T[] {
  const wanted = prefer.map(fold);
  const rank = (o: T) => {
    const i = wanted.indexOf(fold(o.name));
    return i < 0 ? wanted.length : i;
  };
  return [...options].sort((a, b) => rank(a) - rank(b));
}

/** Черновик готового героя: заполнены все шаги мастера создания. */
export function quickDraft(h: QuickHero): Draft {
  const d = newDraft();
  d.tier = h.tier;
  d.level = h.level;
  d.speciesId = h.speciesId;
  d.backgroundId = h.backgroundId;
  d.classId = h.classId;
  d.abilityMethod = "point";
  d.base = { ...h.base };
  d.hpMode = "average";
  d.name = h.name;
  d.gender = h.gender;
  d.alignment = h.alignment;
  d.appearance = h.appearance;
  const cls = CLASSES.find((c) => c.id === h.classId);
  const bg = BACKGROUNDS.find((b) => b.id === h.backgroundId);
  const species = SPECIES.find((s) => s.id === h.speciesId);
  if (!cls || !bg || !species) throw new Error(`Готовый герой ${h.name}: нет данных вида, класса или предыстории.`);
  const primary = cls.primary[0] as AbilityId;
  // Несколько проходов: выборы открывают новые (предмет набора → оружие для него и т. п.).
  for (let pass = 0; pass < 4; pass++) {
    if (species.lineage) d.picks["species.lineage"] = [h.lineage ?? species.lineage.options[0]!.id];
    if (species.lineage?.spellAbilityChoice) d.picks["species.ability"] = [h.classId === "cleric" ? "wisdom" : "intelligence"];
    d.picks["bg.mode"] = ["2-1"];
    const plus2 = (bg.abilities as string[]).includes(primary) ? primary : bg.abilities[0]!;
    d.picks["bg.plus2"] = [plus2];
    const second = ["constitution", "dexterity", "wisdom", "strength", "intelligence", "charisma"].find(
      (a) => a !== plus2 && (bg.abilities as string[]).includes(a),
    );
    d.picks["bg.plus1"] = [second ?? bg.abilities.find((a) => a !== plus2)!];
    if (bg.tool.startsWith("choice:")) d.picks["bg.tool"] = ["Кости"];
    if (h.level >= cls.subclassLevel) d.picks["class.subclass"] = [h.subclassId];
    for (const slot of featSlots(d)) {
      if (slot.fixed) {
        if (slot.fixed === "magic_initiate") d.picks[`${slot.key}:mi.ability`] = [h.classId === "cleric" ? "wisdom" : "intelligence"];
        continue;
      }
      if (!slotFeat(d, slot)) {
        const options = featOptions(d, slot);
        const asi = options.find((f) => f.id === "ability_score_improvement");
        const feat = asi ?? ordered(options, h.prefer)[0];
        if (feat) d.picks[slot.key] = [feat.id];
      }
      const feat = slotFeat(d, slot);
      if (feat?.abilityIncrease) {
        d.picks[`${slot.key}:abilities`] =
          feat.id === "ability_score_improvement" ? [primary, primary] : [feat.abilityIncrease[0]!];
      }
      if (feat?.id === "magic_initiate") d.picks[`${slot.key}:mi.ability`] = [h.classId === "cleric" ? "wisdom" : "intelligence"];
    }
    for (const c of [...choiceSlots(d), ...choiceSlots(d)]) {
      if (d.picks[c.key]?.length === c.count) continue;
      const taken = new Set(Object.entries(d.picks).filter(([k]) => k !== c.key).flatMap(([, v]) => v));
      const open = c.options.filter((o) => !o.disabled);
      const fresh = open.filter((o) => !taken.has(o.id));
      const pool = ordered(fresh.length >= c.count ? fresh : open, h.prefer);
      d.picks[c.key] = pool.slice(0, c.count).map((o) => o.id);
    }
    for (const c of spellChoices(d)) {
      const others = new Set(
        Object.entries(d.picks)
          .filter(([k]) => k.startsWith("spells.") && k !== c.key && k !== "spells.list" && k !== "spells.book")
          .flatMap(([, v]) => v),
      );
      const pool = ordered(
        c.options.filter((s) => !others.has(s.id)),
        h.prefer,
      );
      d.picks[c.key] = pool.slice(0, c.count).map((s) => s.id);
    }
  }
  return d;
}
