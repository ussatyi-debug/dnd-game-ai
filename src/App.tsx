import { useCallback, useEffect, useRef, useState } from "react";
import CharacterSheetPanel from "./components/CharacterSheetPanel";
import ChatPanel, { type ChatMessage, type MasterMode } from "./components/ChatPanel";
import DiceDrawer from "./components/DiceDrawer";
import KnowledgeBase from "./components/KnowledgeBase";
import GoalsStrip from "./components/GoalsStrip";
import LoadWindow, { parseSave, type ParsedSave } from "./components/LoadWindow";
import MiniPlayer from "./components/MiniPlayer";
import SettingsWindow, { type SettingsTab } from "./components/SettingsWindow";
import ContinueWindow from "./components/ContinueWindow";
import HomeScreen, { type HomeAction } from "./components/HomeScreen";
import ReferenceWindow from "./components/ReferenceWindow";
import LogWindow from "./components/LogWindow";
import HelpWindow from "./components/HelpWindow";
import { devLog } from "./lib/devlog";
import MainMenu, { type MenuAction } from "./components/MainMenu";
import PartyPanel from "./components/PartyPanel";
import SaveWindow from "./components/SaveWindow";
import TreasuryWindow from "./components/TreasuryWindow";
import {
  aiChat,
  aiUpdate,
  masterNarration,
  masterUpdateApply,
  masterUpdateRequest,
  type MasterRequest,
  type MasterTurn,
  canExitApp,
  exitApp,
  aiListModels,
  aiSelectModel,
  aiSettings,
  characterDetails,
  characterSheet,
  inventory as loadInventory,
  masterUndoInfo,
  masterNotes,
  customCards,
  recruitInfo,
  recruitRequests,
  addMember,
  dismissRecruit,
  levelUp,
  xpStatus,
  type XpStatus,
  type RecruitInfo,
  type RecruitRequest,
  resolveProposal,
  sheetProposals,
  type SheetProposal,
  undoMasterTurn,
  errorText,
  isAiAvailable,
  isEngineAvailable,
  isWebBuild,
  LUCKY_ID,
  masterApply,
  masterContext,
  masterRepair,
  masterRolls,
  repairRequest,
  partyView,
  restartDemo,
  setKbCards,
  startCampaign,
  validateHero,
  spellbook,
  takeRest,
  type InventoryView,
  type LoadReport,
  type MasterAction,
  type MasterRoll,
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
import { kbFreshCount } from "./lib/kbState";
import { alignmentTone, startPlaces } from "./data/kb/startPlaces";
import {
  CLAUDE_TIERS,
  claudeMasterReply,
  getSample,
  sampleErrorText,
  type ClaudeTier,
} from "./lib/claude";
import { kbExtraFor, kbIndex, setKbScope, worldLocations } from "./data/kb/index.ts";
import {
  AUTOSAVE_EVERY,
  listAutosaves,
  deleteAllSaves,
  readAutosave,
  setAutosaveCampaign,
  writeAutosave,
  writeManualSave,
  type AutosaveInfo,
} from "./lib/autosave";
import {
  addCampaign,
  removeCampaign,
  currentCampaignId,
  listCampaigns,
  newCampaignId,
  setCurrentCampaignId,
  STRANGE_ID,
  type CampaignInfo,
} from "./lib/campaigns";
import { CURRENT_DAY, equipment, TIERS, type Draft } from "./lib/creation.ts";
import type { HeroSpec } from "./lib/heroSpec";
import CreationWizard, { type CompanionMode } from "./components/creation/CreationWizard.tsx";
import { heroSpec } from "./lib/sheetExport";
import { invoke as invokeTauri } from "@tauri-apps/api/core";
import { webAiGenerate } from "./lib/browserAi";
import {
  compressHistory,
  promptSize,
  recentTurns,
  shortSheet,
  skipEmptyUpdate,
  twoStepFor,
  UPDATE_TIMEOUT_MS,
} from "./lib/masterPrefs";
import { loadTtsSettings, ttsPlayer, type TtsSettings } from "./lib/tts";
import { loadMusicSettings, moodForScene, musicPlayer, type MusicSettings } from "./lib/music";
import type { RollResult, TrayRoll } from "./lib/rolls";

const MAX_ROLLS = 200;
/** Раундов запросов бросков мастера за ход (как в движке). */
const MAX_ROLL_ROUNDS = 3;
const STRANGE_PLAYER = "pc.nikis";

/** Скрытая метка в чате: новая игра началась без мастера, вступление ещё впереди. */
const OPENING_PENDING = "[вступление мастера ждёт подключения модели]";

function isTauriApp(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/** Служебная заявка в начале новой игры: мастер встречает игрока и описывает сцену. */
const OPENING_REQUEST =
  "[Начало игры] Поприветствуй игрока как Мастер этой кампании. Коротко напомни, что происходило до этого " +
  "момента (по «сцена», обстановке и записям базы знаний), затем опиши текущую ситуацию: день, время, место, " +
  "погоду, людей и обстановку вокруг героя и кто из спутников рядом. Закончи вопросом, что делает герой. " +
  "Бросков не запрашивай и не решай за героя.";

/** Ответ модели на странице: системный текст, история, показ потока, отмена. */
type PageGenerator = (
  system: string,
  history: { role: "player" | "master"; text: string }[],
  show: (text: string) => void,
  signal: AbortSignal,
) => Promise<string>;
const HERO_PLAYER = "pc.hero";

/** Включает кампанию до первого обращения к сохранениям и базе знаний. */
function applyCampaign(id: string): void {
  setAutosaveCampaign(id);
  setKbScope(id === STRANGE_ID ? "all" : "world");
}

/** Кампания при запуске: последняя выбранная. */
function initialCampaign(): string {
  const id = currentCampaignId();
  applyCampaign(id);
  return id;
}
/** Сколько последних сообщений чата получает мастер; остальное — в базе знаний. */

type Tab = "party" | "dialog" | "character";
type Overlay = "knowledge" | "save" | "load" | "settings" | "treasury" | "continue" | "reference" | "log" | "help" | null;

const TABS: { id: Tab; label: string }[] = [
  { id: "party", label: "Отряд" },
  { id: "dialog", label: "Диалог" },
  { id: "character", label: "Персонаж" },
];

const now = () => new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

const ROLL_HINT =
  "Броски — кнопкой 🎲 или своими кубами: присылайте только значение на кубе, модификаторы прибавит мастер.";
const WELCOME_APP = `Мастер готов. Выберите модель в меню «Модели ИИ» и опишите, что делает ваш герой. ${ROLL_HINT}`;
const WELCOME_CLAUDE =
  `Мастера ведёт Claude от вашего аккаунта — при первой заявке Claude попросит разрешение. ${ROLL_HINT}`;
const WELCOME_NONE =
  "Мастер ещё не выбран: Меню → Настройки → ИИ-мастер — Gemini, ChatGPT или YandexGPT со своим ключом. " +
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

/** Убрать экранную клавиатуру: снять фокус с поля ввода (при смене вкладки и открытии кубов). */
function hideKeyboard() {
  const el = document.activeElement;
  if (el instanceof HTMLElement) el.blur();
}

export default function App() {
  const engineAvailable = isEngineAvailable();
  const aiAvailable = isAiAvailable();
  const [sample, setSample] = useState<Awaited<ReturnType<typeof getSample>>>(null);
  const [tier, setTier] = useState<ClaudeTier>(loadTier);
  const abortRef = useRef<AbortController | null>(null);
  const [ai, setAi] = useState<AiSettingsView | null>(null);
  /** Веб-версия: мастера ведёт модель со своим ключом (Gemini, ChatGPT, YandexGPT). */
  const browserModel = !aiAvailable && ai !== null && ai.claude === false && Boolean(ai.model);
  const masterMode: MasterMode = aiAvailable ? "provider" : browserModel ? "browser" : sample ? "claude" : "none";
  /** Настройки ИИ ещё грузятся — пока не показываем «Мастер не подключён». */
  const masterKnown = !aiAvailable || ai !== null;
  /** Мастер может ответить: модель выбрана (или мастера ведёт Claude). */
  const masterReady =
    !masterKnown || masterMode === "claude" || masterMode === "browser" || (masterMode === "provider" && Boolean(ai?.model));
  const [tab, setTab] = useState<Tab>("dialog");
  const [openWindow, setOpenWindow] = useState<Overlay>(null);
  const [diceOpen, setDiceOpen] = useState(false);

  const [party, setParty] = useState<PartyView | null>(null);
  const [campaignId, setCampaignId] = useState<string>(initialCampaign);
  const [campaigns, setCampaigns] = useState<CampaignInfo[]>([]);
  const [kbFresh, setKbFresh] = useState(0);
  const [recruit, setRecruit] = useState<RecruitInfo | null>(null);
  const [recruits, setRecruits] = useState<RecruitRequest[]>([]);
  const [xp, setXp] = useState<XpStatus | null>(null);
  /** Повышение уровня: лист героя до повышения. */
  const [levelUpSpec, setLevelUpSpec] = useState<HeroSpec | null>(null);
  const [companionMode, setCompanionMode] = useState<CompanionMode | null>(null);
  const [creating, setCreating] = useState(false);
  /** Новая игра началась — мастер должен открыть её вступлением. */
  const [opening, setOpening] = useState(false);
  const PLAYER_ID = campaignId === STRANGE_ID ? STRANGE_PLAYER : HERO_PLAYER;
  const [activeId, setActiveId] = useState(PLAYER_ID);
  const [sheet, setSheet] = useState<CharacterSheet | null>(null);
  const [book, setBook] = useState<SpellbookView | null>(null);
  const [details, setDetails] = useState<SheetDetails | null>(null);
  const [inv, setInv] = useState<InventoryView | null>(null);
  const [undo, setUndo] = useState<UndoInfo | null>(null);
  const [proposals, setProposals] = useState<SheetProposal[]>([]);
  const [kbCharacter, setKbCharacter] = useState<string | null>(null);
  /** Карточка базы знаний, которую нужно открыть сразу (цель из строки целей). */
  const [kbCard, setKbCard] = useState<string | null>(null);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("tts");
  const [tts, setTts] = useState<TtsSettings>(loadTtsSettings);
  const [music, setMusic] = useState<MusicSettings>(loadMusicSettings);
  /** Заявка без ответа из-за сбоя и оборванный ответ мастера, который заменит повтор. */
  const [failed, setFailed] = useState<{ playerId: number; partialId: number | null } | null>(null);
  const [autosaves, setAutosaves] = useState<AutosaveInfo[]>([]);
  /** Главный экран поверх игры. */
  const [home, setHome] = useState(true);
  /** Игра уже начата или загружена в этом запуске. */
  const [played, setPlayed] = useState(false);
  /** Ходов мастера с последнего автосохранения. */
  const [sinceAutosave, setSinceAutosave] = useState<number | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const rollsRef = useRef<TrayRoll[]>([]);
  const [playerSheet, setPlayerSheet] = useState<CharacterSheet | null>(null);
  const [rolls, setRolls] = useState<TrayRoll[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>(
    aiAvailable ? [{ id: 0, author: "system", text: WELCOME_APP, time: now() }] : [],
  );
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [thinking, setThinking] = useState(false);
  /** Второй шаг двухшагового хода идёт: «Отправить» закрыта; `stalled` — ждём дольше минуты. */
  const [updating, setUpdating] = useState<{ stalled: boolean; failed: boolean } | null>(null);
  const updateToken = useRef(0);
  const updateActions = useRef<{ retry: () => void; skip: () => void } | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const nextId = useRef(1);

  const addMessage = useCallback((author: ChatMessage["author"], text: string, model?: string) => {
    const message: ChatMessage = { id: nextId.current++, author, text, time: now(), model };
    setMessages((prev) => [...prev, message]);
    return message;
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  useEffect(() => {
    musicPlayer.configure(music);
  }, [music]);
  const sceneMood = party?.scene.mood;
  const sceneTime = party?.scene.time ?? null;
  useEffect(() => {
    if (home) musicPlayer.setMood("menu");
    else if (sceneMood) musicPlayer.setMood(moodForScene(sceneMood, sceneTime));
  }, [home, sceneMood, sceneTime]);
  useEffect(() => {
    rollsRef.current = rolls;
  }, [rolls]);

  /** Автосохранение (тихо; ошибка — строкой в чате). */
  const autosave = useCallback(() => {
    // Сообщения из последнего хода попадают в состояние на следующем кадре.
    window.setTimeout(() => {
      writeAutosave(messagesRef.current ?? [], rollsRef.current ?? [])
        .then(() => setSinceAutosave(0))
        .catch((e: unknown) => addMessage("system", `Автосохранение не удалось: ${errorText(e)}`));
    }, 300);
  }, [addMessage]);

  const ttsError = useCallback((text: string) => addMessage("system", text), [addMessage]);

  const afterMasterTurn = useCallback(() => {
    setSinceAutosave((n) => {
      const next = (n ?? 0) + 1;
      if (next >= AUTOSAVE_EVERY) autosave();
      return next;
    });
  }, [autosave]);

  const refresh = useCallback(async () => {
    const [nextParty, nextUndo, nextProposals] = await Promise.all([partyView(), masterUndoInfo(), sheetProposals()]);
    // Герой игрока — по отряду: в «Доме Стрэндж» это Никис, в своей кампании — созданный герой.
    const playerId = nextParty.members.find((m) => m.kind === "player")?.id ?? STRANGE_PLAYER;
    const nextPlayer = await characterSheet(playerId);
    setParty(nextParty);
    setPlayerSheet(nextPlayer);
    setUndo(nextUndo);
    setProposals(nextProposals);
    Promise.all([masterNotes(), customCards()])
      .then(([n, c]) => setKbFresh(kbFreshCount(n, c)))
      .catch(() => undefined);
    Promise.all([recruitInfo(), recruitRequests()])
      .then(([info, list]) => {
        setRecruit(info);
        setRecruits(list);
      })
      .catch(() => undefined);
    xpStatus()
      .then(setXp)
      .catch(() => setXp(null));
  }, []);

  useEffect(() => {
    if (!engineAvailable) return;
    // Указатель базы знаний — чтобы мастер видел оглавление базы и ссылался на карточки.
    setKbCards(kbIndex())
      .catch(() => undefined)
      .then(refresh)
      .catch((e: unknown) => addMessage("system", `Не удалось загрузить отряд: ${errorText(e)}`));
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

  useEffect(() => {
    if (!engineAvailable) return;
    listCampaigns()
      .then(setCampaigns)
      .catch(() => undefined);
    // Есть сохранение — игра сразу продолжается с последнего; нет — главный экран.
    listAutosaves()
      .then(async (list) => {
        if (list.length === 0 && currentCampaignId() !== STRANGE_ID) {
          // У своей кампании нет сохранений — вернуться к «Дому Стрэндж».
          applyCampaign(STRANGE_ID);
          setCurrentCampaignId(STRANGE_ID);
          setCampaignId(STRANGE_ID);
          list = await listAutosaves();
        }
        setAutosaves(list);
        const last = list[0];
        if (!last) return;
        continueFrom(await readAutosave(last.slot));
      })
      .catch(() => undefined);
  }, [engineAvailable]);

  /** Открытые броски мастера — в лог кубов; тайные игрок не видит. */
  const logMasterRolls = useCallback((list: MasterRoll[]) => {
    if (list.length === 0) return;
    // Тайные броски тоже в лотке, но свёрнутыми: «🔒 Тайный бросок мастера», числа — по нажатию.
    const entries: TrayRoll[] = list.map((r) => ({
      id: nextId.current++,
      time: now(),
      die: r.d20 !== null ? "d20" : "d6",
      values: r.d20 !== null ? [r.d20] : r.dice,
      total: r.total,
      master: { who: r.who, what: r.what, line: r.line, outcome: r.outcome, hidden: r.hidden },
    }));
    setRolls((prev) => [...entries.reverse(), ...prev].slice(0, MAX_ROLLS));
  }, []);

  /** Итоги хода мастера — в журнал разбора, под ответом — только краткая сводка. */
  const recordTurn = useCallback(
    (messageId: number, turn: { actions: MasterAction[]; rolls: MasterRoll[]; fabricated: string[]; raw: string[]; model?: string }) => {
      devLog.add(
        "master",
        `${turn.model ?? "Мастер"}: ответ${turn.raw.length > 1 ? ` (${turn.raw.length} запроса к модели)` : ""}`,
        turn.raw.join("\n\n──────── следующий запрос к модели ────────\n\n"),
      );
      // Тайный бросок в журнале свёрнут: подробности — по нажатию на запись.
      for (const r of turn.rolls) {
        if (r.hidden) devLog.add("roll", "🔒 Тайный бросок мастера", r.line);
        else devLog.add("roll", r.line);
      }
      for (const a of turn.actions) devLog.add(a.ok ? "engine" : "refusal", a.summary);
      if (turn.fabricated.length > 0) devLog.add("warning", `Бросок не из движка: ${turn.fabricated.join(", ")}`);
      const ok = turn.actions.filter((a) => a.ok).length;
      const failedCount = turn.actions.length - ok;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, fabricated: turn.fabricated, engine: turn.actions.length > 0 ? { ok, failed: failedCount } : undefined }
            : m,
        ),
      );
      if (turn.actions.length > 0) refresh().catch(() => undefined);
    },
    [refresh],
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
    aiSettings()
      .then((settings) => {
        setAi(settings);
        if (settings.has_key && settings.claude !== true) return aiListModels(settings.provider).then(setModels);
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
      s && s.id === playerSheet?.id
        ? { ...s, resources: s.resources.map((r) => (r.id === pool.id ? pool : r)) }
        : s;
    setPlayerSheet(patch);
    setSheet(patch);
    refresh().catch(() => undefined);
  }

  // Мастер подключён, а вступление ещё не звучало — открыть сцену сейчас.
  useEffect(() => {
    if (!masterReady || !masterKnown || thinking) return;
    if (!messages.some((m) => m.text === OPENING_PENDING)) return;
    setMessages((prev) => prev.filter((m) => m.text !== OPENING_PENDING));
    setOpening(true);
  }, [masterReady, masterKnown, messages, thinking]);

  // Первый запуск без выбранной модели — сразу настройки ИИ.
  useEffect(() => {
    if (!masterKnown || masterReady) return;
    try {
      if (window.localStorage.getItem("dnd.firstRunDone")) return;
      window.localStorage.setItem("dnd.firstRunDone", "1");
    } catch {
      return;
    }
    setSettingsTab("ai");
    setOpenWindow("settings");
  }, [masterKnown, masterReady]);

  // Окно закрыто — список сохранений мог измениться (удаление, ручное сохранение).
  useEffect(() => {
    if (openWindow === null) listAutosaves().then(setAutosaves).catch(() => undefined);
  }, [openWindow]);

  // Вступление мастера: после отрисовки новой игры, когда чат и отряд уже новые.
  useEffect(() => {
    if (!opening) return;
    setOpening(false);
    if (!masterReady || !masterKnown) {
      // Вступление ждёт мастера: метка уходит в сохранение и срабатывает после подключения модели.
      setMessages((prev) =>
        prev.some((m) => m.text === OPENING_PENDING)
          ? prev
          : [...prev, { id: nextId.current++, author: "system", text: OPENING_PENDING, time: now(), hidden: true }],
      );
      return;
    }
    const message: ChatMessage = { id: nextId.current++, author: "player", text: OPENING_REQUEST, time: now(), hidden: true };
    setMessages((prev) => [...prev, message]);
    request(message);
    // request берёт данные этой отрисовки; эффект срабатывает раз на новую игру.
  }, [opening]);

  function sendToChat(text: string) {
    setDraft((prev) => (prev.trim() ? `${prev.trimEnd()} ${text}` : text));
    setDiceOpen(false);
    setTab("dialog");
  }

  function historyWith(playerMessage: ChatMessage) {
    // Только сообщения до заявки: оборванный ответ после неё при повторе не уходит мастеру.
    // Последние заявки с ответами — раннюю часть диалога мастеру заменяет хроника.
    const prior = messages.filter((m) => m.id < playerMessage.id && (m.author === "player" || m.author === "master"));
    const turns = recentTurns(prior, playerMessage).map((m) => ({
      role: m.author === "player" ? ("player" as const) : ("master" as const),
      text: m.text,
    }));
    return compressHistory(turns);
  }

  /** Двухшаговый ход для того, кто сейчас ведёт мастера. */
  function twoStepNow(): boolean {
    return twoStepFor(masterMode === "claude" ? "claude" : (ai?.provider ?? "gemini"));
  }

  /** Размер запроса мастеру — в «Логирование»; переполнение окна — предупреждением. */
  function logPromptSize(tokens: number | null, chars: number, cached: number | null = null) {
    const limit = models.find((m) => m.id === ai?.model)?.input_token_limit ?? null;
    const size = promptSize(tokens, chars, limit, cached);
    if (size.overflow) devLog.add("warning", `Запрос мастеру почти заполнил окно модели: ${size.text}`);
    return size.text;
  }

  function send(text: string) {
    const playerMessage = addMessage("player", text);
    setDraft("");
    setFailed(null);
    request(playerMessage);
  }

  function request(playerMessage: ChatMessage) {
    if (masterMode === "claude" && sample) {
      const tierName = CLAUDE_TIERS.find((t) => t.id === tier)?.name ?? "Claude";
      sendInPage(
        (system, history, show, signal) => claudeMasterReply(sample, system, history, tier, show, signal),
        tierName,
        playerMessage,
      );
      return;
    }
    if (masterMode === "browser") {
      sendInPage(
        (system, history, _show, signal) => webAiGenerate(system, history, signal),
        ai?.model ?? "Мастер",
        playerMessage,
      );
      return;
    }
    if (masterMode !== "provider") return;
    if (!ai?.model) {
      addMessage("system", "Выберите модель мастера: Меню → Настройки → ИИ-мастер.");
      setFailed({ playerId: playerMessage.id, partialId: null });
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setThinking(true);
    const twoStep = twoStepNow();
    aiChat(historyWith(playerMessage), kbExtraFor(playerMessage.text), twoStep, shortSheet())
      .then((reply) => {
        if (controller.signal.aborted) {
          setFailed({ playerId: playerMessage.id, partialId: null });
          return;
        }
        const size = logPromptSize(reply.prompt_tokens, reply.prompt_chars, reply.cached_tokens);
        const message = addMessage("master", reply.text, reply.model);
        logMasterRolls(reply.rolls);
        recordTurn(message.id, { ...reply, model: `${reply.model} · ${size}` });
        // Экономия: мастер пометил ход как разговор без изменений — второй запрос не нужен.
        if (!reply.pending_update || (reply.no_changes && skipEmptyUpdate())) {
          if (reply.no_changes) devLog.add("engine", "Ход без изменений — второй шаг пропущен");
          afterMasterTurn();
          return;
        }
        runUpdate(
          message.id,
          () => aiUpdate(playerMessage.text, reply.text, reply.written_commands),
          reply.model,
          reply.fabricated,
        );
      })
      .catch((e: unknown) => {
        setFailed({ playerId: playerMessage.id, partialId: null });
        devLog.add("error", "Мастер не ответил", errorText(e));
        if (!controller.signal.aborted) addMessage("system", errorText(e));
      })
      .finally(() => setThinking(false));
  }

  /**
   * Второй шаг двухшагового хода: команды движка по рассказу мастера. Пока он идёт, кнопка
   * «Отправить» закрыта (поле ввода — нет). Через минуту ожидание можно пропустить: шаг
   * доработает сам; при сбое — повторить или пропустить.
   */
  function runUpdate(
    messageId: number,
    job: () => Promise<{ actions: MasterAction[]; raw: string[] }>,
    model: string,
    fabricated: string[],
  ) {
    const token = ++updateToken.current;
    setUpdating({ stalled: false, failed: false });
    updateActions.current = {
      retry: () => runUpdate(messageId, job, model, fabricated),
      skip: () => {
        updateToken.current++;
        setUpdating(null);
        afterMasterTurn();
      },
    };
    const timer = window.setTimeout(() => {
      if (updateToken.current === token) setUpdating({ stalled: true, failed: false });
    }, UPDATE_TIMEOUT_MS);
    job()
      .then((result) => {
        // Ход записывается, даже если игрок перестал ждать: движок уже выполнил команды.
        recordTurn(messageId, { actions: result.actions, rolls: [], fabricated, raw: result.raw, model: `${model} · обновление данных` });
        if (updateToken.current === token) {
          setUpdating(null);
          afterMasterTurn();
        }
      })
      .catch((e: unknown) => {
        devLog.add("error", "Обновление данных по рассказу не удалось", typeof e === "string" ? e : errorText(e));
        if (updateToken.current === token) setUpdating({ stalled: true, failed: true });
      })
      .finally(() => window.clearTimeout(timer));
  }

  /** Повтор заявки после сбоя: оборванный ответ убирается, заявка уходит заново. */
  function retry() {
    const f = failed;
    if (!f) return;
    const playerMessage = messages.find((m) => m.id === f.playerId);
    if (!playerMessage) return;
    setFailed(null);
    if (f.partialId !== null) setMessages((prev) => prev.filter((m) => m.id !== f.partialId));
    request(playerMessage);
  }

  /**
   * Ход мастера на стороне страницы (Claude внутри Claude или модель со своим ключом в веб-версии):
   * броски и запросы движка, команды и повтор отклонённых команд — как в приложении.
   */
  function sendInPage(gen: PageGenerator, tierName: string, playerMessage: ChatMessage) {
    const controller = new AbortController();
    abortRef.current = controller;
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
    const twoStep = twoStepNow();
    const rolled: MasterRoll[] = [];
    const raw: string[] = [];
    // Рассказ из ответов с запросами бросков — игрок его видит, продолжение дописывается следом.
    const prose: string[] = [];
    let carried = "";
    const showWith = (text: string) => show([...prose, text].filter(Boolean).join("\n\n"));
    /** Итог хода: пустой рассказ (мастер прислал только команды) заменяется подсказкой. */
    const finish = (text: string) => {
      if (text.trim()) {
        show(text);
        return;
      }
      setMessages((prev) => prev.filter((m) => m.id !== reply.id));
      addMessage("system", "Мастер прислал ход без рассказа. Нажмите «Повторить ход», чтобы переспросить.");
    };
    const history = historyWith(playerMessage);
    let system = "";
    const withRolls = async (req: MasterRequest) => {
      system = req.system;
      history[history.length - 1] = { role: "player", text: req.turn };
      for (let round = 0; ; round++) {
        const text = await gen(system, history, showWith, controller.signal);
        raw.push(text);
        const r = round < MAX_ROLL_ROUNDS ? await masterRolls(text) : null;
        if (!r) return text;
        rolled.push(...r.rolls);
        if (r.prose) prose.push(r.prose);
        if (r.carried) carried += `${r.carried}\n`;
        showWith("");
        history.push({ role: "master", text }, { role: "player", text: r.feedback });
      }
    };
    masterContext(playerMessage.text, kbExtraFor(playerMessage.text), twoStep, shortSheet())
      .then(withRolls)
      .then(async (text) => {
        const full = [...prose, text].filter(Boolean).join("\n\n");
        if (twoStep) return { narration: await masterNarration(full), turn: null };
        // Команды движка из ответа (ячейки, заклинания) выполняет движок, в чате остаётся текст.
        const turn = await masterApply(`${full}\n${carried}`, rolled.flatMap((r) => r.dice), playerMessage.text);
        // Отказы движка: один повтор — мастер присылает исправленные команды.
        const request = repairRequest(turn.actions);
        if (request) {
          history.push({ role: "master", text }, { role: "player", text: request });
          try {
            const fix = await gen(system, history, () => undefined, controller.signal);
            raw.push(fix);
            const fixed = await masterRepair(fix);
            turn.actions.push(...fixed.map((a) => ({ ...a, summary: `исправлено: ${a.summary}` })));
          } catch (e) {
            devLog.add("error", "Повтор команд не удался", errorText(e));
          }
        }
        return { narration: null, turn };
      })
      .then(({ narration, turn }) => {
        const size = logPromptSize(null, system.length + history.reduce((n, m) => n + m.text.length, 0));
        if (turn) {
          finish(turn.text);
          logMasterRolls(rolled);
          recordTurn(reply.id, { ...turn, rolls: rolled, raw, model: `${tierName} · ${size}` });
          afterMasterTurn();
          return;
        }
        if (!narration) return;
        finish(narration.text);
        logMasterRolls(rolled);
        recordTurn(reply.id, { actions: [], fabricated: [], rolls: rolled, raw, model: `${tierName} · ${size}` });
        const written = `${carried}${narration.written}`.trim();
        // Экономия: ход-разговор без изменений — второй запрос не отправляется.
        if (narration.no_changes && !written && skipEmptyUpdate()) {
          devLog.add("engine", "Ход без изменений — второй шаг пропущен");
          afterMasterTurn();
          return;
        }
        runUpdate(
          reply.id,
          async () => {
            const req = await masterUpdateRequest(playerMessage.text, narration.text, written);
            const ask = [{ role: "player" as const, text: req.turn }];
            const quiet = new AbortController().signal;
            const out = await gen(req.system, ask, () => undefined, quiet);
            const turnOut = (await masterUpdateApply(out)) as MasterTurn;
            const actions = [...turnOut.actions];
            const rawOut = [out];
            const repair = repairRequest(actions);
            if (repair) {
              try {
                const fix = await gen(
                  req.system,
                  [
                    ...ask,
                    { role: "master", text: out },
                    { role: "player", text: `${repair}\nОтветь JSON {"commands":[...]} только с исправленными командами.` },
                  ],
                  () => undefined,
                  quiet,
                );
                rawOut.push(fix);
                const fixed = (await masterUpdateApply(fix, true)) as MasterAction[];
                actions.push(...fixed.map((a) => ({ ...a, summary: `исправлено: ${a.summary}` })));
              } catch (e) {
                devLog.add("error", "Повтор команд не удался", errorText(e));
              }
            }
            return { actions, raw: rawOut };
          },
          tierName,
          [],
        );
      })
      .catch((e: unknown) => {
        const partial = typeof e === "object" && e !== null && "text" in e ? (e as { text?: string }).text : undefined;
        if (partial) show(`${partial}\n\n(ответ прерван)`);
        setFailed({ playerId: playerMessage.id, partialId: partial ? reply.id : null });
        devLog.add("error", "Мастер не ответил", typeof e === "string" ? e : sampleErrorText(e));
        addMessage("system", typeof e === "string" ? e : sampleErrorText(e));
      })
      .finally(() => setThinking(false));
  }

  function stop() {
    abortRef.current?.abort();
  }

  function changeModel(model: string) {
    const next = CLAUDE_TIERS.find((t) => t.id === model);
    if (next && !aiAvailable) {
      setTier(next.id);
      saveTier(next.id);
      if (sample) {
        addMessage("system", `Мастера ведёт ${next.name}. Контекст сцены сохранён.`);
        return;
      }
      // Доступ к Claude мог появиться после загрузки страницы (разрешение, медленный ответ
      // платформы) — спрашиваем ещё раз, а не молчим.
      void getSample().then((fn) => {
        if (fn) {
          setSample(() => fn);
          addMessage("system", `Мастера ведёт ${next.name}. Контекст сцены сохранён.`);
        } else {
          addMessage(
            "system",
            "Claude недоступен на этой странице: платформа не дала доступ к модели. Обновите страницу; если не поможет — откройте артефакт заново из списка артефактов.",
          );
        }
      });
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
        autosave();
      })
      .catch((e: unknown) => addMessage("system", `Отдых не удался: ${errorText(e)}`))
      .finally(() => setBusy(false));
  }

  /** Повтор хода: отменяет действия мастера и шлёт последнюю заявку игрока заново.
   *  Нужен, когда мастер прислал пустой или оборванный рассказ. */
  function retryTurn() {
    const last = [...messages].reverse().find((m) => m.author === "player" && !m.hidden);
    if (!last) return;
    undoMasterTurn()
      .then(async (actions) => {
        if (actions.length > 0) {
          addMessage("engine", `Отменены действия мастера (${actions.length}) — спрашиваю заново`);
        }
        await refresh();
        setMessages((prev) => prev.filter((m) => m.author !== "master" || m.id < last.id));
        request(last);
      })
      .catch((e: unknown) => {
        addMessage("system", errorText(e));
        refresh().catch(() => undefined);
      });
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

  function loaded(save: ParsedSave, report: LoadReport, fromFile = false) {
    const maxId = Math.max(0, ...save.chat.map((m) => m.id), ...save.rolls.map((r) => r.id));
    nextId.current = maxId + 1;
    setMessages(save.chat);
    setRolls(save.rolls);
    partyView()
      .then((p) => setActiveId(p.members.find((m) => m.kind === "player")?.id ?? STRANGE_PLAYER))
      .catch(() => undefined);
    setOpenWindow(null);
    setCreating(false);
    setHome(false);
    setPlayed(true);
    const extra =
      report.supplemented.length > 0 ? ` Дополнено из приложения: ${report.supplemented.join("; ")}.` : "";
    addMessage("system", `Загружено сохранение: День ${report.day}, ${report.location}.${extra}`);
    setFailed(null);
    refresh().catch((e: unknown) => addMessage("system", errorText(e)));
    adoptCampaign(save.engine as Record<string, unknown>);
    if (fromFile) {
      // Сейв из файла — отдельной ручной ячейкой: автосохранения по кругу его не вытеснят.
      window.setTimeout(() => {
        writeManualSave(messagesRef.current ?? [], rollsRef.current ?? [], `Из файла · День ${report.day}`)
          .then(() => listAutosaves().then(setAutosaves))
          .catch((e: unknown) => addMessage("system", `Сейв из файла не записан в ячейку: ${errorText(e)}`));
      }, 300);
    }
    autosave();
  }

  /**
   * Сохранение (в том числе из файла) принадлежит своей кампании: автосохранения пишутся в неё,
   * а если кампании нет на устройстве — она добавляется в список, чтобы сейв не потерялся.
   */
  function adoptCampaign(engine: Record<string, unknown>) {
    const c = (engine.campaign ?? null) as { id?: unknown; title?: unknown; heroes?: unknown } | null;
    const id = c && typeof c.id === "string" && c.id ? c.id : STRANGE_ID;
    if (id !== campaignId) {
      applyCampaign(id);
      setCurrentCampaignId(id);
      setCampaignId(id);
      setKbCards(kbIndex()).catch(() => undefined);
    }
    if (id === STRANGE_ID || campaigns.some((x) => x.id === id)) return;
    const hero = (Array.isArray(c?.heroes) ? c.heroes[0] : null) as Partial<HeroSpec> | null;
    const scene = (engine.scene ?? {}) as { day?: unknown };
    const cls = hero?.classes?.[0];
    const info: CampaignInfo = {
      id,
      title: typeof c?.title === "string" && c.title ? c.title : `Путь героя ${hero?.name ?? ""}`.trim(),
      createdAt: new Date().toISOString(),
      startDay: typeof scene.day === "number" ? scene.day : CURRENT_DAY,
      hero: {
        name: hero?.name ?? "Герой",
        summary: [hero?.species, cls ? `${cls.name} ${cls.level}` : null].filter(Boolean).join(" · "),
        portrait: hero?.portrait ?? "",
      },
    };
    addCampaign(info).catch(() => undefined);
    setCampaigns((prev) => [info, ...prev.filter((x) => x.id !== id)]);
  }

  function openFullSheet(id: string) {
    setKbCharacter(id);
    setOpenWindow("knowledge");
  }

  function menu(action: MenuAction) {
    if (action === "home") {
      setHome(true);
      return;
    }
    if (action === "knowledge") {
      setKbCharacter(null);
      setKbFresh(0);
    }
    if (action === "settings") setSettingsTab("tts");
    setOpenWindow(action);
  }

  function homeAction(action: HomeAction) {
    switch (action) {
      case "continue": {
        const last = autosaves[0];
        if (played || !last) {
          // Без сохранений «Продолжить» начинает игру с начала — мастер её открывает.
          if (!played) setOpening(true);
          setHome(false);
          setPlayed(true);
          return;
        }
        readAutosave(last.slot)
          .then(continueFrom)
          .catch((e: unknown) => addMessage("system", `Автосохранение не загрузилось: ${errorText(e)}`));
        return;
      }
      case "campaign":
        switchCampaign(STRANGE_ID, true);
        return;
      case "new":
        setCreating(true);
        return;
      case "load":
        setOpenWindow("load");
        return;
      case "settings":
        setSettingsTab("tts");
        setOpenWindow("settings");
        return;
      case "reference":
        setOpenWindow("reference");
        return;
      case "exit":
        void exitApp();
        return;
    }
  }

  /**
   * Переход к другой кампании: сохранения и база знаний переключаются, игра продолжается
   * с последнего автосохранения кампании. `ask` — показать окно сохранений «Дома Стрэндж».
   */
  function switchCampaign(id: string, ask = false) {
    const same = id === campaignId;
    applyCampaign(id);
    setCurrentCampaignId(id);
    setCampaignId(id);
    if (!same) setPlayed(false);
    setKbCards(kbIndex()).catch(() => undefined);
    listAutosaves()
      .then(async (list) => {
        setAutosaves(list);
        if (ask) {
          setOpenWindow("continue");
          return;
        }
        const last = list[0];
        if (last) continueFrom(await readAutosave(last.slot));
        else addMessage("system", "У этой кампании нет сохранений.");
      })
      .catch((e: unknown) => addMessage("system", errorText(e)));
  }

  /** Удаляет свою кампанию: все её сохранения и запись в списке. */
  async function deleteCampaign(id: string) {
    try {
      if (isTauriApp()) await invokeTauri("campaign_delete_saves", { campaign: id });
      else {
        setAutosaveCampaign(id);
        await deleteAllSaves();
        setAutosaveCampaign(campaignId);
      }
      await removeCampaign(id);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      if (id === campaignId) switchCampaign(STRANGE_ID);
    } catch (e) {
      setAutosaveCampaign(campaignId);
      addMessage("system", errorText(e));
    }
  }

  /** Окно повышения уровня: лист героя из сохранения своей кампании. */
  async function openLevelUp(id: string) {
    try {
      const spec = await heroSpec(id);
      if (!spec) throw new Error("Лист героя не найден в кампании.");
      setLevelUpSpec(spec);
    } catch (e) {
      addMessage("system", errorText(e));
    }
  }

  /** Повышение уровня: движок проверяет лист нового уровня, мастер описывает, как герой вырос. */
  async function confirmLevelUp(_draft: Draft, spec: HeroSpec) {
    const line = await levelUp(spec);
    setLevelUpSpec(null);
    await refresh();
    addMessage("system", `Повышение уровня — ${line}.`);
    if (masterReady && masterKnown) {
      const message: ChatMessage = {
        id: nextId.current++,
        author: "player",
        text: `[Повышение уровня] ${line}. Коротко опиши, как герой ощущает новую силу, и продолжай сцену.`,
        time: now(),
        hidden: true,
      };
      setMessages((prev) => [...prev, message]);
      request(message);
    }
  }

  /** Новый член отряда: движок проверяет правила и лист, мастер описывает появление спутника. */
  async function confirmCompanion(_draft: Draft, spec: HeroSpec) {
    const id = await addMember(spec, companionMode?.request?.id ?? null);
    setCompanionMode(null);
    await refresh();
    addMessage("system", `${spec.name} вступает в отряд.`);
    setActiveId(id);
    if (masterReady && masterKnown) {
      const message: ChatMessage = {
        id: nextId.current++,
        author: "player",
        text: `[Новый член отряда] В отряд вступил(а) ${spec.name}. Опиши появление спутника в новой сцене, опираясь на предыдущую.`,
        time: now(),
        hidden: true,
      };
      setMessages((prev) => [...prev, message]);
      request(message);
    }
  }

  /** «Эльф · Волшебник 3» по описанию героя (подходит и для импортированного листа). */
  function specSummary(spec: HeroSpec): string {
    const cls = spec.classes.map((c) => `${c.name} ${c.level}`).join(" / ");
    return [spec.species, cls].filter(Boolean).join(" · ");
  }

  async function startNewCampaign(draft: Draft, spec: HeroSpec) {
    const errors = await validateHero(spec);
    if (errors.length > 0) throw new Error(`Движок не принял лист: ${errors.join("; ")}`);
    const tier = TIERS.find((t) => t.id === draft.tier);
    const day = tier?.days ? tier.days[0] + Math.floor(Math.random() * (tier.days[1] - tier.days[0] + 1)) : CURRENT_DAY;
    // Место начала: выбор по предыстории (шаг «Личность») или случайное из подходящих.
    const byBackground = startPlaces(draft.backgroundId);
    const chosenId = draft.picks["start.place"]?.[0];
    const start =
      byBackground.find((p) => p.id === chosenId) ??
      (byBackground.length ? byBackground[Math.floor(Math.random() * byBackground.length)] : null);
    const places = worldLocations();
    const location = start?.location ?? places[Math.floor(Math.random() * places.length)]?.title ?? "Тракт";
    const spot = start ? `${start.spot}, ${location}` : location;
    const id = newCampaignId();
    const title = `Путь героя ${spec.name}`;
    const gold = equipment(draft).gold;
    const summary = specSummary(spec);
    applyCampaign(id);
    await startCampaign(
      { id, title, heroes: [spec] },
      {
        day,
        time: "утро",
        location,
        situation:
          `Начало новой кампании. ${spec.name} (${summary}, предыстория «${spec.background}», мировоззрение «${spec.alignment || "не указано"}») — ${spot}. ` +
          `Тон начальных целей по мировоззрению: ${alignmentTone(spec.alignment)}. ` +
          "Сначала скрытая подготовка командами (игрок её не видит): в слой игрока — запись «Предыстория героя», связанная с событиями начала кампании, и 2–3 начальные цели (new_card goals с заказчиком и шагами); в слой мастера — зацепки, связанные с героем NPC и тайна героя (secret/plan), 1–2 таймера. " +
          "Затем вступление: где герой, что он здесь делает, какие у него цели; опиши место и людей вокруг и спроси, что делает герой. Спутников пока нет.",
        mood: "calm",
      },
      gold,
    ).catch((e: unknown) => {
      applyCampaign(campaignId);
      throw e;
    });
    const info: CampaignInfo = {
      id,
      title,
      createdAt: new Date().toISOString(),
      startDay: day,
      hero: { name: spec.name, summary, portrait: spec.portrait },
    };
    await addCampaign(info).catch(() => undefined);
    setCampaigns((prev) => [info, ...prev.filter((c) => c.id !== id)]);
    setCurrentCampaignId(id);
    setCampaignId(id);
    await setKbCards(kbIndex()).catch(() => undefined);
    nextId.current = 1;
    setMessages([
      {
        id: nextId.current++,
        author: "system",
        text: `Новая кампания: ${title}. День ${day}, ${location}. ${aiAvailable ? WELCOME_APP : ""}`.trim(),
        time: now(),
      },
    ]);
    setRolls([]);
    setActiveId(HERO_PLAYER);
    setCreating(false);
    setOpenWindow(null);
    setHome(false);
    setPlayed(true);
    setFailed(null);
    await refresh();
    setOpening(true);
    autosave();
  }

  function speak(m: ChatMessage) {
    void ttsPlayer.play(m.id, `Мастер · ${m.time}`, m.text, tts);
  }

  /** Продолжить игру из автосохранения. */
  function continueFrom(text: string) {
    let save: ParsedSave;
    try {
      save = parseSave(text);
    } catch (e) {
      addMessage("system", e instanceof Error ? e.message : String(e));
      setOpenWindow(null);
      return;
    }
    import("./lib/engine")
      .then(({ loadState }) => loadState(save.engine))
      .then((report) => loaded(save, report))
      .catch((e: unknown) => {
        addMessage("system", `Автосохранение не загрузилось: ${errorText(e)}`);
        setOpenWindow(null);
      });
  }

  const shown = (id: Tab) => (tab === id ? "flex" : "hidden");

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center justify-between gap-2 border-b border-edge px-3 py-2">
        <div className="flex items-center gap-3">
          <MainMenu onAction={menu} kbFresh={kbFresh} />
          <h1 className="font-serif text-lg text-parchment">DnD Game AI</h1>
        </div>
        <span className="text-right text-xs text-muted">
          {sinceAutosave !== null && (
            <span className="mr-2" title="Автосохранение после каждого хода мастера (5 последних)">
              💾 {sinceAutosave === 0 ? "сохранено" : `${sinceAutosave} ход. назад`}
            </span>
          )}
          v{__APP_VERSION__}
          {isWebBuild ? " · веб" : ""}
        </span>
      </header>
      <MiniPlayer onError={ttsError} />

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
            recruit={recruit}
            recruits={recruits}
            onAddMember={(req) => recruit && setCompanionMode({ maxLevel: recruit.max_level, request: req })}
            onDismissRecruit={(id) => void dismissRecruit(id).then(() => refresh())}
            xp={xp}
            onLevelUp={(id) => void openLevelUp(id)}
          />
        </div>

        <div className={`${shown("dialog")} min-h-0 flex-col lg:flex`}>
          <GoalsStrip
            stamp={party}
            today={party?.scene.day}
            onOpen={(id) => {
              setKbCharacter(null);
              setKbCard(id);
              setOpenWindow("knowledge");
            }}
          />
          <ChatPanel
            masterReady={masterReady}
            messages={messages}
            draft={draft}
            thinking={thinking}
            updating={updating}
            onUpdateRetry={() => updateActions.current?.retry()}
            onUpdateSkip={() => updateActions.current?.skip()}
            masterMode={masterMode}
            model={masterMode === "claude" ? tier : (ai?.model ?? null)}
            modelOptions={masterMode === "claude" ? CLAUDE_TIERS : models}
            onDraftChange={setDraft}
            onSend={send}
            onStop={stop}
            onModelChange={changeModel}
            onOpenModels={() => {
              setSettingsTab("ai");
              setOpenWindow("settings");
            }}
            onOpenDice={() => {
              hideKeyboard();
              setDiceOpen(true);
            }}
            undo={undo}
            onUndo={undoMaster}
            onRetryTurn={retryTurn}
            onSpeak={speak}
            failedId={failed?.playerId ?? null}
            onRetry={retry}
            onOpenLog={() => setOpenWindow("log")}
            proposals={proposals}
            onResolveProposal={(id, accept) => {
              resolveProposal(id, accept)
                .then(() => {
                  addMessage("engine", accept ? "Правка листа принята" : "Правка листа отклонена");
                  return refresh();
                })
                .catch((e: unknown) => addMessage("system", errorText(e)));
            }}
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
            onClick={() => {
              hideKeyboard();
              setTab(t.id);
            }}
            aria-current={tab === t.id ? "page" : undefined}
            className={`py-3 text-sm ${tab === t.id ? "text-gold" : "text-muted"}`}
          >
            {t.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            hideKeyboard();
            setDiceOpen(true);
          }}
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
          key={kbCharacter ?? kbCard ?? "kb"}
          initialCharacterId={kbCharacter}
          initialCardId={kbCard}
          onClose={() => {
            setKbCard(null);
            setOpenWindow(null);
          }}
          onOpenTreasury={() => setOpenWindow("treasury")}
          onChanged={() => {
            refresh().catch(() => undefined);
          }}
        />
      )}
      {openWindow === "load" && (
        <LoadWindow onClose={() => setOpenWindow(null)} onSaveFirst={() => setOpenWindow("save")} onLoaded={(save, report) => loaded(save, report, true)} />
      )}
      {openWindow === "save" && (
        <SaveWindow
          onClose={() => setOpenWindow(null)}
          messages={messages}
          rolls={rolls}
          onSaved={() => void listAutosaves().then(setAutosaves)}
        />
      )}
      {openWindow === "treasury" && (
        <TreasuryWindow
          onClose={() => setOpenWindow(null)}
          onChanged={() => {
            refresh().catch(() => undefined);
          }}
        />
      )}
      {openWindow === "settings" && (
        <SettingsWindow
          initialTab={settingsTab}
          onClose={() => setOpenWindow(null)}
          tts={tts}
          onTtsChange={setTts}
          music={music}
          onMusicChange={setMusic}
          ai={{
            masterMode,
            tier,
            onTierChange: changeModel,
            models,
            onModelsLoaded: setModels,
            onSettingsChange: setAi,
          }}
        />
      )}
      {openWindow === "continue" && (
        <ContinueWindow
          autosaves={autosaves}
          onContinue={continueFrom}
          canStartNew={!played}
          onClose={() => setOpenWindow(null)}
          onNewGame={() => {
            restartDemo()
              .then(async () => {
                nextId.current = 1;
                setMessages(aiAvailable ? [{ id: nextId.current++, author: "system", text: WELCOME_APP, time: now() }] : []);
                setRolls([]);
                setActiveId(STRANGE_PLAYER);
                setOpenWindow(null);
                setHome(false);
                setPlayed(true);
                await refresh();
                setOpening(true);
              })
              .catch((e: unknown) => addMessage("system", errorText(e)));
          }}
        />
      )}
      {creating && <CreationWizard onClose={() => setCreating(false)} onConfirm={startNewCampaign} />}
      {levelUpSpec && (
        <CreationWizard onClose={() => setLevelUpSpec(null)} onConfirm={confirmLevelUp} levelUp={levelUpSpec} />
      )}
      {companionMode && (
        <CreationWizard onClose={() => setCompanionMode(null)} onConfirm={confirmCompanion} companion={companionMode} />
      )}
      {openWindow === "reference" && <ReferenceWindow onClose={() => setOpenWindow(null)} />}
      {openWindow === "log" && <LogWindow onClose={() => setOpenWindow(null)} />}
      {openWindow === "help" && <HelpWindow onClose={() => setOpenWindow(null)} />}
      {home && (
        <HomeScreen
          last={autosaves[0] ?? null}
          inGame={played}
          canExit={canExitApp()}
          onAction={homeAction}
          campaignTitle={campaignId === STRANGE_ID ? "Кампания «Дом Стрэндж»" : (campaigns.find((c) => c.id === campaignId)?.title ?? "Своя кампания")}
          campaigns={campaigns}
          currentCampaign={campaignId}
          onOpenCampaign={(id) => switchCampaign(id)}
          onDeleteCampaign={(id) => void deleteCampaign(id)}
          masterReady={masterReady}
          onConnectMaster={() => {
            setSettingsTab("ai");
            setOpenWindow("settings");
          }}
        />
      )}
    </div>
  );
}
