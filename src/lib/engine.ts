// Типы и вызовы движка на Rust. Поля совпадают с сериализацией serde (snake_case).
//
// Движок работает в двух режимах с одним и тем же кодом на Rust:
// - в приложении — через команды Tauri;
// - в веб-версии — в браузере, через модуль, скомпилированный из Rust в JavaScript.

import { invoke } from "@tauri-apps/api/core";
import * as webModule from "engine-web-module";
import { createWebEngine, type WebEngine } from "./webBridge";

export type RestKind = "short" | "long";
export type Recovery = "short_rest" | "long_rest" | "daily" | "manual";

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

export interface ClassLevel {
  class: string;
  subclass: string | null;
  level: number;
}

export interface AbilityLine {
  ability: string;
  label: string;
  score: number;
  modifier: number;
}

export interface HitPoints {
  current: number;
  max: number;
  temporary: number;
}

export interface CharacterSheet {
  id: string;
  name: string;
  title: string;
  classes: ClassLevel[];
  level: number;
  proficiency_bonus: number;
  abilities: AbilityLine[];
  hit_points: HitPoints;
  armor_class: number;
  initiative: number;
  speed_ft: number;
  resources: ResourcePool[];
}

export interface LuckyReroll {
  value: number;
  lucky: ResourcePool;
}

export interface RestResult {
  restored: string[];
  sheet: CharacterSheet;
}

/** ID ресурса черты «Везунчик» (совпадает с движком). */
export const LUCKY_ID = "feat.lucky";

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

/** Бросок кубов лотка, например `3d6`. */
export function rollDice(count: number, sides: number): Promise<ExprRoll> {
  return call<ExprRoll>("roll_expression", { expression: `${count}d${sides}`, critical: false });
}

/** Переброс d20 чертой «Везунчик». */
export function luckyReroll(): Promise<LuckyReroll> {
  return call<LuckyReroll>("lucky_reroll");
}

export function characterSheet(): Promise<CharacterSheet> {
  return call<CharacterSheet>("character_sheet");
}

export function takeRest(kind: RestKind): Promise<RestResult> {
  return call<RestResult>("take_rest", { kind });
}

/** Сообщение об ошибке из ответа движка. */
export function errorText(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "Неизвестная ошибка движка";
}
