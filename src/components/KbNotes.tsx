// Записи базы знаний по ходу игры: список с правкой и удалением, форма новой записи.
// Записи делают мастер (командами движка) и игрок (здесь).

import { useState, type ReactNode } from "react";
import { KB_BY_ID, KB_ENTRIES, KB_LAYERS } from "../data/kb/index.ts";
import {
  addNote,
  deleteNote,
  errorText,
  NOTE_KIND_LABEL,
  updateNote,
  type MasterNote,
  type NoteKind,
  type NoteLayer,
} from "../lib/engine";

/** Название карточки по ID: из файлов базы или созданной по ходу игры. */
export type CardTitle = (id: string) => string | null;

const defaultTitle: CardTitle = (id) => KB_BY_ID.get(id)?.title ?? null;

/** Текст записи: номера карточек «[npc.orelie]» становятся ссылками. */
export function LinkedText({
  text,
  onOpenCard,
  cardTitle = defaultTitle,
}: {
  text: string;
  onOpenCard?: (id: string) => void;
  cardTitle?: CardTitle;
}) {
  const parts: ReactNode[] = [];
  const re = /\[([a-z][a-z0-9_]*(?:\.[\p{L}0-9_-]+)+)\]/gu;
  let last = 0;
  for (const m of text.matchAll(re)) {
    const id = m[1] ?? "";
    const title = cardTitle(id);
    const at = m.index ?? 0;
    if (!title) continue;
    parts.push(text.slice(last, at));
    parts.push(
      onOpenCard ? (
        <button key={at} type="button" onClick={() => onOpenCard(id)} className="text-gold underline">
          {title}
        </button>
      ) : (
        <span key={at} className="text-gold">
          {title}
        </span>
      ),
    );
    last = at + m[0].length;
  }
  parts.push(text.slice(last));
  return <>{parts}</>;
}

/** Карточка, созданная по ходу игры, для выбора в записи. */
export interface CardOption {
  id: string;
  title: string;
  layer: string;
}

function CardSelect({
  value,
  onChange,
  customs = [],
}: {
  value: string;
  onChange: (id: string) => void;
  customs?: CardOption[];
}) {
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
          {[...customs.filter((c) => c.layer === layer.id), ...KB_ENTRIES.filter((e) => e.layer === layer.id)].map(
            (e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ),
          )}
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
  customs,
}: {
  layer: NoteLayer;
  note?: MasterNote;
  /** Карточка по умолчанию для новой записи. */
  card?: string;
  onDone: () => void;
  onCancel: () => void;
  customs?: CardOption[];
}) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [text, setText] = useState(note?.text ?? "");
  const [cardId, setCardId] = useState(note?.card ?? card ?? "");
  const [kind, setKind] = useState<NoteKind>(note?.kind ?? "event");
  const [dueDay, setDueDay] = useState(note?.due_day ? String(note.due_day) : "");
  const [done, setDone] = useState(note?.done ?? false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function save() {
    setBusy(true);
    setError(null);
    const due = dueDay.trim() ? Number(dueDay) : null;
    const request = note
      ? updateNote(note.id, { title, text, card: cardId, kind, dueDay: due, done })
      : addNote(layer, title, text, cardId || null, kind, due);
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
      <CardSelect value={cardId} onChange={setCardId} customs={customs} />
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as NoteKind)}
          aria-label="Вид записи"
          className="rounded-md border border-edge bg-ink px-2 py-1.5 text-parchment"
        >
          {(Object.keys(NOTE_KIND_LABEL) as NoteKind[]).map((k) => (
            <option key={k} value={k}>
              {NOTE_KIND_LABEL[k]}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1">
          <span className="text-muted">день</span>
          <input
            type="number"
            min={1}
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            aria-label="День срабатывания"
            placeholder={kind === "timer" ? "обязательно" : "—"}
            className="w-24 rounded-md border border-edge bg-ink px-2 py-1.5 text-parchment"
          />
        </label>
        {note && (kind === "timer" || kind === "plan") && (
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={done} onChange={(e) => setDone(e.target.checked)} />
            <span>отработано</span>
          </label>
        )}
      </div>
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
  cardTitle = defaultTitle,
  today,
  customs,
}: {
  customs?: CardOption[];
  note: MasterNote;
  onChanged: () => void;
  onOpenCard?: (id: string) => void;
  cardTitle?: CardTitle;
  today?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cardName = note.card ? cardTitle(note.card) : null;
  const due = note.due_day !== null && !note.done && today !== undefined && note.due_day <= today;

  if (editing) {
    return (
      <li>
        <NoteForm
          layer={note.layer}
          note={note}
          customs={customs}
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
      {note.text && (
        <p className="mt-1 whitespace-pre-line text-sm leading-snug">
          <LinkedText text={note.text} onOpenCard={onOpenCard} cardTitle={cardTitle} />
        </p>
      )}
      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-muted">
        {note.kind !== "event" && (
          <span className={`rounded border px-1.5 py-0.5 ${due ? "border-fumble text-fumble" : "border-arcane/60 text-arcane"}`}>
            {NOTE_KIND_LABEL[note.kind]}
            {note.due_day !== null ? ` · День ${note.due_day}` : ""}
            {note.done ? " · отработано" : due ? " · срок наступил" : ""}
          </span>
        )}
        <span>{note.by_player ? "записали вы" : "записал мастер"}</span>
        {note.card &&
          cardName &&
          (onOpenCard ? (
            <button type="button" onClick={() => onOpenCard(note.card as string)} className="text-gold underline">
              {cardName}
            </button>
          ) : (
            <span className="text-gold">{cardName}</span>
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
  cardTitle,
  today,
  customs,
}: {
  customs?: CardOption[];
  notes: MasterNote[];
  layer?: NoteLayer;
  card?: string;
  emptyText?: string;
  onChanged: () => void;
  onOpenCard?: (id: string) => void;
  cardTitle?: CardTitle;
  today?: number;
}) {
  const [adding, setAdding] = useState(false);
  return (
    <div className="space-y-2">
      {layer &&
        (adding ? (
          <NoteForm
            layer={layer}
            card={card}
            customs={customs}
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
            <NoteItem
              key={n.id}
              note={n}
              onChanged={onChanged}
              onOpenCard={onOpenCard}
              cardTitle={cardTitle}
              today={today}
              customs={customs}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
