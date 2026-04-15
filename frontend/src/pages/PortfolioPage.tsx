import { useEffect, useMemo, useState } from "react";

import { ApiError } from "../api/client";
import { getDriveStatus, listItems } from "../api/driveApi";
import { GalleryGrid } from "../components/GalleryGrid";
import type { DriveItem } from "../types";

export function PortfolioPage() {
  const [items, setItems] = useState<DriveItem[]>([]);
  const [folderId, setFolderId] = useState("");
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [status, setStatus] = useState<"checking" | "ok" | "error">("checking");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const activeFolderLabel = useMemo(() => (folderId ? folderId : "Root configured on backend"), [folderId]);

  async function loadData(nextFolderId?: string, nextSearch?: string) {
    setLoading(true);
    setError(null);

    try {
      const response = await listItems({
        folderId: nextFolderId || undefined,
        search: nextSearch || undefined,
        pageSize: 200,
      });

      setItems(response.items);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Unable to load gallery";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const run = async () => {
      try {
        await getDriveStatus();
        setStatus("ok");
      } catch {
        setStatus("error");
      }
    };

    run().catch(() => setStatus("error"));
    loadData().catch(() => undefined);
  }, []);

  function openFolder(item: DriveItem) {
    if (item.itemType !== "folder") {
      return;
    }

    setHistory((prev) => (folderId ? [...prev, folderId] : prev));
    setFolderId(item.id);
    loadData(item.id, search).catch(() => undefined);
  }

  function goBack() {
    setHistory((prev) => {
      const clone = [...prev];
      const previousFolder = clone.pop() ?? "";
      setFolderId(previousFolder);
      loadData(previousFolder, search).catch(() => undefined);
      return clone;
    });
  }

  return (
    <section className="page">
      <header className="hero-panel">
        <div>
          <p className="eyebrow">Customer Showcase</p>
          <h1>Decorative Facades and Roofing Portfolio</h1>
          <p className="subtitle">
            Explore completed exterior projects with image quality optimized for mobile, tablet, and desktop.
          </p>
        </div>
        <div className={`status-pill ${status}`}>
          Drive connection: {status === "checking" ? "Checking" : status === "ok" ? "Online" : "Error"}
        </div>
      </header>

      <section className="filters-panel">
        <div className="inline-fields">
          <input
            value={folderId}
            onChange={(event) => setFolderId(event.target.value)}
            placeholder="Folder ID (optional)"
          />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name" />
          <button type="button" onClick={() => loadData(folderId, search)} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
          <button type="button" onClick={goBack} disabled={!history.length || loading} className="ghost">
            Back Folder
          </button>
        </div>
        <p className="path-label">Current folder: {activeFolderLabel}</p>
      </section>

      {error ? <p className="error-banner">{error}</p> : null}
      <GalleryGrid items={items} onOpenFolder={openFolder} />
    </section>
  );
}
