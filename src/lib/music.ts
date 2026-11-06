// Фоновая музыка: треки из public/music (скачивает scripts/fetch-music.mjs), выбор по
// настроению сцены, плавная смена треков, приглушение на время озвучки мастера.
// Веб-версия внутри Claude музыку не получает (нет файлов) — плеер просто молчит.

import { ttsPlayer } from "./tts";

export type MusicMood = "menu" | "calm" | "travel_day" | "travel_night" | "battle";

export interface MusicTrack {
  id: string;
  mood: MusicMood;
  title: string;
  author: string;
  page: string;
  license: string;
  file: string;
  /** С какой секунды играть трек (пропуск вступления). */
  start?: number;
  /** Множитель громкости трека относительно остальных. */
  gain?: number;
}

export interface MusicSettings {
  enabled: boolean;
  /** Громкость 0…1. */
  volume: number;
}

export const DEFAULT_MUSIC: MusicSettings = { enabled: true, volume: 0.35 };

const SETTINGS_KEY = "dnd.music";
const BASE = "music/";
const FADE_MS = 2000;
/** Во сколько раз тише музыка, пока мастер читает ответ голосом. */
const DUCK = 0.3;

export function loadMusicSettings(): MusicSettings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_MUSIC;
    const parsed = JSON.parse(raw) as Partial<MusicSettings>;
    const volume = typeof parsed.volume === "number" ? Math.min(1, Math.max(0, parsed.volume)) : DEFAULT_MUSIC.volume;
    return { enabled: parsed.enabled !== false, volume };
  } catch {
    return DEFAULT_MUSIC;
  }
}

export function saveMusicSettings(settings: MusicSettings) {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Не критично: настройка просто не запомнится.
  }
}

const NIGHT = /ноч|полноч|вечер|сумер|закат|темн|тёмн|рассвет до/i;

/** Настроение музыки по настроению сцены и времени суток. */
export function moodForScene(mood: "calm" | "travel" | "battle", time: string | null): MusicMood {
  if (mood === "battle") return "battle";
  if (mood === "travel") return time && NIGHT.test(time) ? "travel_night" : "travel_day";
  return "calm";
}

type Listener = (state: MusicState) => void;

export interface MusicState {
  available: boolean;
  track: MusicTrack | null;
  mood: MusicMood | null;
}

class MusicPlayer {
  private tracks: Promise<MusicTrack[]> | null = null;
  private settings: MusicSettings = DEFAULT_MUSIC;
  private mood: MusicMood | null = null;
  private current: { el: HTMLAudioElement; track: MusicTrack } | null = null;
  private ducked = false;
  private unlocked = false;
  private listeners = new Set<Listener>();
  private state: MusicState = { available: false, track: null, mood: null };
  private fades = new Map<HTMLAudioElement, number>();

  constructor() {
    if (typeof window === "undefined") return;
    // Браузер разрешает звук только после действия пользователя.
    const unlock = () => {
      if (this.unlocked) return;
      this.unlocked = true;
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      void this.apply();
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    ttsPlayer.subscribe((s) => {
      const ducked = s.status === "playing" || s.status === "loading";
      if (ducked !== this.ducked) {
        this.ducked = ducked;
        if (this.current) this.fadeTo(this.current.el, this.target(), 600);
      }
    });
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    fn(this.state);
    return () => this.listeners.delete(fn);
  }

  private emit(patch: Partial<MusicState>) {
    this.state = { ...this.state, ...patch };
    for (const fn of this.listeners) fn(this.state);
  }

  /** Список треков из манифеста (пустой, если музыки в сборке нет). */
  list(): Promise<MusicTrack[]> {
    if (!this.tracks) {
      this.tracks = fetch(`${BASE}manifest.json`)
        .then((r) => (r.ok ? (r.json() as Promise<{ tracks: MusicTrack[] }>) : { tracks: [] }))
        .then((m) => m.tracks)
        .catch(() => []);
      void this.tracks.then((t) => this.emit({ available: t.length > 0 }));
    }
    return this.tracks;
  }

  configure(settings: MusicSettings) {
    this.settings = settings;
    if (!settings.enabled) {
      this.stopCurrent();
      return;
    }
    if (this.current) this.fadeTo(this.current.el, this.target(), 300);
    else void this.apply();
  }

  setMood(mood: MusicMood) {
    if (mood === this.mood) return;
    this.mood = mood;
    this.emit({ mood });
    void this.apply();
  }

  private target(): number {
    const gain = this.current?.track.gain ?? 1;
    return Math.min(1, this.settings.volume * gain * (this.ducked ? DUCK : 1));
  }

  private async apply() {
    if (!this.unlocked || !this.settings.enabled || !this.mood) return;
    const tracks = await this.list();
    const pool = tracks.filter((t) => t.mood === this.mood);
    if (pool.length === 0) return;
    // Тот же набор уже играет — не перебиваем трек.
    if (this.current && this.current.track.mood === this.mood) return;
    this.start(this.pick(pool));
  }

  private pick(pool: MusicTrack[]): MusicTrack {
    const others = pool.filter((t) => t.id !== this.current?.track.id);
    const from = others.length > 0 ? others : pool;
    return from[Math.floor(Math.random() * from.length)] ?? (pool[0] as MusicTrack);
  }

  private start(track: MusicTrack) {
    this.stopCurrent();
    const el = new Audio(`${BASE}${track.file}`);
    el.volume = 0;
    const start = track.start ?? 0;
    if (start > 0) {
      // Перемотка надёжна только после загрузки длительности.
      el.addEventListener("loadedmetadata", () => {
        if (el.currentTime < start) el.currentTime = start;
      }, { once: true });
    }
    el.preload = "auto";
    const pool = async () => (await this.list()).filter((t) => t.mood === track.mood);
    el.addEventListener("ended", () => {
      void pool().then((p) => {
        if (this.current?.el !== el) return;
        if (p.length <= 1) {
          el.currentTime = track.start ?? 0;
          void el.play().catch(() => undefined);
        } else {
          this.start(this.pick(p));
        }
      });
    });
    this.current = { el, track };
    this.emit({ track });
    void el.play().then(
      () => this.fadeTo(el, this.target(), FADE_MS),
      () => {
        // Воспроизведение не разрешено или файла нет — молчим без ошибок.
        if (this.current?.el === el) this.current = null;
        this.emit({ track: null });
      },
    );
  }

  private stopCurrent() {
    const cur = this.current;
    if (!cur) return;
    this.current = null;
    this.emit({ track: null });
    this.fadeTo(cur.el, 0, FADE_MS, () => {
      cur.el.pause();
      cur.el.src = "";
    });
  }

  private fadeTo(el: HTMLAudioElement, volume: number, ms: number, done?: () => void) {
    const prev = this.fades.get(el);
    if (prev !== undefined) window.clearInterval(prev);
    const from = el.volume;
    const steps = Math.max(1, Math.round(ms / 50));
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      el.volume = Math.min(1, Math.max(0, from + ((volume - from) * i) / steps));
      if (i >= steps) {
        window.clearInterval(id);
        this.fades.delete(el);
        done?.();
      }
    }, 50);
    this.fades.set(el, id);
  }
}

export const musicPlayer = new MusicPlayer();
