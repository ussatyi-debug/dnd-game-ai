#!/usr/bin/env python3
"""Ответы Gemini (слой «Мир») → src/data/kb/world.generated.ts.

Запуск: python3 tools/gemini/kb_import.py tools/gemini/answers/kb_world_batch*.json  (партии по порядку: поздняя главнее)
        python3 tools/gemini/kb_import.py --check   (только проверка уже встроенного)

Проверяет каждую карточку (поля, разделы, префиксы id, статусы, связи и родителей, английские
слова в тексте) и встраивает: карточка с тем же id заменяет прежнюю. Ошибки — построчно;
при ошибках файл не меняется. Затем запустите: node --experimental-strip-types scripts/test-knowledge.ts
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
OUT = ROOT / "src/data/kb/world.generated.ts"
CURRENT = ROOT / "tools/gemini/kb_world_current.json"

SECTIONS = {"npc": "npc.", "locations": "loc.", "factions": "fac.", "lore": "lore.", "artifacts": "art."}
STATUSES = {"active", "ally", "vassal", "neutral", "watch", "enemy", "prisoner", "dead", "open",
            "progress", "done", "failed", "planned"}
FIELDS = ["id", "layer", "section", "group", "strangeOnly", "parent", "title", "subtitle", "summary",
          "status", "statusNote", "facts", "body", "tags", "related", "source", "link"]
# Латиница из 3+ букв, кроме римских цифр (Генрих III).
LATIN = re.compile(r"\b(?![IVXLCDM]+\b)[A-Za-z]{3,}\b")
# Карточки, которые раскрывают тайну отряда даже в «публичной» версии Gemini (решение разработчика):
# видны только в кампании «Дом Стрэндж». Звёздный Мост: работа сети и открытые терминалы — тайна.
FORCE_STRANGE_ONLY = {"lore.star_bridge"}
HEADER = (
    "// Сгенерировано tools/gemini/kb_import.py из ответов Gemini — не править вручную.\n"
    "// Карточки слоя «Мир» на День 98: новые и обновлённые (заменяют карточки world.ts с тем же id).\n\n"
    'import type { KbEntry } from "./types.ts";\n\n'
)


def load_generated() -> list[dict]:
    text = OUT.read_text(encoding="utf-8")
    body = text.split("export const WORLD_GENERATED: KbEntry[] = ", 1)[1].rsplit(";", 1)[0]
    return json.loads(body)


def all_known_ids() -> set[str]:
    """id всех карточек базы: выгрузка kb_export.ts (если свежая) и встроенные карточки."""
    subprocess.run(["node", "--experimental-strip-types", "--no-warnings", "tools/gemini/kb_export.ts", "world"],
                   cwd=ROOT, check=True, capture_output=True)
    data = json.loads(CURRENT.read_text(encoding="utf-8"))
    return {x["id"] for x in data["all_ids"]}


def text_of(card: dict) -> list[str]:
    parts = [card.get("title", ""), card.get("subtitle") or "", card.get("summary", ""), card.get("statusNote") or ""]
    for f in card.get("facts") or []:
        parts += [f.get("label", ""), f.get("value", "")]
    for b in card.get("body") or []:
        parts += [b.get("heading") or ""] + list(b.get("paragraphs") or [])
    return parts


def normalize(card: dict) -> dict:
    out = {"layer": "world"}
    for key in FIELDS:
        if key == "layer":
            continue
        value = card.get(key)
        if value in (None, "", [], False):
            continue
        out[key] = value
    return {k: out[k] for k in FIELDS if k in out}


def check(cards: list[dict], known: set[str]) -> list[str]:
    errors = []
    ids = [c.get("id") for c in cards]
    dup = {i for i in ids if ids.count(i) > 1}
    if dup:
        errors.append(f"повтор id в ответах: {sorted(dup)}")
    every = known | set(ids)
    for c in cards:
        cid = c.get("id") or "?"
        sec = c.get("section")
        if sec not in SECTIONS:
            errors.append(f"{cid}: раздел «{sec}» — нужен один из {sorted(SECTIONS)}")
        elif not cid.startswith(SECTIONS[sec]):
            errors.append(f"{cid}: id раздела {sec} начинается с «{SECTIONS[sec]}»")
        if not re.fullmatch(r"[a-z]+\.[a-z0-9_]+", cid):
            errors.append(f"{cid}: id — латиница, цифры и _")
        for key in ("group", "title", "summary", "source"):
            if not str(c.get(key) or "").strip():
                errors.append(f"{cid}: пустое поле {key}")
        if len(c.get("summary") or "") > 260:
            errors.append(f"{cid}: summary длиннее 260 знаков")
        if c.get("status") not in (None, *STATUSES):
            errors.append(f"{cid}: статус «{c.get('status')}»")
        if c.get("parent") and c["parent"] not in every:
            errors.append(f"{cid}: родитель {c['parent']} не найден")
        for r in c.get("related") or []:
            if r not in every:
                errors.append(f"{cid}: связь на несуществующую карточку {r}")
        for f in c.get("facts") or []:
            if not (f.get("label") and f.get("value")):
                errors.append(f"{cid}: пустой факт {f}")
        for b in c.get("body") or []:
            if not isinstance(b.get("paragraphs"), list):
                errors.append(f"{cid}: body без paragraphs")
        latin = sorted({w for t in text_of(c) for w in LATIN.findall(t)})
        if latin:
            errors.append(f"{cid}: английские слова в тексте: {', '.join(latin[:8])}")
    return errors


def main() -> None:
    files = [a for a in sys.argv[1:] if not a.startswith("--")]
    current = load_generated()
    known = all_known_ids()
    if "--check" in sys.argv:
        errors = check(current, known)
        print("\n".join(errors) or f"Встроено карточек: {len(current)}, замечаний нет")
        sys.exit(1 if errors else 0)
    incoming: list[dict] = []
    for f in files:
        raw = Path(f).read_text(encoding="utf-8").strip()
        raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw)
        incoming += json.loads(raw)
    # Одна карточка в нескольких партиях: побеждает более поздняя (уточнённая) версия.
    latest: dict[str, dict] = {}
    for c in incoming:
        if c.get("id") in latest:
            print(f"повтор {c['id']}: берётся версия из более поздней партии")
        latest[c.get("id")] = c
    incoming = list(latest.values())
    errors = check(incoming, known)
    if errors:
        print("Ошибки — файл не изменён:\n" + "\n".join(errors))
        sys.exit(1)
    by_id = {c["id"]: c for c in current}
    added = sum(1 for c in incoming if c["id"] not in by_id)
    for c in incoming:
        by_id[c["id"]] = normalize(c)
    for cid in FORCE_STRANGE_ONLY & by_id.keys():
        by_id[cid]["strangeOnly"] = True
    merged = sorted(by_id.values(), key=lambda c: (c["section"], c["group"], c["title"]))
    OUT.write_text(HEADER + "export const WORLD_GENERATED: KbEntry[] = "
                   + json.dumps(merged, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
    print(f"Встроено: {len(incoming)} (новых {added}, обновлено {len(incoming) - added}); всего {len(merged)}")


if __name__ == "__main__":
    main()
