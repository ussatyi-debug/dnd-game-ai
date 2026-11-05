// Записи базы знаний по ходу игры: список с правкой и удалением, форма новой записи.
// Записи делают мастер (командами движка) и игрок (здесь).

import { useState } from "react";
import { KB_BY_ID, KB_ENTRIES, KB_LAYERS } from "../data/kb/index.ts";
import {
  addNote,
  deleteNote,
  errorText,
  updateNote,
  type MasterNote,
  type NoteLayer,
} from "../lib/engine";

function CardSelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Карточка базы"
      className="w-full rounded-md border border-edge bg-ink px-2 py-1.5 text-sm text-parchment"
    >
      <option value="">Без карточки</option>
      {KB_LAYERS.map((layer) => (
        <optgroup key={layer.id} label={layer.title}>
          {KB_ENTRIES.filter((e) => e.layer === layer.id).map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

/** Форма записи: новая или правка существующей. */
export function NoteForm({
  layer,
  note,
  card,
  onDone,
  onCancel,
}: {
  layer: NoteLayer;
  note?: MasterNote;
  /** Карточка по умолчанию для новой записи. */
  card?: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [text, setText] = useState(note?.text ?? "");
  const [cardId, setCardId] = useState(note?.card ?? card ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function save() {
    setBusy(true);
    setError(null);
    const request = note
      ? updateNote(note.id, { title, text, card: cardId })
      : addNote(layer, title, text, cardId || null);
    request
      .then(() => onDone())
      .catch((e: unknown) => setError(errorText(e)))
      .finally(() => setBusy(false));
  }

  return (
    <div className="space-y-2 rounded-lg border border-gold/50 p-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Заголовок"
        aria-label="Заголовок записи"
        className="w-full rounded-md border border-edge bg-ink px-3 py-1.5 text-sm text-parchment placeholder:text-muted/70 focus:border-gold focus:outline-none"
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Текст записи"
        aria-label="Текст записи"
        className="w-full rounded-md border border-edge bg-ink px-3 py-1.5 text-sm text-parchment placeholder:text-muted/70 focus:border-gold focus:outline-none"
      />
      <CardSelect value={cardId} onChange={setCardId} />
      {error && <p className="text-xs text-fumble">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-md px-3 py-1.5 text-sm text-muted hover:text-parchment">
          Отмена
        </button>
        <button
          type="button"
          disabled={busy || (!title.trim() && !text.trim())}
          onClick={save}
          className="rounded-md bg-gold px-3 py-1.5 text-sm text-ink disabled:opacity-40"
        >
          {note ? "Сохранить" : "Добавить"}
        </button>
      </div>
    </div>
  );
}

function NoteItem({
  note,
  onChanged,
  onOpenCard,
}: {
  note: MasterNote;
  onChanged: () => void;
  onOpenCard?: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const card = note.card ? KB_BY_ID.get(note.card) : undefined;

  if (editing) {
    return (
      <li>
        <NoteForm
          layer={note.layer}
          note={note}
          onDone={() => {
            setEditing(false);
            onChanged();
          }}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="rounded-lg border border-edge p-3">
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium">{note.title}</span>
        <span className="flex shrink-0 items-center gap-1">
          <span className="text-[11px] text-muted">
            День {note.day}
            {note.time ? `, ${note.time}` : ""}
          </span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label="Исправить запись"
            className="rounded px-1.5 text-sm text-muted hover:text-gold"
          >
            ✎
          </button>
          <button
            type="button"
            onClick={() => setConfirm(true)}
            aria-label="Удалить запись"
            className="rounded px-1.5 text-sm text-muted hover:text-fumble"
          >
            🗑
          </button>
        </span>
      </div>
      {note.text && <p className="mt-1 whitespace-pre-line text-sm leading-snug">{note.text}</p>}
      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-muted">
        <span>{note.by_player ? "записали вы" : "записал мастер"}</span>
        {card &&
          (onOpenCard ? (
            <button type="button" onClick={() => onOpenCard(card.id)} className="text-gold underline">
              {card.title}
            </button>
          ) : (
            <span className="text-gold">{card.title}</span>
          ))}
      </div>
      {confirm && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span>Удалить запись?</span>
          <button
            type="button"
            onClick={() =>
              deleteNote(note.id)
                .then(onChanged)
                .catch((e: unknown) => setError(errorText(e)))
            }
            className="rounded border border-fumble px-2 py-0.5 text-fumble"
          >
            Удалить
          </button>
          <button type="button" onClick={() => setConfirm(false)} className="px-2 py-0.5 text-muted">
            Нет
          </button>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-fumble">{error}</p>}
    </li>
  );
}

/** Список записей; `layer` задан — показывается кнопка новой записи в этот слой. */
export function NoteList({
  notes,
  layer,
  card,
  emptyText = "Записей пока нет — мастер добавит их по ходу игры, можно и самому.",
  onChanged,
  onOpenCard,
}: {
  notes: MasterNote[];
  layer?: NoteLayer;
  card?: string;
  emptyText?: string;
  onChanged: () => void;
  onOpenCard?: (id: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  return (
    <div className="space-y-2">
      {layer &&
        (adding ? (
          <NoteForm
            layer={layer}
            card={card}
            onDone={() => {
              setAdding(false);
              onChanged();
            }}
            onCancel={() => setAdding(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-md border border-dashed border-gold/60 px-3 py-1.5 text-sm text-gold hover:bg-gold/10"
          >
            + Новая запись
          </button>
        ))}
      {notes.length === 0 ? (
        <p className="text-sm text-muted">{emptyText}</p>
      ) : (
        <ul className="space-y-2">
          {[...notes].reverse().map((n) => (
            <NoteItem key={n.id} note={n} onChanged={onChanged} onOpenCard={onOpenCard} />
          ))}
        </ul>
      )}
    </div>
  );
}
