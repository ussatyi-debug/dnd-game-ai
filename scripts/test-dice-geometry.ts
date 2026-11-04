// Тесты геометрии кубов. Запуск: node --experimental-strip-types scripts/test-dice-geometry.ts

import assert from "node:assert/strict";
import {
  createDieShape,
  d4CornerValues,
  dot,
  labelFor,
  length,
  rotate,
  splitPercentile,
  upIndex,
  valuesShowing,
  type DieKind,
  type Quat,
} from "../src/dice/geometry.ts";

const expected: Record<DieKind, { faces: number; vertices: number; perFace: number }> = {
  d4: { faces: 4, vertices: 4, perFace: 3 },
  d6: { faces: 6, vertices: 8, perFace: 4 },
  d8: { faces: 8, vertices: 6, perFace: 3 },
  d10: { faces: 10, vertices: 12, perFace: 4 },
  d10_tens: { faces: 10, vertices: 12, perFace: 4 },
  d12: { faces: 12, vertices: 20, perFace: 5 },
  d20: { faces: 20, vertices: 12, perFace: 3 },
};

function randomQuat(): Quat {
  const u1 = Math.random();
  const u2 = Math.random() * 2 * Math.PI;
  const u3 = Math.random() * 2 * Math.PI;
  const a = Math.sqrt(1 - u1);
  const b = Math.sqrt(u1);
  return [a * Math.sin(u2), a * Math.cos(u2), b * Math.sin(u3), b * Math.cos(u3)];
}

for (const kind of Object.keys(expected) as DieKind[]) {
  const shape = createDieShape(kind);
  const e = expected[kind];
  assert.equal(shape.faces.length, e.faces, `${kind}: граней`);
  assert.equal(shape.vertices.length, e.vertices, `${kind}: вершин`);
  for (const face of shape.faces) assert.equal(face.length, e.perFace, `${kind}: вершин в грани`);

  // Формула Эйлера: V − E + F = 2.
  const edges = new Set<string>();
  for (const face of shape.faces) {
    face.forEach((v, i) => {
      const w = face[(i + 1) % face.length] as number;
      edges.add(v < w ? `${v}-${w}` : `${w}-${v}`);
    });
  }
  assert.equal(shape.vertices.length - edges.size + shape.faces.length, 2, `${kind}: Эйлер`);

  // Нормали наружу и единичной длины.
  shape.normals.forEach((n, i) => {
    assert.ok(Math.abs(length(n) - 1) < 1e-9, `${kind}: длина нормали`);
    assert.ok(dot(n, shape.centers[i]!) > 0, `${kind}: нормаль ${i} внутрь`);
  });

  // Значения — перестановка 1..sides.
  assert.deepEqual([...shape.values].sort((a, b) => a - b), Array.from({ length: shape.sides }, (_, i) => i + 1));

  // Противоположные грани в сумме n + 1 (кроме d4).
  if (kind !== "d4") {
    shape.normals.forEach((n, i) => {
      let opposite = 0;
      let best = Infinity;
      shape.normals.forEach((m, j) => {
        const d = dot(n, m);
        if (j !== i && d < best) {
          best = d;
          opposite = j;
        }
      });
      assert.equal(shape.values[i]! + shape.values[opposite]!, shape.sides + 1, `${kind}: пара ${i}`);
    });
  }

  // Любое значение можно показать на любой верхней грани.
  for (let trial = 0; trial < 50; trial++) {
    const q = randomQuat();
    const up = upIndex(shape, q);
    const value = 1 + Math.floor(Math.random() * shape.sides);
    const values = valuesShowing(shape, up, value);
    assert.equal(values[up], value);
    assert.deepEqual([...values].sort((a, b) => a - b), [...shape.values].sort((a, b) => a - b));
  }
}

// Поворот на 90° вокруг X: (0, 0, 1) → (0, −1, 0).
const s = Math.SQRT1_2;
const r = rotate([s, 0, 0, s], [0, 0, 1]);
assert.ok(Math.abs(r[1] + 1) < 1e-9 && Math.abs(r[2]) < 1e-9);

// Верхняя грань d6 без поворота смотрит в +Y.
const d6 = createDieShape("d6");
const top = upIndex(d6, [0, 0, 0, 1]);
assert.ok(d6.normals[top]![1] > 0.99);

// d4: на грани три числа — значения её вершин.
const d4 = createDieShape("d4");
assert.equal(new Set(d4CornerValues(d4, d4.values, 0)).size, 3);

assert.equal(labelFor("d10", 10), "0");
assert.equal(labelFor("d10_tens", 10), "00");
assert.equal(labelFor("d10_tens", 3), "30");
assert.equal(labelFor("d20", 20), "20");

assert.deepEqual(splitPercentile(100), { tens: 10, units: 10 });
assert.deepEqual(splitPercentile(37), { tens: 3, units: 7 });
assert.deepEqual(splitPercentile(10), { tens: 1, units: 10 });
assert.deepEqual(splitPercentile(5), { tens: 10, units: 5 });
assert.throws(() => splitPercentile(0));
// Проверка обратного разложения для всех значений.
for (let v = 1; v <= 100; v++) {
  const { tens, units } = splitPercentile(v);
  const t = tens === 10 ? 0 : tens * 10;
  const u = units === 10 ? 0 : units;
  assert.equal(t + u === 0 ? 100 : t + u, v);
}

console.log("Геометрия кубов: все проверки пройдены");
