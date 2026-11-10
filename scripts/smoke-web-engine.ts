// Проверка веб-движка в Node после перевода wasm → JavaScript.
// Запуск: node --experimental-strip-types scripts/smoke-web-engine.ts

import assert from "node:assert/strict";
import * as generated from "../src/generated/engine-web.js";
import { createWebEngine, type WebEngineModule } from "../src/lib/webBridge.ts";

const engine = createWebEngine(generated as unknown as WebEngineModule, [7, 42]);

const roll = engine.call<{ total: number; groups: { values: number[] }[] }>({
  cmd: "roll_expression",
  expression: "8d6",
  critical: false,
});
assert.equal(roll.groups[0]?.values.length, 8);
assert.ok(roll.total >= 8 && roll.total <= 48, `8d6: ${roll.total}`);

const sheet = engine.call<{ name: string; level: number; resources: { id: string; current: number }[] }>({
  cmd: "character_sheet",
  id: "pc.nikis",
});
assert.equal(sheet.name, "Сэр Никис Стрэндж");
assert.equal(sheet.level, 11);
assert.equal(sheet.resources[0]?.id, "feat.lucky");

const reroll = engine.call<{ value: number; lucky: { current: number } }>({ cmd: "lucky_reroll" });
assert.ok(reroll.value >= 1 && reroll.value <= 20);
assert.equal(reroll.lucky.current, 2);

const rested = engine.call<{ characters: { id: string; restored: string[] }[] }>({
  cmd: "take_rest",
  kind: "long",
});
assert.ok(rested.characters[0]?.restored.includes("Везунчик"));

const party = engine.call<{ members: unknown[]; treasury_total: number }>({ cmd: "party" });
assert.equal(party.members.length, 6);
const treasury = engine.call<{ total: number }>({ cmd: "treasury" });
assert.equal(treasury.total, party.treasury_total);

const book = engine.call<{ slots: { pact: boolean; pool: { current: number } }[] }>({
  cmd: "spellbook",
  id: "pc.nikis",
});
assert.equal(book.slots[0]?.pact, true);
const cast = engine.call<{ cast_level: number; summary: string }>({
  cmd: "cast_spell",
  id: "pc.nikis",
  spellId: "misty-step",
  method: null,
  slotLevel: null,
});
assert.equal(cast.cast_level, 4);
assert.ok(cast.summary.includes("Туманный шаг"));
const applied = engine.call<{ text: string; actions: { ok: boolean }[] }>({
  cmd: "master_apply",
  text: 'Вспышка.\n```engine\n{"cmd":"cast","character":"npc.valeria","spell":"bless"}\n```',
});
assert.equal(applied.text, "Вспышка.");
assert.equal(applied.actions[0]?.ok, true);

const context = engine.call<{ system: string; turn: string }>({ cmd: "master_context", query: "Атакую стражника" });
assert.ok(context.system.startsWith("Ты — Мастер") && context.system.includes('"cmd":"roll"'));
assert.ok(context.system.includes("СНИМОК СЦЕНЫ") && context.system.includes("ХРОНИКА"));
assert.ok(context.turn.includes("[ИЗМЕНЕНИЯ С НАЧАЛА СЦЕНЫ]") && context.turn.endsWith("Атакую стражника"));
assert.ok(context.turn.includes("[ПОДСКАЗКА ДВИЖКА]"));
// Снимок не меняется до смены сцены.
const again = engine.call<{ system: string }>({ cmd: "master_context", query: "x" });
assert.equal(again.system, context.system);
const query = engine.call<{ feedback: string }>({
  cmd: "master_rolls",
  text: 'Начинаю рассказ.\n```engine\n{"cmd":"query","what":"spells","id":"pc.nikis"}\n```',
});
assert.ok(query.feedback.includes("Ответы на запросы") && query.feedback.includes("misty-step"));
const rolls = engine.call<{ rolls: { total: number; d20: number }[]; feedback: string }>({
  cmd: "master_rolls",
  text: '```engine\n{"cmd":"roll","who":"Стражник","what":"атака","dice":"1d20+5","vs":"ac:18"}\n```',
});
assert.equal(rolls.rolls[0]?.total, (rolls.rolls[0]?.d20 ?? 0) + 5);
assert.ok(rolls.feedback.includes("Стражник — атака"));
assert.equal(engine.call<null>({ cmd: "master_rolls", text: "Просто рассказ." }), null);

assert.throws(
  () => engine.call({ cmd: "roll_expression", expression: "2d7", critical: false }),
  (error: unknown) => typeof error === "string" && error.includes("d7"),
);

// Распределение d20 через полный путь JS → движок → JS.
const counts = new Array<number>(20).fill(0);
for (let i = 0; i < 4000; i++) {
  const r = engine.call<{ groups: { values: number[] }[] }>({
    cmd: "roll_expression",
    expression: "1d20",
    critical: false,
  });
  const v = r.groups[0]?.values[0] ?? 0;
  counts[v - 1] = (counts[v - 1] ?? 0) + 1;
}
assert.ok(counts.every((c) => c > 100), `грани d20: ${counts.join(",")}`);

console.log("Веб-движок работает: все проверки пройдены");
