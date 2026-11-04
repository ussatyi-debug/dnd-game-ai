import { useEffect, useRef, type FormEvent, type ReactNode } from "react";
import type { ModelInfo } from "../lib/engine";

export interface ChatMessage {
  id: number;
  author: "player" | "master" | "system";
  text: string;
  time: string;
  /** Модель, давшая ответ мастера. */
  model?: string;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  draft: string;
  thinking: boolean;
  aiAvailable: boolean;
  model: string | null;
  models: ModelInfo[];
  onDraftChange: (text: string) => void;
  onSend: (text: string) => void;
  onModelChange: (model: string) => void;
  onOpenModels: () => void;
  onOpenDice: () => void;
}

/** Текст мастера: строки «> — ...» — прямая речь (формат из кодекса кампании). */
function MasterText({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  text.split("\n").forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith(">")) {
      blocks.push(
        <p key={i} className="border-l-2 border-gold/70 pl-3 text-parchment italic">
          {trimmed.replace(/^>\s?/, "")}
        </p>,
      );
    } else if (trimmed === "") {
      blocks.push(<div key={i} className="h-2" />);
    } else {
      blocks.push(
        <p key={i} className="whitespace-pre-wrap">
          {line.replace(/\*\*(.+?)\*\*/g, "$1")}
        </p>,
      );
    }
  });
  return <div className="space-y-1 leading-relaxed">{blocks}</div>;
}

export default function ChatPanel({
  messages,
  draft,
  thinking,
  aiAvailable,
  model,
  models,
  onDraftChange,
  onSend,
  onModelChange,
  onOpenModels,
  onOpenDice,
}: ChatPanelProps) {
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, thinking]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (text && !thinking) onSend(text);
  }

  // Быстрое переключение модели прямо в диалоге — без перезапуска и потери контекста.
  const options: { id: string; name: string }[] =
    models.some((m) => m.id === model) || !model ? models : [{ id: model, name: model }, ...models];

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-edge bg-panel">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-edge px-4 py-2">
        <h2 className="font-serif text-lg text-gold">Диалог</h2>
        <div className="flex items-center gap-2">
          {aiAvailable && options.length > 0 ? (
            <select
              value={model ?? ""}
              onChange={(e) => onModelChange(e.target.value)}
              aria-label="Модель мастера"
              className="max-w-48 rounded-md border border-edge bg-ink px-2 py-1 text-xs text-muted"
            >
              {!model && <option value="">Модель не выбрана</option>}
              {options.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          ) : (
            <button
              type="button"
              onClick={onOpenModels}
              className="rounded-md border border-edge px-2 py-1 text-xs text-muted hover:border-gold"
            >
              {aiAvailable ? "Выбрать модель" : "Мастер — в приложении"}
            </button>
          )}
        </div>
      </header>

      <ol ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m) => (
          <li
            key={m.id}
            className={
              m.author === "player" ? "flex justify-end" : m.author === "master" ? "flex" : "flex justify-center"
            }
          >
            {m.author === "player" && (
              <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-blood/70 px-3 py-2">
                <p className="whitespace-pre-wrap break-words">{m.text}</p>
                <time className="mt-0.5 block text-right text-[10px] text-parchment/60">{m.time}</time>
              </div>
            )}
            {m.author === "master" && (
              <div className="max-w-[92%] rounded-2xl rounded-bl-sm border border-edge bg-ink px-4 py-3">
                <MasterText text={m.text} />
                <div className="mt-1 flex justify-between gap-2 text-[10px] text-muted">
                  <span>{m.model ?? "Мастер"}</span>
                  <time>{m.time}</time>
                </div>
              </div>
            )}
            {m.author === "system" && (
              <p className="max-w-[90%] rounded-lg border border-edge px-3 py-2 text-center text-sm text-muted">
                {m.text}
              </p>
            )}
          </li>
        ))}
        {thinking && (
          <li className="flex">
            <p className="rounded-2xl border border-edge px-4 py-2 text-sm text-muted">Мастер пишет…</p>
          </li>
        )}
      </ol>

      <form onSubmit={submit} className="flex items-end gap-2 border-t border-edge p-2">
        <button
          type="button"
          onClick={onOpenDice}
          className="rounded-md border border-gold/60 px-3 py-2.5 text-gold hover:bg-gold/10"
          aria-label="Открыть кубы"
          title="Кубы"
        >
          🎲
        </button>
        <textarea
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              const text = draft.trim();
              if (text && !thinking) onSend(text);
            }
          }}
          rows={2}
          placeholder="Заявка мастеру…"
          aria-label="Сообщение мастеру"
          className="min-h-11 flex-1 resize-none rounded-md border border-edge bg-ink px-3 py-2 text-parchment placeholder:text-muted/70 focus:border-gold focus:outline-none"
        />
        <button
          type="submit"
          disabled={draft.trim() === "" || thinking}
          className="rounded-md bg-blood px-4 py-2.5 font-medium text-parchment hover:bg-blood/80 disabled:opacity-40"
        >
          Отправить
        </button>
      </form>
    </section>
  );
}
