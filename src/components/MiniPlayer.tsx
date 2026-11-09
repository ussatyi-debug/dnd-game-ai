// Мини-плеер озвучки вверху экрана: пауза/продолжить, стоп, заново.

import { useEffect, useState } from "react";
import { ttsPlayer, type TtsState } from "../lib/tts";

export default function MiniPlayer({ onError }: { onError: (text: string) => void }) {
  const [state, setState] = useState<TtsState | null>(null);

  useEffect(() => ttsPlayer.subscribe(setState), []);
  useEffect(() => {
    if (state?.error) onError(state.error);
  }, [state?.error, onError]);

  if (!state || state.status === "idle") return null;
  const paused = state.status === "paused";
  const button = "flex h-8 w-8 items-center justify-center rounded-full border border-gold/60 text-gold hover:bg-gold/10";

  return (
    <div
      role="region"
      aria-label="Озвучка"
      className="flex items-center gap-2 border-b border-gold/40 bg-panel px-3 py-1.5 text-sm"
    >
      <button
        type="button"
        onClick={() => (paused ? ttsPlayer.resume() : ttsPlayer.pause())}
        aria-label={paused ? "Продолжить" : "Пауза"}
        className={button}
      >
        {paused ? "▶" : "⏸"}
      </button>
      <button type="button" onClick={() => ttsPlayer.stop()} aria-label="Стоп" className={button}>
        ⏹
      </button>
      <button type="button" onClick={() => ttsPlayer.restart()} aria-label="Заново" className={button}>
        ⟲
      </button>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs text-parchment">{state.label}</div>
        <div className="text-[11px] text-muted">
          {state.status === "loading" && state.index === 0
            ? state.engine === "piper"
              ? "Готовлю голос…"
              : "Готовлю…"
            : `фраза ${state.index + 1} из ${state.total}`}
          {paused ? " · пауза" : ""}
          {state.engine === "system" || state.engine === "android" ? " · системный голос" : ""}
        </div>
      </div>
    </div>
  );
}
