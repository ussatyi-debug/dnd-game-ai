import { useEffect, useMemo, useState } from "react";
import { levelLabel } from "../data/spells/index.ts";
import {
  changeSlot,
  errorText,
  preparationOptions,
  restoreSlot,
  type CastOutcome,
  type CasterView,
  type RestorerView,
  type SlotView,
  type SpellEntry,
  type SpellbookView,
} from "../lib/engine";
import PrepareWindow from "./PrepareWindow";
import SpellCard from "./SpellCard";

type Filter = "active" | "all" | "rituals" | "scrolls";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "active", label: "Подготовленные" },
  { id: "all", label: "Все известные" },
  { id: "rituals", label: "Ритуалы" },
  { id: "scrolls", label: "Свитки" },
];

interface Row {
  entry: SpellEntry;
  /** Подпись справа: источник, применения, количество свитков. */
  note: string | null;
  dim: boolean;
}

interface SpellbookPanelProps {
  book: SpellbookView;
  /** Книга изменилась в движке: обновить листы, отряд и книгу. */
  onChanged: () => void;
  /** Строка в диалог от движка. */
  onNote: (text: string) => void;
}

function SlotPips({ slot, disabled, onSpend, onRestore }: {
  slot: SlotView;
  disabled: boolean;
  onSpend: () => void;
  onRestore: () => void;
}) {
  const color = slot.pact ? "border-arcane bg-arcane" : "border-gold bg-gold";
  return (
    <div className="flex items-center justify-between gap-2">
      <span className={`text-sm ${slot.pact ? "text-arcane" : ""}`}>
        {slot.pact ? `Договор · ${slot.level} круг` : levelLabel(slot.level)}
      </span>
      <span className="flex items-center gap-1.5">
        {Array.from({ length: slot.pool.max }, (_, i) => {
          const filled = i < slot.pool.current;
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={filled ? onSpend : onRestore}
              aria-label={filled ? "Потратить ячейку" : "Вернуть ячейку"}
              title={filled ? "Потратить ячейку" : "Вернуть ячейку"}
              className={`h-6 w-6 rounded-full border-2 ${filled ? color : `${color.split(" ")[0]} bg-transparent`} disabled:opacity-50`}
            />
          );
        })}
        <span className="w-9 text-right font-mono text-xs">
          {slot.pool.current}/{slot.pool.max}
        </span>
      </span>
    </div>
  );
}

function Restorer({ book, restorer, disabled, onRestore }: {
  book: SpellbookView;
  restorer: RestorerView;
  disabled: boolean;
  onRestore: (slot: SlotView) => void;
}) {
  const eligible = book.slots.filter(
    (s) => s.pool.current < s.pool.max && (restorer.pact_only ? s.pact : s.level <= restorer.max_level),
  );
  const [level, setLevel] = useState(0);
  const target = eligible[Math.min(level, eligible.length - 1)];
  const uses = restorer.uses;
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="min-w-0 flex-1">
        {restorer.label}{" "}
        <span className="font-mono text-xs text-muted">
          {uses.current}/{uses.max}
        </span>
      </span>
      {eligible.length > 1 && (
        <select
          value={Math.min(level, eligible.length - 1)}
          onChange={(e) => setLevel(Number(e.target.value))}
          aria-label="Какую ячейку вернуть"
          className="rounded-md border border-edge bg-ink px-2 py-1 text-xs"
        >
          {eligible.map((s, i) => (
            <option key={`${s.pact}-${s.level}`} value={i}>
              {s.pact ? "договор" : `${s.level} круг`}
            </option>
          ))}
        </select>
      )}
      <button
        type="button"
        disabled={disabled || uses.current === 0 || !target}
        onClick={() => target && onRestore(target)}
        className="rounded-md border border-edge px-2 py-1 text-xs hover:border-gold disabled:opacity-40"
      >
        Вернуть ячейку
      </button>
    </div>
  );
}

function SpellRow({ row, onOpen }: { row: Row; onOpen: () => void }) {
  const s = row.entry;
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className={`flex w-full items-center gap-2 py-2 text-left text-sm hover:text-gold ${row.dim ? "text-muted" : ""}`}
      >
        <span className="min-w-0 flex-1 truncate">
          {s.always && <span className="mr-1 text-gold" title="Подготовлено всегда">🔒</span>}
          {s.name}
          {s.concentration && (
            <span className="ml-1.5 rounded border border-edge px-1 text-[10px] text-muted" title="Концентрация">
              К
            </span>
          )}
          {s.ritual && (
            <span className="ml-1 rounded border border-edge px-1 text-[10px] text-muted" title="Ритуал">
              Р
            </span>
          )}
        </span>
        {row.note && <span className="shrink-0 truncate text-[11px] text-muted">{row.note}</span>}
      </button>
    </li>
  );
}

function groupByLevel(rows: Row[]): [number, Row[]][] {
  const map = new Map<number, Row[]>();
  for (const r of rows) map.set(r.entry.level, [...(map.get(r.entry.level) ?? []), r]);
  for (const list of map.values()) list.sort((a, b) => a.entry.name.localeCompare(b.entry.name, "ru"));
  return [...map.entries()].sort(([a], [b]) => a - b);
}

function casterCounter(c: CasterView): { text: string; warn: boolean } | null {
  if (c.preparation === "known") {
    return c.max_known !== null ? { text: `Известно ${c.known_count ?? 0}/${c.max_known}`, warn: false } : null;
  }
  return { text: `Подготовлено ${c.prepared_count ?? 0}/${c.prepared_limit ?? 0}`, warn: c.over_limit };
}

export default function SpellbookPanel({ book, onChanged, onNote }: SpellbookPanelProps) {
  const [filter, setFilter] = useState<Filter>("active");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSpell, setOpenSpell] = useState<string | null>(null);
  const [preparing, setPreparing] = useState<string | null>(null);
  const [classLists, setClassLists] = useState<Record<string, SpellEntry[]>>({});

  // Полные списки классов с подготовкой — для фильтра «Все известные».
  useEffect(() => {
    if (filter !== "all") return;
    for (const c of book.casters) {
      if (c.preparation === "known") continue;
      preparationOptions(book.character_id, c.id)
        .then((list) => setClassLists((prev) => ({ ...prev, [c.id]: list })))
        .catch(() => undefined);
    }
  }, [filter, book]);

  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    const multi = book.casters.length > 1;
    const sourceOf = (c: CasterView, e: SpellEntry) => e.tag ?? (multi ? c.label : null);
    if (filter === "scrolls") {
      for (const s of book.scrolls) {
        out.push({
          entry: { ...s.spell, level: s.level },
          note: `×${s.count}${s.usable ? (s.check_dc ? ` · проверка КС ${s.check_dc}` : "") : " · нет в списке класса"}`,
          dim: !s.usable,
        });
      }
    } else {
      for (const c of book.casters) {
        for (const e of c.cantrips) if (filter !== "rituals") out.push({ entry: e, note: sourceOf(c, e), dim: false });
        const list = filter === "all" && c.preparation !== "known" ? (classLists[c.id] ?? c.spells) : c.spells;
        for (const e of list) {
          if (filter === "rituals" && !e.ritual) continue;
          out.push({ entry: e, note: sourceOf(c, e), dim: !e.ready });
        }
        if (filter === "all") for (const e of c.spellbook) out.push({ entry: e, note: "книга", dim: !e.ready });
      }
      for (const g of book.granted) {
        if (filter === "rituals" && !g.spell.ritual) continue;
        const uses = g.uses ? ` · ${g.uses.current}/${g.uses.max}` : " · ∞";
        out.push({ entry: g.spell, note: `${g.source}${uses}`, dim: g.uses?.current === 0 });
      }
    }
    const q = query.trim().toLowerCase();
    const seen = new Set<string>();
    return out.filter((r) => {
      const key = `${r.entry.id}|${r.note}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return !q || r.entry.name.toLowerCase().includes(q) || r.entry.id.includes(q);
    });
  }, [book, filter, query, classLists]);

  function run<T>(action: Promise<T>, note: (value: T) => string | null) {
    setBusy(true);
    setError(null);
    action
      .then((value) => {
        const text = note(value);
        if (text) onNote(text);
        onChanged();
      })
      .catch((e: unknown) => setError(errorText(e)))
      .finally(() => setBusy(false));
  }

  const slotRef = (s: SlotView) => (s.pact ? ("pact" as const) : { level: s.level });
  const preparingCaster = book.casters.find((c) => c.id === preparing) ?? null;

  return (
    <div className="space-y-4 p-4">
      {book.slots.length > 0 && (
        <section className="space-y-2 rounded-lg border border-edge p-3">
          <h3 className="text-xs uppercase tracking-wide text-muted">Ячейки</h3>
          {book.slots.map((s) => (
            <SlotPips
              key={`${s.pact}-${s.level}`}
              slot={s}
              disabled={busy}
              onSpend={() => run(changeSlot(book.character_id, slotRef(s), true), () => null)}
              onRestore={() => run(changeSlot(book.character_id, slotRef(s), false), () => null)}
            />
          ))}
          <p className="text-[11px] text-muted">Нажмите на ячейку, чтобы потратить её без заклинания или вернуть.</p>
          {book.restorers.map((r) => (
            <Restorer
              key={r.uses.id}
              book={book}
              restorer={r}
              disabled={busy}
              onRestore={(slot) => run(restoreSlot(book.character_id, r.uses.id, slotRef(slot)), (o) => o.summary)}
            />
          ))}
        </section>
      )}

      {book.casters.map((c) => {
        const counter = casterCounter(c);
        return (
          <section key={c.id} className="rounded-lg border border-edge p-3 text-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="font-medium text-parchment">{c.label}</span>
              <span className="font-mono text-xs">
                {c.ability_label} · КС {c.save_dc} · атака {c.attack_bonus >= 0 ? "+" : "−"}
                {Math.abs(c.attack_bonus)}
              </span>
            </div>
            {c.item_bonus_source && <p className="text-[11px] text-muted">с учётом: {c.item_bonus_source}</p>}
            <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-muted">
                Заговоры {c.cantrips.length}/{c.max_cantrips}
                {counter && (
                  <span className={counter.warn ? " text-fumble" : ""}> · {counter.text}</span>
                )}
              </span>
              {c.preparation !== "known" && (
                <button
                  type="button"
                  onClick={() => setPreparing(c.id)}
                  className="rounded-md border border-edge px-2 py-1 hover:border-gold"
                >
                  Подготовка{book.can_prepare ? "" : " 🔒"}
                </button>
              )}
            </div>
            {c.over_limit && (
              <p className="mt-1 text-[11px] text-fumble">
                В листе подготовлено больше лимита — при следующей подготовке уберите лишнее.
              </p>
            )}
          </section>
        );
      })}

      <div className="flex flex-wrap gap-1" role="tablist" aria-label="Фильтр заклинаний">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full border px-3 py-1 text-xs ${
              filter === f.id ? "border-gold bg-gold text-ink" : "border-edge text-muted hover:text-parchment"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск заклинания"
        aria-label="Поиск заклинания"
        className="w-full rounded-md border border-edge bg-ink px-3 py-2 text-sm placeholder:text-muted/70 focus:border-gold focus:outline-none"
      />

      {error && (
        <p role="alert" className="rounded-md border border-fumble/60 px-3 py-2 text-sm text-fumble">
          {error}
        </p>
      )}

      {rows.length === 0 ? (
        <p className="text-sm text-muted">Ничего не найдено.</p>
      ) : (
        groupByLevel(rows).map(([level, list]) => (
          <section key={level}>
            <h3 className="text-xs uppercase tracking-wide text-gold/80">{levelLabel(level)}</h3>
            <ul className="divide-y divide-edge/60">
              {list.map((r) => (
                <SpellRow key={`${r.entry.id}|${r.note}`} row={r} onOpen={() => setOpenSpell(r.entry.id)} />
              ))}
            </ul>
          </section>
        ))
      )}

      {openSpell && (
        <SpellCard
          spellId={openSpell}
          book={book}
          onClose={() => setOpenSpell(null)}
          onCast={(outcome: CastOutcome) => {
            onNote(outcome.summary);
            onChanged();
          }}
        />
      )}
      {preparingCaster && (
        <PrepareWindow
          book={book}
          caster={preparingCaster}
          onClose={() => setPreparing(null)}
          onOpenSpell={setOpenSpell}
          onPrepared={(_, count) => {
            setPreparing(null);
            onNote(`${preparingCaster.label}: подготовлено заклинаний — ${count}`);
            onChanged();
          }}
        />
      )}
    </div>
  );
}
