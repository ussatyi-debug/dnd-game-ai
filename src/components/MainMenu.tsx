import { useEffect, useRef, useState } from "react";

export type MenuAction = "home" | "knowledge" | "reference" | "save" | "load" | "settings" | "log" | "help";

interface MainMenuProps {
  onAction: (action: MenuAction) => void;
  /** Нового в базе знаний с прошлого открытия. */
  kbFresh?: number;
}

const ITEMS: { id: MenuAction; label: string; hint?: string }[] = [
  { id: "home", label: "Главный экран" },
  { id: "save", label: "Сохранить" },
  { id: "load", label: "Загрузить сохранение" },
  { id: "knowledge", label: "База знаний" },
  { id: "reference", label: "Справочник", hint: "заклинания, правила" },
  { id: "settings", label: "Настройки", hint: "озвучка, музыка, ИИ" },
  { id: "log", label: "Логирование", hint: "разбор ошибок" },
  { id: "help", label: "Инструкция", hint: "пароль мастера, озвучка, сохранения" },
];

export default function MainMenu({ onAction, kbFresh = 0 }: MainMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative rounded-md border border-edge px-3 py-1.5 text-sm hover:border-gold"
      >
        ☰ Меню
        {kbFresh > 0 && (
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-gold" title="В базе знаний есть новое" />
        )}
      </button>
      {open && (
        <ul
          role="menu"
          className="absolute left-0 z-50 mt-1 w-60 overflow-hidden rounded-lg border border-edge bg-panel shadow-xl shadow-black/60"
        >
          {ITEMS.map((item) => {
            return (
              <li key={item.id}>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    onAction(item.id);
                  }}
                  className="flex w-full items-baseline justify-between gap-2 px-4 py-2.5 text-left text-sm hover:bg-gold/10 disabled:cursor-default disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <span>
                    {item.label}
                    {item.id === "knowledge" && kbFresh > 0 && (
                      <span className="ml-2 rounded bg-gold/20 px-1.5 py-0.5 text-[10px] text-gold">новое: {kbFresh}</span>
                    )}
                  </span>
                  {item.hint && <span className="text-[11px] text-muted">{item.hint}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
