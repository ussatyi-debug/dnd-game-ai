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

export const HISTORY_TURNS_DEFAULT = 12;
export const HISTORY_TURNS_MIN = 6;
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

/**
 * Последние `turns` заявок игрока с ответами мастера; `current` — новая заявка (входит в счёт).
 * Раньше идущая часть диалога мастеру не нужна: её заменяет хроника.
 */
export function recentTurns<T extends { author: string }>(prior: T[], current: T, turns = historyTurns()): T[] {
  const players = prior.flatMap((m, i) => (m.author === "player" ? [i] : []));
  const keep = turns - 1;
  const start = keep <= 0 ? prior.length : players.length > keep ? players[players.length - keep] : 0;
  return [...prior.slice(start), current];
}

/** Сколько последних ходов уходят мастеру целиком; более ранние ответы сжимаются. */
export const VERBATIM_TURNS = 4;

/**
 * Сжатие истории: ранние ответы мастера сокращаются до первых фраз — подробности о них
 * мастер и так видит в хронике, базе знаний и снимке сцены. Заявки игрока не трогаются.
 */
export function compressHistory<T extends { role: string; text: string }>(
  items: T[],
  verbatim = VERBATIM_TURNS,
): T[] {
  const players = items.flatMap((m, i) => (m.role === "player" ? [i] : []));
  if (players.length <= verbatim) return items;
  const from = players[players.length - verbatim] ?? 0;
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
): { text: string; overflow: boolean } {
  const estimated = tokens ?? Math.round(chars / 3);
  const share = limit ? Math.round((estimated / limit) * 100) : null;
  const value = `${tokens === null ? "≈" : ""}${estimated.toLocaleString("ru-RU")} токенов`;
  const head = share === null ? `запрос ${value}` : `запрос ${value} (${share}% окна модели)`;
  // Кэш: провайдер не считает неизменное начало запроса заново и берёт за него дешевле.
  const cache =
    cached && cached > 0
      ? `, из них в кэше ${cached.toLocaleString("ru-RU")}${estimated > 0 ? ` (${Math.round((cached / estimated) * 100)}%)` : ""}`
      : "";
  return { text: `${head}${cache}`, overflow: share !== null && share > 80 };
}
