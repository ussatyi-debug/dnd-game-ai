// Мастер создания героя: восемь шагов с возвратом к любому из них. Черновик сохраняется
// в памяти браузера — закрытое окно не теряет героя.

import { useEffect, useMemo, useState } from "react";
import worldMap from "../../assets/world-map.webp";
import { buildSpec, newDraft, STEPS, stepIssues, type Draft, type StepId } from "../../lib/creation.ts";
import type { HeroSpec } from "../../lib/heroSpec";
import HeroSheet from "./HeroSheet.tsx";
import { Issues } from "./parts.tsx";
import { StepAbilities, StepBackground, StepClass, StepDetails, StepFeats, StepSpecies, StepSpells } from "./steps.tsx";

const DRAFT_KEY = "dnd.creation.draft";

function loadDraft(): Draft {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (raw) {
      const d = JSON.parse(raw) as Draft;
      if (d.version === 1) return { ...newDraft(), ...d };
    }
  } catch {
    // Черновика нет или он повреждён — начинаем заново.
  }
  return newDraft();
}

interface CreationWizardProps {
  onClose: () => void;
  /** Подтверждение: лист уже собран; ошибку (например, отказ движка) мастер покажет. */
  onConfirm: (draft: Draft, spec: HeroSpec) => Promise<void>;
}

export default function CreationWizard({ onClose, onConfirm }: CreationWizardProps) {
  const [draft, setDraft] = useState<Draft>(loadDraft);
  const [step, setStep] = useState<StepId>("species");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Память браузера недоступна — черновик живёт до закрытия окна.
    }
  }, [draft]);

  const update = (mutate: (d: Draft) => void) =>
    setDraft((prev) => {
      const next = structuredClone(prev);
      mutate(next);
      return next;
    });

  const index = STEPS.findIndex((s) => s.id === step);
  const issues = useMemo(() => stepIssues(draft, step), [draft, step]);
  const spec = useMemo(() => (step === "sheet" ? buildSpec(draft) : null), [draft, step]);
  const go = (i: number) => {
    const next = STEPS[Math.max(0, Math.min(STEPS.length - 1, i))];
    if (next) {
      setStep(next.id);
      setError(null);
      document.getElementById("creation-body")?.scrollTo({ top: 0 });
    }
  };

  async function confirm() {
    if (!spec) return;
    setBusy(true);
    setError(null);
    try {
      await onConfirm(draft, spec);
      window.localStorage.removeItem(DRAFT_KEY);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    if (window.confirm("Начать создание героя заново? Все выборы будут сброшены.")) {
      setDraft(newDraft());
      setStep("species");
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-ink">
      <img src={worldMap} alt="" aria-hidden="true" className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-15" />
      <header className="relative border-b border-edge bg-ink/90 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <h2 className="font-serif text-lg text-gold sm:text-xl">Новый герой</h2>
          <div className="flex items-center gap-1">
            <button type="button" onClick={reset} className="rounded-md px-2 py-1 text-xs text-muted hover:text-parchment">
              Сбросить
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3 py-1 text-2xl leading-none text-muted hover:text-parchment"
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2" aria-label="Шаги">
          {STEPS.map((s, i) => {
            const ready = s.id !== "sheet" && stepIssues(draft, s.id).length === 0;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => go(i)}
                className={`shrink-0 rounded-full border px-3 py-1 text-xs ${
                  s.id === step ? "border-gold bg-gold/15 text-gold" : "border-edge text-parchment/80 hover:border-gold/60"
                }`}
              >
                <span className="mr-1 text-muted">{i + 1}</span>
                {s.title}
                {ready && <span className="ml-1 text-gold">✓</span>}
              </button>
            );
          })}
        </nav>
      </header>

      <main id="creation-body" className="relative flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl space-y-4 px-3 py-4 sm:px-5">
          {step === "species" && <StepSpecies draft={draft} update={update} />}
          {step === "background" && <StepBackground draft={draft} update={update} />}
          {step === "class" && <StepClass draft={draft} update={update} />}
          {step === "feats" && <StepFeats draft={draft} update={update} />}
          {step === "spells" && <StepSpells draft={draft} update={update} />}
          {step === "abilities" && <StepAbilities draft={draft} update={update} />}
          {step === "details" && <StepDetails draft={draft} update={update} />}
          {step === "sheet" && spec && <HeroSheet draft={draft} spec={spec} />}
          <Issues items={issues} />
          {error && <p className="rounded-md border border-fumble/60 bg-fumble/10 px-3 py-2 text-sm text-fumble">{error}</p>}
        </div>
      </main>

      <footer className="relative flex items-center justify-between gap-2 border-t border-edge bg-ink/95 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => go(index - 1)}
          className="rounded-lg border border-edge px-4 py-2 text-sm disabled:opacity-30"
        >
          ← Назад
        </button>
        {step === "sheet" ? (
          <button
            type="button"
            disabled={busy || issues.length > 0}
            onClick={confirm}
            className="rounded-lg border border-gold bg-gold/15 px-4 py-2 text-sm font-medium text-gold disabled:opacity-40"
          >
            {busy ? "Собираю мир…" : "Подтвердить и начать приключение"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => go(index + 1)}
            className="rounded-lg border border-gold px-4 py-2 text-sm text-gold hover:bg-gold/10"
          >
            Далее →
          </button>
        )}
      </footer>
    </div>
  );
}
