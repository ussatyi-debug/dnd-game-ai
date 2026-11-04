import { useCallback, useEffect, useRef, useState } from "react";
import CharacterSheetPanel from "./components/CharacterSheetPanel";
import ChatPanel, { type ChatMessage } from "./components/ChatPanel";
import DiceTray from "./components/DiceTray";
import RollLog from "./components/RollLog";
import {
  characterSheet,
  errorText,
  isEngineAvailable,
  isWebBuild,
  LUCKY_ID,
  takeRest,
  type CharacterSheet,
  type ResourcePool,
  type RestKind,
} from "./lib/engine";
import type { RollResult, TrayRoll } from "./lib/rolls";

const MAX_ROLLS = 200;

type Tab = "chat" | "sheet" | "dice" | "log";

const TABS: { id: Tab; label: string }[] = [
  { id: "chat", label: "Чат" },
  { id: "sheet", label: "Лист" },
  { id: "dice", label: "Кубы" },
  { id: "log", label: "Лог" },
];

const now = () => new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

const WELCOME =
  "ИИ-мастер подключается на следующем этапе. Пока здесь можно писать заявки и вставлять " +
  "результаты бросков кнопкой «В чат» — модификаторы к ним прибавит мастер.";

export default function App() {
  const engineAvailable = isEngineAvailable();
  const [tab, setTab] = useState<Tab>("dice");
  const [sheet, setSheet] = useState<CharacterSheet | null>(null);
  const [rolls, setRolls] = useState<TrayRoll[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, author: "system", text: WELCOME, time: now() },
  ]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const nextId = useRef(1);

  const addSystemMessage = useCallback((text: string) => {
    setMessages((prev) => [...prev, { id: nextId.current++, author: "system", text, time: now() }]);
  }, []);

  useEffect(() => {
    if (!engineAvailable) return;
    characterSheet()
      .then(setSheet)
      .catch((e: unknown) => addSystemMessage(`Не удалось загрузить лист: ${errorText(e)}`));
  }, [engineAvailable, addSystemMessage]);

  const lucky = sheet?.resources.find((r) => r.id === LUCKY_ID) ?? null;

  function addRoll(roll: RollResult) {
    setRolls((prev) => [{ ...roll, id: nextId.current++, time: now() }, ...prev].slice(0, MAX_ROLLS));
  }

  function updateResource(pool: ResourcePool) {
    setSheet((prev) =>
      prev ? { ...prev, resources: prev.resources.map((r) => (r.id === pool.id ? pool : r)) } : prev,
    );
  }

  function sendToChat(text: string) {
    setDraft((prev) => (prev.trim() ? `${prev.trimEnd()} ${text}` : text));
    setTab("chat");
  }

  function send(text: string) {
    setMessages((prev) => [...prev, { id: nextId.current++, author: "player", text, time: now() }]);
    setDraft("");
  }

  function rest(kind: RestKind) {
    setBusy(true);
    takeRest(kind)
      .then((result) => {
        setSheet(result.sheet);
        const name = kind === "long" ? "Длительный отдых" : "Короткий отдых";
        addSystemMessage(
          result.restored.length > 0
            ? `${name}: восстановлено — ${result.restored.join(", ")}.`
            : `${name}: восстанавливать нечего.`,
        );
      })
      .catch((e: unknown) => addSystemMessage(`Отдых не удался: ${errorText(e)}`))
      .finally(() => setBusy(false));
  }

  const panel = (id: Tab) => (tab === id ? "flex" : "hidden");

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-baseline justify-between gap-2 border-b border-edge px-4 py-2">
        <h1 className="font-serif text-lg text-parchment">DnD Game AI</h1>
        <span className="text-xs text-muted">
          v{__APP_VERSION__}
          {isWebBuild ? " · веб-версия" : ""}
        </span>
      </header>

      {!engineAvailable && (
        <p role="alert" className="border-b border-gold/40 bg-gold/10 px-4 py-2 text-sm">
          Движок работает внутри приложения: запустите <code className="font-mono">npm run tauri dev</code>{" "}
          или веб-сборку <code className="font-mono">npm run build:web</code>.
        </p>
      )}

      <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 p-3 lg:grid-cols-[19rem_minmax(0,1fr)_26rem]">
        <div className={`${panel("sheet")} min-h-0 flex-col lg:flex`}>
          <CharacterSheetPanel sheet={sheet} busy={busy || !engineAvailable} onRest={rest} />
        </div>

        <div className={`${panel("chat")} min-h-0 flex-col lg:flex`}>
          <ChatPanel messages={messages} draft={draft} onDraftChange={setDraft} onSend={send} />
        </div>

        <div className={`${tab === "dice" || tab === "log" ? "flex" : "hidden"} min-h-0 flex-col gap-3 lg:flex`}>
          <div className={`${tab === "dice" ? "flex" : "hidden"} min-h-0 flex-1 flex-col lg:flex lg:flex-none lg:basis-[26rem]`}>
            <DiceTray
              enabled={engineAvailable}
              lucky={lucky}
              onRoll={addRoll}
              onLuckyChange={updateResource}
              onSendToChat={sendToChat}
            />
          </div>
          <div className={`${tab === "log" ? "flex" : "hidden"} min-h-0 flex-1 flex-col lg:flex`}>
            <RollLog rolls={rolls} onClear={() => setRolls([])} onSendToChat={sendToChat} />
          </div>
        </div>
      </main>

      <nav className="grid grid-cols-4 border-t border-edge bg-panel lg:hidden" aria-label="Разделы">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? "page" : undefined}
            className={`py-3 text-sm ${tab === t.id ? "text-gold" : "text-muted"}`}
          >
            {t.label}
            {t.id === "log" && rolls.length > 0 && (
              <span className="ml-1 text-xs text-muted">{Math.min(rolls.length, 99)}</span>
            )}
            {t.id === "sheet" && lucky && (
              <span className="ml-1 text-xs text-muted">
                ◆{lucky.current}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
