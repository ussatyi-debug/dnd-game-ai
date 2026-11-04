import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  addManualTreasuryEntry,
  errorText,
  formatGold,
  treasuryView,
  type AssetKind,
  type EntrySource,
  type TreasuryView,
} from "../lib/engine";
import Modal from "./Modal";

const sourceLabel: Record<EntrySource, string> = {
  opening: "начальный остаток",
  master: "мастер",
  manual: "вручную",
};

interface TreasuryWindowProps {
  onClose: () => void;
  onChanged: () => void;
}

type View = "storage" | "log";

export default function TreasuryWindow({ onClose, onChanged }: TreasuryWindowProps) {
  const [data, setData] = useState<TreasuryView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>("storage");
  const [kindFilter, setKindFilter] = useState<AssetKind | "all">("all");
  const [locationFilter, setLocationFilter] = useState("all");

  useEffect(() => {
    treasuryView()
      .then(setData)
      .catch((e: unknown) => setError(errorText(e)));
  }, []);

  const entries = useMemo(() => {
    if (!data) return [];
    return data.entries.filter(
      (e) =>
        (kindFilter === "all" || e.kind === kindFilter) &&
        (locationFilter === "all" || e.location_name === locationFilter),
    );
  }, [data, kindFilter, locationFilter]);

  return (
    <Modal title={data?.name ?? "Казна"} onClose={onClose} size="xl">
      {error && <p className="p-4 text-fumble">{error}</p>}
      {!data && !error && <p className="p-4 text-muted">Загрузка…</p>}
      {data && (
        <>
          <div className="grid grid-cols-2 gap-2 border-b border-edge p-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="col-span-2 rounded-lg border border-gold/50 bg-gold/5 p-2 sm:col-span-3 lg:col-span-1">
              <div className="text-[11px] text-muted">Всего</div>
              <div className="font-mono text-lg text-gold">{formatGold(data.total)}</div>
            </div>
            {data.by_kind.map((k) => (
              <div key={k.kind} className="rounded-lg border border-edge p-2">
                <div className="text-[11px] text-muted">{k.label}</div>
                <div className="font-mono">{formatGold(k.total)}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-1 border-b border-edge p-2" role="tablist">
            {(
              [
                ["storage", "Где что лежит"],
                ["log", "Журнал операций"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={view === id}
                onClick={() => setView(id)}
                className={`rounded-md px-3 py-1.5 text-sm ${
                  view === id ? "bg-gold text-ink" : "text-muted hover:text-parchment"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {view === "storage" ? (
            <div className="space-y-4 p-3">
              {data.locations.map((location) => (
                <section key={location.id} className="rounded-lg border border-edge">
                  <header className="flex items-baseline justify-between gap-2 border-b border-edge px-3 py-2">
                    <h3 className="font-medium">{location.name}</h3>
                    <span className="font-mono text-sm text-gold">{formatGold(location.total)}</span>
                  </header>
                  <table className="w-full text-sm">
                    <tbody>
                      {location.lines.map((line) => (
                        <tr key={line.asset_id} className="border-b border-edge/50 last:border-0">
                          <td className="px-3 py-1.5">{line.name}</td>
                          <td className="px-2 py-1.5 text-right font-mono whitespace-nowrap text-muted">
                            {line.kind === "coin"
                              ? line.quantity.toLocaleString("ru-RU")
                              : `${line.quantity} × ${formatGold(line.unit_value)}`}
                          </td>
                          <td className="px-3 py-1.5 text-right font-mono whitespace-nowrap">
                            {line.unit_value === 0 ? "не оценено" : formatGold(line.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              ))}
            </div>
          ) : (
            <div className="space-y-3 p-3">
              <ManualEntryForm
                data={data}
                onAdded={(next) => {
                  setData(next);
                  onChanged();
                }}
              />
              <div className="flex flex-wrap gap-2">
                <select
                  value={kindFilter}
                  onChange={(e) => setKindFilter(e.target.value as AssetKind | "all")}
                  aria-label="Фильтр по виду"
                  className="rounded-md border border-edge bg-ink px-2 py-1.5 text-sm"
                >
                  <option value="all">Все виды</option>
                  {data.by_kind.map((k) => (
                    <option key={k.kind} value={k.kind}>
                      {k.label}
                    </option>
                  ))}
                </select>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  aria-label="Фильтр по месту"
                  className="rounded-md border border-edge bg-ink px-2 py-1.5 text-sm"
                >
                  <option value="all">Все места</option>
                  {data.storage.map((l) => (
                    <option key={l.id} value={l.name}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
              <ol className="space-y-1.5">
                {entries.map((e) => (
                  <li key={e.id} className="rounded-lg border border-edge px-3 py-2 text-sm">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs text-muted">
                        День {e.day}
                        {e.time ? `, ${e.time}` : ""} · {sourceLabel[e.source]}
                      </span>
                      <span className={`font-mono ${e.quantity < 0 ? "text-fumble" : "text-crit"}`}>
                        {e.quantity > 0 ? "+" : "−"}
                        {e.kind === "coin"
                          ? `${Math.abs(e.quantity).toLocaleString("ru-RU")} ЗМ`
                          : `${Math.abs(e.quantity)} шт.`}
                      </span>
                    </div>
                    <div className="mt-0.5">{e.reason}</div>
                    <div className="text-xs text-muted">
                      {e.asset_name} · {e.location_name}
                      {e.kind !== "coin" && e.value !== 0 ? ` · ${formatGold(Math.abs(e.value))}` : ""}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}

function ManualEntryForm({
  data,
  onAdded,
}: {
  data: TreasuryView;
  onAdded: (next: TreasuryView) => void;
}) {
  const [open, setOpen] = useState(false);
  const [assetId, setAssetId] = useState(data.assets[0]?.id ?? "");
  const [locationId, setLocationId] = useState(data.storage[0]?.id ?? "");
  const [direction, setDirection] = useState<"in" | "out">("out");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const value = Number.parseInt(amount, 10);
  const valid = Number.isInteger(value) && value > 0;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!valid) return;
    setBusy(true);
    setError(null);
    addManualTreasuryEntry(assetId, locationId, direction === "in" ? value : -value, reason)
      .then((next) => {
        onAdded(next);
        setAmount("");
        setReason("");
        setOpen(false);
      })
      .catch((e: unknown) => setError(errorText(e)))
      .finally(() => setBusy(false));
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-edge px-3 py-1.5 text-sm hover:border-gold"
      >
        + Запись вручную
      </button>
    );
  }

  const field = "rounded-md border border-edge bg-ink px-2 py-1.5 text-sm text-parchment";
  return (
    <form onSubmit={submit} className="space-y-2 rounded-lg border border-gold/40 p-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <select value={assetId} onChange={(e) => setAssetId(e.target.value)} aria-label="Ценность" className={field}>
          {data.assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <select
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          aria-label="Место хранения"
          className={field}
        >
          {data.storage.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <select
          value={direction}
          onChange={(e) => setDirection(e.target.value as "in" | "out")}
          aria-label="Приход или расход"
          className={field}
        >
          <option value="out">Расход</option>
          <option value="in">Приход</option>
        </select>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="numeric"
          placeholder="Количество"
          aria-label="Количество"
          className={`${field} w-32`}
        />
      </div>
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Причина"
        aria-label="Причина"
        className={`${field} w-full`}
      />
      {error && <p className="text-sm text-fumble">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!valid || busy}
          className="rounded-md bg-blood px-3 py-1.5 text-sm text-parchment disabled:opacity-40"
        >
          Записать
        </button>
        <button type="button" onClick={() => setOpen(false)} className="px-3 py-1.5 text-sm text-muted">
          Отмена
        </button>
      </div>
      <p className="text-xs text-muted">Запись получит пометку «вручную» и дату текущей сцены.</p>
    </form>
  );
}
