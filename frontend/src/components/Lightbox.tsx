import { useCallback, useEffect } from "react";
import type { DriveItem } from "../types";
import { getApiBaseUrl } from "../api/client";

interface LightboxProps {
  item: DriveItem;
  onClose: () => void;
  closeLabel: string;
}

export function Lightbox({ item, onClose, closeLabel }: LightboxProps) {
  const imgSrc = `${getApiBaseUrl()}/drive/thumbnail/${encodeURIComponent(item.id)}?size=1600`;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return (
    <div className="lightbox-overlay" onClick={onClose} role="dialog" aria-label={item.name}>
      <button type="button" className="lightbox-close" onClick={onClose} aria-label={closeLabel}>
        ✕
      </button>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <img src={imgSrc} alt={item.name} className="lightbox-image" />
        <p className="lightbox-caption">{item.name}</p>
      </div>
    </div>
  );
}
