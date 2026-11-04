// Проверка веб-движка в Node после перевода wasm → JavaScript.
// Запуск: node --experimental-strip-types scripts/smoke-web-engine.ts

import assert from "node:assert/strict";
import * as generated from "../src/generated/engine-web.js";
import { createWebEngine, type WebEngineModule } from "../src/lib/webBridge.ts";

const engine = createWebEngine(generated as unknown as WebEngineModule, [7, 42]);

const expr = engine.call<{ total: number; groups: { values: number[] }[] }>({
  cmd: "roll_expression",
  expression: "2к6+3",
  critical: true,
});
assert.ok(expr.total >= 7 && expr.total <= 27, `крит 2d6+3: ${expr.total}`);
assert.equal(expr.groups[0]?.values.length, 4);

const check = engine.call<{ dice: number[]; natural: number }>({
  cmd: "roll_check",
  mode: "advantage",
  modifiers: [{ label: "ЛОВ", value: 2 }],
  critThreshold: 19,
});
assert.equal(check.dice.length, 2);
assert.equal(check.natural, Math.max(...check.dice));

const player = engine.call<{ total: number; lucky_used: boolean }>({
  cmd: "submit_player_roll",
  input: "12 - везунчик",
  mode: "normal",
  modifiers: [{ label: "Скрытность", value: 6 }],
  critThreshold: 20,
});
assert.equal(player.total, 18);
assert.equal(player.lucky_used, true);

const lucky = engine.call<{ current: number; max: number }>({ cmd: "lucky_status" });
assert.deepEqual([lucky.current, lucky.max], [2, 3]);

assert.throws(
  () => engine.call({ cmd: "roll_expression", expression: "2d7", critical: false }),
  (error: unknown) => typeof error === "string" && error.includes("d7"),
);

// Распределение d20 через полный путь JS → движок → JS.
const counts = new Array<number>(20).fill(0);
for (let i = 0; i < 4000; i++) {
  const r = engine.call<{ natural: number }>({
    cmd: "roll_check",
    mode: "normal",
    modifiers: [],
    critThreshold: 20,
  });
  counts[r.natural - 1] = (counts[r.natural - 1] ?? 0) + 1;
}
assert.ok(counts.every((c) => c > 100), `грани d20: ${counts.join(",")}`);

console.log("Веб-движок работает: все проверки пройдены");
