// Настройки озвучки: вкладки движков (как выбор провайдера ИИ) и голоса каждого движка.

import { useEffect, useState } from "react";
import { preview, ttsPlayer, type Gender, type TtsSettings } from "../lib/tts";
import {
  CLOUD_VOICES,
  cloudModels,
  DEFAULT_VOICES,
  deleteVoice,
  downloadedVoices,
  downloadVoice,
  ENGINE_LABEL,
  isTauri,
  PIPER_VOICES,
  serverVoices,
  shareStart,
  shareStatus,
  shareStop,
  sileroAvailable,
  sileroVoices,
  type CloudProvider,
  type ShareStatus,
  type TtsEngineId,
  type VoiceOption,
} from "../lib/ttsVoices";

const input =
  "rounded-md border border-edge bg-ink px-2 py-1.5 text-sm text-parchment placeholder:text-muted/70 focus:border-gold focus:outline-none";
const button = "rounded-md border border-edge px-3 py-1.5 text-sm hover:border-gold disabled:opacity-40";

const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e));

interface Props {
  tts: TtsSettings;
  onChange: (s: TtsSettings) => void;
}

export default function TtsEnginePanel({ tts, onChange }: Props) {
  const [silero, setSilero] = useState(false);
  const [piperReady, setPiperReady] = useState<boolean | null>(null);
  useEffect(() => {
    void sileroAvailable().then(setSilero);
    void ttsPlayer.engine({ ...tts, engine: "piper" }).then((e) => setPiperReady(e === "piper"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const engines: TtsEngineId[] = ["piper", ...(silero ? (["silero"] as const) : []), "server", "openai", "gemini", "yandex"];
  const engine = tts.engine;
  const update = (patch: Partial<TtsSettings>) => onChange({ ...tts, ...patch });
  const voices = tts.voices[engine] ?? DEFAULT_VOICES[engine];
  const setVoice = (gender: Gender, id: string) =>
    update({ voices: { ...tts.voices, [engine]: { ...voices, [gender]: id } } });

  return (
    <section className="space-y-3">
      <h3 className="font-serif text-gold">Движок озвучки</h3>
      <div className="flex flex-wrap gap-1" role="tablist">
        {engines.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={engine === id}
            onClick={() => update({ engine: id })}
            className={`rounded-full border px-3 py-1 text-xs ${
              engine === id ? "border-gold bg-gold/15 text-gold" : "border-edge text-parchment/80 hover:border-gold/60"
            }`}
          >
            {ENGINE_LABEL[id]}
          </button>
        ))}
      </div>

      {engine === "piper" && <PiperTab voices={voices} setVoice={setVoice} ready={piperReady} />}
      {engine === "silero" && <SileroTab voices={voices} setVoice={setVoice} />}
      {engine === "server" && <ServerTab tts={tts} update={update} voices={voices} setVoice={setVoice} />}
      {(engine === "openai" || engine === "gemini" || engine === "yandex") && (
        <CloudTab provider={engine} tts={tts} update={update} voices={voices} setVoice={setVoice} />
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        <button type="button" onClick={() => preview("m", tts, "мужской голос")} className={button}>
          ▶ Мужской
        </button>
        <button type="button" onClick={() => preview("f", tts, "женский голос")} className={button}>
          ▶ Женский
        </button>
      </div>
      <label className="flex items-center justify-between gap-2">
        <span>Повествование</span>
        <select value={tts.narrator} onChange={(e) => update({ narrator: e.target.value as Gender })} className={input}>
          <option value="m">мужским голосом</option>
          <option value="f">женским голосом</option>
        </select>
      </label>
      <p className="text-xs text-muted">Реплики персонажей («&gt; — …») читаются голосом по полу говорящего.</p>
    </section>
  );
}

interface VoiceProps {
  voices: { m: string; f: string };
  setVoice: (gender: Gender, id: string) => void;
}

/** Выбор мужского и женского голоса из списка. */
function VoicePickers({ list, voices, setVoice }: VoiceProps & { list: VoiceOption[] }) {
  const options = (gender: Gender) => {
    const own = list.filter((v) => v.gender === gender);
    const rest = list.filter((v) => v.gender !== gender);
    return [...own, ...rest];
  };
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {(["m", "f"] as const).map((g) => (
        <label key={g} className="flex items-center justify-between gap-2">
          <span>{g === "m" ? "Мужской" : "Женский"}</span>
          <select value={voices[g]} onChange={(e) => setVoice(g, e.target.value)} className={`${input} min-w-0 flex-1`}>
            {!list.some((v) => v.id === voices[g]) && <option value={voices[g]}>{voices[g] || "— выберите —"}</option>}
            {options(g).map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
                {v.gender && v.gender !== g ? (v.gender === "m" ? " (муж.)" : " (жен.)") : ""}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}

function PiperTab({ voices, setVoice, ready }: VoiceProps & { ready: boolean | null }) {
  const [have, setHave] = useState<string[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const refresh = () => void downloadedVoices().then(setHave);
  useEffect(refresh, []);

  async function download(id: string) {
    const v = PIPER_VOICES.find((x) => x.id === id);
    if (!v) return;
    setError(null);
    try {
      await downloadVoice(v, (p) => setProgress((prev) => ({ ...prev, [id]: p })));
      refresh();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setProgress((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  }

  async function remove(id: string) {
    await deleteVoice(id).catch((e: unknown) => setError(errorText(e)));
    if (voices.m === id) setVoice("m", "dmitri");
    if (voices.f === id) setVoice("f", "irina");
    refresh();
  }

  const usable = PIPER_VOICES.filter((v) => v.builtin || have.includes(v.id));
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">
        {ready === false
          ? "Голоса Piper в этой версии недоступны — читает системный голос устройства."
          : "Работает без интернета. Дмитрий и Ирина встроены в приложение, остальные голоса можно скачать (около 63 МБ каждый)."}
      </p>
      <VoicePickers list={usable} voices={voices} setVoice={setVoice} />
      <ul className="space-y-1">
        {PIPER_VOICES.map((v) => {
          const p = progress[v.id];
          return (
            <li key={v.id} className="flex items-center justify-between gap-2 rounded-md border border-edge/60 px-2 py-1.5 text-xs">
              <span>
                {v.name} <span className="text-muted">· {v.gender === "m" ? "мужской" : "женский"}</span>
              </span>
              {v.builtin ? (
                <span className="text-muted">встроен</span>
              ) : p !== undefined ? (
                <span className="font-mono text-gold">{Math.round(p * 100)}%</span>
              ) : have.includes(v.id) ? (
                <button type="button" onClick={() => void remove(v.id)} className="text-muted hover:text-fumble">
                  Удалить
                </button>
              ) : (
                <button type="button" onClick={() => void download(v.id)} disabled={ready === false} className="text-gold hover:underline disabled:opacity-40">
                  Скачать · {v.sizeMb} МБ
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <p className="text-[11px] text-muted">Голоса Piper скачиваются с Hugging Face (rhasspy/piper-voices); лицензия — в карточке каждого голоса.</p>
      {error && <p className="text-xs text-fumble">{error}</p>}
    </div>
  );
}

function SileroTab({ voices, setVoice }: VoiceProps) {
  const [list, setList] = useState<VoiceOption[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [share, setShare] = useState<ShareStatus | null>(null);
  const [port, setPort] = useState(5150);
  useEffect(() => {
    sileroVoices()
      .then(setList)
      .catch((e: unknown) => setError(errorText(e)));
    void shareStatus().then((s) => {
      setShare(s);
      setPort(s.port);
    });
  }, []);

  async function toggleShare() {
    setError(null);
    try {
      if (share?.running) {
        await shareStop();
        setShare(await shareStatus());
      } else {
        setShare(await shareStart(port));
      }
    } catch (e) {
      setError(errorText(e));
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">
        Silero встроен в версию для Windows и работает без интернета: модели синтеза и ударений Silero (лицензия MIT).
      </p>
      {list ? <VoicePickers list={list} voices={voices} setVoice={setVoice} /> : !error && <p className="text-xs text-muted">Загружаю голоса…</p>}
      <div className="space-y-2 rounded-md border border-edge/60 p-2">
        <label className="flex items-center justify-between gap-2">
          <span>Раздавать озвучку в домашнюю сеть</span>
          <input type="checkbox" checked={!!share?.running} onChange={() => void toggleShare()} className="h-4 w-4 accent-[var(--color-gold)]" />
        </label>
        <label className="flex items-center gap-2 text-xs">
          <span>Порт</span>
          <input
            type="number"
            min={1024}
            max={65535}
            value={port}
            disabled={!!share?.running}
            onChange={(e) => setPort(Number(e.target.value) || 5150)}
            className={`${input} w-24`}
          />
        </label>
        {share?.running && (
          <p className="text-xs">
            На телефоне: Настройки → Озвучка → «Свой сервер», адрес{" "}
            <span className="font-mono text-gold">{share.address ?? `http://<IP этого ПК>:${share.port}`}</span>. Телефон и ПК — в одной сети;
            Windows может спросить разрешение брандмауэра.
          </p>
        )}
      </div>
      {error && <p className="text-xs text-fumble">{error}</p>}
    </div>
  );
}

function ServerTab({
  tts,
  update,
  voices,
  setVoice,
}: VoiceProps & { tts: TtsSettings; update: (p: Partial<TtsSettings>) => void }) {
  const [url, setUrl] = useState(tts.serverUrl);
  const [list, setList] = useState<VoiceOption[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function connect(target = url) {
    setBusy(true);
    setError(null);
    try {
      const voicesList = await serverVoices(target);
      setList(voicesList);
      update({ serverUrl: target.trim() });
      const firstOf = (g: Gender) => voicesList.find((v) => v.gender === g)?.id ?? voicesList[0]?.id ?? "";
      if (!voicesList.some((v) => v.id === voices.m) || !voicesList.some((v) => v.id === voices.f)) {
        update({
          serverUrl: target.trim(),
          voices: { ...tts.voices, server: { m: firstOf("m"), f: firstOf("f") } },
        });
      }
    } catch (e) {
      setList(null);
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (tts.serverUrl) void connect(tts.serverUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">
        Озвучка с другого компьютера в домашней сети: версия для Windows с включённой раздачей Silero или свой сервер
        (инструкция и готовый сервер — в README, раздел «Свой сервер озвучки»).
      </p>
      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="http://192.168.1.10:5150"
          className={`${input} min-w-0 flex-1 font-mono`}
          aria-label="Адрес сервера озвучки"
        />
        <button type="button" disabled={busy || !url.trim()} onClick={() => void connect()} className={button}>
          {busy ? "…" : "Подключить"}
        </button>
      </div>
      {!isTauri() && location.protocol === "https:" && url.startsWith("http://") && (
        <p className="text-xs text-muted">
          Веб-версия открыта по https — браузер может запретить запросы к серверу по http. Сервер в домашней сети надёжнее
          подключать из приложения.
        </p>
      )}
      {list && <VoicePickers list={list} voices={voices} setVoice={setVoice} />}
      {error && <p className="text-xs text-fumble">{error}</p>}
    </div>
  );
}

function CloudTab({
  provider,
  tts,
  update,
  voices,
  setVoice,
}: VoiceProps & { provider: CloudProvider; tts: TtsSettings; update: (p: Partial<TtsSettings>) => void }) {
  const [models, setModels] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setModels(null);
    setError(null);
    cloudModels(provider)
      .then((list) => {
        setModels(list);
        const current = tts.models[provider];
        if (!current || !list.includes(current)) {
          const best = list.find((m) => /mini-tts|flash.*tts/.test(m)) ?? list[0];
          if (best) update({ models: { ...tts.models, [provider]: best } });
        }
      })
      .catch((e: unknown) => setError(errorText(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">
        Облачные голоса: нужен интернет, каждая фраза оплачивается по тарифу провайдера. Ключ — тот же, что у ИИ-мастера
        {provider === "yandex" ? "; сервисному аккаунту нужна роль ai.speechkit-tts.user" : ""}.
      </p>
      {models && provider !== "yandex" && (
        <label className="flex items-center justify-between gap-2">
          <span>Модель</span>
          <select
            value={tts.models[provider] ?? ""}
            onChange={(e) => update({ models: { ...tts.models, [provider]: e.target.value } })}
            className={`${input} min-w-0 flex-1`}
          >
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
      )}
      {!models && !error && <p className="text-xs text-muted">Подтягиваю модели озвучки…</p>}
      <VoicePickers list={CLOUD_VOICES[provider]} voices={voices} setVoice={setVoice} />
      {error && <p className="text-xs text-fumble">{error}</p>}
    </div>
  );
}
