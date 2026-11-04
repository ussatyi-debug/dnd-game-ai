// Мастер на Claude для веб-версии, открытой внутри Claude.
//
// Страница обращается к Claude через возможность `sample` — от имени аккаунта того, кто её
// открыл (первый запрос спрашивает разрешение). Ключи не нужны. В приложении для ПК этой
// возможности нет — там мастер работает через провайдеров на стороне Rust.

export type ClaudeTier = "quick" | "default" | "complex";

export const CLAUDE_TIERS: { id: ClaudeTier; name: string; hint: string }[] = [
  { id: "quick", name: "Claude — быстрый", hint: "отвечает почти сразу, проще в описаниях" },
  { id: "default", name: "Claude — стандартный", hint: "баланс скорости и качества (рекомендую)" },
  { id: "complex", name: "Claude — сильный", hint: "самый вдумчивый, отвечает дольше" },
];

interface SampleError {
  code: string;
  message: string;
  text?: string;
}

interface SampleOptions {
  onText?: (update: { text: string; delta: string }) => void;
  signal?: AbortSignal;
  modelTier?: ClaudeTier;
  cache?: boolean;
}

type SampleFn = (
  input: { role: "user" | "assistant"; content: string }[],
  options?: SampleOptions,
) => Promise<{ text: string; truncated: boolean }>;

interface DownloadsApi {
  save(file: { filename: string; data: string | Blob }): Promise<unknown>;
}

interface ClaudeRuntime {
  use(name: string): Promise<unknown>;
}

declare global {
  interface Window {
    claude?: ClaudeRuntime;
  }
}

function runtime(): ClaudeRuntime | null {
  return typeof window !== "undefined" && window.claude ? window.claude : null;
}

/** Функция запроса к Claude или `null`, если страница открыта не внутри Claude. */
export async function getSample(): Promise<SampleFn | null> {
  const rt = runtime();
  if (!rt) return null;
  try {
    return ((await rt.use("sample")) as SampleFn | null) ?? null;
  } catch {
    return null;
  }
}

/** Сохранение файла через Claude или `null`, если недоступно. */
export async function getDownloads(): Promise<DownloadsApi | null> {
  const rt = runtime();
  if (!rt) return null;
  try {
    return ((await rt.use("downloads")) as DownloadsApi | null) ?? null;
  } catch {
    return null;
  }
}

function isSampleError(value: unknown): value is SampleError {
  return typeof value === "object" && value !== null && "code" in value;
}

/** Понятное игроку объяснение ошибки Claude. */
export function sampleErrorText(error: unknown): string {
  if (!isSampleError(error)) return "Мастер не ответил — попробуйте ещё раз";
  switch (error.code) {
    case "not_granted":
      return "Доступ к Claude не разрешён для этой страницы. Разрешите его в окне запроса, обновив страницу.";
    case "rate_limited":
      return "Слишком много запросов или исчерпан лимит Claude. Подождите немного и отправьте заявку снова.";
    case "session_expired":
      return "Сессия Claude истекла — войдите снова.";
    case "sampling_disabled":
    case "capability_disabled":
    case "not_declared":
      return "Claude недоступен на этой странице для вашего аккаунта.";
    case "prompt_too_large":
      return "Диалог стал слишком длинным для одного запроса. Очистите старую часть чата.";
    case "refused":
      return "Claude отказался отвечать на эту заявку. Переформулируйте её.";
    case "cancelled":
      return "Ответ мастера остановлен.";
    default:
      return "Связь с мастером прервалась. Отправьте заявку снова.";
  }
}

export interface MasterTurn {
  role: "player" | "master";
  text: string;
}

/**
 * Ответ мастера на Claude. `system` — кодекс и состояние игры от движка: он идёт первой
 * репликой, потому что у страницы нет системного промпта. Старые реплики отбрасываются,
 * если диалог разрастается.
 */
export async function claudeMasterReply(
  sample: SampleFn,
  system: string,
  history: MasterTurn[],
  tier: ClaudeTier,
  onText: (text: string) => void,
  signal: AbortSignal,
): Promise<string> {
  const MAX_TURNS = 40;
  const recent = history.slice(-MAX_TURNS);
  const firstPlayer = recent.findIndex((t) => t.role === "player");
  const turns = (firstPlayer < 0 ? [] : recent.slice(firstPlayer)).map((t) => ({
    role: t.role === "player" ? ("user" as const) : ("assistant" as const),
    content: t.text,
  }));
  const input = [
    {
      role: "user" as const,
      content: `${system}\n\nДальше — диалог с игроком. Отвечай как Мастер, по кодексу выше.`,
    },
    ...turns,
  ];
  const result = await sample(input, {
    modelTier: tier,
    cache: false,
    signal,
    onText: ({ text }) => onText(text),
  });
  return result.truncated ? `${result.text}\n\n(Ответ обрезан по длине.)` : result.text;
}
