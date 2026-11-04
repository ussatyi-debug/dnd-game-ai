import { useEffect, useState } from "react";
import { copyText } from "../lib/clipboard";

interface CopyButtonProps {
  text: string;
  className?: string;
}

/** Кнопка «Копировать» с подтверждением. */
export default function CopyButton({ text, className = "" }: CopyButtonProps) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const timer = window.setTimeout(() => setState("idle"), 1500);
    return () => window.clearTimeout(timer);
  }, [state]);

  return (
    <button
      type="button"
      onClick={() => {
        void copyText(text).then((ok) => setState(ok ? "done" : "failed"));
      }}
      className={`rounded-md border border-edge px-2 py-1 text-xs text-muted hover:border-gold hover:text-parchment ${className}`}
      aria-label={`Скопировать: ${text}`}
    >
      {state === "done" ? "Скопировано" : state === "failed" ? "Не удалось" : "Копировать"}
    </button>
  );
}
