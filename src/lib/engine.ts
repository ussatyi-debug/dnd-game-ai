// Типы и вызовы движка на Rust. Поля совпадают с сериализацией serde (snake_case).
//
// Движок работает в двух режимах с одним и тем же кодом на Rust:
// - в приложении — через команды Tauri;
// - в веб-версии — в браузере, через модуль, скомпилированный из Rust в JavaScript.

import { invoke } from "@tauri-apps/api/core";
import * as webModule from "engine-web-module";
import { createWebEngine, type WebEngine } from "./webBridge";

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

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/** Веб-сборка с движком, работающим прямо в браузере. */
export const isWebBuild = import.meta.env.MODE === "web";

/** Доступен ли движок: внутри приложения или в веб-сборке. */
export function isEngineAvailable(): boolean {
  return isTauri() || isWebBuild;
}

let webEngine: WebEngine | null = null;

function getWebEngine(): WebEngine {
  if (!webEngine) {
    const seed = crypto.getRandomValues(new Uint32Array(2));
    webEngine = createWebEngine(webModule, [seed[0] ?? 0, seed[1] ?? 0]);
  }
  return webEngine;
}

/** Вызов команды движка. Имена команд и аргументов одинаковы для обоих режимов. */
async function call<T>(cmd: string, args: Record<string, unknown> = {}): Promise<T> {
  if (isTauri()) {
    return invoke<T>(cmd, args);
  }
  return getWebEngine().call<T>({ cmd, ...args });
}

export function rollExpression(expression: string, critical: boolean): Promise<ExprRoll> {
  return call<ExprRoll>("roll_expression", { expression, critical });
}

export function rollCheck(
  mode: RollMode,
  modifiers: Modifier[],
  critThreshold: number,
): Promise<D20Roll> {
  return call<D20Roll>("roll_check", { mode, modifiers, critThreshold });
}

export function submitPlayerRoll(
  input: string,
  mode: RollMode,
  modifiers: Modifier[],
  critThreshold: number,
): Promise<D20Roll> {
  return call<D20Roll>("submit_player_roll", { input, mode, modifiers, critThreshold });
}

export function luckyStatus(): Promise<ResourcePool> {
  return call<ResourcePool>("lucky_status");
}

export function takeRest(kind: RestKind): Promise<ResourcePool> {
  return call<ResourcePool>("take_rest", { kind });
}

/** Сообщение об ошибке из ответа движка. */
export function errorText(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "Неизвестная ошибка движка";
}

/** Текстовая разбивка броска d20 для лога. */
export function describeD20(roll: D20Roll): string {
  const modeText =
    roll.mode === "advantage" ? "с преимуществом" : roll.mode === "disadvantage" ? "с помехой" : "";
  let dice: string;
  if (roll.source === "player") {
    // Игрок сообщает уже засчитанный куб, поэтому показываем одно значение.
    const notes = ["свой куб", modeText, roll.lucky_used ? "везунчик" : ""].filter(Boolean);
    dice = `d20: ${roll.natural} (${notes.join(", ")})`;
  } else if (roll.mode === "normal") {
    dice = `d20: ${roll.natural}`;
  } else {
    dice = `d20 ${modeText} [${roll.dice.join(", ")}] → ${roll.natural}`;
  }
  const mods = roll.modifiers
    .map((m) => ` ${m.value < 0 ? "−" : "+"} ${m.label} ${Math.abs(m.value)}`)
    .join("");
  const mark = roll.critical ? " — КРИТ" : roll.fumble ? " — натуральная 1" : "";
  return `${dice}${mods} = ${roll.total}${mark}`;
}

/** Текстовая разбивка броска выражения для лога. */
export function describeExpr(roll: ExprRoll): string {
  const groups = roll.groups
    .map((g) => `${g.negative ? "−" : ""}${g.count}d${g.sides} [${g.values.join(", ")}]`)
    .join(" + ");
  const flat = roll.flat === 0 ? "" : ` ${roll.flat < 0 ? "−" : "+"} ${Math.abs(roll.flat)}`;
  return `${groups}${flat} = ${roll.total}`;
}
