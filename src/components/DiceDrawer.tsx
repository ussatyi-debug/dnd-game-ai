import type { ResourcePool } from "../lib/engine";
import type { RollResult, TrayRoll } from "../lib/rolls";
import DiceTray from "./DiceTray";
import RollLog from "./RollLog";

interface DiceDrawerProps {
  open: boolean;
  onClose: () => void;
  enabled: boolean;
  lucky: ResourcePool | null;
  rolls: TrayRoll[];
  onRoll: (roll: RollResult) => void;
  onLuckyChange: (pool: ResourcePool) => void;
  onClearLog: () => void;
  onSendToChat: (text: string) => void;
}

/**
 * Выдвижная панель кубов: лоток и лог бросков. Открывается только кнопкой — игрок может
 * бросать и физические кубы, поэтому никакой автоматики. Панель остаётся смонтированной,
 * чтобы 3D-сцена и лог не сбрасывались при закрытии.
 */
export default function DiceDrawer({
  open,
  onClose,
  enabled,
  lucky,
  rolls,
  onRoll,
  onLuckyChange,
  onClearLog,
  onSendToChat,
}: DiceDrawerProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-20 bg-black/50 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <section
        aria-label="Кубы"
        aria-hidden={!open}
        className={`fixed inset-x-0 bottom-0 z-30 mx-auto flex h-[85dvh] max-w-6xl flex-col rounded-t-2xl border border-b-0 border-edge bg-ink shadow-2xl shadow-black transition-transform duration-300 lg:h-[70vh] ${
          open ? "translate-y-0" : "pointer-events-none translate-y-full"
        }`}
      >
        <header className="flex items-center justify-between px-4 py-2">
          <h2 className="font-serif text-lg text-gold">Кубы</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1 text-sm text-muted hover:text-parchment"
          >
            Свернуть ▾
          </button>
        </header>
        <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,3fr)_minmax(0,2fr)] gap-3 px-3 pb-3 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:grid-rows-1">
          <div className="flex min-h-0 flex-col">
            <DiceTray
              enabled={enabled}
              lucky={lucky}
              onRoll={onRoll}
              onLuckyChange={onLuckyChange}
              onSendToChat={onSendToChat}
            />
          </div>
          <div className="flex min-h-0 flex-col">
            <RollLog rolls={rolls} onClear={onClearLog} onSendToChat={onSendToChat} />
          </div>
        </div>
      </section>
    </>
  );
}
