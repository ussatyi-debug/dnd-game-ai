import { useEffect, useMemo, useState } from "react";
import {
  KB_BY_ID,
  KB_ENTRIES,
  KB_LAYERS,
  matchesQuery,
  REVEAL_LABEL,
  STATUS_LABEL,
  type KbEntry,
  type KbLayer,
  type KbStatus,
} from "../data/kb/index.ts";
import {
  errorText,
  isEngineAvailable,
  masterNotes,
  partyView,
  type MasterNote,
  type NoteLayer,
  type PartyView,
} from "../lib/engine";
import { FullSheet, PartySection } from "./FullSheet";
import Modal from "./Modal";

interface KnowledgeBaseProps {
  onClose: () => void;
  /** Открыть сразу полный лист этого персонажа. */
  initialCharacterId?: string | null;
  onOpenTreasury?: () => void;
}

/** Разделы с живыми данными движка (не из файлов базы). */
const PARTY_SECTION = { id: "party", title: "Отряд", description: "Полные листы отряда — данные движка, меняются по ходу игры" };
const NOTES_SECTION: Record<NoteLayer, { id: string; title: string; description: string }> = {
  player: {
    id: "master_notes",
    title: "Записи мастера",
    description: "Что герой узнал по ходу игры — мастер записывает сам",
  },
  master: {
    id: "master_journal",
    title: "Журнал мастера",
    description: "Тайны, планы NPC и импровизации, которые мастер записал, чтобы помнить",
  },
};
const LIVE_IDS = new Set([PARTY_SECTION.id, NOTES_SECTION.player.id, NOTES_SECTION.master.id]);

/** Слои под спойлером: содержимое скрыто, пока игрок сам не откроет слой. */
const SPOILER_TEXT: Partial<Record<KbLayer, string>> = {
  master: "Тайны, планы и угрозы мастера. Слой пока открыт без пароля — вход по паролю гейм-мастера появится позже. Карточки с пометкой «черновик мастера» не из документов кампании и ждут вашего утверждения.",
  world: "Лор, локации, NPC и фракции мира. Здесь есть сведения, которых герой может ещё не знать.",
};

function NoteList({ notes }: { notes: MasterNote[] }) {
  if (notes.length === 0) return <p className="text-sm text-muted">Записей пока нет — мастер добавит их по ходу игры.</p>;
  return (
    <ul className="space-y-2">
      {[...notes].reverse().map((n) => (
        <li key={n.id} className="rounded-lg border border-edge p-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-medium">{n.title}</span>
            <span className="shrink-0 text-[11px] text-muted">
              День {n.day}
              {n.time ? `, ${n.time}` : ""}
            </span>
          </div>
          {n.text && <p className="mt-1 whitespace-pre-line text-sm leading-snug">{n.text}</p>}
        </li>
      ))}
    </ul>
  );
}

const statusClass: Record<KbStatus, string> = {
  active: "border-crit/60 text-crit",
  ally: "border-crit/60 text-crit",
  vassal: "border-gold/60 text-gold",
  neutral: "border-edge text-muted",
  watch: "border-gold/60 text-gold",
  enemy: "border-fumble/70 text-fumble",
  prisoner: "border-fumble/50 text-fumble",
  dead: "border-edge text-muted line-through",
  open: "border-gold/60 text-gold",
  progress: "border-gold/60 text-gold",
  done: "border-crit/60 text-crit",
  failed: "border-fumble/70 text-fumble",
  planned: "border-edge text-parchment",
};

const layerAccent: Record<KbLayer, string> = {
  world: "bg-gold text-ink",
  player: "bg-gold text-ink",
  master: "bg-blood text-parchment",
};

function Badges({ entry }: { entry: KbEntry }) {
  return (
    <span className="flex flex-wrap gap-1">
      {entry.status && (
        <span className={`rounded border px-1.5 py-0.5 text-[10px] ${statusClass[entry.status]}`}>
          {STATUS_LABEL[entry.status]}
          {entry.statusNote ? ` · ${entry.statusNote}` : ""}
        </span>
      )}
      {entry.draft && (
        <span className="rounded border border-dashed border-gold/70 px-1.5 py-0.5 text-[10px] text-gold">
          черновик мастера
        </span>
      )}
      {entry.reveal && (
        <span className="rounded border border-fumble/50 px-1.5 py-0.5 text-[10px] text-fumble">
          {REVEAL_LABEL[entry.reveal]}
        </span>
      )}
    </span>
  );
}

function EntryCard({ entry, onOpen }: { entry: KbEntry; onOpen: (id: string) => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(entry.id)}
        className="w-full rounded-lg border border-edge p-3 text-left hover:border-gold/60"
      >
        <div className="flex items-start justify-between gap-2">
          <span className="font-medium">{entry.title}</span>
          {entry.link && <span className="shrink-0 text-xs text-gold">карта ↗</span>}
        </div>
        {entry.subtitle && <div className="text-xs text-muted">{entry.subtitle}</div>}
        <p className="mt-1.5 text-sm leading-snug text-parchment/90">{entry.summary}</p>
        <div className="mt-2">
          <Badges entry={entry} />
        </div>
      </button>
    </li>
  );
}

function EntryDetail({
  entry,
  onOpen,
  onBack,
}: {
  entry: KbEntry;
  onOpen: (id: string) => void;
  onBack: () => void;
}) {
  const related = (entry.related ?? []).map((id) => KB_BY_ID.get(id)).filter((e): e is KbEntry => !!e);
  const layer = KB_LAYERS.find((l) => l.id === entry.layer);
  const section = layer?.sections.find((s) => s.id === entry.section);

  return (
    <article className="space-y-4 p-4">
      <button type="button" onClick={onBack} className="text-sm text-muted hover:text-parchment">
        ← Назад
      </button>
      <header className="space-y-1">
        <div className="text-[11px] text-gold/80">
          {layer?.title} · {section?.title} · {entry.group}
        </div>
        <h3 className="font-serif text-2xl text-parchment">{entry.title}</h3>
        {entry.subtitle && <p className="text-sm text-muted">{entry.subtitle}</p>}
        <Badges entry={entry} />
      </header>

      <p className="leading-relaxed">{entry.summary}</p>

      {entry.facts && entry.facts.length > 0 && (
        <dl className="divide-y divide-edge rounded-lg border border-edge">
          {entry.facts.map((fact) => (
            <div key={fact.label} className="grid grid-cols-1 gap-0.5 px-3 py-2 sm:grid-cols-[11rem_1fr] sm:gap-3">
              <dt className="text-xs text-muted sm:text-sm">{fact.label}</dt>
              <dd className="text-sm">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {entry.body?.map((block, i) => (
        <section key={i} className="space-y-2">
          {block.heading && <h4 className="font-serif text-lg text-gold">{block.heading}</h4>}
          {block.paragraphs.map((p, j) => (
            <p key={j} className="text-sm leading-relaxed">
              {p}
            </p>
          ))}
        </section>
      ))}

      {entry.link && (
        <a
          href={entry.link}
          target="_blank"
          rel="noreferrer"
          className="inline-block rounded-md border border-gold px-3 py-1.5 text-sm text-gold hover:bg-gold/10"
        >
          Открыть карту на Google Диске ↗
        </a>
      )}

      {related.length > 0 && (
        <section className="space-y-2">
          <h4 className="text-sm text-muted">Связано</h4>
          <div className="flex flex-wrap gap-1.5">
            {related.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onOpen(r.id)}
                className="rounded-full border border-edge px-3 py-1 text-xs hover:border-gold"
              >
                {r.title}
                {r.layer !== entry.layer && (
                  <span className="ml-1 text-muted">· {KB_LAYERS.find((l) => l.id === r.layer)?.title}</span>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {(entry.tags?.length || entry.source) && (
        <footer className="space-y-1 border-t border-edge pt-3 text-xs text-muted">
          {entry.tags && entry.tags.length > 0 && <div>Метки: {entry.tags.join(", ")}</div>}
          {entry.source && <div>Источник: {entry.source}</div>}
        </footer>
      )}
    </article>
  );
}

export default function KnowledgeBase({ onClose, initialCharacterId = null, onOpenTreasury }: KnowledgeBaseProps) {
  const [layerId, setLayerId] = useState<KbLayer>("player");
  const [sectionId, setSectionId] = useState<string>(PARTY_SECTION.id);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [sheetId, setSheetId] = useState<string | null>(initialCharacterId);
  const [history, setHistory] = useState<string[]>([]);
  const [revealed, setRevealed] = useState<ReadonlySet<KbLayer>>(new Set(["player"]));
  const [party, setParty] = useState<PartyView | null>(null);
  const [notes, setNotes] = useState<MasterNote[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEngineAvailable()) return;
    Promise.all([partyView(), masterNotes()])
      .then(([p, n]) => {
        setParty(p);
        setNotes(n);
      })
      .catch((e: unknown) => setLoadError(errorText(e)));
  }, []);

  const baseLayer = KB_LAYERS.find((l) => l.id === layerId) ?? KB_LAYERS[0];
  const layer = useMemo(() => {
    if (!baseLayer) return undefined;
    const sections =
      baseLayer.id === "player"
        ? [PARTY_SECTION, ...baseLayer.sections, NOTES_SECTION.player]
        : baseLayer.id === "master"
          ? [...baseLayer.sections, NOTES_SECTION.master]
          : baseLayer.sections;
    return { ...baseLayer, sections };
  }, [baseLayer]);

  const hidden = !revealed.has(layerId);
  const searching = query.trim().length > 0 && !hidden;
  const opened = openId ? KB_BY_ID.get(openId) : undefined;
  const layerNotes = (l: KbLayer) => notes.filter((n) => n.layer === l);

  function switchLayer(id: KbLayer) {
    setLayerId(id);
    setSectionId(id === "player" ? PARTY_SECTION.id : (KB_LAYERS.find((l) => l.id === id)?.sections[0]?.id ?? ""));
    setOpenId(null);
    setSheetId(null);
    setHistory([]);
  }

  function reveal(id: KbLayer) {
    setRevealed((prev) => new Set([...prev, id]));
  }

  function open(id: string) {
    const entry = KB_BY_ID.get(id);
    if (!entry) return;
    if (openId) setHistory((h) => [...h, openId]);
    // Связь может вести в другой слой — переключаемся вместе с ней (и открываем его спойлер:
    // игрок сам перешёл по ссылке).
    if (entry.layer !== layerId) {
      setLayerId(entry.layer);
      reveal(entry.layer);
    }
    setSectionId(entry.section);
    setOpenId(id);
  }

  function back() {
    const previous = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    const entry = previous ? KB_BY_ID.get(previous) : undefined;
    if (entry) {
      setLayerId(entry.layer);
      setSectionId(entry.section);
    }
    setOpenId(previous ?? null);
  }

  const q = query.trim().toLowerCase().replace(/ё/g, "е");
  const results = useMemo(
    () => (searching ? KB_ENTRIES.filter((e) => e.layer === layerId && matchesQuery(e, query)) : []),
    [layerId, query, searching],
  );
  const noteResults = searching
    ? notes.filter(
        (n) => n.layer === layerId && `${n.title} ${n.text}`.toLowerCase().replace(/ё/g, "е").includes(q),
      )
    : [];

  const sectionEntries = useMemo(() => {
    const groups = new Map<string, KbEntry[]>();
    for (const e of KB_ENTRIES) {
      if (e.layer !== layerId || e.section !== sectionId) continue;
      groups.set(e.group, [...(groups.get(e.group) ?? []), e]);
    }
    return [...groups.entries()];
  }, [layerId, sectionId]);

  const counts = (id: string) => {
    if (id === PARTY_SECTION.id) return party?.members.length ?? 0;
    if (id === NOTES_SECTION.player.id) return layerNotes("player").length;
    if (id === NOTES_SECTION.master.id) return layerNotes("master").length;
    return KB_ENTRIES.filter((e) => e.layer === layerId && e.section === id).length;
  };
  const section = layer?.sections.find((s) => s.id === sectionId);
  const layerCount = (id: KbLayer) =>
    KB_ENTRIES.filter((e) => e.layer === id).length + layerNotes(id).length + (id === "player" ? (party?.members.length ?? 0) : 0);

  function liveSection() {
    if (sectionId === PARTY_SECTION.id) return <PartySection party={party} onOpen={setSheetId} />;
    if (sectionId === NOTES_SECTION.player.id) return <NoteList notes={layerNotes("player")} />;
    if (sectionId === NOTES_SECTION.master.id) return <NoteList notes={layerNotes("master")} />;
    return null;
  }

  return (
    <Modal title="База знаний" onClose={onClose} size="xl">
      <div className="grid grid-cols-3 gap-1 border-b border-edge p-2" role="tablist" aria-label="Слои">
        {KB_LAYERS.map((l) => (
          <button
            key={l.id}
            type="button"
            role="tab"
            aria-selected={l.id === layerId}
            onClick={() => switchLayer(l.id)}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              l.id === layerId ? layerAccent[l.id] : "text-muted hover:text-parchment"
            }`}
          >
            {l.title}
            {SPOILER_TEXT[l.id] && !revealed.has(l.id) ? (
              <span className="ml-1 text-xs opacity-70">🔒</span>
            ) : (
              <span className="ml-1 text-xs opacity-70">{layerCount(l.id)}</span>
            )}
          </button>
        ))}
      </div>

      {loadError && <p className="border-b border-edge px-4 py-2 text-xs text-fumble">Движок: {loadError}</p>}

      {hidden ? (
        <div className="space-y-3 p-6 text-center">
          <p className="font-serif text-lg text-gold">Спойлеры · {layer?.title}</p>
          <p className="mx-auto max-w-prose text-sm text-muted">{SPOILER_TEXT[layerId]}</p>
          <button
            type="button"
            onClick={() => reveal(layerId)}
            className="rounded-md border border-gold px-4 py-2 text-sm text-gold hover:bg-gold/10"
          >
            Открыть слой «{layer?.title}»
          </button>
        </div>
      ) : sheetId ? (
        <FullSheet id={sheetId} onBack={() => setSheetId(null)} onOpenTreasury={onOpenTreasury} />
      ) : opened ? (
        <EntryDetail entry={opened} onOpen={open} onBack={back} />
      ) : (
        <>
          {layerId === "master" && (
            <p className="border-b border-fumble/40 bg-blood/20 px-4 py-2 text-xs">{SPOILER_TEXT.master}</p>
          )}
          <div className="border-b border-edge p-3">
            <p className="mb-2 text-xs text-muted">{layer?.description}</p>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Поиск в слое «${layer?.title}»…`}
              aria-label="Поиск по базе знаний"
              className="w-full rounded-md border border-edge bg-ink px-3 py-2 text-parchment placeholder:text-muted/70 focus:border-gold focus:outline-none"
            />
          </div>

          {searching ? (
            <div className="space-y-3 p-3">
              {results.length === 0 && noteResults.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted">Ничего не найдено</p>
              ) : (
                <>
                  {noteResults.length > 0 && <NoteList notes={noteResults} />}
                  <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                    {results.map((e) => (
                      <EntryCard key={e.id} entry={e} onOpen={open} />
                    ))}
                  </ul>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row">
              <nav
                className="flex gap-1 overflow-x-auto border-b border-edge p-2 lg:w-56 lg:shrink-0 lg:flex-col lg:border-r lg:border-b-0"
                aria-label="Разделы"
              >
                {layer?.sections.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSectionId(s.id)}
                    aria-current={s.id === sectionId ? "page" : undefined}
                    className={`flex shrink-0 items-baseline justify-between gap-2 rounded-md px-3 py-2 text-left text-sm ${
                      s.id === sectionId ? "bg-edge text-parchment" : "text-muted hover:text-parchment"
                    }`}
                  >
                    {s.title}
                    <span className="text-xs opacity-70">{counts(s.id)}</span>
                  </button>
                ))}
              </nav>
              <div className="min-w-0 flex-1 space-y-5 p-3">
                {section && <p className="text-xs text-muted">{section.description}</p>}
                {LIVE_IDS.has(sectionId)
                  ? liveSection()
                  : sectionEntries.map(([group, entries]) => (
                      <section key={group}>
                        <h3 className="mb-2 font-serif text-gold">{group}</h3>
                        <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                          {entries.map((e) => (
                            <EntryCard key={e.id} entry={e} onOpen={open} />
                          ))}
                        </ul>
                      </section>
                    ))}
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
