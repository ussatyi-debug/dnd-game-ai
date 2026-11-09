import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { getDownloads } from "../lib/claude";
import { writeManualSave } from "../lib/autosave";
import { errorText, saveState } from "../lib/engine";
import type { TrayRoll } from "../lib/rolls";
import type { ChatMessage } from "./ChatPanel";
import CopyButton from "./CopyButton";
import Modal from "./Modal";

interface SaveWindowProps {
  onClose: () => void;
  messages: ChatMessage[];
  rolls: TrayRoll[];
  /** Ручное сохранение записано (обновить список сохранений). */
  onSaved?: () => void;
}

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function fileName(day: unknown): string {
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
  return `dnd-save-day${typeof day === "number" ? day : "x"}-${stamp}.json`;
}

/** Сохранение: в игре (ручное, с названием), в файл и в буфер обмена. */
export default function SaveWindow({ onClose, messages, rolls, onSaved }: SaveWindowProps) {
  const [json, setJson] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [name, setName] = useState("dnd-save.json");
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    saveState()
      .then((engine) => {
        const scene = (engine as { scene?: { day?: unknown; location?: unknown } }).scene;
        const day = scene?.day;
        setName(fileName(day));
        setTitle(`День ${typeof day === "number" ? day : "?"}${typeof scene?.location === "string" && scene.location ? `, ${scene.location}` : ""}`);
        setJson(
          JSON.stringify(
            {
              app: "dnd-game-ai",
              app_version: __APP_VERSION__,
              saved_at: new Date().toISOString(),
              engine,
              ui: { chat: messages, rolls },
            },
            null,
            2,
          ),
        );
      })
      .catch((e: unknown) => setError(errorText(e)));
  }, [messages, rolls]);

  async function saveInGame() {
    setSaving(true);
    setSaved(null);
    setError(null);
    try {
      const info = await writeManualSave(messages, rolls, title);
      setSaved(`Сохранено: «${info.name ?? title}». Загрузить — в окне «Загрузить сохранение» или «Кампания».`);
      onSaved?.();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setSaving(false);
    }
  }

  async function download() {
    if (!json) return;
    setNote(null);
    // Приложение (ПК и Android): файл пишет движок приложения в папку загрузок.
    if (isTauri()) {
      try {
        const path = await invoke<string>("export_save", { name, json });
        setNote(`Файл сохранён: ${path}`);
      } catch (e) {
        setNote(`Файл не сохранён: ${errorText(e)}. Можно скопировать сохранение кнопкой «Копировать».`);
      }
      return;
    }
    // Внутри Claude файл сохраняется через платформу (с подтверждением); иначе — обычной ссылкой.
    const downloads = await getDownloads();
    if (downloads) {
      try {
        await downloads.save({ filename: name, data: json });
        setNote("Файл сохранён.");
      } catch {
        setNote("Сохранение отменено. Можно скопировать сохранение кнопкой «Копировать».");
      }
      return;
    }
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <Modal title="Сохранить" onClose={onClose} size="md">
      <div className="space-y-4 p-4 text-sm">
        {error && <p className="text-fumble">{error}</p>}
        {!json && !error && <p className="text-muted">Собираю сохранение…</p>}
        {json && (
          <>
            <section className="space-y-2">
              <h3 className="font-serif text-gold">Сохранить в игре</h3>
              <div className="flex flex-wrap gap-2">
                <input
                  value={title}
                  maxLength={80}
                  onChange={(e) => setTitle(e.target.value)}
                  className="min-w-0 flex-1 rounded-md border border-edge bg-ink px-3 py-2"
                  aria-label="Название сохранения"
                />
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void saveInGame()}
                  className="rounded-md bg-blood px-4 py-2 text-parchment hover:bg-blood/80 disabled:opacity-50"
                >
                  {saving ? "Сохраняю…" : "Сохранить"}
                </button>
              </div>
              {saved && <p className="text-crit">{saved}</p>}
              <p className="text-xs text-muted">Ручные сохранения не перезаписываются автосохранениями. До 10 на кампанию.</p>
            </section>
            <section className="space-y-2 border-t border-edge pt-3">
              <h3 className="font-serif text-gold">Сохранить в файл</h3>
              <p className="text-xs text-muted">
                Сцена, отряд с ресурсами, казна, история чата и бросков · {(json.length / 1024).toFixed(1)} КБ
              </p>
              <button
                type="button"
                onClick={() => void download()}
                className="rounded-md border border-gold px-4 py-2 text-gold hover:bg-gold/10"
              >
                Сохранить {name}
              </button>
              {note && <p className="text-crit">{note}</p>}
            </section>
            <section className="space-y-2 border-t border-edge pt-3">
              <h3 className="font-serif text-gold">Скопировать в буфер</h3>
              <p className="text-xs text-muted">Текст сохранения можно вставить в окно загрузки на другом устройстве.</p>
              <CopyButton text={json} className="px-4 py-2 text-sm" />
            </section>
          </>
        )}
      </div>
    </Modal>
  );
}
