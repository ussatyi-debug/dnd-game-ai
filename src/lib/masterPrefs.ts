// Настройки хода мастера: двухшаговый ход и длина истории диалога.
//
// Двухшаговый ход: мастер сначала рассказывает сцену (игрок видит её сразу), затем вторым
// запросом модель переводит рассказ в команды движка. Слабым моделям так проще: каждый шаг —
// одна задача. По умолчанию включён для локальных моделей и Яндекса.
//
// История: мастеру уходят последние N заявок игрока с ответами; раньше — хроника по дням.

/** Кто ведёт мастера: провайдер приложения или Claude внутри Claude. */
export type MasterEngine = "gemini" | "openai" | "yandex" | "local" | "claude";

export const MASTER_ENGINE_LABEL: Record<MasterEngine, string> = {
  gemini: "Gemini",
  openai: "ChatGPT",
  yandex: "YandexGPT",
  local: "локальная модель",
  claude: "Claude",
};

const TWO_STEP_DEFAULT: Record<MasterEngine, boolean> = {
  gemini: false,
  openai: false,
  yandex: true,
  local: true,
  claude: false,
};

export const HISTORY_TURNS_DEFAULT = 12;
export const HISTORY_TURNS_MIN = 6;
export const HISTORY_TURNS_MAX = 20;

/** Сколько ждать второй шаг, прежде чем предложить не ждать его. */
export const UPDATE_TIMEOUT_MS = 60_000;

const TWO_STEP_KEY = "dnd.twoStep";
const HISTORY_KEY = "dnd.historyTurns";

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

/** Размер запроса для «Логирования»: токены от провайдера или оценка по символам. */
export function promptSize(tokens: number | null, chars: number, limit: number | null): { text: string; overflow: boolean } {
  const estimated = tokens ?? Math.round(chars / 3);
  const share = limit ? Math.round((estimated / limit) * 100) : null;
  const value = `${tokens === null ? "≈" : ""}${estimated.toLocaleString("ru-RU")} токенов`;
  return {
    text: share === null ? `запрос ${value}` : `запрос ${value} (${share}% окна модели)`,
    overflow: share !== null && share > 80,
  };
}
