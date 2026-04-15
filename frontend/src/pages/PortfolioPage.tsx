import { useCallback, useEffect, useMemo, useState } from "react";

import { ApiError } from "../api/client";
import type { AppConfig } from "../config/appConfig";
import type { AppMessages } from "../i18n/messages";
import { getDriveStatus, listItems } from "../api/driveApi";
import { GalleryGrid } from "../components/GalleryGrid";
import type { DriveItem } from "../types";

interface PortfolioPageProps {
  config: AppConfig;
  messages: AppMessages;
}

export function PortfolioPage({ config, messages }: PortfolioPageProps) {
  const [items, setItems] = useState<DriveItem[]>([]);
  const [folderId, setFolderId] = useState("");
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [status, setStatus] = useState<"checking" | "ok" | "error">("checking");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const activeFolderLabel = useMemo(
    () => (folderId || config.defaultFolderId ? folderId || config.defaultFolderId : messages.portfolio.rootConfigured),
    [folderId, config.defaultFolderId, messages.portfolio.rootConfigured],
  );

  const loadData = useCallback(async (nextFolderId?: string, nextSearch?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await listItems({
        folderId: nextFolderId || config.defaultFolderId || undefined,
        search: nextSearch || undefined,
        pageSize: 200,
      });

      setItems(response.items);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : messages.portfolio.unableToLoad;
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [config.defaultFolderId, messages.portfolio.unableToLoad]);

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
  }, [loadData]);

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
          <p className="eyebrow">{messages.portfolio.eyebrow}</p>
          <h1>{messages.portfolio.title}</h1>
          <p className="subtitle">{messages.portfolio.subtitle}</p>
        </div>
        <div className={`status-pill ${status}`}>
          {messages.portfolio.driveConnection}: {status === "checking" ? messages.portfolio.checking : status === "ok" ? messages.portfolio.online : messages.portfolio.error}
        </div>
      </header>

      <section className="filters-panel">
        <div className="inline-fields">
          <input
            value={folderId}
            onChange={(event) => setFolderId(event.target.value)}
            placeholder={messages.common.folderIdOptional}
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={messages.common.searchByName}
          />
          <button type="button" onClick={() => loadData(folderId, search)} disabled={loading}>
            {loading ? messages.common.loading : messages.common.refresh}
          </button>
          <button type="button" onClick={goBack} disabled={!history.length || loading} className="ghost">
            {messages.portfolio.backFolder}
          </button>
        </div>
        <p className="path-label">{messages.portfolio.currentFolder}: {activeFolderLabel}</p>
      </section>

      {error ? <p className="error-banner">{error}</p> : null}
      <GalleryGrid
        items={items}
        labels={messages.common}
        onOpenFolder={openFolder}
      />
    </section>
  );
}
