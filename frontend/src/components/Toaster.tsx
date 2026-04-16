import { useCallback, useState } from "react";
import { useEvent } from "../events/useEvent";

interface Toast {
  id: number;
  kind: "info" | "error" | "success";
  message: string;
  exiting?: boolean;
}

let nextId = 1;

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 300);
  }, []);

  const push = useCallback((kind: Toast["kind"], message: string) => {
    const id = nextId++;
    setToasts((prev) => [...prev.slice(-4), { id, kind, message }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  useEvent("notify:info", ({ message }) => push("info", message));
  useEvent("notify:error", ({ message }) => push("error", message));
  useEvent("notify:success", ({ message }) => push("success", message));

  if (!toasts.length) return null;

  return (
    <div className="toaster" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.kind} ${t.exiting ? "toast--exit" : ""}`}>
          <span className="toast-message">{t.message}</span>
          <button type="button" className="toast-dismiss" onClick={() => dismiss(t.id)} aria-label="Dismiss">
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
