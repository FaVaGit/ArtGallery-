import { useEffect, useState } from "react";
import { getFolderReadme } from "../api/driveApi";

interface FolderDescriptionProps {
  folderId: string;
}

/**
 * Loads and displays the README.md content of a folder from Google Drive.
 * Renders as plain text with paragraph breaks.
 */
export function FolderDescription({ folderId }: FolderDescriptionProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (!cancelled) {
        setLoading(true);
        setContent(null);
      }
    });

    getFolderReadme(folderId)
      .then((text) => { if (!cancelled) setContent(text); })
      .catch(() => { /* ignore */ })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [folderId]);

  if (loading || !content) return null;

  return (
    <div className="folder-description" role="region" aria-label="Folder description">
      {content.split("\n\n").map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </div>
  );
}
