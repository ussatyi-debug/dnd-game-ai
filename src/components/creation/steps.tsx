// Шаги мастера создания: вид, предыстория, класс, таланты, заклинания, характеристики, личность.

import { useMemo, useState } from "react";
import { BACKGROUNDS, TOOL_CHOICE } from "../../data/rules/backgrounds.ts";
import { CLASSES } from "../../data/rules/classes/index.ts";
import {
  ABILITIES,
  ABILITY_NAME,
  ALIGNMENT_TEXT,
  ALIGNMENTS,
  ARTISAN_TOOLS,
  GAMING_SETS,
  modifier,
  MUSICAL_INSTRUMENTS,
  POINT_BUY_COST,
  POINT_BUY_TOTAL,
  SKILL_NAME,
  STANDARD_ARRAY,
} from "../../data/rules/common.ts";
import { FEAT_BY_ID } from "../../data/rules/feats.ts";
import { randomTags } from "../../data/rules/appearance.ts";
import { portraitUrl } from "../../data/rules/portraits.ts";
import { SPECIES } from "../../data/rules/species.ts";
import type { AbilityId } from "../../data/rules/types";
import { levelLabel, type SpellData } from "../../data/spells/index.ts";
import {
  abilityBonuses,
  averageHitDie,
  choiceSlots,
  classItems,
  equipment,
  tierKit,
  tierOf,
  featOptions,
  featSlots,
  finalAbilities,
  maxHp,
  pick,
  pointsSpent,
  portraitKey,
  resolve,
  roll4d6,
  SPECIES_LANGUAGE,
  signed,
  slotFeat,
  spellChoices,
  TIERS,
  type Draft,
  type StepId,
} from "../../lib/creation.ts";
import { ChoiceGroup, PickCard, Section, Segmented } from "./parts.tsx";

export type Update = (mutate: (d: Draft) => void) => void;

interface StepProps {
  draft: Draft;
  update: Update;
}

const setPick = (update: Update, key: string) => (values: string[]) =>
  update((d) => {
    d.picks[key] = values;
  });

/** Выборы правил на шаге (навыки, варианты, инструменты, языки). */
function RuleChoices({ draft, update, step }: StepProps & { step: StepId }) {
  const slots = choiceSlots(draft).filter((c) => c.step === step);
  if (slots.length === 0) return null;
  return (
    <div className="space-y-2">
      {slots.map((c) => (
        <ChoiceGroup
          key={c.key}
          label={c.label}
          source={c.source}
          count={c.count}
          options={c.options}
          value={pick(draft, c.key)}
          onChange={setPick(update, c.key)}
          columns
        />
      ))}
    </div>
  );
}

// ───────────────────────────── 1. Вид ─────────────────────────────

export function StepSpecies({ draft, update }: StepProps) {
  const r = resolve(draft);
  return (
    <div className="space-y-4">
      <Section
        title="Вид"
        hint="правила 2024 года: прибавки к характеристикам даёт предыстория, языки — Общий и два на выбор (шаг 7)"
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {SPECIES.map((s) => (
            <PickCard
              key={s.id}
              selected={draft.speciesId === s.id}
              title={s.name}
              badge={s.source === "phb" ? "Книга игрока" : undefined}
              summary={s.summary}
              onClick={() =>
                update((d) => {
                  if (d.speciesId !== s.id) {
                    // Язык прежнего вида снимается, язык нового — отмечается (его можно снять).
                    const prevLang = d.speciesId ? SPECIES_LANGUAGE[d.speciesId] : undefined;
                    const langs = pick(d, "lang.choice").filter((l) => l !== prevLang);
                    const lang = SPECIES_LANGUAGE[s.id];
                    d.picks["lang.choice"] = lang && !langs.includes(lang) && langs.length < 2 ? [lang, ...langs] : langs;
                    d.speciesId = s.id;
                    delete d.picks["species.lineage"];
                    delete d.picks["species.feat"];
                  }
                })
              }
            >
              <p className="text-xs text-muted">
                {s.size} · скорость {s.speed} фт{s.darkvision ? ` · тёмное зрение ${s.darkvision} фт` : ""}
              </p>
              <ul className="mt-1 space-y-1">
                {s.traits.map((t) => (
                  <li key={t.name}>
                    <span className="text-gold">{t.name}.</span> <span className="text-parchment/85">{t.text}</span>
                  </li>
                ))}
              </ul>
            </PickCard>
          ))}
        </div>
      </Section>

      {r.species?.lineage && (
        <Section title={`1.1 ${r.species.lineage.label}`}>
          <ChoiceGroup
            label={r.species.lineage.label}
            count={1}
            options={r.species.lineage.options}
            value={pick(draft, "species.lineage")}
            onChange={setPick(update, "species.lineage")}
            columns
          />
          {r.species.lineage.spellAbilityChoice && (
            <ChoiceGroup
              label="Заклинательная характеристика наследия"
              count={1}
              options={(["intelligence", "wisdom", "charisma"] as AbilityId[]).map((a) => ({ id: a, name: ABILITY_NAME[a] }))}
              value={pick(draft, "species.ability")}
              onChange={setPick(update, "species.ability")}
            />
          )}
        </Section>
      )}
      <RuleChoices draft={draft} update={update} step="species" />
    </div>
  );
}

// ───────────────────────────── 2. Предыстория ─────────────────────────────

export function StepBackground({ draft, update }: StepProps) {
  const bg = BACKGROUNDS.find((b) => b.id === draft.backgroundId);
  const mode = pick(draft, "bg.mode")[0] ?? "2-1";
  const feat = bg ? FEAT_BY_ID.get(bg.feat) : undefined;
  const toolChoice = bg ? TOOL_CHOICE[bg.tool] : undefined;
  const toolList =
    bg?.tool === "choice:artisan" ? ARTISAN_TOOLS : bg?.tool === "choice:instrument" ? MUSICAL_INSTRUMENTS : GAMING_SETS;
  const kit = pick(draft, "equip.bg")[0] ?? "kit";
  return (
    <div className="space-y-4">
      <Section title="Предыстория" hint="прибавки к характеристикам, стартовый талант, навыки и инструмент">
        <div className="grid gap-2 sm:grid-cols-2">
          {BACKGROUNDS.map((b) => (
            <PickCard
              key={b.id}
              selected={draft.backgroundId === b.id}
              title={b.name}
              badge={b.source === "phb" ? "Книга игрока" : undefined}
              summary={b.summary}
              onClick={() =>
                update((d) => {
                  if (d.backgroundId === b.id) return;
                  d.backgroundId = b.id;
                  for (const k of Object.keys(d.picks)) if (k.startsWith("bg.")) delete d.picks[k];
                })
              }
            >
              <p className="text-xs text-parchment/85">
                Характеристики: {b.abilities.map((a) => ABILITY_NAME[a]).join(", ")} · Навыки:{" "}
                {b.skills.map((s) => SKILL_NAME[s]).join(", ")} · Инструмент: {TOOL_CHOICE[b.tool] ?? b.tool} · Талант:{" "}
                {FEAT_BY_ID.get(b.feat)?.name}
              </p>
            </PickCard>
          ))}
        </div>
      </Section>

      {bg && (
        <>
          <Section title="Прибавки к характеристикам" hint="бонус ложится поверх значений, купленных на шаге 6">
            <Segmented
              value={mode}
              options={[
                { id: "2-1", label: "+2 и +1" },
                { id: "1-1-1", label: "+1 / +1 / +1" },
              ]}
              onChange={(v) => setPick(update, "bg.mode")([v])}
            />
            {mode === "2-1" && (
              <div className="grid gap-2 sm:grid-cols-2">
                <ChoiceGroup
                  label="+2"
                  count={1}
                  options={bg.abilities.map((a) => ({ id: a, name: ABILITY_NAME[a] }))}
                  value={pick(draft, "bg.plus2")}
                  onChange={setPick(update, "bg.plus2")}
                />
                <ChoiceGroup
                  label="+1"
                  count={1}
                  options={bg.abilities.map((a) => ({ id: a, name: ABILITY_NAME[a], disabled: pick(draft, "bg.plus2")[0] === a }))}
                  value={pick(draft, "bg.plus1")}
                  onChange={setPick(update, "bg.plus1")}
                />
              </div>
            )}
          </Section>
          {toolChoice && (
            <ChoiceGroup
              label={toolChoice}
              count={1}
              options={toolList.map((t) => ({ id: t, name: t }))}
              value={pick(draft, "bg.tool")}
              onChange={setPick(update, "bg.tool")}
            />
          )}
          {feat && (
            <Section title={`Стартовый талант: ${feat.name}`}>
              <p className="text-sm text-parchment/85">{feat.text}</p>
              {bg.featNote && (
                <p className="text-xs text-muted">
                  Список заклинаний: {bg.featNote === "cleric" ? "жрец" : bg.featNote === "druid" ? "друид" : "волшебник"} —
                  заклинания выбираются на шаге 5.
                </p>
              )}
            </Section>
          )}
          <RuleChoices draft={draft} update={update} step="background" />
          <Section title="Снаряжение предыстории">
            <Segmented
              value={kit}
              options={[
                { id: "kit", label: `Набор + ${bg.equipment.gold} зм` },
                { id: "gold", label: `${bg.equipment.altGold} зм` },
              ]}
              onChange={(v) => setPick(update, "equip.bg")([v])}
            />
            {kit === "kit" && <p className="text-xs text-parchment/75">{bg.equipment.items.join(", ")}</p>}
          </Section>
        </>
      )}
    </div>
  );
}

// ───────────────────────────── 3. Класс ─────────────────────────────

export function StepClass({ draft, update }: StepProps) {
  const r = resolve(draft);
  const tier = TIERS.find((t) => t.id === draft.tier) ?? TIERS[0];
  const kit = pick(draft, "equip.class")[0] ?? "kit";
  return (
    <div className="space-y-4">
      <Section title="Уровень начала" hint="ступень определяет день кампании, в который появится герой">
        <div className="flex flex-wrap gap-2">
          <Segmented
            value={String(draft.tier) as "1" | "2" | "3"}
            options={TIERS.map((t) => ({ id: String(t.id) as "1" | "2" | "3", label: t.label }))}
            onChange={(v) =>
              update((d) => {
                d.tier = Number(v) as 1 | 2 | 3;
                const t = TIERS.find((x) => x.id === d.tier);
                d.level = t?.levels[0] ?? 1;
                d.hpRolls = [];
              })
            }
          />
          <Segmented
            value={String(draft.level)}
            options={tier.levels.map((l) => ({ id: String(l), label: `${l} ур.` }))}
            onChange={(v) =>
              update((d) => {
                d.level = Number(v);
                d.hpRolls = d.hpRolls.slice(0, d.level - 1);
              })
            }
          />
        </div>
        <p className="text-xs text-muted">
          {tier.days ? `Герой появится в мире между ${tier.days[0]} и ${tier.days[1]} днём кампании.` : "Герой появится в актуальное время кампании."}{" "}
          Место — случайное.
        </p>
      </Section>

      <Section title="Класс">
        <div className="grid gap-2 sm:grid-cols-2">
          {CLASSES.map((c) => (
            <PickCard
              key={c.id}
              selected={draft.classId === c.id}
              title={c.name}
              badge={`d${c.hitDie}`}
              summary={c.summary}
              onClick={() =>
                update((d) => {
                  if (d.classId === c.id) return;
                  d.classId = c.id;
                  const keep = (k: string) => k.startsWith("species.") || k.startsWith("bg.") || k === "lang.choice" || k === "equip.bg";
                  for (const k of Object.keys(d.picks)) if (!keep(k)) delete d.picks[k];
                })
              }
            >
              <p className="text-xs text-parchment/85">
                Основные: {c.primary.map((a) => ABILITY_NAME[a]).join(", ")} · Спасброски:{" "}
                {c.saves.map((a) => ABILITY_NAME[a]).join(", ")}
              </p>
              <p className="text-xs text-parchment/70">
                {c.armor}. {c.weapons}.{c.tools ? ` ${c.tools}.` : ""}
              </p>
              <ul className="mt-1 space-y-0.5 text-xs">
                {c.features
                  .filter((f) => f.level <= draft.level && f.name !== "Увеличение характеристик")
                  .map((f) => (
                    <li key={`${f.level}-${f.name}`}>
                      <span className="text-muted">{f.level} ур.</span> <span className="text-gold">{f.name}</span>
                    </li>
                  ))}
              </ul>
            </PickCard>
          ))}
        </div>
      </Section>

      {r.cls && draft.level >= r.cls.subclassLevel && (
        <Section title="3.1 Подкласс" hint={`с ${r.cls.subclassLevel} уровня`}>
          <div className="grid gap-2 sm:grid-cols-2">
            {r.cls.subclasses.map((s) => (
              <PickCard
                key={s.id}
                selected={pick(draft, "class.subclass")[0] === s.id}
                title={s.name}
                summary={s.summary}
                onClick={() => setPick(update, "class.subclass")([s.id])}
              >
                <ul className="space-y-1 text-xs">
                  {s.features
                    .filter((f) => f.level <= draft.level)
                    .map((f) => (
                      <li key={f.name}>
                        <span className="text-gold">{f.name}.</span> {f.text}
                      </li>
                    ))}
                </ul>
              </PickCard>
            ))}
          </div>
          <p className="text-xs text-muted">Другие подклассы Книги игрока добавим следующим обновлением.</p>
        </Section>
      )}

      {r.cls && draft.level > 1 && <ClassLevels draft={draft} />}

      {r.cls && (
        <>
          <Section title="3.2 Навыки, экспертиза и мастерство">
            <RuleChoices draft={draft} update={update} step="class" />
          </Section>
          <Section title="Снаряжение класса">
            <Segmented
              value={kit}
              options={[
                { id: "kit", label: `Набор + ${r.cls.equipment.gold} зм` },
                { id: "gold", label: `${r.cls.equipment.altGold} зм` },
              ]}
              onChange={(v) => setPick(update, "equip.class")([v])}
            />
            {kit === "kit" && <p className="text-xs text-parchment/75">{r.cls.equipment.items.join(", ")}</p>}
          </Section>
        </>
      )}
    </div>
  );
}

/** Новые умения класса и подкласса по уровням: что герой получил на пути к стартовому уровню. */
function ClassLevels({ draft }: { draft: Draft }) {
  const r = resolve(draft);
  if (!r.cls) return null;
  const all = [
    ...r.cls.features.map((f) => ({ ...f, from: r.cls!.name })),
    ...(r.subclass?.features ?? []).map((f) => ({ ...f, from: r.subclass!.name })),
  ].filter((f) => f.level <= draft.level);
  const levels = [...new Set(all.map((f) => f.level))].sort((a, b) => a - b);
  return (
    <Section title="Новые умения класса" hint="по уровням до стартового">
      <ol className="space-y-2 text-xs">
        {levels.map((lvl) => (
          <li key={lvl} className="rounded-md border border-edge/60 p-2">
            <p className="font-serif text-gold">{lvl} уровень</p>
            <ul className="mt-1 space-y-1">
              {all
                .filter((f) => f.level === lvl)
                .map((f) => (
                  <li key={`${f.from}-${f.name}`}>
                    <span className="text-parchment">{f.name}</span>
                    <span className="text-muted"> · {f.from}</span>
                    {f.choices?.length ? <span className="text-gold/80"> · выбор ниже</span> : null}
                    <p className="text-parchment/75">{f.text}</p>
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ol>
    </Section>
  );
}

// ───────────────────────────── 4. Таланты ─────────────────────────────

export function StepFeats({ draft, update }: StepProps) {
  const slots = featSlots(draft).filter((s) => !s.fixed);
  return (
    <div className="space-y-4">
      {slots.length === 0 && (
        <p className="text-sm text-parchment/80">
          Стартовый талант уже даёт предыстория. Новые таланты класс даёт на 4, 8, 12 и 16 уровнях (у воина и плута — чаще).
        </p>
      )}
      {slots.map((slot) => {
        const feat = slotFeat(draft, slot);
        const options = featOptions(draft, slot);
        return (
          <Section key={slot.key} title={slot.label}>
            <ChoiceGroup
              label="Талант"
              count={1}
              options={options.map((f) => ({
                id: f.id,
                name: f.name,
                text: [f.prerequisite ? `Требование: ${f.prerequisite}.` : "", f.text].filter(Boolean).join(" "),
                note: f.source === "phb" ? "КИ" : undefined,
              }))}
              value={feat ? [feat.id] : []}
              onChange={(v) =>
                update((d) => {
                  d.picks[slot.key] = v;
                  for (const k of Object.keys(d.picks)) if (k.startsWith(`${slot.key}:`)) delete d.picks[k];
                })
              }
              columns
            />
            {feat?.abilityIncrease && feat.abilityIncrease.length > 1 && (
              <ChoiceGroup
                label={feat.id === "ability_score_improvement" ? "+1 к двум характеристикам (или дважды к одной)" : "+1 к характеристике"}
                count={feat.id === "ability_score_improvement" ? 2 : 1}
                options={feat.abilityIncrease.map((a) => ({ id: a, name: ABILITY_NAME[a] }))}
                value={pick(draft, `${slot.key}:abilities`)}
                onChange={setPick(update, `${slot.key}:abilities`)}
              />
            )}
            {feat?.id === "ability_score_improvement" && (
              <button
                type="button"
                className="text-xs text-gold underline"
                onClick={() =>
                  update((d) => {
                    const first = pick(d, `${slot.key}:abilities`)[0];
                    if (first) d.picks[`${slot.key}:abilities`] = [first, first];
                  })
                }
              >
                +2 к первой выбранной характеристике
              </button>
            )}
          </Section>
        );
      })}
      <RuleChoices draft={draft} update={update} step="feats" />
    </div>
  );
}

// ───────────────────────────── 5. Заклинания ─────────────────────────────

function SpellPicker({
  label,
  count,
  options,
  value,
  onChange,
}: {
  label: string;
  count: number;
  options: SpellData[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const need = Math.min(count, options.length);
  const shown = options.filter((s) => {
    const q = query.trim().toLowerCase();
    return !q || s.name.toLowerCase().includes(q) || s.nameEn.toLowerCase().includes(q);
  });
  const toggle = (id: string) => {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else if (count === 1) onChange([id]);
    else if (value.length < count) onChange([...value, id]);
  };
  return (
    <div className="rounded-lg border border-edge/70 bg-ink/40 p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        <span className={`text-xs ${value.length === need ? "text-gold" : "text-fumble"}`}>
          {value.length}/{need}
        </span>
      </div>
      {options.length > 10 && (
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск заклинания"
          className="mb-2 w-full rounded-md border border-edge bg-ink px-3 py-1.5 text-sm"
        />
      )}
      <ul className="max-h-80 space-y-1 overflow-y-auto pr-1">
        {shown.map((s) => {
          const on = value.includes(s.id);
          return (
            <li key={s.id} className={`rounded-md border ${on ? "border-gold bg-gold/10" : "border-edge/60"}`}>
              <div className="flex items-center gap-2 px-2 py-1.5">
                <button type="button" onClick={() => toggle(s.id)} className="flex-1 text-left text-sm">
                  <span className={on ? "text-gold" : ""}>{on ? "◆ " : "◇ "}{s.name}</span>
                  <span className="ml-1 text-[11px] text-muted">
                    {levelLabel(s.level)} · {s.school}
                    {s.concentration ? " · К" : ""}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(open === s.id ? null : s.id)}
                  className="px-1 text-xs text-muted hover:text-parchment"
                  aria-label="Описание"
                >
                  {open === s.id ? "▴" : "▾"}
                </button>
              </div>
              {open === s.id && (
                <div className="space-y-1 px-2 pb-2 text-xs text-parchment/80">
                  <p className="text-muted">
                    {s.castingTime} · {s.range} · {s.duration}
                  </p>
                  {s.desc.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function StepSpells({ draft, update }: StepProps) {
  const choices = spellChoices(draft);
  const r = resolve(draft);
  const miSlots = featSlots(draft).filter((s) => slotFeat(draft, s)?.id === "magic_initiate");
  if (choices.length === 0) {
    return (
      <p className="text-sm text-parchment/80">
        {r.cls ? `${r.cls.name} на этом уровне не творит заклинаний.` : "Сначала выберите класс."} Врождённая магия вида (если есть)
        добавится в лист сама.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {r.cls?.spellcasting && (
        <p className="text-xs text-muted">
          Заклинательная характеристика — {ABILITY_NAME[r.cls.spellcasting.ability]}.{" "}
          {r.cls.spellcasting.preparation === "known"
            ? "Список меняется при повышении уровня."
            : "Подготовку можно менять после длительного отдыха."}{" "}
          Заклинания подкласса и класса, которые всегда подготовлены, добавятся сами.
        </p>
      )}
      <RuleChoices draft={draft} update={update} step="spells" />
      {miSlots.map((slot) => (
        <ChoiceGroup
          key={slot.key}
          label="Посвящённый в магию: заклинательная характеристика"
          count={1}
          options={(["intelligence", "wisdom", "charisma"] as AbilityId[]).map((a) => ({ id: a, name: ABILITY_NAME[a] }))}
          value={pick(draft, `${slot.key}:mi.ability`)}
          onChange={setPick(update, `${slot.key}:mi.ability`)}
        />
      ))}
      {choices.map((c) => (
        <SpellPicker
          key={c.key}
          label={c.label}
          count={c.count}
          options={c.options}
          value={pick(draft, c.key)}
          onChange={setPick(update, c.key)}
        />
      ))}
    </div>
  );
}

// ───────────────────────────── 6. Характеристики ─────────────────────────────

export function StepAbilities({ draft, update }: StepProps) {
  const final = finalAbilities(draft);
  const bonuses = abilityBonuses(draft);
  const spent = pointsSpent(draft.base);
  const left = POINT_BUY_TOTAL - spent;
  const assigned = (a: AbilityId) => pick(draft, `roll.${a}`)[0];
  const usedIdx = new Set(ABILITIES.map((a) => assigned(a.id)).filter(Boolean));

  function setBase(a: AbilityId, v: number) {
    update((d) => {
      d.base[a] = v;
    });
  }
  function rollAll() {
    update((d) => {
      d.rolled = Array.from({ length: 6 }, () => roll4d6());
      for (const a of ABILITIES) {
        delete d.picks[`roll.${a.id}`];
        d.base[a.id] = 0;
      }
    });
  }
  return (
    <div className="space-y-4">
      <Segmented
        value={draft.abilityMethod}
        options={[
          { id: "point", label: "Покупка очков" },
          { id: "roll", label: "Бросок 4d6" },
        ]}
        onChange={(v) =>
          update((d) => {
            d.abilityMethod = v;
            d.base = { strength: 8, dexterity: 8, constitution: 8, intelligence: 8, wisdom: 8, charisma: 8 };
            d.rolled = [];
            for (const k of Object.keys(d.picks)) if (k.startsWith("roll.")) delete d.picks[k];
            if (v === "roll") for (const a of ABILITIES) d.base[a.id] = 0;
          })
        }
      />
      {draft.abilityMethod === "point" ? (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span>
            Свободных очков: <span className={left < 0 ? "text-fumble" : "text-gold"}>{left}</span> из {POINT_BUY_TOTAL}
            <span className="ml-2 text-xs text-muted">значения 8–15 до прибавок</span>
          </span>
          <button
            type="button"
            className="rounded-md border border-edge px-2 py-1 text-xs hover:border-gold"
            onClick={() =>
              update((d) => {
                const order = resolve(d).cls?.primary ?? [];
                const rest = ABILITIES.map((a) => a.id).filter((a) => !order.includes(a));
                [...order, ...rest].forEach((a, i) => (d.base[a] = STANDARD_ARRAY[i] ?? 8));
              })
            }
          >
            Стандартный набор 15·14·13·12·10·8
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button type="button" onClick={rollAll} className="rounded-md border border-gold px-3 py-1.5 text-gold hover:bg-gold/10">
            🎲 {draft.rolled.length ? "Перебросить все" : "Бросить 6 раз по 4d6"}
          </button>
          {draft.rolled.length > 0 && (
            <span className="text-xs text-muted">
              Выпало: {draft.rolled.join(", ")} — распределите значения по характеристикам.
            </span>
          )}
        </div>
      )}
      <ul className="space-y-1.5">
        {ABILITIES.map((a) => {
          const base = draft.base[a.id];
          const plus = bonuses.filter((b) => b.ability === a.id);
          const cost = POINT_BUY_COST[base];
          const next = POINT_BUY_COST[base + 1];
          return (
            <li key={a.id} className="flex items-center gap-3 rounded-lg border border-edge/70 bg-ink/40 px-3 py-2">
              <span className="w-28 shrink-0 text-sm sm:w-36">{a.name}</span>
              {draft.abilityMethod === "point" ? (
                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={base <= 8}
                    onClick={() => setBase(a.id, base - 1)}
                    className="h-8 w-8 rounded-md border border-edge text-lg disabled:opacity-30"
                    aria-label={`Уменьшить ${a.name}`}
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-serif text-lg">{base}</span>
                  <button
                    type="button"
                    disabled={base >= 15 || next === undefined || cost === undefined || next - cost > left}
                    onClick={() => setBase(a.id, base + 1)}
                    className="h-8 w-8 rounded-md border border-edge text-lg disabled:opacity-30"
                    aria-label={`Увеличить ${a.name}`}
                  >
                    +
                  </button>
                </span>
              ) : (
                <select
                  value={assigned(a.id) ?? ""}
                  onChange={(e) =>
                    update((d) => {
                      const idx = e.target.value;
                      d.picks[`roll.${a.id}`] = idx ? [idx] : [];
                      d.base[a.id] = idx ? (d.rolled[Number(idx)] ?? 0) : 0;
                    })
                  }
                  className="rounded-md border border-edge bg-ink px-2 py-1 text-sm"
                >
                  <option value="">—</option>
                  {draft.rolled.map((v, i) => (
                    <option key={i} value={String(i)} disabled={usedIdx.has(String(i)) && assigned(a.id) !== String(i)}>
                      {v}
                    </option>
                  ))}
                </select>
              )}
              <span className="flex-1 text-right text-xs text-muted">
                {plus.map((p) => `${signed(p.value)} ${p.source}`).join(", ")}
              </span>
              <span className="w-16 text-right">
                <span className="font-serif text-lg text-gold">{final[a.id] || "—"}</span>
                <span className="ml-1 text-xs text-muted">{final[a.id] ? signed(modifier(final[a.id])) : ""}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ───────────────────────────── 7. Личность ─────────────────────────────

/** 13 случайных тегов внешности; нажатие добавляет тег в описание или убирает его. */
function AppearanceTags({ draft, update }: StepProps) {
  const [tags, setTags] = useState<string[]>(() => randomTags(draft.speciesId));
  const parts = draft.appearance
    .split(/,\s*/)
    .map((t) => t.trim())
    .filter(Boolean);
  function toggle(tag: string) {
    update((d) => {
      const list = d.appearance
        .split(/,\s*/)
        .map((t) => t.trim())
        .filter(Boolean);
      const next = list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag];
      d.appearance = next.join(", ").slice(0, 800);
    });
  }
  return (
    <span className="mt-1 mb-1.5 flex flex-wrap items-center gap-1.5">
      {tags.map((t) => {
        const on = parts.includes(t);
        return (
          <button
            key={t}
            type="button"
            onClick={() => toggle(t)}
            className={`rounded-full border px-2.5 py-0.5 text-xs ${on ? "border-gold bg-gold/15 text-gold" : "border-edge text-parchment/85 hover:border-gold/60"}`}
          >
            {t}
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => setTags(randomTags(draft.speciesId))}
        className="rounded-full border border-gold/60 px-2.5 py-0.5 text-xs text-gold"
        aria-label="Другие теги"
        title="Другие теги"
      >
        🎲 ещё
      </button>
    </span>
  );
}

/** Снаряжение по источникам: класс, предыстория. */
function EquipmentBreakdown({ draft }: { draft: Draft }) {
  const r = resolve(draft);
  const bg = BACKGROUNDS.find((b) => b.id === draft.backgroundId);
  const rows: { label: string; items: string[]; gold: number }[] = [];
  if (r.cls) {
    const gold = pick(draft, "equip.class")[0] === "gold";
    rows.push({ label: `Класс (${r.cls.name})`, items: gold ? [] : classItems(draft), gold: gold ? r.cls.equipment.altGold : r.cls.equipment.gold });
  }
  if (bg) {
    const gold = pick(draft, "equip.bg")[0] === "gold";
    rows.push({ label: `Предыстория (${bg.name})`, items: gold ? [] : bg.equipment.items, gold: gold ? bg.equipment.altGold : bg.equipment.gold });
  }
  const kit = tierKit(draft);
  if (kit.items.length || kit.gold) rows.push({ label: `Набор ступени ${tierOf(draft.level)} (ур. ${draft.level})`, items: kit.items, gold: kit.gold });
  return (
    <ul className="space-y-1 text-sm">
      {rows.map((row) => (
        <li key={row.label}>
          <span className="text-muted">{row.label}:</span> {row.items.join(", ") || "только золото"}{" "}
          <span className="text-gold">+ {row.gold} зм</span>
        </li>
      ))}
    </ul>
  );
}

export function StepDetails({ draft, update }: StepProps) {
  const r = resolve(draft);
  const die = r.cls?.hitDie ?? 8;
  const portrait = r.species ? portraitUrl(portraitKey(r.species.id, draft.gender)) : null;
  const eq = useMemo(() => equipment(draft), [draft]);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
        <div className="space-y-3">
          <label className="block text-sm">
            Имя
            <input
              value={draft.name}
              maxLength={60}
              onChange={(e) => update((d) => void (d.name = e.target.value))}
              className="mt-1 w-full rounded-md border border-edge bg-ink px-3 py-2"
              placeholder="Как зовут героя"
            />
          </label>
          <Segmented
            value={draft.gender}
            options={[
              { id: "m", label: "Мужчина" },
              { id: "f", label: "Женщина" },
            ]}
            onChange={(v) => update((d) => void (d.gender = v))}
          />
          <fieldset className="text-sm">
            <legend>Мировоззрение</legend>
            <div className="mt-1 grid grid-cols-1 gap-1 sm:grid-cols-3">
              {ALIGNMENTS.map((a) => {
                const on = draft.alignment === a;
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => update((d) => void (d.alignment = a))}
                    title={ALIGNMENT_TEXT[a]}
                    aria-pressed={on}
                    className={`rounded-md border px-2 py-1.5 text-left ${on ? "border-gold bg-gold/10" : "border-edge hover:border-gold/60"}`}
                  >
                    <span className={`block text-xs font-medium ${on ? "text-gold" : ""}`}>{a}</span>
                    <span className="block text-[11px] leading-snug text-muted">{ALIGNMENT_TEXT[a]}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>
        <div className="mx-auto w-36 overflow-hidden rounded-lg border border-edge bg-ink">
          {portrait ? (
            <img src={portrait} alt="Портрет" className="aspect-[3/4] w-full object-cover" />
          ) : (
            <div className="flex aspect-[3/4] items-center justify-center text-xs text-muted">портрет скоро</div>
          )}
        </div>
      </div>
      <div className="block text-sm">
        <span>Внешность и характер</span>
        <AppearanceTags draft={draft} update={update} />
        <textarea
          aria-label="Внешность и характер"
          value={draft.appearance}
          rows={3}
          maxLength={800}
          onChange={(e) => update((d) => void (d.appearance = e.target.value))}
          className="mt-1 w-full rounded-md border border-edge bg-ink px-3 py-2 text-sm"
          placeholder="Рост, глаза, шрамы, манера говорить, что движет героем"
        />
      </div>
      <RuleChoices draft={draft} update={update} step="details" />

      {draft.level > 1 && (
        <Section title="Хиты за уровни" hint={`кость хитов d${die}, сейчас максимум ${maxHp(draft)}`}>
          <Segmented
            value={draft.hpMode}
            options={[
              { id: "average", label: `Среднее (${averageHitDie(die)})` },
              { id: "roll", label: "Бросок" },
              { id: "manual", label: "Свои значения" },
            ]}
            onChange={(v) =>
              update((d) => {
                d.hpMode = v;
                d.hpRolls =
                  v === "roll"
                    ? Array.from({ length: d.level - 1 }, () => 1 + Math.floor(Math.random() * die))
                    : v === "manual"
                      ? Array.from({ length: d.level - 1 }, () => averageHitDie(die))
                      : [];
              })
            }
          />
          {draft.hpMode !== "average" && (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: draft.level - 1 }, (_, i) => (
                <label key={i} className="text-xs text-muted">
                  {i + 2} ур.
                  <input
                    type="number"
                    min={1}
                    max={die}
                    value={draft.hpRolls[i] ?? ""}
                    readOnly={draft.hpMode === "roll"}
                    onChange={(e) =>
                      update((d) => {
                        d.hpRolls[i] = Math.max(1, Math.min(die, Number(e.target.value) || 1));
                      })
                    }
                    className="ml-1 w-14 rounded-md border border-edge bg-ink px-2 py-1 text-sm text-parchment"
                  />
                </label>
              ))}
            </div>
          )}
        </Section>
      )}

      <Section title="Снаряжение и золото">
        <EquipmentBreakdown draft={draft} />
        <p className="text-sm text-gold">Итого: {eq.gold} зм</p>
      </Section>
    </div>
  );
}
