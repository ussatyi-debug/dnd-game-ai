// Раздел «Артефакты» слоя игрока: магические предметы отряда (живые данные движка)
// и известные герою артефакты кампании (ссылки на карточки слоя «Мир»).

import { useEffect, useState } from "react";
import { KB_ENTRIES } from "../data/kb/index.ts";
import { characterDetails, errorText, inventory, type PartyView } from "../lib/engine";

interface MagicItem {
  name: string;
  owner: string;
  note: string;
  attuned: boolean;
}

/** Магический ли предмет: «+1», настройка или узнаваемое слово из названия реликвии. */
const MAGIC = /\+\d|жезл|окуляр|обруч|плащ|сапоги|перчатки|кольцо|перстень|шлем|браслеты|чётки|мантия|кафф|жемчужина|посох|палочка|клинок|ключ|амулет|астролябия|реликви/i;

export default function KbArtifacts({ party, onOpen }: { party: PartyView | null; onOpen: (id: string) => void }) {
  const [items, setItems] = useState<MagicItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!party) return;
    let cancelled = false;
    Promise.all(
      party.members.map(async (m) => {
        const [details, inv] = await Promise.all([characterDetails(m.id), inventory(m.id)]);
        const attuned = details.attunement.map((a) => ({ name: a.name, owner: m.name, note: a.effect, attuned: true }));
        const names = new Set(attuned.map((a) => a.name.toLowerCase()));
        const carried = inv.containers.flatMap((c) =>
          c.groups.flatMap((g) =>
            g.items
              .filter((i) => !i.scroll && MAGIC.test(i.name) && !names.has(i.name.toLowerCase()))
              .map((i) => ({ name: i.name, owner: `${m.name} · ${c.name}`, note: i.notes, attuned: false })),
          ),
        );
        return [...attuned, ...carried];
      }),
    )
      .then((lists) => !cancelled && setItems(lists.flat()))
      .catch((e: unknown) => !cancelled && setError(errorText(e)));
    return () => {
      cancelled = true;
    };
  }, [party]);

  const known = KB_ENTRIES.filter((e) => e.layer === "world" && e.section === "artifacts");

  return (
    <div className="space-y-5">
      <section>
        <h3 className="mb-2 font-serif text-gold">Магические предметы отряда</h3>
        {error && <p className="text-sm text-fumble">{error}</p>}
        {!items && !error && <p className="text-sm text-muted">Загружаю…</p>}
        {items && (
          <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2">
            {items.map((i, k) => (
              <li key={k} className="rounded-lg border border-edge p-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium">{i.name}</span>
                  {i.attuned && <span className="shrink-0 text-[10px] text-arcane">настроен</span>}
                </div>
                <div className="text-xs text-gold/80">{i.owner}</div>
                {i.note && <p className="mt-1 text-xs leading-snug text-parchment/90">{i.note}</p>}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-[11px] text-muted">
          Список собирается из листов и инвентарей: настроенные предметы и вещи с магическими свойствами.
        </p>
      </section>
      <section>
        <h3 className="mb-2 font-serif text-gold">Известные артефакты кампании</h3>
        <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          {known.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => onOpen(e.id)}
                className="w-full rounded-lg border border-edge p-3 text-left hover:border-gold/60"
              >
                <div className="font-medium">{e.title}</div>
                {e.subtitle && <div className="text-xs text-muted">{e.subtitle}</div>}
                <p className="mt-1 text-sm leading-snug text-parchment/90">{e.summary}</p>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-muted">Подробности — в слое «Мир», раздел «Артефакты».</p>
      </section>
    </div>
  );
}
