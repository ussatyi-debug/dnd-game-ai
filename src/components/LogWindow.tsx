// Окно «Логирование»: журнал разбора ошибок мастера и движка.

import { useEffect, useMemo, useState } from "react";
import { devLog, LOG_KIND_LABEL, type LogEntry, type LogKind } from "../lib/devlog";
import CopyButton from "./CopyButton";
import Modal from "./Modal";

const KIND_CLASS: Record<LogKind, string> = {
  master: "border-edge",
  engine: "border-arcane/60",
  refusal: "border-fumble",
  roll: "border-gold/60",
  warning: "border-crit",
  error: "border-fumble",
};

function time(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString("ru-RU")} ${d.toLocaleTimeString("ru-RU")}`;
}

export default function LogWindow({ onClose }: { onClose: () => void }) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [kind, setKind] = useState<LogKind | "">("");
  const [problems, setProblems] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  useEffect(() => devLog.subscribe(setEntries), []);

  const shown = useMemo(
    () =>
      entries
        .filter((e) => (!kind || e.kind === kind) && (!problems || e.kind === "refusal" || e.kind === "warning" || e.kind === "error"))
        .slice()
        .reverse(),
    [entries, kind, problems],
  );

  return (
    <Modal title="Логирование" onClose={onClose} size="lg">
      <div className="flex flex-wrap items-center gap-2 border-b border-edge p-3 text-sm">
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as LogKind | "")}
          className="rounded-md border border-edge bg-ink px-2 py-1.5"
          aria-label="Тип записей"
        >
          <option value="">Все записи</option>
          {Object.entries(LOG_KIND_LABEL).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={problems} onChange={(e) => setProblems(e.target.checked)} className="h-4 w-4 accent-[var(--color-gold)]" />
          только проблемы
        </label>
        <span className="ml-auto flex items-center gap-2">
          <CopyButton text={devLog.text(shown.slice().reverse())} label="📋 Копировать" />
          <button
            type="button"
            onClick={() => devLog.clear()}
            disabled={entries.length === 0}
            className="rounded-md border border-edge px-2 py-1 text-xs text-muted hover:border-fumble disabled:opacity-40"
          >
            Очистить
          </button>
        </span>
      </div>
      <p className="px-3 pt-2 text-xs text-muted">
        Ответы мастера как есть, команды движка и отказы, броски (включая тайные), сбои связи. Скопируйте нужные записи
        и пришлите их для разбора.
      </p>
      <ol className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {shown.length === 0 ? (
          <li className="p-4 text-center text-sm text-muted">Записей нет</li>
        ) : (
          shown.map((e) => (
            <li key={e.id} className={`rounded-lg border-l-4 bg-ink/40 px-3 py-2 text-sm ${KIND_CLASS[e.kind]}`}>
              <button type="button" onClick={() => setOpen(open === e.id ? null : e.id)} className="w-full text-left">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium">
                    <span className="text-xs text-muted">{LOG_KIND_LABEL[e.kind]} · </span>
                    {e.title}
                  </span>
                  <time className="shrink-0 text-[11px] text-muted">{time(e.at)}</time>
                </div>
              </button>
              {open === e.id && e.detail && (
                <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap break-words rounded bg-ink p-2 font-mono text-xs">
                  {e.detail}
                </pre>
              )}
            </li>
          ))
        )}
      </ol>
    </Modal>
  );
}
