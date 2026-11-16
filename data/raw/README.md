# Исходники контента для перевода (пак 0.9.11)

Английские исходники для `tools/translate_local.py`, результат перевода — в `data/rules/`.

## srd52/ — SRD 5.2.1 (точный перевод, `mode: translate`)

| Файл | Записей | Что |
|---|---|---|
| spells.json | 339 | заклинания |
| monsters.json | 341 | бестиарий |
| magic_items.json | 262 | магические предметы |
| feats.json | 17 | таланты SRD |
| class_features.json | 39 | умения классов и подклассов SRD 16–20 уровня |
| conditions.json | 15 | состояния |

Собраны скриптом `tools/build_raw.py` из [5e-database](https://github.com/5e-bits/5e-database)
(`src/2024/en`). Лицензия текста — CC-BY-4.0:

> This work includes material from the System Reference Document 5.2.1 ("SRD 5.2.1") by Wizards of
> the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the
> Creative Commons Attribution 4.0 International License, available at
> https://creativecommons.org/licenses/by/4.0/legalcode.

## phb2024/ — вне SRD (пересказ механики, `mode: paraphrase`)

- `subclasses.json` — 36 подклассов Книги игрока 2024, которых нет в SRD.
- `feats.json` — таланты вне SRD (часть уже есть в игре: `src/data/rules/feats.ts`).

Только сухая механика своими словами — без художественного текста книги. Записи со
`status: "todo"` не заполнены, и переводчик их пропускает; заполненные — `status: "ready"`.
Образцы: `path-of-the-zealot`, `durable`.
