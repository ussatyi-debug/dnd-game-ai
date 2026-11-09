// Свои кампании: список (название, герой, когда начата) и текущая кампания.
//
// Лист героя и всё состояние игры живут в сохранениях кампании (движок пересобирает героя
// из листа при загрузке). Здесь только оглавление для главного экрана.
// - Приложение: файл campaigns.json в папке данных.
// - Веб-версия: запись хранилища страницы, без входа — память браузера.

import { invoke } from "@tauri-apps/api/core";

export const STRANGE_ID = "strange";

export interface CampaignInfo {
  id: string;
  title: string;
  createdAt: string;
  startDay: number;
  hero: { name: string; summary: string; portrait: string };
}

const CURRENT_KEY = "dnd.campaign.current";
const LOCAL_LIST = "dnd.campaigns";

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

interface DocRef {
  get(): Promise<{ exists: boolean; data(): Record<string, unknown> | undefined }>;
  set(data: Record<string, unknown>): Promise<void>;
}

async function webDoc(): Promise<DocRef | null> {
  const rt = typeof window !== "undefined" ? window.claude : undefined;
  if (!rt) return null;
  try {
    const [db, user] = (await Promise.all([rt.use("db"), rt.use("user")])) as [
      { doc(path: string): DocRef } | null,
      { id(): Promise<string | null> } | null,
    ];
    const uid = user ? await user.id() : null;
    return db && uid ? db.doc(`data/users/${uid}/campaigns`) : null;
  } catch {
    return null;
  }
}

function parse(text: string): CampaignInfo[] {
  try {
    const list = JSON.parse(text) as unknown;
    return Array.isArray(list) ? (list as CampaignInfo[]).filter((c) => c && typeof c.id === "string") : [];
  } catch {
    return [];
  }
}

export async function listCampaigns(): Promise<CampaignInfo[]> {
  if (isTauri()) return parse(await invoke<string>("campaigns_read"));
  const doc = await webDoc();
  if (doc) {
    const snap = await doc.get();
    const json = snap.exists ? snap.data()?.json : undefined;
    return typeof json === "string" ? parse(json) : [];
  }
  try {
    return parse(window.localStorage.getItem(LOCAL_LIST) ?? "[]");
  } catch {
    return [];
  }
}

async function writeCampaigns(list: CampaignInfo[]): Promise<void> {
  const json = JSON.stringify(list);
  if (isTauri()) {
    await invoke("campaigns_write", { json });
    return;
  }
  const doc = await webDoc();
  if (doc) {
    await doc.set({ json });
    return;
  }
  window.localStorage.setItem(LOCAL_LIST, json);
}

export async function addCampaign(info: CampaignInfo): Promise<void> {
  const list = await listCampaigns();
  await writeCampaigns([info, ...list.filter((c) => c.id !== info.id)]);
}

export async function removeCampaign(id: string): Promise<void> {
  const list = await listCampaigns();
  await writeCampaigns(list.filter((c) => c.id !== id));
}

/** Текущая кампания (запоминается между запусками). */
export function currentCampaignId(): string {
  try {
    return window.localStorage.getItem(CURRENT_KEY) ?? STRANGE_ID;
  } catch {
    return STRANGE_ID;
  }
}

export function setCurrentCampaignId(id: string): void {
  try {
    window.localStorage.setItem(CURRENT_KEY, id);
  } catch {
    // Память браузера недоступна — кампания выбирается заново при запуске.
  }
}

/** ID новой кампании: латиница и цифры (имя папки сохранений). */
export function newCampaignId(): string {
  const stamp = Date.now().toString(36);
  const rand = Math.floor(Math.random() * 36 ** 3).toString(36);
  return `c-${stamp}-${rand}`;
}
