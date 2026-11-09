// Громкость треков фоновой музыки (EBU R128, интегральная громкость в LUFS) через ffmpeg.
// По этим числам в fetch-music.mjs задано поле lufs, из которого считается выравнивающее усиление.
// Запуск после fetch-music.mjs: node scripts/measure-music.mjs

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const DIR = join(process.cwd(), "public", "music");
const { tracks } = JSON.parse(readFileSync(join(DIR, "manifest.json"), "utf8"));
for (const t of tracks) {
  const run = spawnSync(
    "ffmpeg",
    ["-hide_banner", "-nostats", "-i", join(DIR, t.file), "-af", "loudnorm=print_format=json", "-f", "null", "-"],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  if (run.error) throw new Error(`ffmpeg не запустился: ${run.error.message}`);
  const out = run.stderr;
  const report = JSON.parse(out.slice(out.lastIndexOf("{"), out.lastIndexOf("}") + 1));
  console.log(`LOUDNESS ${t.id} ${Number(report.input_i).toFixed(1)} LUFS, пик ${Number(report.input_tp).toFixed(1)} dBTP`);
}
