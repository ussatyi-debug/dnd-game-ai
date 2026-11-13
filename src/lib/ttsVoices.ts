// Движки озвучки кроме встроенного Piper: голоса Piper для скачивания, встроенный Silero
// (Windows), свой сервер озвучки и облачные голоса OpenAI, Gemini, Яндекса.
//
// В приложениях облачные запросы идут через Rust с ключами из настроек мастера (ключ не
// попадает в интерфейс); в веб-версии — из браузера с ключом, введённым в настройках ИИ.

import { invoke } from "@tauri-apps/api/core";
import { webAiKey } from "./browserAi";

export type Gender = "m" | "f";

/** Движок озвучки, выбранный в настройках. */
export type TtsEngineId = "piper" | "silero" | "server" | "openai" | "gemini" | "yandex";
export type CloudProvider = "openai" | "gemini" | "yandex";

export interface VoiceOption {
  id: string;
  name: string;
  gender: Gender | "";
}

export const ENGINE_LABEL: Record<TtsEngineId, string> = {
  piper: "Piper",
  silero: "Silero",
  server: "Свой сервер",
  openai: "OpenAI",
  gemini: "Gemini",
  yandex: "Яндекс",
};

export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e));

// ───────────────────────────── Piper: каталог и скачивание ─────────────────────────────

export interface PiperVoice extends VoiceOption {
  /** Путь в каталоге голосов Piper на Hugging Face. */
  path: string;
  /** Встроен в приложение (в папке tts/); остальные скачиваются. */
  builtin: boolean;
  sizeMb: number;
  license: string;
}

export const PIPER_HF = "https://huggingface.co/rhasspy/piper-voices/resolve/main/ru/ru_RU";

export const PIPER_VOICES: PiperVoice[] = [
  { id: "dmitri", name: "Дмитрий", gender: "m", path: "dmitri/medium/ru_RU-dmitri-medium", builtin: true, sizeMb: 63, license: "см. MODEL_CARD голоса" },
  { id: "irina", name: "Ирина", gender: "f", path: "irina/medium/ru_RU-irina-medium", builtin: true, sizeMb: 63, license: "см. MODEL_CARD голоса" },
  { id: "denis", name: "Денис", gender: "m", path: "denis/medium/ru_RU-denis-medium", builtin: false, sizeMb: 63, license: "см. MODEL_CARD голоса" },
  { id: "ruslan", name: "Руслан", gender: "m", path: "ruslan/medium/ru_RU-ruslan-medium", builtin: false, sizeMb: 63, license: "см. MODEL_CARD голоса" },
];

export interface StoredVoice {
  model: ArrayBuffer;
  config: unknown;
}

const DB_NAME = "dnd-tts";
const STORE = "voices";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("Хранилище браузера недоступно"));
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("Хранилище браузера недоступно"));
  });
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const req = run(db.transaction(STORE, mode).objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error ?? new Error("Ошибка хранилища голосов"));
      }),
  );
}

/** Скачанный голос Piper (или `null`). */
export async function storedVoice(id: string): Promise<StoredVoice | null> {
  try {
    return ((await tx("readonly", (s) => s.get(id))) as StoredVoice | undefined) ?? null;
  } catch {
    return null;
  }
}

/** ID скачанных голосов. */
export async function downloadedVoices(): Promise<string[]> {
  try {
    return ((await tx("readonly", (s) => s.getAllKeys())) as IDBValidKey[]).map(String);
  } catch {
    return [];
  }
}

export async function deleteVoice(id: string): Promise<void> {
  await tx("readwrite", (s) => s.delete(id));
}

/** Скачивает голос Piper с Hugging Face; `progress` — доля 0…1. */
export async function downloadVoice(voice: PiperVoice, progress: (share: number) => void): Promise<void> {
  const url = `${PIPER_HF}/${voice.path}`;
  const configRes = await fetch(`${url}.onnx.json`);
  if (!configRes.ok) throw new Error(`Голос ${voice.name}: описание не скачалось (${configRes.status})`);
  const config: unknown = await configRes.json();
  const res = await fetch(`${url}.onnx`);
  if (!res.ok || !res.body) throw new Error(`Голос ${voice.name}: модель не скачалась (${res.status})`);
  const total = Number(res.headers.get("content-length")) || voice.sizeMb * 1024 * 1024;
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    got += value.length;
    progress(Math.min(1, got / total));
  }
  const model = new Uint8Array(got);
  let at = 0;
  for (const c of chunks) {
    model.set(c, at);
    at += c.length;
  }
  await tx("readwrite", (s) => s.put({ model: model.buffer, config } satisfies StoredVoice, voice.id));
}

// ───────────────────────────── голоса облачных провайдеров ─────────────────────────────

export const CLOUD_VOICES: Record<CloudProvider, VoiceOption[]> = {
  openai: [
    { id: "onyx", name: "Onyx", gender: "m" },
    { id: "echo", name: "Echo", gender: "m" },
    { id: "ash", name: "Ash", gender: "m" },
    { id: "ballad", name: "Ballad", gender: "m" },
    { id: "verse", name: "Verse", gender: "m" },
    { id: "cedar", name: "Cedar", gender: "m" },
    { id: "nova", name: "Nova", gender: "f" },
    { id: "shimmer", name: "Shimmer", gender: "f" },
    { id: "coral", name: "Coral", gender: "f" },
    { id: "sage", name: "Sage", gender: "f" },
    { id: "marin", name: "Marin", gender: "f" },
    { id: "alloy", name: "Alloy", gender: "" },
    { id: "fable", name: "Fable", gender: "" },
  ],
  gemini: [
    { id: "Charon", name: "Charon", gender: "m" },
    { id: "Orus", name: "Orus", gender: "m" },
    { id: "Fenrir", name: "Fenrir", gender: "m" },
    { id: "Puck", name: "Puck", gender: "m" },
    { id: "Iapetus", name: "Iapetus", gender: "m" },
    { id: "Algenib", name: "Algenib", gender: "m" },
    { id: "Kore", name: "Kore", gender: "f" },
    { id: "Aoede", name: "Aoede", gender: "f" },
    { id: "Leda", name: "Leda", gender: "f" },
    { id: "Zephyr", name: "Zephyr", gender: "f" },
    { id: "Despina", name: "Despina", gender: "f" },
    { id: "Sulafat", name: "Sulafat", gender: "f" },
  ],
  yandex: [
    { id: "filipp", name: "Филипп", gender: "m" },
    { id: "ermil", name: "Ермил", gender: "m" },
    { id: "zahar", name: "Захар", gender: "m" },
    { id: "madirus", name: "Мадирус", gender: "m" },
    { id: "alexander", name: "Александр", gender: "m" },
    { id: "kirill", name: "Кирилл", gender: "m" },
    { id: "anton", name: "Антон", gender: "m" },
    { id: "alena", name: "Алёна", gender: "f" },
    { id: "jane", name: "Джейн", gender: "f" },
    { id: "omazh", name: "Омаж", gender: "f" },
    { id: "dasha", name: "Даша", gender: "f" },
    { id: "julia", name: "Юлия", gender: "f" },
    { id: "lera", name: "Лера", gender: "f" },
    { id: "marina", name: "Марина", gender: "f" },
    { id: "masha", name: "Маша", gender: "f" },
  ],
};

/** Голоса по умолчанию для каждого движка: мужской и женский. */
export const DEFAULT_VOICES: Record<TtsEngineId, { m: string; f: string }> = {
  piper: { m: "dmitri", f: "irina" },
  silero: { m: "ru_dmitriy", f: "ru_ekaterina" },
  server: { m: "", f: "" },
  openai: { m: "onyx", f: "nova" },
  gemini: { m: "Charon", f: "Kore" },
  yandex: { m: "filipp", f: "alena" },
};

/** Модели озвучки облачного провайдера (тот же ключ, что у мастера). */
export async function cloudModels(provider: CloudProvider): Promise<string[]> {
  if (provider === "yandex") return ["speechkit"];
  if (isTauri()) return invoke<string[]>("tts_cloud_models", { provider });
  const key = webAiKey(provider);
  if (!key) throw new Error("Нет ключа — введите его в настройках ИИ-мастера.");
  if (provider === "openai") {
    const r = await fetch("https://api.openai.com/v1/models", { headers: { Authorization: `Bearer ${key}` } });
    if (!r.ok) throw new Error(`OpenAI: ошибка ${r.status}`);
    const body = (await r.json()) as { data?: { id: string }[] };
    return (body.data ?? []).map((m) => m.id).filter((id) => id.includes("tts")).sort();
  }
  const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000", {
    headers: { "x-goog-api-key": key },
  });
  if (!r.ok) throw new Error(`Gemini: ошибка ${r.status}`);
  const body = (await r.json()) as { models?: { name: string }[] };
  return (body.models ?? [])
    .map((m) => m.name.replace(/^models\//, ""))
    .filter((id) => id.includes("tts"))
    .sort();
}

function base64ToBytes(data: string): Uint8Array {
  const bin = atob(data);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** PCM 16 бит (моно) → WAV, чтобы браузер декодировал звук обычным способом. */
function pcm16ToWav(pcm: Uint8Array, rate: number): ArrayBuffer {
  const out = new ArrayBuffer(44 + pcm.length);
  const v = new DataView(out);
  const w = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF");
  v.setUint32(4, 36 + pcm.length, true);
  w(8, "WAVEfmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, rate, true);
  v.setUint32(28, rate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  w(36, "data");
  v.setUint32(40, pcm.length, true);
  new Uint8Array(out, 44).set(pcm);
  return out;
}

/** Фраза облачным голосом: байты звукового файла. */
export async function cloudSynth(
  provider: CloudProvider,
  model: string,
  voice: string,
  text: string,
  rate: number,
): Promise<ArrayBuffer> {
  if (isTauri()) return invoke<ArrayBuffer>("tts_cloud_synth", { provider, model, voice, text, rate });
  const key = webAiKey(provider);
  if (!key) throw new Error("Нет ключа — введите его в настройках ИИ-мастера.");
  if (provider === "yandex") {
    throw new Error("Голоса Яндекса из браузера закрыты правилами браузера (CORS) — они работают в приложениях для ПК и Android.");
  }
  if (provider === "openai") {
    const r = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, voice, input: text, response_format: "mp3", speed: Math.min(4, Math.max(0.25, rate)) }),
    });
    if (!r.ok) throw new Error(`OpenAI: ошибка озвучки ${r.status}`);
    return r.arrayBuffer();
  }
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
      },
    }),
  });
  if (!r.ok) throw new Error(`Gemini: ошибка озвучки ${r.status}`);
  const body = (await r.json()) as {
    candidates?: { content?: { parts?: { inlineData?: { data?: string; mimeType?: string } }[] } }[];
  };
  const part = body.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  if (!part?.data) throw new Error("Gemini не вернул звук для этой фразы");
  const hz = Number(/rate=(\d+)/.exec(part.mimeType ?? "")?.[1] ?? 24000);
  return pcm16ToWav(base64ToBytes(part.data), hz);
}

// ───────────────────────────── свой сервер и Silero ─────────────────────────────

export function normalizeServerUrl(url: string): string {
  const u = url.trim().replace(/\/+$/, "");
  return /^https?:\/\//.test(u) ? u : `http://${u}`;
}

export async function serverVoices(url: string): Promise<VoiceOption[]> {
  if (!url.trim()) throw new Error("Укажите адрес сервера озвучки, например http://192.168.1.10:5150");
  const list = isTauri()
    ? await invoke<{ voices: VoiceOption[] }>("tts_server_voices", { url })
    : await fetch(`${normalizeServerUrl(url)}/voices`).then((r) => {
        if (!r.ok) throw new Error(`Сервер озвучки ответил ошибкой ${r.status}`);
        return r.json() as Promise<{ voices: VoiceOption[] }>;
      });
  return list.voices.map((v) => ({ ...v, gender: v.gender === "m" || v.gender === "f" ? v.gender : "" }));
}

export async function serverSynth(url: string, voice: string, text: string, rate: number): Promise<ArrayBuffer> {
  if (isTauri()) return invoke<ArrayBuffer>("tts_server_synth", { url, voice, text, rate });
  const r = await fetch(`${normalizeServerUrl(url)}/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice, rate }),
  });
  if (!r.ok) throw new Error(`Сервер озвучки: ошибка ${r.status}`);
  return r.arrayBuffer();
}

/** Встроенный Silero есть только в приложении для Windows (модели в установщике). */
export async function sileroAvailable(): Promise<boolean> {
  if (!isTauri()) return false;
  try {
    return await invoke<boolean>("tts_silero_available");
  } catch {
    return false;
  }
}

export async function sileroVoices(): Promise<VoiceOption[]> {
  const list = await invoke<VoiceOption[]>("tts_silero_voices");
  return list.map((v) => ({ ...v, gender: v.gender === "m" || v.gender === "f" ? v.gender : "" }));
}

export function sileroSynth(voice: string, text: string, rate: number): Promise<ArrayBuffer> {
  return invoke<ArrayBuffer>("tts_silero_synth", { voice, text, rate });
}

export interface ShareStatus {
  running: boolean;
  port: number;
  address: string | null;
  /** Все адреса ПК в домашних сетях: телефон может быть в другой сети, чем основной маршрут. */
  addresses?: string[];
  /** Порт разрешён в брандмауэре Windows. */
  firewall?: boolean;
}

/** Разрешает порт раздачи в брандмауэре Windows: игрок подтверждает запрос прав. */
export function shareFirewall(): Promise<boolean> {
  return invoke<boolean>("tts_share_firewall");
}

export function shareStatus(): Promise<ShareStatus> {
  return invoke<ShareStatus>("tts_share_status");
}

export function shareStart(port: number): Promise<ShareStatus> {
  return invoke<ShareStatus>("tts_share_start", { port });
}

export function shareStop(): Promise<boolean> {
  return invoke<boolean>("tts_share_stop");
}

/** Байты звукового файла → отсчёты для воспроизведения. */
export async function decodeAudio(ctx: BaseAudioContext, bytes: ArrayBuffer): Promise<{ pcm: Float32Array; sampleRate: number }> {
  try {
    const buf = await ctx.decodeAudioData(bytes.slice(0));
    return { pcm: buf.getChannelData(0), sampleRate: buf.sampleRate };
  } catch (e) {
    throw new Error(`Звук не декодировался: ${errorText(e)}`);
  }
}
