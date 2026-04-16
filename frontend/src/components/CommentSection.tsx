import { useState } from "react";

export interface Comment {
  id: number;
  username: string;
  text: string;
  created_at: string;
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  if (Number.isNaN(then)) return dateStr;

  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface CommentSectionProps {
  comments: Comment[];
  onPost: (text: string) => void;
  onDelete?: (commentId: number) => void;
  canComment: boolean;
  currentUsername?: string;
  isAdmin?: boolean;
  labels: {
    comments: string;
    addComment: string;
    commentPlaceholder: string;
    post: string;
    noComments: string;
    deleteComment: string;
    loginToComment: string;
  };
}

export function CommentSection({ comments, onPost, onDelete, canComment, currentUsername, isAdmin, labels }: CommentSectionProps) {
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onPost(trimmed);
    setText("");
  }

  return (
    <div className="comment-section">
      <h4>{labels.comments} ({comments.length})</h4>

      {comments.length === 0 ? (
        <p className="comment-no-auth">{labels.noComments}</p>
      ) : (
        <div className="comment-list">
          {comments.map((c) => (
            <div key={c.id} className="comment-item">
              <div className="comment-item-body">
                <div className="comment-item-meta">
                  <strong>{c.username}</strong> · <time dateTime={c.created_at}>{relativeTime(c.created_at)}</time>
                </div>
                <p className="comment-item-text">{c.text}</p>
              </div>
              {(isAdmin || currentUsername === c.username) && onDelete && (
                <button type="button" className="ghost danger-text" onClick={() => onDelete(c.id)}>
                  {labels.deleteComment}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {canComment ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={labels.commentPlaceholder}
            maxLength={500}
          />
          <button type="submit" disabled={!text.trim()}>
            {labels.post}
          </button>
        </form>
      ) : (
        <p className="comment-no-auth">{labels.loginToComment}</p>
      )}
    </div>
  );
}
