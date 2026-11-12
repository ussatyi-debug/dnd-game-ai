import { formatGold, type PartyView, type RecruitInfo, type RecruitRequest } from "../lib/engine";

interface PartyPanelProps {
  party: PartyView | null;
  activeId: string;
  onSelect: (id: string) => void;
  onOpenTreasury: () => void;
  /** Можно ли принять спутника (своя кампания). */
  recruit?: RecruitInfo | null;
  /** Предложения мастера принять персонажа. */
  recruits?: RecruitRequest[];
  onAddMember?: (request: RecruitRequest | null) => void;
  onDismissRecruit?: (id: number) => void;
}

export default function PartyPanel({
  party,
  activeId,
  onSelect,
  onOpenTreasury,
  recruit,
  recruits = [],
  onAddMember,
  onDismissRecruit,
}: PartyPanelProps) {
  if (!party) {
    return (
      <section className="flex-1 rounded-xl border border-edge bg-panel p-4 text-sm text-muted">
        Отряд загружается…
      </section>
    );
  }

  // Порядок — как в отряде: новые спутники в конце; отсутствующие в сцене только приглушены.
  const members = party.members;

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-edge bg-panel">
      <header className="shrink-0 border-b border-edge px-4 py-3">
        <h2 className="font-serif text-lg text-gold">Отряд</h2>
        <p className="text-sm">
          День {party.scene.day}
          {party.scene.time ? `, ${party.scene.time}` : ""}
        </p>
        <p className="text-xs text-muted">{party.scene.location}</p>
        {party.scene.situation && (
          <details className="mt-1 text-xs">
            <summary className="cursor-pointer text-gold/80">Обстановка и планы</summary>
            <p className="mt-1 max-h-48 overflow-y-auto leading-relaxed text-muted">{party.scene.situation}</p>
          </details>
        )}
      </header>

      {recruits.length > 0 && (
        <div className="shrink-0 space-y-2 border-b border-edge p-3">
          {recruits.map((r) => (
            <div key={r.id} className="rounded-lg border border-gold/60 bg-gold/5 p-2 text-xs">
              <p>
                Мастер предлагает принять в отряд: <span className="text-gold">{r.name}</span>
                {r.class ? ` · ${r.class}` : ""} · до {r.level} ур.
              </p>
              {r.note && <p className="mt-1 text-muted">{r.note}</p>}
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={() => onAddMember?.(r)} className="rounded border border-gold px-2 py-1 text-gold hover:bg-gold/10">
                  Собрать лист
                </button>
                <button type="button" onClick={() => onDismissRecruit?.(r.id)} className="rounded border border-edge px-2 py-1 text-muted hover:border-fumble">
                  Отказаться
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {members.map((m) => {
          const hpPercent = m.hit_points.max > 0 ? (m.hit_points.current / m.hit_points.max) * 100 : 0;
          const active = m.id === activeId;
          return (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => onSelect(m.id)}
                aria-pressed={active}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  active ? "border-gold bg-gold/5" : "border-edge hover:border-gold/50"
                } ${m.in_scene ? "" : "opacity-60"}`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-medium">{m.name}</span>
                  <span className="shrink-0 font-mono text-xs text-muted">КД {m.armor_class}</span>
                </div>
                {m.race && m.race !== m.summary && <div className="text-xs text-parchment/80">{m.race}</div>}
                <div className="text-xs text-muted">{m.summary}</div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink">
                    <div className="h-full rounded-full bg-blood" style={{ width: `${hpPercent}%` }} />
                  </div>
                  <span className="font-mono text-xs">
                    {m.hit_points.current}/{m.hit_points.max}
                  </span>
                </div>
                {m.key_resources.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                    {m.key_resources.map((r) => (
                      <span key={r.id} className="text-[11px] text-muted">
                        {r.name.replace(/\s*\(.*\)$/, "")}{" "}
                        <span className={r.current === 0 ? "text-fumble" : "text-gold"}>
                          {r.current}/{r.max}
                        </span>
                      </span>
                    ))}
                  </div>
                )}
                {!m.in_scene && <div className="mt-1 text-[11px] text-gold/80">📍 {m.location}</div>}
              </button>
            </li>
          );
        })}
      </ul>

      {recruit && recruit.reason !== "в кампании «Дом Стрэндж» отряд уже собран" && (
        <div className="shrink-0 border-t border-edge px-4 py-2">
          <button
            type="button"
            disabled={!recruit.allowed}
            onClick={() => onAddMember?.(null)}
            className="w-full rounded-md border border-edge px-3 py-1.5 text-sm hover:border-gold disabled:opacity-40"
          >
            + Добавить члена отряда
          </button>
          <p className="mt-1 text-[11px] text-muted">
            {recruit.allowed
              ? `Спутников ${recruit.companions}/${recruit.max_companions} · уровень до ${recruit.max_level}`
              : recruit.reason}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onOpenTreasury}
        className="flex items-center justify-between gap-2 border-t border-edge px-4 py-3 text-left hover:bg-gold/5"
      >
        <span>
          <span className="block text-sm">{party.treasury_name}</span>
          <span className="block text-[11px] text-muted">Состав, места хранения, журнал</span>
        </span>
        <span className="font-mono text-gold">≈ {formatGold(party.treasury_total)}</span>
      </button>
    </section>
  );
}
