// Список сохранений кампании: ручные и автосохранения, загрузка и удаление.
// Удаление подтверждается на месте (системные окна подтверждения на телефоне не показываются).

import { useState } from "react";
import { ago, deleteSave, isManual, type AutosaveInfo } from "../lib/autosave";
import { errorText } from "../lib/engine";

interface SaveListProps {
  saves: AutosaveInfo[];
  /** Слот, который сейчас загружается. */
  busy: number | null;
  onPick: (slot: number) => void;
  /** Список изменился (сохранение удалено). */
  onChanged: () => void;
  /** Первое сохранение подсвечено как «Продолжить». */
  highlightFirst?: boolean;
}

export default function SaveList({ saves, busy, onPick, onChanged, highlightFirst = false }: SaveListProps) {
  const [confirm, setConfirm] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function remove(slot: number) {
    setError(null);
    deleteSave(slot)
      .then(() => {
        setConfirm(null);
        onChanged();
      })
      .catch((e: unknown) => setError(errorText(e)));
  }

  if (saves.length === 0) return <p className="text-muted">Сохранений пока нет.</p>;
  return (
    <div className="space-y-2">
      <ul className="space-y-2">
        {saves.map((s, i) => {
          const manual = isManual(s);
          const title = manual && s.name ? s.name : `День ${s.day ?? "?"}${s.location ? `, ${s.location}` : ""}`;
          const first = highlightFirst && i === 0;
          return (
            <li
              key={s.slot}
              className={`flex items-stretch gap-1 rounded-lg border ${first ? "border-gold/70 bg-gold/5" : "border-edge"}`}
            >
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => onPick(s.slot)}
                className="min-w-0 flex-1 p-3 text-left hover:text-gold disabled:opacity-60"
              >
                <span className="block truncate font-medium">
                  {first ? "Продолжить: " : ""}
                  {title}
                </span>
                <span className="block text-xs text-muted">
                  {busy === s.slot
                    ? "Загружаю…"
                    : `${manual ? "ручное сохранение" : "автосохранение"}, ${ago(s.savedAt)}${
                        manual && s.name ? ` · День ${s.day ?? "?"}` : ""
                      }`}
                </span>
              </button>
              {confirm === s.slot ? (
                <span className="flex items-center gap-1 pr-2">
                  <button
                    type="button"
                    onClick={() => remove(s.slot)}
                    className="rounded-md border border-fumble/70 px-2 py-1 text-xs text-fumble hover:bg-fumble/10"
                  >
                    Удалить
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirm(null)}
                    className="rounded-md border border-edge px-2 py-1 text-xs"
                  >
                    Нет
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirm(s.slot)}
                  className="px-3 text-muted hover:text-fumble"
                  aria-label={`Удалить сохранение «${title}»`}
                  title="Удалить"
                >
                  🗑
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {error && <p className="text-fumble">{error}</p>}
    </div>
  );
}
