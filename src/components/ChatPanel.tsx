import { useEffect, useRef, type FormEvent } from "react";

export interface ChatMessage {
  id: number;
  author: "player" | "system";
  text: string;
  time: string;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  draft: string;
  onDraftChange: (text: string) => void;
  onSend: (text: string) => void;
}

export default function ChatPanel({ messages, draft, onDraftChange, onSend }: ChatPanelProps) {
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (text) onSend(text);
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-xl border border-edge bg-panel">
      <header className="border-b border-edge px-4 py-2.5">
        <h2 className="font-serif text-lg text-gold">Мастер</h2>
      </header>
      <ol ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m) => (
          <li key={m.id} className={m.author === "player" ? "flex justify-end" : "flex justify-center"}>
            {m.author === "player" ? (
              <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-blood/70 px-3 py-2">
                <p className="whitespace-pre-wrap break-words">{m.text}</p>
                <time className="mt-0.5 block text-right text-[10px] text-parchment/60">{m.time}</time>
              </div>
            ) : (
              <p className="max-w-[90%] rounded-lg border border-edge px-3 py-2 text-center text-sm text-muted">
                {m.text}
              </p>
            )}
          </li>
        ))}
      </ol>
      <form onSubmit={submit} className="flex gap-2 border-t border-edge p-2">
        <textarea
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              const text = draft.trim();
              if (text) onSend(text);
            }
          }}
          rows={2}
          placeholder="Заявка мастеру…"
          aria-label="Сообщение мастеру"
          className="min-h-11 flex-1 resize-none rounded-md border border-edge bg-ink px-3 py-2 text-parchment placeholder:text-muted/70 focus:border-gold focus:outline-none"
        />
        <button
          type="submit"
          disabled={draft.trim() === ""}
          className="self-end rounded-md bg-blood px-4 py-2.5 font-medium text-parchment hover:bg-blood/80 disabled:opacity-40"
        >
          Отправить
        </button>
      </form>
    </section>
  );
}
