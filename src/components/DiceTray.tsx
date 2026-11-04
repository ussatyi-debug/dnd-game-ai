import { useEffect, useRef, useState } from "react";
import { splitPercentile, valuesShowing, type DieKind } from "../dice/geometry";
import { DiceScene } from "../dice/scene";
import { simulateThrow } from "../dice/simulate";
import { errorText, luckyReroll, rollDice, type ResourcePool } from "../lib/engine";
import { DICE, rollCopyText, rollDetail, rollTitle, type DieId, type RollResult } from "../lib/rolls";
import CopyButton from "./CopyButton";

interface DiceTrayProps {
  enabled: boolean;
  /** Пул «Везунчика» из листа персонажа. */
  lucky: ResourcePool | null;
  onRoll: (roll: RollResult) => void;
  onLuckyChange: (pool: ResourcePool) => void;
  onSendToChat: (text: string) => void;
}

interface Throw {
  kind: DieKind;
  value: number;
}

/** Кубы для отрисовки: d100 — пара d10 (десятки и единицы). */
function throwsFor(die: DieId, values: number[]): Throw[] {
  if (die === "d100") {
    return values.flatMap((v) => {
      const { tens, units } = splitPercentile(v);
      return [
        { kind: "d10_tens" as const, value: tens },
        { kind: "d10" as const, value: units },
      ];
    });
  }
  return values.map((value) => ({ kind: die, value }));
}

export default function DiceTray({ enabled, lucky, onRoll, onLuckyChange, onSendToChat }: DiceTrayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<DiceScene | null>(null);
  const [die, setDie] = useState<DieId>("d20");
  const [count, setCount] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [last, setLast] = useState<RollResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sceneError, setSceneError] = useState<string | null>(null);

  const maxCount = DICE.find((d) => d.id === die)?.maxCount ?? 10;
  const sides = DICE.find((d) => d.id === die)?.sides ?? 20;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    try {
      sceneRef.current = new DiceScene(container);
    } catch (e) {
      setSceneError(`3D недоступно на этом устройстве: ${errorText(e)}`);
    }
    return () => {
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    setCount((c) => Math.min(c, maxCount));
  }, [maxCount]);

  async function animate(throws: Throw[]) {
    const scene = sceneRef.current;
    if (!scene || !scene.isVisible()) return;
    const simulation = simulateThrow(
      throws.map((t) => t.kind),
      scene.getBounds(),
    );
    const values = simulation.dice.map((track, i) =>
      valuesShowing(track.shape, track.up, throws[i]?.value ?? 1),
    );
    await scene.play(simulation, values);
  }

  async function roll() {
    setRolling(true);
    setError(null);
    try {
      const result = await rollDice(count, sides);
      const values = result.groups[0]?.values ?? [];
      await animate(throwsFor(die, values));
      const entry = { die, values, total: result.total };
      setLast(entry);
      onRoll(entry);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setRolling(false);
    }
  }

  async function reroll() {
    if (!last) return;
    setRolling(true);
    setError(null);
    try {
      const result = await luckyReroll();
      onLuckyChange(result.lucky);
      await animate([{ kind: "d20", value: result.value }]);
      const entry = {
        die: "d20" as const,
        values: [result.value],
        total: result.value,
        luckyFrom: last.total,
      };
      setLast(entry);
      onRoll(entry);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setRolling(false);
    }
  }

  const canReroll =
    last !== null && last.die === "d20" && last.values.length === 1 && last.luckyFrom === undefined;
  const luckyLeft = lucky?.current ?? 0;

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-edge bg-panel">
      <div className="grid grid-cols-7 gap-1 border-b border-edge p-2" role="radiogroup" aria-label="Куб">
        {DICE.map((d) => (
          <button
            key={d.id}
            type="button"
            role="radio"
            aria-checked={die === d.id}
            disabled={rolling}
            onClick={() => setDie(d.id)}
            className={`rounded-md py-2 text-sm font-medium ${
              die === d.id ? "bg-gold text-ink" : "text-muted hover:bg-edge/60 hover:text-parchment"
            }`}
          >
            {d.id}
          </button>
        ))}
      </div>

      <div className="relative min-h-64 flex-1">
        <div ref={containerRef} className="absolute inset-0" />
        {sceneError && (
          <p className="absolute inset-0 grid place-items-center p-4 text-center text-sm text-muted">
            {sceneError}
          </p>
        )}
        {last && !rolling && (
          <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2 rounded-lg bg-ink/85 px-3 py-2 backdrop-blur">
            <div className="min-w-0">
              <div className="text-xs text-muted">{rollTitle(last)}</div>
              <div className="font-mono text-xl break-words">{rollDetail(last)}</div>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <CopyButton text={rollCopyText(last)} />
              <button
                type="button"
                onClick={() => onSendToChat(rollCopyText(last))}
                className="rounded-md border border-edge px-2 py-1 text-xs text-muted hover:border-gold hover:text-parchment"
              >
                В чат
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <p className="border-t border-edge px-3 py-2 text-sm text-fumble">{error}</p>}

      <div className="flex flex-wrap items-center gap-2 border-t border-edge p-2">
        <div className="flex items-center rounded-md border border-edge" aria-label="Количество кубов">
          <button
            type="button"
            disabled={rolling || count <= 1}
            onClick={() => setCount((c) => Math.max(1, c - 1))}
            className="px-3 py-2 text-lg text-parchment disabled:opacity-30"
            aria-label="Меньше кубов"
          >
            −
          </button>
          <span className="min-w-14 text-center font-mono" aria-live="polite">
            {count}×{die}
          </span>
          <button
            type="button"
            disabled={rolling || count >= maxCount}
            onClick={() => setCount((c) => Math.min(maxCount, c + 1))}
            className="px-3 py-2 text-lg text-parchment disabled:opacity-30"
            aria-label="Больше кубов"
          >
            +
          </button>
        </div>
        <button
          type="button"
          disabled={!enabled || rolling}
          onClick={() => void roll()}
          className="flex-1 rounded-md bg-blood px-4 py-2.5 font-medium text-parchment hover:bg-blood/80 disabled:opacity-40"
        >
          {rolling ? "Кубы катятся…" : "Бросить"}
        </button>
        {canReroll && (
          <button
            type="button"
            disabled={rolling || luckyLeft === 0}
            onClick={() => void reroll()}
            className="w-full rounded-md border border-gold px-4 py-2 text-sm text-gold hover:bg-gold/10 disabled:opacity-40 sm:w-auto"
          >
            Перебросить — Везунчик ({luckyLeft}/{lucky?.max ?? 3})
          </button>
        )}
      </div>
    </section>
  );
}
