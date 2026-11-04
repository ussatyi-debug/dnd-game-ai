import { useCallback, useEffect, useRef, useState } from "react";
import AiSettingsWindow from "./components/AiSettingsWindow";
import CharacterSheetPanel from "./components/CharacterSheetPanel";
import ChatPanel, { type ChatMessage, type MasterMode } from "./components/ChatPanel";
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
  characterDetails,
  characterSheet,
  inventory as loadInventory,
  masterUndoInfo,
  undoMasterTurn,
  errorText,
  isAiAvailable,
  isEngineAvailable,
  isWebBuild,
  LUCKY_ID,
  masterApply,
  masterContext,
  partyView,
  spellbook,
  takeRest,
  type InventoryView,
  type MasterAction,
  type SheetDetails,
  type UndoInfo,
  type SpellbookView,
  type AiSettingsView,
  type CharacterSheet,
  type ModelInfo,
  type PartyView,
  type ResourcePool,
  type RestKind,
} from "./lib/engine";
import {
  CLAUDE_TIERS,
  claudeMasterReply,
  getSample,
  sampleErrorText,
  type ClaudeTier,
} from "./lib/claude";
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

const ROLL_HINT =
  "Броски — кнопкой 🎲 или своими кубами: присылайте только значение на кубе, модификаторы прибавит мастер.";
const WELCOME_APP = `Мастер готов. Выберите модель в меню «Модели ИИ» и опишите, что делает сэр Никис. ${ROLL_HINT}`;
const WELCOME_CLAUDE =
  `Мастера ведёт Claude от вашего аккаунта — при первой заявке Claude попросит разрешение. ${ROLL_HINT}`;
const WELCOME_NONE =
  "Мастер недоступен в этом окне: откройте страницу внутри Claude или запустите приложение для ПК. " +
  "Отряд, казна, кубы и база знаний работают.";

const TIER_STORAGE_KEY = "dnd.claudeTier";

function loadTier(): ClaudeTier {
  try {
    const saved = window.localStorage.getItem(TIER_STORAGE_KEY);
    if (saved === "quick" || saved === "default" || saved === "complex") return saved;
  } catch {
    // Хранилище браузера может быть недоступно — тогда уровень по умолчанию.
  }
  return "default";
}

function saveTier(tier: ClaudeTier) {
  try {
    window.localStorage.setItem(TIER_STORAGE_KEY, tier);
  } catch {
    // Не критично: выбор просто не запомнится.
  }
}

export default function App() {
  const engineAvailable = isEngineAvailable();
  const aiAvailable = isAiAvailable();
  const [sample, setSample] = useState<Awaited<ReturnType<typeof getSample>>>(null);
  const [tier, setTier] = useState<ClaudeTier>(loadTier);
  const abortRef = useRef<AbortController | null>(null);
  const masterMode: MasterMode = aiAvailable ? "provider" : sample ? "claude" : "none";
  const [tab, setTab] = useState<Tab>("dialog");
  const [openWindow, setOpenWindow] = useState<Overlay>(null);
  const [diceOpen, setDiceOpen] = useState(false);

  const [party, setParty] = useState<PartyView | null>(null);
  const [activeId, setActiveId] = useState(PLAYER_ID);
  const [sheet, setSheet] = useState<CharacterSheet | null>(null);
  const [book, setBook] = useState<SpellbookView | null>(null);
  const [details, setDetails] = useState<SheetDetails | null>(null);
  const [inv, setInv] = useState<InventoryView | null>(null);
  const [undo, setUndo] = useState<UndoInfo | null>(null);
  const [kbCharacter, setKbCharacter] = useState<string | null>(null);
  const [playerSheet, setPlayerSheet] = useState<CharacterSheet | null>(null);
  const [rolls, setRolls] = useState<TrayRoll[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>(
    aiAvailable ? [{ id: 0, author: "system", text: WELCOME_APP, time: now() }] : [],
  );
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
    const [nextParty, nextPlayer, nextUndo] = await Promise.all([
      partyView(),
      characterSheet(PLAYER_ID),
      masterUndoInfo(),
    ]);
    setParty(nextParty);
    setPlayerSheet(nextPlayer);
    setUndo(nextUndo);
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
    if (!engineAvailable) return;
    let cancelled = false;
    // Ошибка «не владеет магией» — нормальный случай: у персонажа просто нет вкладки заклинаний.
    spellbook(activeId)
      .then((next) => !cancelled && setBook(next))
      .catch(() => !cancelled && setBook(null));
    return () => {
      cancelled = true;
    };
  }, [engineAvailable, activeId, party]);

  useEffect(() => {
    if (!engineAvailable) return;
    let cancelled = false;
    Promise.all([characterDetails(activeId), loadInventory(activeId)])
      .then(([d, i]) => {
        if (cancelled) return;
        setDetails(d);
        setInv(i);
      })
      .catch((e: unknown) => !cancelled && addMessage("system", `Не удалось загрузить полный лист: ${errorText(e)}`));
    return () => {
      cancelled = true;
    };
  }, [engineAvailable, activeId, party, addMessage]);

  const engineNotes = useCallback(
    (actions: MasterAction[]) => {
      for (const a of actions) addMessage("engine", a.ok ? a.summary : `Отказ: ${a.summary}`);
      if (actions.length > 0) refresh().catch(() => undefined);
    },
    [addMessage, refresh],
  );

  useEffect(() => {
    if (aiAvailable) return;
    let cancelled = false;
    getSample().then((fn) => {
      if (cancelled) return;
      setSample(() => fn);
      setMessages((prev) => [
        { id: nextId.current++, author: "system", text: fn ? WELCOME_CLAUDE : WELCOME_NONE, time: now() },
        ...prev,
      ]);
    });
    return () => {
      cancelled = true;
    };
  }, [aiAvailable]);

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
    refresh().catch(() => undefined);
  }

  function sendToChat(text: string) {
    setDraft((prev) => (prev.trim() ? `${prev.trimEnd()} ${text}` : text));
    setDiceOpen(false);
    setTab("dialog");
  }

  function historyWith(playerMessage: ChatMessage) {
    return [...messages, playerMessage]
      .filter((m) => m.author === "player" || m.author === "master")
      .map((m) => ({ role: m.author === "player" ? ("player" as const) : ("master" as const), text: m.text }));
  }

  function send(text: string) {
    const playerMessage = addMessage("player", text);
    setDraft("");
    if (masterMode === "claude" && sample) {
      sendToClaude(sample, playerMessage);
      return;
    }
    if (masterMode !== "provider") return;
    if (!ai?.model) {
      addMessage("system", "Выберите модель мастера в меню «Модели ИИ».");
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setThinking(true);
    aiChat(historyWith(playerMessage))
      .then((reply) => {
        if (controller.signal.aborted) return;
        addMessage("master", reply.text, reply.model);
        engineNotes(reply.actions);
      })
      .catch((e: unknown) => {
        if (!controller.signal.aborted) addMessage("system", errorText(e));
      })
      .finally(() => setThinking(false));
  }

  function sendToClaude(fn: NonNullable<typeof sample>, playerMessage: ChatMessage) {
    const controller = new AbortController();
    abortRef.current = controller;
    const tierName = CLAUDE_TIERS.find((t) => t.id === tier)?.name ?? "Claude";
    const reply: ChatMessage = { id: nextId.current++, author: "master", text: "", time: now(), model: tierName };
    // Ответ приходит потоком: первая часть добавляет сообщение, следующие обновляют его.
    const show = (text: string) => {
      setMessages((prev) =>
        prev.some((m) => m.id === reply.id)
          ? prev.map((m) => (m.id === reply.id ? { ...m, text } : m))
          : [...prev, { ...reply, text }],
      );
    };
    setThinking(true);
    masterContext()
      .then((system) => claudeMasterReply(fn, system, historyWith(playerMessage), tier, show, controller.signal))
      // Команды движка из ответа (ячейки, заклинания) выполняет движок, в чате остаётся текст.
      .then((text) => masterApply(text))
      .then((turn) => {
        show(turn.text);
        engineNotes(turn.actions);
      })
      .catch((e: unknown) => {
        const partial = typeof e === "object" && e !== null && "text" in e ? (e as { text?: string }).text : undefined;
        if (partial) show(`${partial}\n\n(ответ прерван)`);
        addMessage("system", typeof e === "string" ? e : sampleErrorText(e));
      })
      .finally(() => setThinking(false));
  }

  function stop() {
    abortRef.current?.abort();
  }

  function changeModel(model: string) {
    if (masterMode === "claude") {
      const next = CLAUDE_TIERS.find((t) => t.id === model);
      if (!next) return;
      setTier(next.id);
      saveTier(next.id);
      addMessage("system", `Мастера ведёт ${next.name}. Контекст сцены сохранён.`);
      return;
    }
    if (!ai || !model) return;
    aiSelectModel(ai.provider, model)
      .then((settings) => {
        setAi(settings);
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

  function undoMaster() {
    undoMasterTurn()
      .then(async (actions) => {
        addMessage("engine", `Отменены действия мастера (${actions.length}): ${actions.join("; ")}`);
        await refresh();
      })
      .catch((e: unknown) => {
        addMessage("system", errorText(e));
        refresh().catch(() => undefined);
      });
  }

  function openFullSheet(id: string) {
    setKbCharacter(id);
    setOpenWindow("knowledge");
  }

  function menu(action: MenuAction) {
    if (action === "knowledge") setKbCharacter(null);
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

      <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 p-3 lg:grid-cols-[20rem_minmax(0,1fr)_24rem]">
        <div className={`${shown("party")} min-h-0 flex-col lg:flex`}>
          <PartyPanel
            party={party}
            activeId={activeId}
            onSelect={setActiveId}
            onOpenTreasury={() => setOpenWindow("treasury")}
          />
        </div>

        <div className={`${shown("dialog")} min-h-0 flex-col lg:flex`}>
          <ChatPanel
            messages={messages}
            draft={draft}
            thinking={thinking}
            masterMode={masterMode}
            model={masterMode === "claude" ? tier : (ai?.model ?? null)}
            modelOptions={masterMode === "claude" ? CLAUDE_TIERS : models}
            onDraftChange={setDraft}
            onSend={send}
            onStop={stop}
            onModelChange={changeModel}
            onOpenModels={() => setOpenWindow("models")}
            onOpenDice={() => setDiceOpen(true)}
            undo={undo}
            onUndo={undoMaster}
          />
        </div>

        <div className={`${shown("character")} min-h-0 flex-col lg:flex`}>
          <CharacterSheetPanel
            sheet={sheet}
            book={book}
            details={details}
            inventory={inv}
            busy={busy || !engineAvailable}
            onOpenFullSheet={openFullSheet}
            onOpenTreasury={() => setOpenWindow("treasury")}
            onRest={rest}
            onSpellsChanged={() => {
              refresh().catch((e: unknown) => addMessage("system", errorText(e)));
            }}
            onEngineNote={(text) => addMessage("engine", text)}
          />
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

      {openWindow === "knowledge" && (
        <KnowledgeBase
          key={kbCharacter ?? "kb"}
          initialCharacterId={kbCharacter}
          onClose={() => setOpenWindow(null)}
          onOpenTreasury={() => setOpenWindow("treasury")}
        />
      )}
      {openWindow === "save" && <SaveWindow onClose={() => setOpenWindow(null)} messages={messages} rolls={rolls} />}
      {openWindow === "treasury" && (
        <TreasuryWindow
          onClose={() => setOpenWindow(null)}
          onChanged={() => {
            refresh().catch(() => undefined);
          }}
        />
      )}
      {openWindow === "models" && (
        <AiSettingsWindow
          onClose={() => setOpenWindow(null)}
          masterMode={masterMode}
          tier={tier}
          onTierChange={changeModel}
          models={models}
          onModelsLoaded={setModels}
          onSettingsChange={setAi}
        />
      )}
    </div>
  );
}
