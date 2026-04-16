import { useState } from "react";
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

function ThumbImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && <div className="thumb-shimmer skeleton-shimmer" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={loaded ? "thumb-img--loaded" : "thumb-img--loading"}
        onLoad={() => setLoaded(true)}
      />
    </>
  );
}

export function GalleryGrid({ items, labels, shareLabels, selectedId, folderPreviews, onOpenFolder, onViewFile }: GalleryGridProps) {
  if (!items.length) {
    return (
      <div className="empty-state">
        <svg className="empty-state-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <p>{labels.noContent}</p>
      </div>
    );
  }

  return (
    <div className="gallery-grid" role="list">
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
            role="listitem"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (isFolder) { onOpenFolder(item); } else { onViewFile?.(item); } } }}
          >
            <div className="thumb">
              {isFolder && previews && previews.length > 0 ? (
                <div className="folder-preview-grid">
                  {previews.slice(0, 4).map((p) => (
                    <ThumbImage
                      key={p.id}
                      src={`${getApiBaseUrl()}/drive/thumbnail/${encodeURIComponent(p.id)}?size=110`}
                      alt={p.name}
                    />
                  ))}
                </div>
              ) : thumb ? (
                <ThumbImage src={thumb} alt={item.name} />
              ) : (
                <span>{isFolder ? "📁" : "🖼"}</span>
              )}

              {/* Hover overlay with icon */}
              <div className="thumb-hover-shimmer">
                <span className="thumb-hover-icon">
                  {isFolder ? (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      <polyline points="12 11 12 17" />
                      <polyline points="9 14 12 11 15 14" />
                    </svg>
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </span>
              </div>
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
