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
import { CLAUDE_TIERS, type ClaudeTier } from "../lib/claude";
import type { MasterMode } from "./ChatPanel";
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
  local: {
    short: "Локальная",
    keyPlaceholder: "",
    keyNote: "",
    filter: "",
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
  const available = isAiAvailable();
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
    if (!available) return;
    aiSettings()
      .then((next) => {
        setSettings(next);
        setTab(next.provider);
      })
      .catch((e: unknown) => setError(errorText(e)));
  }, [available]);

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
      setStatus(`Ключ сохранён, доступно моделей: ${list.length}`);
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
      {!available && masterMode === "claude" ? (
        <div className="space-y-4 p-4 text-sm">
          <p>
            В этой версии мастера ведёт <span className="text-gold">Claude</span> — от аккаунта, в котором открыта
            страница. Ключи не нужны; при первой заявке Claude попросит разрешение, а запросы расходуют лимиты
            вашего аккаунта Claude.
          </p>
          <ul className="space-y-1.5">
            {CLAUDE_TIERS.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => onTierChange(t.id)}
                  aria-pressed={tier === t.id}
                  className={`w-full rounded-lg border px-3 py-2 text-left ${
                    tier === t.id ? "border-gold bg-gold/10" : "border-edge hover:border-gold/50"
                  }`}
                >
                  <span className="block font-medium">{t.name}</span>
                  <span className="block text-xs text-muted">{t.hint}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted">
            Модель можно сменить и прямо в шапке диалога — контекст сцены сохраняется. В приложении для ПК
            доступны Gemini и ChatGPT со своим ключом, позже — локальная модель.
          </p>
        </div>
      ) : !available ? (
        <div className="space-y-3 p-4 text-sm">
          <p>Мастер недоступен в этом окне.</p>
          <p className="text-muted">
            Откройте страницу внутри Claude — тогда мастера поведёт Claude, — или запустите приложение для ПК с
            Gemini или ChatGPT. Лоток, отряд, казна и база знаний работают и здесь.
          </p>
        </div>
      ) : (
        <div className="space-y-5 p-4">
          <section className="space-y-2">
            <h3 className="font-medium">Провайдер</h3>
            <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Провайдер ИИ">
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
                        : p.has_key
                          ? `ключ ${p.key_hint}`
                          : "нет ключа"}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {providerView && !providerView.ready ? (
            <section className="space-y-2 rounded-lg border border-edge p-3 text-sm">
              <p className="font-medium">Локальная модель — в разработке</p>
              <p className="text-muted">
                Мастер будет работать на этом ПК через Ollama, без интернета и без оплаты: модель уровня Qwen3 14B
                или Gemma 3 12B на видеокарте RTX 5070. Подключение появится в одной из следующих версий; сейчас
                выберите Gemini или ChatGPT.
              </p>
            </section>
          ) : (
          <>
          <form onSubmit={saveKey} className="space-y-2">
            <h3 className="font-medium">API-ключ {providerView?.label ?? ""}</h3>
            <div className="flex gap-2">
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder={providerView?.has_key ? `Ввести новый ключ (сейчас ${providerView.key_hint})` : info.keyPlaceholder}
                aria-label={`API-ключ ${providerView?.label ?? ""}`}
                autoComplete="off"
                className="min-w-0 flex-1 rounded-md border border-edge bg-ink px-3 py-2 text-parchment placeholder:text-muted/70 focus:border-gold focus:outline-none"
              />
              <button
                type="submit"
                disabled={busy || key.trim() === ""}
                className="rounded-md bg-blood px-4 py-2 text-parchment disabled:opacity-40"
              >
                Сохранить
              </button>
            </div>
            <p className="text-xs text-muted">
              Ключ хранится в папке настроек приложения на этом ПК и не передаётся на телефон. {info.keyNote}
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
          </>
          )}

          {status && <p className="text-sm text-crit">{status}</p>}
          {error && <p className="text-sm text-fumble">{error}</p>}
        </div>
      )}
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
