import { useCallback, useEffect, useRef, useState } from "react";
import DicePanel from "./components/DicePanel";
import RollLog, { toneClass, type LogEntry, type LogTone } from "./components/RollLog";
import {
  errorText,
  isEngineAvailable,
  isWebBuild,
  luckyStatus,
  type ResourcePool,
} from "./lib/engine";

const MAX_LOG_ENTRIES = 200;

export default function App() {
  const engineAvailable = isEngineAvailable();
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [lucky, setLucky] = useState<ResourcePool | null>(null);
  const nextId = useRef(1);

  const log = useCallback((title: string, detail: string, tone: LogTone) => {
    const entry: LogEntry = {
      id: nextId.current++,
      time: new Date().toLocaleTimeString("ru-RU"),
      title,
      detail,
      tone,
    };
    setEntries((prev) => [entry, ...prev].slice(0, MAX_LOG_ENTRIES));
  }, []);

  useEffect(() => {
    if (!engineAvailable) return;
    luckyStatus()
      .then(setLucky)
      .catch((error: unknown) => log("Движок", errorText(error), "error"));
  }, [engineAvailable, log]);

  const latest = entries[0];

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col gap-4 p-4 pb-28 lg:pb-4">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-serif text-2xl text-parchment">DnD Game AI</h1>
        <span className="text-sm text-muted">
          Движок бросков · v{__APP_VERSION__}
          {isWebBuild ? " · веб-версия" : ""}
        </span>
      </header>

      {!engineAvailable && (
        <p role="alert" className="rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-sm">
          Броски выполняет движок на Rust внутри приложения. Запустите программу через{" "}
          <code className="font-mono">npm run tauri dev</code> или установленный файл приложения.
        </p>
      )}

      <main className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <DicePanel enabled={engineAvailable} lucky={lucky} onLuckyChange={setLucky} onLog={log} />
        <RollLog entries={entries} onClear={() => setEntries([])} />
      </main>

      {latest && (
        <div
          aria-live="polite"
          className="fixed inset-x-3 bottom-3 overflow-hidden rounded-xl bg-panel shadow-lg shadow-black/60 lg:hidden"
        >
          <div className={`border-l-4 px-4 py-3 ${toneClass[latest.tone]}`}>
            <div className="text-sm text-muted">{latest.title}</div>
            <div className="font-mono text-base break-words">{latest.detail}</div>
          </div>
        </div>
      )}
    </div>
  );
}
