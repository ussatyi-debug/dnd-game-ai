// Настройки хода мастера: двухшаговый ход и длина истории диалога.
//
// Двухшаговый ход: мастер сначала рассказывает сцену (игрок видит её сразу), затем вторым
// запросом модель переводит рассказ в команды движка. Слабым моделям так проще: каждый шаг —
// одна задача. По умолчанию включён для локальных моделей и Яндекса.
//
// История: мастеру уходят последние N заявок игрока с ответами; раньше — хроника по дням.

/** Кто ведёт мастера: провайдер приложения или Claude внутри Claude. */
export type MasterEngine = "gemini" | "openai" | "anthropic" | "yandex" | "local" | "claude";

export const MASTER_ENGINE_LABEL: Record<MasterEngine, string> = {
  gemini: "Gemini",
  openai: "ChatGPT",
  yandex: "YandexGPT",
  local: "локальная модель",
  anthropic: "Claude по API",
  claude: "Claude",
};

const TWO_STEP_DEFAULT: Record<MasterEngine, boolean> = {
  gemini: false,
  openai: false,
  yandex: true,
  local: true,
  anthropic: false,
  claude: false,
};

export const HISTORY_TURNS_DEFAULT = 6;
export const HISTORY_TURNS_MIN = 4;
export const HISTORY_TURNS_MAX = 20;

/** Сколько ждать второй шаг, прежде чем предложить не ждать его. */
export const UPDATE_TIMEOUT_MS = 60_000;

const TWO_STEP_KEY = "dnd.twoStep";
const HISTORY_KEY = "dnd.historyTurns";
const SKIP_UPDATE_KEY = "dnd.skipEmptyUpdate";
const ENTER_SENDS_KEY = "dnd.enterSends";
const SHORT_SHEET_KEY = "dnd.shortSheet";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Хранилище недоступно — настройка действует до перезапуска.
  }
}

/** Двухшаговый ход для этого мастера. */
export function twoStepFor(engine: MasterEngine): boolean {
  const stored = read<Partial<Record<MasterEngine, boolean>>>(TWO_STEP_KEY, {});
  return stored[engine] ?? TWO_STEP_DEFAULT[engine];
}

export function setTwoStep(engine: MasterEngine, on: boolean) {
  const stored = read<Partial<Record<MasterEngine, boolean>>>(TWO_STEP_KEY, {});
  write(TWO_STEP_KEY, { ...stored, [engine]: on });
}

/** Сколько последних заявок игрока уходит мастеру. */
export function historyTurns(): number {
  const n = Number(read<number>(HISTORY_KEY, HISTORY_TURNS_DEFAULT));
  if (!Number.isFinite(n)) return HISTORY_TURNS_DEFAULT;
  return Math.min(HISTORY_TURNS_MAX, Math.max(HISTORY_TURNS_MIN, Math.round(n)));
}

export function setHistoryTurns(n: number) {
  write(HISTORY_KEY, Math.min(HISTORY_TURNS_MAX, Math.max(HISTORY_TURNS_MIN, Math.round(n))));
}

/** Enter отправляет заявку (перенос строки — Shift+Enter). По умолчанию выключено. */
export function enterSends(): boolean {
  return read<boolean>(ENTER_SENDS_KEY, false);
}

export function setEnterSends(on: boolean) {
  write(ENTER_SENDS_KEY, on);
}

/**
 * Экономия: пропуск второго шага, когда мастер сам пометил ход как «без изменений».
 * Для сильных моделей — меньше запросов; слабая может пометить ход ошибочно, и изменения
 * потеряются, поэтому по умолчанию выключено.
 */
export function skipEmptyUpdate(): boolean {
  return read<boolean>(SKIP_UPDATE_KEY, false);
}

export function setSkipEmptyUpdate(on: boolean) {
  write(SKIP_UPDATE_KEY, on);
}

/**
 * Экономия: короткий лист в снимке — описания умений и заклинаний только для того, что
 * названо в заявке. Для сильных моделей; слабая реже спрашивает движок о подробностях.
 */
export function shortSheet(): boolean {
  return read<boolean>(SHORT_SHEET_KEY, false);
}

export function setShortSheet(on: boolean) {
  write(SHORT_SHEET_KEY, on);
}

/** Длина рассказа мастера: ответ модели дороже запроса, краткий рассказ — главная экономия. */
export type Narration = "short" | "normal" | "long";
const NARRATION_KEY = "dnd.narration";

export function narration(): Narration {
  const v = read<string>(NARRATION_KEY, "normal");
  return v === "short" || v === "long" ? v : "normal";
}

export function setNarration(v: Narration) {
  write(NARRATION_KEY, v);
}

/**
 * На сколько заявок сразу сдвигается начало истории. Начало запроса меняется только раз в
 * HISTORY_STEP ходов, а между сдвигами история лишь дописывается — поэтому её можно кэшировать
 * (у Claude — меткой кэша, у OpenAI кэш по совпадению начала запроса срабатывает сам).
 */
export const HISTORY_STEP = 4;

/**
 * Последние заявки игрока с ответами мастера; `current` — новая заявка (входит в счёт).
 * Заявок уходит от `turns` до `turns + HISTORY_STEP - 1`: начало истории сдвигается порциями.
 * Раньше идущая часть диалога мастеру не нужна: её заменяет хроника.
 */
export function recentTurns<T extends { author: string }>(prior: T[], current: T, turns = historyTurns()): T[] {
  const players = prior.flatMap((m, i) => (m.author === "player" ? [i] : []));
  const keep = Math.max(0, turns - 1);
  if (players.length <= keep) return [...prior, current];
  // Отбрасываем ранние заявки целыми порциями — начало истории стоит на месте HISTORY_STEP ходов.
  const drop = Math.ceil((players.length - keep) / HISTORY_STEP) * HISTORY_STEP - (HISTORY_STEP - 1);
  const dropped = Math.min(players.length, Math.max(0, drop));
  const start = dropped >= players.length ? prior.length : (players[dropped] ?? prior.length);
  return [...prior.slice(start), current];
}

/** Сколько последних ходов уходят мастеру целиком; более ранние ответы сжимаются. */
export const VERBATIM_TURNS = 4;

/**
 * Сжатие истории: ранние ответы мастера сокращаются до первых фраз — подробности о них
 * мастер и так видит в хронике, базе знаний и снимке сцены. Заявки игрока не трогаются.
 *
 * Сжимается постоянное число первых ходов окна (`turns - verbatim`), а не «всё, кроме
 * последних», — так уже отправленная часть истории не меняется, пока окно не сдвинется
 * порцией, и кэш начала запроса не сбрасывается каждый ход.
 */
export function compressHistory<T extends { role: string; text: string }>(
  items: T[],
  verbatim = VERBATIM_TURNS,
  turns = historyTurns(),
): T[] {
  const players = items.flatMap((m, i) => (m.role === "player" ? [i] : []));
  const compressed = Math.max(0, turns - verbatim);
  if (compressed === 0 || players.length <= verbatim) return items;
  // Граница — начало хода номер `compressed` в окне (или конец окна, если ходов меньше).
  const from = players[Math.min(compressed, players.length - 1)] ?? 0;
  return items.map((m, i) => {
    if (i >= from || m.role !== "master" || m.text.length <= 320) return m;
    const sentences = m.text.replace(/\s+/g, " ").match(/[^.!?]+[.!?]+/g) ?? [m.text];
    const short = sentences.slice(0, 2).join(" ").trim().slice(0, 300);
    return { ...m, text: `${short} […]` };
  });
}

/** Размер запроса для «Логирования»: токены от провайдера или оценка по символам. */
export function promptSize(
  tokens: number | null,
  chars: number,
  limit: number | null,
  cached: number | null = null,
  cacheWrite: number | null = null,
): { text: string; overflow: boolean } {
  const estimated = tokens ?? Math.round(chars / 3);
  const share = limit ? Math.round((estimated / limit) * 100) : null;
  const value = `${tokens === null ? "≈" : ""}${estimated.toLocaleString("ru-RU")} токенов`;
  const head = share === null ? `запрос ${value}` : `запрос ${value} (${share}% окна модели)`;
  // Кэш: провайдер не считает неизменное начало запроса заново и берёт за него дешевле.
  const cache =
    cached && cached > 0
      ? `, из них в кэше ${cached.toLocaleString("ru-RU")}${estimated > 0 ? ` (${Math.round((cached / estimated) * 100)}%)` : ""}`
      : cacheWrite && cacheWrite > 0
        ? `, кэш записан (${cacheWrite.toLocaleString("ru-RU")})`
        : "";
  return { text: `${head}${cache}`, overflow: share !== null && share > 80 };
}

/** Учёт токенов одного шага хода — то, что приходит от движка вместе с ответом мастера. */
export interface StepUsage {
  provider?: string;
  prompt_tokens: number | null;
  prompt_chars: number;
  cached_tokens: number | null;
  cache_write_tokens: number | null;
  output_tokens?: number | null;
  fresh_tokens?: number | null;
  requests?: number;
  blocks?: { name: string; chars: number }[];
}

/**
 * Во сколько обходится токен кэша относительно обычного входа: чтение и запись. Claude —
 * часовой кэш (чтение 0,1×, запись 2×); OpenAI — чтение около 0,1×, запись бесплатно;
 * Gemini — чтение около 0,25×. Остальные провайдеры кэш не продают отдельно.
 */
const CACHE_PRICE: Record<string, { read: number; write: number }> = {
  anthropic: { read: 0.1, write: 2 },
  openai: { read: 0.1, write: 1 },
  gemini: { read: 0.25, write: 1 },
};

const fmt = (n: number) => Math.round(n).toLocaleString("ru-RU");

/**
 * Строка для «Логирования»: свежая часть, кэш, ответ и цена шага в «токенах входа» —
 * сколько обычных входных токенов стоил бы шаг (ответ модели считается отдельно: он
 * дороже входа в несколько раз, и множитель у каждой модели свой).
 */
export function usageLine(u: StepUsage): string {
  const read = u.cached_tokens ?? 0;
  const write = u.cache_write_tokens ?? 0;
  const fresh = u.fresh_tokens ?? (u.prompt_tokens === null ? null : Math.max(0, u.prompt_tokens - read - write));
  const price = CACHE_PRICE[u.provider ?? ""] ?? { read: 1, write: 1 };
  const parts: string[] = [];
  if (fresh !== null) parts.push(`свежих ${fmt(fresh)}`);
  if (read > 0) parts.push(`из кэша ${fmt(read)}`);
  if (write > 0) parts.push(`запись кэша ${fmt(write)}`);
  if (u.output_tokens) parts.push(`ответ ${fmt(u.output_tokens)}`);
  if (u.requests && u.requests > 1) parts.push(`запросов ${u.requests}`);
  if (fresh !== null) {
    const cost = fresh + read * price.read + write * price.write;
    parts.push(`цена входа ≈ ${fmt(cost)} ток.`);
  }
  return parts.join(" · ");
}

/** Разбивка запроса по блокам: символы и оценка в токенах (по доле в размере запроса). */
export function blocksLine(u: StepUsage): string {
  if (!u.blocks || u.blocks.length === 0) return "";
  const perChar = u.prompt_tokens && u.prompt_chars > 0 ? u.prompt_tokens / u.prompt_chars : 1 / 3;
  return u.blocks
    .map((b) => `${b.name}: ${fmt(b.chars)} симв. (≈${fmt(b.chars * perChar)} ток.)`)
    .join("; ");
}
