"""Образцы фоновой музыки с OpenGameArt: только CC0, только музыка от минуты.

Берёт страницы из коллекции «Dark Fantasy» и дополнительные страницы, проверяет лицензию,
скачивает аудио и сжимает в MP3 для прослушивания. Пишет out/manifest.json.
"""

import html
import json
import re
import subprocess
import sys
import urllib.request
from pathlib import Path

BASE = "https://opengameart.org"
# Похожие на выбранные «Dark Forest Theme», «Dark Theme», «Vampire's Piano»:
# мрачные мелодичные темы на гитаре, струнных и фортепиано.
COLLECTIONS = [f"{BASE}/node/73278"]
EXTRA = [
    f"{BASE}/content/sirens-in-darkness",
    f"{BASE}/node/18887",
    f"{BASE}/node/49460",
    f"{BASE}/content/emotional-piano-loop",
    f"{BASE}/content/sadness",
    f"{BASE}/node/83236",
    f"{BASE}/content/boundless",
    f"{BASE}/content/emotional-piano-0",
    f"{BASE}/content/sad-orchestral-theme",
    f"{BASE}/content/fantasy-lament-for-a-warriors-soul",
]
# Уже выбраны в прошлый раз.
SKIP = {"dark-forest-theme", "dark-theme", "vampires-piano", "115915", "80219"}
LIMIT = 14
out = Path(sys.argv[1] if len(sys.argv) > 1 else "out")
out.mkdir(parents=True, exist_ok=True)


def get(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "dnd-game-ai-music-samples"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def page_info(url: str):
    text = get(url).decode("utf-8", "replace")
    title = re.search(r'<title>\s*([^<|]+?)\s*(?:\||</title>)', text)
    author = re.search(r'field-name-author-submitter.*?<a[^>]*>([^<]+)</a>', text, re.S)
    lic = re.search(r'field-name-field-art-licenses(.*?)</div>\s*</div>\s*</div>', text, re.S)
    lic_text = lic.group(1) if lic else ""
    licenses = re.findall(r'title="([^"]+)"', lic_text) + re.findall(r'>(CC[^<]{0,20})<', lic_text)
    files = re.findall(r'href="(https?://opengameart\.org/sites/default/files/[^"]+\.(?:mp3|ogg|wav|flac))"', text)
    return {
        "page": url,
        "title": html.unescape(title.group(1)) if title else url,
        "author": html.unescape(author.group(1)) if author else "",
        "licenses": sorted(set(l.strip() for l in licenses)),
        "files": list(dict.fromkeys(files)),
        "is_cc0": "CC0" in lic_text or "publicdomain/zero" in lic_text,
    }


def duration(path: Path) -> float:
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True,
    )
    try:
        return float(r.stdout.strip())
    except ValueError:
        return 0.0


pages = []
for c in COLLECTIONS:
    try:
        text = get(c).decode("utf-8", "replace")
        for slug in re.findall(r'href="(/content/[a-z0-9\-]+)"', text):
            pages.append(BASE + slug)
    except Exception as e:  # noqa: BLE001
        print("collection failed", c, e)
pages = [p for p in dict.fromkeys(EXTRA + pages) if p.rstrip("/").split("/")[-1] not in SKIP]
print(len(pages), "pages")

manifest = []
for url in pages:
    if len(manifest) >= LIMIT:
        break
    try:
        info = page_info(url)
    except Exception as e:  # noqa: BLE001
        print("skip", url, e)
        continue
    if not info["is_cc0"] or not info["files"]:
        print("skip (license/files)", url, info["licenses"])
        continue
    pick = sorted(info["files"], key=lambda f: [".mp3", ".ogg", ".flac", ".wav"].index(Path(f).suffix.lower()))[0]
    raw = out / ("raw" + Path(pick).suffix)
    try:
        raw.write_bytes(get(pick))
    except Exception as e:  # noqa: BLE001
        print("download failed", pick, e)
        continue
    secs = duration(raw)
    if secs < 60:
        print("skip short", url, secs)
        raw.unlink()
        continue
    n = len(manifest) + 1
    name = f"{n:02d}-" + re.sub(r"[^a-z0-9]+", "-", info["title"].lower()).strip("-")[:40] + ".mp3"
    subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-y", "-i", str(raw), "-t", "240", "-ac", "2",
         "-codec:a", "libmp3lame", "-b:a", "128k", str(out / name)],
        check=True,
    )
    raw.unlink()
    manifest.append({**info, "file": name, "source_file": pick, "seconds": round(secs)})
    print("ok", name, round(secs), "s")

(out / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
print("total", len(manifest))
