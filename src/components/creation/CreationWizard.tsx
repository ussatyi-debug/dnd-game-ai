// Мастер создания героя: восемь шагов с возвратом к любому из них. Черновик сохраняется
// в памяти браузера — закрытое окно не теряет героя.

import { useEffect, useMemo, useState } from "react";
import worldMap from "../../assets/world-map.webp";
import { portraitUrl } from "../../data/rules/portraits.ts";
import { CLASSES } from "../../data/rules/classes/index.ts";
import { SPECIES } from "../../data/rules/species.ts";
import { averageHitDie, buildSpec, levelUpDraft, newDraft, portraitKey, resolve, STEPS, stepIssues, TIERS, type Draft, type StepId } from "../../lib/creation.ts";
import { QUICK_HEROES, quickDraft, type QuickHero } from "../../lib/quickstart.ts";
import { validateHero, type RecruitRequest } from "../../lib/engine";
import { parseSheetFile } from "../../lib/sheetExport";
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

/** Создание спутника: уровень не выше героя − 1; черновик — из предложения мастера. */
export interface CompanionMode {
  maxLevel: number;
  request: RecruitRequest | null;
}

interface CreationWizardProps {
  onClose: () => void;
  /** Подтверждение: лист уже собран; ошибку (например, отказ движка) мастер покажет. */
  onConfirm: (draft: Draft, spec: HeroSpec) => Promise<void>;
  /** Новый член отряда вместо нового героя. */
  companion?: CompanionMode;
  /** Повышение уровня: лист героя до повышения. */
  levelUp?: HeroSpec;
}

/** Шаги повышения уровня, когда выборы героя сохранены в листе. */
const LEVEL_UP_STEPS: StepId[] = ["class", "feats", "spells", "sheet"];

/** Черновик спутника по предложению мастера: что мастер назвал — уже выбрано. */
function companionDraft(mode: CompanionMode): Draft {
  const d = newDraft();
  const r = mode.request;
  const level = Math.max(1, Math.min(mode.maxLevel, r?.level || mode.maxLevel));
  d.level = level;
  d.tier = TIERS.find((t) => (t.levels as readonly number[]).includes(level))?.id ?? 3;
  if (!r) return d;
  d.name = r.name;
  if (SPECIES.some((x) => x.id === r.species)) d.speciesId = r.species;
  if (CLASSES.some((x) => x.id === r.class)) d.classId = r.class;
  if (r.subclass) d.picks["class.subclass"] = [r.subclass];
  if (r.background) d.backgroundId = r.background;
  if (r.gender === "f" || r.gender === "m") d.gender = r.gender;
  d.alignment = r.alignment;
  d.appearance = [r.appearance, r.note].filter(Boolean).join(" ");
  return d;
}

export default function CreationWizard({ onClose, onConfirm, companion, levelUp }: CreationWizardProps) {
  const [levelStart] = useState(() => (levelUp ? levelUpDraft(levelUp) : null));
  const [draft, setDraft] = useState<Draft>(() =>
    levelStart ? levelStart.draft : companion ? companionDraft(companion) : loadDraft(),
  );
  // Выборы сохранены в листе — только шаги нового уровня; иначе лист собирается заново.
  const steps = levelStart && !levelStart.fromSheet ? STEPS.filter((s) => LEVEL_UP_STEPS.includes(s.id)) : STEPS;
  const [step, setStep] = useState<StepId>(levelStart ? "class" : "species");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quick, setQuick] = useState(false);

  useEffect(() => {
    if (companion || levelUp) return;
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

  const index = steps.findIndex((s) => s.id === step);
  const issues = useMemo(() => {
    const list = stepIssues(draft, step);
    if (levelUp && step === "sheet" && draft.classId !== levelUp.classes[0]?.id) list.push("При повышении уровня класс не меняется");
    return list;
  }, [draft, step, levelUp]);
  const spec = useMemo(() => {
    if (step !== "sheet") return null;
    const built = buildSpec(draft, levelUp ? levelUp.kind : companion ? "companion" : "player");
    if (levelUp) {
      built.id = levelUp.id;
      built.xp = levelUp.xp;
      if (levelUp.portrait) built.portrait = levelUp.portrait;
    }
    return built;
  }, [draft, step, companion, levelUp]);
  const go = (i: number) => {
    const next = steps[Math.max(0, Math.min(steps.length - 1, i))];
    if (next) {
      setStep(next.id);
      setError(null);
      document.getElementById("creation-body")?.scrollTo({ top: 0 });
    }
  };

  async function confirm() {
    if (!spec) return;
    if (companion && draft.level > companion.maxLevel) {
      setError(`Уровень спутника — не выше ${companion.maxLevel} (уровень героя − 1).`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onConfirm(draft, spec);
      if (!companion && !levelUp) window.localStorage.removeItem(DRAFT_KEY);
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

  /** Импорт листа из JSON, DOC или PDF: движок проверяет лист так же, как при создании, и игра начинается с ним. */
  async function importSheet(file: File) {
    setError(null);
    try {
      const spec = parseSheetFile(await file.text());
      const errors = await validateHero(spec);
      if (errors.length) throw new Error(`Лист не прошёл проверку движка: ${errors.join("; ")}`);
      const level = spec.classes.reduce((sum, c) => sum + c.level, 0) || 1;
      const imported = newDraft();
      imported.level = level;
      imported.tier = TIERS.find((t) => (t.levels as readonly number[]).includes(level))?.id ?? 3;
      imported.name = spec.name;
      setBusy(true);
      await onConfirm(imported, spec);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  /** Готовый герой: черновик заполнен целиком, открывается итоговый лист — можно сразу начать или поправить. */
  function chooseQuick(h: QuickHero) {
    setDraft(quickDraft(h));
    setQuick(false);
    setStep("sheet");
    setError(null);
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-ink">
      <img src={worldMap} alt="" aria-hidden="true" className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-15" />
      <header className="relative border-b border-edge bg-ink/90 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <h2 className="font-serif text-lg text-gold sm:text-xl">
            {levelUp
              ? `Повышение уровня · ${levelUp.name} → ${draft.level} ур.`
              : companion
                ? `Новый член отряда · до ${companion.maxLevel} ур.`
                : "Новый герой"}
          </h2>
          <div className="flex items-center gap-1">
            {!levelUp && (
              <>
            <label className="cursor-pointer rounded-md border border-edge px-2 py-1 text-xs hover:border-gold" title="Лист героя из файла JSON, DOC или PDF (экспорт листа)">
              Импорт листа
              <input
                type="file"
                accept=".json,.doc,.html,.pdf,application/json,application/msword,text/html,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) void importSheet(f);
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => setQuick((v) => !v)}
              className={`rounded-md border px-2 py-1 text-xs ${quick ? "border-gold bg-gold/15 text-gold" : "border-gold/60 text-gold hover:bg-gold/10"}`}
            >
              ⚡ Быстрый старт
            </button>
            <button type="button" onClick={reset} className="rounded-md px-2 py-1 text-xs text-muted hover:text-parchment">
              Сбросить
            </button>
              </>
            )}
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
          {steps.map((s, i) => {
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
          {levelStart && step === "class" && (
            <LevelUpIntro fromSheet={levelStart.fromSheet} draft={draft} update={update} />
          )}
          {quick && <QuickStart onPick={chooseQuick} maxLevel={companion?.maxLevel} />}
          {!quick && step === "species" && <StepSpecies draft={draft} update={update} />}
          {!quick && step === "background" && <StepBackground draft={draft} update={update} />}
          {!quick && step === "class" && (
            <StepClass
              draft={draft}
              update={update}
              levelUp={levelStart && !levelStart.fromSheet ? { subclassChosen: Boolean(levelStart.draft.picks["class.subclass"]?.length) && draft.level - 1 >= (resolve(draft).cls?.subclassLevel ?? 99) } : undefined}
            />
          )}
          {!quick && step === "feats" && <StepFeats draft={draft} update={update} />}
          {!quick && step === "spells" && <StepSpells draft={draft} update={update} />}
          {!quick && step === "abilities" && <StepAbilities draft={draft} update={update} />}
          {!quick && step === "details" && <StepDetails draft={draft} update={update} />}
          {!quick && step === "sheet" && spec && <HeroSheet draft={draft} spec={spec} />}
          {!quick && <Issues items={issues} />}
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
            {busy ? (levelUp ? "Повышаю…" : "Собираю мир…") : levelUp ? "Повысить уровень" : "Подтвердить и начать приключение"}
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

/** Повышение уровня: хиты нового уровня и подсказка, что выбрать. */
function LevelUpIntro({
  fromSheet,
  draft,
  update,
}: {
  fromSheet: boolean;
  draft: Draft;
  update: (mutate: (d: Draft) => void) => void;
}) {
  const die = resolve(draft).cls?.hitDie ?? 8;
  const i = draft.level - 2;
  const value = draft.hpRolls[i] ?? averageHitDie(die);
  const set = (v: number) =>
    update((d) => {
      d.hpMode = "manual";
      d.hpRolls[i] = Math.max(1, Math.min(die, v));
    });
  return (
    <section className="space-y-2 rounded-lg border border-gold/60 bg-gold/5 p-3 text-sm">
      <p>
        {fromSheet
          ? "Лист героя создан до версии 0.9.8, и прежние выборы в нём не сохранены: пройдите шаги заново (класс тот же). Снаряжение, золото и всё, что менялось в игре, останутся как есть."
          : "Выберите то, что даёт новый уровень: подкласс, увеличение характеристик или талант, новые заклинания и умения. Прежние выборы сохранены; снаряжение и состояние героя не меняются."}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-gold">Хиты {draft.level} уровня (d{die}):</span>
        <button type="button" onClick={() => set(averageHitDie(die))} className="rounded border border-edge px-2 py-1 text-xs hover:border-gold">
          Среднее ({averageHitDie(die)})
        </button>
        <button
          type="button"
          onClick={() => set(1 + Math.floor(Math.random() * die))}
          className="rounded border border-edge px-2 py-1 text-xs hover:border-gold"
        >
          Бросок d{die}
        </button>
        <label className="text-xs text-muted">
          Своё
          <input
            type="number"
            min={1}
            max={die}
            value={value}
            onChange={(e) => set(Number(e.target.value) || 1)}
            className="ml-1 w-14 rounded-md border border-edge bg-ink px-2 py-1 text-sm text-parchment"
          />
        </label>
        <span className="text-xs text-muted">сейчас: {value} + модификатор Телосложения</span>
      </div>
    </section>
  );
}

/** Готовые герои: по 4 на ступени «Уровни 1–3» и «Уровни 4–6». */
function QuickStart({ onPick, maxLevel }: { onPick: (h: QuickHero) => void; maxLevel?: number }) {
  const tiers: { tier: 1 | 2; title: string }[] = [
    { tier: 1, title: "Ступень 1 · 3 уровень" },
    { tier: 2, title: "Ступень 2 · 5 уровень" },
  ];
  return (
    <section className="space-y-4">
      <p className="text-sm text-parchment/80">
        Готовые герои: выберите — откроется итоговый лист. Можно сразу начать приключение или вернуться к любому шагу и поправить.
      </p>
      {tiers
        .filter((t) => !maxLevel || QUICK_HEROES.some((h) => h.tier === t.tier && h.level <= maxLevel))
        .map((t) => (
        <div key={t.tier} className="space-y-2">
          <h3 className="font-serif text-gold">{t.title}</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {QUICK_HEROES.filter((h) => h.tier === t.tier && (!maxLevel || h.level <= maxLevel)).map((h) => {
              const species = SPECIES.find((s) => s.id === h.speciesId);
              const cls = CLASSES.find((c) => c.id === h.classId);
              const img = portraitUrl(portraitKey(h.speciesId, h.gender));
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => onPick(h)}
                  className="flex gap-3 rounded-lg border border-edge bg-ink/80 p-2 text-left hover:border-gold"
                >
                  {img && <img src={img} alt="" className="h-20 w-16 shrink-0 rounded-md object-cover" />}
                  <span className="min-w-0">
                    <span className="block font-serif text-parchment">{h.name}</span>
                    <span className="block text-xs text-gold/90">
                      {[species?.name, cls ? `${cls.name} ${h.level}` : null].filter(Boolean).join(" · ")}
                    </span>
                    <span className="mt-1 block text-xs text-parchment/75">{h.pitch}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
