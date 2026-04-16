import { useCallback, useEffect, useState } from "react";
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
}

export function Lightbox({ item, onClose, messages, token, username, isAdmin }: LightboxProps) {
  const imgSrc = `${getApiBaseUrl()}/drive/thumbnail/${encodeURIComponent(item.id)}?size=1600`;
  const [closing, setClosing] = useState(false);

  // Social state
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [userRating, setUserRating] = useState<number | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onClose],
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
    <div className={`lightbox-overlay ${closing ? "lightbox-closing" : ""}`} onClick={handleClose} role="dialog" aria-label={item.name}>
      <div className="lightbox-header-actions">
        <ShareButton item={item} labels={messages.share} />
        <button type="button" className="lightbox-close" onClick={handleClose} aria-label={messages.common.close}>
          ✕
        </button>
      </div>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <img src={imgSrc} alt={item.name} className="lightbox-image" />
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
