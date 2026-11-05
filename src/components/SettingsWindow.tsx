// Окно «Настройки»: озвучка и ИИ-мастер.

import { useEffect, useState } from "react";
import {
  DEFAULT_CHARACTERS,
  DEFAULT_PRONUNCIATIONS,
  preview,
  saveTtsSettings,
  ttsPlayer,
  type Gender,
  type TtsSettings,
} from "../lib/tts";
import AiSettingsWindow, { type AiSettingsWindowProps } from "./AiSettingsWindow";
import Modal from "./Modal";

export type SettingsTab = "tts" | "ai";

type AiProps = Omit<AiSettingsWindowProps, "embedded" | "onClose">;

interface SettingsWindowProps {
  initialTab: SettingsTab;
  onClose: () => void;
  tts: TtsSettings;
  onTtsChange: (settings: TtsSettings) => void;
  ai: AiProps;
}

const input =
  "rounded-md border border-edge bg-ink px-2 py-1.5 text-sm text-parchment placeholder:text-muted/70 focus:border-gold focus:outline-none";

function TtsSettingsPanel({ tts, onChange }: { tts: TtsSettings; onChange: (s: TtsSettings) => void }) {
  const [engine, setEngine] = useState<"piper" | "system" | null | undefined>(undefined);
  useEffect(() => {
    void ttsPlayer.engine().then(setEngine);
  }, []);
  const update = (patch: Partial<TtsSettings>) => onChange({ ...tts, ...patch });

  return (
    <div className="space-y-5 p-4 text-sm">
      <p className="text-xs text-muted">
        {engine === undefined
          ? "Проверяю голоса…"
          : engine === "piper"
            ? "Голоса Piper (Дима и Ира) установлены вместе с приложением и работают без интернета."
            : engine === "system"
              ? "Голоса Piper в этой версии недоступны (веб-версия внутри Claude не может запускать модели) — читает системный голос устройства."
              : "Озвучка недоступна: на устройстве нет голосов."}
      </p>

      <section className="space-y-2">
        <h3 className="font-serif text-gold">Голоса</h3>
        <p className="text-xs text-muted">
          Реплики («&gt; — …») читаются голосом по полу говорящего: мужские — Дима, женские — Ира.
        </p>
        <label className="flex items-center justify-between gap-2">
          <span>Повествование</span>
          <select
            value={tts.narrator}
            onChange={(e) => update({ narrator: e.target.value as Gender })}
            className={input}
          >
            <option value="m">Дима (мужской)</option>
            <option value="f">Ира (женский)</option>
          </select>
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={() => preview("m", tts)} className="rounded-md border border-edge px-3 py-1.5 hover:border-gold">
            ▶ Дима
          </button>
          <button type="button" onClick={() => preview("f", tts)} className="rounded-md border border-edge px-3 py-1.5 hover:border-gold">
            ▶ Ира
          </button>
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="font-serif text-gold">Скорость и громкость</h3>
        <label className="flex items-center gap-3">
          <span className="w-24">Скорость</span>
          <input
            type="range"
            min={0.7}
            max={1.5}
            step={0.05}
            value={tts.rate}
            onChange={(e) => update({ rate: Number(e.target.value) })}
            className="flex-1"
          />
          <span className="w-10 text-right font-mono text-xs">{tts.rate.toFixed(2)}</span>
        </label>
        <label className="flex items-center gap-3">
          <span className="w-24">Громкость</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={tts.volume}
            onChange={(e) => update({ volume: Number(e.target.value) })}
            className="flex-1"
          />
          <span className="w-10 text-right font-mono text-xs">{Math.round(tts.volume * 100)}%</span>
        </label>
      </section>

      <section className="space-y-2">
        <h3 className="font-serif text-gold">Голоса персонажей</h3>
        <p className="text-xs text-muted">
          Если мастер не пометил пол говорящего, голос выбирается по этому списку (имя или часть имени).
        </p>
        <ul className="space-y-1">
          {tts.characters.map((c, i) => (
            <li key={i} className="flex gap-2">
              <input
                value={c.name}
                onChange={(e) =>
                  update({ characters: tts.characters.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })
                }
                aria-label="Имя персонажа"
                className={`${input} min-w-0 flex-1`}
              />
              <select
                value={c.gender}
                onChange={(e) =>
                  update({
                    characters: tts.characters.map((x, j) => (j === i ? { ...x, gender: e.target.value as Gender } : x)),
                  })
                }
                aria-label="Голос персонажа"
                className={input}
              >
                <option value="m">Дима</option>
                <option value="f">Ира</option>
              </select>
              <button
                type="button"
                onClick={() => update({ characters: tts.characters.filter((_, j) => j !== i) })}
                aria-label="Убрать персонажа"
                className="px-2 text-muted hover:text-fumble"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => update({ characters: [...tts.characters, { name: "", gender: "m" }] })}
            className="rounded-md border border-dashed border-gold/60 px-3 py-1.5 text-gold"
          >
            + Персонаж
          </button>
          <button type="button" onClick={() => update({ characters: DEFAULT_CHARACTERS })} className="px-3 py-1.5 text-xs text-muted hover:text-parchment">
            Вернуть список по умолчанию
          </button>
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="font-serif text-gold">Произношение</h3>
        <p className="text-xs text-muted">
          Как читать слово: ударение ставится знаком ́ после ударной гласной (Ни́кис) или слово пишется, как
          слышится.
        </p>
        <ul className="space-y-1">
          {tts.pronunciations.map((p, i) => (
            <li key={i} className="flex items-center gap-2">
              <input
                value={p.from}
                onChange={(e) =>
                  update({ pronunciations: tts.pronunciations.map((x, j) => (j === i ? { ...x, from: e.target.value } : x)) })
                }
                aria-label="Слово"
                className={`${input} min-w-0 flex-1`}
              />
              <span className="text-muted">→</span>
              <input
                value={p.to}
                onChange={(e) =>
                  update({ pronunciations: tts.pronunciations.map((x, j) => (j === i ? { ...x, to: e.target.value } : x)) })
                }
                aria-label="Как читать"
                className={`${input} min-w-0 flex-1`}
              />
              <button
                type="button"
                onClick={() => update({ pronunciations: tts.pronunciations.filter((_, j) => j !== i) })}
                aria-label="Убрать слово"
                className="px-2 text-muted hover:text-fumble"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => update({ pronunciations: [...tts.pronunciations, { from: "", to: "" }] })}
            className="rounded-md border border-dashed border-gold/60 px-3 py-1.5 text-gold"
          >
            + Слово
          </button>
          <button
            type="button"
            onClick={() => update({ pronunciations: DEFAULT_PRONUNCIATIONS })}
            className="px-3 py-1.5 text-xs text-muted hover:text-parchment"
          >
            Вернуть список по умолчанию
          </button>
        </div>
      </section>
    </div>
  );
}

export default function SettingsWindow({ initialTab, onClose, tts, onTtsChange, ai }: SettingsWindowProps) {
  const [tab, setTab] = useState<SettingsTab>(initialTab);

  function changeTts(next: TtsSettings) {
    saveTtsSettings(next);
    onTtsChange(next);
  }

  return (
    <Modal title="Настройки" onClose={onClose} size="lg">
      <div className="grid grid-cols-2 gap-1 border-b border-edge p-2" role="tablist">
        {(
          [
            ["tts", "Озвучка"],
            ["ai", "ИИ-мастер"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`rounded-md px-3 py-2 text-sm font-medium ${tab === id ? "bg-gold text-ink" : "text-muted hover:text-parchment"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "tts" ? (
        <TtsSettingsPanel tts={tts} onChange={changeTts} />
      ) : (
        <AiSettingsWindow {...ai} onClose={onClose} embedded />
      )}
    </Modal>
  );
}
