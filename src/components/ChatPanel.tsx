import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { stripEngineBlocks } from "../lib/engine";

export interface ChatMessage {
  id: number;
  /** `engine` — итог действия движка (заклинание, ячейка): в историю мастера не идёт,
   *  мастер видит его в журнале движка. */
  author: "player" | "master" | "system" | "engine";
  text: string;
  time: string;
  /** Модель, давшая ответ мастера. */
  model?: string;
}

export type MasterMode = "provider" | "claude" | "none";

interface ChatPanelProps {
  messages: ChatMessage[];
  draft: string;
  thinking: boolean;
  masterMode: MasterMode;
  model: string | null;
  modelOptions: { id: string; name: string }[];
  onDraftChange: (text: string) => void;
  onSend: (text: string) => void;
  onStop: () => void;
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
  masterMode,
  model,
  modelOptions,
  onDraftChange,
  onSend,
  onStop,
  onModelChange,
  onOpenModels,
  onOpenDice,
}: ChatPanelProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const [showJump, setShowJump] = useState(false);
  const lastId = messages.at(-1)?.id;
  const lastAuthor = messages.at(-1)?.author;
  const seenLast = useRef<number | undefined>(undefined);

  /** Элемент последнего сообщения в ленте. */
  const lastElement = useCallback((): HTMLElement | null => {
    const list = listRef.current;
    if (!list || lastId === undefined) return null;
    return list.querySelector<HTMLElement>(`[data-message-id="${lastId}"]`);
  }, [lastId]);

  /** Кнопка «к последнему сообщению» — если его начало дальше полутора экранов. */
  const updateJump = useCallback(() => {
    const list = listRef.current;
    const last = lastElement();
    if (!list || !last) {
      setShowJump(false);
      return;
    }
    const distance = last.offsetTop - list.scrollTop;
    setShowJump(Math.abs(distance) > list.clientHeight * 1.5);
  }, [lastElement]);

  const jumpToLast = useCallback(() => {
    const list = listRef.current;
    const last = lastElement();
    if (list && last) list.scrollTo({ top: Math.max(0, last.offsetTop - 8), behavior: "smooth" });
  }, [lastElement]);

  // Лента не прилипает к концу ответа: она прокручивается один раз — когда игрок
  // отправил заявку (к его сообщению) и когда начался ответ мастера (к началу ответа),
  // и только если игрок в этот момент не читает старые сообщения выше.
  useEffect(() => {
    const list = listRef.current;
    if (!list || lastId === undefined || seenLast.current === lastId) {
      updateJump();
      return;
    }
    const firstRender = seenLast.current === undefined;
    seenLast.current = lastId;
    const last = lastElement();
    const nearBottom = list.scrollHeight - list.scrollTop - list.clientHeight < list.clientHeight;
    if (firstRender || lastAuthor === "player") {
      list.scrollTop = list.scrollHeight;
    } else if (last && nearBottom) {
      list.scrollTo({ top: Math.max(0, last.offsetTop - 8), behavior: "smooth" });
    }
    updateJump();
  }, [lastId, lastAuthor, messages, lastElement, updateJump]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (text && !thinking) onSend(text);
  }

  // Быстрое переключение модели прямо в диалоге — без перезапуска и потери контекста.
  const options =
    modelOptions.some((m) => m.id === model) || !model
      ? modelOptions
      : [{ id: model, name: model }, ...modelOptions];

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-edge bg-panel">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-edge px-4 py-2">
        <h2 className="font-serif text-lg text-gold">Диалог</h2>
        <div className="flex items-center gap-2">
          {masterMode !== "none" && options.length > 0 ? (
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
              {masterMode === "provider" ? "Выбрать модель" : "Мастер недоступен"}
            </button>
          )}
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col">
      <ol ref={listRef} onScroll={updateJump} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m) => (
          <li
            key={m.id}
            data-message-id={m.id}
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
                <MasterText text={stripEngineBlocks(m.text)} />
                <div className="mt-1 flex justify-between gap-2 text-[10px] text-muted">
                  <span>{m.model ?? "Мастер"}</span>
                  <time>{m.time}</time>
                </div>
              </div>
            )}
            {m.author === "engine" && (
              <p
                className={`max-w-[90%] rounded-lg border px-3 py-1.5 text-sm ${
                  m.text.startsWith("Отказ") ? "border-fumble/60 text-fumble" : "border-arcane/50 text-arcane"
                }`}
              >
                ⚙ {m.text}
              </p>
            )}
            {m.author === "system" && (
              <p className="max-w-[90%] rounded-lg border border-edge px-3 py-2 text-center text-sm text-muted">
                {m.text}
              </p>
            )}
          </li>
        ))}
        {thinking && (
          <li className="flex items-center gap-2">
            <p className="rounded-2xl border border-edge px-4 py-2 text-sm text-muted">Мастер пишет…</p>
            <button
              type="button"
              onClick={onStop}
              className="rounded-md border border-edge px-2 py-1 text-xs text-muted hover:border-fumble hover:text-fumble"
            >
              Стоп
            </button>
          </li>
        )}
      </ol>
      {showJump && (
        <button
          type="button"
          onClick={jumpToLast}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-gold/70 bg-panel px-4 py-2 text-sm text-gold shadow-lg hover:bg-gold/10"
        >
          ↓ К последнему сообщению
        </button>
      )}
      </div>

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
            // Enter — новая строка. Отправка — кнопкой или Ctrl+Enter на ПК.
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              const text = draft.trim();
              if (text && !thinking) onSend(text);
            }
          }}
          rows={2}
          placeholder="Заявка мастеру… (Enter — новая строка)"
          aria-label="Сообщение мастеру"
          className="max-h-40 min-h-11 flex-1 resize-none rounded-md border border-edge bg-ink px-3 py-2 text-parchment [field-sizing:content] placeholder:text-muted/70 focus:border-gold focus:outline-none"
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
