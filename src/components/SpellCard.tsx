import { useMemo, useState, type ReactNode } from "react";
import { CLASS_LABELS, levelLabel, SPELL_BY_ID, SRD_ATTRIBUTION } from "../data/spells/index.ts";
import {
  castSpell,
  errorText,
  type CastMethod,
  type CastOutcome,
  type SpellbookView,
} from "../lib/engine";
import Modal from "./Modal";

/** Выделение `***Название.***` и `**текст**` из текстов SRD. */
function inline(text: string): ReactNode[] {
  return text.split(/(\*{2,3}[^*]+\*{2,3})/g).map((part, i) =>
    /^\*{2,3}[^*]+\*{2,3}$/.test(part) ? (
      <strong key={i} className="text-parchment">
        {part.replace(/\*/g, "")}
      </strong>
    ) : (
      part
    ),
  );
}

/** Таблица в формате Markdown: `| a | b |`. */
function Table({ lines }: { lines: string[] }) {
  const rows = lines
    .filter((l) => !/^\|[\s|:-]+\|?$/.test(l.trim()))
    .map((l) =>
      l
        .trim()
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((c) => c.trim()),
    );
  const [head, ...body] = rows;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        {head && (
          <thead>
            <tr>
              {head.map((c, i) => (
                <th key={i} className="border-b border-edge px-2 py-1 text-gold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {body.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} className="border-b border-edge/50 px-2 py-1">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SpellText({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {paragraphs.map((p, i) => {
        const lines = p.split("\n");
        if (lines.some((l) => l.trim().startsWith("|"))) return <Table key={i} lines={lines} />;
        return <p key={i}>{inline(p)}</p>;
      })}
    </div>
  );
}

interface CastOption {
  key: string;
  label: string;
  method: CastMethod | null;
  slotLevel: number | null;
}

/** Способы сотворить заклинание, доступные персонажу прямо сейчас. Правила проверит движок. */
function castOptions(book: SpellbookView, spellId: string, level: number): CastOption[] {
  const ready = book.casters.some(
    (c) => c.spells.some((s) => s.id === spellId && s.ready) || c.cantrips.some((s) => s.id === spellId),
  );
  const options: CastOption[] = [];
  if (level === 0) {
    const granted = book.granted.some((g) => g.spell.id === spellId);
    if (ready || granted) options.push({ key: "cantrip", label: "Заговор, без ячейки", method: null, slotLevel: null });
    return options;
  }
  if (ready) {
    for (const s of book.slots) {
      if (s.level < level || s.pool.current === 0) continue;
      options.push(
        s.pact
          ? {
              key: "pact",
              label: `Ячейка договора, ${s.level} круг (${s.pool.current}/${s.pool.max})`,
              method: "pact",
              slotLevel: null,
            }
          : {
              key: `slot-${s.level}`,
              label: `Ячейка ${s.level} круга (${s.pool.current}/${s.pool.max})${s.level > level ? " — усиление" : ""}`,
              method: "slot",
              slotLevel: s.level,
            },
      );
    }
    const spell = SPELL_BY_ID.get(spellId);
    if (spell?.ritual) {
      options.push({ key: "ritual", label: "Ритуалом: без ячейки, +10 минут", method: "ritual", slotLevel: null });
    }
  }
  for (const g of book.granted.filter((g) => g.spell.id === spellId)) {
    const uses = g.uses ? `${g.uses.current}/${g.uses.max}` : "неограниченно";
    options.push({
      key: `granted-${g.source}`,
      label: `${g.source}: ${g.cast_level} круг (${uses})`,
      method: "granted",
      slotLevel: null,
    });
  }
  const scroll = book.scrolls.find((s) => s.spell.id === spellId);
  if (scroll) {
    options.push({
      key: "scroll",
      label: `Со свитка, ${scroll.level} круг (×${scroll.count})${scroll.usable ? "" : " — нет в списке класса"}`,
      method: "scroll",
      slotLevel: null,
    });
  }
  return options;
}

interface SpellCardProps {
  spellId: string;
  /** Книга персонажа: если задана, в карточке есть кнопка «Сотворить». */
  book: SpellbookView | null;
  onClose: () => void;
  onCast?: (outcome: CastOutcome) => void;
}

export default function SpellCard({ spellId, book, onClose, onCast }: SpellCardProps) {
  const spell = SPELL_BY_ID.get(spellId);
  const options = useMemo(
    () => (book && spell ? castOptions(book, spellId, spell.level) : []),
    [book, spellId, spell],
  );
  const [choice, setChoice] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  if (!spell) {
    return (
      <Modal title="Заклинание" onClose={onClose} size="md">
        <p className="p-4 text-sm text-muted">Заклинания «{spellId}» нет в каталоге.</p>
      </Modal>
    );
  }

  const option = options[Math.min(choice, options.length - 1)];

  function cast() {
    if (!book || !option) return;
    setBusy(true);
    setError(null);
    castSpell(book.character_id, spellId, option.method, option.slotLevel)
      .then((outcome) => {
        setResult(outcome.summary);
        setChoice(0);
        onCast?.(outcome);
      })
      .catch((e: unknown) => setError(errorText(e)))
      .finally(() => setBusy(false));
  }

  const facts: [string, string][] = [
    ["Время накладывания", spell.castingTime],
    ["Дистанция", spell.range],
    ["Компоненты", spell.components],
    ["Длительность", spell.duration],
  ];

  return (
    <Modal title={spell.name} onClose={onClose} size="md">
      <div className="space-y-4 p-4">
        <div>
          <p className="text-sm text-muted">
            {levelLabel(spell.level)} · {spell.school}
            {spell.ritual ? " · ритуал" : ""}
            {spell.concentration ? " · концентрация" : ""}
          </p>
          <p className="text-xs text-muted/80">{spell.nameEn}</p>
        </div>

        <dl className="grid grid-cols-2 gap-2 text-sm">
          {facts.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-edge px-3 py-2">
              <dt className="text-[11px] text-muted">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <SpellText paragraphs={spell.desc} />
        {spell.higher.length > 0 && (
          <div>
            <h3 className="mb-1 text-sm font-medium text-gold">На больших кругах</h3>
            <SpellText paragraphs={spell.higher} />
          </div>
        )}

        <p className="text-xs text-muted">
          Классы: {spell.classes.map((c) => CLASS_LABELS[c] ?? c).join(", ") || "—"}
        </p>

        {book && (
          <div className="space-y-2 border-t border-edge pt-4">
            {options.length === 0 ? (
              <p className="text-sm text-muted">
                Сейчас сотворить нельзя: заклинание не подготовлено, нет свободных ячеек, свитка или зарядов.
              </p>
            ) : (
              <>
                <label className="block text-xs text-muted" htmlFor="cast-option">
                  Чем сотворить
                </label>
                <select
                  id="cast-option"
                  value={Math.min(choice, options.length - 1)}
                  onChange={(e) => setChoice(Number(e.target.value))}
                  className="w-full rounded-md border border-edge bg-ink px-3 py-2 text-sm"
                >
                  {options.map((o, i) => (
                    <option key={o.key} value={i}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={busy}
                  onClick={cast}
                  className="w-full rounded-md bg-blood px-4 py-2.5 font-medium text-parchment hover:bg-blood/80 disabled:opacity-40"
                >
                  Сотворить
                </button>
              </>
            )}
            {result && <p className="rounded-md border border-gold/40 px-3 py-2 text-sm text-gold">⚙ {result}</p>}
            {error && (
              <p role="alert" className="rounded-md border border-fumble/60 px-3 py-2 text-sm text-fumble">
                {error}
              </p>
            )}
          </div>
        )}

        <p className="border-t border-edge pt-3 text-[10px] leading-snug text-muted/70">
          {spell.source === "srd" ? SRD_ATTRIBUTION : `${spell.sourceNote}.`}
        </p>
      </div>
    </Modal>
  );
}
