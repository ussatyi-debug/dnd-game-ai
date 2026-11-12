// PDF листа героя, собранный в игре без окна печати (на телефоне печати нет).
//
// Лист рисуется на холсте (холст знает кириллицу и шрифты устройства), каждая страница A4 —
// картинка JPEG. PDF записывается целиком в ASCII: картинки — фильтром ASCIIHex поверх DCT,
// поэтому файл сохраняется тем же путём, что и текстовые (JSON, DOC). В PDF вложен файл листа
// для импорта (комментарий-метка вне объектов — просмотрщики его не показывают).

import type { SheetFile } from "./sheetExport";

export type SheetBlock =
  | { kind: "title"; text: string }
  | { kind: "sub"; text: string }
  | { kind: "boxes"; items: [string, string, string?][] }
  | { kind: "heading"; text: string }
  | { kind: "row"; label: string; value: string }
  | { kind: "para"; bold?: string; text: string };

const signed = (n: number) => (n >= 0 ? `+${n}` : `−${Math.abs(n)}`);

/** Содержимое листа по блокам — то же, что в DOC. */
export function sheetBlocks(f: SheetFile): SheetBlock[] {
  const { sheet: s, details: d } = f;
  const classes = s.classes.map((c) => `${c.class}${c.subclass ? ` (${c.subclass})` : ""} ${c.level}`).join(", ");
  const out: SheetBlock[] = [
    { kind: "title", text: s.name },
    { kind: "sub", text: [s.race, classes, d.background, d.alignment].filter(Boolean).join(" · ") },
    {
      kind: "boxes",
      items: [
        ...s.abilities.map((a): [string, string, string] => [a.label, String(a.score), signed(a.modifier)]),
        ["КД", String(s.armor_class)],
        ["Хиты", String(s.hit_points.max)],
        ["Инициатива", signed(s.initiative)],
        ["Скорость", `${s.speed_ft} фт`],
        ["Мастерство", signed(s.proficiency_bonus)],
      ],
    },
  ];
  if (d.xp != null) {
    out.push({ kind: "row", label: "Опыт", value: d.xp_next != null ? `${d.xp} / ${d.xp_next}` : String(d.xp) });
  }
  out.push({ kind: "heading", text: "Спасброски и навыки" });
  for (const x of d.saves) out.push({ kind: "row", label: `Спасбросок: ${x.label}${x.proficient ? " ●" : ""}`, value: signed(x.total) });
  for (const x of d.skills) {
    const mark = x.proficiency === "expertise" ? " ●●" : x.proficiency === "proficient" ? " ●" : "";
    out.push({ kind: "row", label: `${x.name} (${x.ability_label})${mark}`, value: signed(x.total) });
  }
  out.push({ kind: "row", label: "Пассивная Внимательность", value: String(d.passive_perception) });
  out.push({ kind: "row", label: "Пассивная Проницательность", value: String(d.passive_insight) });
  out.push({ kind: "heading", text: "Атаки" });
  for (const a of d.attacks) {
    const hit = a.save_dc ? `КС ${a.save_dc}` : signed(a.to_hit);
    out.push({ kind: "row", label: a.name, value: `${hit} · ${a.damage}${a.range ? ` · ${a.range}` : ""}${a.notes ? ` · ${a.notes}` : ""}` });
  }
  out.push({ kind: "heading", text: "Владения" });
  for (const p of d.proficiencies) out.push({ kind: "row", label: p.kind, value: p.text });
  out.push({ kind: "heading", text: "Умения" });
  for (const x of d.features) out.push({ kind: "para", bold: `${x.name} (${x.source}). `, text: x.text });
  if (d.appearance) {
    out.push({ kind: "heading", text: "Внешность" });
    out.push({ kind: "para", text: d.appearance });
  }
  out.push({ kind: "sub", text: `DnD Game AI · ${new Date(f.exported_at).toLocaleDateString("ru-RU")}` });
  return out;
}

// A4 при 150 точек на дюйм.
const W = 1240;
const H = 1754;
const M = 90;
const SERIF = 'Georgia, "Times New Roman", "Noto Serif", serif';
const INK = "#1d1a16";
const GOLD = "#5a4320";
const LINE = "#c9b48a";

/** Перенос строки по словам под ширину. */
function wrap(ctx: CanvasRenderingContext2D, text: string, width: number, firstIndent = 0): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    let indent = lines.length === 0 ? firstIndent : 0;
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width + indent > width && line) {
        lines.push(line);
        line = word;
        indent = 0;
      } else {
        line = next;
      }
    }
    lines.push(line);
  }
  return lines;
}

/** Страницы листа как JPEG (байты). */
function renderPages(blocks: SheetBlock[]): Uint8Array[] {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("PDF недоступен: нет холста для рисования.");
  const pages: Uint8Array[] = [];
  let y = M;

  const startPage = () => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    ctx.textBaseline = "top";
    y = M;
  };
  const flush = () => pages.push(jpegBytes(canvas));
  const need = (h: number) => {
    if (y + h > H - M) {
      flush();
      startPage();
    }
  };
  const font = (size: number, weight = "normal", style = "normal") => {
    ctx.font = `${style} ${weight} ${size}px ${SERIF}`;
  };

  startPage();
  for (const b of blocks) {
    switch (b.kind) {
      case "title": {
        font(46, "bold");
        need(60);
        ctx.fillStyle = INK;
        ctx.fillText(b.text, M, y);
        y += 62;
        break;
      }
      case "sub": {
        font(24);
        ctx.fillStyle = "#555555";
        for (const line of wrap(ctx, b.text, W - 2 * M)) {
          need(32);
          ctx.fillText(line, M, y);
          y += 32;
        }
        y += 12;
        break;
      }
      case "boxes": {
        const gap = 10;
        const perRow = 6;
        const bw = (W - 2 * M - gap * (perRow - 1)) / perRow;
        const bh = 104;
        b.items.forEach(([label, value, extra], i) => {
          const col = i % perRow;
          if (col === 0) {
            if (i > 0) y += bh + gap;
            need(bh);
          }
          const x = M + col * (bw + gap);
          ctx.strokeStyle = LINE;
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, bw, bh);
          ctx.fillStyle = INK;
          ctx.textAlign = "center";
          font(20);
          ctx.fillText(label, x + bw / 2, y + 10, bw - 10);
          font(34, "bold");
          ctx.fillText(value, x + bw / 2, y + 36, bw - 10);
          if (extra) {
            font(20);
            ctx.fillText(extra, x + bw / 2, y + 76, bw - 10);
          }
          ctx.textAlign = "left";
        });
        y += bh + 20;
        break;
      }
      case "heading": {
        font(30, "bold");
        need(70);
        y += 14;
        ctx.fillStyle = GOLD;
        ctx.fillText(b.text, M, y);
        y += 40;
        ctx.fillStyle = "#8a6d3b";
        ctx.fillRect(M, y, W - 2 * M, 2);
        y += 12;
        break;
      }
      case "row": {
        font(23);
        const labelW = (W - 2 * M) * 0.42;
        const valueW = W - 2 * M - labelW - 16;
        const left = wrap(ctx, b.label, labelW - 12);
        const right = wrap(ctx, b.value, valueW);
        const h = Math.max(left.length, right.length) * 30 + 10;
        need(h);
        ctx.fillStyle = "#f3ead7";
        ctx.fillRect(M, y, labelW, h);
        ctx.strokeStyle = LINE;
        ctx.lineWidth = 1;
        ctx.strokeRect(M, y, W - 2 * M, h);
        ctx.fillStyle = INK;
        left.forEach((l, i) => ctx.fillText(l, M + 8, y + 5 + i * 30));
        right.forEach((l, i) => ctx.fillText(l, M + labelW + 10, y + 5 + i * 30));
        y += h;
        break;
      }
      case "para": {
        font(23);
        const boldW = b.bold ? (font(23, "bold"), ctx.measureText(b.bold).width) : 0;
        font(23);
        const lines = wrap(ctx, b.text, W - 2 * M, boldW);
        lines.forEach((l, i) => {
          need(30);
          let x = M;
          if (i === 0 && b.bold) {
            font(23, "bold");
            ctx.fillStyle = GOLD;
            ctx.fillText(b.bold, x, y);
            x += boldW;
            font(23);
          }
          ctx.fillStyle = INK;
          ctx.fillText(l, x, y);
          y += 30;
        });
        y += 8;
        break;
      }
    }
  }
  flush();
  return pages;
}

function jpegBytes(canvas: HTMLCanvasElement): Uint8Array {
  const url = canvas.toDataURL("image/jpeg", 0.85);
  const bin = atob(url.slice(url.indexOf(",") + 1));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function hex(bytes: Uint8Array): string {
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i += 64) {
    let line = "";
    for (const b of bytes.subarray(i, i + 64)) line += b.toString(16).padStart(2, "0");
    parts.push(line);
  }
  return `${parts.join("\n")}>`;
}

/** PDF из страниц-картинок; весь файл — ASCII. `embed` — метка с файлом листа. */
export function sheetPdf(blocks: SheetBlock[], embed: string): string {
  const pages = renderPages(blocks);
  const objects: string[] = [];
  const add = (body: string) => {
    objects.push(body);
    return objects.length;
  };
  const catalog = add("");
  const pagesId = add("");
  const kids: number[] = [];
  for (const jpeg of pages) {
    const data = hex(jpeg);
    const image = add(
      `<< /Type /XObject /Subtype /Image /Width ${W} /Height ${H} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter [/ASCIIHexDecode /DCTDecode] /Length ${data.length} >>\nstream\n${data}\nendstream`,
    );
    // A4 — 595 × 842 пунктов.
    const draw = `q 595 0 0 842 0 0 cm /Im0 Do Q`;
    const content = add(`<< /Length ${draw.length} >>\nstream\n${draw}\nendstream`);
    kids.push(
      add(
        `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 ${image} 0 R >> >> /Contents ${content} 0 R >>`,
      ),
    );
  }
  objects[catalog - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${kids.map((k) => `${k} 0 R`).join(" ")}] /Count ${kids.length} >>`;

  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const o of offsets) out += `${String(o).padStart(10, "0")} 00000 n \n`;
  out += `trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  // Файл листа для импорта — комментарием после конца документа: просмотрщики его пропускают.
  out += `%${embed}\n`;
  return out;
}
