// Проверка озвучки Piper в браузере: собранная страница приложения (dist/ с public/tts)
// открывается в Chromium, синтезируется фраза каждым голосом.
// Запуск в CI: node scripts/tts-smoke.mjs (нужен пакет playwright и браузер chromium).

import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { chromium } from "playwright";

const ROOT = join(process.cwd(), "dist");
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".wasm": "application/wasm",
  ".onnx": "application/octet-stream",
  ".data": "application/octet-stream",
};

const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent((req.url ?? "/").split("?")[0])).replace(/^([/\\])+/, "");
  let file = join(ROOT, path || "index.html");
  if (!existsSync(file) || statSync(file).isDirectory()) file = join(ROOT, "index.html");
  res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(4173, r));

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

let failed = false;
try {
  await page.goto("http://localhost:4173/");
  await page.waitForFunction(() => "__dndTts" in window, null, { timeout: 30000 });
  const manifest = await page.evaluate(() => window.__dndTts.available());
  if (!manifest) throw new Error("manifest.json озвучки не найден");
  for (const voice of ["dmitri", "irina"]) {
    const r = await page.evaluate(
      (v) => window.__dndTts.synth("Сэр Ни́кис, Альт-Варден ждёт вашего слова.", v),
      voice,
    );
    console.log(`${voice}: ${r.samples} отсчётов, ${(r.samples / r.sampleRate).toFixed(2)} с звука, пик ${r.peak.toFixed(3)}, синтез ${r.ms} мс`);
    if (r.samples < r.sampleRate * 0.8 || !(r.peak > 0.01)) throw new Error(`${voice}: звук пустой`);
  }
} catch (e) {
  failed = true;
  console.error(`Озвучка не работает: ${e.message}`);
} finally {
  // Ошибки движка игры (нет Tauri в обычном браузере) к озвучке не относятся.
  const relevant = errors.filter((e) => /tts|onnx|ort|piper|wasm|phonem/i.test(e));
  if (relevant.length) console.error(`Ошибки страницы:\n${relevant.join("\n")}`);
  await browser.close();
  server.close();
}
process.exit(failed ? 1 : 0);
