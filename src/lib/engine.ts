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

export type CharacterKind = "player" | "companion" | "familiar";

export interface CharacterSheet {
  id: string;
  kind: CharacterKind;
  name: string;
  title: string;
  race: string;
  location: string;
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
  kind: RestKind;
  characters: { id: string; name: string; restored: string[] }[];
}

export interface Scene {
  day: number;
  time: string | null;
  location: string;
}

export interface PartyMember {
  id: string;
  kind: CharacterKind;
  name: string;
  summary: string;
  level: number;
  hit_points: HitPoints;
  armor_class: number;
  location: string;
  in_scene: boolean;
  key_resources: ResourcePool[];
}

export interface PartyView {
  scene: Scene;
  members: PartyMember[];
  treasury_name: string;
  treasury_total: number;
}

export type AssetKind = "coin" | "gem" | "ingot" | "note" | "valuable";
export type EntrySource = "opening" | "master" | "manual";

export interface HoldingLine {
  asset_id: string;
  name: string;
  kind: AssetKind;
  quantity: number;
  unit_value: number;
  total: number;
}

export interface LocationView {
  id: string;
  name: string;
  lines: HoldingLine[];
  total: number;
}

export interface EntryView {
  id: number;
  day: number;
  time: string | null;
  asset_name: string;
  kind: AssetKind;
  location_name: string;
  quantity: number;
  value: number;
  reason: string;
  source: EntrySource;
  transfer: number | null;
}

export interface TreasuryView {
  name: string;
  locations: LocationView[];
  by_kind: { kind: AssetKind; label: string; total: number }[];
  total: number;
  entries: EntryView[];
  assets: { id: string; name: string; kind: AssetKind; unit_value: number }[];
  storage: { id: string; name: string }[];
}

/** Стоимость в медных монетах → строка в ЗМ. */
export function formatGold(copper: number): string {
  const gold = copper / 100;
  const text = Number.isInteger(gold)
    ? gold.toLocaleString("ru-RU")
    : gold.toLocaleString("ru-RU", { maximumFractionDigits: 2 });
  return `${text} ЗМ`;
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

export function characterSheet(id: string): Promise<CharacterSheet> {
  return call<CharacterSheet>("character_sheet", { id });
}

export function partyView(): Promise<PartyView> {
  return call<PartyView>("party");
}

export function treasuryView(): Promise<TreasuryView> {
  return call<TreasuryView>("treasury");
}

export function addManualTreasuryEntry(
  assetId: string,
  locationId: string,
  quantity: number,
  reason: string,
): Promise<TreasuryView> {
  return call<TreasuryView>("treasury_add_manual", { assetId, locationId, quantity, reason });
}

export function saveState(): Promise<unknown> {
  return call<unknown>("save_state");
}

export function takeRest(kind: RestKind): Promise<RestResult> {
  return call<RestResult>("take_rest", { kind });
}

// ИИ-мастер работает только в приложении: запросы к провайдерам и ключи — на стороне Rust.

export type Provider = "gemini";
export type ChatRole = "player" | "master";

export interface AiSettingsView {
  provider: Provider;
  provider_label: string;
  model: string | null;
  has_key: boolean;
  key_hint: string | null;
}

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  input_token_limit: number | null;
}

export interface MasterReply {
  text: string;
  provider: Provider;
  model: string;
}

/** Доступен ли ИИ-мастер (только в приложении). */
export function isAiAvailable(): boolean {
  return isTauri();
}

export function aiSettings(): Promise<AiSettingsView> {
  return invoke<AiSettingsView>("ai_settings");
}

export function aiSetKey(provider: Provider, key: string): Promise<AiSettingsView> {
  return invoke<AiSettingsView>("ai_set_key", { provider, key });
}

export function aiSelectModel(provider: Provider, model: string): Promise<AiSettingsView> {
  return invoke<AiSettingsView>("ai_select_model", { provider, model });
}

export function aiListModels(provider: Provider): Promise<ModelInfo[]> {
  return invoke<ModelInfo[]>("ai_list_models", { provider });
}

export function aiChat(history: { role: ChatRole; text: string }[]): Promise<MasterReply> {
  return invoke<MasterReply>("ai_chat", { history });
}

/** Сообщение об ошибке из ответа движка. */
export function errorText(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "Неизвестная ошибка движка";
}
