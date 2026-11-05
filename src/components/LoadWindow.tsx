// Загрузка сохранения из файла или из буфера (вставкой текста).
//
// Файл проверяется до замены игры: если он не подходит, текущая игра не меняется.
// Из файла берётся только то, что меняется в игре; постоянная часть листа — из приложения
// (это делает движок и сообщает, что дополнено).

import { useState } from "react";
import { errorText, loadState, type LoadReport } from "../lib/engine";
import type { TrayRoll } from "../lib/rolls";
import type { ChatMessage } from "./ChatPanel";
import Modal from "./Modal";

/** Разобранный файл сохранения. */
export interface ParsedSave {
  appVersion: string;
  savedAt: string | null;
  engine: unknown;
  day: number | null;
  location: string;
  chat: ChatMessage[];
  rolls: TrayRoll[];
}

const AUTHORS = new Set(["player", "master", "system", "engine"]);

function isChatMessage(m: unknown): m is ChatMessage {
  if (typeof m !== "object" || m === null) return false;
  const x = m as Record<string, unknown>;
  return (
    typeof x.id === "number" &&
    typeof x.text === "string" &&
    typeof x.time === "string" &&
    typeof x.author === "string" &&
    AUTHORS.has(x.author)
  );
}

function isRoll(r: unknown): r is TrayRoll {
  if (typeof r !== "object" || r === null) return false;
  const x = r as Record<string, unknown>;
  return typeof x.id === "number" && typeof x.time === "string";
}

/** Разбор текста файла. Ошибка — понятная игроку причина. */
export function parseSave(text: string): ParsedSave {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Это не файл сохранения: текст не в формате JSON.");
  }
  if (typeof data !== "object" || data === null) throw new Error("Это не файл сохранения.");
  const root = data as Record<string, unknown>;
  if (root.app !== "dnd-game-ai" || typeof root.engine !== "object" || root.engine === null) {
    throw new Error("Это не сохранение DnD Game AI.");
  }
  const engine = root.engine as Record<string, unknown>;
  const scene = (engine.scene ?? {}) as Record<string, unknown>;
  const ui = (root.ui ?? {}) as Record<string, unknown>;
  const chat = Array.isArray(ui.chat) ? ui.chat.filter(isChatMessage) : [];
  const rolls = Array.isArray(ui.rolls) ? ui.rolls.filter(isRoll) : [];
  return {
    appVersion: typeof root.app_version === "string" ? root.app_version : "?",
    savedAt: typeof root.saved_at === "string" ? root.saved_at : null,
    engine,
    day: typeof scene.day === "number" ? scene.day : null,
    location: typeof scene.location === "string" ? scene.location : "",
    chat,
    rolls,
  };
}

interface LoadWindowProps {
  onClose: () => void;
  /** Открыть выгрузку текущей игры перед загрузкой. */
  onSaveFirst: () => void;
  onLoaded: (save: ParsedSave, report: LoadReport) => void;
}

export default function LoadWindow({ onClose, onSaveFirst, onLoaded }: LoadWindowProps) {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedSave | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function check(raw: string) {
    setError(null);
    setParsed(null);
    if (!raw.trim()) return;
    try {
      setParsed(parseSave(raw));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  function pickFile(event: { target: HTMLInputElement }) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    file
      .text()
      .then((content) => {
        setText(content);
        check(content);
      })
      .catch(() => setError("Не удалось прочитать файл."));
  }

  function load() {
    if (!parsed) return;
    setBusy(true);
    setError(null);
    loadState(parsed.engine)
      .then((report) => onLoaded(parsed, report))
      .catch((e: unknown) => setError(errorText(e)))
      .finally(() => setBusy(false));
  }

  const savedAt = parsed?.savedAt ? new Date(parsed.savedAt).toLocaleString("ru-RU") : null;

  return (
    <Modal title="Загрузить сохранение" onClose={onClose} size="md">
      <div className="space-y-3 p-4 text-sm">
        <label className="block">
          <span className="mb-1 block text-muted">Файл сохранения (.json)</span>
          <input
            type="file"
            accept=".json,application/json,text/plain"
            onChange={pickFile}
            className="block w-full text-sm file:mr-3 file:rounded-md file:border file:border-gold file:bg-transparent file:px-3 file:py-1.5 file:text-gold"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-muted">или вставьте текст сохранения из буфера</span>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              check(e.target.value);
            }}
            rows={4}
            placeholder='{"app": "dnd-game-ai", ...}'
            className="w-full rounded-md border border-edge bg-ink px-3 py-2 font-mono text-xs text-parchment placeholder:text-muted/60 focus:border-gold focus:outline-none"
          />
        </label>

        {error && <p className="text-fumble">{error}</p>}

        {parsed && (
          <div className="space-y-2 rounded-lg border border-gold/50 bg-gold/5 p-3">
            <p>
              День {parsed.day ?? "?"}
              {parsed.location ? ` · ${parsed.location}` : ""}
            </p>
            <p className="text-xs text-muted">
              Версия {parsed.appVersion}
              {savedAt ? ` · сохранено ${savedAt}` : ""} · сообщений в чате: {parsed.chat.length}, бросков:{" "}
              {parsed.rolls.length}
            </p>
            <p className="text-xs">
              Текущая игра будет заменена. Из файла берётся то, что меняется в игре; постоянная часть
              листа (владения, навыки, атаки, умения) — из этой версии приложения.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={onSaveFirst}
                className="rounded-md border border-edge px-3 py-2 hover:border-gold"
              >
                Сначала выгрузить текущую
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={load}
                className="rounded-md bg-blood px-4 py-2 text-parchment hover:bg-blood/80 disabled:opacity-50"
              >
                {busy ? "Загружаю…" : "Загрузить"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
