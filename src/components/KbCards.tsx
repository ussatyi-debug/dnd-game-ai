// Карточки базы, созданные по ходу игры: форма создания и правки.

import { useState } from "react";
import { KB_LAYERS, STATUS_LABEL, type KbEntry, type KbLayer, type KbStatus } from "../data/kb/index.ts";
import { createCard, errorText, updateCard, type CustomCard } from "../lib/engine";

const input =
  "w-full rounded-md border border-edge bg-ink px-3 py-1.5 text-sm text-parchment placeholder:text-muted/70 focus:border-gold focus:outline-none";

function isStatus(s: string | null | undefined): s is KbStatus {
  return !!s && s in STATUS_LABEL;
}

/** Карточка из движка в виде карточки базы. */
export function customEntry(c: CustomCard): KbEntry {
  return {
    id: c.id,
    layer: c.layer as KbLayer,
    section: c.section,
    group: "Создано по ходу игры",
    title: c.title,
    subtitle: c.subtitle || undefined,
    summary: c.summary,
    status: isStatus(c.status) ? c.status : undefined,
    facts: c.facts,
    source: `${c.by_player ? "создали вы" : "создал мастер"}, День ${c.day}`,
  };
}

export function CardForm({
  layer,
  section,
  card,
  onDone,
  onCancel,
}: {
  layer: KbLayer;
  section: string;
  card?: CustomCard;
  onDone: (id: string) => void;
  onCancel: () => void;
}) {
  const sections = KB_LAYERS.find((l) => l.id === layer)?.sections ?? [];
  const [sectionId, setSectionId] = useState(card?.section ?? section);
  const [title, setTitle] = useState(card?.title ?? "");
  const [subtitle, setSubtitle] = useState(card?.subtitle ?? "");
  const [summary, setSummary] = useState(card?.summary ?? "");
  const [facts, setFacts] = useState((card?.facts ?? []).map((f) => `${f.label}: ${f.value}`).join("\n"));
  const [status, setStatus] = useState(card?.status ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function save() {
    setBusy(true);
    setError(null);
    const draft = {
      layer,
      section: sectionId,
      title,
      subtitle,
      summary,
      status,
      facts: facts
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => {
          const i = l.indexOf(":");
          return i > 0 ? { label: l.slice(0, i).trim(), value: l.slice(i + 1).trim() } : { label: "Примечание", value: l };
        }),
    };
    const request = card ? updateCard(card.id, draft).then(() => card.id) : createCard(draft);
    request
      .then(onDone)
      .catch((e: unknown) => setError(errorText(e)))
      .finally(() => setBusy(false));
  }

  return (
    <div className="space-y-2 rounded-lg border border-gold/50 p-3 text-sm">
      <select value={sectionId} onChange={(e) => setSectionId(e.target.value)} aria-label="Раздел" className={input}>
        {sections.map((s) => (
          <option key={s.id} value={s.id}>
            {s.title}
          </option>
        ))}
      </select>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название" aria-label="Название карточки" className={input} />
      <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Подзаголовок (роль, место)" aria-label="Подзаголовок" className={input} />
      <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} placeholder="Кратко" aria-label="Описание" className={input} />
      <textarea
        value={facts}
        onChange={(e) => setFacts(e.target.value)}
        rows={3}
        placeholder={"Поле: значение\nГде: казематы Шпиля"}
        aria-label="Факты"
        className={`${input} font-mono text-xs`}
      />
      <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Статус" className={input}>
        <option value="">Без статуса</option>
        {(Object.keys(STATUS_LABEL) as KbStatus[]).map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-fumble">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-md px-3 py-1.5 text-muted hover:text-parchment">
          Отмена
        </button>
        <button
          type="button"
          disabled={busy || !title.trim()}
          onClick={save}
          className="rounded-md bg-gold px-3 py-1.5 text-ink disabled:opacity-40"
        >
          {card ? "Сохранить" : "Создать"}
        </button>
      </div>
    </div>
  );
}
