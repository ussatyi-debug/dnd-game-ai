import { MASTER_ENTRIES, MASTER_LAYER } from "./master.ts";
import { PLAYER_ENTRIES, PLAYER_LAYER } from "./player.ts";
import type { KbEntry, KbLayerInfo } from "./types.ts";
import { WORLD_ENTRIES, WORLD_LAYER } from "./world.ts";

export * from "./types.ts";

/** Порядок слоёв: Игрок, Мастер, Мир. */
export const KB_LAYERS: KbLayerInfo[] = [PLAYER_LAYER, MASTER_LAYER, WORLD_LAYER];

export const KB_ENTRIES: KbEntry[] = [...PLAYER_ENTRIES, ...MASTER_ENTRIES, ...WORLD_ENTRIES];

export const KB_BY_ID: ReadonlyMap<string, KbEntry> = new Map(KB_ENTRIES.map((e) => [e.id, e]));

/**
 * Какая часть базы видна в текущей кампании: «Дом Стрэндж» — вся база, своя кампания —
 * только слой «Мир» (записи игрока и мастера относятся к героям «Дома Стрэндж»).
 */
let scope: "all" | "world" = "all";

export function setKbScope(next: "all" | "world"): void {
  scope = next;
}

export function kbScope(): "all" | "world" {
  return scope;
}

/** Карточки, видимые в текущей кампании. */
export function kbEntries(): KbEntry[] {
  return scope === "all" ? KB_ENTRIES : KB_ENTRIES.filter((e) => e.layer === "world");
}

/** Слои базы: в своей кампании слои игрока и мастера наполняются по ходу игры. */
export function kbLayers(): KbLayerInfo[] {
  return KB_LAYERS;
}

/** Места мира для появления героя новой кампании. */
export function worldLocations(): KbEntry[] {
  return KB_ENTRIES.filter((e) => e.layer === "world" && e.id.startsWith("loc."));
}

/** Текст карточки для поиска. */
export function searchText(entry: KbEntry): string {
  return [
    entry.title,
    entry.subtitle ?? "",
    entry.summary,
    entry.statusNote ?? "",
    ...(entry.facts ?? []).flatMap((f) => [f.label, f.value]),
    ...(entry.body ?? []).flatMap((b) => [b.heading ?? "", ...b.paragraphs]),
    ...(entry.tags ?? []),
  ]
    .join(" ")
    .toLowerCase()
    .replace(/ё/g, "е");
}

/**
 * Совпадение по словам запроса с учётом русских окончаний: слово длиннее четырёх букв
 * сравнивается по основе без последних одной-двух букв («узлов» найдёт «узлы»).
 */
export function matchesQuery(entry: KbEntry, query: string): boolean {
  const text = searchText(entry);
  return query
    .toLowerCase()
    .replace(/ё/g, "е")
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => {
      if (text.includes(word)) return true;
      const stem = word.length > 5 ? word.slice(0, -2) : word.length > 4 ? word.slice(0, -1) : word;
      return text.includes(stem);
    });
}

/** Указатель карточек для движка: мастер видит оглавление базы и ссылается на карточки. */
export function kbIndex(): { id: string; title: string; layer: string; status: string | null }[] {
  return kbEntries().map((e) => ({ id: e.id, title: e.title, layer: e.layer, status: e.status ?? null }));
}

function stems(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/ё/g, "е")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length >= 4)
    .map((w) => (w.length > 5 ? w.slice(0, -2) : w.length > 4 ? w.slice(0, -1) : w));
  return [...new Set(words)];
}

/**
 * Карточки, подходящие к заявке игрока: совпадения слов в названии весят больше, чем
 * в тексте. Возвращает лучшие `limit` карточек.
 */
export function relevantEntries(query: string, limit = 4): KbEntry[] {
  const words = stems(query);
  if (words.length === 0) return [];
  const norm = (s: string) => s.toLowerCase().replace(/ё/g, "е");
  return kbEntries().map((entry) => {
    const title = norm(`${entry.title} ${entry.subtitle ?? ""} ${(entry.tags ?? []).join(" ")}`);
    const body = searchText(entry);
    const score = words.reduce((sum, w) => sum + (title.includes(w) ? 3 : body.includes(w) ? 1 : 0), 0);
    return { entry, score };
  })
    .filter((x) => x.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.entry);
}

/** Полный текст карточки для мастера (обрезается до `max` символов). */
export function entryText(entry: KbEntry, max = 2500): string {
  const parts = [
    `${entry.title} [${entry.id}] (${entry.layer})`,
    entry.subtitle ?? "",
    entry.summary,
    ...(entry.facts ?? []).map((f) => `${f.label}: ${f.value}`),
    ...(entry.body ?? []).flatMap((b) => [b.heading ?? "", ...b.paragraphs]),
  ].filter(Boolean);
  const text = parts.join("\n");
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/** Подходящие к заявке карточки одним текстом для контекста мастера. */
export function kbExtraFor(query: string): string {
  return relevantEntries(query)
    .map((e) => entryText(e))
    .join("\n\n---\n\n");
}
