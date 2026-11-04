import { useState, type FormEvent } from "react";
import {
  describeD20,
  describeExpr,
  errorText,
  luckyStatus,
  rollCheck,
  rollExpression,
  submitPlayerRoll,
  takeRest,
  type D20Roll,
  type Modifier,
  type ResourcePool,
  type RestKind,
  type RollMode,
} from "../lib/engine";
import type { LogTone } from "./RollLog";

const QUICK_DICE = [4, 6, 8, 10, 12, 20, 100] as const;

const MODES: { value: RollMode; label: string }[] = [
  { value: "normal", label: "Обычный" },
  { value: "advantage", label: "Преимущество" },
  { value: "disadvantage", label: "Помеха" },
];

interface DicePanelProps {
  enabled: boolean;
  lucky: ResourcePool | null;
  onLuckyChange: (pool: ResourcePool) => void;
  onLog: (title: string, detail: string, tone: LogTone) => void;
}

function d20Tone(roll: D20Roll): LogTone {
  if (roll.critical) return "crit";
  if (roll.fumble) return "fumble";
  return "normal";
}

const inputClass =
  "w-full rounded-md border border-edge bg-ink px-3 py-2 text-parchment placeholder:text-muted/70 focus:border-gold focus:outline-none";
const buttonClass =
  "rounded-md bg-blood px-3 py-2 font-medium text-parchment hover:bg-blood/80 disabled:cursor-not-allowed disabled:opacity-40";
const ghostButtonClass =
  "rounded-md border border-edge px-3 py-2 text-parchment hover:border-gold disabled:cursor-not-allowed disabled:opacity-40";

export default function DicePanel({ enabled, lucky, onLuckyChange, onLog }: DicePanelProps) {
  const [expression, setExpression] = useState("2d6+3");
  const [critical, setCritical] = useState(false);

  const [checkLabel, setCheckLabel] = useState("Проверка");
  const [modifierText, setModifierText] = useState("0");
  const [mode, setMode] = useState<RollMode>("normal");
  const [critThreshold, setCritThreshold] = useState(20);
  const [playerInput, setPlayerInput] = useState("");

  const [busy, setBusy] = useState(false);
  const disabled = !enabled || busy;

  const modifierValue = Number.parseInt(modifierText, 10);
  const modifierValid = Number.isFinite(modifierValue) && Math.abs(modifierValue) <= 100;
  const modifiers: Modifier[] =
    modifierValid && modifierValue !== 0 ? [{ label: "Модификатор", value: modifierValue }] : [];
  const label = checkLabel.trim() || "Проверка";

  async function run(action: () => Promise<void>, errorTitle: string) {
    setBusy(true);
    try {
      await action();
    } catch (error) {
      onLog(errorTitle, errorText(error), "error");
    } finally {
      setBusy(false);
    }
  }

  function rollQuick(sides: number) {
    void run(async () => {
      const roll = await rollExpression(`1d${sides}`, false);
      onLog(`d${sides}`, describeExpr(roll), "normal");
    }, `d${sides}`);
  }

  function rollExpr(event: FormEvent) {
    event.preventDefault();
    void run(async () => {
      const roll = await rollExpression(expression, critical);
      onLog(critical ? `${roll.expression} (крит)` : roll.expression, describeExpr(roll), "normal");
    }, "Выражение");
  }

  function rollEngineD20() {
    void run(async () => {
      const roll = await rollCheck(mode, modifiers, critThreshold);
      onLog(`${label} — куб движка`, describeD20(roll), d20Tone(roll));
    }, label);
  }

  function submitPlayer(event: FormEvent) {
    event.preventDefault();
    void run(async () => {
      const roll = await submitPlayerRoll(playerInput, mode, modifiers, critThreshold);
      onLog(`${label} — куб игрока`, describeD20(roll), d20Tone(roll));
      if (roll.lucky_used) {
        onLuckyChange(await luckyStatus());
      }
      setPlayerInput("");
    }, label);
  }

  function rest(kind: RestKind) {
    void run(async () => {
      const pool = await takeRest(kind);
      onLuckyChange(pool);
      onLog(
        kind === "long" ? "Длительный отдых" : "Короткий отдых",
        `${pool.name}: ${pool.current}/${pool.max}`,
        "info",
      );
    }, "Отдых");
  }

  return (
    <section className="space-y-5 rounded-xl border border-edge bg-panel p-4">
      <div>
        <h2 className="mb-3 font-serif text-lg text-gold">Быстрый бросок</h2>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {QUICK_DICE.map((sides) => (
            <button
              key={sides}
              type="button"
              disabled={disabled}
              onClick={() => rollQuick(sides)}
              className={ghostButtonClass}
            >
              d{sides}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={rollExpr} className="space-y-2">
        <h2 className="font-serif text-lg text-gold">Выражение</h2>
        <div className="flex gap-2">
          <input
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="Например: 8d6, 1d8+5+2d8, 2к6+3"
            aria-label="Выражение броска"
            className={inputClass}
          />
          <button type="submit" disabled={disabled || expression.trim() === ""} className={buttonClass}>
            Бросить
          </button>
        </div>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={critical}
            onChange={(e) => setCritical(e.target.checked)}
            className="accent-gold"
          />
          Критическое попадание (удвоить кубы)
        </label>
      </form>

      <div className="space-y-3">
        <h2 className="font-serif text-lg text-gold">Бросок d20</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_7rem_7rem]">
          <input
            value={checkLabel}
            onChange={(e) => setCheckLabel(e.target.value)}
            placeholder="Название: Скрытность, Атака…"
            aria-label="Название броска"
            className={inputClass}
          />
          <input
            value={modifierText}
            onChange={(e) => setModifierText(e.target.value)}
            inputMode="numeric"
            aria-label="Модификатор"
            aria-invalid={!modifierValid}
            className={`${inputClass} ${modifierValid ? "" : "border-fumble"}`}
          />
          <select
            value={critThreshold}
            onChange={(e) => setCritThreshold(Number(e.target.value))}
            aria-label="Порог крита"
            className={inputClass}
          >
            <option value={20}>Крит 20</option>
            <option value={19}>Крит 19–20</option>
            <option value={18}>Крит 18–20</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-1 rounded-md border border-edge p-1" role="radiogroup">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              role="radio"
              aria-checked={mode === m.value}
              onClick={() => setMode(m.value)}
              className={`rounded px-2 py-1.5 text-sm ${
                mode === m.value ? "bg-gold text-ink" : "text-muted hover:text-parchment"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={disabled || !modifierValid}
          onClick={rollEngineD20}
          className={`${buttonClass} w-full`}
        >
          Бросить кубом движка
        </button>

        <form onSubmit={submitPlayer} className="flex gap-2">
          <input
            value={playerInput}
            onChange={(e) => setPlayerInput(e.target.value)}
            placeholder="Свой куб: 16 или 12 - везунчик"
            aria-label="Значение с настоящего куба"
            className={inputClass}
          />
          <button
            type="submit"
            disabled={disabled || !modifierValid || playerInput.trim() === ""}
            className={ghostButtonClass}
          >
            Записать
          </button>
        </form>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-edge pt-4">
        <div>
          <span className="text-sm text-muted">Везунчик</span>
          <div className="flex gap-1.5" aria-label={lucky ? `${lucky.current} из ${lucky.max}` : "нет данных"}>
            {lucky
              ? Array.from({ length: lucky.max }, (_, i) => (
                  <span
                    key={i}
                    className={`h-4 w-4 rounded-full border border-gold ${i < lucky.current ? "bg-gold" : ""}`}
                  />
                ))
              : "—"}
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" disabled={disabled} onClick={() => rest("short")} className={ghostButtonClass}>
            Короткий отдых
          </button>
          <button type="button" disabled={disabled} onClick={() => rest("long")} className={ghostButtonClass}>
            Длительный отдых
          </button>
        </div>
      </div>
    </section>
  );
}
