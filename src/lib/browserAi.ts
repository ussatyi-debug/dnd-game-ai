// ИИ-мастер в веб-версии: Gemini, ChatGPT и YandexGPT прямо из браузера со своим ключом.
//
// Ключи хранятся только в памяти этого браузера (localStorage) и уходят только в API
// выбранного провайдера. Страница, открытая внутри Claude, по правилам Claude не может
// обращаться к другим сайтам — там мастера ведёт Claude, а эти модели работают в веб-версии,
// открытой отдельной вкладкой, и в приложениях.

import type { AiSettingsView, ChatRole, ModelInfo, Provider } from "./engine";

type WebProvider = Exclude<Provider, "local">;

interface Stored {
  /** Мастера ведёт Claude (страница внутри Claude). */
  claude: boolean;
  provider: WebProvider;
  model: string | null;
  keys: Partial<Record<WebProvider, string>>;
}

const KEY = "dnd.webai";
const LABELS: Record<WebProvider, string> = {
  gemini: "Google Gemini",
  openai: "OpenAI (ChatGPT)",
  anthropic: "Claude (Anthropic)",
  yandex: "YandexGPT (Яндекс)",
};
const ORDER: WebProvider[] = ["gemini", "openai", "anthropic", "yandex"];
/** Anthropic отвечает браузеру только с этим заголовком. */
const CLAUDE_BROWSER = { "anthropic-dangerous-direct-browser-access": "true" };

function load(): Stored {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return { claude: true, provider: "gemini", model: null, keys: {}, ...(JSON.parse(raw) as Partial<Stored>) };
  } catch {
    // Памяти браузера нет — настройки живут до закрытия вкладки.
  }
  return { claude: true, provider: "gemini", model: null, keys: {} };
}

let state: Stored = load();

function save(): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // См. load().
  }
}

function hint(provider: WebProvider, key: string): string {
  if (provider === "yandex") {
    const [folder = "", secret = ""] = key.split(" ");
    return `${folder} …${secret.slice(-4)}`;
  }
  return `…${key.slice(-4)}`;
}

/** Ключ провайдера в веб-версии (для облачной озвучки тем же ключом). */
export function webAiKey(provider: WebProvider): string | null {
  return state.keys[provider] ?? null;
}

/** Страница открыта внутри Claude (запросы к другим сайтам там запрещены). */
export function insideClaude(): boolean {
  return typeof window !== "undefined" && window.claude !== undefined;
}

export function webAiSettings(): AiSettingsView {
  const key = state.keys[state.provider];
  return {
    provider: state.provider,
    provider_label: LABELS[state.provider],
    model: state.model,
    has_key: Boolean(key),
    key_hint: key ? hint(state.provider, key) : null,
    claude: state.claude,
    providers: ORDER.map((p) => ({
      provider: p,
      label: LABELS[p],
      ready: true,
      has_key: Boolean(state.keys[p]),
      key_hint: state.keys[p] ? hint(p, state.keys[p]!) : null,
    })),
  };
}

/** Ведёт ли мастера модель со своим ключом (а не Claude). */
export function webAiActive(): boolean {
  return !state.claude && Boolean(state.model) && Boolean(state.keys[state.provider]);
}

export function webAiUseClaude(): AiSettingsView {
  state = { ...state, claude: true };
  save();
  return webAiSettings();
}

function parseYandex(text: string): string {
  const parts = text.split(/[\s:;,]+/).filter(Boolean);
  if (parts.length !== 2) throw new Error("Для Яндекса введите ID каталога и API-ключ через пробел: «b1g… AQVN…»");
  const [a, b] = parts as [string, string];
  const [folder, key] = a.length <= b.length ? [a, b] : [b, a];
  if (!/^[A-Za-z0-9]+$/.test(folder)) throw new Error("ID каталога Yandex Cloud — латинские буквы и цифры (например b1g…)");
  return `${folder} ${key}`;
}

export function webAiSetKey(provider: Provider, key: string): AiSettingsView {
  if (provider === "local") throw new Error("Локальная модель доступна в приложениях для ПК и Android");
  const value = key.trim();
  state = {
    ...state,
    keys: { ...state.keys, [provider]: value ? (provider === "yandex" ? parseYandex(value) : value) : undefined },
  };
  save();
  return webAiSettings();
}

export function webAiSelectModel(provider: Provider, model: string): AiSettingsView {
  if (provider === "local") throw new Error("Локальная модель доступна в приложениях для ПК и Android");
  state = { ...state, claude: false, provider, model };
  save();
  return webAiSettings();
}

// ───────────────────────────── запросы ─────────────────────────────

async function request(url: string, init: RequestInit, who: string): Promise<Record<string, unknown>> {
  if (insideClaude()) {
    throw new Error(
      `Страница внутри Claude не может обращаться к ${who}: здесь мастера ведёт Claude. ` +
        "Модели со своим ключом работают в веб-версии, открытой отдельной вкладкой, и в приложениях.",
    );
  }
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    throw new Error(
      who === "Яндексу"
        ? "Браузер не пустил запрос к Яндексу: сервис не разрешает вызовы со страниц сайтов. YandexGPT работает в приложениях для ПК и Android."
        : `Нет связи с ${who} — проверьте интернет`,
    );
  }
  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const err = body.error as { message?: string } | undefined;
    const message = err?.message ?? (body.message as string | undefined) ?? "без подробностей";
    if (response.status === 401 || response.status === 403) throw new Error(`Ключ не принят (${response.status}): ${message}`);
    if (response.status === 429) throw new Error(`Превышен лимит запросов или закончилась квота: ${message}`);
    throw new Error(`Ошибка ${response.status}: ${message}`);
  }
  return body;
}

function keyFor(provider: WebProvider): string {
  const key = state.keys[provider];
  if (!key) throw new Error(`Сначала введите ключ: ${LABELS[provider]}`);
  return key;
}

export async function webAiListModels(provider: Provider): Promise<ModelInfo[]> {
  if (provider === "local") return [];
  const key = keyFor(provider);
  if (provider === "gemini") {
    const body = await request(
      "https://generativelanguage.googleapis.com/v1beta/models?pageSize=200",
      { headers: { "x-goog-api-key": key } },
      "Google",
    );
    const models = (body.models as { name: string; displayName?: string; description?: string; inputTokenLimit?: number; supportedGenerationMethods?: string[] }[]) ?? [];
    return models
      .filter((m) => m.supportedGenerationMethods?.includes("generateContent") && /gemini/.test(m.name) && !/embedding|image|tts|audio|live/.test(m.name))
      .map((m) => ({
        id: m.name.replace(/^models\//, ""),
        name: m.displayName ?? m.name,
        description: m.description ?? "",
        input_token_limit: m.inputTokenLimit ?? null,
      }));
  }
  if (provider === "openai") {
    const body = await request("https://api.openai.com/v1/models", { headers: { Authorization: `Bearer ${key}` } }, "OpenAI");
    const data = (body.data as { id: string; created?: number }[]) ?? [];
    return data
      .filter(
        (m) =>
          (/^(gpt-|chatgpt-)/.test(m.id) || /^o\d/.test(m.id)) &&
          !/audio|realtime|tts|transcribe|image|embedding|moderation|search|instruct|dall-e|whisper|computer-use|deep-research/.test(m.id),
      )
      .sort((a, b) => (b.created ?? 0) - (a.created ?? 0))
      .map((m) => ({ id: m.id, name: m.id, description: "Платная модель: расходует кредиты аккаунта OpenAI", input_token_limit: null }));
  }
  if (provider === "anthropic") {
    const body = await request(
      "https://api.anthropic.com/v1/models?limit=100",
      { headers: { "x-api-key": key, "anthropic-version": "2023-06-01", ...CLAUDE_BROWSER } },
      "Claude",
    );
    const data = (body.data as { id: string; display_name?: string }[]) ?? [];
    return data.map((m) => ({
      id: m.id,
      name: m.display_name ?? m.id,
      description: "Платная модель: расходует кредиты аккаунта Anthropic",
      input_token_limit: null,
    }));
  }

  const [folder] = key.split(" ");
  return [
    "yandexgpt/latest",
    "yandexgpt-lite/latest",
    "aliceai-llm",
    "qwen3-235b-a22b-fp8/latest",
    "gpt-oss-120b/latest",
  ].map((id) => ({ id, name: id, description: `Каталог ${folder}. Платная модель Yandex Cloud`, input_token_limit: null }));
}

/** Ответ мастера выбранной моделью. */
export async function webAiGenerate(
  system: string,
  history: { role: ChatRole; text: string }[],
  signal: AbortSignal,
): Promise<string> {
  const provider = state.provider;
  const model = state.model;
  if (!model) throw new Error("Выберите модель: Меню → Настройки → ИИ-мастер");
  const key = keyFor(provider);
  const turns = history.filter((m) => m.text.trim());
  const first = turns.findIndex((m) => m.role === "player");
  const dialog = first < 0 ? [] : turns.slice(first);

  if (provider === "gemini") {
    const body = await request(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        signal,
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: dialog.map((m) => ({ role: m.role === "player" ? "user" : "model", parts: [{ text: m.text.trim() }] })),
          generationConfig: { temperature: 0.8 },
        }),
      },
      "Google",
    );
    const candidates = body.candidates as { content?: { parts?: { text?: string; thought?: boolean }[] }; finishReason?: string }[] | undefined;
    const text = (candidates?.[0]?.content?.parts ?? [])
      .filter((p) => !p.thought)
      .map((p) => p.text ?? "")
      .join("");
    if (text.trim()) return text;
    throw new Error(`Gemini вернул пустой ответ (${candidates?.[0]?.finishReason ?? "без причины"})`);
  }

  if (provider === "openai") {
    const body = await request(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        signal,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model,
          instructions: system,
          input: dialog.map((m) => ({ role: m.role === "player" ? "user" : "assistant", content: m.text.trim() })),
          store: false,
        }),
      },
      "OpenAI",
    );
    const output = (body.output as { type: string; content?: { type: string; text?: string }[] }[]) ?? [];
    const text = output
      .filter((o) => o.type === "message")
      .flatMap((o) => o.content ?? [])
      .filter((c) => c.type === "output_text")
      .map((c) => c.text ?? "")
      .join("");
    if (text.trim()) return text;
    throw new Error("OpenAI вернул пустой ответ");
  }

  if (provider === "anthropic") {
    const messages = dialog.map((m) => ({
      role: m.role === "player" ? "user" : "assistant",
      content: m.text.trim(),
    }));
    if (messages.at(-1)?.role === "assistant") messages.push({ role: "user", content: "Продолжай." });
    const body = await request(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        signal,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          ...CLAUDE_BROWSER,
        },
        body: JSON.stringify({
          model,
          max_tokens: 8192,
          // Кодекс и снимок сцены не меняются внутри сцены — помечаем их для кэша.
          system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
          messages,
        }),
      },
      "Claude",
    );
    const parts = (body.content as { type: string; text?: string }[]) ?? [];
    const text = parts.filter((p) => p.type === "text").map((p) => p.text ?? "").join("");
    if (text.trim()) return text;
    throw new Error("Claude вернул пустой ответ");
  }

  const [folder, apiKey] = key.split(" ") as [string, string];
  const body = await request(
    "https://ai.api.cloud.yandex.net/v1/chat/completions",
    {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, "OpenAI-Project": folder },
      body: JSON.stringify({
        model: model.startsWith("gpt://") ? model : `gpt://${folder}/${model}`,
        messages: [
          { role: "system", content: system },
          ...dialog.map((m) => ({ role: m.role === "player" ? "user" : "assistant", content: m.text.trim() })),
        ],
        temperature: 0.6,
      }),
    },
    "Яндексу",
  );
  const choices = body.choices as { message?: { content?: string } }[] | undefined;
  const text = choices?.[0]?.message?.content ?? "";
  if (text.trim()) return text;
  throw new Error("Яндекс вернул пустой ответ");
}
