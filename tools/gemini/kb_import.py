#!/usr/bin/env python3
"""Ответы Gemini → сгенерированные карточки базы знаний (слои «Мир», «Игрок», «Мастер»).

Запуск: python3 tools/gemini/kb_import.py [--layer world|player|master] ответ1.json [ответ2.json ...]
          партии по порядку: одна карточка в нескольких партиях — берётся поздняя версия;
          для «Игрока» и «Мастера» можно подать общие ответы — карточки разойдутся по слоям по разделу.
        python3 tools/gemini/kb_import.py --check   (проверка всего уже встроенного)

Проверяет каждую карточку (поля, разделы, префиксы id, статусы, связи и родителей, английские
слова в тексте, цель героя, раскрытие тайны) и встраивает в src/data/kb/<слой>.generated.ts:
карточка с тем же id заменяет прежнюю (и ручную из <слой>.ts). Ошибки — построчно; при ошибках
файлы не меняются. Затем: node --experimental-strip-types scripts/test-knowledge.ts
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent

# Слой → раздел → допустимые префиксы id. Раздел «secrets» есть и у Игрока (пароли и маршруты, secret.),
# и у Мастера (тайны: прежние secret.*, новые mystery.*) — слой при общем ответе определяется полем layer.
LAYERS = {
    "world": {"npc": ("npc.",), "locations": ("loc.",), "factions": ("fac.",), "lore": ("lore.",),
              "artifacts": ("art.",)},
    "player": {"goals": ("goal.",), "personas": ("persona.",), "secrets": ("secret.",), "known": ("known.",),
               "chronicle": ("chron.",), "notes": ("note.",)},
    "master": {"schedule": ("plan.",), "threats": ("threat.",), "prisoners": ("prisoner.",),
               "secrets": ("mystery.", "secret."), "journal": ("journal.",)},
}
EXPORT = {"world": "WORLD_GENERATED", "player": "PLAYER_GENERATED", "master": "MASTER_GENERATED"}
TITLE = {"world": "«Мир»", "player": "«Игрок»", "master": "«Мастер»"}
STATUSES = {"active", "ally", "vassal", "neutral", "watch", "enemy", "prisoner", "dead", "open",
            "progress", "done", "failed", "planned"}
REVEALS = {"hidden", "hint", "revealed"}
FIELDS = ["id", "layer", "section", "group", "strangeOnly", "goal", "parent", "title", "subtitle", "summary",
          "status", "statusNote", "facts", "body", "tags", "related", "source", "link", "reveal"]
# Латиница из 3+ букв, кроме римских цифр (Генрих III).
LATIN = re.compile(r"\b(?![IVXLCDM]+\b)[A-Za-z]{3,}\b")
# Карточки, которые раскрывают тайну отряда даже в «публичной» версии Gemini (решение разработчика):
# видны только в кампании «Дом Стрэндж». Звёздный Мост: работа сети и открытые терминалы — тайна.
FORCE_STRANGE_ONLY = {"lore.star_bridge"}


def out_path(layer: str) -> Path:
    return ROOT / f"src/data/kb/{layer}.generated.ts"


def header(layer: str) -> str:
    return (
        "// Сгенерировано tools/gemini/kb_import.py из ответов Gemini — не править вручную.\n"
        f"// Карточки слоя {TITLE[layer]} на День 98: новые и обновлённые"
        f" (заменяют карточки {layer}.ts с тем же id).\n\n"
        'import type { KbEntry } from "./types.ts";\n\n'
    )


def load_generated(layer: str) -> list[dict]:
    path = out_path(layer)
    if not path.exists():
        return []
    body = path.read_text(encoding="utf-8").split(f"export const {EXPORT[layer]}: KbEntry[] = ", 1)[1]
    return json.loads(body.rsplit(";", 1)[0])


def all_known() -> dict[str, str]:
    """id → слой для всех карточек базы (выгрузка kb_export.ts)."""
    subprocess.run(["node", "--experimental-strip-types", "--no-warnings", "tools/gemini/kb_export.ts", "world"],
                   cwd=ROOT, check=True, capture_output=True)
    data = json.loads((ROOT / "tools/gemini/kb_world_current.json").read_text(encoding="utf-8"))
    return {x["id"]: x["layer"] for x in data["all_ids"]}


def text_of(card: dict) -> list[str]:
    parts = [card.get("title", ""), card.get("subtitle") or "", card.get("summary", ""), card.get("statusNote") or ""]
    for f in card.get("facts") or []:
        parts += [f.get("label", ""), f.get("value", "")]
    for b in card.get("body") or []:
        parts += [b.get("heading") or ""] + list(b.get("paragraphs") or [])
    goal = card.get("goal") or {}
    parts += [goal.get("giver") or "", goal.get("reward") or ""]
    parts += [s.get("text", "") for s in goal.get("steps") or []] + [e.get("text", "") for e in goal.get("log") or []]
    return parts


def layer_of(card: dict, default: str) -> str:
    return card.get("layer") if card.get("layer") in LAYERS else default


def normalize(card: dict, layer: str) -> dict:
    out = {"layer": layer}
    for key in FIELDS:
        if key == "layer":
            continue
        value = card.get(key)
        if value in (None, "", [], False, {}):
            continue
        out[key] = value
    if "goal" in out:
        g = out["goal"]
        out["goal"] = {"giver": g.get("giver") or "", "reward": g.get("reward") or "",
                       "due_day": g.get("due_day"), "steps": g.get("steps") or [], "log": g.get("log") or []}
    return {k: out[k] for k in FIELDS if k in out}


def check(cards: list[dict], known: dict[str, str], default: str) -> list[str]:
    errors = []
    ids = [c.get("id") for c in cards]
    dup = {i for i in ids if ids.count(i) > 1}
    if dup:
        errors.append(f"повтор id в ответах: {sorted(dup)}")
    every = set(known) | set(ids)
    for c in cards:
        cid = c.get("id") or "?"
        layer = layer_of(c, default)
        sections = LAYERS[layer]
        sec = c.get("section")
        if sec not in sections:
            errors.append(f"{cid}: раздел «{sec}» слоя {layer} — нужен один из {sorted(sections)}")
        elif not cid.startswith(sections[sec]):
            errors.append(f"{cid}: id раздела {sec} начинается с {' или '.join(sections[sec])}")
        if known.get(cid, layer) != layer:
            errors.append(f"{cid}: такой id уже есть в слое {known[cid]} — нужен другой")
        if not re.fullmatch(r"[a-z]+\.[a-z0-9_]+", cid):
            errors.append(f"{cid}: id — латиница, цифры и _")
        for key in ("group", "title", "summary", "source"):
            if not str(c.get(key) or "").strip():
                errors.append(f"{cid}: пустое поле {key}")
        if 0 < len((c.get("summary") or "").strip()) <= 10:
            errors.append(f"{cid}: summary короче 11 знаков")
        if len(c.get("summary") or "") > 260:
            errors.append(f"{cid}: summary длиннее 260 знаков")
        if c.get("status") not in (None, *STATUSES):
            errors.append(f"{cid}: статус «{c.get('status')}»")
        if c.get("reveal") not in (None, *REVEALS):
            errors.append(f"{cid}: reveal «{c.get('reveal')}» — hidden, hint или revealed")
        if c.get("reveal") and layer != "master":
            errors.append(f"{cid}: reveal — только у тайн слоя «Мастер»")
        goal = c.get("goal")
        if goal:
            if layer != "player" or sec != "goals":
                errors.append(f"{cid}: поле goal — только у целей слоя «Игрок»")
            if goal.get("due_day") is not None and not isinstance(goal.get("due_day"), int):
                errors.append(f"{cid}: goal.due_day — число дня или null")
            for s in goal.get("steps") or []:
                if not (isinstance(s, dict) and s.get("text") and isinstance(s.get("done"), bool)):
                    errors.append(f"{cid}: шаг цели — {{text, done}}: {s}")
            for e in goal.get("log") or []:
                if not (isinstance(e, dict) and isinstance(e.get("day"), int) and e.get("text")):
                    errors.append(f"{cid}: запись хода цели — {{day, text}}: {e}")
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


def write(layer: str, cards: list[dict]) -> None:
    merged = sorted(cards, key=lambda c: (c["section"], c["group"], c["title"]))
    out_path(layer).write_text(header(layer) + f"export const {EXPORT[layer]}: KbEntry[] = "
                               + json.dumps(merged, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")


def main() -> None:
    args = sys.argv[1:]
    default = "world"
    if "--layer" in args:
        default = args[args.index("--layer") + 1]
        if default not in LAYERS:
            sys.exit(f"слой: {', '.join(LAYERS)}")
    files = [a for i, a in enumerate(args) if not a.startswith("--") and (i == 0 or args[i - 1] != "--layer")]
    known = all_known()
    if "--check" in args:
        errors = []
        for layer in LAYERS:
            errors += check(load_generated(layer), known, layer)
        print("\n".join(errors) or "Встроенные карточки: замечаний нет")
        sys.exit(1 if errors else 0)
    incoming: list[dict] = []
    for f in files:
        raw = Path(f).read_text(encoding="utf-8").strip()
        raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw)
        incoming += json.loads(raw)
    latest: dict[str, dict] = {}
    for c in incoming:
        if c.get("id") in latest:
            print(f"повтор {c['id']}: берётся версия из более поздней партии")
        latest[c.get("id")] = c
    incoming = list(latest.values())
    errors = check(incoming, known, default)
    if errors:
        print("Ошибки — файлы не изменены:\n" + "\n".join(errors))
        sys.exit(1)
    for layer in LAYERS:
        mine = [c for c in incoming if layer_of(c, default) == layer]
        if not mine:
            continue
        by_id = {c["id"]: c for c in load_generated(layer)}
        added = sum(1 for c in mine if c["id"] not in by_id)
        for c in mine:
            by_id[c["id"]] = normalize(c, layer)
        for cid in FORCE_STRANGE_ONLY & by_id.keys():
            by_id[cid]["strangeOnly"] = True
        write(layer, list(by_id.values()))
        print(f"{TITLE[layer]}: встроено {len(mine)} (новых {added}, обновлено {len(mine) - added}); всего {len(by_id)}")


if __name__ == "__main__":
    main()
