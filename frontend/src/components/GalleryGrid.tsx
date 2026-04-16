import type { DriveItem } from "../types";
import { getApiBaseUrl } from "../api/client";

interface GalleryGridProps {
  items: DriveItem[];
  labels: {
    noContent: string;
    folder: string;
    file: string;
    updated: string;
    open: string;
    view: string;
  };
  selectedId?: string;
  folderPreviews?: Record<string, DriveItem[]>;
  onOpenFolder: (item: DriveItem) => void;
  onSelectItem?: (item: DriveItem) => void;
  onViewFile?: (item: DriveItem) => void;
}

function formatDate(value: string | null): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString();
}

export function GalleryGrid({ items, labels, selectedId, folderPreviews, onOpenFolder, onSelectItem, onViewFile }: GalleryGridProps) {
  if (!items.length) {
    return <p className="empty">{labels.noContent}</p>;
  }

  return (
    <div className="gallery-grid">
      {items.map((item) => {
        const isFolder = item.itemType === "folder";
        const thumb = item.thumbnailLink
          ? `${getApiBaseUrl()}/drive/thumbnail/${encodeURIComponent(item.id)}?size=220`
          : null;
        const previews = isFolder ? folderPreviews?.[item.id] : undefined;

        return (
          <article key={item.id} className={`gallery-card ${selectedId === item.id ? "selected" : ""}`}>
            <button
              type="button"
              className="select-overlay"
              onClick={() => onSelectItem?.(item)}
              aria-label={`Select ${item.name}`}
            />

            <div className="thumb">
              {isFolder && previews && previews.length > 0 ? (
                <div className="folder-preview-grid">
                  {previews.slice(0, 4).map((p) => (
                    <img
                      key={p.id}
                      src={`${getApiBaseUrl()}/drive/thumbnail/${encodeURIComponent(p.id)}?size=110`}
                      alt={p.name}
                      loading="lazy"
                    />
                  ))}
                </div>
              ) : thumb ? (
                <img src={thumb} alt={item.name} loading="lazy" />
              ) : (
                <span>{isFolder ? "📁" : "🖼"}</span>
              )}
            </div>

            <div className="meta">
              <h3 title={item.name}>{item.name}</h3>
              <p>{isFolder ? labels.folder : labels.file}{isFolder && previews ? ` · ${previews.length} items` : ""}</p>
              <p>{labels.updated}: {formatDate(item.modifiedTime)}</p>
            </div>

            <div className="actions">
              {isFolder ? (
                <button type="button" onClick={() => onOpenFolder(item)}>
                  {labels.open}
                </button>
              ) : (
                <button type="button" className="button-link" onClick={() => onViewFile?.(item)}>
                  {labels.view}
                </button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
