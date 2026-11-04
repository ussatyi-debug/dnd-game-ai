// Броски лотка и их текстовое представление: для лога и для копирования мастеру.
//
// По механике кампании игрок сообщает мастеру только результат на кубах, без модификаторов:
// «16», «12 - везунчик», «3d6: 4 + 2 + 6 = 12».

export type DieId = "d4" | "d6" | "d8" | "d10" | "d12" | "d20" | "d100";

export const DICE: { id: DieId; sides: number; maxCount: number }[] = [
  { id: "d4", sides: 4, maxCount: 10 },
  { id: "d6", sides: 6, maxCount: 10 },
  { id: "d8", sides: 8, maxCount: 10 },
  { id: "d10", sides: 10, maxCount: 10 },
  { id: "d12", sides: 12, maxCount: 10 },
  { id: "d20", sides: 20, maxCount: 10 },
  { id: "d100", sides: 100, maxCount: 5 },
];

/** Результат броска лотка. */
export interface RollResult {
  die: DieId;
  values: number[];
  total: number;
  /** Переброс чертой «Везунчик»: значение до переброса. */
  luckyFrom?: number;
}

/** Запись лога. */
export interface TrayRoll extends RollResult {
  id: number;
  time: string;
}

export type RollTone = "normal" | "crit" | "fumble";

/** Название броска: «d20», «3d6», «d20 — Везунчик». */
export function rollTitle(roll: RollResult): string {
  const base = roll.values.length === 1 ? roll.die : `${roll.values.length}${roll.die}`;
  return roll.luckyFrom !== undefined ? `${base} — Везунчик` : base;
}

/** Подробности для лога. */
export function rollDetail(roll: RollResult): string {
  if (roll.luckyFrom !== undefined) {
    return `${roll.total} (было ${roll.luckyFrom})`;
  }
  if (roll.values.length === 1) {
    return String(roll.total);
  }
  return `${roll.values.join(" + ")} = ${roll.total}`;
}

/** Текст для мастера — в формате кодекса кампании. */
export function rollCopyText(roll: RollResult): string {
  if (roll.luckyFrom !== undefined) {
    return `${roll.total} - везунчик`;
  }
  if (roll.values.length === 1) {
    return String(roll.total);
  }
  return `${roll.values.length}${roll.die}: ${roll.values.join(" + ")} = ${roll.total}`;
}

/** Натуральные 20 и 1 на одиночном d20 выделяются цветом. */
export function rollTone(roll: RollResult): RollTone {
  if (roll.die !== "d20" || roll.values.length !== 1) return "normal";
  if (roll.total === 20) return "crit";
  if (roll.total === 1) return "fumble";
  return "normal";
}
