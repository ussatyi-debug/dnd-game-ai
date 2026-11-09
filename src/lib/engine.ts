// Типы и вызовы движка на Rust. Поля совпадают с сериализацией serde (snake_case).
//
// Движок работает в двух режимах с одним и тем же кодом на Rust:
// - в приложении — через команды Tauri;
// - в веб-версии — в браузере, через модуль, скомпилированный из Rust в JavaScript.

import type { CampaignSpec, HeroSpec } from "./heroSpec";
import { invoke } from "@tauri-apps/api/core";
import * as webModule from "engine-web-module";
import { createWebEngine, type WebEngine } from "./webBridge";

export type RestKind = "short" | "long";
export type Recovery = "short_rest" | "long_rest" | "one_on_short_rest" | "daily" | "manual";

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
  /** Настроение сцены — по нему выбирается фоновая музыка. */
  mood: Mood;
}

export type Mood = "calm" | "travel" | "battle";

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
export function masterContext(query: string, kbExtra: string): Promise<string> {
  return call<string>("master_context", { query, kbExtra });
}

export function takeRest(kind: RestKind): Promise<RestResult> {
  return call<RestResult>("take_rest", { kind });
}

// Книга заклинаний. Проверки правил — в движке; интерфейс только показывает и вызывает.

export type SpellClass = "bard" | "cleric" | "druid" | "paladin" | "ranger" | "sorcerer" | "warlock" | "wizard";
export type Preparation = "known" | "prepared" | "spellbook";
export type Progression = "full" | "half" | "half_2024" | "third" | "pact" | "innate";
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
  /** Лимит по таблице класса (правила 2024 года). */
  prepared_by_table: boolean;
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
  /** Броски d20 в тексте, которых движок не делал. */
  fabricated: string[];
}

/** Бросок, сделанный движком по запросу мастера. */
export interface MasterRoll {
  who: string;
  what: string;
  expression: string;
  dice: number[];
  total: number;
  target: string | null;
  outcome: string | null;
  /** Тайный бросок: игроку не показывается. */
  hidden: boolean;
  line: string;
  d20: number | null;
}

export interface RollRound {
  rolls: MasterRoll[];
  /** Сообщение мастеру с результатами. */
  feedback: string;
}

/** Исправленные мастером команды после отказов движка (веб-версия). */
export function masterRepair(text: string): Promise<MasterAction[]> {
  return call<MasterAction[]>("master_repair", { text });
}

/** Просьба к мастеру исправить отклонённые команды (как в движке). */
export function repairRequest(actions: MasterAction[]): string | null {
  const failed = actions.filter((a) => !a.ok);
  if (failed.length === 0) return null;
  return (
    "[ДВИЖОК] Эти команды не выполнены:\n" +
    failed.map((a) => `- ${a.summary}`).join("\n") +
    '\nПришли ТОЛЬКО исправленные команды в одном блоке ```engine, без рассказа. Формат — по кодексу: временные хиты — {"cmd":"hp","character":"…","temp":N}, id ресурсов — из «листы». Если команда не нужна — ответь пустым блоком ```engine```.'
  );
}

/** Выполняет запросы бросков из ответа мастера (веб-версия); `null` — запросов нет. */
export function masterRolls(text: string): Promise<RollRound | null> {
  return call<RollRound | null>("master_rolls", { text });
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
export function masterApply(text: string, rolled: number[], player: string): Promise<MasterTurn> {
  return call<MasterTurn>("master_apply", { text, rolled, player });
}

/** Текст ответа мастера без блоков команд движка (в т.ч. незакрытого, пока ответ печатается). */
export function stripEngineBlocks(text: string): string {
  return text.replace(/```engine[\s\S]*?(```|$)/g, "").trim();
}

// Полный лист, инвентарь, записи мастера и отмена его хода.

export type Ability = "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma";
export type ProficiencyLevel = "none" | "proficient" | "expertise";

export interface Bonus {
  label: string;
  value: number;
}

export interface SaveLine {
  ability: Ability;
  label: string;
  total: number;
  proficient: boolean;
  breakdown: Bonus[];
}

export interface SkillLine {
  skill: string;
  name: string;
  ability_label: string;
  total: number;
  proficiency: ProficiencyLevel;
  source: string;
  breakdown: Bonus[];
  advantage: string[];
  passive: number;
}

export interface AttackLine {
  name: string;
  to_hit: number;
  to_hit_breakdown: Bonus[];
  damage: string;
  range: string;
  notes: string;
  proficiency_unknown: boolean;
  /** КС спасброска для заклинаний без броска атаки. */
  save_dc: number | null;
  /** «МДР», «ЛОВ» — спасбросок цели. */
  save_label: string | null;
}

export interface Feature {
  name: string;
  source: string;
  text: string;
  resource_id: string | null;
}

export interface ProficiencyLine {
  kind: string;
  text: string;
  from_rules: boolean;
}

export interface Attunement {
  name: string;
  effect: string;
}

export interface HitDice {
  die: number;
  current: number;
  total: number;
}

export interface SheetDetails {
  background: string;
  alignment: string;
  xp: number | null;
  xp_next: number | null;
  appearance: string;
  saves: SaveLine[];
  save_notes: string[];
  skills_listed: boolean;
  skills: SkillLine[];
  passive_perception: number;
  passive_insight: number;
  passive_investigation: number;
  initiative_breakdown: Bonus[];
  armor_class_breakdown: Bonus[];
  hit_dice: HitDice[];
  attacks: AttackLine[];
  features: Feature[];
  proficiencies: ProficiencyLine[];
  attunement: Attunement[];
  attunement_note: string;
  conditions: string[];
  exhaustion: number;
  notes: string[];
  /** Ключи полей, изменённых игроком. */
  edited: string[];
  raw_attacks: AttackInput[];
}

/** Атака, как она записана в листе. */
export interface AttackInput {
  name: string;
  ability: Ability | null;
  caster_id: string | null;
  proficient: boolean | null;
  magic: number;
  damage_dice: string;
  damage_type: string;
  add_ability_to_damage: boolean;
  damage_bonus: number;
  extra: string;
  range: string;
  notes: string;
  /** Заклинание со спасброском цели вместо броска атаки. */
  save?: Ability | null;
}

/** Правка листа игроком (или предложенная мастером). */
export type SheetEditInput =
  | { op: "text"; field: string; value: string }
  | { op: "number"; field: string; value: number }
  | { op: "ability"; ability: Ability; score: number }
  | { op: "save"; ability: Ability; proficient: boolean }
  | { op: "skill"; skill: string; proficiency: ProficiencyLevel; source?: string }
  | { op: "proficiency"; kind: string; text: string }
  | { op: "feature"; name: string; source: string; text: string }
  | { op: "attunement"; name: string; effect: string; remove: boolean }
  | { op: "attack"; attack: AttackInput; remove: boolean };

export interface SheetProposal {
  id: number;
  character_id: string;
  character_name: string;
  edit: SheetEditInput;
  summary: string;
  reason: string;
}

export function editSheet(id: string, edit: SheetEditInput): Promise<boolean> {
  return call<boolean>("edit_sheet", { id, edit });
}

export function revertSheetEdit(id: string, key: string): Promise<boolean> {
  return call<boolean>("revert_sheet_edit", { id, key });
}

export function sheetProposals(): Promise<SheetProposal[]> {
  return call<SheetProposal[]>("sheet_proposals");
}

export function resolveProposal(id: number, accept: boolean): Promise<boolean> {
  return call<boolean>("resolve_proposal", { id, accept });
}

export interface ItemLine {
  id: string;
  name: string;
  quantity: number;
  notes: string;
  scroll: boolean;
}

export interface ItemGroup {
  category: string;
  items: ItemLine[];
}

export interface ContainerView {
  id: string;
  name: string;
  capacity: string;
  note: string;
  groups: ItemGroup[];
  item_count: number;
  treasury_name: string | null;
  treasury_total: number | null;
}

export interface InventoryView {
  character_id: string;
  containers: ContainerView[];
}

export type NoteLayer = "player" | "master";

export interface MasterNote {
  id: number;
  layer: NoteLayer;
  day: number;
  time: string | null;
  title: string;
  text: string;
  /** Карточка базы знаний, к которой относится запись. */
  card: string | null;
  /** Запись сделал игрок. */
  by_player: boolean;
  kind: NoteKind;
  /** День срабатывания таймера. */
  due_day: number | null;
  /** Таймер отработан. */
  done: boolean;
}

export type NoteKind = "event" | "secret" | "plan" | "timer";

export const NOTE_KIND_LABEL: Record<NoteKind, string> = {
  event: "событие",
  secret: "тайна",
  plan: "план NPC",
  timer: "таймер",
};

export interface CardFactInput {
  label: string;
  value: string;
}

/** Карточка базы, созданная по ходу игры. */
export interface CustomCard {
  id: string;
  layer: string;
  section: string;
  title: string;
  subtitle: string;
  summary: string;
  facts: CardFactInput[];
  status: string | null;
  day: number;
  by_player: boolean;
}

export interface CardDraftInput {
  layer?: string;
  section?: string;
  title?: string;
  subtitle?: string;
  summary?: string;
  facts?: CardFactInput[];
  status?: string;
}

export function customCards(): Promise<CustomCard[]> {
  return call<CustomCard[]>("custom_cards");
}

export function createCard(card: CardDraftInput): Promise<string> {
  return call<string>("create_card", { card });
}

export function updateCard(id: string, card: CardDraftInput): Promise<boolean> {
  return call<boolean>("update_card", { id, card });
}

export function deleteCard(id: string): Promise<boolean> {
  return call<boolean>("delete_card", { id });
}

/** Внешняя ссылка: в приложении — в системном браузере; `false` — открыть обычной ссылкой. */
export function openExternal(url: string): boolean {
  if (!isTauri()) return false;
  void invoke("open_url", { url });
  return true;
}

/** Статус карточки, изменённый по ходу игры. */
export interface KbOverride {
  card_id: string;
  status: string;
  note: string;
  day: number;
}

/** Карточка в указателе базы для движка. */
export interface KbCardIndex {
  id: string;
  title: string;
  layer: string;
  status: string | null;
}

export interface LoadReport {
  format_version: number;
  day: number;
  location: string;
  supplemented: string[];
}

export function setKbCards(cards: KbCardIndex[]): Promise<boolean> {
  return call<boolean>("set_kb_cards", { cards });
}

export function kbOverrides(): Promise<KbOverride[]> {
  return call<KbOverride[]>("kb_overrides");
}

export function addNote(
  layer: NoteLayer,
  title: string,
  text: string,
  card: string | null,
  kind: NoteKind = "event",
  dueDay: number | null = null,
): Promise<number> {
  return call<number>("add_note", { layer, title, text, card, kind, dueDay });
}

export function updateNote(
  id: number,
  edit: {
    title?: string;
    text?: string;
    card?: string;
    layer?: NoteLayer;
    kind?: NoteKind;
    dueDay?: number | null;
    done?: boolean;
  },
): Promise<MasterNote> {
  return call<MasterNote>("update_note", {
    id,
    title: edit.title ?? null,
    text: edit.text ?? null,
    card: edit.card ?? null,
    layer: edit.layer ?? null,
    kind: edit.kind ?? null,
    dueDay: edit.dueDay ?? null,
    done: edit.done ?? null,
  });
}

export function deleteNote(id: number): Promise<boolean> {
  return call<boolean>("delete_note", { id });
}

/** Загрузка сохранения: передаётся часть `engine` файла. */
export function loadState(save: unknown): Promise<LoadReport> {
  return call<LoadReport>("load_state", { save });
}

/** Проверка листа героя движком: список нарушений (пусто — лист в порядке). */
export function validateHero(spec: HeroSpec): Promise<string[]> {
  return call<string[]>("validate_hero", { spec });
}

/** Сцена начала новой кампании. */
export interface StartScene {
  day: number;
  time: string | null;
  location: string;
  situation: string;
  mood: Mood;
}

/** Новая своя кампания вместо текущей игры. */
export function startCampaign(campaign: CampaignSpec, scene: StartScene, gold: number): Promise<PartyView> {
  return call<PartyView>("start_campaign", { campaign, scene, gold });
}

/** Кампания «Дом Стрэндж» с начала. */
export function restartDemo(): Promise<PartyView> {
  return call<PartyView>("restart_demo");
}

export interface UndoInfo {
  actions: string[];
  available: boolean;
}

export function characterDetails(id: string): Promise<SheetDetails> {
  return call<SheetDetails>("character_details", { id });
}

export function inventory(id: string): Promise<InventoryView> {
  return call<InventoryView>("inventory", { id });
}

export function masterNotes(): Promise<MasterNote[]> {
  return call<MasterNote[]>("master_notes");
}

export function masterUndoInfo(): Promise<UndoInfo | null> {
  return call<UndoInfo | null>("master_undo_info");
}

/** Отменяет последний ход мастера; возвращает отменённые действия. */
export function undoMasterTurn(): Promise<string[]> {
  return call<string[]>("undo_master_turn");
}

export function signed(value: number): string {
  return value >= 0 ? `+${value}` : `−${Math.abs(value)}`;
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
  /** Подключён ли провайдер в этой версии. */
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
  /** Броски движка по запросам мастера за этот ход. */
  rolls: MasterRoll[];
  fabricated: string[];
  /** Все ответы модели за ход как есть (для журнала). */
  raw: string[];
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

export function aiChat(history: { role: ChatRole; text: string }[], kbExtra: string): Promise<MasterReply> {
  return invoke<MasterReply>("ai_chat", { history, kbExtra });
}

/** Сообщение об ошибке из ответа движка. */
export function errorText(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  return "Неизвестная ошибка движка";
}

/** Можно ли закрыть приложение кнопкой «Выход» (ПК; на Android выходят системной кнопкой). */
export function canExitApp(): boolean {
  return isTauri() && !/android/i.test(navigator.userAgent);
}

/** Закрыть приложение. */
export function exitApp(): Promise<void> {
  return invoke<void>("exit_app", {});
}
