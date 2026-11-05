// Справочник: заклинания, состояния, основы правил и правила кампании. Без спойлеров —
// только открытые правила и раздел «Правила» базы знаний.

import { useMemo, useState } from "react";
import { BASICS, CONDITIONS, EXHAUSTION } from "../data/reference";
import { WORLD_ENTRIES } from "../data/kb/world";
import { CLASS_LABELS, levelLabel, SPELLS, SRD_ATTRIBUTION, type SpellData } from "../data/spells/index.ts";
import Modal from "./Modal";
import { SpellText } from "./SpellCard";

type RefTab = "spells" | "conditions" | "basics" | "rules";

const TABS: { id: RefTab; label: string }[] = [
  { id: "spells", label: "Заклинания" },
  { id: "conditions", label: "Состояния" },
  { id: "basics", label: "Основы" },
  { id: "rules", label: "Правила кампании" },
];

const input =
  "rounded-md border border-edge bg-ink px-2 py-1.5 text-sm text-parchment placeholder:text-muted/70 focus:border-gold focus:outline-none";

function SpellDetail({ spell, onBack }: { spell: SpellData; onBack: () => void }) {
  return (
    <article className="space-y-3 p-4">
      <button type="button" onClick={onBack} className="text-sm text-muted hover:text-parchment">
        ← К списку
      </button>
      <header>
        <h3 className="font-serif text-2xl text-parchment">{spell.name}</h3>
        <p className="text-xs text-muted">
          {spell.nameEn} · {levelLabel(spell.level)}, {spell.school.toLowerCase()}
          {spell.ritual ? " · ритуал" : ""}
        </p>
      </header>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        <dt className="text-muted">Время</dt>
        <dd>{spell.castingTime}</dd>
        <dt className="text-muted">Дистанция</dt>
        <dd>{spell.range}</dd>
        <dt className="text-muted">Компоненты</dt>
        <dd>{spell.components}</dd>
        <dt className="text-muted">Длительность</dt>
        <dd>{spell.duration}</dd>
        <dt className="text-muted">Классы</dt>
        <dd>{spell.classes.map((c) => CLASS_LABELS[c] ?? c).join(", ")}</dd>
      </dl>
      <SpellText paragraphs={spell.desc} />
      {spell.higher.length > 0 && (
        <section>
          <h4 className="font-serif text-gold">На более высоком круге</h4>
          <SpellText paragraphs={spell.higher} />
        </section>
      )}
      <p className="text-[11px] text-muted">{spell.source === "srd" ? SRD_ATTRIBUTION : spell.sourceNote}</p>
    </article>
  );
}

function SpellsTab() {
  const [query, setQuery] = useState("");
  const [cls, setCls] = useState("");
  const [level, setLevel] = useState("");
  const [ritual, setRitual] = useState(false);
  const [concentration, setConcentration] = useState<"" | "yes" | "no">("");
  const [open, setOpen] = useState<SpellData | null>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SPELLS.filter(
      (s) =>
        (!q || s.name.toLowerCase().includes(q) || s.nameEn.toLowerCase().includes(q)) &&
        (!cls || s.classes.includes(cls)) &&
        (level === "" || s.level === Number(level)) &&
        (!ritual || s.ritual) &&
        (concentration === "" || s.concentration === (concentration === "yes")),
    ).sort((a, b) => a.level - b.level || a.name.localeCompare(b.name, "ru"));
  }, [query, cls, level, ritual, concentration]);

  if (open) return <SpellDetail spell={open} onBack={() => setOpen(null)} />;

  return (
    <div className="space-y-3 p-4">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Название по-русски или по-английски"
        aria-label="Поиск заклинания"
        className={`${input} w-full`}
      />
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <select value={cls} onChange={(e) => setCls(e.target.value)} className={input} aria-label="Класс">
          <option value="">Все классы</option>
          {Object.entries(CLASS_LABELS).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
        <select value={level} onChange={(e) => setLevel(e.target.value)} className={input} aria-label="Круг">
          <option value="">Все круги</option>
          {Array.from({ length: 10 }, (_, l) => (
            <option key={l} value={l}>
              {levelLabel(l)}
            </option>
          ))}
        </select>
        <select
          value={concentration}
          onChange={(e) => setConcentration(e.target.value as "" | "yes" | "no")}
          className={input}
          aria-label="Концентрация"
        >
          <option value="">Концентрация: любая</option>
          <option value="yes">С концентрацией</option>
          <option value="no">Без концентрации</option>
        </select>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={ritual} onChange={(e) => setRitual(e.target.checked)} className="h-4 w-4 accent-[var(--color-gold)]" />
          ритуалы
        </label>
      </div>
      <p className="text-xs text-muted">Найдено: {list.length}</p>
      <ul className="space-y-1">
        {list.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => setOpen(s)}
              className="flex w-full items-baseline justify-between gap-2 rounded-md border border-edge px-3 py-2 text-left hover:border-gold/60"
            >
              <span>
                <span className="font-medium">{s.name}</span>
                <span className="text-xs text-muted"> · {s.nameEn}</span>
              </span>
              <span className="shrink-0 text-[11px] text-muted">
                {levelLabel(s.level)}
                {s.concentration ? " · К" : ""}
                {s.ritual ? " · Р" : ""}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-muted">К — концентрация, Р — ритуал. {SRD_ATTRIBUTION}</p>
    </div>
  );
}

function ConditionsTab() {
  return (
    <div className="space-y-3 p-4 text-sm">
      {CONDITIONS.map((c) => (
        <section key={c.name} className="rounded-lg border border-edge p-3">
          <h3 className="font-serif text-gold">{c.name}</h3>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            {c.rules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>
      ))}
      <section className="rounded-lg border border-edge p-3">
        <h3 className="font-serif text-gold">Истощение</h3>
        <p className="text-xs text-muted">Эффекты складываются: на 3 уровне действуют и эффекты 1–2.</p>
        <table className="mt-1 w-full text-left">
          <tbody>
            {EXHAUSTION.map((e) => (
              <tr key={e.level} className="border-b border-edge/50">
                <td className="w-10 py-1 font-mono">{e.level}</td>
                <td className="py-1">{e.effect}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function BasicsTab() {
  return (
    <div className="space-y-3 p-4 text-sm">
      {BASICS.map((t) => (
        <section key={t.id} className="rounded-lg border border-edge p-3">
          <h3 className="font-serif text-gold">{t.title}</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {t.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
      ))}
      <p className="text-[11px] text-muted">Правила D&D 5e (2014) по System Reference Document 5.1, CC-BY-4.0, пересказ.</p>
    </div>
  );
}

function RulesTab() {
  const rules = WORLD_ENTRIES.filter((e) => e.section === "rules");
  return (
    <div className="space-y-3 p-4 text-sm">
      {rules.map((r) => (
        <section key={r.id} className="space-y-2 rounded-lg border border-edge p-3">
          <header>
            <div className="text-[11px] text-gold/80">{r.group}</div>
            <h3 className="font-serif text-lg text-parchment">{r.title}</h3>
            <p className="text-muted">{r.summary}</p>
          </header>
          {r.facts && r.facts.length > 0 && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              {r.facts.map((f) => (
                <div key={f.label} className="contents">
                  <dt className="text-muted">{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {r.body?.map((b, i) => (
            <div key={i}>
              {b.heading && <h4 className="font-serif text-gold">{b.heading}</h4>}
              <SpellText paragraphs={b.paragraphs} />
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

export default function ReferenceWindow({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<RefTab>("spells");
  return (
    <Modal title="Справочник" onClose={onClose} size="lg">
      <div className="grid grid-cols-2 gap-1 border-b border-edge p-2 sm:grid-cols-4" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-md px-3 py-2 text-sm font-medium ${tab === t.id ? "bg-gold text-ink" : "text-muted hover:text-parchment"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === "spells" && <SpellsTab />}
        {tab === "conditions" && <ConditionsTab />}
        {tab === "basics" && <BasicsTab />}
        {tab === "rules" && <RulesTab />}
      </div>
    </Modal>
  );
}
