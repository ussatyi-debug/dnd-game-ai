// Общие элементы мастера создания: карточки выбора, группы вариантов, заголовки.

import { useState, type ReactNode } from "react";

export function Section({ title, hint, children }: { title: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-serif text-lg text-gold">{title}</h3>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

/** Карточка для выбора одного варианта (вид, предыстория, класс). */
export function PickCard({
  selected,
  title,
  badge,
  summary,
  onClick,
  children,
}: {
  selected: boolean;
  title: string;
  badge?: string;
  summary?: string;
  onClick: () => void;
  children?: ReactNode;
}) {
  return (
    <div
      className={`flex flex-col rounded-lg border bg-ink/60 transition-colors ${selected ? "border-gold" : "border-edge hover:border-gold/60"}`}
    >
      {/* Кнопка тянется на всю карточку: в сетке соседняя раскрытая карточка делает строку выше. */}
      <button
        type="button"
        onClick={onClick}
        className={`block w-full px-3 py-2 text-left ${selected && children ? "" : "flex-1"}`}
      >
        <span className="flex items-baseline justify-between gap-2">
          <span className={`font-medium ${selected ? "text-gold" : ""}`}>{title}</span>
          {badge && <span className="shrink-0 text-[10px] uppercase tracking-wide text-muted">{badge}</span>}
        </span>
        {summary && <span className="mt-0.5 block text-xs text-parchment/75">{summary}</span>}
      </button>
      {selected && children && <div className="border-t border-edge/70 px-3 py-2 text-sm">{children}</div>}
    </div>
  );
}

export interface GroupOption {
  id: string;
  name: string;
  text?: string;
  disabled?: boolean;
  note?: string;
}

/**
 * Группа вариантов с лимитом: при лимите 1 новый выбор заменяет старый, при большем —
 * лишние нажатия игнорируются, пока не снят один из выбранных.
 */
export function ChoiceGroup({
  label,
  source,
  count,
  options,
  value,
  onChange,
  columns = false,
}: {
  label: string;
  source?: string;
  count: number;
  options: GroupOption[];
  value: string[];
  onChange: (next: string[]) => void;
  columns?: boolean;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const need = Math.min(count, options.length);
  const done = value.length === need;
  function toggle(id: string) {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else if (count === 1) onChange([id]);
    else if (value.length < count) onChange([...value, id]);
  }
  const withText = options.some((o) => o.text);
  return (
    <div className="rounded-lg border border-edge/70 bg-ink/40 p-3">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-sm font-medium">
          {label}
          {source && <span className="ml-1 text-xs text-muted">· {source}</span>}
        </span>
        <span className={`text-xs ${done ? "text-gold" : "text-fumble"}`}>
          {value.length}/{need}
        </span>
      </div>
      {withText ? (
        <ul className={columns ? "grid gap-1 sm:grid-cols-2" : "space-y-1"}>
          {options.map((o) => {
            const on = value.includes(o.id);
            return (
              <li key={o.id} className={`rounded-md border ${on ? "border-gold bg-gold/10" : "border-edge/60"}`}>
                <div className="flex items-start gap-2 px-2 py-1.5">
                  <button
                    type="button"
                    disabled={o.disabled && !on}
                    onClick={() => toggle(o.id)}
                    className="flex-1 text-left text-sm disabled:opacity-40"
                  >
                    <span className={on ? "text-gold" : ""}>{on ? "◆ " : "◇ "}{o.name}</span>
                    {o.note && <span className="ml-1 text-[11px] text-muted">{o.note}</span>}
                  </button>
                  {o.text && (
                    <button
                      type="button"
                      onClick={() => setOpen(open === o.id ? null : o.id)}
                      className="px-1 text-xs text-muted hover:text-parchment"
                      aria-label="Подробнее"
                    >
                      {open === o.id ? "▴" : "▾"}
                    </button>
                  )}
                </div>
                {open === o.id && o.text && <p className="px-2 pb-2 text-xs text-parchment/80">{o.text}</p>}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {options.map((o) => {
            const on = value.includes(o.id);
            return (
              <button
                key={o.id}
                type="button"
                disabled={o.disabled && !on}
                onClick={() => toggle(o.id)}
                className={`rounded-full border px-3 py-1 text-sm disabled:opacity-40 ${on ? "border-gold bg-gold/15 text-gold" : "border-edge hover:border-gold/60"}`}
              >
                {o.name}
                {o.note && <span className="ml-1 text-[10px] text-muted">{o.note}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Переключатель из нескольких кнопок. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex flex-wrap rounded-lg border border-edge bg-ink/60 p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`rounded-md px-3 py-1.5 text-sm ${value === o.id ? "bg-gold/20 text-gold" : "text-parchment/80 hover:text-parchment"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Список нерешённого на шаге. */
export function Issues({ items }: { items: string[] }) {
  if (items.length === 0) return <p className="text-xs text-gold">✓ Шаг заполнен</p>;
  return (
    <ul className="space-y-0.5 text-xs text-fumble">
      {items.map((i) => (
        <li key={i}>• {i}</li>
      ))}
    </ul>
  );
}
