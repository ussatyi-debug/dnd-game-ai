#!/usr/bin/env python3
"""Перевод контента игры локальной моделью Ollama: data/raw/ → data/rules/.

Только стандартная библиотека Python 3.9+. По одной записи (большие записи — частями)
отправляет в http://localhost:11434/api/chat, проверяет ответ и сразу сохраняет результат,
поэтому скрипт можно остановить (Ctrl+C) и запустить снова — готовые записи пропускаются.

Режимы:
  translate  — SRD 5.2.1 (CC-BY-4.0): точный перевод.
  paraphrase — механика вне SRD (Книга игрока 2024): краткий пересказ своими словами.

Проверки ответа: JSON той же структуры (ключи, длины списков), id не изменился, формулы кубов
(1d8, 8d6, d12) и числа те же, в тексте есть кириллица и нет иероглифов. При ошибке — до двух
повторов с замечанием; не прошедшее — в data/rules/_review/ (перезапуск попробует снова).

Запуск:
  python tools/translate_local.py                  # всё по порядку
  python tools/translate_local.py --only spells    # одна коллекция (spells, monsters, …)
  python tools/translate_local.py --limit 5        # первые 5 непереведённых в каждой коллекции
  python tools/translate_local.py --selftest       # проверить эталоны без модели
"""

import argparse
import json
import re
import sys
import time
import urllib.error
import urllib.request
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "data" / "raw"
OUT = ROOT / "data" / "rules"
REVIEW = OUT / "_review"
EXAMPLES = Path(__file__).with_name("translate_examples.json")
SPELL_NAMES = ROOT / "data" / "spells" / "ru" / "names.json"

MODEL = "qwen3.6:35b-a3b"
HOST = "http://localhost:11434"
RETRIES = 2
# Запись длиннее — переводится частями (поле за полем, большие списки — кусками).
CHUNK_CHARS = 4000

# Коллекция → исходник, файл результата и поля, которые переводятся (на любом уровне вложенности).
COLLECTIONS = {
    "spells": ("srd52/spells.json", "spells.json",
               {"name", "casting_time", "range", "duration", "material", "desc", "higher_level"}),
    "monsters": ("srd52/monsters.json", "monsters.json",
                 {"name", "size", "type", "alignment", "languages", "gear", "desc", "traits",
                  "actions", "bonus_actions", "reactions", "legendary_actions"}),
    "magic_items": ("srd52/magic_items.json", "magic_items.json", {"name", "kind", "desc"}),
    "feats": ("srd52/feats.json", "feats.json", {"name", "desc"}),
    "class_features": ("srd52/class_features.json", "class_features.json", {"name", "desc"}),
    "conditions": ("srd52/conditions.json", "conditions.json", {"name", "desc"}),
    "subclasses": ("phb2024/subclasses.json", "subclasses.json", {"name", "features", "mechanics"}),
    "phb_feats": ("phb2024/feats.json", "phb_feats.json", {"name", "prerequisite", "mechanics"}),
}

GLOSSARY = """ГЛОССАРИЙ (используй строго эти термины):
Armor Class, AC — Класс Доспеха, КД; Hit Points — хиты; Temporary Hit Points — временные хиты;
Hit Point Dice, Hit Dice — кости хитов; Difficulty Class, DC — Класс Сложности, КС;
Proficiency Bonus — бонус мастерства; proficiency — владение; Expertise — компетентность;
saving throw — спасбросок; ability check — проверка характеристики; attack roll — бросок атаки;
Advantage — преимущество; Disadvantage — помеха; Initiative — инициатива;
cantrip — заговор; Concentration — концентрация; Ritual — ритуал; spell slot — ячейка заклинаний;
spell level / slot level — круг; spellcasting ability — заклинательная характеристика;
Species — Вид; Background — Предыстория; Feat — Талант; Subclass — подкласс; Epic Boon — Эпический дар;
Action — действие; Bonus Action — бонусное действие; Reaction — реакция; Magic action — действие Магия;
Attack action — действие Атака; Dash — Рывок; Disengage — Отход; Dodge — Уклонение; Help — Помощь;
Hide — Засада; Influence — Влияние; Ready — Подготовка; Search — Поиск; Study — Изучение; Utilize — Использование;
Short Rest — короткий отдых; Long Rest — длительный отдых; Speed — скорость; Fly Speed — скорость полёта;
Strength — Сила; Dexterity — Ловкость; Constitution — Телосложение; Intelligence — Интеллект;
Wisdom — Мудрость; Charisma — Харизма;
Blinded — Ослеплённый; Charmed — Очарованный; Deafened — Оглохший; Exhaustion — Истощение;
Frightened — Испуганный; Grappled — Схваченный; Incapacitated — Недееспособный; Invisible — Невидимый;
Paralyzed — Парализованный; Petrified — Окаменевший; Poisoned — Отравленный; Prone — Лежащий ничком;
Restrained — Опутанный; Stunned — Ошеломлённый; Unconscious — Без сознания;
урон: Acid — кислотой; Bludgeoning — дробящий; Cold — холодом; Fire — огнём; Force — силовым полем;
Lightning — электричеством; Necrotic — некротический; Piercing — колющий; Poison — ядом;
Psychic — психической энергией; Radiant — излучением; Slashing — рубящий; Thunder — звуком;
Resistance — сопротивление; Vulnerability — уязвимость; Immunity — иммунитет;
feet / ft. — футов / фт.; miles — миль; Sphere — Сфера; Cone — Конус; Cube — Куб; Cylinder — Цилиндр;
Line — Линия; Emanation — Эманация; Melee Attack Roll — бросок рукопашной атаки;
Ranged Attack Roll — бросок дальнобойной атаки; Hit: — Попадание:; Miss: — Промах:;
Failure: — Провал:; Success: — Успех:; Legendary Resistance — легендарное сопротивление;
Rage — ярость; Unarmed Strike — безоружный удар; Bardic Inspiration — вдохновение барда;
Channel Divinity — Божественный канал; Wild Shape — Дикий облик; Sneak Attack — Скрытая атака;
Ki / Focus Points — очки сосредоточенности; Sorcery Points — очки чародейства; Pact Magic — магия договора;
Eldritch Invocation — воззвание; Metamagic — метамагия; Weapon Mastery — мастерство оружия.
Размеры: Tiny — Крошечный, Small — Маленький, Medium — Средний, Large — Большой, Huge — Огромный,
Gargantuan — Громадный. Типы существ — со строчной: aberration — аберрация, beast — зверь,
celestial — небожитель, construct — конструкт, dragon — дракон, elemental — элементаль, fey — фея,
fiend — исчадие, giant — великан, humanoid — гуманоид, monstrosity — чудовище, ooze — слизь,
plant — растение, undead — нежить."""

RULES_COMMON = """ПРАВИЛА ОТВЕТА:
- Ответ — только JSON той же структуры, что и вход: те же ключи, тот же порядок, та же длина списков.
- Поле "id" не переводить и не менять.
- Формулы кубов (1d8, 8d6, 2d4 + 2, d12) — латиницей и без изменений. Все числа — те же и столько же,
  цифрами («2-го», «10 минут»), не словами.
- Каждый элемент списка переводи отдельным элементом: абзацы не объединяй и не дели.
- Писать только по-русски, кириллицей; никаких китайских иероглифов и английских слов (кроме формул кубов).
- Обращение к игроку — на «вы» со строчной. Единицы — футы (фт.), не метры."""

MODE_PROMPT = {
    "translate": """Ты — переводчик правил D&D 5e (SRD 5.2.1, лицензия CC-BY-4.0) на русский язык.
Переводи ТОЧНО и полно: каждое условие, ограничение и число из оригинала должны остаться.
Стиль — как в русском издании правил: ясно, без украшательств.""",
    "paraphrase": """Ты — редактор правил D&D. Вход — сухая механика на английском (контент вне SRD).
Перескажи её по-русски КРАТКО и СВОИМИ СЛОВАМИ: пункты механики, без художественного текста,
без дословного перевода оборотов книги. Сохраняй все числа, уровни, кубы, действия, сроки и частоту
использования — механика должна остаться точной.""",
}


def log(msg: str) -> None:
    print(time.strftime("%H:%M:%S"), msg, flush=True)


def read_json(path: Path, default=None):
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data) -> None:
    """Запись через временный файл: обрыв на середине не портит уже сохранённое."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    tmp.replace(path)


# ───────────────────────── выделение и возврат текста ─────────────────────────

def has_text(v) -> bool:
    if isinstance(v, str):
        return bool(v.strip())
    if isinstance(v, list):
        return any(has_text(x) for x in v)
    if isinstance(v, dict):
        return any(has_text(x) for x in v.values())
    return False


def extract(obj: dict, keys: set) -> dict:
    """Только переводимые поля записи (с вложенностью), остальное модели не нужно."""
    out = {}
    for k, v in obj.items():
        if k in keys and has_text(v):
            out[k] = extract_value(v, keys)
    return out


def extract_value(v, keys):
    if isinstance(v, dict):
        return extract(v, keys)
    if isinstance(v, list):
        return [extract_value(x, keys) for x in v]
    return v


def merge(orig, tr):
    """Переведённые поля поверх исходной записи; числа и служебные поля — из исходника."""
    if isinstance(orig, dict) and isinstance(tr, dict):
        out = dict(orig)
        for k, v in tr.items():
            out[k] = merge(orig.get(k), v)
        return out
    if isinstance(orig, list) and isinstance(tr, list):
        return [merge(o, t) for o, t in zip(orig, tr)]
    return tr


def shape(v):
    if isinstance(v, dict):
        return {k: shape(x) for k, x in v.items()}
    if isinstance(v, list):
        return [shape(x) for x in v]
    return type(v).__name__


def coerce(source, answer):
    """Мелкие расхождения формы, не меняющие смысла: лишние ключи убираются, строка на месте
    списка из одной строки оборачивается, список строк на месте строки склеивается."""
    if isinstance(source, dict) and isinstance(answer, dict):
        return {k: coerce(v, answer[k]) if k in answer else answer.get(k) for k, v in source.items()
                if k in answer}
    if isinstance(source, list) and isinstance(answer, str) and len(source) == 1:
        return [answer]
    if isinstance(source, list) and isinstance(answer, list):
        if all(isinstance(x, str) for x in source) and all(isinstance(x, str) for x in answer) \
                and len(source) == 1 and len(answer) > 1:
            return [" ".join(answer)]
        return [coerce(s, a) for s, a in zip(source, answer)] + answer[len(source):]
    if isinstance(source, str) and isinstance(answer, list) and all(isinstance(x, str) for x in answer):
        return " ".join(answer)
    return answer


def shape_errors(source, answer, path="") -> list:
    """Где именно форма ответа не совпала со входом — для замечания модели."""
    where = path or "запись"
    if isinstance(source, dict):
        if not isinstance(answer, dict):
            return [f"{where}: нужен объект"]
        out = [f"{path + '.' if path else ''}{k}: поле пропущено" for k in source if k not in answer]
        for k in source:
            if k in answer:
                out += shape_errors(source[k], answer[k], f"{path + '.' if path else ''}{k}")
        return out
    if isinstance(source, list):
        if not isinstance(answer, list):
            return [f"{where}: нужен список"]
        if len(source) != len(answer):
            return [f"{where}: в списке должно быть {len(source)} элемент(а), а не {len(answer)} — "
                    "абзацы не объединяй и не дели"]
        out = []
        for i, (s, a) in enumerate(zip(source, answer)):
            out += shape_errors(s, a, f"{where}[{i}]")
        return out
    if not isinstance(answer, str):
        return [f"{where}: нужна строка"]
    return []


def strings(v):
    if isinstance(v, str):
        yield v
    elif isinstance(v, list):
        for x in v:
            yield from strings(x)
    elif isinstance(v, dict):
        for k, x in v.items():
            if k != "id":
                yield from strings(x)


# ───────────────────────── проверки ─────────────────────────

# Формулы кубов — только латиницей (кириллическое «к 5» — предлог, не куб).
DICE = re.compile(r"\b\d*d\d+(?!\d)", re.IGNORECASE)
NUMBER = re.compile(r"\d+")
CJK = re.compile(r"[⺀-⿟　-ヿ㐀-䶿一-鿿가-힯豈-﫿]")
CYRILLIC = re.compile(r"[а-яё]", re.IGNORECASE)
LATIN_WORD = re.compile(r"\b[a-zA-Z]{4,}\b")


def dice_of(texts):
    return Counter(d.lower() for t in texts for d in DICE.findall(t))


def numbers_of(texts):
    return Counter(n for t in texts for n in NUMBER.findall(DICE.sub(" ", t)))


def check(source: dict, answer, mode: str) -> list:
    """Ошибки ответа модели (пустой список — ответ годится)."""
    if not isinstance(answer, dict):
        return ["ответ — не JSON-объект"]
    errors = []
    if answer.get("id") != source.get("id"):
        errors.append(f"id изменён: «{answer.get('id')}» вместо «{source.get('id')}»")
    if shape(answer) != shape(source):
        errors += shape_errors(source, answer)[:4] or ["структура не совпадает со входом"]
        return errors
    src_texts = list(strings(source))
    out_texts = list(strings(answer))
    if dice_of(src_texts) != dice_of(out_texts):
        errors.append(f"формулы кубов изменены: было {sorted(dice_of(src_texts).elements())}, "
                      f"стало {sorted(dice_of(out_texts).elements())}")
    src_n, out_n = numbers_of(src_texts), numbers_of(out_texts)
    # «1 mile» → «миля», «1 minute» → «минута»: по-русски единица часто уходит в слово.
    src_n["1"] = min(src_n["1"], out_n["1"])
    if src_n != out_n:
        lost = sorted((src_n - out_n).elements(), key=int)
        extra = sorted((out_n - src_n).elements(), key=int)
        errors.append(f"числа не совпадают: потеряны {lost}, лишние {extra}")
    for t in out_texts:
        if CJK.search(t):
            errors.append(f"иероглифы в тексте: «{t[:60]}»")
            break
    for s, t in zip(src_texts, out_texts):
        if LATIN_WORD.search(s) and not CYRILLIC.search(t):
            errors.append(f"не переведено: «{t[:60]}»")
            break
        leftover = LATIN_WORD.findall(t)
        if mode == "translate" and len(leftover) >= 3:
            errors.append(f"английские слова в переводе: {leftover[:5]}")
            break
    return errors


# ───────────────────────── модель ─────────────────────────

def ollama(host: str, model: str, messages: list) -> str:
    body = json.dumps({
        "model": model,
        "messages": messages,
        "stream": False,
        "think": False,
        "format": "json",
        "options": {"temperature": 0.2, "num_ctx": 8192},
    }).encode("utf-8")
    req = urllib.request.Request(f"{host}/api/chat", data=body,
                                 headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=900) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    return data.get("message", {}).get("content", "")


def system_prompt(mode: str, fixed: dict) -> str:
    parts = [MODE_PROMPT[mode], GLOSSARY, RULES_COMMON]
    if fixed:
        parts.append("ЗАДАННЫЕ НАЗВАНИЯ (используй как есть): "
                     + "; ".join(f"{k} — {v}" for k, v in fixed.items()))
    return "\n\n".join(parts)


def few_shot(collection: str, raw_records: dict, examples: dict, keys: set, skip_id: str):
    ex = examples.get(collection)
    if not ex or ex["id"] == skip_id or ex["id"] not in raw_records:
        return []
    src = {"id": ex["id"], **extract(raw_records[ex["id"]], keys)}
    return [{"role": "user", "content": json.dumps(src, ensure_ascii=False)},
            {"role": "assistant", "content": json.dumps(ex["ru"], ensure_ascii=False)}]


def chunks(payload: dict) -> list:
    """Большая запись → части: короткие поля вместе, каждый длинный список — кусками."""
    if len(json.dumps(payload, ensure_ascii=False)) <= CHUNK_CHARS:
        return [payload]
    rid = payload["id"]
    head = {"id": rid}
    parts = []
    for k, v in payload.items():
        if k == "id":
            continue
        if isinstance(v, list) and len(json.dumps(v, ensure_ascii=False)) > CHUNK_CHARS // 3:
            piece, size = [], 0
            for item in v:
                n = len(json.dumps(item, ensure_ascii=False))
                if piece and size + n > CHUNK_CHARS:
                    parts.append((k, piece))
                    piece, size = [], 0
                piece.append(item)
                size += n
            if piece:
                parts.append((k, piece))
        else:
            head[k] = v
    out = [head] if len(head) > 1 else []
    for k, piece in parts:
        out.append({"id": rid, k: piece})
    return out


def join_chunks(payload: dict, answers: list) -> dict:
    result = {"id": payload["id"]}
    for a in answers:
        for k, v in a.items():
            if k == "id":
                continue
            if k in result and isinstance(v, list):
                result[k] = result[k] + v
            else:
                result[k] = v
    return {k: result[k] for k in payload}


def translate_part(args, system: str, shots: list, part: dict, mode: str):
    """Одна часть записи: запрос, проверка, до RETRIES повторов с замечанием."""
    messages = [{"role": "system", "content": system}, *shots,
                {"role": "user", "content": json.dumps(part, ensure_ascii=False)}]
    last, errors = "", []
    for attempt in range(RETRIES + 1):
        try:
            last = ollama(args.host, args.model, messages)
            answer = coerce(part, json.loads(last))
        except json.JSONDecodeError:
            answer, errors = None, ["ответ — не валидный JSON"]
        else:
            errors = check(part, answer, mode)
            if not errors:
                return answer, []
        if attempt < RETRIES:
            log(f"   повтор {attempt + 1}: {'; '.join(errors)}")
            messages += [{"role": "assistant", "content": last},
                         {"role": "user", "content": "Исправь ответ. Ошибки: " + "; ".join(errors)
                          + ". Верни полный JSON той же структуры."}]
    return None, errors + [f"последний ответ: {last[:400]}"]


def fixed_names(collection: str, rid: str, known: dict) -> dict:
    if collection == "spells" and rid in known:
        return {rid: known[rid]}
    return {}


def run_collection(args, collection: str, examples: dict, known_names: dict) -> None:
    src_name, out_name, keys = COLLECTIONS[collection]
    raw = read_json(RAW / src_name)
    if raw is None:
        log(f"{collection}: нет исходника {src_name} — пропуск")
        return
    mode = raw.get("mode", "translate")
    records = {r["id"]: r for r in raw["records"]}
    out_path, review_path = OUT / out_name, REVIEW / out_name
    out = read_json(out_path) or {
        "source": raw.get("source"), "license": raw.get("license"),
        "attribution": raw.get("attribution"), "mode": mode, "records": {}}
    review = read_json(review_path, {})
    todo = [r for rid, r in records.items()
            if rid not in out["records"] and r.get("status", "ready") != "todo"]
    if args.limit:
        todo = todo[:args.limit]
    skipped = sum(1 for r in records.values() if r.get("status") == "todo")
    log(f"{collection}: всего {len(records)}, готово {len(out['records'])}, "
        f"к переводу {len(todo)}" + (f", не заполнено (todo) {skipped}" if skipped else ""))
    for n, rec in enumerate(todo, 1):
        rid = rec["id"]
        payload = {"id": rid, **extract(rec, keys)}
        system = system_prompt(mode, fixed_names(collection, rid, known_names))
        shots = few_shot(collection, records, examples, keys, rid)
        started = time.time()
        answers, failed = [], []
        for part in chunks(payload):
            answer, errors = translate_part(args, system, shots, part, mode)
            if answer is None:
                failed = errors
                break
            answers.append(answer)
        if failed:
            review[rid] = {"errors": failed, "at": time.strftime("%Y-%m-%d %H:%M")}
            write_json(review_path, review)
            log(f"✗ [{n}/{len(todo)}] {rid}: на проверку — {failed[0]}")
            continue
        translated = merge(rec, join_chunks(payload, answers))
        translated.pop("status", None)
        translated.pop("verify", None)
        out["records"][rid] = translated
        write_json(out_path, out)
        if review.pop(rid, None) is not None:
            write_json(review_path, review)
        log(f"✓ [{n}/{len(todo)}] {rid} — {translated.get('name', '')} ({time.time() - started:.0f} с)")


def selftest(examples: dict) -> int:
    """Эталоны проходят проверки скрипта (без модели)."""
    bad = 0
    for collection, ex in examples.items():
        if collection == "note":
            continue
        src_name, _, keys = COLLECTIONS[collection]
        records = {r["id"]: r for r in read_json(RAW / src_name)["records"]}
        payload = {"id": ex["id"], **extract(records[ex["id"]], keys)}
        errors = check(payload, ex["ru"], read_json(RAW / src_name).get("mode", "translate"))
        print(f"{collection}/{ex['id']}: {'ok' if not errors else errors}")
        bad += bool(errors)
    return bad


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--only", help="коллекции через запятую: " + ", ".join(COLLECTIONS))
    p.add_argument("--limit", type=int, default=0, help="не больше N записей на коллекцию")
    p.add_argument("--model", default=MODEL)
    p.add_argument("--host", default=HOST)
    p.add_argument("--selftest", action="store_true", help="проверить эталоны без модели")
    args = p.parse_args()
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    examples = read_json(EXAMPLES, {})
    if args.selftest:
        sys.exit(selftest(examples))
    known = read_json(SPELL_NAMES, {})
    names = [c.strip() for c in args.only.split(",")] if args.only else list(COLLECTIONS)
    for c in names:
        if c not in COLLECTIONS:
            sys.exit(f"нет коллекции «{c}»: {', '.join(COLLECTIONS)}")
    try:
        urllib.request.urlopen(f"{args.host}/api/tags", timeout=10).read()
    except (urllib.error.URLError, OSError) as e:
        sys.exit(f"Ollama не отвечает на {args.host}: {e}")
    try:
        for c in names:
            run_collection(args, c, examples, known)
    except KeyboardInterrupt:
        log("Остановлено. Готовое сохранено — при следующем запуске продолжу с того же места.")


if __name__ == "__main__":
    main()
