// Помощники для таблиц классов.

import type { Feature } from "../types";

/** Колонка по ступеням: [[1, "2"], [3, "3"]] → значение держится до следующей ступени, 20 уровней. */
export function steps(points: [number, string | number][]): string[] {
  const out: string[] = [];
  let current = "—";
  for (let level = 1; level <= 20; level += 1) {
    const hit = points.find(([at]) => at === level);
    if (hit) current = String(hit[1]);
    out.push(current);
  }
  return out;
}

/** Числовая таблица по ступеням (для заговоров и подготовленных заклинаний). */
export function numbers(points: [number, number][]): number[] {
  return steps(points).map((v) => (v === "—" ? 0 : Number(v)));
}

/** Список по уровням 1–20 без ступеней. */
export function list(values: (string | number)[]): string[] {
  if (values.length !== 20) throw new Error(`таблица класса: нужно 20 значений, получено ${values.length}`);
  return values.map(String);
}

/** Повышение характеристик на указанных уровнях. */
export function asi(levels: number[]): Feature[] {
  return levels.map((level) => ({
    level,
    name: "Увеличение характеристик",
    text: "Талант «Увеличение характеристик» или другой общий талант, требованиям которого вы соответствуете.",
    choices: [{ id: `asi.${level}`, label: "Талант", kind: "feat" as const, count: 1, from: ["general"] }],
  }));
}

export const PREPARED_FULL = numbers([
  [1, 4], [2, 5], [3, 6], [4, 7], [5, 9], [6, 10], [7, 11], [8, 12], [9, 14], [10, 15],
  [11, 16], [13, 17], [15, 18], [17, 19], [18, 20], [19, 21], [20, 22],
]);

export const PREPARED_HALF = numbers([
  [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [7, 7], [9, 9], [11, 10], [13, 11], [15, 12], [17, 14], [19, 15],
]);

export const ALL_CANTRIPS_ZERO = numbers([[1, 0]]);
