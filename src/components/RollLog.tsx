import { rollCopyText, rollDetail, rollTitle, rollTone, type RollTone, type TrayRoll } from "../lib/rolls";
import CopyButton from "./CopyButton";

const toneClass: Record<RollTone, string> = {
  normal: "border-edge",
  crit: "border-crit bg-crit/10",
  fumble: "border-fumble bg-fumble/10",
};

interface RollLogProps {
  rolls: TrayRoll[];
  onClear: () => void;
  onSendToChat: (text: string) => void;
}

export default function RollLog({ rolls, onClear, onSendToChat }: RollLogProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-edge bg-panel">
      <header className="flex items-center justify-between border-b border-edge px-4 py-2.5">
        <h2 className="font-serif text-lg text-gold">Лог бросков</h2>
        <button
          type="button"
          onClick={onClear}
          disabled={rolls.length === 0}
          className="rounded-md px-2 py-1 text-sm text-muted hover:text-parchment disabled:opacity-40"
        >
          Очистить
        </button>
      </header>
      <ol className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3" aria-live="polite">
        {rolls.length === 0 ? (
          <li className="p-4 text-center text-sm text-muted">Бросков пока не было</li>
        ) : (
          rolls.map((roll) => (
            <li key={roll.id} className={`rounded-lg border-l-4 px-3 py-2 ${toneClass[rollTone(roll)]}`}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium">{rollTitle(roll)}</span>
                <time className="shrink-0 text-xs text-muted">{roll.time}</time>
              </div>
              {roll.master ? (
                <p className="mt-0.5 font-mono text-sm break-words">
                  {roll.master.line.slice(roll.master.line.indexOf(": ") + 2)}
                </p>
              ) : (
                <p className="mt-0.5 font-mono text-lg break-words">{rollDetail(roll)}</p>
              )}
              {!roll.master && (
                <div className="mt-1.5 flex gap-2">
                  <CopyButton text={rollCopyText(roll)} />
                  <button
                    type="button"
                    onClick={() => onSendToChat(rollCopyText(roll))}
                    className="rounded-md border border-edge px-2 py-1 text-xs text-muted hover:border-gold hover:text-parchment"
                  >
                    В чат
                  </button>
                </div>
              )}
            </li>
          ))
        )}
      </ol>
    </section>
  );
}
