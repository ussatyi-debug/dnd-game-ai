// Сборка каталога заклинаний из исходных данных:
//   data/spells/srd-en.json      — заклинания SRD 5.1 (английский оригинал, CC-BY-4.0);
//   data/spells/custom.json      — заклинания вне SRD, описанные своими словами;
//   data/spells/ru/names.json    — русские названия;
//   data/spells/ru/text-*.json   — русские описания (по кругам).
//
// Результат:
//   src/data/spells/catalog.generated.ts — полный каталог для интерфейса и ИИ-мастера;
//   crates/engine/src/spell_catalog.rs   — метаданные для проверок движка.
//
// Запуск: node --experimental-strip-types scripts/build-spells.ts [--check]
// С флагом --check файлы не пишутся: скрипт падает, если сгенерированное устарело (для CI).

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, "data", "spells");
const tsOut = join(root, "src", "data", "spells", "catalog.generated.ts");
const rsOut = join(root, "crates", "engine", "src", "spell_catalog.rs");

interface SrdSpell {
  id: string;
  name: string;
  level: number;
  school: string;
  casting_time: string;
  range: string;
  components: string[];
  material?: string;
  ritual: boolean;
  duration: string;
  concentration: boolean;
  classes: string[];
  area?: { type: string; size: number };
  desc: string[];
  higher_level?: string[];
}

interface CustomSpell extends Omit<SrdSpell, "desc" | "higher_level" | "material"> {
  nameRu: string;
  source: string;
  materialRu?: string;
  descRu: string[];
  higherRu?: string[];
}

interface RuText {
  material?: string;
  desc: string[];
  higher?: string[];
}

const CLASSES = ["bard", "cleric", "druid", "paladin", "ranger", "sorcerer", "warlock", "wizard"];

const SCHOOLS: Record<string, string> = {
  abjuration: "Ограждение",
  conjuration: "Вызов",
  divination: "Прорицание",
  enchantment: "Очарование",
  evocation: "Воплощение",
  illusion: "Иллюзия",
  necromancy: "Некромантия",
  transmutation: "Преобразование",
};

const CASTING_TIME: Record<string, string> = {
  "1 action": "1 действие",
  "1 bonus action": "1 бонусное действие",
  "1 reaction": "1 реакция",
  "1 minute": "1 минута",
  "10 minutes": "10 минут",
  "1 hour": "1 час",
  "8 hours": "8 часов",
  "12 hours": "12 часов",
  "24 hours": "24 часа",
};

const DURATION: Record<string, string> = {
  Instantaneous: "Мгновенная",
  Special: "Особая",
  "Until dispelled": "Пока не рассеется",
  "1 round": "1 раунд",
  "1 minute": "1 минута",
  "10 minutes": "10 минут",
  "1 hour": "1 час",
  "8 hours": "8 часов",
  "24 hours": "24 часа",
  "7 days": "7 дней",
  "10 days": "10 дней",
  "30 days": "30 дней",
  "Up to 1 round": "вплоть до 1 раунда",
  "Up to 1 minute": "вплоть до 1 минуты",
  "Up to 10 minutes": "вплоть до 10 минут",
  "Up to 1 hour": "вплоть до 1 часа",
  "Up to 2 hours": "вплоть до 2 часов",
  "Up to 8 hours": "вплоть до 8 часов",
  "Up to 24 hours": "вплоть до 24 часов",
};

const RANGE_WORDS: Record<string, string> = {
  Self: "На себя",
  Touch: "Касание",
  Sight: "В пределах видимости",
  Special: "Особая",
  Unlimited: "Без ограничений",
  "1 mile": "1 миля",
  "500 miles": "500 миль",
};

const AREA: Record<string, (size: number) => string> = {
  sphere: (n) => `сфера радиусом ${n} фт`,
  cone: (n) => `конус ${n} фт`,
  cube: (n) => `куб ${n} фт`,
  line: (n) => `линия ${n} фт`,
  cylinder: (n) => `цилиндр радиусом ${n} фт`,
};

const COMPONENT: Record<string, string> = { V: "В", S: "С", M: "М" };

function fail(message: string): never {
  console.error(`build-spells: ${message}`);
  process.exit(1);
}

function lookup(table: Record<string, string>, key: string, what: string, id: string): string {
  const value = table[key];
  if (value === undefined) fail(`${id}: нет перевода для поля «${what}»: «${key}»`);
  return value;
}

function rangeRu(s: { id: string; range: string; area?: { type: string; size: number } }): string {
  const feet = /^(\d+) feet$/.exec(s.range);
  const base = feet ? `${feet[1]} фт` : lookup(RANGE_WORDS, s.range, "дистанция", s.id);
  if (!s.area) return base;
  const area = AREA[s.area.type];
  if (!area) fail(`${s.id}: неизвестная форма области «${s.area.type}»`);
  return `${base} (${area(s.area.size)})`;
}

function durationRu(s: { id: string; duration: string; concentration: boolean }): string {
  const d = lookup(DURATION, s.duration, "длительность", s.id);
  return s.concentration ? `Концентрация, ${d}` : d;
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

const srd = readJson<SrdSpell[]>(join(dataDir, "srd-en.json"));
const custom = readJson<CustomSpell[]>(join(dataDir, "custom.json"));
const names = readJson<Record<string, string>>(join(dataDir, "ru", "names.json"));

const texts: Record<string, RuText> = {};
for (const file of readdirSync(join(dataDir, "ru")).sort()) {
  if (!/^text-.*\.json$/.test(file)) continue;
  const part = readJson<Record<string, RuText>>(join(dataDir, "ru", file));
  for (const [id, text] of Object.entries(part)) {
    if (texts[id]) fail(`${file}: перевод «${id}» уже есть в другом файле`);
    if (!Array.isArray(text.desc) || text.desc.length === 0) fail(`${file}: у «${id}» пустое описание`);
    texts[id] = text;
  }
}

export interface OutSpell {
  id: string;
  name: string;
  nameEn: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  ritual: boolean;
  concentration: boolean;
  classes: string[];
  desc: string[];
  higher: string[];
  source: "srd" | "custom";
  sourceNote: string;
}

function componentsRu(components: string[], material: string | undefined): string {
  const letters = components.map((c) => COMPONENT[c] ?? fail(`неизвестный компонент «${c}»`));
  return material ? `${letters.join(", ")} (${material})` : letters.join(", ");
}

function checkClasses(id: string, classes: string[]) {
  for (const c of classes) if (!CLASSES.includes(c)) fail(`${id}: неизвестный класс «${c}»`);
}

const out: OutSpell[] = [];
const seen = new Set<string>();

for (const s of srd) {
  const name = names[s.id];
  if (!name) fail(`нет русского названия для «${s.id}»`);
  checkClasses(s.id, s.classes);
  const ru = texts[s.id];
  if (!ru) fail(`нет русского описания для «${s.id}» (data/spells/ru/text-*.json)`);
  out.push({
    id: s.id,
    name,
    nameEn: s.name,
    level: s.level,
    school: lookup(SCHOOLS, s.school, "школа", s.id),
    castingTime: lookup(CASTING_TIME, s.casting_time, "время накладывания", s.id),
    range: rangeRu(s),
    components: componentsRu(s.components, s.material ? ru.material ?? fail(`${s.id}: нет перевода материального компонента`) : undefined),
    duration: durationRu(s),
    ritual: s.ritual,
    concentration: s.concentration,
    classes: s.classes,
    desc: ru.desc,
    higher: ru.higher ?? [],
    source: "srd",
    sourceNote: "SRD 5.1",
  });
  seen.add(s.id);
}

for (const s of custom) {
  if (seen.has(s.id)) fail(`«${s.id}» есть и в SRD, и в custom.json`);
  checkClasses(s.id, s.classes);
  out.push({
    id: s.id,
    name: s.nameRu,
    nameEn: s.name,
    level: s.level,
    school: lookup(SCHOOLS, s.school, "школа", s.id),
    castingTime: lookup(CASTING_TIME, s.casting_time, "время накладывания", s.id),
    range: rangeRu(s),
    components: componentsRu(s.components, s.materialRu),
    duration: durationRu(s),
    ritual: s.ritual,
    concentration: s.concentration,
    classes: s.classes,
    desc: s.descRu,
    higher: s.higherRu ?? [],
    source: "custom",
    sourceNote: s.source,
  });
  seen.add(s.id);
}

for (const id of Object.keys(texts)) if (!seen.has(id)) fail(`перевод для неизвестного заклинания «${id}»`);
for (const id of Object.keys(names)) if (!seen.has(id)) fail(`название для неизвестного заклинания «${id}»`);

out.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

const tsHeader = `// Сгенерировано scripts/build-spells.ts из data/spells — не править вручную.
// Заклинания SRD 5.1 © Wizards of the Coast LLC, лицензия CC-BY-4.0
// (https://creativecommons.org/licenses/by/4.0/); перевод на русский — проект dnd-game-ai.

import type { SpellData } from "./types.ts";

`;
const ts = `${tsHeader}export const SPELLS: SpellData[] = ${JSON.stringify(out, null, 1)};\n`;

function rsString(s: string): string {
  return JSON.stringify(s);
}

const rsLines = out.map((s) => {
  const classes = s.classes.length
    ? s.classes.map((c) => `C_${c.toUpperCase()}`).join(" | ")
    : "0";
  return `    SpellMeta { id: ${rsString(s.id)}, name: ${rsString(s.name)}, level: ${s.level}, ritual: ${s.ritual}, concentration: ${s.concentration}, classes: ${classes}, srd: ${s.source === "srd"} },`;
});

const rs = `//! Каталог заклинаний для проверок движка.
//!
//! Сгенерировано \`scripts/build-spells.ts\` из \`data/spells\` — не править вручную.
//! Заклинания SRD 5.1 © Wizards of the Coast LLC, лицензия CC-BY-4.0.

use crate::spells::{
    SpellMeta, C_BARD, C_CLERIC, C_DRUID, C_PALADIN, C_RANGER, C_SORCERER, C_WARLOCK, C_WIZARD,
};

/// Все заклинания, отсортированы по ID.
#[rustfmt::skip]
pub(crate) static SPELLS: &[SpellMeta] = &[
${rsLines.join("\n")}
];
`;

const check = process.argv.includes("--check");
let stale = false;
for (const [path, content] of [
  [tsOut, ts],
  [rsOut, rs],
] as const) {
  const current = existsSync(path) ? readFileSync(path, "utf8") : "";
  if (current === content) continue;
  if (check) {
    console.error(`устарел ${path.slice(root.length + 1)} — запустите npm run spells`);
    stale = true;
  } else {
    writeFileSync(path, content);
  }
}
if (stale) process.exit(1);

console.log(`Заклинаний: ${out.length}`);
