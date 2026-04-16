import type { DriveItem } from "../types";
import { getApiBaseUrl } from "../api/client";
import { ShareButton } from "./ShareButton";

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
  shareLabels?: {
    share: string;
    copyLink: string;
    copiedToClipboard: string;
    shareOn: string;
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

export function GalleryGrid({ items, labels, shareLabels, selectedId, folderPreviews, onOpenFolder, onSelectItem, onViewFile }: GalleryGridProps) {
  if (!items.length) {
    return <p className="empty">{labels.noContent}</p>;
  }

  return (
    <div className="gallery-grid">
      {items.map((item, index) => {
        const isFolder = item.itemType === "folder";
        const thumb = item.thumbnailLink
          ? `${getApiBaseUrl()}/drive/thumbnail/${encodeURIComponent(item.id)}?size=220`
          : null;
        const previews = isFolder ? folderPreviews?.[item.id] : undefined;

        return (
          <article
            key={item.id}
            className={`gallery-card ${selectedId === item.id ? "selected" : ""}`}
            style={{ "--i": index } as React.CSSProperties}
          >
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

              {/* Hover action icon */}
              <button
                type="button"
                className="thumb-action-btn"
                onClick={(e) => { e.stopPropagation(); if (isFolder) { onOpenFolder(item); } else { onViewFile?.(item); } }}
                title={isFolder ? labels.open : labels.view}
              >
                {isFolder ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    <polyline points="12 11 12 17" />
                    <polyline points="9 14 12 11 15 14" />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            <div className="meta">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <h3 title={item.name}>{item.name}</h3>
                {shareLabels && !isFolder && <ShareButton item={item} labels={shareLabels} variant="icon" />}
              </div>
              <p>{isFolder ? labels.folder : labels.file}{isFolder && previews ? ` · ${previews.length} items` : ""}</p>
              <p>{labels.updated}: {formatDate(item.modifiedTime)}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
