// Полный лист персонажа в базе знаний: живые данные движка, все блоки раскрыты.

import { exportSheet, type SheetFormat } from "../lib/sheetExport";
import { useEffect, useState } from "react";
import {
  characterDetails,
  characterSheet,
  errorText,
  inventory as loadInventory,
  signed,
  spellbook,
  type CharacterSheet,
  type InventoryView,
  type PartyView,
  type SheetDetails,
  type SpellbookView,
} from "../lib/engine";
import SheetEditor from "./SheetEditor";
import SheetSections, { Block, SheetFacts, StatusLine } from "./SheetSections";

interface Loaded {
  sheet: CharacterSheet;
  details: SheetDetails;
  inventory: InventoryView;
  book: SpellbookView | null;
}

function SpellsSummary({ book }: { book: SpellbookView }) {
  return (
    <div className="space-y-2 text-sm">
      {book.slots.length > 0 && (
        <p className="text-xs">
          Ячейки:{" "}
          {book.slots
            .map((s) => `${s.level} круг${s.pact ? " (договор)" : ""} ${s.pool.current}/${s.pool.max}`)
            .join(" · ")}
        </p>
      )}
      {book.casters.map((c) => (
        <div key={c.id}>
          <div className="text-xs text-gold/80">
            {c.label}: КС {c.save_dc}, атака {signed(c.attack_bonus)}
          </div>
          {c.cantrips.length > 0 && (
            <p className="text-xs">Заговоры: {c.cantrips.map((s) => s.name).join(", ")}</p>
          )}
          <p className="text-xs">
            Готовые:{" "}
            {c.spells
              .filter((s) => s.ready)
              .map((s) => `${s.name} (${s.level})`)
              .join(", ") || "—"}
          </p>
        </div>
      ))}
      {book.granted.length > 0 && (
        <p className="text-xs">От черт и предметов: {book.granted.map((g) => g.spell.name).join(", ")}</p>
      )}
      <p className="text-[11px] text-muted">Накладывание и подготовка — во вкладке «Заклинания» листа персонажа.</p>
    </div>
  );
}

export function FullSheet({
  id,
  onBack,
  onOpenTreasury,
  onChanged,
}: {
  id: string;
  onBack: () => void;
  onOpenTreasury?: () => void;
  /** Лист изменён — обновить панели приложения. */
  onChanged?: () => void;
}) {
  const [data, setData] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    Promise.all([
      characterSheet(id),
      characterDetails(id),
      loadInventory(id),
      spellbook(id).catch(() => null),
    ])
      .then(([sheet, details, inventory, book]) => {
        if (!cancelled) setData({ sheet, details, inventory, book });
      })
      .catch((e: unknown) => !cancelled && setError(errorText(e)));
    return () => {
      cancelled = true;
    };
  }, [id, version]);

  return (
    <article className="space-y-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={onBack} className="text-sm text-muted hover:text-parchment">
          ← Назад
        </button>
        <SheetExportButtons id={id} />
      </div>
      {error && <p className="text-sm text-fumble">{error}</p>}
      {!data && !error && <p className="text-sm text-muted">Лист загружается…</p>}
      {data && (
        <>
          <header className="space-y-1">
            <div className="text-[11px] text-gold/80">Игрок · Отряд · лист из движка</div>
            <h3 className="font-serif text-2xl text-parchment">{data.sheet.name}</h3>
            {data.sheet.title && <p className="text-sm text-muted">{data.sheet.title}</p>}
            <p className="text-sm">
              {data.sheet.classes.length > 0
                ? data.sheet.classes
                    .map((c) => `${c.class} ${c.level}${c.subclass ? ` (${c.subclass})` : ""}`)
                    .join(" / ")
                : data.sheet.race}
            </p>
            <p className="text-xs text-muted">
              {data.sheet.race}
              {data.sheet.level > 0 ? ` · Уровень ${data.sheet.level}` : ""} · Мастерство{" "}
              {signed(data.sheet.proficiency_bonus)} · 📍 {data.sheet.location}
            </p>
          </header>

          <dl className="grid grid-cols-4 gap-2 text-center">
            {[
              ["Хиты", `${data.sheet.hit_points.current}/${data.sheet.hit_points.max}${data.sheet.hit_points.temporary ? ` +${data.sheet.hit_points.temporary}` : ""}`],
              ["КД", String(data.sheet.armor_class)],
              ["Иниц.", signed(data.sheet.initiative)],
              ["Скорость", `${data.sheet.speed_ft} фт`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-edge py-1.5">
                <dt className="text-[11px] text-muted">{label}</dt>
                <dd className="font-mono text-sm">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="rounded-md border border-gold/60 px-3 py-1.5 text-sm text-gold hover:bg-gold/10"
            >
              {editing ? "Готово" : "✎ Редактировать лист"}
            </button>
            {data.details.edited.length > 0 && (
              <span className="text-xs text-arcane">изменено игроком: {data.details.edited.length}</span>
            )}
          </div>

          {editing && (
            <SheetEditor
              sheet={data.sheet}
              details={data.details}
              attacks={data.details.raw_attacks}
              onChanged={() => {
                setVersion((v) => v + 1);
                onChanged?.();
              }}
            />
          )}

          <StatusLine details={data.details} />
          <SheetFacts details={data.details} />

          {data.sheet.resources.length > 0 && (
            <Block title="Ресурсы" badge={data.sheet.resources.length} open>
              <ul className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                {data.sheet.resources.map((r) => (
                  <li key={r.id} className="flex justify-between gap-2 text-sm">
                    <span className="min-w-0 truncate">{r.name}</span>
                    <span className="shrink-0 font-mono text-xs">
                      {r.current}/{r.max}
                    </span>
                  </li>
                ))}
              </ul>
            </Block>
          )}

          <SheetSections
            sheet={data.sheet}
            details={data.details}
            inventory={data.inventory}
            open
            onOpenTreasury={onOpenTreasury}
          />

          {data.book && (
            <Block title="Заклинания" open>
              <SpellsSummary book={data.book} />
            </Block>
          )}
        </>
      )}
    </article>
  );
}

/** Раздел «Отряд» слоя игрока: живые карточки персонажей. */
export function PartySection({ party, onOpen }: { party: PartyView | null; onOpen: (id: string) => void }) {
  if (!party) return <p className="text-sm text-muted">Отряд загружается… (нужен движок: приложение или веб-сборка)</p>;
  return (
    <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2">
      {party.members.map((m) => (
        <li key={m.id}>
          <button
            type="button"
            onClick={() => onOpen(m.id)}
            className="w-full rounded-lg border border-edge p-3 text-left hover:border-gold/60"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-medium">{m.name}</span>
              <span className="shrink-0 font-mono text-xs text-muted">КД {m.armor_class}</span>
            </div>
            <div className="text-xs text-muted">{m.summary}</div>
            <p className="mt-1.5 text-sm">
              Хиты {m.hit_points.current}/{m.hit_points.max}
              {m.hit_points.temporary > 0 ? ` +${m.hit_points.temporary}` : ""} · 📍 {m.location}
            </p>
            <div className="mt-1 text-xs text-gold">Полный лист →</div>
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Экспорт листа: JSON (для импорта), DOC (Word), PDF; DOC и PDF тоже импортируются. */
function SheetExportButtons({ id }: { id: string }) {
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function run(format: SheetFormat) {
    setBusy(true);
    setNote(null);
    try {
      setNote(await exportSheet(id, format));
    } catch (e) {
      setNote(`Лист не сохранён: ${errorText(e)}`);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-1 text-xs">
        <span className="self-center text-muted">Экспорт:</span>
        {(["json", "pdf", "doc"] as const).map((f) => (
          <button
            key={f}
            type="button"
            disabled={busy}
            onClick={() => void run(f)}
            className="rounded border border-edge px-2 py-0.5 uppercase hover:border-gold disabled:opacity-40"
          >
            {f}
          </button>
        ))}
      </div>
      {note && <p className="max-w-xs text-right text-[11px] text-muted">{note}</p>}
    </div>
  );
}
