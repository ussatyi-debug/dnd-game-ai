import { useEffect, useMemo, useState } from "react";
import { levelLabel } from "../data/spells/index.ts";
import {
  errorText,
  preparationOptions,
  prepareSpells,
  type CasterView,
  type SpellEntry,
  type SpellbookView,
} from "../lib/engine";
import Modal from "./Modal";

interface PrepareWindowProps {
  book: SpellbookView;
  caster: CasterView;
  onClose: () => void;
  onPrepared: (book: SpellbookView, count: number) => void;
  onOpenSpell: (id: string) => void;
}

/** Подготовка заклинаний после длительного отдыха: список класса с отметками и лимитом. */
export default function PrepareWindow({ book, caster, onClose, onPrepared, onOpenSpell }: PrepareWindowProps) {
  const [options, setOptions] = useState<SpellEntry[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(caster.spells.filter((s) => !s.always).map((s) => s.id)),
  );
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    preparationOptions(book.character_id, caster.id)
      .then(setOptions)
      .catch((e: unknown) => setError(errorText(e)));
  }, [book.character_id, caster.id]);

  const limit = caster.prepared_limit ?? 0;
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map<number, SpellEntry[]>();
    for (const o of options ?? []) {
      if (q && !o.name.toLowerCase().includes(q) && !o.id.includes(q)) continue;
      map.set(o.level, [...(map.get(o.level) ?? []), o]);
    }
    return [...map.entries()].sort(([a], [b]) => a - b);
  }, [options, query]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function save() {
    setBusy(true);
    setError(null);
    prepareSpells(book.character_id, caster.id, [...selected])
      .then((next) => onPrepared(next, selected.size))
      .catch((e: unknown) => setError(errorText(e)))
      .finally(() => setBusy(false));
  }

  const over = selected.size > limit;

  return (
    <Modal title={`Подготовка: ${caster.label}`} onClose={onClose} size="md">
      <div className="flex h-full flex-col">
        <div className="space-y-2 border-b border-edge p-4">
          {!book.can_prepare && (
            <p className="rounded-md border border-gold/40 bg-gold/5 px-3 py-2 text-xs text-gold">
              Подготовка открывается после длительного отдыха и закрывается с первым потраченным заклинанием.
              Список можно посмотреть, но сохранить — нет.
            </p>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">
              {caster.prepared_by_table
                ? "Лимит: по таблице класса"
                : `Лимит: мод. ${caster.ability_label} + ${caster.progression === "half" ? "½ уровня" : "уровень"}`}
            </span>
            <span className={`font-mono ${over ? "text-fumble" : "text-gold"}`}>
              {selected.size}/{limit}
            </span>
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию"
            aria-label="Поиск заклинаний"
            className="w-full rounded-md border border-edge bg-ink px-3 py-2 text-sm placeholder:text-muted/70 focus:border-gold focus:outline-none"
          />
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          {options === null && !error && <p className="text-sm text-muted">Загрузка списка…</p>}
          {groups.map(([level, list]) => (
            <section key={level}>
              <h3 className="mb-1 text-xs uppercase tracking-wide text-muted">{levelLabel(level)}</h3>
              <ul className="divide-y divide-edge/60">
                {list.map((s) => {
                  const checked = s.always || selected.has(s.id);
                  return (
                    <li key={s.id} className="flex items-center gap-3 py-1.5">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={s.always}
                        onChange={() => toggle(s.id)}
                        aria-label={`Подготовить «${s.name}»`}
                        className="h-4 w-4 accent-[var(--color-gold)]"
                      />
                      <button
                        type="button"
                        onClick={() => onOpenSpell(s.id)}
                        className="min-w-0 flex-1 truncate text-left text-sm hover:text-gold"
                      >
                        {s.name}
                        {s.concentration && <span className="ml-1 text-[10px] text-muted">К</span>}
                        {s.ritual && <span className="ml-1 text-[10px] text-muted">Р</span>}
                      </button>
                      {s.always && <span className="shrink-0 text-[11px] text-gold">🔒 {s.tag}</span>}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        <div className="space-y-2 border-t border-edge p-4">
          {error && (
            <p role="alert" className="rounded-md border border-fumble/60 px-3 py-2 text-sm text-fumble">
              {error}
            </p>
          )}
          <button
            type="button"
            disabled={busy || !book.can_prepare || options === null}
            onClick={save}
            className="w-full rounded-md bg-blood px-4 py-2.5 font-medium text-parchment hover:bg-blood/80 disabled:opacity-40"
          >
            Подготовить
          </button>
        </div>
      </div>
    </Modal>
  );
}
