import { useCallback, useEffect, useRef, useState } from "react";
import type { DriveItem } from "../types";
import { getApiBaseUrl } from "../api/client";
import { getComments, postComment, deleteComment, getRating, postRating, type CommentResponse } from "../api/socialApi";
import { trackEvent } from "../api/analyticsApi";
import { ShareButton } from "./ShareButton";
import { StarRating } from "./StarRating";
import { CommentSection } from "./CommentSection";
import type { AppMessages } from "../i18n/messages";

interface LightboxProps {
  item: DriveItem;
  onClose: () => void;
  messages: AppMessages;
  token?: string | null;
  username?: string;
  isAdmin?: boolean;
  items?: DriveItem[];
  currentIndex?: number;
  onNavigate?: (item: DriveItem) => void;
}

export function Lightbox({ item, onClose, messages, token, username, isAdmin, items, currentIndex, onNavigate }: LightboxProps) {
  const imgSrc = `${getApiBaseUrl()}/drive/thumbnail/${encodeURIComponent(item.id)}?size=1600`;
  const [closing, setClosing] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Social state
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [userRating, setUserRating] = useState<number | null>(null);

  // Navigation helpers
  const fileItems = items?.filter((i) => i.itemType === "file") ?? [];
  const fileIndex = fileItems.findIndex((i) => i.id === item.id);
  const hasPrev = fileIndex > 0;
  const hasNext = fileIndex >= 0 && fileIndex < fileItems.length - 1;
  const totalFiles = fileItems.length;
  const displayIndex = fileIndex >= 0 ? fileIndex + 1 : (currentIndex ?? 0) + 1;

  function navigateTo(direction: "prev" | "next") {
    if (!onNavigate) return;
    const idx = direction === "prev" ? fileIndex - 1 : fileIndex + 1;
    if (idx >= 0 && idx < fileItems.length) {
      setImgLoaded(false);
      onNavigate(fileItems[idx]);
    }
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft" && hasPrev && onNavigate) {
        const idx = fileIndex - 1;
        if (idx >= 0 && idx < fileItems.length) {
          setImgLoaded(false);
          onNavigate(fileItems[idx]);
        }
      }
      if (e.key === "ArrowRight" && hasNext && onNavigate) {
        const idx = fileIndex + 1;
        if (idx >= 0 && idx < fileItems.length) {
          setImgLoaded(false);
          onNavigate(fileItems[idx]);
        }
      }

      // Focus trapping
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onClose, hasPrev, hasNext, fileItems, fileIndex, onNavigate],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    // Track lightbox open
    trackEvent("lightbox_open", item.id);

    // Load social data
    getComments(item.id).then(setComments).catch(() => {});
    getRating(item.id, token ?? undefined).then((r) => {
      setAvgRating(r.averageRating);
      setUserRating(r.userRating);
    }).catch(() => {});

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown, item.id, token]);

  function handleClose() {
    setClosing(true);
    setTimeout(onClose, 200);
  }

  async function handlePostComment(text: string) {
    if (!token) return;
    try {
      const newComment = await postComment(token, item.id, text);
      setComments((prev) => [...prev, newComment]);
    } catch { /* ignore */ }
  }

  async function handleDeleteComment(commentId: number) {
    if (!token) return;
    try {
      await deleteComment(token, item.id, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch { /* ignore */ }
  }

  async function handleRate(score: number) {
    if (!token) return;
    try {
      const result = await postRating(token, item.id, score);
      setAvgRating(result.averageRating);
      setUserRating(result.userRating);
    } catch { /* ignore */ }
  }

  return (
    <div
      className={`lightbox-overlay ${closing ? "lightbox-closing" : ""}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={item.name}
      ref={dialogRef}
    >
      <div className="lightbox-header-actions">
        {totalFiles > 1 && (
          <span className="lightbox-counter">{displayIndex} / {totalFiles}</span>
        )}
        <ShareButton item={item} labels={messages.share} />
        <button type="button" className="lightbox-close" onClick={handleClose} aria-label={messages.common.close}>
          ✕
        </button>
      </div>

      {/* Prev/Next arrows */}
      {hasPrev && (
        <button
          type="button"
          className="lightbox-nav lightbox-nav--prev"
          onClick={(e) => { e.stopPropagation(); navigateTo("prev"); }}
          aria-label="Previous image"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}
      {hasNext && (
        <button
          type="button"
          className="lightbox-nav lightbox-nav--next"
          onClick={(e) => { e.stopPropagation(); navigateTo("next"); }}
          aria-label="Next image"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </button>
      )}

      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        {!imgLoaded && <div className="lightbox-spinner" aria-label="Loading image" />}
        <img
          src={imgSrc}
          alt={item.name}
          className={`lightbox-image ${imgLoaded ? "lightbox-image--loaded" : "lightbox-image--loading"}`}
          onLoad={() => setImgLoaded(true)}
        />
        <p className="lightbox-caption">{item.name}</p>

        <div className="lightbox-social">
          <StarRating
            averageRating={avgRating}
            userRating={userRating}
            onRate={handleRate}
            canRate={!!token}
            labels={messages.social}
          />
          <CommentSection
            comments={comments}
            onPost={handlePostComment}
            onDelete={handleDeleteComment}
            canComment={!!token}
            currentUsername={username}
            isAdmin={isAdmin}
            labels={messages.social}
          />
        </div>
      </div>
    </div>
  );
}
