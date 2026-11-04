import { useEffect, type ReactNode } from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Ширина окна на ПК. */
  size?: "md" | "lg" | "xl";
}

const widths = { md: "lg:max-w-xl", lg: "lg:max-w-3xl", xl: "lg:max-w-5xl" };

/** Окно поверх экрана: на телефоне — на весь экран, на ПК — по центру. */
export default function Modal({ title, onClose, children, size = "lg" }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-stretch justify-center bg-black/70 lg:items-center lg:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`flex max-h-full w-full flex-col overflow-hidden bg-panel lg:max-h-[90vh] lg:rounded-xl lg:border lg:border-edge ${widths[size]}`}
      >
        <header className="flex items-center justify-between border-b border-edge px-4 py-3">
          <h2 className="font-serif text-xl text-gold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1 text-2xl leading-none text-muted hover:text-parchment"
            aria-label="Закрыть"
          >
            ×
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
