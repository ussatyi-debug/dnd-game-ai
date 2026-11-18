"""Краткий бестиарий для боя (пак 0.10.1): id, имя, КД, хиты, опыт, ПО, первые атаки.

Источник — data/rules/monsters.json (SRD 5.2.1, CC-BY-4.0). Результат —
crates/master/src/bestiary.generated.rs: константа без разбора JSON во время игры
(веб-версия переводит wasm в JavaScript, большие данные и разбор ей ни к чему).

Запуск: python3 tools/gen_bestiary.py [--check]
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "data/rules/monsters.json"
OUT = ROOT / "crates/master/src/bestiary.generated.rs"


def cr_text(v):
    if v is None:
        return "0"
    for frac, text in ((0.125, "1/8"), (0.25, "1/4"), (0.5, "1/2")):
        if abs(v - frac) < 1e-6:
            return text
    return str(int(round(v)))


def esc(s):
    return s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ")


def build():
    records = json.loads(SRC.read_text(encoding="utf-8"))["records"]
    lines = [
        "// Создано tools/gen_bestiary.py из data/rules/monsters.json (SRD 5.2.1, CC-BY-4.0). Не править вручную.",
        "",
        "/// id, имя, КД, хиты, опыт, ПО, атаки.",
        "pub(crate) const BESTIARY: &[(&str, &str, i32, u32, u32, &str, &str)] = &[",
    ]
    for key in sorted(records):
        m = records[key]
        try:
            ac = int(m["ac"][0]["value"])
            hp = int(m["hp"])
        except (KeyError, IndexError, TypeError, ValueError):
            continue
        attacks = []
        for a in (m.get("actions") or [])[:3]:
            name, desc = a.get("name"), a.get("desc")
            if name and desc:
                attacks.append(f"{name}: {desc[:110]}")
        lines.append(
            f'    ("{esc(m["id"])}", "{esc(m["name"])}", {ac}, {hp}, {int(m.get("xp") or 0)}, '
            f'"{cr_text(m.get("cr"))}", "{esc("; ".join(attacks))}"),'
        )
    lines.append("];")
    return "\n".join(lines) + "\n"


if __name__ == "__main__":
    text = build()
    if "--check" in sys.argv:
        if OUT.read_text(encoding="utf-8") != text:
            sys.exit("bestiary.generated.rs устарел: python3 tools/gen_bestiary.py")
    else:
        OUT.write_text(text, encoding="utf-8")
