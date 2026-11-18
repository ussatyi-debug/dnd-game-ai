#!/usr/bin/env python3
"""Подклассы Книги игрока 2024 для мастера создания.

Тексты умений берутся из data/rules/subclasses.json (механика своими словами, тот же перевод,
что во вкладке справочника «Подклассы»), механика для листа (выборы, ресурсы, заклинания,
магия подкласса) — из MECHANICS ниже. Результат — src/data/rules/classes/phb-subclasses.generated.ts.

Запуск: python3 tools/gen_phb_subclasses.py [--check]
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "data/rules/subclasses.json"
OUT = ROOT / "src/data/rules/classes/phb-subclasses.generated.ts"

# Число по уровням: [уровень, значение].
FIGHTER_SKILLS = ["acrobatics", "animal_handling", "athletics", "history", "insight",
                  "intimidation", "persuasion", "perception", "survival"]

THIRD_CASTER = {
    "ability": "intelligence",
    "progression": "third",
    "preparation": "known",
    "spellClass": "wizard",
    "cantrips": [0, 0] + [2] * 7 + [3] * 11,
    "prepared": [0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13],
}

# Механика подклассов по их id в subclasses.json. Ключ features — название умения из перевода.
MECHANICS = {
    "battle-master": {
        "id": "battle_master",
        "class": "fighter",
        "summary": "Тактик: манёвры за кости превосходства управляют боем.",
        "options_from": {"Боевое превосходство": "battle_master.maneuvers"},
        "features": {
            "Боевое превосходство": {
                "choices": [{"id": "battle_master.maneuvers", "label": "Манёвры", "kind": "option", "count": 3,
                             "byLevel": [[3, 3], [7, 5], [10, 7], [15, 9]]}],
                "resource": {"id": "fighter.superiority", "name": "Кости превосходства",
                             "max": {"byLevel": [[3, 4], [7, 5], [15, 6]]}, "recovery": "short"},
            },
            "Исследователь войны": {
                "choices": [{"id": "battle_master.tool", "label": "Инструменты ремесленника", "kind": "tool", "count": 1, "from": ["artisan"]},
                            {"id": "battle_master.skill", "label": "Навык", "kind": "skill", "count": 1, "from": FIGHTER_SKILLS}],
            },
            "Знай своего врага": {
                "resource": {"id": "fighter.know_your_enemy", "name": "Познай своего врага", "max": {"value": 1}, "recovery": "long"},
            },
        },
    },
    "eldritch-knight": {
        "id": "eldritch_knight",
        "class": "fighter",
        "summary": "Воин-маг: заклинания волшебника на Интеллекте и связь с оружием.",
        "spellcasting": THIRD_CASTER,
        "features": {},
    },
    "psi-warrior": {
        "id": "psi_warrior",
        "class": "fighter",
        "summary": "Псионик: кости псионической энергии для защиты, ударов и телекинеза.",
        "features": {
            "Псионическая мощь": {
                "resource": {"id": "psi_warrior.dice", "name": "Кости псионической энергии",
                             "max": {"byLevel": [[3, 4], [5, 6], [9, 8], [13, 10], [17, 12]]}, "recovery": "short_one"},
            },
            "Адепт телекинеза": {
                "resource": {"id": "psi_warrior.leap", "name": "Пси-прыжок", "max": {"value": 1}, "recovery": "short"},
            },
            "Оплот силы": {
                "resource": {"id": "psi_warrior.bulwark", "name": "Оплот силы", "max": {"value": 1}, "recovery": "long"},
            },
            "Мастер телекинеза": {
                "resource": {"id": "psi_warrior.telekinesis", "name": "Телекинез без ячейки", "max": {"value": 1}, "recovery": "long"},
            },
        },
        # Телекинетическое перемещение — отдельный ресурс у первого умения.
        "extra_resources": {
            "Псионическая мощь": {"id": "psi_warrior.movement", "name": "Телекинетическое перемещение", "max": {"value": 1}, "recovery": "short"},
        },
    },
}

OPTION_RE = re.compile(r"^([^():]+?) \(([A-Za-z' -]+)\): (.+)$", re.S)


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", text.lower()).strip("_")


def build(rec: dict, mech: dict) -> dict:
    features = []
    for f in rec["features"]:
        lines = list(f.get("mechanics") or f.get("desc") or [])
        extra = mech["features"].get(f["name"], {})
        options = []
        if f["name"] in mech.get("options_from", {}):
            rest = []
            for line in lines:
                m = OPTION_RE.match(line)
                if m:
                    options.append({"id": slug(m.group(2)), "name": m.group(1).strip(), "text": m.group(3).strip()})
                else:
                    rest.append(line)
            lines = rest
        out = {"level": f["level"], "name": f["name"], "text": " ".join(lines)}
        if extra.get("choices"):
            choices = [dict(c) for c in extra["choices"]]
            for c in choices:
                if c["kind"] == "option":
                    c["options"] = options
            out["choices"] = choices
        if extra.get("resource"):
            out["resource"] = extra["resource"]
        features.append(out)
        second = mech.get("extra_resources", {}).get(f["name"])
        if second:
            features.append({"level": f["level"], "name": second["name"], "text": "Применение восстанавливается после короткого или длительного отдыха либо за кость псионической энергии.", "resource": second})
    unknown = set(mech["features"]) - {f["name"] for f in rec["features"]}
    if unknown:
        sys.exit(f"{rec['id']}: нет умений {sorted(unknown)}")
    data = {"id": mech["id"], "name": rec["name"], "source": "phb", "summary": mech["summary"], "features": features}
    for key in ("spells", "spellcasting"):
        if key in mech:
            data[key] = mech[key]
    return data


def main() -> None:
    records = json.loads(SRC.read_text(encoding="utf-8"))["records"]
    by_class: dict[str, list] = {}
    for rid, mech in MECHANICS.items():
        by_class.setdefault(mech["class"], []).append(build(records[rid], mech))
    body = json.dumps(by_class, ensure_ascii=False, indent=2)
    # Короткие числовые массивы — в одну строку.
    body = re.sub(r"\[\s*(-?\d+),\s*(-?\d+)\s*\]", r"[\1, \2]", body)
    body = re.sub(r"\[((?:\s*(?:-?\d+|\[\d+, \d+\]),?)+)\s*\]", lambda m: "[" + ", ".join(x.strip().rstrip(",") for x in m.group(1).split("\n") if x.strip()) + "]", body)
    text = (
        "// Сгенерировано tools/gen_phb_subclasses.py из data/rules/subclasses.json — не править вручную.\n"
        "// Подклассы Книги игрока 2024 года: механика описана своими словами.\n\n"
        'import type { SubclassData } from "../types";\n\n'
        f"export const PHB_SUBCLASSES: Record<string, SubclassData[]> = {body};\n"
    )
    if "--check" in sys.argv:
        if not OUT.exists() or OUT.read_text(encoding="utf-8") != text:
            sys.exit("phb-subclasses.generated.ts устарел: запустите tools/gen_phb_subclasses.py")
        return
    OUT.write_text(text, encoding="utf-8")
    print("Подклассов:", sum(len(v) for v in by_class.values()))


if __name__ == "__main__":
    main()
