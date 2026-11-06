// Журнал разбора ошибок: ответы мастера как есть, команды движка и их отказы, броски
// (в том числе тайные), пометки о выдуманных бросках, сбои связи. В чат это не попадает.
// Хранится в браузерном хранилище устройства, последние MAX_ENTRIES записей.

export type LogKind = "master" | "engine" | "refusal" | "roll" | "warning" | "error";

export interface LogEntry {
  id: number;
  /** ISO-время. */
  at: string;
  kind: LogKind;
  title: string;
  detail: string;
}

export const LOG_KIND_LABEL: Record<LogKind, string> = {
  master: "Ответ мастера",
  engine: "Команда движка",
  refusal: "Отказ движка",
  roll: "Бросок мастера",
  warning: "Предупреждение",
  error: "Ошибка",
};

const KEY = "dnd.devlog";
const MAX_ENTRIES = 500;

type Listener = (entries: LogEntry[]) => void;

function load(): LogEntry[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as LogEntry[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

class DevLog {
  private entries: LogEntry[] = typeof window === "undefined" ? [] : load();
  private nextId = (this.entries.at(-1)?.id ?? 0) + 1;
  private listeners = new Set<Listener>();

  add(kind: LogKind, title: string, detail = "") {
    this.entries = [...this.entries, { id: this.nextId++, at: new Date().toISOString(), kind, title, detail }].slice(
      -MAX_ENTRIES,
    );
    this.persist();
  }

  list(): LogEntry[] {
    return this.entries;
  }

  clear() {
    this.entries = [];
    this.persist();
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    fn(this.entries);
    return () => this.listeners.delete(fn);
  }

  /** Текст журнала для копирования и разбора. */
  text(entries: LogEntry[] = this.entries): string {
    return entries
      .map((e) => `[${e.at}] ${LOG_KIND_LABEL[e.kind]}: ${e.title}${e.detail ? `\n${e.detail}` : ""}`)
      .join("\n\n");
  }

  private persist() {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(this.entries));
    } catch {
      // Хранилище переполнено или недоступно — журнал живёт до перезапуска.
    }
    for (const fn of this.listeners) fn(this.entries);
  }
}

export const devLog = new DevLog();
