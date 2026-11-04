import { useMemo, useState } from "react";
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
import Modal from "./Modal";

interface KnowledgeBaseProps {
  onClose: () => void;
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

export default function KnowledgeBase({ onClose }: KnowledgeBaseProps) {
  const [layerId, setLayerId] = useState<KbLayer>("world");
  const layer = KB_LAYERS.find((l) => l.id === layerId) ?? KB_LAYERS[0];
  const [sectionId, setSectionId] = useState(layer?.sections[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const searching = query.trim().length > 0;
  const opened = openId ? KB_BY_ID.get(openId) : undefined;

  function switchLayer(id: KbLayer) {
    setLayerId(id);
    setSectionId(KB_LAYERS.find((l) => l.id === id)?.sections[0]?.id ?? "");
    setOpenId(null);
    setHistory([]);
  }

  function open(id: string) {
    const entry = KB_BY_ID.get(id);
    if (!entry) return;
    if (openId) setHistory((h) => [...h, openId]);
    // Связь может вести в другой слой — переключаемся вместе с ней.
    if (entry.layer !== layerId) setLayerId(entry.layer);
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

  const results = useMemo(
    () => (searching ? KB_ENTRIES.filter((e) => e.layer === layerId && matchesQuery(e, query)) : []),
    [layerId, query, searching],
  );

  const sectionEntries = useMemo(() => {
    const groups = new Map<string, KbEntry[]>();
    for (const e of KB_ENTRIES) {
      if (e.layer !== layerId || e.section !== sectionId) continue;
      groups.set(e.group, [...(groups.get(e.group) ?? []), e]);
    }
    return [...groups.entries()];
  }, [layerId, sectionId]);

  const counts = (id: string) => KB_ENTRIES.filter((e) => e.layer === layerId && e.section === id).length;
  const section = layer?.sections.find((s) => s.id === sectionId);

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
            <span className="ml-1 text-xs opacity-70">{KB_ENTRIES.filter((e) => e.layer === l.id).length}</span>
          </button>
        ))}
      </div>

      {layerId === "master" && (
        <p className="border-b border-fumble/40 bg-blood/20 px-4 py-2 text-xs">
          Спойлеры. Слой мастера пока открыт без пароля — вход по паролю гейм-мастера появится позже.
          Карточки с пометкой «черновик мастера» не из документов кампании и ждут вашего утверждения.
        </p>
      )}

      {opened ? (
        <EntryDetail entry={opened} onOpen={open} onBack={back} />
      ) : (
        <>
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
            <div className="p-3">
              {results.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted">Ничего не найдено</p>
              ) : (
                <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                  {results.map((e) => (
                    <EntryCard key={e.id} entry={e} onOpen={open} />
                  ))}
                </ul>
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
                {sectionEntries.map(([group, entries]) => (
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
