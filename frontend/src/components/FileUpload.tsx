import { useRef, useState } from "react";

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  labels: {
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
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE = 25 * 1024 * 1024; // 25MB

interface UploadItem {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

export function FileUpload({ onUpload, labels }: FileUploadProps) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function validate(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) return labels.fileTypeError;
    if (file.size > MAX_SIZE) return labels.sizeLimit;
    return null;
  }

  function addFiles(files: FileList | File[]) {
    const newItems: UploadItem[] = Array.from(files).map((file) => {
      const err = validate(file);
      return { file, status: err ? "error" as const : "pending" as const, error: err ?? undefined };
    });
    setItems((prev) => [...prev, ...newItems]);

    // auto-upload valid ones
    for (const item of newItems) {
      if (item.status === "pending") {
        uploadOne(item);
      }
    }
  }

  async function uploadOne(item: UploadItem) {
    setItems((prev) => prev.map((i) => i.file === item.file ? { ...i, status: "uploading" } : i));
    try {
      await onUpload(item.file);
      setItems((prev) => prev.map((i) => i.file === item.file ? { ...i, status: "done" } : i));
    } catch (err) {
      const msg = err instanceof Error ? err.message : labels.uploadFailed;
      setItems((prev) => prev.map((i) => i.file === item.file ? { ...i, status: "error", error: msg } : i));
    }
  }

  return (
    <div>
      <div
        className={`file-upload-zone ${dragOver ? "drag-over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
      >
        <p>
          {labels.dragDrop}{" "}
          <span className="browse-link">{labels.browseFiles}</span>
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(",")}
          style={{ display: "none" }}
          onChange={(e) => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ""; }}
        />
      </div>

      {items.length > 0 && (
        <div className="upload-file-list">
          {items.map((item, i) => (
            <div key={i} className="upload-file-item">
              <span style={{ flex: 1, fontSize: 13 }}>{item.file.name}</span>
              {item.status === "uploading" && (
                <div className="upload-progress" style={{ flex: 1 }}>
                  <div className="upload-progress-bar" style={{ width: "60%" }} />
                </div>
              )}
              {item.status === "done" && <span style={{ color: "var(--text-success)", fontSize: 12 }}>✓ {labels.uploadComplete}</span>}
              {item.status === "error" && <span style={{ color: "var(--text-danger)", fontSize: 12 }}>{item.error}</span>}
              {item.status === "pending" && <span style={{ color: "var(--text-tertiary)", fontSize: 12 }}>…</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
