// Скачивает файлы озвучки Piper в public/tts/ для сборки приложения:
// - onnxruntime-web (выполняет модель голоса, WebAssembly);
// - piper_phonemize (espeak-ng в WebAssembly: текст → фонемы);
// - голоса Piper: Дима (ru_RU-dmitri-medium) и Ира (ru_RU-irina-medium), лицензия MIT.
//
// Запуск: node scripts/fetch-tts.mjs. Уже скачанные файлы повторно не качаются.
// Веб-версия эти файлы не использует (страница внутри Claude не запускает WebAssembly).

import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const OUT = join(process.cwd(), "public", "tts");
const ORT_VERSION = "1.22.0";
const PIPER_WASM_VERSION = "1.0.0";
const HF = "https://huggingface.co/rhasspy/piper-voices/resolve/main/ru/ru_RU";
const VOICES = {
  dmitri: "dmitri/medium/ru_RU-dmitri-medium",
  irina: "irina/medium/ru_RU-irina-medium",
};

async function download(url, path) {
  if (existsSync(path) && statSync(path).size > 0) return;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { redirect: "follow" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      writeFileSync(path, Buffer.from(await res.arrayBuffer()));
      return;
    } catch (e) {
      if (attempt === 3) throw new Error(`Не скачан ${url}: ${e.message}`);
      await new Promise((r) => setTimeout(r, attempt * 3000));
    }
  }
}

async function npmPackage(name, version) {
  const base = name.split("/").pop();
  const url = `https://registry.npmjs.org/${name}/-/${base}-${version}.tgz`;
  const dir = mkdtempSync(join(tmpdir(), "tts-"));
  const tgz = join(dir, "pkg.tgz");
  await download(url, tgz);
  execFileSync("tar", ["-xzf", tgz, "-C", dir]);
  return join(dir, "package");
}

function copyMatching(from, to, test) {
  mkdirSync(to, { recursive: true });
  const copied = [];
  for (const file of readdirSync(from)) {
    if (test(file)) {
      copyFileSync(join(from, file), join(to, file));
      copied.push(file);
    }
  }
  return copied;
}

mkdirSync(OUT, { recursive: true });

const ort = await npmPackage("onnxruntime-web", ORT_VERSION);
const ortFiles = copyMatching(join(ort, "dist"), join(OUT, "ort"), (f) => f === "ort.min.js" || /^ort-wasm-simd-threaded\.(wasm|mjs)$/.test(f));
if (!ortFiles.includes("ort.min.js") || !ortFiles.some((f) => f.endsWith(".wasm"))) {
  throw new Error(`В onnxruntime-web ${ORT_VERSION} нет нужных файлов: ${ortFiles.join(", ")}`);
}

const piper = await npmPackage("@diffusionstudio/piper-wasm", PIPER_WASM_VERSION);
const piperFiles = copyMatching(join(piper, "build"), join(OUT, "piper"), (f) => /^piper_phonemize\.(js|wasm|data)$/.test(f));
if (piperFiles.length !== 3) throw new Error(`В piper-wasm нет фонемизатора: ${piperFiles.join(", ")}`);

const voices = {};
for (const [id, path] of Object.entries(VOICES)) {
  const name = path.split("/").pop();
  await download(`${HF}/${path}.onnx`, join(OUT, `${name}.onnx`));
  await download(`${HF}/${path}.onnx.json`, join(OUT, `${name}.onnx.json`));
  voices[id] = { model: `${name}.onnx`, config: `${name}.onnx.json` };
}

writeFileSync(join(OUT, "manifest.json"), JSON.stringify({ ort: ORT_VERSION, voices }, null, 2));

let total = 0;
for (const sub of ["", "ort", "piper"]) {
  for (const f of readdirSync(join(OUT, sub))) {
    const p = join(OUT, sub, f);
    if (statSync(p).isFile()) {
      total += statSync(p).size;
      console.log(`${join(sub, f)}: ${(statSync(p).size / 1048576).toFixed(1)} МБ`);
    }
  }
}
console.log(`Озвучка: ${(total / 1048576).toFixed(1)} МБ в public/tts`);
