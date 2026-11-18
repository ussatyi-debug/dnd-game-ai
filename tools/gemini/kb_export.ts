// Выгрузка базы знаний для Gemini: текущие карточки слоя (по умолчанию «Мир») и id всех карточек.
// Запуск: node --experimental-strip-types --no-warnings tools/gemini/kb_export.ts [world|master|player]
import { writeFileSync } from "node:fs";
import { KB_ENTRIES } from "../../src/data/kb/index.ts";

const layer = process.argv[2] ?? "world";
const cards = KB_ENTRIES.filter((e) => e.layer === layer);
const ids = KB_ENTRIES.map((e) => ({ id: e.id, layer: e.layer, section: e.section, title: e.title }));
const out = `tools/gemini/kb_${layer}_current.json`;
writeFileSync(out, JSON.stringify({ layer, cards, all_ids: ids }, null, 1) + "\n");
console.log(`${out}: карточек слоя ${cards.length}, всего id ${ids.length}`);
