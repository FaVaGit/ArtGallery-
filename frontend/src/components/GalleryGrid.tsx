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

export function GalleryGrid({ items, labels, shareLabels, selectedId, folderPreviews, onOpenFolder, onViewFile }: GalleryGridProps) {
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
            onClick={() => { if (isFolder) { onOpenFolder(item); } else { onViewFile?.(item); } }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (isFolder) { onOpenFolder(item); } else { onViewFile?.(item); } } }}
          >
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

              {/* Hover shimmer overlay */}
              <div className="thumb-hover-shimmer" />
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
