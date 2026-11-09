// Сохранения: сборка файла и автосохранения.
//
// Автосохранение делается раз в несколько ходов мастера, после загрузки и после отдыха;
// хранятся три последних по кругу.
// - Приложение (Tauri) пишет файлы в папку данных приложения.
// - Веб-версия внутри Claude пишет в хранилище страницы (личный раздел игрока). Запись
//   хранилища ограничена 256 КБ, поэтому сохранение сжимается и делится на части.
//   Если хранилища нет (не выполнен вход), — копия в памяти браузера.

import { invoke } from "@tauri-apps/api/core";
import { saveState } from "./engine";
import type { TrayRoll } from "./rolls";
import type { ChatMessage } from "../components/ChatPanel";

/** Сколько ходов мастера между автосохранениями. */
export const AUTOSAVE_EVERY = 5;
/** Сколько автосохранений хранится по кругу. */
export const AUTOSAVE_SLOTS = 3;

/** Краткие сведения об автосохранении. */
export interface AutosaveInfo {
  slot: number;
  savedAt: string;
  day: number | null;
  location: string;
}

/** Файл сохранения (как при выгрузке). */
export async function buildSave(messages: ChatMessage[], rolls: TrayRoll[]): Promise<{ json: string; info: Omit<AutosaveInfo, "slot"> }> {
  const engine = (await saveState()) as { scene?: { day?: unknown; location?: unknown } };
  const savedAt = new Date().toISOString();
  const json = JSON.stringify({
    app: "dnd-game-ai",
    app_version: __APP_VERSION__,
    saved_at: savedAt,
    engine,
    ui: { chat: messages, rolls },
  });
  return {
    json,
    info: {
      savedAt,
      day: typeof engine.scene?.day === "number" ? engine.scene.day : null,
      location: typeof engine.scene?.location === "string" ? engine.scene.location : "",
    },
  };
}

/** Кампания, в которую пишутся автосохранения: «strange» — «Дом Стрэндж», иначе своя. */
let campaignId = "strange";

export function setAutosaveCampaign(id: string): void {
  campaignId = id;
}

export function autosaveCampaign(): string {
  return campaignId;
}

/** Имя записи хранилища: у «Дома Стрэндж» — прежнее, чтобы старые автосохранения остались видны. */
function webKey(slot: number): string {
  return campaignId === "strange" ? `autosave_${slot}` : `autosave_${campaignId}_${slot}`;
}

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

// ───────────────────────────── приложение ─────────────────────────────

interface TauriAutosave {
  slot: number;
  saved_at: string;
  day: number | null;
  location: string;
}

const tauriStore = {
  async list(): Promise<AutosaveInfo[]> {
    const list = await invoke<TauriAutosave[]>("autosave_list", { campaign: campaignId });
    return list.map((a) => ({ slot: a.slot, savedAt: a.saved_at, day: a.day, location: a.location }));
  },
  async write(slot: number, json: string, info: Omit<AutosaveInfo, "slot">): Promise<void> {
    await invoke("autosave_write", {
      campaign: campaignId,
      slot,
      json,
      savedAt: info.savedAt,
      day: info.day,
      location: info.location,
    });
  },
  read(slot: number): Promise<string> {
    return invoke<string>("autosave_read", { campaign: campaignId, slot });
  },
};

// ───────────────────────────── веб-версия ─────────────────────────────

interface DocSnap {
  exists: boolean;
  data(): Record<string, unknown> | undefined;
}
interface DocRef {
  get(): Promise<DocSnap>;
  set(data: Record<string, unknown>): Promise<void>;
  delete(): Promise<void>;
}
interface Db {
  doc(path: string): DocRef;
}
interface UserApi {
  id(): Promise<string | null>;
}

/** Часть сжатого сохранения в одной записи хранилища (лимит записи — 256 КБ). */
const PART_SIZE = 180_000;

async function gzipBase64(text: string): Promise<string> {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

async function gunzipBase64(data: string): Promise<string> {
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Response(stream).text();
}

let webDb: Promise<{ db: Db; uid: string } | null> | null = null;

function connectWebDb(): Promise<{ db: Db; uid: string } | null> {
  if (!webDb) {
    webDb = (async () => {
      const rt = typeof window !== "undefined" ? window.claude : undefined;
      if (!rt) return null;
      try {
        const [db, user] = (await Promise.all([rt.use("db"), rt.use("user")])) as [Db | null, UserApi | null];
        const uid = user ? await user.id() : null;
        return db && uid ? { db, uid } : null;
      } catch {
        return null;
      }
    })();
  }
  return webDb;
}

const LOCAL_KEY = (slot: number) => (campaignId === "strange" ? `dnd.autosave.${slot}` : `dnd.autosave.${campaignId}.${slot}`);

const webStore = {
  async list(): Promise<AutosaveInfo[]> {
    const conn = await connectWebDb();
    const out: AutosaveInfo[] = [];
    for (let slot = 0; slot < AUTOSAVE_SLOTS; slot++) {
      if (conn) {
        const snap = await conn.db.doc(`data/users/${conn.uid}/${webKey(slot)}`).get();
        const d = snap.exists ? snap.data() : undefined;
        if (d && typeof d.savedAt === "string") {
          out.push({
            slot,
            savedAt: d.savedAt,
            day: typeof d.day === "number" ? d.day : null,
            location: typeof d.location === "string" ? d.location : "",
          });
        }
        continue;
      }
      try {
        const raw = window.localStorage.getItem(LOCAL_KEY(slot));
        if (!raw) continue;
        const meta = JSON.parse(raw) as { info: Omit<AutosaveInfo, "slot"> };
        out.push({ slot, ...meta.info });
      } catch {
        // Память браузера недоступна — автосохранений нет.
      }
    }
    return out;
  },
  async write(slot: number, json: string, info: Omit<AutosaveInfo, "slot">): Promise<void> {
    const packed = await gzipBase64(json);
    const conn = await connectWebDb();
    if (conn) {
      const parts = Math.ceil(packed.length / PART_SIZE);
      for (let i = 0; i < parts; i++) {
        await conn.db
          .doc(`data/users/${conn.uid}/${webKey(slot)}_part${i}`)
          .set({ data: packed.slice(i * PART_SIZE, (i + 1) * PART_SIZE) });
      }
      await conn.db.doc(`data/users/${conn.uid}/${webKey(slot)}`).set({ ...info, parts });
      return;
    }
    try {
      window.localStorage.setItem(LOCAL_KEY(slot), JSON.stringify({ info, packed }));
    } catch {
      throw new Error("Автосохранение недоступно: нет хранилища страницы и памяти браузера.");
    }
  },
  async read(slot: number): Promise<string> {
    const conn = await connectWebDb();
    if (conn) {
      const meta = await conn.db.doc(`data/users/${conn.uid}/${webKey(slot)}`).get();
      const parts = Number(meta.data()?.parts ?? 0);
      let packed = "";
      for (let i = 0; i < parts; i++) {
        const snap = await conn.db.doc(`data/users/${conn.uid}/${webKey(slot)}_part${i}`).get();
        packed += String(snap.data()?.data ?? "");
      }
      return gunzipBase64(packed);
    }
    const raw = window.localStorage.getItem(LOCAL_KEY(slot));
    if (!raw) throw new Error("Автосохранение не найдено.");
    return gunzipBase64((JSON.parse(raw) as { packed: string }).packed);
  },
};

function store() {
  return isTauri() ? tauriStore : webStore;
}

/** Автосохранения, новые первыми. */
export async function listAutosaves(): Promise<AutosaveInfo[]> {
  try {
    const list = await store().list();
    return list.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  } catch {
    return [];
  }
}

/** Текст сохранения из ячейки автосохранения. */
export function readAutosave(slot: number): Promise<string> {
  return store().read(slot);
}

/** Записывает автосохранение в самую старую (или пустую) ячейку. */
export async function writeAutosave(messages: ChatMessage[], rolls: TrayRoll[]): Promise<AutosaveInfo> {
  const existing = await listAutosaves();
  const used = new Set(existing.map((a) => a.slot));
  let slot = [...Array(AUTOSAVE_SLOTS).keys()].find((s) => !used.has(s));
  if (slot === undefined) slot = existing[existing.length - 1]?.slot ?? 0;
  const { json, info } = await buildSave(messages, rolls);
  await store().write(slot, json, info);
  return { slot, ...info };
}

/** «5 минут назад» для подписи автосохранения. */
export function ago(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "только что";
  if (minutes < 60) return `${minutes} мин назад`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;
  return new Date(iso).toLocaleString("ru-RU");
}
