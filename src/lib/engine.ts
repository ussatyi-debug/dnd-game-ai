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
  /** Обстановка: что было накануне и что запланировано. */
  situation: string;
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

/** ID пула ячеек договора колдуна (совпадает с движком). */
export const PACT_SLOTS_ID = "pact.slots";

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

/** Кодекс мастера и состояние игры на этот ход (с новыми кубами мастера). */
export function masterContext(): Promise<string> {
  return call<string>("master_context");
}

export function takeRest(kind: RestKind): Promise<RestResult> {
  return call<RestResult>("take_rest", { kind });
}

// Книга заклинаний. Проверки правил — в движке; интерфейс только показывает и вызывает.

export type SpellClass = "bard" | "cleric" | "druid" | "paladin" | "ranger" | "sorcerer" | "warlock" | "wizard";
export type Preparation = "known" | "prepared" | "spellbook";
export type Progression = "full" | "half" | "third" | "pact";
export type CastMethod = "cantrip" | "slot" | "pact" | "ritual" | "granted" | "scroll";
export type SlotRef = "pact" | { level: number };

export interface SpellEntry {
  id: string;
  name: string;
  level: number;
  ritual: boolean;
  concentration: boolean;
  ready: boolean;
  always: boolean;
  tag: string | null;
}

export interface SlotView {
  level: number;
  pact: boolean;
  pool: ResourcePool;
}

export interface CasterView {
  id: string;
  label: string;
  class: SpellClass;
  ability: string;
  ability_label: string;
  save_dc: number;
  attack_bonus: number;
  item_bonus_source: string | null;
  preparation: Preparation;
  progression: Progression;
  max_spell_level: number;
  cantrips: SpellEntry[];
  max_cantrips: number;
  spells: SpellEntry[];
  known_count: number | null;
  max_known: number | null;
  prepared_count: number | null;
  prepared_limit: number | null;
  over_limit: boolean;
  spellbook: SpellEntry[];
}

export interface GrantedView {
  spell: SpellEntry;
  source: string;
  cast_level: number;
  uses: ResourcePool | null;
  /** Можно ли накладывать и своими ячейками (черты «Затронутый Тенью» и т. п.). */
  slots_allowed: boolean;
}

export interface ScrollView {
  spell: SpellEntry;
  level: number;
  count: number;
  usable: boolean;
  check_dc: number | null;
}

export interface RestorerView {
  label: string;
  max_level: number;
  pact_only: boolean;
  uses: ResourcePool;
}

export interface SpellbookView {
  character_id: string;
  can_prepare: boolean;
  slots: SlotView[];
  casters: CasterView[];
  granted: GrantedView[];
  scrolls: ScrollView[];
  restorers: RestorerView[];
}

export interface CastOutcome {
  character_id: string;
  character_name: string;
  spell_id: string;
  spell_name: string;
  spell_level: number;
  cast_level: number;
  method: CastMethod;
  spent: ResourcePool | null;
  scrolls_left: number | null;
  check_dc: number | null;
  concentration: boolean;
  save_dc: number | null;
  attack_bonus: number | null;
  summary: string;
}

export interface SlotRestoreOutcome {
  slot: ResourcePool;
  item: ResourcePool;
  summary: string;
}

export interface MasterAction {
  ok: boolean;
  summary: string;
}

export interface MasterTurn {
  text: string;
  actions: MasterAction[];
}

export function spellbook(id: string): Promise<SpellbookView> {
  return call<SpellbookView>("spellbook", { id });
}

export function preparationOptions(id: string, casterId: string): Promise<SpellEntry[]> {
  return call<SpellEntry[]>("preparation_options", { id, casterId });
}

export function prepareSpells(id: string, casterId: string, spells: string[]): Promise<SpellbookView> {
  return call<SpellbookView>("prepare_spells", { id, casterId, spells });
}

export function castSpell(
  id: string,
  spellId: string,
  method: CastMethod | null,
  slotLevel: number | null,
): Promise<CastOutcome> {
  return call<CastOutcome>("cast_spell", { id, spellId, method, slotLevel });
}

/** Ручная трата (`spend = true`) или возврат ячейки. */
export function changeSlot(id: string, slot: SlotRef, spend: boolean): Promise<SpellbookView> {
  return call<SpellbookView>("change_slot", { id, slot, spend });
}

export function restoreSlot(id: string, itemId: string, slot: SlotRef): Promise<SlotRestoreOutcome> {
  return call<SlotRestoreOutcome>("restore_slot", { id, itemId, slot });
}

/** Выполняет команды движка из ответа мастера (веб-версия; в приложении — на стороне Rust). */
export function masterApply(text: string): Promise<MasterTurn> {
  return call<MasterTurn>("master_apply", { text });
}

/** Текст ответа мастера без блоков команд движка (в т.ч. незакрытого, пока ответ печатается). */
export function stripEngineBlocks(text: string): string {
  return text.replace(/```engine[\s\S]*?(```|$)/g, "").trim();
}

// ИИ-мастер работает только в приложении: запросы к провайдерам и ключи — на стороне Rust.

export type Provider = "gemini" | "openai" | "local";
export type ChatRole = "player" | "master";

export interface AiSettingsView {
  provider: Provider;
  provider_label: string;
  model: string | null;
  has_key: boolean;
  key_hint: string | null;
  providers: ProviderView[];
}

export interface ProviderView {
  provider: Provider;
  label: string;
  /** Подключён ли провайдер в этой версии (локальная модель — пока нет). */
  ready: boolean;
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
  actions: MasterAction[];
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
