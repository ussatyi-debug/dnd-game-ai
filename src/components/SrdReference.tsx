// Справочник SRD 5.2.1 и Книги игрока 2024: бестиарий, магические предметы, таланты, подклассы.
// Данные — data/rules/*.json (перевод), грузятся при первом открытии вкладки: файлы большие.

import { useEffect, useMemo, useState } from "react";
import monstersUrl from "../../data/rules/monsters.json?url";
import itemsUrl from "../../data/rules/magic_items.json?url";
import featsUrl from "../../data/rules/feats.json?url";
import phbFeatsUrl from "../../data/rules/phb_feats.json?url";
import subclassesUrl from "../../data/rules/subclasses.json?url";
import { CLASS_LABELS } from "../data/spells/index.ts";
import { SpellText } from "./SpellCard";

export type SrdKind = "monsters" | "items" | "feats" | "subclasses";

interface Block {
  name: string;
  desc: string;
}
interface Monster {
  id: string;
  name: string;
  size: string;
  type: string;
  alignment: string;
  ac: { value: number; type: string }[];
  hp: number;
  hit_dice: string;
  speed: Record<string, string>;
  abilities: Record<string, number>;
  senses: Record<string, string | number>;
  languages: string;
  cr: number;
  xp: number;
  traits: Block[];
  actions: Block[];
  bonus_actions: Block[];
  reactions: Block[];
  legendary_actions: Block[];
}
interface Item {
  id: string;
  name: string;
  kind: string;
  rarity: string;
  attunement: boolean;
  desc: string[];
}
interface Feat {
  id: string;
  name: string;
  type: string;
  prerequisite?: string;
  desc?: string[];
  mechanics?: string[];
  source?: string;
}
interface Subclass {
  id: string;
  class: string;
  name: string;
  name_en?: string;
  features: { level: number; name: string; mechanics?: string[]; desc?: string[] }[];
}

type Entry = { id: string; name: string; sub: string; data: Monster | Item | Feat | Subclass };

const SRD_NOTE =
  "Содержит материалы System Reference Document 5.2.1 © Wizards of the Coast LLC, лицензия CC-BY-4.0 " +
  "(creativecommons.org/licenses/by/4.0). Перевод — проект DnD Game AI.";
const PHB_NOTE = "Механика Книги игрока 2024 (вне SRD) пересказана своими словами.";

const RARITY: Record<string, string> = {
  Common: "обычный",
  Uncommon: "необычный",
  Rare: "редкий",
  "Very Rare": "очень редкий",
  Legendary: "легендарный",
  Artifact: "артефакт",
  Varies: "разная",
};
const SPEED: Record<string, string> = { walk: "", fly: "полёт", swim: "плавание", climb: "лазание", burrow: "копание" };
const SENSES: Record<string, string> = {
  darkvision: "тёмное зрение",
  blindsight: "слепое зрение",
  tremorsense: "чувство вибрации",
  truesight: "истинное зрение",
  passive_perception: "пассивная Внимательность",
};
const ABILITY: [string, string][] = [
  ["str", "СИЛ"],
  ["dex", "ЛОВ"],
  ["con", "ТЕЛ"],
  ["int", "ИНТ"],
  ["wis", "МДР"],
  ["cha", "ХАР"],
];
const FEAT_TYPE: Record<string, string> = {
  origin: "талант происхождения",
  general: "общий талант",
  "fighting-style": "боевой стиль",
  "epic-boon": "эпический дар",
};

const feet = (v: string | number) => String(v).replace(/\bft\./g, "фт.");
const cr = (n: number) => (n === 0.125 ? "⅛" : n === 0.25 ? "¼" : n === 0.5 ? "½" : String(n));
const mod = (n: number) => {
  const m = Math.floor((n - 10) / 2);
  return m >= 0 ? `+${m}` : String(m);
};

async function records<T>(url: string): Promise<T[]> {
  const doc = (await (await fetch(url)).json()) as { records: Record<string, T> };
  return Object.values(doc.records);
}

async function loadEntries(kind: SrdKind): Promise<Entry[]> {
  if (kind === "monsters") {
    return (await records<Monster>(monstersUrl)).map((m) => ({
      id: m.id,
      name: m.name,
      sub: `ПО ${cr(m.cr)} · ${m.type}`,
      data: m,
    }));
  }
  if (kind === "items") {
    return (await records<Item>(itemsUrl)).map((i) => ({
      id: i.id,
      name: i.name,
      sub: `${i.kind.split(/[.,(]/)[0]} · ${RARITY[i.rarity] ?? i.rarity}`,
      data: i,
    }));
  }
  if (kind === "feats") {
    const [srd, phb] = await Promise.all([records<Feat>(featsUrl), records<Feat>(phbFeatsUrl)]);
    return [...srd, ...phb.map((f) => ({ ...f, source: "phb" }))].map((f) => ({
      id: f.id,
      name: f.name,
      sub: FEAT_TYPE[f.type] ?? f.type,
      data: f,
    }));
  }
  return (await records<Subclass>(subclassesUrl)).map((s) => ({
    id: s.id,
    name: s.name,
    sub: CLASS_LABELS[s.class] ?? s.class,
    data: s,
  }));
}

function Blocks({ title, list }: { title: string; list: Block[] }) {
  if (!list || list.length === 0) return null;
  return (
    <section className="space-y-1">
      <h4 className="font-serif text-gold">{title}</h4>
      {list.map((b) => (
        <p key={b.name} className="text-sm">
          <b>{b.name}.</b> {b.desc}
        </p>
      ))}
    </section>
  );
}

function MonsterView({ m }: { m: Monster }) {
  const speed = Object.entries(m.speed)
    .map(([k, v]) => `${SPEED[k] ?? k} ${feet(v)}`.trim())
    .join(", ");
  const senses = Object.entries(m.senses)
    .map(([k, v]) => `${SENSES[k] ?? k} ${feet(v)}`)
    .join(", ");
  return (
    <>
      <p className="text-xs text-muted">
        {m.size} {m.type}, {m.alignment}
      </p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        <dt className="text-muted">КД</dt>
        <dd>{m.ac.map((a) => a.value).join(" / ")}</dd>
        <dt className="text-muted">Хиты</dt>
        <dd>
          {m.hp} ({m.hit_dice})
        </dd>
        <dt className="text-muted">Скорость</dt>
        <dd>{speed}</dd>
        <dt className="text-muted">Чувства</dt>
        <dd>{senses}</dd>
        <dt className="text-muted">Языки</dt>
        <dd>{m.languages || "—"}</dd>
        <dt className="text-muted">Опасность</dt>
        <dd>
          {cr(m.cr)} ({m.xp} опыта)
        </dd>
      </dl>
      <div className="grid grid-cols-6 gap-1 text-center text-xs">
        {ABILITY.map(([k, label]) => (
          <div key={k} className="rounded border border-edge p-1">
            <div className="text-muted">{label}</div>
            <div>
              {m.abilities[k]} ({mod(m.abilities[k] ?? 10)})
            </div>
          </div>
        ))}
      </div>
      <Blocks title="Особенности" list={m.traits} />
      <Blocks title="Действия" list={m.actions} />
      <Blocks title="Бонусные действия" list={m.bonus_actions} />
      <Blocks title="Реакции" list={m.reactions} />
      <Blocks title="Легендарные действия" list={m.legendary_actions} />
    </>
  );
}

function Detail({ kind, entry, onBack }: { kind: SrdKind; entry: Entry; onBack: () => void }) {
  const d = entry.data;
  const phb = kind === "subclasses" || (kind === "feats" && (d as Feat).source === "phb");
  return (
    <article className="space-y-3 p-4">
      <button type="button" onClick={onBack} className="text-sm text-muted hover:text-parchment">
        ← К списку
      </button>
      <h3 className="font-serif text-2xl text-parchment">{entry.name}</h3>
      {kind === "monsters" && <MonsterView m={d as Monster} />}
      {kind === "items" && (
        <>
          <p className="text-xs text-muted">
            {(d as Item).kind.split(/[.(]/)[0]} · {RARITY[(d as Item).rarity] ?? (d as Item).rarity}
            {(d as Item).attunement ? " · требует настройки" : ""}
          </p>
          <SpellText paragraphs={(d as Item).desc} />
        </>
      )}
      {kind === "feats" && (
        <>
          <p className="text-xs text-muted">
            {entry.sub}
            {(d as Feat).prerequisite ? ` · ${(d as Feat).prerequisite}` : ""}
          </p>
          <SpellText paragraphs={(d as Feat).desc ?? (d as Feat).mechanics ?? []} />
        </>
      )}
      {kind === "subclasses" &&
        (d as Subclass).features.map((f) => (
          <section key={`${f.level}-${f.name}`} className="space-y-1">
            <h4 className="font-serif text-gold">
              {f.level} уровень — {f.name}
            </h4>
            <SpellText paragraphs={f.mechanics ?? f.desc ?? []} />
          </section>
        ))}
      <p className="text-[11px] text-muted">{phb ? PHB_NOTE : SRD_NOTE}</p>
    </article>
  );
}

const input =
  "rounded-md border border-edge bg-ink px-2 py-1.5 text-sm text-parchment placeholder:text-muted/70 focus:border-gold focus:outline-none";

export default function SrdTab({ kind }: { kind: SrdKind }) {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Entry | null>(null);

  useEffect(() => {
    let alive = true;
    setEntries(null);
    setOpen(null);
    loadEntries(kind)
      .then((list) => alive && setEntries(list.sort((a, b) => a.name.localeCompare(b.name, "ru"))))
      .catch((e) => alive && setError(String(e)));
    return () => {
      alive = false;
    };
  }, [kind]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (entries ?? []).filter((e) => !q || e.name.toLowerCase().includes(q) || e.sub.toLowerCase().includes(q));
  }, [entries, query]);

  if (open) return <Detail kind={kind} entry={open} onBack={() => setOpen(null)} />;
  if (error) return <p className="p-4 text-sm text-red-300">Не удалось загрузить справочник: {error}</p>;
  if (!entries) return <p className="p-4 text-sm text-muted">Загрузка…</p>;
  return (
    <div className="space-y-2 p-4">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Поиск по названию"
        aria-label="Поиск"
        className={`${input} w-full`}
      />
      <p className="text-xs text-muted">Найдено: {list.length}</p>
      <ul className="divide-y divide-edge">
        {list.map((e) => (
          <li key={e.id}>
            <button
              type="button"
              onClick={() => setOpen(e)}
              className="flex w-full items-baseline justify-between gap-2 py-1.5 text-left hover:text-gold"
            >
              <span>{e.name}</span>
              <span className="text-xs text-muted">{e.sub}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
