// Окно «Настройки»: озвучка и ИИ-мастер.

import { enterSends, setEnterSends } from "../lib/masterPrefs";
import { useEffect, useState } from "react";
import { DEFAULT_CHARACTERS, DEFAULT_PRONUNCIATIONS, saveTtsSettings, type Gender, type TtsSettings } from "../lib/tts";
import TtsEnginePanel from "./TtsEnginePanel";
import { musicPlayer, saveMusicSettings, type MusicSettings, type MusicState, type MusicTrack } from "../lib/music";
import AiSettingsWindow, { type AiSettingsWindowProps } from "./AiSettingsWindow";
import Modal from "./Modal";

export type SettingsTab = "tts" | "music" | "ai";

type AiProps = Omit<AiSettingsWindowProps, "embedded" | "onClose">;

interface SettingsWindowProps {
  initialTab: SettingsTab;
  onClose: () => void;
  tts: TtsSettings;
  onTtsChange: (settings: TtsSettings) => void;
  music: MusicSettings;
  onMusicChange: (settings: MusicSettings) => void;
  ai: AiProps;
}

const MOOD_LABEL: Record<MusicTrack["mood"], string> = {
  menu: "Главное меню",
  calm: "Фон игры",
  travel_day: "Путешествие днём",
  travel_night: "Путешествие ночью",
  battle: "Бой",
};

function MusicSettingsPanel({ music, onChange }: { music: MusicSettings; onChange: (s: MusicSettings) => void }) {
  const [tracks, setTracks] = useState<MusicTrack[] | null>(null);
  const [state, setState] = useState<MusicState | null>(null);
  useEffect(() => {
    void musicPlayer.list().then(setTracks);
    return musicPlayer.subscribe(setState);
  }, []);
  const update = (patch: Partial<MusicSettings>) => onChange({ ...music, ...patch });

  return (
    <div className="space-y-5 p-4 text-sm">
      {tracks !== null && tracks.length === 0 && (
        <p className="text-xs text-muted">Музыка в этой версии недоступна: файлы музыки входят только в приложение для ПК и Android.</p>
      )}
      <section className="space-y-3">
        <label className="flex items-center justify-between gap-2">
          <span>Фоновая музыка</span>
          <input type="checkbox" checked={music.enabled} onChange={(e) => update({ enabled: e.target.checked })} className="h-4 w-4 accent-[var(--color-gold)]" />
        </label>
        <label className="flex items-center gap-3">
          <span className="w-24 shrink-0">Громкость</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(music.volume * 100)}
            onChange={(e) => update({ volume: Number(e.target.value) / 100 })}
            disabled={!music.enabled}
            className="flex-1 accent-[var(--color-gold)]"
            aria-label="Громкость музыки"
          />
          <span className="w-10 text-right font-mono text-xs">{Math.round(music.volume * 100)}%</span>
        </label>
        <p className="text-xs text-muted">Пока мастер читает ответ голосом, музыка звучит тише.</p>
        {state?.track && (
          <p className="text-xs">
            Сейчас: <span className="text-gold">{state.track.title}</span> — {state.track.author}
          </p>
        )}
      </section>
      {tracks && tracks.length > 0 && (
        <section className="space-y-2">
          <h3 className="font-serif text-gold">Треки</h3>
          <p className="text-xs text-muted">Вся музыка — с OpenGameArt под лицензией CC0 (общественное достояние).</p>
          <ul className="space-y-1 text-xs">
            {tracks.map((t) => (
              <li key={t.id} className="flex justify-between gap-2">
                <span>
                  {t.title} <span className="text-muted">— {t.author}</span>
                </span>
                <span className="shrink-0 text-muted">{MOOD_LABEL[t.mood]}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

const input =
  "rounded-md border border-edge bg-ink px-2 py-1.5 text-sm text-parchment placeholder:text-muted/70 focus:border-gold focus:outline-none";

function TtsSettingsPanel({ tts, onChange }: { tts: TtsSettings; onChange: (s: TtsSettings) => void }) {
  const update = (patch: Partial<TtsSettings>) => onChange({ ...tts, ...patch });

  return (
    <div className="space-y-5 p-4 text-sm">
      <TtsEnginePanel tts={tts} onChange={onChange} />

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
        <label className="mb-3 flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            defaultChecked={enterSends()}
            onChange={(e) => setEnterSends(e.target.checked)}
          />
          <span>
            Enter отправляет заявку
            <span className="block text-xs text-muted">
              Перенос строки — Shift+Enter. Без галочки Enter делает новую строку, а отправка — кнопкой или
              Ctrl+Enter.
            </span>
          </span>
        </label>
        <h3 className="font-serif text-gold">Произношение</h3>
        <p className="text-xs text-muted">
          Как читать слово: поставьте «+» после ударной гласной (Ни+кис) или напишите слово так, как оно
          слышится. Старые записи со знаком ударения тоже работают.
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

export default function SettingsWindow({ initialTab, onClose, tts, onTtsChange, music, onMusicChange, ai }: SettingsWindowProps) {
  const [tab, setTab] = useState<SettingsTab>(initialTab);

  function changeTts(next: TtsSettings) {
    saveTtsSettings(next);
    onTtsChange(next);
  }

  function changeMusic(next: MusicSettings) {
    saveMusicSettings(next);
    onMusicChange(next);
  }

  return (
    <Modal title="Настройки" onClose={onClose} size="lg">
      <div className="grid grid-cols-3 gap-1 border-b border-edge p-2" role="tablist">
        {(
          [
            ["tts", "Озвучка"],
            ["music", "Музыка"],
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
      ) : tab === "music" ? (
        <MusicSettingsPanel music={music} onChange={changeMusic} />
      ) : (
        <AiSettingsWindow {...ai} onClose={onClose} embedded />
      )}
    </Modal>
  );
}
