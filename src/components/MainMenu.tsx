import { useEffect, useRef, useState } from "react";

export type MenuAction = "knowledge" | "save" | "load" | "models";

interface MainMenuProps {
  onAction: (action: MenuAction) => void;
}

const ITEMS: { id: MenuAction | "home"; label: string; hint?: string }[] = [
  { id: "home", label: "Главный экран", hint: "появится позже" },
  { id: "save", label: "Выгрузить сохранение" },
  { id: "load", label: "Загрузить сохранение" },
  { id: "knowledge", label: "База знаний" },
  { id: "models", label: "Модели ИИ" },
];

export default function MainMenu({ onAction }: MainMenuProps) {
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
        className="rounded-md border border-edge px-3 py-1.5 text-sm hover:border-gold"
      >
        ☰ Меню
      </button>
      {open && (
        <ul
          role="menu"
          className="absolute left-0 z-50 mt-1 w-60 overflow-hidden rounded-lg border border-edge bg-panel shadow-xl shadow-black/60"
        >
          {ITEMS.map((item) => {
            const disabled = item.id === "home";
            return (
              <li key={item.id}>
                <button
                  type="button"
                  role="menuitem"
                  disabled={disabled}
                  onClick={() => {
                    if (item.id === "home") return;
                    setOpen(false);
                    onAction(item.id);
                  }}
                  className="flex w-full items-baseline justify-between gap-2 px-4 py-2.5 text-left text-sm hover:bg-gold/10 disabled:cursor-default disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  {item.label}
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
