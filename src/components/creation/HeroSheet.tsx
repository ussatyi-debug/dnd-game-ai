// Итоговый лист героя: портрет в центре, медальоны характеристик с рунической каймой,
// ниже — защита, навыки, умения, атаки, заклинания и снаряжение. Орнамент — свой, векторный.

import { ABILITIES, modifier, SKILLS, SKILL_NAME } from "../../data/rules/common.ts";
import { portraitUrl } from "../../data/rules/portraits.ts";
import type { AbilityId } from "../../data/rules/types";
import { SPELL_BY_ID } from "../../data/spells/index.ts";
import { equipment, maxHp, resolve, signed, type Draft } from "../../lib/creation.ts";
import type { HeroSpec } from "../../lib/heroSpec";

/** Медальон характеристики: кольцо с насечками-рунами, значение и модификатор. */
function Medallion({ label, score, save }: { label: string; score: number; save: boolean }) {
  const mod = modifier(score);
  const ticks = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 100" className="h-20 w-20 sm:h-24 sm:w-24" aria-hidden="true">
        <defs>
          <radialGradient id="med-bg" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#2a2230" />
            <stop offset="100%" stopColor="#0d0b10" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="47" fill="url(#med-bg)" stroke="#d6aa5a" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="40" fill="none" stroke="#d6aa5a" strokeOpacity="0.5" strokeWidth="0.8" />
        {ticks.map((i) => {
          const a = (i / ticks.length) * Math.PI * 2;
          const long = i % 3 === 0;
          const r1 = 41.5;
          const r2 = long ? 46 : 44;
          return (
            <line
              key={i}
              x1={50 + r1 * Math.cos(a)}
              y1={50 + r1 * Math.sin(a)}
              x2={50 + r2 * Math.cos(a)}
              y2={50 + r2 * Math.sin(a)}
              stroke="#d6aa5a"
              strokeOpacity={long ? 0.9 : 0.45}
              strokeWidth={long ? 1.4 : 0.8}
            />
          );
        })}
        {[0, 90, 180, 270].map((deg) => (
          <path
            key={deg}
            d="M50 3 L53 8 L50 13 L47 8 Z"
            fill="#d6aa5a"
            fillOpacity="0.8"
            transform={`rotate(${deg} 50 50)`}
          />
        ))}
        <text x="50" y="47" textAnchor="middle" fontSize="24" fontFamily="Georgia, serif" fill="#efe3c6">
          {score}
        </text>
        <text x="50" y="68" textAnchor="middle" fontSize="13" fontFamily="Georgia, serif" fill="#d6aa5a">
          {signed(mod)}
        </text>
      </svg>
      <span className="mt-0.5 text-[11px] uppercase tracking-wider text-parchment/80">
        {label}
        {save && <span className="ml-1 text-gold" title="Владение спасброском">◆</span>}
      </span>
    </div>
  );
}

/** Силуэт вместо портрета, пока его нет. */
function Silhouette() {
  return (
    <svg viewBox="0 0 120 160" className="h-full w-full" aria-hidden="true">
      <rect width="120" height="160" fill="#0d0b10" />
      <circle cx="60" cy="52" r="20" fill="#2a2230" />
      <path d="M22 160 C24 110 40 86 60 86 C80 86 96 110 98 160 Z" fill="#2a2230" />
    </svg>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-edge bg-ink/70 px-2 py-1.5 text-center">
      <div className="font-serif text-xl text-gold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
    </div>
  );
}

export default function HeroSheet({ draft, spec }: { draft: Draft; spec: HeroSpec }) {
  const r = resolve(draft);
  const portrait = spec.portrait ? portraitUrl(spec.portrait) : null;
  const pb = r.pb;
  const ab = spec.abilities;
  const saves = new Set<AbilityId>(spec.save_proficiencies);
  const skill = new Map(spec.skills.map((s) => [s.skill, s.proficiency]));
  const eq = equipment(draft);
  const initiative = modifier(ab.dexterity) + spec.initiative_bonuses.reduce((s, b) => s + b.value, 0);
  const left = ABILITIES.slice(0, 3);
  const right = ABILITIES.slice(3);
  const spells = spec.casters.flatMap((c) => [
    ...c.cantrips.map((id) => ({ id, who: c.label })),
    ...[...c.known, ...c.prepared, ...c.always].map((id) => ({ id, who: c.label })),
  ]);
  const uniqueSpells = [...new Map(spells.map((s) => [s.id, s])).values()];

  return (
    <article
      className="mx-auto max-w-4xl rounded-xl border border-gold/50 p-3 shadow-2xl sm:p-5"
      style={{
        background:
          "radial-gradient(ellipse at top, rgba(214,170,90,0.08), transparent 60%), linear-gradient(180deg, #19141d 0%, #0e0c11 100%)",
      }}
    >
      <header className="mb-3 border-b border-gold/30 pb-2 text-center">
        <h2 className="font-serif text-3xl text-gold">{spec.name || "Безымянный герой"}</h2>
        <p className="text-sm text-parchment/85">
          {spec.species} · {spec.classes.map((c) => `${c.name}${c.subclass ? ` (${c.subclass})` : ""} ${c.level}`).join(", ")}
        </p>
        <p className="text-xs text-muted">
          {spec.background} · {spec.alignment || "мировоззрение не выбрано"} · опыт {spec.xp}
        </p>
      </header>

      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-4">
        <div className="flex flex-col gap-2">
          {left.map((a) => (
            <Medallion key={a.id} label={a.short} score={ab[a.id]} save={saves.has(a.id)} />
          ))}
        </div>
        <div className="mx-auto w-full max-w-[16rem] overflow-hidden rounded-[50%/40%] border-2 border-gold/60 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
          <div className="aspect-[3/4]">
            {portrait ? <img src={portrait} alt={spec.name} className="h-full w-full object-cover" /> : <Silhouette />}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {right.map((a) => (
            <Medallion key={a.id} label={a.short} score={ab[a.id]} save={saves.has(a.id)} />
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
        <Stat label="КД" value={String(spec.armor_class)} />
        <Stat label="Хиты" value={String(maxHp(draft))} />
        <Stat label="Скорость" value={`${spec.speed_ft} фт`} />
        <Stat label="Инициатива" value={signed(initiative)} />
        <Stat label="Мастерство" value={signed(pb)} />
        <Stat label="Кость хитов" value={`${draft.level}d${r.cls?.hitDie ?? "?"}`} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section>
          <h3 className="mb-1 font-serif text-gold">Спасброски и навыки</h3>
          <ul className="grid grid-cols-2 gap-x-3 text-sm">
            {ABILITIES.map((a) => (
              <li key={a.id} className="flex justify-between">
                <span className={saves.has(a.id) ? "text-gold" : ""}>Спасбросок {a.short}</span>
                <span>{signed(modifier(ab[a.id]) + (saves.has(a.id) ? pb : 0))}</span>
              </li>
            ))}
          </ul>
          <ul className="mt-2 grid grid-cols-2 gap-x-3 text-sm">
            {SKILLS.map((s) => {
              const p = skill.get(s.id);
              const bonus = modifier(ab[s.ability]) + (p === "expertise" ? 2 * pb : p === "proficient" ? pb : 0);
              return (
                <li key={s.id} className="flex justify-between">
                  <span className={p ? "text-gold" : "text-parchment/70"}>
                    {p === "expertise" ? "◆◆ " : p ? "◆ " : ""}
                    {SKILL_NAME[s.id]}
                  </span>
                  <span>{signed(bonus)}</span>
                </li>
              );
            })}
          </ul>
        </section>
        <section className="space-y-3">
          {spec.attacks.length > 0 && (
            <div>
              <h3 className="mb-1 font-serif text-gold">Атаки</h3>
              <ul className="space-y-0.5 text-sm">
                {spec.attacks.map((a) => {
                  const mod = a.ability ? modifier(ab[a.ability]) : 0;
                  return (
                    <li key={a.name} className="flex justify-between gap-2">
                      <span>{a.name}</span>
                      <span className="text-parchment/80">
                        {signed(mod + (a.proficient ? pb : 0))} · {a.damage_dice}
                        {mod ? signed(mod) : ""} {a.damage_type}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <div>
            <h3 className="mb-1 font-serif text-gold">Владения</h3>
            <ul className="space-y-0.5 text-sm">
              {spec.proficiencies.map((p) => (
                <li key={p.kind}>
                  <span className="text-muted">{p.kind}:</span> {p.text}
                </li>
              ))}
            </ul>
          </div>
          {uniqueSpells.length > 0 && (
            <div>
              <h3 className="mb-1 font-serif text-gold">Заклинания</h3>
              <p className="text-sm text-parchment/85">
                {uniqueSpells.map((s) => SPELL_BY_ID.get(s.id)?.name ?? s.id).join(", ")}
              </p>
            </div>
          )}
          <div>
            <h3 className="mb-1 font-serif text-gold">Снаряжение</h3>
            <p className="text-sm text-parchment/85">{eq.items.join(", ") || "—"}</p>
            <p className="text-sm text-gold">{eq.gold} зм</p>
          </div>
        </section>
      </div>

      <section className="mt-4">
        <h3 className="mb-1 font-serif text-gold">Умения и черты</h3>
        <ul className="grid gap-2 text-sm md:grid-cols-2">
          {spec.features.map((f, i) => (
            <li key={`${f.name}-${i}`} className="rounded-md border border-edge/60 bg-ink/40 px-2 py-1.5">
              <span className="text-gold">{f.name}</span> <span className="text-[11px] text-muted">· {f.source}</span>
              <p className="whitespace-pre-line text-xs text-parchment/80">{f.text}</p>
            </li>
          ))}
        </ul>
      </section>
      {spec.appearance && (
        <section className="mt-4">
          <h3 className="mb-1 font-serif text-gold">Внешность</h3>
          <p className="whitespace-pre-line text-sm text-parchment/85">{spec.appearance}</p>
        </section>
      )}
    </article>
  );
}
