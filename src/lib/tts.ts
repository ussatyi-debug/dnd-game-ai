// Озвучка ответов мастера.
//
// Движок — Piper (нейросетевой синтез, работает офлайн): модель ONNX выполняет
// onnxruntime-web, фонемы для русского даёт espeak-ng (piper_phonemize, WebAssembly).
// Файлы лежат в `tts/` рядом со страницей приложения; их кладёт в сборку scripts/fetch-tts.mjs.
// Где этих файлов нет (веб-версия внутри Claude: страница не может запускать WebAssembly
// и скачивать модели), озвучка идёт системным голосом браузера, если он есть.
//
// Голоса: повествование — голос рассказчика; реплики «> — [Имя, ж] …» — голос по полу
// говорящего (пометка мастера, иначе список персонажей в настройках).

export type Gender = "m" | "f";
export type VoiceId = "dmitri" | "irina";

export interface Pronunciation {
  from: string;
  to: string;
}

export interface CharacterVoice {
  name: string;
  gender: Gender;
}

export interface TtsSettings {
  /** Пол голоса повествования. */
  narrator: Gender;
  /** Скорость: 1 — как в модели. */
  rate: number;
  volume: number;
  pronunciations: Pronunciation[];
  characters: CharacterVoice[];
}

const VOICE_BY_GENDER: Record<Gender, VoiceId> = { m: "dmitri", f: "irina" };
export const VOICE_LABEL: Record<VoiceId, string> = { dmitri: "Дима", irina: "Ира" };

/** Ударения в именах кампании (знак ударения U+0301 после ударной гласной). */
export const DEFAULT_PRONUNCIATIONS: Pronunciation[] = [
  { from: "Никис", to: "Ни́кис" },
  { from: "Альт-Варден", to: "Альт-Ва́рден" },
  { from: "Стрэндж", to: "Стрэ́ндж" },
  { from: "Кроу-Рок", to: "Кро́у-Ро́к" },
  { from: "Корвус", to: "Ко́рвус" },
  { from: "Юссач", to: "Юсса́ч" },
  { from: "Вейденбург", to: "Ве́йденбург" },
  { from: "Черноводье", to: "Черново́дье" },
];

export const DEFAULT_CHARACTERS: CharacterVoice[] = [
  { name: "Никис", gender: "m" },
  { name: "Корвус", gender: "m" },
  { name: "Гюнтер", gender: "m" },
  { name: "Валерия", gender: "f" },
  { name: "Брокк", gender: "m" },
  { name: "Юссач", gender: "m" },
  { name: "Калеб", gender: "m" },
  { name: "Мирра", gender: "f" },
  { name: "Орели", gender: "f" },
  { name: "Элеонора", gender: "f" },
  { name: "Беатрис", gender: "f" },
];

export const DEFAULT_TTS: TtsSettings = {
  narrator: "m",
  rate: 1,
  volume: 1,
  pronunciations: DEFAULT_PRONUNCIATIONS,
  characters: DEFAULT_CHARACTERS,
};

const SETTINGS_KEY = "dnd.tts";

export function loadTtsSettings(): TtsSettings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_TTS, ...(JSON.parse(raw) as Partial<TtsSettings>) };
  } catch {
    // Память браузера недоступна — настройки по умолчанию.
  }
  return DEFAULT_TTS;
}

export function saveTtsSettings(settings: TtsSettings) {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Не критично: настройки действуют до закрытия страницы.
  }
}

// ───────────────────────────── текст ─────────────────────────────

/** Пометка говорящего в начале реплики: «[Валерия, ж]». */
const SPEAKER_TAG = /^(\s*[—–-]?\s*)\[([^\]\n]{1,40}?),\s*(ж|м|f|m)\]\s*/i;

/** Строка реплики без пометки говорящего (для показа в чате). */
export function stripSpeakerTag(line: string): string {
  return line.replace(SPEAKER_TAG, "$1");
}

export interface Segment {
  text: string;
  voice: VoiceId;
}

function genderOf(name: string, settings: TtsSettings): Gender | null {
  const n = name.toLowerCase().replace(/ё/g, "е");
  const hit = settings.characters.find((c) => {
    const k = c.name.toLowerCase().replace(/ё/g, "е").trim();
    return k.length > 0 && (n === k || n.includes(k));
  });
  return hit?.gender ?? null;
}

function applyPronunciations(text: string, list: Pronunciation[]): string {
  let out = text;
  for (const p of list) {
    if (!p.from.trim()) continue;
    const escaped = p.from.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(`(?<![\\p{L}])${escaped}`, "giu"), p.to);
  }
  return out;
}

function clean(text: string): string {
  return text
    .replace(/```[\s\S]*?(```|$)/g, " ")
    .replace(/\*\*\*|\*\*|\*|__|`/g, "")
    .replace(/^#+\s*/gm, "")
    .replace(/\[(?:[a-z_]+\.)+[a-z0-9_]+\]/gi, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

/** Делит длинный кусок на фразы по концам предложений (не длиннее ~260 знаков). */
function sentences(text: string): string[] {
  const parts = text.split(/(?<=[.!?…»])\s+(?=[«"—A-ZА-ЯЁ0-9])/u);
  const out: string[] = [];
  let buf = "";
  for (const p of parts) {
    if ((buf + " " + p).trim().length > 260 && buf) {
      out.push(buf.trim());
      buf = p;
    } else {
      buf = `${buf} ${p}`;
    }
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

/** Ответ мастера → фразы с голосами. */
export function segments(masterText: string, settings: TtsSettings): Segment[] {
  const narrator = VOICE_BY_GENDER[settings.narrator];
  const out: Segment[] = [];
  let narration: string[] = [];
  const flush = () => {
    const text = clean(narration.join(" "));
    narration = [];
    for (const s of sentences(text)) out.push({ text: s, voice: narrator });
  };
  for (const raw of masterText.replace(/```engine[\s\S]*?(```|$)/g, "").split("\n")) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    if (!line.startsWith(">")) {
      narration.push(line);
      continue;
    }
    flush();
    const body = line.replace(/^>\s?/, "");
    const tag = SPEAKER_TAG.exec(body);
    let voice = narrator;
    if (tag) {
      const mark = (tag[3] ?? "").toLowerCase();
      const gender: Gender = mark === "ж" || mark === "f" ? "f" : "m";
      voice = VOICE_BY_GENDER[gender];
    } else {
      const name = /^\s*[—–-]?\s*([А-ЯЁA-Z][\p{L}-]+)/u.exec(body)?.[1];
      const g = name ? genderOf(name, settings) : null;
      if (g) voice = VOICE_BY_GENDER[g];
    }
    const text = clean(stripSpeakerTag(body).replace(/^\s*[—–-]\s*/, ""));
    for (const s of sentences(text)) out.push({ text: s, voice });
  }
  flush();
  return out
    .filter((s) => /[\p{L}\p{N}]/u.test(s.text))
    .map((s) => ({ ...s, text: applyPronunciations(s.text, settings.pronunciations) }));
}

// ───────────────────────────── Piper ─────────────────────────────

interface Manifest {
  voices: Record<VoiceId, { model: string; config: string }>;
}

interface VoiceConfig {
  audio: { sample_rate: number };
  espeak: { voice: string };
  inference: { noise_scale: number; length_scale: number; noise_w: number };
}

interface OrtTensorCtor {
  new (type: string, data: unknown, dims?: number[]): unknown;
}
interface OrtSession {
  run(feeds: Record<string, unknown>): Promise<Record<string, { data: Float32Array }>>;
}
interface Ort {
  env: { wasm: { wasmPaths: string; numThreads: number; proxy: boolean } };
  Tensor: OrtTensorCtor;
  InferenceSession: { create(model: ArrayBuffer | Uint8Array, options?: unknown): Promise<OrtSession> };
}
interface PhonemizeModule {
  callMain(args: string[]): void;
}
type PhonemizeFactory = (options: Record<string, unknown>) => Promise<PhonemizeModule>;

declare global {
  interface Window {
    ort?: Ort;
    createPiperPhonemize?: PhonemizeFactory;
  }
}

const BASE = "tts/";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`Не загрузился ${src}`));
    document.head.appendChild(el);
  });
}

async function fetchBuffer(path: string): Promise<ArrayBuffer> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Нет файла озвучки ${path}`);
  return res.arrayBuffer();
}

class PiperEngine {
  private manifest: Promise<Manifest | null> | null = null;
  private ort: Promise<Ort> | null = null;
  private phonemizeFiles: Promise<{ wasm: ArrayBuffer; data: ArrayBuffer }> | null = null;
  private voices = new Map<VoiceId, Promise<{ session: OrtSession; config: VoiceConfig }>>();

  available(): Promise<Manifest | null> {
    if (!this.manifest) {
      this.manifest = fetch(`${BASE}manifest.json`)
        .then((r) => (r.ok ? (r.json() as Promise<Manifest>) : null))
        .catch(() => null);
    }
    return this.manifest;
  }

  private loadOrt(): Promise<Ort> {
    if (!this.ort) {
      this.ort = (async () => {
        if (!window.ort) await loadScript(`${BASE}ort/ort.min.js`);
        const ort = window.ort;
        if (!ort) throw new Error("onnxruntime не загрузился");
        ort.env.wasm.wasmPaths = new URL(`${BASE}ort/`, document.baseURI).href;
        ort.env.wasm.numThreads = 1;
        return ort;
      })();
    }
    return this.ort;
  }

  private factory: Promise<PhonemizeFactory> | null = null;

  /** Фабрика модуля фонемизатора: классический скрипт или ES-модуль (зависит от сборки). */
  private loadFactory(): Promise<PhonemizeFactory> {
    if (!this.factory) {
      this.factory = (async () => {
        const url = new URL(`${BASE}piper/piper_phonemize.js`, document.baseURI).href;
        try {
          if (!window.createPiperPhonemize) await loadScript(url);
        } catch {
          // Попробуем как модуль ниже.
        }
        if (window.createPiperPhonemize) return window.createPiperPhonemize;
        const mod = (await import(/* @vite-ignore */ url)) as { default?: PhonemizeFactory; createPiperPhonemize?: PhonemizeFactory };
        const f = mod.default ?? mod.createPiperPhonemize;
        if (!f) throw new Error("Фонемизатор не загрузился");
        return f;
      })();
      this.factory.catch(() => (this.factory = null));
    }
    return this.factory;
  }

  private async phonemize(text: string, espeakVoice: string): Promise<number[]> {
    const factory = await this.loadFactory();
    if (!this.phonemizeFiles) {
      this.phonemizeFiles = Promise.all([
        fetchBuffer(`${BASE}piper/piper_phonemize.wasm`),
        fetchBuffer(`${BASE}piper/piper_phonemize.data`),
      ]).then(([wasm, data]) => ({ wasm, data }));
    }
    const files = await this.phonemizeFiles;
    let ids: number[] = [];
    const module = await factory({
      wasmBinary: files.wasm,
      getPreloadedPackage: () => files.data.slice(0),
      locateFile: (url: string) => `${BASE}piper/${url.split("/").pop() ?? url}`,
      print: (line: string) => {
        try {
          const parsed = JSON.parse(line) as { phoneme_ids?: number[] };
          if (parsed.phoneme_ids) ids = ids.concat(parsed.phoneme_ids);
        } catch {
          // Строка не JSON — служебный вывод фонемизатора.
        }
      },
      printErr: () => undefined,
    });
    module.callMain(["-l", espeakVoice, "--input", JSON.stringify([{ text }]), "--espeak_data", "/espeak-ng-data"]);
    return ids;
  }

  private voice(id: VoiceId) {
    let v = this.voices.get(id);
    if (!v) {
      v = (async () => {
        const manifest = await this.available();
        if (!manifest) throw new Error("Голоса Piper не установлены");
        const files = manifest.voices[id];
        const [ort, model, config] = await Promise.all([
          this.loadOrt(),
          fetchBuffer(`${BASE}${files.model}`),
          fetch(`${BASE}${files.config}`).then((r) => r.json() as Promise<VoiceConfig>),
        ]);
        let session: OrtSession;
        try {
          ort.env.wasm.proxy = true;
          session = await ort.InferenceSession.create(model);
        } catch {
          // Без отдельного потока (если браузер не дал создать worker).
          ort.env.wasm.proxy = false;
          session = await ort.InferenceSession.create(model);
        }
        return { session, config };
      })();
      v.catch(() => this.voices.delete(id));
      this.voices.set(id, v);
    }
    return v;
  }

  async synth(text: string, voiceId: VoiceId, rate: number): Promise<{ pcm: Float32Array; sampleRate: number }> {
    const [{ session, config }, ort] = await Promise.all([this.voice(voiceId), this.loadOrt()]);
    const ids = await this.phonemize(text, config.espeak.voice);
    if (ids.length === 0) return { pcm: new Float32Array(0), sampleRate: config.audio.sample_rate };
    const inf = config.inference;
    const feeds = {
      input: new ort.Tensor("int64", BigInt64Array.from(ids.map(BigInt)), [1, ids.length]),
      input_lengths: new ort.Tensor("int64", BigInt64Array.from([BigInt(ids.length)]), [1]),
      scales: new ort.Tensor("float32", Float32Array.from([inf.noise_scale, inf.length_scale / rate, inf.noise_w]), [3]),
    };
    const out = await session.run(feeds);
    const first = Object.values(out)[0];
    return { pcm: first ? first.data : new Float32Array(0), sampleRate: config.audio.sample_rate };
  }
}

const piper = new PiperEngine();

// Проверка озвучки в CI (scripts/tts-smoke.mjs): синтез фразы без воспроизведения.
if (typeof window !== "undefined") {
  (window as unknown as { __dndTts?: unknown }).__dndTts = {
    available: () => piper.available(),
    synth: async (text: string, voice: VoiceId) => {
      const started = performance.now();
      const out = await piper.synth(text, voice, 1);
      let peak = 0;
      for (const v of out.pcm) peak = Math.max(peak, Math.abs(v));
      return { samples: out.pcm.length, sampleRate: out.sampleRate, peak, ms: Math.round(performance.now() - started) };
    },
  };
}

// ───────────────────────────── воспроизведение ─────────────────────────────

export type TtsStatus = "idle" | "loading" | "playing" | "paused";

export interface TtsState {
  status: TtsStatus;
  messageId: number | null;
  label: string;
  index: number;
  total: number;
  engine: "piper" | "system" | null;
  error: string | null;
}

const IDLE: TtsState = { status: "idle", messageId: null, label: "", index: 0, total: 0, engine: null, error: null };

type Listener = (state: TtsState) => void;

/** Есть ли системный синтез речи (запасной путь без Piper). */
function systemSpeech(): SpeechSynthesis | null {
  return typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;
}

function systemVoice(gender: Gender): SpeechSynthesisVoice | null {
  const voices = systemSpeech()?.getVoices().filter((v) => v.lang.toLowerCase().startsWith("ru")) ?? [];
  if (voices.length === 0) return null;
  const female = /irina|svetlana|milena|alena|female|женск|ира|светлана|алёна|дарья|katya|anna/i;
  const pick = voices.find((v) => (gender === "f" ? female.test(v.name) : !female.test(v.name)));
  return pick ?? voices[0] ?? null;
}

class TtsPlayer {
  private state: TtsState = IDLE;
  private listeners = new Set<Listener>();
  private ctx: AudioContext | null = null;
  private source: AudioBufferSourceNode | null = null;
  private gain: GainNode | null = null;
  private run = 0;
  private current: { messageId: number; label: string; text: string; settings: TtsSettings } | null = null;

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    fn(this.state);
    return () => this.listeners.delete(fn);
  }

  private set(patch: Partial<TtsState>) {
    this.state = { ...this.state, ...patch };
    for (const fn of this.listeners) fn(this.state);
  }

  /** Какой движок доступен: Piper, системный голос или ничего. */
  async engine(): Promise<"piper" | "system" | null> {
    if (await piper.available()) return "piper";
    return systemSpeech() ? "system" : null;
  }

  /** Озвучить ответ мастера (вызывать из обработчика нажатия). */
  async play(messageId: number, label: string, text: string, settings: TtsSettings, from = 0) {
    this.stop();
    const run = ++this.run;
    this.current = { messageId, label, text, settings };
    const parts = segments(text, settings);
    const engine = await this.engine();
    if (!engine) {
      this.set({ ...IDLE, error: "Озвучка недоступна: нет голосов Piper и системного синтеза речи." });
      return;
    }
    this.set({ status: "loading", messageId, label, index: from, total: parts.length, engine, error: null });
    if (engine === "system") {
      this.playSystem(run, parts, settings, from);
      return;
    }
    try {
      if (!this.ctx) this.ctx = new AudioContext();
      await this.ctx.resume();
      this.gain = this.ctx.createGain();
      this.gain.gain.value = settings.volume;
      this.gain.connect(this.ctx.destination);
      let next = parts[from] ? piper.synth(parts[from].text, parts[from].voice, settings.rate) : null;
      for (let i = from; i < parts.length; i++) {
        if (run !== this.run || !next) return;
        const audio = await next;
        if (run !== this.run) return;
        // Следующая фраза синтезируется, пока звучит текущая.
        const following = parts[i + 1];
        next = following ? piper.synth(following.text, following.voice, settings.rate) : null;
        if (audio.pcm.length === 0) continue;
        this.set({ status: this.state.status === "paused" ? "paused" : "playing", index: i });
        await this.playBuffer(run, audio.pcm, audio.sampleRate);
      }
      if (run === this.run) this.set(IDLE);
    } catch (e) {
      if (run === this.run) this.set({ ...IDLE, error: `Озвучка: ${e instanceof Error ? e.message : String(e)}` });
    }
  }

  private playBuffer(run: number, pcm: Float32Array, sampleRate: number): Promise<void> {
    const ctx = this.ctx;
    if (!ctx || !this.gain) return Promise.resolve();
    const buffer = ctx.createBuffer(1, pcm.length, sampleRate);
    buffer.copyToChannel(new Float32Array(pcm), 0);
    return new Promise((resolve) => {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(this.gain as GainNode);
      src.onended = () => resolve();
      this.source = src;
      if (run !== this.run) return resolve();
      src.start();
    });
  }

  private playSystem(run: number, parts: Segment[], settings: TtsSettings, from: number) {
    const speech = systemSpeech();
    if (!speech) return;
    speech.cancel();
    if (!speech.getVoices().some((v) => v.lang.toLowerCase().startsWith("ru"))) {
      this.set({ ...IDLE, error: "Озвучка: на этом устройстве нет системного голоса для русского языка." });
      return;
    }
    parts.slice(from).forEach((p, k) => {
      const u = new SpeechSynthesisUtterance(p.text);
      u.lang = "ru-RU";
      u.rate = settings.rate;
      u.volume = settings.volume;
      const v = systemVoice(p.voice === "irina" ? "f" : "m");
      if (v) u.voice = v;
      u.onstart = () => run === this.run && this.set({ status: "playing", index: from + k });
      u.onend = () => {
        if (run === this.run && from + k === parts.length - 1) this.set(IDLE);
      };
      u.onerror = () => run === this.run && this.set({ ...IDLE, error: "Системный голос не смог прочитать текст." });
      speech.speak(u);
    });
  }

  pause() {
    if (this.state.status !== "playing" && this.state.status !== "loading") return;
    if (this.state.engine === "system") systemSpeech()?.pause();
    else void this.ctx?.suspend();
    this.set({ status: "paused" });
  }

  resume() {
    if (this.state.status !== "paused") return;
    if (this.state.engine === "system") systemSpeech()?.resume();
    else void this.ctx?.resume();
    this.set({ status: "playing" });
  }

  stop() {
    this.run++;
    try {
      this.source?.stop();
    } catch {
      // Источник уже остановлен.
    }
    this.source = null;
    systemSpeech()?.cancel();
    void this.ctx?.resume();
    if (this.state.status !== "idle") this.set(IDLE);
  }

  restart() {
    const c = this.current;
    if (c) void this.play(c.messageId, c.label, c.text, c.settings, 0);
  }
}

export const ttsPlayer = new TtsPlayer();

/** Фраза для прослушивания голосов в настройках (её же озвучивают образцы движков). */
export const PREVIEW_TEXT =
  "Мистический заряд по метнувшему камень. Вы стоите глубоко в сфере, и снаружи вас не видят. Атака невидимого противника идёт с преимуществом. Я беру больший куб из каждой пары, а до уступа вы достаёте: «Взор дьявола» видит сквозь свою же тьму, а дальность заклинания сто двадцать футов.";

/** Прослушать пример голоса в настройках. */
export function preview(gender: Gender, settings: TtsSettings) {
  const name = gender === "f" ? "Ира" : "Дима";
  void ttsPlayer.play(-1, `Пример: ${name}`, PREVIEW_TEXT, { ...settings, narrator: gender });
}
