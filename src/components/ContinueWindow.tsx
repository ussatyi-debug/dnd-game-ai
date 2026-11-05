// Окно при запуске: продолжить из автосохранения или начать новую игру с Дня 82.

import { useState } from "react";
import { ago, readAutosave, type AutosaveInfo } from "../lib/autosave";
import { errorText } from "../lib/engine";
import Modal from "./Modal";

interface ContinueWindowProps {
  autosaves: AutosaveInfo[];
  onContinue: (saveText: string) => void;
  onNewGame: () => void;
}

export default function ContinueWindow({ autosaves, onContinue, onNewGame }: ContinueWindowProps) {
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function pick(slot: number) {
    setBusy(slot);
    setError(null);
    readAutosave(slot)
      .then(onContinue)
      .catch((e: unknown) => setError(errorText(e)))
      .finally(() => setBusy(null));
  }

  return (
    <Modal title="Продолжить игру" onClose={onNewGame} size="md">
      <div className="space-y-3 p-4 text-sm">
        <ul className="space-y-2">
          {autosaves.map((a, i) => (
            <li key={a.slot}>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => pick(a.slot)}
                className={`w-full rounded-lg border p-3 text-left hover:border-gold ${i === 0 ? "border-gold/70 bg-gold/5" : "border-edge"}`}
              >
                <div className="font-medium">
                  {i === 0 ? "Продолжить: " : ""}День {a.day ?? "?"}
                  {a.location ? `, ${a.location}` : ""}
                </div>
                <div className="text-xs text-muted">
                  {busy === a.slot ? "Загружаю…" : `автосохранение, ${ago(a.savedAt)}`}
                </div>
              </button>
            </li>
          ))}
        </ul>
        {error && <p className="text-fumble">{error}</p>}
        <button type="button" onClick={onNewGame} className="w-full rounded-md border border-edge px-3 py-2 hover:border-gold">
          Новая игра с Дня 82
        </button>
      </div>
    </Modal>
  );
}
