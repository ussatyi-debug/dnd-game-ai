import { useMemo, useState } from "react";
import { KNOWLEDGE, type KnowledgeEntry } from "../data/knowledge";
import Modal from "./Modal";

interface KnowledgeBaseProps {
  onClose: () => void;
}

function matches(entry: KnowledgeEntry, query: string): boolean {
  const haystack = [entry.title, entry.subtitle ?? "", ...entry.text].join(" ").toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

export default function KnowledgeBase({ onClose }: KnowledgeBaseProps) {
  const [sectionId, setSectionId] = useState(KNOWLEDGE[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const searching = query.trim().length > 0;

  const results = useMemo(() => {
    if (!searching) return [];
    return KNOWLEDGE.flatMap((section) =>
      section.subsections.flatMap((sub) =>
        sub.entries
          .filter((e) => matches(e, query))
          .map((entry) => ({ entry, path: `${section.title} · ${sub.title}` })),
      ),
    );
  }, [query, searching]);

  const section = KNOWLEDGE.find((s) => s.id === sectionId);

  const renderEntry = (entry: KnowledgeEntry, path?: string) => {
    const open = openId === entry.id;
    return (
      <li key={entry.id} className="rounded-lg border border-edge">
        <button
          type="button"
          onClick={() => setOpenId(open ? null : entry.id)}
          aria-expanded={open}
          className="flex w-full items-start justify-between gap-3 px-3 py-2.5 text-left"
        >
          <span>
            <span className="block font-medium">{entry.title}</span>
            {entry.subtitle && <span className="block text-xs text-muted">{entry.subtitle}</span>}
            {path && <span className="block text-[11px] text-gold/80">{path}</span>}
          </span>
          <span className="text-muted">{open ? "−" : "+"}</span>
        </button>
        {open && (
          <div className="space-y-2 border-t border-edge px-3 py-3 text-sm leading-relaxed">
            {entry.text.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {entry.link && (
              <a
                href={entry.link}
                target="_blank"
                rel="noreferrer"
                className="inline-block rounded-md border border-gold px-3 py-1.5 text-gold hover:bg-gold/10"
              >
                Открыть карту
              </a>
            )}
          </div>
        )}
      </li>
    );
  };

  return (
    <Modal title="База знаний" onClose={onClose} size="xl">
      <div className="border-b border-edge p-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по всем разделам…"
          aria-label="Поиск по базе знаний"
          className="w-full rounded-md border border-edge bg-ink px-3 py-2 text-parchment placeholder:text-muted/70 focus:border-gold focus:outline-none"
        />
      </div>

      {searching ? (
        <div className="p-3">
          {results.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted">Ничего не найдено</p>
          ) : (
            <ul className="space-y-2">{results.map((r) => renderEntry(r.entry, r.path))}</ul>
          )}
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row">
          <nav
            className="flex gap-1 overflow-x-auto border-b border-edge p-2 lg:w-48 lg:flex-col lg:border-r lg:border-b-0"
            aria-label="Разделы"
          >
            {KNOWLEDGE.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSectionId(s.id)}
                aria-current={s.id === sectionId ? "page" : undefined}
                className={`shrink-0 rounded-md px-3 py-2 text-left text-sm ${
                  s.id === sectionId ? "bg-gold text-ink" : "text-muted hover:text-parchment"
                }`}
              >
                {s.title}
              </button>
            ))}
          </nav>
          <div className="min-w-0 flex-1 space-y-5 p-3">
            {section?.subsections.map((sub) => (
              <section key={sub.title}>
                <h3 className="mb-2 font-serif text-gold">{sub.title}</h3>
                <ul className="space-y-2">{sub.entries.map((e) => renderEntry(e))}</ul>
              </section>
            ))}
            <p className="text-xs text-muted">
              Пока здесь несколько записей из документов кампании. Полный импорт — отдельным этапом.
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
