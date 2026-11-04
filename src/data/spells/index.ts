// Каталог заклинаний для интерфейса. Источник — data/spells (см. scripts/build-spells.ts).

import { SPELLS } from "./catalog.generated.ts";
import type { SpellData } from "./types.ts";

export type { SpellData } from "./types.ts";
export { SPELLS };

export const SPELL_BY_ID: ReadonlyMap<string, SpellData> = new Map(SPELLS.map((s) => [s.id, s]));

export const CLASS_LABELS: Record<string, string> = {
  bard: "Бард",
  cleric: "Жрец",
  druid: "Друид",
  paladin: "Паладин",
  ranger: "Следопыт",
  sorcerer: "Чародей",
  warlock: "Колдун",
  wizard: "Волшебник",
};

/** «Заговор», «3 круг». */
export function levelLabel(level: number): string {
  return level === 0 ? "Заговор" : `${level} круг`;
}

/** Атрибуция SRD 5.1 (CC-BY-4.0) — обязательна при показе текстов SRD. */
export const SRD_ATTRIBUTION =
  "Содержит материалы System Reference Document 5.1 © Wizards of the Coast LLC, " +
  "лицензия CC-BY-4.0 (creativecommons.org/licenses/by/4.0). Перевод — проект DnD Game AI.";
