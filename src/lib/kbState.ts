// Состояние окна базы знаний на устройстве игрока: пароль слоя мастера и отметки «новое».
//
// Пароль мастера: хранится только хэш (SHA-256 с солью) в localStorage. Слой мастера
// открывается после ввода пароля и остаётся открытым до перезапуска игры — признак
// «открыт» живёт в памяти и никуда не сохраняется.
//
// «Новое»: что игрок уже видел в базе (последняя запись и созданные карточки) — по кампаниям.

import { currentCampaignId } from "./campaigns";

const HASH_KEY = "dnd.gmHash";
const SALT = "dnd-game-ai.gm.v1:";
const SEEN_KEY = "dnd.kbSeen";

let unlocked = false;

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as T);
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Хранилище недоступно: пароль и отметки действуют до перезапуска.
  }
}

async function hash(password: string): Promise<string> {
  const data = new TextEncoder().encode(SALT + password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Задан ли пароль слоя мастера. */
export function gmPasswordSet(): boolean {
  return typeof read<string>(HASH_KEY) === "string";
}

/** Слой мастера закрыт: пароль задан и в этом запуске ещё не введён. */
export function gmLocked(): boolean {
  return gmPasswordSet() && !unlocked;
}

/** Ввод пароля: `true` — слой открыт до перезапуска игры. */
export async function gmUnlock(password: string): Promise<boolean> {
  const ok = (await hash(password)) === read<string>(HASH_KEY);
  if (ok) unlocked = true;
  return ok;
}

/** Задать или сменить пароль (слой при этом остаётся открытым до перезапуска). */
export async function gmSetPassword(password: string): Promise<void> {
  write(HASH_KEY, await hash(password));
  unlocked = true;
}

/** Убрать пароль: слой мастера снова открывается одним нажатием. */
export function gmClearPassword(): void {
  write(HASH_KEY, null);
  unlocked = false;
}

/** Что игрок уже видел в базе этой кампании. */
export interface KbSeen {
  noteId: number;
  cards: string[];
}

type SeenStore = Record<string, KbSeen>;

/** `null` — базу в этой кампании ещё не открывали: «новым» ничего не считается. */
export function kbSeen(): KbSeen | null {
  return read<SeenStore>(SEEN_KEY)?.[currentCampaignId()] ?? null;
}

export function markKbSeen(seen: KbSeen): void {
  write(SEEN_KEY, { ...(read<SeenStore>(SEEN_KEY) ?? {}), [currentCampaignId()]: seen });
}

/**
 * Сколько нового в базе с прошлого открытия (для отметки на кнопке меню): записи и
 * карточки мастера в слоях игрока и мира. Слой мастера не считается — это его тайны.
 */
export function kbFreshCount(
  notes: { id: number; layer: string; by_player: boolean }[],
  cards: { id: string; layer: string; by_player: boolean }[],
): number {
  const seen = kbSeen();
  if (!seen) return 0;
  const visible = (layer: string) => layer !== "master";
  return (
    notes.filter((n) => visible(n.layer) && !n.by_player && n.id > seen.noteId).length +
    cards.filter((c) => visible(c.layer) && !c.by_player && !seen.cards.includes(c.id)).length
  );
}
