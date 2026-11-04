// Проверка целостности базы знаний. Запуск: node --experimental-strip-types scripts/test-knowledge.ts

import assert from "node:assert/strict";
import { KB_BY_ID, KB_ENTRIES, KB_LAYERS, matchesQuery } from "../src/data/kb/index.ts";

// Уникальные ID.
assert.equal(KB_BY_ID.size, KB_ENTRIES.length, "повторяющиеся ID карточек");

for (const entry of KB_ENTRIES) {
  const layer = KB_LAYERS.find((l) => l.id === entry.layer);
  assert.ok(layer, `${entry.id}: неизвестный слой ${entry.layer}`);
  assert.ok(
    layer.sections.some((s) => s.id === entry.section),
    `${entry.id}: раздела ${entry.section} нет в слое ${entry.layer}`,
  );
  assert.ok(entry.summary.length > 10, `${entry.id}: пустое описание`);
  for (const id of entry.related ?? []) {
    assert.ok(KB_BY_ID.has(id), `${entry.id}: связь на несуществующую карточку ${id}`);
  }
  if (entry.reveal) assert.equal(entry.layer, "master", `${entry.id}: тайна вне слоя мастера`);
}

// В каждом разделе каждого слоя есть хотя бы одна карточка.
for (const layer of KB_LAYERS) {
  for (const section of layer.sections) {
    assert.ok(
      KB_ENTRIES.some((e) => e.layer === layer.id && e.section === section.id),
      `пустой раздел ${layer.id}/${section.id}`,
    );
  }
}

// Поиск с русскими окончаниями.
const nodes = KB_BY_ID.get("lore.five_nodes");
assert.ok(nodes && matchesQuery(nodes, "узлов"));
assert.ok(nodes && matchesQuery(nodes, "Горнило"));
const crow = KB_BY_ID.get("loc.crow_rock");
assert.ok(crow && matchesQuery(crow, "крепость баллисты"));
assert.ok(crow && !matchesQuery(crow, "сапфир"));

console.log(`База знаний: ${KB_ENTRIES.length} карточек, все проверки пройдены`);
