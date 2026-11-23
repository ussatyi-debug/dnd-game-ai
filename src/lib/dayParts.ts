/**
 * Части суток (решение владельца 23.11.2026): игрок видит часть суток, а не часы. Шкала — как в
 * движке (`crates/engine/src/clock.rs`, `DAY_PARTS`).
 */
export const DAY_PARTS: readonly { name: string; from: number }[] = [
  { name: "глубокая ночь", from: 0 },
  { name: "рассвет", from: 4 * 60 },
  { name: "утро", from: 6 * 60 },
  { name: "позднее утро", from: 9 * 60 },
  { name: "полдень", from: 11 * 60 + 30 },
  { name: "день", from: 13 * 60 },
  { name: "предвечерье", from: 16 * 60 },
  { name: "вечер", from: 18 * 60 },
  { name: "поздний вечер", from: 21 * 60 },
  { name: "ночь", from: 23 * 60 },
];

/** Части суток, когда в дороге звучит ночная музыка. */
const NIGHT_PARTS = new Set(["вечер", "поздний вечер", "ночь", "глубокая ночь"]);

/** Часть суток по времени сцены «ЧЧ:ММ»; запись словом (старые сохранения) — как есть. */
export function dayPart(time: string | null | undefined): string | null {
  const text = time?.trim();
  if (!text) return null;
  const m = /(\d{1,2}):(\d{2})/.exec(text);
  if (!m) return text;
  const minutes = (Number(m[1]) % 24) * 60 + Number(m[2]);
  let name = DAY_PARTS[0]!.name;
  for (const p of DAY_PARTS) if (p.from <= minutes) name = p.name;
  return name;
}

/** Тёмное время суток (вечер и ночь) — по часам или по слову. */
export function isNight(time: string | null | undefined): boolean {
  const part = dayPart(time);
  if (!part) return false;
  return NIGHT_PARTS.has(part) || /ноч|вечер|сумер|закат/i.test(part);
}
