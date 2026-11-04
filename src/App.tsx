import { useCallback, useEffect, useRef, useState } from "react";
import AiSettingsWindow from "./components/AiSettingsWindow";
import CharacterSheetPanel from "./components/CharacterSheetPanel";
import ChatPanel, { type ChatMessage } from "./components/ChatPanel";
import DiceDrawer from "./components/DiceDrawer";
import KnowledgeBase from "./components/KnowledgeBase";
import MainMenu, { type MenuAction } from "./components/MainMenu";
import PartyPanel from "./components/PartyPanel";
import SaveWindow from "./components/SaveWindow";
import TreasuryWindow from "./components/TreasuryWindow";
import {
  aiChat,
  aiListModels,
  aiSelectModel,
  aiSettings,
  characterSheet,
  errorText,
  isAiAvailable,
  isEngineAvailable,
  isWebBuild,
  LUCKY_ID,
  partyView,
  takeRest,
  type AiSettingsView,
  type CharacterSheet,
  type ModelInfo,
  type PartyView,
  type ResourcePool,
  type RestKind,
} from "./lib/engine";
import type { RollResult, TrayRoll } from "./lib/rolls";

const MAX_ROLLS = 200;
const PLAYER_ID = "pc.nikis";

type Tab = "party" | "dialog" | "character";
type Overlay = "knowledge" | "save" | "models" | "treasury" | null;

const TABS: { id: Tab; label: string }[] = [
  { id: "party", label: "Отряд" },
  { id: "dialog", label: "Диалог" },
  { id: "character", label: "Персонаж" },
];

const now = () => new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

const WELCOME_APP =
  "Мастер готов. Выберите модель в меню «Модели ИИ», опишите, что делает сэр Никис. " +
  "Броски — кнопкой 🎲 или своими кубами: присылайте только значение на кубе, модификаторы прибавит мастер.";
const WELCOME_WEB =
  "Веб-версия: отряд, казна, кубы и база знаний работают, а ИИ-мастер — только в приложении для ПК.";

export default function App() {
  const engineAvailable = isEngineAvailable();
  const aiAvailable = isAiAvailable();
  const [tab, setTab] = useState<Tab>("dialog");
  const [openWindow, setOpenWindow] = useState<Overlay>(null);
  const [diceOpen, setDiceOpen] = useState(false);

  const [party, setParty] = useState<PartyView | null>(null);
  const [activeId, setActiveId] = useState(PLAYER_ID);
  const [sheet, setSheet] = useState<CharacterSheet | null>(null);
  const [playerSheet, setPlayerSheet] = useState<CharacterSheet | null>(null);
  const [rolls, setRolls] = useState<TrayRoll[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, author: "system", text: aiAvailable ? WELCOME_APP : WELCOME_WEB, time: now() },
  ]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [ai, setAi] = useState<AiSettingsView | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const nextId = useRef(1);

  const addMessage = useCallback((author: ChatMessage["author"], text: string, model?: string) => {
    const message: ChatMessage = { id: nextId.current++, author, text, time: now(), model };
    setMessages((prev) => [...prev, message]);
    return message;
  }, []);

  const refresh = useCallback(async () => {
    const [nextParty, nextPlayer] = await Promise.all([partyView(), characterSheet(PLAYER_ID)]);
    setParty(nextParty);
    setPlayerSheet(nextPlayer);
  }, []);

  useEffect(() => {
    if (!engineAvailable) return;
    refresh().catch((e: unknown) => addMessage("system", `Не удалось загрузить отряд: ${errorText(e)}`));
  }, [engineAvailable, refresh, addMessage]);

  useEffect(() => {
    if (!engineAvailable) return;
    characterSheet(activeId)
      .then(setSheet)
      .catch((e: unknown) => addMessage("system", `Не удалось загрузить лист: ${errorText(e)}`));
  }, [engineAvailable, activeId, party, addMessage]);

  useEffect(() => {
    if (!aiAvailable) return;
    aiSettings()
      .then((settings) => {
        setAi(settings);
        if (settings.has_key) return aiListModels(settings.provider).then(setModels);
        return undefined;
      })
      .catch((e: unknown) => addMessage("system", `ИИ: ${errorText(e)}`));
  }, [aiAvailable, addMessage]);

  const lucky = playerSheet?.resources.find((r) => r.id === LUCKY_ID) ?? null;

  function addRoll(roll: RollResult) {
    setRolls((prev) => [{ ...roll, id: nextId.current++, time: now() }, ...prev].slice(0, MAX_ROLLS));
  }

  function updateLucky(pool: ResourcePool) {
    const patch = (s: CharacterSheet | null) =>
      s && s.id === PLAYER_ID
        ? { ...s, resources: s.resources.map((r) => (r.id === pool.id ? pool : r)) }
        : s;
    setPlayerSheet(patch);
    setSheet(patch);
    partyView().then(setParty).catch(() => undefined);
  }

  function sendToChat(text: string) {
    setDraft((prev) => (prev.trim() ? `${prev.trimEnd()} ${text}` : text));
    setDiceOpen(false);
    setTab("dialog");
  }

  function send(text: string) {
    const playerMessage = addMessage("player", text);
    setDraft("");
    if (!aiAvailable) return;
    if (!ai?.model) {
      addMessage("system", "Выберите модель мастера в меню «Модели ИИ».");
      return;
    }
    const history = [...messages, playerMessage]
      .filter((m) => m.author !== "system")
      .map((m) => ({ role: m.author === "player" ? ("player" as const) : ("master" as const), text: m.text }));
    setThinking(true);
    aiChat(history)
      .then((reply) => addMessage("master", reply.text, reply.model))
      .catch((e: unknown) => addMessage("system", errorText(e)))
      .finally(() => setThinking(false));
  }

  function changeModel(model: string) {
    if (!ai || !model) return;
    aiSelectModel(ai.provider, model)
      .then((next) => {
        setAi(next);
        addMessage("system", `Мастера ведёт модель ${model}. Контекст сцены сохранён.`);
      })
      .catch((e: unknown) => addMessage("system", errorText(e)));
  }

  function rest(kind: RestKind) {
    setBusy(true);
    takeRest(kind)
      .then(async (result) => {
        await refresh();
        const restored = result.characters.filter((c) => c.restored.length > 0);
        const name = kind === "long" ? "Длительный отдых" : "Короткий отдых";
        addMessage(
          "system",
          restored.length > 0
            ? `${name}: ${restored.map((c) => `${c.name} — ${c.restored.join(", ")}`).join("; ")}.`
            : `${name}: восстанавливать нечего.`,
        );
      })
      .catch((e: unknown) => addMessage("system", `Отдых не удался: ${errorText(e)}`))
      .finally(() => setBusy(false));
  }

  function menu(action: MenuAction) {
    setOpenWindow(action);
  }

  const shown = (id: Tab) => (tab === id ? "flex" : "hidden");

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center justify-between gap-2 border-b border-edge px-3 py-2">
        <div className="flex items-center gap-3">
          <MainMenu onAction={menu} />
          <h1 className="font-serif text-lg text-parchment">DnD Game AI</h1>
        </div>
        <span className="text-xs text-muted">
          v{__APP_VERSION__}
          {isWebBuild ? " · веб" : ""}
        </span>
      </header>

      {!engineAvailable && (
        <p role="alert" className="border-b border-gold/40 bg-gold/10 px-4 py-2 text-sm">
          Движок работает внутри приложения: запустите <code className="font-mono">npm run tauri dev</code> или
          веб-сборку <code className="font-mono">npm run build:web</code>.
        </p>
      )}

      <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 p-3 lg:grid-cols-[20rem_minmax(0,1fr)_22rem]">
        <div className={`${shown("party")} min-h-0 flex-col lg:flex`}>
          <PartyPanel
            party={party}
            activeId={activeId}
            onSelect={(id) => {
              setActiveId(id);
              setTab("character");
            }}
            onOpenTreasury={() => setOpenWindow("treasury")}
          />
        </div>

        <div className={`${shown("dialog")} min-h-0 flex-col lg:flex`}>
          <ChatPanel
            messages={messages}
            draft={draft}
            thinking={thinking}
            aiAvailable={aiAvailable}
            model={ai?.model ?? null}
            models={models}
            onDraftChange={setDraft}
            onSend={send}
            onModelChange={changeModel}
            onOpenModels={() => setOpenWindow("models")}
            onOpenDice={() => setDiceOpen(true)}
          />
        </div>

        <div className={`${shown("character")} min-h-0 flex-col lg:flex`}>
          <CharacterSheetPanel sheet={sheet} busy={busy || !engineAvailable} onRest={rest} />
        </div>
      </main>

      <nav className="grid grid-cols-[1fr_1fr_1fr_auto] border-t border-edge bg-panel lg:hidden" aria-label="Окна">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? "page" : undefined}
            className={`py-3 text-sm ${tab === t.id ? "text-gold" : "text-muted"}`}
          >
            {t.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setDiceOpen(true)}
          className="border-l border-edge px-4 text-lg text-gold"
          aria-label="Открыть кубы"
        >
          🎲
        </button>
      </nav>

      <DiceDrawer
        open={diceOpen}
        onClose={() => setDiceOpen(false)}
        enabled={engineAvailable}
        lucky={lucky}
        rolls={rolls}
        onRoll={addRoll}
        onLuckyChange={updateLucky}
        onClearLog={() => setRolls([])}
        onSendToChat={sendToChat}
      />

      {openWindow === "knowledge" && <KnowledgeBase onClose={() => setOpenWindow(null)} />}
      {openWindow === "save" && <SaveWindow onClose={() => setOpenWindow(null)} messages={messages} rolls={rolls} />}
      {openWindow === "treasury" && (
        <TreasuryWindow
          onClose={() => setOpenWindow(null)}
          onChanged={() => {
            partyView().then(setParty).catch(() => undefined);
          }}
        />
      )}
      {openWindow === "models" && (
        <AiSettingsWindow
          onClose={() => setOpenWindow(null)}
          models={models}
          onModelsLoaded={setModels}
          onSettingsChange={setAi}
        />
      )}
    </div>
  );
}
