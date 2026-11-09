// Сохранения кампании «Дом Стрэндж»: продолжить из автосохранения или начать с Дня 82.

import { useState } from "react";
import { listAutosaves, readAutosave, type AutosaveInfo } from "../lib/autosave";
import { errorText } from "../lib/engine";
import Modal from "./Modal";
import SaveList from "./SaveList";

interface ContinueWindowProps {
  autosaves: AutosaveInfo[];
  onContinue: (saveText: string) => void;
  onNewGame: () => void;
  onClose: () => void;
  /** Начать с Дня 82 можно, только пока игра в этом запуске не начата. */
  canStartNew: boolean;
}

export default function ContinueWindow({ autosaves: initial, onContinue, onNewGame, onClose, canStartNew }: ContinueWindowProps) {
  const [autosaves, setAutosaves] = useState<AutosaveInfo[]>(initial);
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
    <Modal title="Кампания «Дом Стрэндж»" onClose={onClose} size="md">
      <div className="space-y-3 p-4 text-sm">
        <SaveList
          saves={autosaves}
          busy={busy}
          onPick={pick}
          onChanged={() => void listAutosaves().then(setAutosaves)}
          highlightFirst
        />
        {error && <p className="text-fumble">{error}</p>}
        {canStartNew ? (
          <button type="button" onClick={onNewGame} className="w-full rounded-md border border-edge px-3 py-2 hover:border-gold">
            Начать с Дня 82
          </button>
        ) : (
          <p className="text-xs text-muted">Чтобы начать заново с Дня 82, перезапустите приложение.</p>
        )}
      </div>
    </Modal>
  );
}
