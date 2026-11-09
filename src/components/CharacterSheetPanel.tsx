import { useState } from "react";
import {
  LUCKY_ID,
  PACT_SLOTS_ID,
  signed,
  type CharacterSheet,
  type InventoryView,
  type SheetDetails,
  type Recovery,
  type ResourcePool,
  type RestKind,
  type SpellbookView,
} from "../lib/engine";
import SheetSections, { StatusLine } from "./SheetSections";
import SpellbookPanel from "./SpellbookPanel";

const recoveryLabel: Record<Recovery, string> = {
  short_rest: "короткий отдых",
  long_rest: "длительный отдых",
  one_on_short_rest: "1 на коротком, все на длительном",
  daily: "1/день",
  manual: "вручную",
};

function Pips({ pool, large = false }: { pool: ResourcePool; large?: boolean }) {
  const size = large ? "h-5 w-5" : "h-3 w-3";
  return (
    <span className="flex gap-1" aria-label={`${pool.current} из ${pool.max}`}>
      {Array.from({ length: pool.max }, (_, i) => (
        <span
          key={i}
          className={`${size} rounded-full border border-gold ${i < pool.current ? "bg-gold" : ""}`}
        />
      ))}
    </span>
  );
}

interface CharacterSheetPanelProps {
  sheet: CharacterSheet | null;
  /** Книга заклинаний активного персонажа; `null` — не колдует. */
  book: SpellbookView | null;
  /** Полный лист и инвентарь активного персонажа. */
  details: SheetDetails | null;
  inventory: InventoryView | null;
  busy: boolean;
  onOpenFullSheet: (id: string) => void;
  onOpenTreasury: () => void;
  onRest: (kind: RestKind) => void;
  onSpellsChanged: () => void;
  onEngineNote: (text: string) => void;
}

type Tab = "main" | "resources" | "spells";

/** Ячейки заклинаний показываются во вкладке «Заклинания», а не среди ресурсов. */
function isSlot(r: ResourcePool): boolean {
  return r.id === PACT_SLOTS_ID || r.id.startsWith("slots.");
}

export default function CharacterSheetPanel({
  sheet,
  book,
  details,
  inventory,
  busy,
  onOpenFullSheet,
  onOpenTreasury,
  onRest,
  onSpellsChanged,
  onEngineNote,
}: CharacterSheetPanelProps) {
  const [tab, setTab] = useState<Tab>("main");
  const activeTab: Tab = tab === "spells" && !book ? "main" : tab;

  if (!sheet) {
    return (
      <section className="rounded-xl border border-edge bg-panel p-4 text-sm text-muted">
        Лист персонажа загружается…
      </section>
    );
  }

  const lucky = sheet.resources.find((r) => r.id === LUCKY_ID);
  const others = sheet.resources.filter((r) => r.id !== LUCKY_ID && !isSlot(r));
  const freeSlots = book?.slots.reduce((sum, s) => sum + s.pool.current, 0) ?? 0;
  const hp = sheet.hit_points;
  const hpPercent = hp.max > 0 ? Math.round((hp.current / hp.max) * 100) : 0;

  return (
    <section className="flex min-h-0 flex-col overflow-y-auto rounded-xl border border-edge bg-panel">
      <header className="shrink-0 border-b border-edge p-4">
        <h2 className="font-serif text-xl text-parchment">{sheet.name}</h2>
        <p className="mt-0.5 text-xs text-muted">{sheet.title}</p>
        <p className="mt-2 text-sm">
          {sheet.classes
            .map((c) => `${c.class} ${c.level}${c.subclass ? ` (${c.subclass})` : ""}`)
            .join(" / ")}
        </p>
        <p className="text-xs text-muted">
          {sheet.race}
          {sheet.level > 0 ? ` · Уровень ${sheet.level}` : ""} · Мастерство{" "}
          {signed(sheet.proficiency_bonus)}
        </p>
        <p className="mt-1 text-xs text-gold/80">📍 {sheet.location}</p>
      </header>

      <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-edge p-2" role="tablist">
        {(
          [
            ["main", "Основное"],
            ["resources", "Ресурсы"],
            ...(book ? ([["spells", "Заклинания"]] as const) : []),
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setTab(id)}
            className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm ${
              activeTab === id ? "bg-gold text-ink" : "text-muted hover:text-parchment"
            }`}
          >
            {label}
            {id === "resources" && lucky ? ` ◆${lucky.current}` : ""}
            {id === "spells" && book && book.slots.length > 0 ? ` ✦${freeSlots}` : ""}
          </button>
        ))}
      </div>

      {activeTab === "spells" && book ? (
        <SpellbookPanel key={book.character_id} book={book} onChanged={onSpellsChanged} onNote={onEngineNote} />
      ) : activeTab === "main" ? (
      <div className="space-y-4 p-4">
        <div>
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-muted">Хиты</span>
            <span className="font-mono">
              {hp.current}/{hp.max}
              {hp.temporary > 0 && <span className="text-gold"> +{hp.temporary} врем.</span>}
            </span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-ink">
            <div className="h-full rounded-full bg-blood" style={{ width: `${hpPercent}%` }} />
          </div>
        </div>

        <dl className="grid grid-cols-3 gap-2 text-center">
          {[
            ["КД", String(sheet.armor_class)],
            ["Инициатива", signed(sheet.initiative)],
            ["Скорость", `${sheet.speed_ft} фт`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-edge py-2">
              <dt className="text-[11px] text-muted">{label}</dt>
              <dd className="font-mono text-lg">{value}</dd>
            </div>
          ))}
        </dl>

        {details && <StatusLine details={details} />}

        <button
          type="button"
          onClick={() => onOpenFullSheet(sheet.id)}
          className="w-full rounded-md border border-gold/60 px-3 py-2 text-sm text-gold hover:bg-gold/10"
        >
          📜 Полный лист в базе знаний
        </button>

        {details ? (
          <SheetSections sheet={sheet} details={details} inventory={inventory} onOpenTreasury={onOpenTreasury} />
        ) : (
          <p className="text-sm text-muted">Полный лист загружается…</p>
        )}
      </div>
      ) : (
      <div className="space-y-4 p-4">
        {lucky && (
          <div className="rounded-lg border border-gold/50 bg-gold/5 p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gold">{lucky.name}</span>
              <span className="font-mono text-sm">
                {lucky.current}/{lucky.max}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <Pips pool={lucky} large />
              <span className="text-xs text-muted">{recoveryLabel[lucky.recovery]}</span>
            </div>
          </div>
        )}

        {others.length === 0 && !lucky && (
          <p className="text-sm text-muted">У персонажа нет отслеживаемых ресурсов.</p>
        )}

        <ul className="space-y-2">
          {others.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-2 text-sm">
              <div className="min-w-0">
                <div className="truncate">{r.name}</div>
                <div className="text-[11px] text-muted">{recoveryLabel[r.recovery]}</div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Pips pool={r} />
                <span className="w-8 text-right font-mono text-xs">
                  {r.current}/{r.max}
                </span>
              </div>
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-2 gap-2 border-t border-edge pt-4">
          <button
            type="button"
            disabled={busy}
            onClick={() => onRest("short")}
            className="rounded-md border border-edge px-3 py-2 text-sm hover:border-gold disabled:opacity-40"
          >
            Короткий отдых
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onRest("long")}
            className="rounded-md border border-edge px-3 py-2 text-sm hover:border-gold disabled:opacity-40"
          >
            Длительный отдых
          </button>
        </div>
        <p className="text-[11px] text-muted">Отдых применяется ко всему отряду.</p>
      </div>
      )}
    </section>
  );
}
