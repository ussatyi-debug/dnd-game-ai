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
  /** «Везунчик» (правила 2024 года — преимущество): первый куб. */
  luckyFrom?: number;
  /** «Везунчик»: второй куб; итог — больший из двух. */
  luckySecond?: number;
  /** Бросок с преимуществом или помехой (кнопки лотка): итог — больший или меньший куб. */
  pairMode?: "adv" | "dis";
  /** Первый куб пары. */
  pairFrom?: number;
  /** Второй куб пары. */
  pairSecond?: number;
}

function pairLabel(mode: "adv" | "dis"): string {
  return mode === "adv" ? "преимущество" : "помеха";
}

/** Запись лога. */
export interface TrayRoll extends RollResult {
  id: number;
  time: string;
  /** Бросок движка за мастера: кто и что бросал, строка с итогом. */
  master?: { who: string; what: string; line: string; outcome: string | null; hidden?: boolean };
}

export type RollTone = "normal" | "crit" | "fumble";

/** Название броска: «d20», «3d6», «d20 — Везунчик». */
export function rollTitle(roll: RollResult & { master?: TrayRoll["master"] }): string {
  if (roll.master?.hidden) return "🔒 Тайный бросок мастера";
  if (roll.master) return `Мастер · ${roll.master.who}${roll.master.what ? ` — ${roll.master.what}` : ""}`;
  const base = roll.values.length === 1 ? roll.die : `${roll.values.length}${roll.die}`;
  if (roll.luckyFrom !== undefined) return `${base} — Везунчик`;
  if (roll.pairMode) return `${base} — ${roll.pairMode === "adv" ? "с преимуществом" : "с помехой"}`;
  return base;
}

/** Подробности для лога. */
export function rollDetail(roll: RollResult): string {
  if (roll.luckyFrom !== undefined) {
    const second = roll.luckySecond ?? roll.total;
    return `${roll.total} (преимущество: ${roll.luckyFrom} и ${second})`;
  }
  if (roll.pairMode) {
    return `${roll.total} (${pairLabel(roll.pairMode)}: ${roll.pairFrom} и ${roll.pairSecond})`;
  }
  // Два d20 — не сумма, а пара кубов: игрок сам выбирает больший или меньший.
  if (roll.die === "d20" && roll.values.length === 2) {
    const a = roll.values[0] ?? 0;
    const b = roll.values[1] ?? 0;
    return `${a} и ${b} (больший ${Math.max(a, b)}, меньший ${Math.min(a, b)})`;
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
  if (roll.pairMode) {
    return `${roll.total} - ${pairLabel(roll.pairMode)} (${roll.pairFrom} и ${roll.pairSecond})`;
  }
  if (roll.die === "d20" && roll.values.length === 2) {
    return `2d20: ${roll.values[0]} и ${roll.values[1]}`;
  }
  if (roll.values.length === 1) {
    return String(roll.total);
  }
  return `${roll.values.length}${roll.die}: ${roll.values.join(" + ")} = ${roll.total}`;
}

/** Натуральные 20 и 1 на одиночном d20 выделяются цветом. */
export function rollTone(roll: RollResult & { master?: TrayRoll["master"] }): RollTone {
  // Тайный бросок не подсвечивается: цвет выдал бы результат.
  if (roll.master?.hidden) return "normal";
  if (roll.die !== "d20" || roll.values.length !== 1) return "normal";
  const face = roll.master ? roll.values[0] : roll.total;
  if (face === 20) return "crit";
  if (face === 1) return "fumble";
  return "normal";
}
