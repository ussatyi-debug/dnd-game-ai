// Блоки полного листа персонажа. Одни и те же блоки показываются в панели персонажа
// (свёрнутыми спойлерами) и в базе знаний (полный лист, блоки раскрыты).

import { useState, type ReactNode } from "react";
import {
  formatGold,
  signed,
  type Bonus,
  type CharacterSheet,
  type ContainerView,
  type InventoryView,
  type SheetDetails,
  type SkillLine,
} from "../lib/engine";

function breakdownText(parts: Bonus[], total: number): string {
  return `${parts.map((b) => `${b.label} ${signed(b.value)}`).join(" · ")} = ${signed(total)}`;
}

/** Строка с итогом; по нажатию раскрывает, из чего итог сложен. */
function TotalRow({
  label,
  total,
  parts,
  marker,
  extra,
}: {
  label: ReactNode;
  total: number;
  parts: Bonus[];
  marker?: ReactNode;
  extra?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-baseline justify-between gap-2 rounded px-1 py-1 text-left text-sm hover:bg-ink/60"
      >
        <span className="min-w-0">
          <span className="mr-1 inline-block w-3 text-center text-gold">{marker}</span>
          {label}
        </span>
        <span className="shrink-0 font-mono">{signed(total)}</span>
      </button>
      {open && (
        <div className="ml-5 pb-1 text-[11px] leading-snug text-muted">
          {breakdownText(parts, total)}
          {extra}
        </div>
      )}
    </li>
  );
}

export function Block({
  title,
  badge,
  open = false,
  children,
}: {
  title: string;
  badge?: ReactNode;
  open?: boolean;
  children: ReactNode;
}) {
  return (
    <details open={open} className="group rounded-lg border border-edge">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-sm font-medium text-gold">
        <span>
          <span className="mr-1.5 inline-block transition-transform group-open:rotate-90">▸</span>
          {title}
        </span>
        {badge !== undefined && <span className="font-normal text-xs text-muted">{badge}</span>}
      </summary>
      <div className="border-t border-edge px-3 py-2">{children}</div>
    </details>
  );
}

const PROF_MARK: Record<SkillLine["proficiency"], string> = { none: "", proficient: "●", expertise: "◆" };

function AbilitiesAndSaves({ sheet, details }: { sheet: CharacterSheet; details: SheetDetails }) {
  return (
    <>
      <dl className="grid grid-cols-3 gap-2 text-center">
        {sheet.abilities.map((a) => (
          <div key={a.ability} className="rounded-lg border border-edge py-1.5">
            <dt className="text-[11px] text-muted">{a.label}</dt>
            <dd className="font-mono text-lg">{signed(a.modifier)}</dd>
            <dd className="text-xs text-muted">{a.score}</dd>
          </div>
        ))}
      </dl>
      <h4 className="mt-3 text-xs text-muted">Спасброски · ● владение · нажмите — разбивка</h4>
      <ul className="mt-1 grid grid-cols-1 sm:grid-cols-2 sm:gap-x-4">
        {details.saves.map((s) => (
          <TotalRow
            key={s.ability}
            label={s.label}
            total={s.total}
            parts={s.breakdown}
            marker={s.proficient ? "●" : ""}
          />
        ))}
      </ul>
      {details.save_notes.length > 0 && (
        <ul className="mt-2 space-y-1 text-[11px] text-muted">
          {details.save_notes.map((n) => (
            <li key={n}>· {n}</li>
          ))}
        </ul>
      )}
    </>
  );
}

function Skills({ details }: { details: SheetDetails }) {
  return (
    <>
      {!details.skills_listed && (
        <p className="mb-2 text-[11px] text-muted">
          В листе навыки не указаны — показаны модификаторы характеристик.
        </p>
      )}
      <p className="mb-1 text-[11px] text-muted">● владение · ◆ компетентность · ⇈ преимущество</p>
      <ul>
        {details.skills.map((s) => (
          <TotalRow
            key={s.skill}
            label={
              <>
                {s.name} <span className="text-[11px] text-muted">({s.ability_label})</span>
                {s.advantage.length > 0 && <span className="ml-1 text-arcane">⇈</span>}
              </>
            }
            total={s.total}
            parts={s.breakdown}
            marker={PROF_MARK[s.proficiency]}
            extra={
              <>
                {s.source && <div>Источник: {s.source}</div>}
                {s.advantage.map((a) => (
                  <div key={a} className="text-arcane">
                    Преимущество: {a}
                  </div>
                ))}
              </>
            }
          />
        ))}
      </ul>
      <p className="mt-2 text-xs text-muted">
        Пассивные: Внимательность {details.passive_perception} · Проницательность {details.passive_insight} ·
        Анализ {details.passive_investigation}
      </p>
    </>
  );
}

function Attacks({ details }: { details: SheetDetails }) {
  if (details.attacks.length === 0) return <p className="text-sm text-muted">В листе атак нет.</p>;
  return (
    <ul className="space-y-2">
      {details.attacks.map((a) => (
        <li key={a.name} className="text-sm">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-medium">{a.name}</span>
            <span className="shrink-0 font-mono" title={breakdownText(a.to_hit_breakdown, a.to_hit)}>
              {signed(a.to_hit)}
            </span>
          </div>
          <div className="text-xs">
            {a.damage}
            {a.range && <span className="text-muted"> · {a.range}</span>}
          </div>
          <div className="text-[11px] text-muted">{breakdownText(a.to_hit_breakdown, a.to_hit)}</div>
          {a.proficiency_unknown && (
            <div className="text-[11px] text-fumble">Владение в листе не указано — бонус мастерства не прибавлен.</div>
          )}
          {a.notes && <div className="text-[11px] text-muted">{a.notes}</div>}
        </li>
      ))}
    </ul>
  );
}

function Features({ sheet, details }: { sheet: CharacterSheet; details: SheetDetails }) {
  return (
    <ul className="space-y-2">
      {details.features.map((f) => {
        const pool = f.resource_id ? sheet.resources.find((r) => r.id === f.resource_id) : undefined;
        return (
          <li key={`${f.source}-${f.name}`} className="text-sm">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-medium">{f.name}</span>
              {pool && (
                <span className="shrink-0 font-mono text-xs text-gold">
                  {pool.current}/{pool.max}
                </span>
              )}
            </div>
            <div className="text-[11px] text-gold/70">{f.source}</div>
            <p className="text-xs leading-snug text-parchment/90">{f.text}</p>
          </li>
        );
      })}
    </ul>
  );
}

function Proficiencies({ details }: { details: SheetDetails }) {
  return (
    <dl className="space-y-1.5 text-sm">
      {details.proficiencies.map((p) => (
        <div key={p.kind}>
          <dt className="text-xs text-muted">{p.kind}</dt>
          <dd>
            {p.text}
            {p.from_rules && <span className="ml-1 text-[11px] text-muted">(по правилам класса)</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function AttunementList({ details }: { details: SheetDetails }) {
  return (
    <>
      {details.attunement.length === 0 ? (
        <p className="text-sm text-muted">Настроенных предметов в листе нет.</p>
      ) : (
        <ul className="space-y-1.5">
          {details.attunement.map((a) => (
            <li key={a.name} className="text-sm">
              <div className="font-medium">{a.name}</div>
              <div className="text-xs text-muted">{a.effect}</div>
            </li>
          ))}
        </ul>
      )}
      {details.attunement_note && <p className="mt-2 text-[11px] text-muted">{details.attunement_note}</p>}
    </>
  );
}

function ContainerBlock({
  container,
  open,
  onOpenTreasury,
}: {
  container: ContainerView;
  open: boolean;
  onOpenTreasury?: () => void;
}) {
  const empty = container.item_count === 0 && container.treasury_total === null;
  return (
    <details open={open} className="rounded-md border border-edge/70">
      <summary className="flex cursor-pointer items-baseline justify-between gap-2 px-2 py-1.5 text-sm">
        <span className="min-w-0 truncate">{container.name}</span>
        <span className="shrink-0 text-[11px] text-muted">
          {container.capacity ? `${container.capacity} · ` : ""}
          {container.item_count} шт.
        </span>
      </summary>
      <div className="space-y-2 border-t border-edge/70 px-2 py-2">
        {container.note && <p className="text-[11px] text-muted">{container.note}</p>}
        {container.treasury_name !== null && container.treasury_total !== null && (
          <p className="text-xs">
            Деньги и ценности — в казне: «{container.treasury_name}», {formatGold(container.treasury_total)}
            {onOpenTreasury && (
              <button type="button" onClick={onOpenTreasury} className="ml-1 text-gold underline">
                открыть казну
              </button>
            )}
          </p>
        )}
        {container.groups.map((g) => (
          <div key={g.category}>
            <h5 className="text-[11px] uppercase tracking-wide text-gold/70">{g.category}</h5>
            <ul className="mt-0.5 space-y-0.5">
              {g.items.map((i) => (
                <li key={i.id} className="text-sm leading-snug">
                  {i.name}
                  {i.quantity > 1 && <span className="font-mono text-gold"> ×{i.quantity}</span>}
                  {i.notes && <span className="text-xs text-muted"> — {i.notes}</span>}
                  {i.scroll && <span className="ml-1 text-[10px] text-arcane">из книги заклинаний</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {empty && <p className="text-xs text-muted">Пусто.</p>}
      </div>
    </details>
  );
}

function Inventory({
  inventory,
  open,
  onOpenTreasury,
}: {
  inventory: InventoryView;
  open: boolean;
  onOpenTreasury?: () => void;
}) {
  const shown = inventory.containers.filter((c) => c.item_count > 0 || c.treasury_total !== null);
  if (shown.length === 0) return <p className="text-sm text-muted">В листе предметов нет.</p>;
  return (
    <div className="space-y-2">
      {shown.map((c, i) => (
        <ContainerBlock key={c.id} container={c} open={open || i === 0} onOpenTreasury={onOpenTreasury} />
      ))}
      <p className="text-[11px] text-muted">Вес не учитывается: у мест хранения указана только вместимость из листа.</p>
    </div>
  );
}

/** Состояния, истощение и кости хитов — короткая строка над блоками. */
export function StatusLine({ details }: { details: SheetDetails }) {
  const dice = details.hit_dice.map((d) => `${d.current}/${d.total} d${d.die}`).join(" + ");
  return (
    <div className="space-y-1 text-xs">
      {(details.conditions.length > 0 || details.exhaustion > 0) && (
        <div className="flex flex-wrap gap-1">
          {details.conditions.map((c) => (
            <span key={c} className="rounded border border-fumble/60 px-1.5 py-0.5 text-fumble">
              {c}
            </span>
          ))}
          {details.exhaustion > 0 && (
            <span className="rounded border border-fumble/60 px-1.5 py-0.5 text-fumble">
              Истощение {details.exhaustion}
            </span>
          )}
        </div>
      )}
      {dice && <div className="text-muted">Кости хитов: {dice}</div>}
    </div>
  );
}

interface SheetSectionsProps {
  sheet: CharacterSheet;
  details: SheetDetails;
  inventory: InventoryView | null;
  /** Раскрыть все блоки (полный лист в базе знаний). */
  open?: boolean;
  onOpenTreasury?: () => void;
}

export default function SheetSections({ sheet, details, inventory, open = false, onOpenTreasury }: SheetSectionsProps) {
  const proficient = details.skills.filter((s) => s.proficiency !== "none").length;
  const items = inventory?.containers.reduce((sum, c) => sum + c.item_count, 0) ?? 0;
  return (
    <div className="space-y-2">
      <Block title="Характеристики и спасброски" open={open}>
        <AbilitiesAndSaves sheet={sheet} details={details} />
      </Block>
      <Block title="Навыки" badge={proficient > 0 ? `владение: ${proficient}` : undefined} open={open}>
        <Skills details={details} />
      </Block>
      <Block title="Атаки" badge={details.attacks.length || undefined} open={open}>
        <Attacks details={details} />
      </Block>
      <Block title="Умения и черты" badge={details.features.length || undefined} open={open}>
        <Features sheet={sheet} details={details} />
      </Block>
      <Block title="Владения и языки" open={open}>
        <Proficiencies details={details} />
      </Block>
      <Block title="Настройка" badge={details.attunement.length ? `${details.attunement.length}/3` : undefined} open={open}>
        <AttunementList details={details} />
      </Block>
      {inventory && (
        <Block title="Инвентарь" badge={`${items} шт.`} open={open}>
          <Inventory inventory={inventory} open={open} onOpenTreasury={onOpenTreasury} />
        </Block>
      )}
    </div>
  );
}

/** Сведения для полного листа: мировоззрение, опыт, внешность, КД, расхождения листа. */
export function SheetFacts({ details }: { details: SheetDetails }) {
  const ac = details.armor_class_breakdown;
  const acTotal = ac.reduce((s, b) => s + b.value, 0);
  return (
    <div className="space-y-2 text-sm">
      <dl className="grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
        {details.alignment && (
          <div>
            <dt className="inline text-muted">Мировоззрение: </dt>
            <dd className="inline">{details.alignment}</dd>
          </div>
        )}
        {details.xp !== null && (
          <div>
            <dt className="inline text-muted">Опыт: </dt>
            <dd className="inline font-mono">
              {details.xp.toLocaleString("ru-RU")}
              {details.xp_next !== null ? ` / ${details.xp_next.toLocaleString("ru-RU")}` : ""}
            </dd>
          </div>
        )}
        {ac.length > 0 && (
          <div className="sm:col-span-2">
            <dt className="inline text-muted">КД: </dt>
            <dd className="inline text-xs">{breakdownText(ac, acTotal).replace(/= \+/, "= ")}</dd>
          </div>
        )}
      </dl>
      {details.appearance && <p className="text-xs leading-relaxed text-parchment/90">{details.appearance}</p>}
      {details.notes.length > 0 && (
        <Block title="Сверка листа с правилами" badge={details.notes.length}>
          <ul className="space-y-1 text-xs text-muted">
            {details.notes.map((n) => (
              <li key={n}>· {n}</li>
            ))}
          </ul>
        </Block>
      )}
    </div>
  );
}
