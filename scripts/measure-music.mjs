// Громкость треков фоновой музыки (EBU R128, интегральная громкость в LUFS) через ffmpeg.
// По этим числам в fetch-music.mjs задано поле lufs, из которого считается выравнивающее усиление.
// Запуск после fetch-music.mjs: node scripts/measure-music.mjs

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const DIR = join(process.cwd(), "public", "music");
const { tracks } = JSON.parse(readFileSync(join(DIR, "manifest.json"), "utf8"));
const rows = [];
for (const t of tracks) {
  let out = "";
  try {
    execFileSync("ffmpeg", ["-hide_banner", "-nostats", "-i", join(DIR, t.file), "-af", "loudnorm=print_format=json", "-f", "null", "-"], {
      stdio: ["ignore", "ignore", "pipe"],
    });
  } catch (e) {
    out = String(e.stderr ?? "");
  }
  // ffmpeg пишет отчёт в stderr; при успехе execFileSync его не возвращает — повторим с захватом.
  if (!out) {
    out = execFileSync(
      "sh",
      ["-c", `ffmpeg -hide_banner -nostats -i "${join(DIR, t.file)}" -af loudnorm=print_format=json -f null - 2>&1`],
      { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
    );
  }
  const json = out.slice(out.lastIndexOf("{"), out.lastIndexOf("}") + 1);
  const report = JSON.parse(json);
  rows.push({ id: t.id, lufs: Number(report.input_i), peak: Number(report.input_tp) });
}
for (const r of rows) console.log(`LOUDNESS ${r.id} ${r.lufs.toFixed(1)} LUFS, пик ${r.peak.toFixed(1)} dBTP`);
