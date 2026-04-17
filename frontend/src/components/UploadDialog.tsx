import { useCallback, useEffect, useRef, useState } from "react";
import { FileUpload } from "./FileUpload";

interface UploadDialogProps {
  open: boolean;
  labels: {
    title: string;
    close: string;
    uploadLabels: {
      title: string;
      dragDrop: string;
      browseFiles: string;
      uploading: string;
      uploadComplete: string;
      uploadFailed: string;
      fileTypeError: string;
      sizeLimit: string;
      selectFiles: string;
    };
  };
  onUpload: (file: File) => Promise<void>;
  onClose: () => void;
}

export function UploadDialog({ open, labels, onUpload, onClose }: UploadDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [uploadCount, setUploadCount] = useState(0);

  const handleUpload = useCallback(async (file: File) => {
    await onUpload(file);
    setUploadCount((c) => c + 1);
  }, [onUpload]);

  const handleClose = useCallback(() => {
    setUploadCount(0);
    onClose();
  }, [onClose]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
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
    [handleClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="confirm-overlay" onClick={handleClose} role="dialog" aria-modal="true" aria-label={labels.title}>
      <div className="confirm-dialog upload-dialog" ref={dialogRef} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 className="confirm-title">{labels.title}</h3>
          <button type="button" className="ghost" onClick={handleClose} aria-label={labels.close}>✕</button>
        </div>

        <FileUpload
          onUpload={handleUpload}
          labels={labels.uploadLabels}
        />

        {uploadCount > 0 && (
          <p style={{ marginTop: "var(--space-s)", fontSize: 13, color: "var(--text-success)" }}>
            {uploadCount} file{uploadCount > 1 ? "s" : ""} uploaded
          </p>
        )}
      </div>
    </div>
  );
}
