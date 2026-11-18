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

def once(id_: str, name: str, recovery: str = "long") -> dict:
    return {"resource": {"id": id_, "name": name, "max": {"value": 1}, "recovery": recovery}}


def by_ability(id_: str, name: str, ability: str, recovery: str = "long") -> dict:
    return {"resource": {"id": id_, "name": name, "max": {"ability": ability, "min": 1}, "recovery": recovery}}


PSI_DICE = {"byLevel": [[3, 4], [5, 6], [9, 8], [13, 10], [17, 12]]}

MECHANICS.update({
    # ── Варвар ──
    "path-of-the-zealot": {
        "id": "zealot", "class": "barbarian",
        "summary": "Фанатик: божественный урон в ярости и запас лечащих костей.",
        "features": {
            "Воин богов": {"resource": {"id": "zealot.warrior_of_gods", "name": "Кости «Воина богов» (d12)",
                                        "max": {"byLevel": [[3, 4], [6, 5], [12, 6], [17, 7]]}, "recovery": "long"}},
            "Фанатичное присутствие": once("zealot.presence", "Фанатичное присутствие"),
            "Ярость богов": once("zealot.rage_of_gods", "Ярость богов"),
        },
    },
    "path-of-the-wild-heart": {
        "id": "wild_heart", "class": "barbarian",
        "summary": "Тотемный воин: звериные дары ярости и речь с животными.",
        "features": {},
    },
    "path-of-the-world-tree": {
        "id": "world_tree", "class": "barbarian",
        "summary": "Страж Мирового Древа: временные хиты союзникам и ветви, что тянут врагов.",
        "features": {},
    },
    # ── Бард ──
    "college-of-dance": {
        "id": "dance", "class": "bard",
        "summary": "Танцор: защита без доспехов на Харизме и удары в ритме вдохновения.",
        "grants": {"unarmoredAbility": "charisma"},
        "features": {},
    },
    "college-of-glamour": {
        "id": "glamour", "class": "bard",
        "summary": "Чаровник фей: очарование, отражения и покров величия.",
        "spells": {3: ["charm-person", "mirror-image"]},
        "features": {
            "Манящая магия": once("glamour.beguiling", "Манящая магия"),
            "Покров величия": once("glamour.mantle", "Покров величия"),
            "Несокрушимое величие": once("glamour.unbreakable", "Несокрушимое величие", "short"),
        },
    },
    "college-of-valor": {
        "id": "valor", "class": "bard",
        "summary": "Боевой скальд: средние доспехи, щит, воинское оружие и вторая атака.",
        "grants": {"armor": ["medium", "shield"], "martialWeapons": True},
        "features": {},
    },
    # ── Жрец ──
    "light-domain": {
        "id": "light", "class": "cleric",
        "summary": "Жрец Света: огонь и сияние, вспышка, ослепляющая врага.",
        "features": {
            "Оберегающая вспышка": by_ability("light.warding_flare", "Оберегающая вспышка", "wisdom"),
            "Венец света": by_ability("light.corona", "Венец света", "wisdom"),
        },
    },
    "trickery-domain": {
        "id": "trickery", "class": "cleric",
        "summary": "Жрец Обмана: скрытность, иллюзорный двойник и перестановка с ним.",
        "features": {},
    },
    "war-domain": {
        "id": "war", "class": "cleric",
        "summary": "Жрец Войны: дополнительные атаки бонусным действием и точные удары.",
        "features": {
            "Жрец войны": by_ability("war.war_priest", "Жрец войны", "wisdom", "short"),
        },
    },
    "grave-domain": {
        "id": "grave", "class": "cleric",
        "summary": "Жрец Могилы (наследие): страж границы жизни и смерти.",
        "spells": {3: ["bane", "false-life", "gentle-repose", "ray-of-enfeeblement", "spare-the-dying"],
                   5: ["revivify", "vampiric-touch"], 7: ["blight", "death-ward"], 9: ["antilife-shell", "raise-dead"]},
        "features": {
            "Взгляд за грань": by_ability("grave.eyes", "Взгляд за грань", "wisdom"),
        },
    },
    # ── Друид ──
    "circle-of-the-moon": {
        "id": "moon", "class": "druid",
        "summary": "Друид Луны: сильные звериные облики и шаги в лунном свете.",
        "features": {
            "Шаг лунного света": by_ability("moon.moonlight_step", "Шаг лунного света", "wisdom"),
        },
    },
    "circle-of-the-sea": {
        "id": "sea", "class": "druid",
        "summary": "Друид Моря: гнев волн и грома вокруг себя.",
        "features": {},
    },
    "circle-of-the-stars": {
        "id": "stars", "class": "druid",
        "summary": "Друид Звёзд: звёздная карта, созвездия и знамения.",
        "spells": {3: ["guidance", "guiding-bolt"]},
        "features": {
            "Звёздная карта": by_ability("stars.map", "«Направленный снаряд» без ячейки", "wisdom"),
            "Космическое знамение": by_ability("stars.omen", "Космическое знамение", "wisdom"),
        },
    },
    # ── Монах ──
    "warrior-of-mercy": {
        "id": "mercy", "class": "monk",
        "summary": "Целитель-монах: удар, что ранит, и касание, что лечит.",
        "grants": {"skills": ["insight", "medicine"], "tools": ["Набор травника"]},
        "features": {
            "Рука высшего милосердия": once("mercy.ultimate", "Рука высшего милосердия"),
        },
    },
    "warrior-of-shadow": {
        "id": "shadow", "class": "monk",
        "summary": "Монах Тени: тьма, телепортация между тенями и невидимость.",
        "features": {},
    },
    "warrior-of-the-elements": {
        "id": "elements", "class": "monk",
        "summary": "Монах Стихий: удары с дальностью и стихийный урон.",
        "features": {},
    },
    # ── Паладин ──
    "oath-of-glory": {
        "id": "glory", "class": "paladin",
        "summary": "Паладин Славы: атлет-герой, вдохновляющая кара и аура скорости.",
        "features": {
            "Славная защита": by_ability("glory.defense", "Славная защита", "charisma"),
            "Живая легенда": once("glory.legend", "Живая легенда"),
        },
    },
    "oath-of-the-ancients": {
        "id": "ancients", "class": "paladin",
        "summary": "Паладин Древних: свет природы, аура оберега от магии.",
        "features": {
            "Бессмертный страж": once("ancients.sentinel", "Бессмертный страж"),
            "Древний чемпион": once("ancients.champion", "Древний чемпион"),
        },
    },
    "oath-of-vengeance": {
        "id": "vengeance", "class": "paladin",
        "summary": "Паладин Мести: обет вражды и неумолимая погоня.",
        "features": {
            "Ангел отмщения": once("vengeance.angel", "Ангел отмщения"),
        },
    },
    # ── Следопыт ──
    "beast-master": {
        "id": "beast_master", "class": "ranger",
        "summary": "Повелитель зверей: первобытный зверь-спутник сражается рядом.",
        "features": {},
    },
    "fey-wanderer": {
        "id": "fey_wanderer", "class": "ranger",
        "summary": "Странник фей: психический урон, чары и туманные шаги.",
        "features": {
            "Потустороннее очарование": {"choices": [{"id": "fey_wanderer.skill", "label": "Навык", "kind": "skill",
                                                     "count": 1, "from": ["deception", "performance", "persuasion"]}]},
            "Подкрепление фей": once("fey_wanderer.reinforcements", "«Призыв феи» без ячейки"),
            "Туманный странник": by_ability("fey_wanderer.misty", "Туманный странник", "wisdom"),
        },
    },
    "gloom-stalker": {
        "id": "gloom_stalker", "class": "ranger",
        "summary": "Сумрачный охотник: засада в первом раунде и невидимость во тьме.",
        "features": {},
    },
    # ── Плут ──
    "arcane-trickster": {
        "id": "arcane_trickster", "class": "rogue",
        "summary": "Плут-маг: заклинания волшебника на Интеллекте и невидимая Волшебная рука.",
        "spellcasting": {**THIRD_CASTER, "cantrips": [0, 0] + [2] * 7 + [3] * 11},
        "spells": {3: ["mage-hand"]},
        "features": {},
    },
    "assassin": {
        "id": "assassin", "class": "rogue",
        "summary": "Убийца: внезапность, грим, яды и смертельный удар.",
        "grants": {"tools": ["Набор для грима", "Набор отравителя"]},
        "features": {},
    },
    "soulknife": {
        "id": "soulknife", "class": "rogue",
        "summary": "Клинок души: псионические клинки и кости псионической энергии.",
        "features": {
            "Псионическая мощь": {"resource": {"id": "soulknife.dice", "name": "Кости псионической энергии",
                                               "max": PSI_DICE, "recovery": "short_one"}},
            "Психическая вуаль": once("soulknife.veil", "Психическая вуаль"),
            "Разрыв разума": once("soulknife.rend", "Разрыв разума"),
        },
    },
    "phantom": {
        "id": "phantom", "class": "rogue",
        "summary": "Фантом (наследие): шёпот мертвецов и вопли из могилы.",
        "features": {
            "Вопли из могилы": {"resource": {"id": "phantom.wails", "name": "Вопли из могилы",
                                             "max": {"proficiency": True}, "recovery": "long"}},
        },
    },
    # ── Чародей ──
    "aberrant-sorcery": {
        "id": "aberrant", "class": "sorcerer",
        "summary": "Аберрантный разум: псионические заклинания и телепатия.",
        "features": {},
    },
    "clockwork-sorcery": {
        "id": "clockwork", "class": "sorcerer",
        "summary": "Заводная душа: сила порядка выравнивает броски.",
        "features": {
            "Восстановление баланса": {"resource": {"id": "clockwork.balance", "name": "Восстановление баланса",
                                                    "max": {"proficiency": True}, "recovery": "long"}},
            "Транс порядка": once("clockwork.trance", "Транс порядка"),
            "Заводная кавалькада": once("clockwork.cavalcade", "Заводная кавалькада"),
        },
    },
    "wild-magic-sorcery": {
        "id": "wild_magic", "class": "sorcerer",
        "summary": "Дикая магия: всплески хаоса и приливы удачи.",
        "features": {
            "Приливы хаоса": once("wild_magic.tides", "Приливы хаоса"),
        },
    },
    # ── Колдун ──
    "archfey-patron": {
        "id": "archfey", "class": "warlock",
        "summary": "Покровитель Архифея: шаги фей и чары.",
        "features": {
            "Шаги фей": by_ability("archfey.steps", "Шаги фей", "charisma"),
        },
    },
    "celestial-patron": {
        "id": "celestial", "class": "warlock",
        "summary": "Покровитель Небожитель: исцеляющий свет и сияющая душа.",
        "features": {
            "Исцеляющий свет": {"resource": {"id": "celestial.healing_light", "name": "Кости исцеляющего света (d6)",
                                             "max": {"byLevel": [[lv, lv + 1] for lv in range(3, 21)]}, "recovery": "long"}},
            "Жгучая месть": once("celestial.vengeance", "Жгучая месть"),
        },
    },
    "great-old-one-patron": {
        "id": "great_old_one", "class": "warlock",
        "summary": "Покровитель Великий Древний: телепатия и психические заклинания.",
        "features": {
            "Ясновидящий боец": once("great_old_one.combatant", "Ясновидящий боец", "short"),
        },
    },
    # ── Волшебник ──
    "abjurer": {
        "id": "abjurer", "class": "wizard",
        "summary": "Ограждатель: магический барьер поглощает урон.",
        "features": {},
    },
    "diviner": {
        "id": "diviner", "class": "wizard",
        "summary": "Прорицатель: знамения заменяют броски d20.",
        "features": {
            "Знамение": {"resource": {"id": "diviner.portent", "name": "Знамение (записанные d20)",
                                      "max": {"byLevel": [[3, 2], [14, 3]]}, "recovery": "long"}},
            "Третий глаз": once("diviner.third_eye", "Третий глаз", "short"),
        },
    },
    "illusionist": {
        "id": "illusionist", "class": "wizard",
        "summary": "Иллюзионист: улучшенные иллюзии и призрачные создания.",
        "spells": {3: ["minor-illusion"]},
        "features": {
            "Иллюзорное «я»": once("illusionist.self", "Иллюзорное «я»", "short"),
        },
    },
})

CATALOG = ROOT / "src/data/spells/catalog.generated.ts"
LIST_RE = re.compile(r"(\d+)-й\s*[—–-]\s*([^;]+)")


def spell_names() -> dict[str, str]:
    """Русское название заклинания (без «ё», в нижнем регистре) → id из каталога."""
    text = CATALOG.read_text(encoding="utf-8")
    pairs = re.findall(r'"id": "([^"]+)",\n\s*"name": "([^"]+)"', text)
    return {name.lower().replace("ё", "е"): sid for sid, name in pairs}


def parse_spell_list(text: str, names: dict[str, str], where: str) -> dict[int, list[str]]:
    """«3-й — Лечение ран (Cure Wounds), Лунный луч; 5-й — …» → {3: [...], 5: [...]}."""
    body = text.split(":", 1)[1] if ":" in text else text
    out: dict[int, list[str]] = {}
    for m in LIST_RE.finditer(body.split(". ")[0]):
        items = re.sub(r"\([^)]*\)", "", m.group(2)).replace("заговоры", "").replace("заговор", "")
        for part in re.split(r",|\s+и\s+(?=[А-ЯЁ«])", items):
            name = part.strip().strip("«»\" .").strip()
            if not name:
                continue
            sid = names.get(name.lower().replace("ё", "е"))
            if not sid:
                sys.exit(f"{where}: заклинание «{name}» не найдено в каталоге")
            out.setdefault(int(m.group(1)), []).append(sid)
    return out


OPTION_RE = re.compile(r"^([^():]+?) \(([A-Za-z' -]+)\): (.+)$", re.S)


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", text.lower()).strip("_")


def build(rec: dict, mech: dict, names: dict[str, str]) -> dict:
    features = []
    parsed: dict[int, list[str]] = {}
    for f in rec["features"]:
        lines = list(f.get("mechanics") or f.get("desc") or [])
        joined = " ".join(lines)
        if "spells" not in mech and "подготовлен" in joined and LIST_RE.search(joined):
            for lvl, ids in parse_spell_list(joined, names, f"{rec['id']} / {f['name']}").items():
                parsed.setdefault(lvl, []).extend(ids)
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
    if parsed:
        data["spells"] = {lvl: parsed[lvl] for lvl in sorted(parsed)}
    for key in ("spells", "spellcasting", "grants"):
        if key in mech:
            data[key] = mech[key]
    return data


def main() -> None:
    records = json.loads(SRC.read_text(encoding="utf-8"))["records"]
    names = spell_names()
    by_class: dict[str, list] = {}
    for rid, mech in MECHANICS.items():
        by_class.setdefault(mech["class"], []).append(build(records[rid], mech, names))
    missing = sorted(set(records) - set(MECHANICS))
    if missing:
        sys.exit(f"Подклассы без механики: {missing}")
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
