#!/usr/bin/env python3
"""Исходники SRD 5.2.1 на английском для перевода: data/raw/srd52/*.json.

Берёт данные 5e-database (https://github.com/5e-bits/5e-database, папка src/2024/en —
SRD 5.2.1, CC-BY-4.0) и приводит их к плоскому виду: только поля, нужные игре, тексты —
строками и списками строк. Переводчик (tools/translate_local.py) переводит из этих файлов.

Запуск (нужен только Python 3.9+):
    git clone --depth 1 https://github.com/5e-bits/5e-database
    python tools/build_raw.py 5e-database/src/2024/en
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "raw" / "srd52"

ATTRIBUTION = (
    "This work includes material from the System Reference Document 5.2.1 (\"SRD 5.2.1\") by "
    "Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2.1 is "
    "licensed under the Creative Commons Attribution 4.0 International License, available at "
    "https://creativecommons.org/licenses/by/4.0/legalcode."
)


def load(src: Path, name: str):
    return json.loads((src / f"5e-SRD-{name}.json").read_text(encoding="utf-8"))


def paragraphs(text) -> list:
    """Текст источника → список абзацев (переводчик держит абзацы раздельно)."""
    if text is None:
        return []
    if isinstance(text, list):
        out = []
        for t in text:
            out.extend(paragraphs(t))
        return out
    # Переносы из вёрстки PDF: «ex- pended» → «expended».
    text = re.sub(r"([a-z])- ([a-z])", r"\1\2", str(text))
    parts = re.split(r"\n\s*\n|\n(?=\*\*)|\n\s{2,}", text)
    return [re.sub(r"\s+", " ", p).strip() for p in parts if p.strip()]


def level_of(feature) -> int:
    lvl = feature.get("level")
    if isinstance(lvl, dict):
        return int(lvl["index"].rsplit("-", 1)[1])
    return int(lvl or 0)


def spells(src):
    out = []
    for s in load(src, "Spells"):
        rec = {
            "id": s["index"],
            "name": s["name"],
            "level": s["level"],
            "school": s["school"]["index"],
            "classes": [c["index"] for c in s.get("classes", [])],
            "casting_time": s["casting_time"],
            "ritual": s.get("ritual", False),
            "range": s["range"],
            "components": s.get("components", []),
            "duration": s["duration"],
            "concentration": s.get("concentration", False),
            "desc": paragraphs(s.get("description") or s.get("desc")),
        }
        if s.get("material"):
            rec["material"] = s["material"]
        if s.get("higher_level"):
            rec["higher_level"] = paragraphs(s["higher_level"])
        if s.get("attack_type"):
            rec["attack_type"] = s["attack_type"]
        if s.get("dc"):
            rec["save"] = s["dc"].get("dc_type", {}).get("index")
        dmg = s.get("damage") or {}
        if dmg.get("damage_type"):
            rec["damage_type"] = dmg["damage_type"]["index"]
        if s.get("area_of_effect"):
            rec["area"] = s["area_of_effect"]
        out.append(rec)
    return out


def blocks(items):
    return [{"name": a["name"], "desc": a.get("desc", "")} for a in items or []]


def monsters(src):
    out = []
    for m in load(src, "Monsters"):
        rec = {
            "id": m["index"],
            "name": m["name"],
            "size": m["size"],
            "type": m["type"],
            "alignment": m.get("alignment", ""),
            "ac": [{"value": a["value"], "type": a.get("type", "")} for a in m.get("armor_class", [])],
            "hp": m["hit_points"],
            "hit_dice": m.get("hit_points_roll") or m.get("hit_dice", ""),
            "speed": m.get("speed", {}),
            "abilities": {k[:3]: m[k] for k in
                          ("strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma")},
            "proficiencies": [{"id": p["proficiency"]["index"], "value": p["value"]}
                              for p in m.get("proficiencies", [])],
            "vulnerabilities": m.get("damage_vulnerabilities", []),
            "resistances": m.get("damage_resistances", []),
            "immunities": m.get("damage_immunities", []),
            "condition_immunities": [c["index"] if isinstance(c, dict) else c
                                     for c in m.get("condition_immunities", [])],
            "senses": m.get("senses", {}),
            "languages": m.get("languages", ""),
            "cr": m["challenge_rating"],
            "xp": m.get("xp", 0),
            "proficiency_bonus": m.get("proficiency_bonus", 2),
            "traits": blocks(m.get("special_abilities")),
            "actions": blocks(m.get("actions")),
            "bonus_actions": blocks(m.get("bonus_actions")),
            "reactions": blocks(m.get("reactions")),
            "legendary_actions": blocks(m.get("legendary_actions")),
        }
        if m.get("gear"):
            rec["gear"] = m["gear"]
        out.append(rec)
    return out


def magic_items(src):
    out = []
    for i in load(src, "Magic-Items"):
        desc = paragraphs(i.get("desc"))
        head = desc[0] if desc else ""
        out.append({
            "id": i["index"],
            "name": i["name"],
            "category": i.get("equipment_category", {}).get("index", ""),
            "rarity": (i.get("rarity") or {}).get("name", ""),
            "attunement": bool(i.get("attunement")),
            # Первая строка источника — «Armor (Any Medium...)»: тип предмета, переводится отдельно.
            "kind": head,
            "desc": desc[1:] if len(desc) > 1 else desc,
        })
    return out


def feats(src):
    return [{"id": f["index"], "name": f["name"], "type": f.get("type", ""),
             "desc": paragraphs(f.get("description") or f.get("desc"))} for f in load(src, "Feats")]


def class_features(src):
    """Умения классов и подклассов SRD 16–20 уровня (сейчас классы в игре — до 15)."""
    out = []
    for f in load(src, "Features"):
        lvl = level_of(f)
        if lvl < 16:
            continue
        out.append({
            "id": f["index"],
            "name": f["name"],
            "class": f["class"]["index"],
            "subclass": (f.get("subclass") or {}).get("index"),
            "level": lvl,
            "desc": paragraphs(f.get("description") or f.get("desc")),
        })
    return out


def conditions(src):
    return [{"id": c["index"], "name": c["name"], "desc": paragraphs(c.get("description") or c.get("desc"))}
            for c in load(src, "Conditions")]


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    src = Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)
    for name, build in [("spells", spells), ("monsters", monsters), ("magic_items", magic_items),
                        ("feats", feats), ("class_features", class_features),
                        ("conditions", conditions)]:
        records = build(src)
        doc = {"source": "SRD 5.2.1", "license": "CC-BY-4.0", "attribution": ATTRIBUTION,
               "mode": "translate", "records": records}
        path = OUT / f"{name}.json"
        path.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        print(f"{path.relative_to(ROOT)}: {len(records)}")


if __name__ == "__main__":
    main()
