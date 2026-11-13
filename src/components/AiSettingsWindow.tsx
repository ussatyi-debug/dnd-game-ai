import { useEffect, useState, type FormEvent } from "react";
import {
  aiListModels,
  aiSelectModel,
  aiSetKey,
  aiSettings,
  errorText,
  isAiAvailable,
  type AiSettingsView,
  type ModelInfo,
  type Provider,
} from "../lib/engine";
import { insideClaude, webAiUseClaude } from "../lib/browserAi";
import { CLAUDE_TIERS, type ClaudeTier } from "../lib/claude";
import type { MasterMode } from "./ChatPanel";
import {
  HISTORY_TURNS_MAX,
  HISTORY_TURNS_MIN,
  historyTurns,
  MASTER_ENGINE_LABEL,
  setHistoryTurns,
  setShortSheet,
  setSkipEmptyUpdate,
  shortSheet,
  skipEmptyUpdate,
  setTwoStep,
  twoStepFor,
  type MasterEngine,
} from "../lib/masterPrefs";
import Modal from "./Modal";

export interface AiSettingsWindowProps {
  onClose: () => void;
  masterMode: MasterMode;
  tier: ClaudeTier;
  onTierChange: (tier: ClaudeTier) => void;
  models: ModelInfo[];
  onModelsLoaded: (models: ModelInfo[]) => void;
  onSettingsChange: (settings: AiSettingsView) => void;
  /** Без своего окна — внутри окна «Настройки». */
  embedded?: boolean;
}

/** Подсказки по провайдерам: где взять ключ и что важно знать. */
const PROVIDER_INFO: Record<Provider, { short: string; keyPlaceholder: string; keyNote: string; filter: string }> = {
  gemini: {
    short: "Gemini",
    keyPlaceholder: "Ключ из Google AI Studio (aistudio.google.com)",
    keyNote:
      "На бесплатном тарифе Google может использовать тексты запросов для улучшения своих моделей. Если квота бесплатного тарифа равна нулю, нужна оплата в AI Studio.",
    filter: "Фильтр: flash, pro…",
  },
  openai: {
    short: "ChatGPT",
    keyPlaceholder: "Ключ sk-… из platform.openai.com → API keys",
    keyNote:
      "Запросы расходуют кредиты аккаунта OpenAI. Для игры хватит быстрых моделей с «mini» в названии; крупные модели пишут лучше, но дороже.",
    filter: "Фильтр: mini, gpt-5…",
  },
  yandex: {
    short: "YandexGPT",
    keyPlaceholder: "ID каталога и API-ключ через пробел: b1g… AQVN…",
    keyNote:
      "Ключ сервисного аккаунта Yandex Cloud с ролью ai.languageModels.user и ID каталога (консоль Yandex Cloud → каталог → «Обзор»). Запросы расходуют баланс Yandex Cloud.",
    filter: "Фильтр: yandexgpt, lite…",
  },
  local: {
    short: "Локальная",
    keyPlaceholder: "http://localhost:11434 или http://192.168.1.25:11434",
    keyNote:
      "Ollama слушает порт 11434. На этом ПК — http://localhost:11434. С телефона или другого устройства — http://IP_ПК:11434 (IP — строка «IPv4-адрес» в ipconfig на ПК). На ПК с Ollama нужны переменная OLLAMA_HOST=0.0.0.0 (и перезапуск Ollama) и разрешение порта 11434 в брандмауэре. Проверка с телефона: открыть адрес в браузере — должно быть «Ollama is running».",
    filter: "Фильтр: qwen, gemma…",
  },
};

export default function AiSettingsWindow({
  onClose,
  masterMode,
  tier,
  onTierChange,
  models,
  onModelsLoaded,
  onSettingsChange,
  embedded = false,
}: AiSettingsWindowProps) {
  /** Приложение (ключи на стороне Rust) или веб-версия (ключи в браузере). */
  const app = isAiAvailable();
  const [settings, setSettings] = useState<AiSettingsView | null>(null);
  const [key, setKey] = useState("");
  const [filter, setFilter] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Provider>("gemini");
  // Списки моделей по провайдерам; список активного провайдера приходит от родителя.
  const [lists, setLists] = useState<Partial<Record<Provider, ModelInfo[]>>>({});

  useEffect(() => {
    aiSettings()
      .then((next) => {
        setSettings(next);
        setTab(next.provider);
      })
      .catch((e: unknown) => setError(errorText(e)));
  }, []);

  const providerView = settings?.providers.find((p) => p.provider === tab) ?? null;
  const info = PROVIDER_INFO[tab];
  const tabModels = lists[tab] ?? (settings?.provider === tab ? models : []);

  function setTabModels(provider: Provider, list: ModelInfo[]) {
    setLists((prev) => ({ ...prev, [provider]: list }));
    if (settings?.provider === provider) onModelsLoaded(list);
  }

  function apply(next: AiSettingsView) {
    setSettings(next);
    onSettingsChange(next);
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      await action();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  function saveKey(event: FormEvent) {
    event.preventDefault();
    const provider = tab;
    void run(async () => {
      apply(await aiSetKey(provider, key));
      setKey("");
      const list = await aiListModels(provider);
      setTabModels(provider, list);
      setStatus(
        provider === "local"
          ? `Связь с Ollama есть, установлено моделей: ${list.length}`
          : `Ключ сохранён, доступно моделей: ${list.length}`,
      );
    });
  }

  function loadModels() {
    const provider = tab;
    void run(async () => {
      const list = await aiListModels(provider);
      setTabModels(provider, list);
      setStatus(`Доступно моделей: ${list.length}`);
    });
  }

  function select(model: string) {
    const provider = tab;
    void run(async () => {
      apply(await aiSelectModel(provider, model));
      onModelsLoaded(tabModels);
      setStatus(`Мастера ведёт ${PROVIDER_INFO[provider].short} · ${model} — следующий ответ даст она`);
    });
  }

  const visible = tabModels.filter((m) =>
    `${m.name} ${m.id}`.toLowerCase().includes(filter.trim().toLowerCase()),
  );

  const body = (
    <>
      {!app && insideClaude() && (
        <div className="space-y-3 border-b border-edge p-4 text-sm">
          <p>
            Внутри Claude мастера может вести <span className="text-gold">Claude</span> — от аккаунта, в котором
            открыта страница, без ключей. Модели со своим ключом (ниже) отсюда недоступны: страница внутри Claude не
            может обращаться к другим сайтам. Они работают в веб-версии, открытой отдельной вкладкой, и в приложениях.
          </p>
          <ul className="space-y-1.5">
            {CLAUDE_TIERS.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => {
                    apply(webAiUseClaude());
                    onTierChange(t.id);
                  }}
                  aria-pressed={masterMode === "claude" && tier === t.id}
                  className={`w-full rounded-lg border px-3 py-2 text-left ${
                    masterMode === "claude" && tier === t.id ? "border-gold bg-gold/10" : "border-edge hover:border-gold/50"
                  }`}
                >
                  <span className="block font-medium">{t.name}</span>
                  <span className="block text-xs text-muted">{t.hint}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="space-y-5 p-4">
          <section className="space-y-2">
            <h3 className="font-medium">Провайдер</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="tablist" aria-label="Провайдер ИИ">
              {(settings?.providers ?? []).map((p) => (
                <button
                  key={p.provider}
                  type="button"
                  role="tab"
                  aria-selected={tab === p.provider}
                  onClick={() => {
                    setTab(p.provider);
                    setFilter("");
                    setStatus(null);
                    setError(null);
                  }}
                  className={`rounded-lg border px-2 py-2 text-left text-sm ${
                    tab === p.provider ? "border-gold bg-gold/10" : "border-edge hover:border-gold/50"
                  }`}
                >
                  <span className="block font-medium">{PROVIDER_INFO[p.provider].short}</span>
                  <span className="block text-[11px] text-muted">
                    {!p.ready
                      ? "скоро"
                      : settings?.provider === p.provider
                        ? "ведёт мастера"
                        : p.provider === "local"
                          ? "Ollama"
                          : p.has_key
                            ? `ключ ${p.key_hint}`
                            : "нет ключа"}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <form onSubmit={saveKey} className="space-y-2">
            <h3 className="font-medium">
              {tab === "local" ? "Адрес сервера Ollama" : `API-ключ ${providerView?.label ?? ""}`}
            </h3>
            <div className="flex gap-2">
              <input
                type={tab === "local" ? "text" : "password"}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder={
                  tab === "local"
                    ? `Сейчас ${providerView?.key_hint ?? "http://localhost:11434"}`
                    : providerView?.has_key
                      ? `Ввести новый ключ (сейчас ${providerView.key_hint})`
                      : info.keyPlaceholder
                }
                aria-label={tab === "local" ? "Адрес сервера Ollama" : `API-ключ ${providerView?.label ?? ""}`}
                autoComplete="off"
                className="min-w-0 flex-1 rounded-md border border-edge bg-ink px-3 py-2 text-parchment placeholder:text-muted/70 focus:border-gold focus:outline-none"
              />
              <button
                type="submit"
                disabled={busy || (key.trim() === "" && tab !== "local")}
                className="rounded-md bg-blood px-4 py-2 text-parchment disabled:opacity-40"
              >
                {tab === "local" ? "Проверить связь" : "Сохранить"}
              </button>
            </div>
            <p className="text-xs text-muted">
              {tab === "local"
                ? "Пустое поле — Ollama на этом ПК. "
                : app
                  ? "Ключ хранится в папке настроек приложения на этом устройстве. "
                  : "Ключ хранится только в этом браузере и уходит только в API провайдера. "}
              {info.keyNote}
            </p>
          </form>

          <section className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-medium">Модель</h3>
              <button
                type="button"
                onClick={loadModels}
                disabled={busy || !providerView?.has_key}
                className="rounded-md border border-edge px-3 py-1.5 text-sm hover:border-gold disabled:opacity-40"
              >
                Обновить список
              </button>
            </div>
            {tabModels.length > 0 && (
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder={info.filter}
                aria-label="Фильтр моделей"
                className="w-full rounded-md border border-edge bg-ink px-3 py-2 text-sm text-parchment placeholder:text-muted/70"
              />
            )}
            <ul className="max-h-80 space-y-1.5 overflow-y-auto">
              {visible.map((m) => {
                const active = settings?.provider === tab && settings.model === m.id;
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => select(m.id)}
                      disabled={busy}
                      aria-pressed={active}
                      className={`w-full rounded-lg border px-3 py-2 text-left ${
                        active ? "border-gold bg-gold/10" : "border-edge hover:border-gold/50"
                      }`}
                    >
                      <span className="block text-sm font-medium">{m.name}</span>
                      <span className="block font-mono text-[11px] text-muted">{m.id}</span>
                      {m.description && (
                        <span className="mt-0.5 line-clamp-2 block text-xs text-muted">{m.description}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            {providerView?.has_key && tabModels.length === 0 && (
              <p className="text-sm text-muted">Нажмите «Обновить список», чтобы загрузить модели.</p>
            )}
          </section>

          <TurnSettings engine={masterMode === "claude" ? "claude" : (settings?.provider ?? null)} />

          {status && <p className="text-sm text-crit">{status}</p>}
          {error && <p className="text-sm text-fumble">{error}</p>}
        </div>
    </>
  );
  return embedded ? (
    body
  ) : (
    <Modal title="Модели ИИ" onClose={onClose} size="lg">
      {body}
    </Modal>
  );
}

/** Ход мастера: двухшаговый ход для текущего мастера и длина истории диалога. */
function TurnSettings({ engine }: { engine: MasterEngine | null }) {
  const [, rerender] = useState(0);
  const [turns, setTurns] = useState(historyTurns);
  return (
    <section className="space-y-3 border-t border-edge pt-4">
      <h3 className="font-medium">Ход мастера</h3>
      {engine && (
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={twoStepFor(engine)}
            onChange={(e) => {
              setTwoStep(engine, e.target.checked);
              rerender((n) => n + 1);
            }}
          />
          <span>
            Двухшаговый ход ({MASTER_ENGINE_LABEL[engine]})
            <span className="block text-xs text-muted">
              Сначала мастер рассказывает сцену — вы видите её сразу, — затем отдельным запросом движок обновляет хиты,
              предметы и записи по рассказу. Слабым и локальным моделям так проще; ход идёт немного дольше.
            </span>
          </span>
        </label>
      )}
      <label className="block text-sm">
        История для мастера: последние {turns} заявок
        <input
          type="range"
          min={HISTORY_TURNS_MIN}
          max={HISTORY_TURNS_MAX}
          value={turns}
          onChange={(e) => {
            const n = Number(e.target.value);
            setTurns(n);
            setHistoryTurns(n);
          }}
          className="mt-1 block w-full accent-gold"
        />
        <span className="block text-xs text-muted">
          Раньше идущий диалог мастеру заменяет хроника по дням. Меньше — быстрее и надёжнее для моделей с маленьким
          окном; в чате ничего не пропадает. Последние четыре хода уходят целиком, более ранние ответы мастера —
          первыми фразами.
        </span>
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={skipEmptyUpdate()}
          onChange={(e) => {
            setSkipEmptyUpdate(e.target.checked);
            rerender((n) => n + 1);
          }}
        />
        <span>
          Пропускать второй шаг без изменений <span className="text-gold">(для сильных моделей)</span>
          <span className="block text-xs text-muted">
            Если мастер пометил ход как разговор без изменений, движок не делает второй запрос — ход дешевле и быстрее.
            Слабая модель может поставить пометку по ошибке, и тогда изменения хода потеряются.
          </span>
        </span>
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={shortSheet()}
          onChange={(e) => {
            setShortSheet(e.target.checked);
            rerender((n) => n + 1);
          }}
        />
        <span>
          Короткий лист в снимке <span className="text-gold">(для сильных моделей)</span>
          <span className="block text-xs text-muted">
            Описания умений и заклинаний уходят мастеру только для того, что названо в заявке; остальное — одними
            названиями. Запрос короче, но за подробностями мастер должен сам обращаться к движку.
          </span>
        </span>
      </label>
    </section>
  );
}
