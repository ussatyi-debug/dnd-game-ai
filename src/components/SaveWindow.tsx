import { useEffect, useState } from "react";
import { getDownloads } from "../lib/claude";
import { errorText, saveState } from "../lib/engine";
import type { TrayRoll } from "../lib/rolls";
import type { ChatMessage } from "./ChatPanel";
import CopyButton from "./CopyButton";
import Modal from "./Modal";

interface SaveWindowProps {
  onClose: () => void;
  messages: ChatMessage[];
  rolls: TrayRoll[];
}

function fileName(day: unknown): string {
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
  return `dnd-save-day${typeof day === "number" ? day : "x"}-${stamp}.json`;
}

/** Выгрузка сохранения: файл в приложении, а если скачивание недоступно — копирование. */
export default function SaveWindow({ onClose, messages, rolls }: SaveWindowProps) {
  const [json, setJson] = useState<string | null>(null);
  const [name, setName] = useState("dnd-save.json");
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    saveState()
      .then((engine) => {
        const day = (engine as { scene?: { day?: unknown } }).scene?.day;
        setName(fileName(day));
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

  async function download() {
    if (!json) return;
    setNote(null);
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
    <Modal title="Выгрузить сохранение" onClose={onClose} size="md">
      <div className="space-y-3 p-4 text-sm">
        {error && <p className="text-fumble">{error}</p>}
        {!json && !error && <p className="text-muted">Собираю сохранение…</p>}
        {json && (
          <>
            <p>
              В файле — сцена, отряд с ресурсами, казна с журналом, история чата и бросков. Размер:{" "}
              {(json.length / 1024).toFixed(1)} КБ.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void download()}
                className="rounded-md bg-blood px-4 py-2 text-parchment hover:bg-blood/80"
              >
                Скачать {name}
              </button>
              <CopyButton text={json} className="px-4 py-2 text-sm" />
            </div>
            {note && <p className="text-crit">{note}</p>}
            <p className="text-xs text-muted">
              Если скачивание не началось (например, в просмотре внутри Claude), скопируйте сохранение и
              вставьте в файл с расширением .json.
            </p>
          </>
        )}
      </div>
    </Modal>
  );
}
