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
});
assert.equal(sheet.name, "Сэр Никис Стрэндж");
assert.equal(sheet.level, 10);
assert.equal(sheet.resources[0]?.id, "feat.lucky");

const reroll = engine.call<{ value: number; lucky: { current: number } }>({ cmd: "lucky_reroll" });
assert.ok(reroll.value >= 1 && reroll.value <= 20);
assert.equal(reroll.lucky.current, 2);

const rested = engine.call<{ sheet: { resources: { current: number }[] } }>({
  cmd: "take_rest",
  kind: "long",
});
assert.equal(rested.sheet.resources[0]?.current, 3);

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
