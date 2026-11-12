// Экспорт листа персонажа (JSON, PDF, DOC) и импорт листа из любого из трёх форматов.
//
// JSON — описание героя (HeroSpec) в обёртке с версией: его можно импортировать в новой
// кампании, движок проверит лист так же, как при создании. Для отряда «Дома Стрэндж» описания
// нет (листы встроены) — в файл попадает только текущий лист, импортировать его нельзя.
// DOC — HTML-документ, который открывает Word; PDF собирается в игре (страницы-картинки).
// В DOC и PDF вложен тот же файл листа (base64 между метками) — импорт находит его в любом формате.

import { invoke } from "@tauri-apps/api/core";
import { getDownloads } from "./claude";
import { characterDetails, characterSheet, saveState, type CharacterSheet, type SheetDetails } from "./engine";
import type { HeroSpec } from "./heroSpec";
import { sheetBlocks, sheetPdf } from "./sheetPdf";

export const SHEET_FORMAT = "dnd-game-ai.hero";
export const SHEET_VERSION = 1;

export interface SheetFile {
  format: typeof SHEET_FORMAT;
  version: number;
  exported_at: string;
  /** Описание героя для импорта (нет у встроенных листов). */
  spec: HeroSpec | null;
  sheet: CharacterSheet;
  details: SheetDetails;
}

const isTauri = () => typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

/** Имя файла по имени героя без запрещённых символов: «Лисса Тёрн». */
export function fileBase(name: string): string {
  const base = name
    .trim()
    .replace(/[\\/:*?"<>|\u0000-\u001f]+/g, "")
    .replace(/\s+/g, " ")
    .replace(/^\.+/, "")
    .trim();
  return base || "Лист героя";
}

const EMBED_START = "DND-SHEET-BEGIN:";
const EMBED_END = ":DND-SHEET-END";

/** Файл листа для вложения в DOC/PDF: base64 от UTF-8 JSON между метками (только ASCII). */
export function embedSheet(f: SheetFile): string {
  const bytes = new TextEncoder().encode(JSON.stringify(f));
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return `${EMBED_START}${btoa(bin)}${EMBED_END}`;
}

/** Вложенный файл листа из текста DOC/PDF, если он есть. */
function extractEmbedded(text: string): string | null {
  const start = text.indexOf(EMBED_START);
  if (start < 0) return null;
  const end = text.indexOf(EMBED_END, start);
  if (end < 0) return null;
  const b64 = text.slice(start + EMBED_START.length, end).replace(/\s+/g, "");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/** Сохраняет текстовый файл: в приложении — в «Загрузки», в Claude — через платформу, иначе ссылкой. */
export async function saveTextFile(name: string, text: string, mime: string): Promise<string> {
  if (isTauri()) {
    const path = await invoke<string>("export_save", { name, json: text });
    return `Файл сохранён: ${path}`;
  }
  const downloads = await getDownloads();
  if (downloads) {
    await downloads.save({ filename: name, data: text });
    return "Файл сохранён.";
  }
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return "Файл скачан.";
}

/** Описание героя из сохранения своей кампании (по id листа). */
export async function heroSpec(id: string): Promise<HeroSpec | null> {
  const state = (await saveState()) as { campaign?: { heroes?: HeroSpec[] } | null } | null;
  return state?.campaign?.heroes?.find((h) => h.id === id) ?? null;
}

export async function sheetFile(id: string): Promise<SheetFile> {
  const [sheet, details, spec] = await Promise.all([characterSheet(id), characterDetails(id), heroSpec(id).catch(() => null)]);
  return { format: SHEET_FORMAT, version: SHEET_VERSION, exported_at: new Date().toISOString(), spec, sheet, details };
}

const esc = (s: string | number | null | undefined) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c);
const signed = (n: number) => (n >= 0 ? `+${n}` : `−${Math.abs(n)}`);

/** Лист как HTML-документ (для Word и печати). */
export function sheetHtml(f: SheetFile): string {
  const { sheet: s, details: d } = f;
  const classes = s.classes.map((c) => `${c.class}${c.subclass ? ` (${c.subclass})` : ""} ${c.level}`).join(", ");
  const rows = (items: [string, string][]) =>
    items.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join("");
  return `<!DOCTYPE html>
<html lang="ru"><head><meta charset="utf-8"><title>${esc(s.name)} — лист персонажа</title>
<style>
body{font-family:Georgia,"Times New Roman",serif;color:#1d1a16;margin:24px;font-size:11pt}
h1{margin:0;font-size:20pt}h2{font-size:13pt;border-bottom:1px solid #8a6d3b;margin:16px 0 6px;color:#5a4320}
.sub{color:#555;margin:2px 0 10px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #c9b48a;padding:3px 6px;text-align:left;vertical-align:top}
th{background:#f3ead7;width:30%}.grid{display:flex;gap:6px;flex-wrap:wrap}.box{border:1px solid #c9b48a;padding:4px 8px;text-align:center;min-width:70px}
.box b{display:block;font-size:14pt}p{margin:3px 0}.feat b{color:#5a4320}
@media print{body{margin:10mm}}
</style></head><body>
<h1>${esc(s.name)}</h1>
<p class="sub">${esc([s.race, classes, d.background, d.alignment].filter(Boolean).join(" · "))}</p>
<div class="grid">
${s.abilities.map((a) => `<div class="box">${esc(a.label)}<b>${a.score}</b>${signed(a.modifier)}</div>`).join("")}
<div class="box">КД<b>${s.armor_class}</b></div><div class="box">Хиты<b>${s.hit_points.max}</b></div>
<div class="box">Инициатива<b>${signed(s.initiative)}</b></div><div class="box">Скорость<b>${s.speed_ft} фт</b></div>
<div class="box">Мастерство<b>${signed(s.proficiency_bonus)}</b></div>
</div>
<h2>Спасброски и навыки</h2>
<table>${rows(d.saves.map((x) => [`Спасбросок: ${x.label}${x.proficient ? " ●" : ""}`, signed(x.total)]))}
${rows(d.skills.map((x) => [`${x.name} (${x.ability_label})${x.proficiency === "expertise" ? " ●●" : x.proficiency === "proficient" ? " ●" : ""}`, signed(x.total)]))}
${rows([["Пассивная Внимательность", String(d.passive_perception)], ["Пассивная Проницательность", String(d.passive_insight)]])}</table>
<h2>Атаки</h2>
<table>${rows(d.attacks.map((a) => [a.name, `${a.save_dc ? `КС ${a.save_dc}` : signed(a.to_hit)} · ${a.damage}${a.range ? ` · ${a.range}` : ""}${a.notes ? ` · ${a.notes}` : ""}`]))}</table>
<h2>Владения</h2>
<table>${rows(d.proficiencies.map((p) => [p.kind, p.text]))}</table>
<h2>Умения</h2>
${d.features.map((x) => `<p class="feat"><b>${esc(x.name)}</b> <i>${esc(x.source)}</i>. ${esc(x.text).replace(/\n/g, "<br>")}</p>`).join("")}
${d.appearance ? `<h2>Внешность</h2><p>${esc(d.appearance)}</p>` : ""}
<p class="sub" style="margin-top:16px">DnD Game AI · ${esc(new Date(f.exported_at).toLocaleDateString("ru-RU"))}</p>
<!--${embedSheet(f)}-->
</body></html>`;
}

export type SheetFormat = "json" | "doc" | "pdf";

/** Экспорт листа: файл JSON, DOC или PDF. Возвращает сообщение для игрока. */
export async function exportSheet(id: string, format: SheetFormat): Promise<string> {
  const f = await sheetFile(id);
  const base = fileBase(f.sheet.name);
  if (format === "json") {
    const note = f.spec ? "" : " Встроенный лист импортировать нельзя — только посмотреть.";
    return (await saveTextFile(`${base}.json`, JSON.stringify(f, null, 2), "application/json")) + note;
  }
  const html = sheetHtml(f);
  if (format === "doc") return saveTextFile(`${base}.doc`, html, "application/msword");
  const pdf = sheetPdf(sheetBlocks(f), embedSheet(f));
  return saveTextFile(`${base}.pdf`, pdf, "application/pdf");
}

/** Описание героя из файла листа (или из голого HeroSpec). */
export function parseSheetFile(text: string): HeroSpec {
  let data: unknown;
  let json = text;
  if (!text.trimStart().startsWith("{")) {
    const embedded = extractEmbedded(text);
    if (!embedded) {
      throw new Error(
        "В файле нет данных листа. Импортируются JSON, DOC и PDF, сохранённые игрой с версии 0.9.8 (DOC — без пересохранения в Word).",
      );
    }
    json = embedded;
  }
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error("Файл не похож на лист: данные повреждены.");
  }
  const obj = data as Partial<SheetFile> & Partial<HeroSpec>;
  if (obj.format === SHEET_FORMAT) {
    if (!obj.spec) throw new Error("В файле встроенный лист без описания героя — его нельзя импортировать.");
    return obj.spec;
  }
  if (typeof obj.name === "string" && Array.isArray(obj.classes) && obj.abilities) return obj as HeroSpec;
  throw new Error("Файл не похож на лист героя DnD Game AI.");
}
