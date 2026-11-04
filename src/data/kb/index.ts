import { MASTER_ENTRIES, MASTER_LAYER } from "./master.ts";
import { PLAYER_ENTRIES, PLAYER_LAYER } from "./player.ts";
import type { KbEntry, KbLayerInfo } from "./types.ts";
import { WORLD_ENTRIES, WORLD_LAYER } from "./world.ts";

export * from "./types.ts";

export const KB_LAYERS: KbLayerInfo[] = [WORLD_LAYER, PLAYER_LAYER, MASTER_LAYER];

export const KB_ENTRIES: KbEntry[] = [...WORLD_ENTRIES, ...PLAYER_ENTRIES, ...MASTER_ENTRIES];

export const KB_BY_ID: ReadonlyMap<string, KbEntry> = new Map(KB_ENTRIES.map((e) => [e.id, e]));

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
