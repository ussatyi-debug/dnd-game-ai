// Скачивает фоновую музыку в public/music/ для сборки приложения.
// Все треки — с OpenGameArt под лицензией CC0 (общественное достояние, указание автора не
// обязательно; авторы всё равно перечислены в манифесте и в приложении).
//
// Запуск: node scripts/fetch-music.mjs. Уже скачанные файлы повторно не качаются.
// Веб-версия эти файлы не использует (страница внутри Claude не загружает внешние файлы).

import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "public", "music");
const OGA = "https://opengameart.org/sites/default/files";

/**
 * Настроения: menu — главное меню; calm — основной фон игры; travel_day и travel_night —
 * путешествие днём и ночью; battle — бой.
 */
const TRACKS = [
  // Начало трека (3 с тишины и шума) пропускается, громкость чуть выше остальных.
  { id: "osare", mood: "menu", title: "Osare (Unrest Theme)", author: "HaelDB", page: "https://opengameart.org/content/osare-unrest-theme", file: "42b4b.ogg", start: 3, gain: 1.3 },
  { id: "battlegrounds", mood: "battle", title: "Fantasy — Battlegrounds", author: "Doge", page: "https://opengameart.org/content/fantasy-battlegrounds", file: "battleground_remastered_0.mp3" },
  { id: "sirens", mood: "travel_day", title: "Sirens in Darkness", author: "cynicmusic", page: "https://opengameart.org/content/sirens-in-darkness", file: "012_Sirens_in_Darkness_0.mp3" },
  { id: "ghost-piano", mood: "travel_night", title: "Dark environment — Horror games", author: "KiluaBoy", page: "https://opengameart.org/node/83236", file: "GoshtPiano2.ogg" },
  { id: "dark-forest", mood: "calm", title: "Dark Forest Theme", author: "cynicmusic", page: "https://opengameart.org/content/dark-forest-theme", file: "GameMusic_ForestTheme_24_0.mp3" },
  { id: "dark-theme", mood: "calm", title: "Dark Theme", author: "JaggedStone", page: "https://opengameart.org/content/dark-theme", file: "theme_0.ogg" },
  { id: "vampires-piano", mood: "calm", title: "Vampire's Piano", author: "TAD", page: "https://opengameart.org/content/vampires-piano", file: "vampires_piano_6.mp3" },
  { id: "emotional-piano", mood: "calm", title: "Emotional Piano", author: "Centurion_of_war", page: "https://opengameart.org/content/emotional-piano-0", file: "emotional_piano_2.ogg" },
  { id: "lament", mood: "calm", title: "Fantasy: Lament for a Warrior's Soul", author: "RandomMind", page: "https://opengameart.org/content/fantasy-lament-for-a-warriors-soul", file: "Lament_for_a_Warriors_Soul.mp3" },
  { id: "chasing-despair", mood: "calm", title: "Chasing Despair", author: "Emma_MA", page: "https://opengameart.org/content/chasing-despair", file: "chasing%20despair_0.mp3" },
  { id: "abandoned-castle", mood: "calm", title: "Within the Abandoned Castle", author: "Spring Spring", page: "https://opengameart.org/content/within-the-abandoned-castle", file: "within%20the%20abandoned%20castle%20V2_0.ogg" },
  { id: "emotional-soundtrack", mood: "calm", title: "Emotional Soundtrack 1", author: "Pro Sensory", page: "https://opengameart.org/content/emotional-soundtrack-1", file: "improv_november_14_0.mp3" },
];

async function download(url, path) {
  if (existsSync(path) && statSync(path).size > 0) return;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { redirect: "follow", headers: { "User-Agent": "dnd-game-ai-build" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      writeFileSync(path, Buffer.from(await res.arrayBuffer()));
      return;
    } catch (e) {
      if (attempt === 3) throw new Error(`Не скачан ${url}: ${e.message}`);
      await new Promise((r) => setTimeout(r, attempt * 3000));
    }
  }
}

mkdirSync(OUT, { recursive: true });
const tracks = [];
let total = 0;
for (const t of TRACKS) {
  const ext = t.file.slice(t.file.lastIndexOf("."));
  const name = `${t.id}${ext}`;
  const path = join(OUT, name);
  await download(`${OGA}/${t.file}`, path);
  total += statSync(path).size;
  tracks.push({ id: t.id, mood: t.mood, title: t.title, author: t.author, page: t.page, license: "CC0", file: name, start: t.start ?? 0, gain: t.gain ?? 1 });
  console.log(`${name}: ${(statSync(path).size / 1048576).toFixed(1)} МБ`);
}
writeFileSync(join(OUT, "manifest.json"), JSON.stringify({ tracks }, null, 2));
console.log(`Музыка: ${tracks.length} треков, ${(total / 1048576).toFixed(1)} МБ в public/music`);
