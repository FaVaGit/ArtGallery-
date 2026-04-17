import { useCallback, useEffect, useRef, useState } from "react";

interface CreateFolderDialogProps {
  open: boolean;
  loading: boolean;
  labels: {
    title: string;
    nameLabel: string;
    namePlaceholder: string;
    create: string;
    cancel: string;
  };
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export function CreateFolderDialog({
  open,
  loading,
  labels,
  onConfirm,
  onCancel,
}: CreateFolderDialogProps) {
  const [name, setName] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, input, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
        }
      }
    },
    [onCancel],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleKeyDown]);

  if (!open) return null;

  const trimmed = name.trim();
  const valid = trimmed.length > 0 && trimmed.length <= 100;

  return (
    <div className="confirm-overlay" onClick={onCancel} role="dialog" aria-modal="true" aria-label={labels.title}>
      <div className="confirm-dialog" ref={dialogRef} onClick={(e) => e.stopPropagation()}>
        <h3 className="confirm-title">{labels.title}</h3>

        <label className="create-folder-label">
          <span>{labels.nameLabel}</span>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && valid && !loading) onConfirm(trimmed); }}
            placeholder={labels.namePlaceholder}
            maxLength={100}
            disabled={loading}
          />
        </label>

        <div className="confirm-actions">
          <button type="button" className="ghost" onClick={onCancel} disabled={loading}>
            {labels.cancel}
          </button>
          <button type="button" onClick={() => onConfirm(trimmed)} disabled={!valid || loading}>
            {loading ? "…" : labels.create}
          </button>
        </div>
      </div>
    </div>
  );
}
