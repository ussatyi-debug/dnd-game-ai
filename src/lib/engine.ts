// Типы и вызовы движка на Rust. Поля совпадают с сериализацией serde (snake_case).

import { invoke } from "@tauri-apps/api/core";

export type RollMode = "normal" | "advantage" | "disadvantage";
export type RollSource = "engine" | "player";
export type RestKind = "short" | "long";
export type Recovery = "short_rest" | "long_rest" | "daily" | "manual";

export interface Modifier {
  label: string;
  value: number;
}

export interface D20Roll {
  mode: RollMode;
  dice: number[];
  natural: number;
  modifiers: Modifier[];
  modifier_total: number;
  total: number;
  crit_threshold: number;
  critical: boolean;
  fumble: boolean;
  source: RollSource;
  lucky_used: boolean;
}

export interface DiceGroupRoll {
  count: number;
  sides: number;
  negative: boolean;
  values: number[];
  subtotal: number;
}

export interface ExprRoll {
  expression: string;
  groups: DiceGroupRoll[];
  flat: number;
  total: number;
  critical: boolean;
}

export interface ResourcePool {
  id: string;
  name: string;
  current: number;
  max: number;
  recovery: Recovery;
}

/** Запущен ли интерфейс внутри приложения Tauri (а не в обычном браузере). */
export function isEngineAvailable(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export function rollExpression(expression: string, critical: boolean): Promise<ExprRoll> {
  return invoke<ExprRoll>("roll_expression", { expression, critical });
}

export function rollCheck(
  mode: RollMode,
  modifiers: Modifier[],
  critThreshold: number,
): Promise<D20Roll> {
  return invoke<D20Roll>("roll_check", { mode, modifiers, critThreshold });
}

export function submitPlayerRoll(
  input: string,
  mode: RollMode,
  modifiers: Modifier[],
  critThreshold: number,
): Promise<D20Roll> {
  return invoke<D20Roll>("submit_player_roll", { input, mode, modifiers, critThreshold });
}

export function luckyStatus(): Promise<ResourcePool> {
  return invoke<ResourcePool>("lucky_status");
}

export function takeRest(kind: RestKind): Promise<ResourcePool> {
  return invoke<ResourcePool>("take_rest", { kind });
}

/** Сообщение об ошибке из ответа движка. */
export function errorText(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "Неизвестная ошибка движка";
}

/** Текстовая разбивка броска d20 для лога. */
export function describeD20(roll: D20Roll): string {
  const dice =
    roll.mode === "normal"
      ? `d20: ${roll.natural}`
      : `d20 ${roll.mode === "advantage" ? "с преимуществом" : "с помехой"} [${roll.dice.join(", ")}] → ${roll.natural}`;
  const lucky = roll.lucky_used ? " (везунчик)" : "";
  const mods = roll.modifiers
    .map((m) => ` ${m.value < 0 ? "−" : "+"} ${m.label} ${Math.abs(m.value)}`)
    .join("");
  return `${dice}${lucky}${mods} = ${roll.total}`;
}

/** Текстовая разбивка броска выражения для лога. */
export function describeExpr(roll: ExprRoll): string {
  const groups = roll.groups
    .map((g) => `${g.negative ? "−" : ""}${g.count}d${g.sides} [${g.values.join(", ")}]`)
    .join(" + ");
  const flat = roll.flat === 0 ? "" : ` ${roll.flat < 0 ? "−" : "+"} ${Math.abs(roll.flat)}`;
  return `${groups}${flat} = ${roll.total}`;
}
