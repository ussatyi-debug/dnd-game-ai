export type LogTone = "normal" | "crit" | "fumble" | "error" | "info";

export interface LogEntry {
  id: number;
  time: string;
  title: string;
  detail: string;
  tone: LogTone;
}

export const toneClass: Record<LogTone, string> = {
  normal: "border-edge",
  crit: "border-crit bg-crit/10",
  fumble: "border-fumble bg-fumble/10",
  error: "border-fumble/60 text-fumble",
  info: "border-gold/40 text-muted",
};

interface RollLogProps {
  entries: LogEntry[];
  onClear: () => void;
}

export default function RollLog({ entries, onClear }: RollLogProps) {
  return (
    <section className="flex min-h-0 flex-col rounded-xl border border-edge bg-panel">
      <header className="flex items-center justify-between border-b border-edge px-4 py-3">
        <h2 className="font-serif text-lg text-gold">Лог бросков</h2>
        <button
          type="button"
          onClick={onClear}
          disabled={entries.length === 0}
          className="rounded-md px-2 py-1 text-sm text-muted hover:text-parchment disabled:opacity-40"
        >
          Очистить
        </button>
      </header>
      <ol className="flex-1 space-y-2 overflow-y-auto p-3" aria-live="polite">
        {entries.length === 0 ? (
          <li className="p-4 text-center text-sm text-muted">Бросков пока не было</li>
        ) : (
          entries.map((e) => (
            <li key={e.id} className={`rounded-lg border-l-4 px-3 py-2 ${toneClass[e.tone]}`}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium">{e.title}</span>
                <time className="shrink-0 text-xs text-muted">{e.time}</time>
              </div>
              <p className="mt-1 font-mono text-sm break-words">{e.detail}</p>
            </li>
          ))
        )}
      </ol>
    </section>
  );
}
