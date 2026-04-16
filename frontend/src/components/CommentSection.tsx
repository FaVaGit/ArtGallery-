import { useState } from "react";

export interface Comment {
  id: number;
  username: string;
  text: string;
  created_at: string;
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
                  <strong>{c.username}</strong> · {new Date(c.created_at).toLocaleDateString()}
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
