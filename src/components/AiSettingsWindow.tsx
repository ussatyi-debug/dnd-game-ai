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
} from "../lib/engine";
import Modal from "./Modal";

interface AiSettingsWindowProps {
  onClose: () => void;
  models: ModelInfo[];
  onModelsLoaded: (models: ModelInfo[]) => void;
  onSettingsChange: (settings: AiSettingsView) => void;
}

export default function AiSettingsWindow({
  onClose,
  models,
  onModelsLoaded,
  onSettingsChange,
}: AiSettingsWindowProps) {
  const available = isAiAvailable();
  const [settings, setSettings] = useState<AiSettingsView | null>(null);
  const [key, setKey] = useState("");
  const [filter, setFilter] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!available) return;
    aiSettings()
      .then(setSettings)
      .catch((e: unknown) => setError(errorText(e)));
  }, [available]);

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
    void run(async () => {
      apply(await aiSetKey("gemini", key));
      setKey("");
      const list = await aiListModels("gemini");
      onModelsLoaded(list);
      setStatus(`Ключ сохранён, доступно моделей: ${list.length}`);
    });
  }

  function loadModels() {
    void run(async () => {
      const list = await aiListModels("gemini");
      onModelsLoaded(list);
      setStatus(`Доступно моделей: ${list.length}`);
    });
  }

  function select(model: string) {
    void run(async () => {
      apply(await aiSelectModel("gemini", model));
      setStatus("Модель выбрана — следующий ответ мастера даст она");
    });
  }

  const visible = models.filter((m) =>
    `${m.name} ${m.id}`.toLowerCase().includes(filter.trim().toLowerCase()),
  );

  return (
    <Modal title="Модели ИИ" onClose={onClose} size="lg">
      {!available ? (
        <div className="space-y-3 p-4 text-sm">
          <p>ИИ-мастер работает в приложении для ПК: запросы к модели и API-ключ остаются на компьютере.</p>
          <p className="text-muted">
            В веб-версии браузер не даёт странице обращаться к внешним сервисам, поэтому здесь модели
            недоступны. Лоток, отряд, казна и база знаний работают.
          </p>
        </div>
      ) : (
        <div className="space-y-5 p-4">
          <section className="space-y-2">
            <h3 className="font-medium">Провайдер</h3>
            <div className="rounded-lg border border-gold/50 bg-gold/5 px-3 py-2 text-sm">
              Google Gemini{" "}
              <span className="text-muted">
                · ключ {settings?.has_key ? `сохранён (${settings.key_hint})` : "не задан"}
              </span>
            </div>
            <p className="text-xs text-muted">
              Остальные провайдеры (локальная модель Ollama, DeepSeek, ChatGPT) подключаются по той же схеме
              следующими шагами.
            </p>
          </section>

          <form onSubmit={saveKey} className="space-y-2">
            <h3 className="font-medium">API-ключ Gemini</h3>
            <div className="flex gap-2">
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder={settings?.has_key ? "Ввести новый ключ" : "Вставьте ключ из Google AI Studio"}
                aria-label="API-ключ Gemini"
                autoComplete="off"
                className="flex-1 rounded-md border border-edge bg-ink px-3 py-2 text-parchment placeholder:text-muted/70 focus:border-gold focus:outline-none"
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
              Ключ хранится в папке настроек приложения на этом ПК и не передаётся на телефон. На бесплатном
              тарифе Google может использовать тексты запросов для улучшения своих моделей.
            </p>
          </form>

          <section className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-medium">Модель</h3>
              <button
                type="button"
                onClick={loadModels}
                disabled={busy || !settings?.has_key}
                className="rounded-md border border-edge px-3 py-1.5 text-sm hover:border-gold disabled:opacity-40"
              >
                Обновить список
              </button>
            </div>
            {models.length > 0 && (
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Фильтр: flash, pro…"
                aria-label="Фильтр моделей"
                className="w-full rounded-md border border-edge bg-ink px-3 py-2 text-sm text-parchment placeholder:text-muted/70"
              />
            )}
            <ul className="max-h-80 space-y-1.5 overflow-y-auto">
              {visible.map((m) => {
                const active = settings?.model === m.id;
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
            {settings?.has_key && models.length === 0 && (
              <p className="text-sm text-muted">Нажмите «Обновить список», чтобы загрузить модели.</p>
            )}
          </section>

          {status && <p className="text-sm text-crit">{status}</p>}
          {error && <p className="text-sm text-fumble">{error}</p>}
        </div>
      )}
    </Modal>
  );
}
