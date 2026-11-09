// Главный экран: карта известного мира, кампании, загрузка, настройки, справочник.

import { useState } from "react";
import worldMap from "../assets/world-map.webp";
import { portraitUrl } from "../data/rules/portraits.ts";
import { ago, type AutosaveInfo } from "../lib/autosave";
import type { CampaignInfo } from "../lib/campaigns";

export type HomeAction = "continue" | "campaign" | "new" | "load" | "settings" | "reference" | "exit";

interface HomeScreenProps {
  /** Последнее автосохранение (или null). */
  last: AutosaveInfo | null;
  /** Игра уже идёт в этом запуске — «Продолжить» возвращает к ней. */
  inGame: boolean;
  /** Показывать «Выход» (приложение на ПК). */
  canExit: boolean;
  onAction: (action: HomeAction) => void;
  /** Название текущей кампании. */
  campaignTitle: string;
  /** Свои кампании (новые первыми). */
  campaigns: CampaignInfo[];
  currentCampaign: string;
  onOpenCampaign: (id: string) => void;
  /** Удалить свою кампанию со всеми сохранениями. */
  onDeleteCampaign: (id: string) => void;
  /** Мастер подключён (выбрана модель ИИ). */
  masterReady: boolean;
  onConnectMaster: () => void;
}

function Item({
  label,
  hint,
  onClick,
  soon,
}: {
  label: string;
  hint?: string;
  onClick?: () => void;
  soon?: boolean;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        disabled={soon}
        className="flex w-full items-baseline justify-between gap-3 rounded-lg border border-edge/70 bg-ink/70 px-4 py-3 text-left backdrop-blur-sm hover:border-gold disabled:cursor-default disabled:opacity-50 disabled:hover:border-edge/70"
      >
        <span className="font-medium">{label}</span>
        {(hint || soon) && <span className="text-[11px] text-muted">{soon ? "скоро" : hint}</span>}
      </button>
    </li>
  );
}

export default function HomeScreen({
  last,
  inGame,
  canExit,
  onAction,
  campaignTitle,
  campaigns,
  currentCampaign,
  onOpenCampaign,
  onDeleteCampaign,
  masterReady,
  onConnectMaster,
}: HomeScreenProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const canContinue = inGame || last !== null;
  return (
    <div className="fixed inset-0 z-30 overflow-y-auto bg-ink">
      <img
        src={worldMap}
        alt=""
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-60"
      />
      {/* Тёмный градиент к краям экрана. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(10,8,6,0.25) 0%, rgba(10,8,6,0.75) 60%, rgba(10,8,6,0.97) 100%)",
        }}
      />
      <main className="relative mx-auto flex min-h-full max-w-md flex-col justify-center gap-6 px-5 py-10">
        <header className="text-center">
          <h1 className="font-serif text-4xl text-gold drop-shadow">DnD Game AI</h1>
          <p className="mt-1 text-sm text-parchment/80">{campaignTitle}</p>
        </header>

        {canContinue && (
          <button
            type="button"
            onClick={() => onAction("continue")}
            className="rounded-xl border border-gold bg-ink/80 px-5 py-4 text-left backdrop-blur-sm hover:bg-gold/10"
          >
            <span className="block font-serif text-xl text-gold">Продолжить</span>
            <span className="block text-sm text-parchment/90">
              {inGame
                ? "Вернуться к игре"
                : last
                  ? `День ${last.day ?? "?"}${last.location ? `, ${last.location}` : ""}`
                  : ""}
            </span>
            {!inGame && last && <span className="block text-xs text-muted">автосохранение, {ago(last.savedAt)}</span>}
          </button>
        )}

        {!masterReady && (
          <div className="mb-3 rounded-lg border border-fumble/70 bg-fumble/10 p-3 backdrop-blur-sm">
            <p className="text-sm text-fumble">⚠ Мастер не подключён</p>
            <p className="mt-0.5 text-xs text-parchment/80">Без него игра не начнётся: выберите модель ИИ.</p>
            <button
              type="button"
              onClick={onConnectMaster}
              className="mt-2 w-full rounded-md border border-gold px-3 py-2 text-sm text-gold hover:bg-gold/10"
            >
              Подключить мастера
            </button>
          </div>
        )}
        <ul className="space-y-2">
          <Item label="Кампания «Дом Стрэндж»" hint="сохранения" onClick={() => onAction("campaign")} />
          <Item label="Новая кампания" hint="создать героя" onClick={() => onAction("new")} />
          {campaigns.length > 0 && (
            <li className="rounded-lg border border-edge/70 bg-ink/70 p-2 backdrop-blur-sm">
              <p className="px-2 pb-1 text-[11px] uppercase tracking-wider text-muted">Свои кампании</p>
              <ul className="space-y-1">
                {campaigns.map((c) => {
                  const img = c.hero.portrait ? portraitUrl(c.hero.portrait) : null;
                  return (
                    <li key={c.id} className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onOpenCampaign(c.id)}
                        className={`flex min-w-0 flex-1 items-center gap-3 rounded-md px-2 py-1.5 text-left hover:bg-gold/10 ${c.id === currentCampaign ? "text-gold" : ""}`}
                      >
                        {img ? (
                          <img src={img} alt="" className="h-10 w-8 rounded object-cover object-top" />
                        ) : (
                          <span className="h-10 w-8 rounded bg-panel" />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm">{c.hero.name}</span>
                          <span className="block truncate text-[11px] text-muted">{c.hero.summary}</span>
                        </span>
                      </button>
                      {confirmDelete === c.id ? (
                        <span className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmDelete(null);
                              onDeleteCampaign(c.id);
                            }}
                            className="rounded-md border border-fumble/70 px-2 py-1 text-xs text-fumble"
                          >
                            Удалить всё
                          </button>
                          <button type="button" onClick={() => setConfirmDelete(null)} className="rounded-md border border-edge px-2 py-1 text-xs">
                            Нет
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(c.id)}
                          className="shrink-0 px-2 text-muted hover:text-fumble"
                          aria-label={`Удалить кампанию ${c.title}`}
                          title="Удалить кампанию и её сохранения"
                        >
                          🗑
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          )}
          <Item label="Загрузить из файла" onClick={() => onAction("load")} />
          <Item label="Справочник" hint="заклинания, правила" onClick={() => onAction("reference")} />
          <Item label="Настройки" hint="озвучка, музыка, ИИ-мастер" onClick={() => onAction("settings")} />
          <Item label="Поддержать проект" soon />
          {canExit && <Item label="Выход" onClick={() => onAction("exit")} />}
        </ul>
      </main>
    </div>
  );
}
