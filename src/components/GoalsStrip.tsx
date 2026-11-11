// Активные цели героя на виду: свёрнутая строка над диалогом, по нажатию — список.
// Цели берутся из базы знаний: созданные по ходу игры и встроенные (с учётом статусов).

import { useEffect, useState } from "react";
import { kbEntries } from "../data/kb/index.ts";
import { customCards, isEngineAvailable, kbOverrides } from "../lib/engine";

interface GoalLine {
  id: string;
  title: string;
  /** «шаги 1/3 · срок: День 34». */
  note: string;
  overdue: boolean;
}

const OPEN = new Set(["active", "open", "progress", "planned"]);

export default function GoalsStrip({
  stamp,
  today,
  onOpen,
}: {
  /** Меняется после каждого хода — повод перечитать цели. */
  stamp: unknown;
  today?: number;
  onOpen: (cardId: string) => void;
}) {
  const [goals, setGoals] = useState<GoalLine[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isEngineAvailable()) return;
    let alive = true;
    Promise.all([customCards(), kbOverrides()])
      .then(([cards, overrides]) => {
        if (!alive) return;
        const status = (id: string, own?: string | null) => overrides.find((o) => o.card_id === id)?.status ?? own ?? "";
        const made = cards
          .filter((c) => c.layer === "player" && c.section === "goals" && OPEN.has(status(c.id, c.status) || "active"))
          .map((c) => {
            const steps = c.goal?.steps ?? [];
            const due = c.goal?.due_day ?? null;
            const parts = [
              steps.length ? `шаги ${steps.filter((s) => s.done).length}/${steps.length}` : "",
              due != null ? `срок: День ${due}` : "",
            ].filter(Boolean);
            return { id: c.id, title: c.title, note: parts.join(" · "), overdue: due != null && today != null && today > due };
          });
        const builtIn = kbEntries()
          .filter((e) => e.layer === "player" && e.section === "goals" && OPEN.has(status(e.id, e.status)))
          .map((e) => ({ id: e.id, title: e.title, note: "", overdue: false }));
        setGoals([...made, ...builtIn]);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [stamp, today]);

  if (goals.length === 0) return null;
  return (
    <div className="mb-2 rounded-lg border border-edge bg-panel/60 text-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left"
      >
        <span className="text-gold">
          🎯 Цели: {goals.length}
          {goals.some((g) => g.overdue) && <span className="ml-2 text-xs text-fumble">есть просроченные</span>}
        </span>
        <span className="text-xs text-muted">{open ? "свернуть ▲" : "показать ▼"}</span>
      </button>
      {open && (
        <ul className="max-h-48 space-y-1 overflow-y-auto border-t border-edge px-3 py-2">
          {goals.map((g) => (
            <li key={g.id}>
              <button type="button" onClick={() => onOpen(g.id)} className="w-full text-left hover:text-gold">
                {g.title}
                {g.note && <span className={`ml-2 text-xs ${g.overdue ? "text-fumble" : "text-muted"}`}>{g.note}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
