import type { DriveItem } from "../types";

interface GalleryGridProps {
  items: DriveItem[];
  selectedId?: string;
  onOpenFolder: (item: DriveItem) => void;
  onSelectItem?: (item: DriveItem) => void;
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

export function GalleryGrid({ items, selectedId, onOpenFolder, onSelectItem }: GalleryGridProps) {
  if (!items.length) {
    return <p className="empty">No content found in this folder.</p>;
  }

  return (
    <div className="gallery-grid">
      {items.map((item) => {
        const isFolder = item.itemType === "folder";
        const thumb = item.thumbnailLink;

        return (
          <article key={item.id} className={`gallery-card ${selectedId === item.id ? "selected" : ""}`}>
            <button
              type="button"
              className="select-overlay"
              onClick={() => onSelectItem?.(item)}
              aria-label={`Select ${item.name}`}
            />

            <div className="thumb">
              {thumb ? <img src={thumb} alt={item.name} loading="lazy" /> : <span>{isFolder ? "Folder" : "Media"}</span>}
            </div>

            <div className="meta">
              <h3 title={item.name}>{item.name}</h3>
              <p>{isFolder ? "Folder" : "File"}</p>
              <p>Updated: {formatDate(item.modifiedTime)}</p>
            </div>

            <div className="actions">
              {isFolder ? (
                <button type="button" onClick={() => onOpenFolder(item)}>
                  Open
                </button>
              ) : (
                <a href={item.webViewLink ?? "#"} target="_blank" rel="noreferrer" className="button-link">
                  View
                </a>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
