import { useCallback, useEffect, useMemo, useState } from "react";
import {
  KB_BY_ID,
  KB_LAYERS,
  kbEntries,
  kbLayers,
  matchesQuery,
  REVEAL_LABEL,
  STATUS_LABEL,
  type KbEntry,
  type KbLayer,
  type KbStatus,
} from "../data/kb/index.ts";
import {
  customCards,
  deleteCard,
  errorText,
  isEngineAvailable,
  kbOverrides,
  masterNotes,
  openExternal,
  partyView,
  type CustomCard,
  type KbOverride,
  type MasterNote,
  type NoteLayer,
  type PartyView,
} from "../lib/engine";
import { FullSheet, PartySection } from "./FullSheet";
import KbArtifacts from "./KbArtifacts";
import { CardForm, customEntry } from "./KbCards";
import { GoalPanel, MasterLock, MasterPasswordButton } from "./KbExtras";
import { gmLocked, kbSeen, markKbSeen } from "../lib/kbState";
import { LinkedText, NoteList, type CardOption, type CardTitle } from "./KbNotes";
import Modal from "./Modal";

interface KnowledgeBaseProps {
  onClose: () => void;
  /** Открыть сразу полный лист этого персонажа. */
  initialCharacterId?: string | null;
  /** Открыть сразу эту карточку (цель из строки целей над диалогом). */
  initialCardId?: string | null;
  onOpenTreasury?: () => void;
  /** Записи изменены — обновить состояние приложения. */
  onChanged?: () => void;
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
const ARTIFACTS_SECTION = {
  id: "artifacts_known",
  title: "Артефакты",
  description: "Магические предметы отряда и известные герою артефакты кампании",
};
const LIVE_IDS = new Set([PARTY_SECTION.id, NOTES_SECTION.player.id, ARTIFACTS_SECTION.id]);

/** Группа закрытых целей (выполнено, провалено). */
const CLOSED_GOALS = "Завершённые";

/** Слои под спойлером: содержимое скрыто, пока игрок сам не откроет слой. */
const SPOILER_TEXT: Partial<Record<KbLayer, string>> = {
  master: "Тайны, планы и угрозы мастера. Слой можно закрыть паролем — он спрашивается после каждого запуска игры. Карточки с пометкой «черновик мастера» не из документов кампании и ждут вашего утверждения.",
  world: "Лор, локации, NPC и фракции мира. Здесь есть сведения, которых герой может ещё не знать.",
};

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

function isStatus(s: string): s is KbStatus {
  return s in STATUS_LABEL;
}

function Badges({ entry, override }: { entry: KbEntry; override?: KbOverride }) {
  const status = override && isStatus(override.status) ? override.status : entry.status;
  return (
    <span className="flex flex-wrap gap-1">
      {status && (
        <span className={`rounded border px-1.5 py-0.5 text-[10px] ${statusClass[status]}`}>
          {STATUS_LABEL[status]}
          {override
            ? ` · с Дня ${override.day}${override.note ? `: ${override.note}` : ""}`
            : entry.statusNote
              ? ` · ${entry.statusNote}`
              : ""}
        </span>
      )}
      {override && entry.status && entry.status !== status && (
        <span className="rounded border border-edge px-1.5 py-0.5 text-[10px] text-muted line-through">
          {STATUS_LABEL[entry.status]}
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

function EntryCard({
  entry,
  onOpen,
  override,
  noteCount = 0,
  fresh = false,
}: {
  entry: KbEntry;
  onOpen: (id: string) => void;
  override?: KbOverride;
  noteCount?: number;
  /** Появилась с прошлого открытия базы. */
  fresh?: boolean;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(entry.id)}
        className="w-full rounded-lg border border-edge p-3 text-left hover:border-gold/60"
      >
        <div className="flex items-start justify-between gap-2">
          <span className="font-medium">
            {entry.title}
            {fresh && <span className="ml-2 rounded bg-gold/20 px-1.5 py-0.5 text-[10px] font-normal text-gold">новое</span>}
          </span>
          {entry.link && <span className="shrink-0 text-xs text-gold">карта ↗</span>}
        </div>
        {entry.subtitle && <div className="text-xs text-muted">{entry.subtitle}</div>}
        <p className="mt-1.5 text-sm leading-snug text-parchment/90">{entry.summary}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badges entry={entry} override={override} />
          {noteCount > 0 && <span className="text-[10px] text-arcane">записей: {noteCount}</span>}
          {entry.goal && entry.goal.steps.length > 0 && (
            <span className="text-[10px] text-muted">
              шаги: {entry.goal.steps.filter((s) => s.done).length}/{entry.goal.steps.length}
            </span>
          )}
          {entry.goal?.due_day != null && <span className="text-[10px] text-muted">срок: День {entry.goal.due_day}</span>}
        </div>
      </button>
    </li>
  );
}

function EntryDetail({
  entry,
  onOpen,
  onBack,
  override,
  notes,
  onNotesChanged,
  custom,
  onCardChanged,
  onCardDeleted,
  cardTitle,
  customs,
  today,
  parents,
}: {
  entry: KbEntry;
  onOpen: (id: string) => void;
  onBack: () => void;
  /** Места, внутри которых может лежать карточка-место. */
  parents: { id: string; title: string }[];
  override?: KbOverride;
  notes: MasterNote[];
  onNotesChanged: () => void;
  /** Карточка создана по ходу игры — её можно править и удалить. */
  custom?: CustomCard;
  onCardChanged: () => void;
  onCardDeleted: () => void;
  cardTitle: CardTitle;
  customs: CardOption[];
  today?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        <Badges entry={entry} override={override} />
      </header>

      {custom && !editing && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-arcane">создано по ходу игры</span>
          <button type="button" onClick={() => setEditing(true)} className="rounded border border-edge px-2 py-1 hover:border-gold">
            ✎ Изменить
          </button>
          {confirm ? (
            <>
              <span>Удалить карточку?</span>
              <button
                type="button"
                onClick={() =>
                  deleteCard(custom.id)
                    .then(onCardDeleted)
                    .catch((e: unknown) => setError(errorText(e)))
                }
                className="rounded border border-fumble px-2 py-1 text-fumble"
              >
                Удалить
              </button>
              <button type="button" onClick={() => setConfirm(false)} className="px-2 py-1 text-muted">
                Нет
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setConfirm(true)} className="rounded border border-edge px-2 py-1 hover:border-fumble">
              🗑 Удалить
            </button>
          )}
          {error && <span className="text-fumble">{error}</span>}
        </div>
      )}
      {custom && editing && (
        <CardForm
          layer={entry.layer}
          section={entry.section}
          card={custom}
          parents={entry.section === "locations" ? parents : []}
          onDone={() => {
            setEditing(false);
            onCardChanged();
          }}
          onCancel={() => setEditing(false)}
        />
      )}
      {custom?.goal && !editing && <GoalPanel card={custom} goal={custom.goal} today={today} onChanged={onCardChanged} />}

      <p className="leading-relaxed">
        <LinkedText text={entry.summary} onOpenCard={onOpen} cardTitle={cardTitle} />
      </p>

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
          onClick={(e) => {
            if (entry.link && openExternal(entry.link)) e.preventDefault();
          }}
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

      <section className="space-y-2">
        <h4 className="font-serif text-lg text-gold">Записи по ходу игры</h4>
        <NoteList
          notes={notes}
          layer={entry.layer === "master" ? "master" : "player"}
          card={entry.id}
          emptyText="К этой карточке записей пока нет."
          onChanged={onNotesChanged}
          onOpenCard={onOpen}
          cardTitle={cardTitle}
          customs={customs}
          today={today}
        />
      </section>

      {(entry.tags?.length || entry.source) && (
        <footer className="space-y-1 border-t border-edge pt-3 text-xs text-muted">
          {entry.tags && entry.tags.length > 0 && <div>Метки: {entry.tags.join(", ")}</div>}
          {entry.source && <div>Источник: {entry.source}</div>}
        </footer>
      )}
    </article>
  );
}

export default function KnowledgeBase({
  onClose,
  initialCharacterId = null,
  initialCardId = null,
  onOpenTreasury,
  onChanged,
}: KnowledgeBaseProps) {
  const [layerId, setLayerId] = useState<KbLayer>("player");
  const [sectionId, setSectionId] = useState<string>(initialCardId ? "goals" : PARTY_SECTION.id);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(initialCardId);
  const [sheetId, setSheetId] = useState<string | null>(initialCharacterId);
  const [history, setHistory] = useState<string[]>([]);
  const [revealed, setRevealed] = useState<ReadonlySet<KbLayer>>(new Set(["player"]));
  const [party, setParty] = useState<PartyView | null>(null);
  const [notes, setNotes] = useState<MasterNote[]>([]);
  const [overrides, setOverrides] = useState<KbOverride[]>([]);
  const [customs, setCustoms] = useState<CustomCard[]>([]);
  const [creating, setCreating] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!isEngineAvailable()) return;
    Promise.all([partyView(), masterNotes(), kbOverrides(), customCards()])
      .then(([p, n, o, c]) => {
        setParty(p);
        setNotes(n);
        setOverrides(o);
        setCustoms(c);
      })
      .catch((e: unknown) => setLoadError(errorText(e)));
  }, []);

  /** Все карточки: из файлов базы и созданные по ходу игры. */
  const entries = useMemo(() => {
    const base = kbEntries();
    const staticById = new Map(base.map((e) => [e.id, e]));
    const closed = (id: string, own?: string | null) => {
      const status = overrides.find((o) => o.card_id === id)?.status ?? own;
      return status === "done" || status === "failed";
    };
    const made = customs.map((c) => {
      const entry = customEntry(c);
      // Место внутри встроенной локации — в её группе, под её спойлером.
      const parent = c.parent ? staticById.get(c.parent) : undefined;
      if (parent && parent.layer === entry.layer && parent.section === entry.section) entry.group = parent.group;
      if (c.section === "goals") entry.group = closed(c.id, c.status) ? CLOSED_GOALS : "Активные";
      return entry;
    });
    // Закрытые цели — отдельной свёрнутой группой, чтобы не мешались с активными.
    const fixed = base.map((e) =>
      e.layer === "player" && e.section === "goals" && closed(e.id, e.status) ? { ...e, group: CLOSED_GOALS } : e,
    );
    return [...fixed, ...made];
  }, [customs, overrides]);
  const locationParents = useMemo(
    () => entries.filter((e) => e.layer === "world" && e.section === "locations" && !e.parent).map((e) => ({ id: e.id, title: e.title })),
    [entries],
  );
  // «Новое»: что появилось с прошлого открытия базы (в первый раз новым ничего не считается).
  const [seen] = useState(kbSeen);
  const isFresh = (id: string) => !!seen && !seen.cards.includes(id) && customs.some((c) => c.id === id && !c.by_player);
  useEffect(() => {
    if (!notes.length && !customs.length) return;
    markKbSeen({ noteId: notes.reduce((max, n) => Math.max(max, n.id), 0), cards: customs.map((c) => c.id) });
  }, [notes, customs]);
  const byId = useMemo(() => new Map(entries.map((e) => [e.id, e])), [entries]);
  const cardTitle: CardTitle = useCallback((id: string) => byId.get(id)?.title ?? null, [byId]);
  const cardOptions: CardOption[] = useMemo(
    () => customs.map((c) => ({ id: c.id, title: c.title, layer: c.layer })),
    [customs],
  );
  const today = party?.scene.day;

  useEffect(reload, [reload]);

  function notesChanged() {
    reload();
    onChanged?.();
  }

  const overrideOf = (id: string) => overrides.find((o) => o.card_id === id);
  const notesOf = (id: string) => notes.filter((n) => n.card === id);

  const baseLayer = kbLayers().find((l) => l.id === layerId) ?? kbLayers()[0];
  const layer = useMemo(() => {
    if (!baseLayer) return undefined;
    // Записи журнала мастера показываются в разделе «Журнал мастера» слоя мастера.
    const sections =
      baseLayer.id === "player"
        ? [PARTY_SECTION, ...baseLayer.sections, ARTIFACTS_SECTION, NOTES_SECTION.player]
        : baseLayer.sections;
    return { ...baseLayer, sections };
  }, [baseLayer]);

  const hidden = !revealed.has(layerId);
  const searching = query.trim().length > 0 && !hidden;
  const opened = openId ? byId.get(openId) : undefined;
  // Пересказы дней — в разделе «Хроника», а не среди записей.
  const layerNotes = (l: KbLayer) => notes.filter((n) => n.layer === l && n.kind !== "day");
  const chronicleDays = notes.filter((n) => n.kind === "day").sort((a, b) => a.day - b.day);

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
    const entry = byId.get(id);
    if (!entry) return;
    if (openId) setHistory((h) => [...h, openId]);
    // Связь может вести в другой слой — переключаемся вместе с ней (и открываем его спойлер:
    // игрок сам перешёл по ссылке).
    if (entry.layer !== layerId) {
      setLayerId(entry.layer);
      // Слой мастера под паролем ссылка не открывает.
      if (!(entry.layer === "master" && gmLocked())) reveal(entry.layer);
    }
    setSectionId(entry.section);
    setOpenId(id);
  }

  function back() {
    const previous = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    const entry = previous ? byId.get(previous) : undefined;
    if (entry) {
      setLayerId(entry.layer);
      setSectionId(entry.section);
    }
    setOpenId(previous ?? null);
  }

  const q = query.trim().toLowerCase().replace(/ё/g, "е");
  const results = useMemo(
    () => (searching ? entries.filter((e) => e.layer === layerId && matchesQuery(e, query)) : []),
    [entries, layerId, query, searching],
  );
  const noteResults = searching
    ? notes.filter(
        (n) => n.layer === layerId && `${n.title} ${n.text}`.toLowerCase().replace(/ё/g, "е").includes(q),
      )
    : [];

  const sectionEntries = useMemo(() => {
    const groups = new Map<string, KbEntry[]>();
    for (const e of entries) {
      if (e.layer !== layerId || e.section !== sectionId) continue;
      groups.set(e.group, [...(groups.get(e.group) ?? []), e]);
    }
    // Закрытые цели — в конце.
    return [...groups.entries()].sort((a, b) => Number(a[0] === CLOSED_GOALS) - Number(b[0] === CLOSED_GOALS));
  }, [entries, layerId, sectionId]);
  const journalSection = layerId === "master" && sectionId === "journal";
  const chronicleSection = layerId === "player" && sectionId === "chronicle";

  const counts = (id: string) => {
    if (id === PARTY_SECTION.id) return party?.members.length ?? 0;
    if (id === ARTIFACTS_SECTION.id) return entries.filter((e) => e.layer === "world" && e.section === "artifacts").length;
    if (id === NOTES_SECTION.player.id) return layerNotes("player").length;
    const cards = entries.filter((e) => e.layer === layerId && e.section === id).length;
    if (layerId === "player" && id === "chronicle") return cards + chronicleDays.length;
    return layerId === "master" && id === "journal" ? cards + layerNotes("master").length : cards;
  };
  const section = layer?.sections.find((s) => s.id === sectionId);
  const freshItems = !seen
    ? []
    : [
        ...customs
          .filter((c) => c.layer === layerId && isFresh(c.id))
          .map((c) => ({ key: c.id, card: c.id as string | null, label: `Карточка: ${c.title}` })),
        ...notes
          .filter((n) => n.layer === layerId && n.id > seen.noteId && !n.by_player)
          .map((n) => ({
            key: `n${n.id}`,
            card: n.card ?? null,
            label: `${n.kind === "day" ? "Хроника" : "Запись"}: ${n.title}`,
          })),
      ];
  const layerCount = (id: KbLayer) =>
    entries.filter((e) => e.layer === id).length + layerNotes(id).length + (id === "player" ? (party?.members.length ?? 0) : 0);

  function liveSection() {
    if (sectionId === PARTY_SECTION.id) return <PartySection party={party} onOpen={setSheetId} />;
    if (sectionId === ARTIFACTS_SECTION.id) return <KbArtifacts party={party} onOpen={open} />;
    if (sectionId === NOTES_SECTION.player.id)
      return (
        <NoteList
          notes={layerNotes("player")}
          layer="player"
          onChanged={notesChanged}
          onOpenCard={open}
          cardTitle={cardTitle}
          customs={cardOptions}
          today={today}
        />
      );
    return null;
  }

  return (
    <Modal title="База знаний" onClose={onClose} size="xl">
      <div className="grid grid-cols-3 gap-1 border-b border-edge p-2" role="tablist" aria-label="Слои">
        {kbLayers().map((l) => (
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
          {layerId === "master" && gmLocked() ? (
            <MasterLock onUnlocked={() => reveal("master")} />
          ) : (
            <button
              type="button"
              onClick={() => reveal(layerId)}
              className="rounded-md border border-gold px-4 py-2 text-sm text-gold hover:bg-gold/10"
            >
              Открыть слой «{layer?.title}»
            </button>
          )}
        </div>
      ) : sheetId ? (
        <FullSheet id={sheetId} onBack={() => setSheetId(null)} onOpenTreasury={onOpenTreasury} onChanged={onChanged} />
      ) : opened ? (
        <EntryDetail
          entry={opened}
          onOpen={open}
          onBack={back}
          override={overrideOf(opened.id)}
          notes={notesOf(opened.id)}
          onNotesChanged={notesChanged}
          custom={customs.find((c) => c.id === opened.id)}
          onCardChanged={notesChanged}
          onCardDeleted={() => {
            setOpenId(null);
            notesChanged();
          }}
          cardTitle={cardTitle}
          customs={cardOptions}
          today={today}
          parents={locationParents}
        />
      ) : (
        <>
          {layerId === "master" && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-fumble/40 bg-blood/20 px-4 py-2 text-xs">
              <span className="min-w-0 flex-1">{SPOILER_TEXT.master}</span>
              <MasterPasswordButton />
            </div>
          )}
          {freshItems.length > 0 && (
            <details open className="border-b border-edge bg-gold/5 px-4 py-2 text-sm">
              <summary className="cursor-pointer text-gold">Новое с прошлого раза: {freshItems.length}</summary>
              <ul className="mt-2 space-y-1">
                {freshItems.map((item) => (
                  <li key={item.key}>
                    {item.card ? (
                      <button type="button" onClick={() => open(item.card as string)} className="text-left underline decoration-gold/40 hover:text-gold">
                        {item.label}
                      </button>
                    ) : (
                      <span>{item.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </details>
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
                  {noteResults.length > 0 && (
                    <NoteList
                      notes={noteResults}
                      onChanged={notesChanged}
                      onOpenCard={open}
                      cardTitle={cardTitle}
                      customs={cardOptions}
                      today={today}
                    />
                  )}
                  <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                    {results.map((e) => (
                      <EntryCard key={e.id} entry={e} onOpen={open} override={overrideOf(e.id)} noteCount={notesOf(e.id).length} />
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
                {LIVE_IDS.has(sectionId) ? (
                  liveSection()
                ) : (
                  <>
                    {creating ? (
                      <CardForm
                        layer={layerId}
                        section={sectionId}
                        parents={layerId === "world" && sectionId === "locations" ? locationParents : []}
                        onDone={() => {
                          setCreating(false);
                          notesChanged();
                        }}
                        onCancel={() => setCreating(false)}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCreating(true)}
                        className="rounded-md border border-dashed border-gold/60 px-3 py-1.5 text-sm text-gold hover:bg-gold/10"
                      >
                        + Новая карточка
                      </button>
                    )}
                    {sectionEntries.map(([group, groupEntries]) => {
                      const card = (e: KbEntry) => (
                        <EntryCard
                          key={e.id}
                          entry={e}
                          onOpen={open}
                          override={overrideOf(e.id)}
                          noteCount={notesOf(e.id).length}
                          fresh={isFresh(e.id)}
                        />
                      );
                      const ids = new Set(groupEntries.map((e) => e.id));
                      // Места внутри локации — под её спойлером; родитель из другой группы не прячет их.
                      const children = (id: string) => groupEntries.filter((e) => e.parent === id);
                      const top = groupEntries.filter((e) => !e.parent || !ids.has(e.parent));
                      return (
                        <details
                          key={group}
                          open={sectionEntries.length === 1 || (sectionId === "goals" && group !== CLOSED_GOALS) ? true : undefined}
                          className="group/kb"
                        >
                          <summary className="mb-2 flex cursor-pointer list-none items-center gap-2 font-serif text-gold">
                            <span className="text-xs transition-transform group-open/kb:rotate-90">▶</span>
                            {group}
                            <span className="font-sans text-xs text-muted">{groupEntries.length}</span>
                          </summary>
                          <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                            {top.map((e) => {
                              const inside = children(e.id);
                              if (!inside.length) return card(e);
                              return (
                                <li key={e.id} className="list-none lg:col-span-2">
                                  <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2">{card(e)}</ul>
                                  <details className="group/place mt-2 ml-4 border-l border-edge pl-3">
                                    <summary className="mb-2 flex cursor-pointer list-none items-center gap-2 text-sm text-gold/80">
                                      <span className="text-xs transition-transform group-open/place:rotate-90">▶</span>
                                      Известные места: {e.title}
                                      <span className="text-xs text-muted">{inside.length}</span>
                                    </summary>
                                    <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2">{inside.map(card)}</ul>
                                  </details>
                                </li>
                              );
                            })}
                          </ul>
                        </details>
                      );
                    })}
                    {chronicleSection && (
                      <details open className="group/kb">
                        <summary className="mb-2 flex cursor-pointer list-none items-center gap-2 font-serif text-gold">
                          <span className="text-xs transition-transform group-open/kb:rotate-90">▶</span>
                          Дни этой игры
                          <span className="font-sans text-xs text-muted">{chronicleDays.length}</span>
                        </summary>
                        {chronicleDays.length === 0 ? (
                          <p className="text-sm text-muted">
                            Мастер пишет сюда пересказ каждого прошедшего дня — по нему он помнит раннюю часть игры. Пересказ
                            можно поправить.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {chronicleDays.map((n) => (
                              <details key={n.id} className="group/day rounded-lg border border-edge px-3 py-2">
                                <summary className="flex cursor-pointer list-none items-center gap-2 text-sm text-gold/90">
                                  <span className="text-xs transition-transform group-open/day:rotate-90">▶</span>
                                  День {n.day}
                                </summary>
                                <div className="mt-2">
                                  <NoteList
                                    notes={[n]}
                                    layer="player"
                                    onChanged={notesChanged}
                                    onOpenCard={open}
                                    cardTitle={cardTitle}
                                    customs={cardOptions}
                                    today={today}
                                  />
                                </div>
                              </details>
                            ))}
                          </div>
                        )}
                      </details>
                    )}
                    {journalSection && (
                      <section>
                        <h3 className="mb-2 font-serif text-gold">Записи по ходу игры</h3>
                        <NoteList
                          notes={layerNotes("master")}
                          layer="master"
                          onChanged={notesChanged}
                          onOpenCard={open}
                          cardTitle={cardTitle}
                          customs={cardOptions}
                          today={today}
                        />
                      </section>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
