import { useCallback, useEffect, useMemo, useState } from "react";

import { ApiError } from "../api/client";
import type { AppConfig } from "../config/appConfig";
import type { AppMessages } from "../i18n/messages";
import { getDriveStatus, listItems } from "../api/driveApi";
import { GalleryGrid } from "../components/GalleryGrid";
import { FabricCanvas } from "../components/FabricCanvas";
import { Lightbox } from "../components/Lightbox";
import { eventBus, useEvent } from "../events";
import type { DriveItem } from "../types";

type ViewMode = "grid" | "canvas";

interface PortfolioPageProps {
  config: AppConfig;
  messages: AppMessages;
  token: string | null;
}

export function PortfolioPage({ config, messages }: PortfolioPageProps) {
  const [items, setItems] = useState<DriveItem[]>([]);
  const [folderId, setFolderId] = useState("");
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState<{ id: string; name: string }[]>([]);
  const [status, setStatus] = useState<"checking" | "ok" | "error">("checking");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [lightboxItem, setLightboxItem] = useState<DriveItem | null>(null);
  const [folderPreviews, setFolderPreviews] = useState<Record<string, DriveItem[]>>({});
  const [currentFolderName, setCurrentFolderName] = useState("");

  const activeFolderLabel = useMemo(
    () => (folderId || config.defaultFolderId ? folderId || config.defaultFolderId : messages.portfolio.rootConfigured),
    [folderId, config.defaultFolderId, messages.portfolio.rootConfigured],
  );

  const loadData = useCallback(async (nextFolderId?: string, nextSearch?: string) => {
    setLoading(true);
    setError(null);
    setFolderPreviews({});
    eventBus.emit("drive:status", { status: "checking" });

    try {
      const response = await listItems({
        folderId: nextFolderId || config.defaultFolderId || undefined,
        search: nextSearch || undefined,
        pageSize: 200,
      });

      setItems(response.items);
      eventBus.emit("gallery:loaded", { items: response.items, folderId: nextFolderId });

      // Load folder previews in the background
      const folders = response.items.filter((i) => i.itemType === "folder");
      for (const folder of folders) {
        listItems({ folderId: folder.id, pageSize: 4 })
          .then((res) => {
            const imageItems = res.items.filter((i) => i.itemType === "file" && i.thumbnailLink);
            if (imageItems.length > 0) {
              setFolderPreviews((prev) => ({ ...prev, [folder.id]: imageItems }));
            }
          })
          .catch(() => { /* ignore preview errors */ });
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : messages.portfolio.unableToLoad;
      setError(message);
      eventBus.emit("gallery:error", { message });
    } finally {
      setLoading(false);
    }
  }, [config.defaultFolderId, messages.portfolio.unableToLoad]);

  /* ── Bootstrap: check drive status + load data ── */
  useEffect(() => {
    const run = async () => {
      try {
        await getDriveStatus();
        setStatus("ok");
        eventBus.emit("drive:status", { status: "ok" });
      } catch {
        setStatus("error");
        eventBus.emit("drive:status", { status: "error" });
      }
    };
    run().catch(() => setStatus("error"));
    loadData().catch(() => undefined);
  }, [loadData]);

  /* ── Event-driven: navigate into folder ──────── */
  useEvent("gallery:navigate", ({ item }) => {
    if (item.itemType !== "folder") return;
    setHistory((prev) => (folderId ? [...prev, { id: folderId, name: currentFolderName }] : prev));
    setCurrentFolderName(item.name);
    setFolderId(item.id);
    loadData(item.id, search).catch(() => undefined);
  });

  /* ── Event-driven: select item ───────────────── */
  useEvent("gallery:select", ({ item }) => {
    setSelectedId(item?.id);
  });

  /* ── Event-driven: view file (lightbox from canvas) ── */
  useEvent("gallery:viewFile", ({ item }) => {
    if (item.itemType === "file") setLightboxItem(item);
  });

  /* ── Event-driven: view mode switch ──────────── */
  useEvent("canvas:viewMode", ({ mode }) => setViewMode(mode));

  function openFolder(item: DriveItem) {
    eventBus.emit("gallery:navigate", { item });
  }

  function goBack() {
    eventBus.emit("gallery:back");
    setHistory((prev) => {
      const clone = [...prev];
      const previous = clone.pop();
      setFolderId(previous?.id ?? "");
      setCurrentFolderName(previous?.name ?? "");
      loadData(previous?.id ?? "", search).catch(() => undefined);
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-s)" }}>
          <div className="view-toggle">
            <button
              type="button"
              className={viewMode === "grid" ? "active" : ""}
              onClick={() => { setViewMode("grid"); eventBus.emit("canvas:viewMode", { mode: "grid" }); }}
            >
              Grid
            </button>
            <button
              type="button"
              className={viewMode === "canvas" ? "active" : ""}
              onClick={() => { setViewMode("canvas"); eventBus.emit("canvas:viewMode", { mode: "canvas" }); }}
            >
              Canvas
            </button>
          </div>
        </div>

        {/* Breadcrumb navigation */}
        {(history.length > 0 || currentFolderName) && (
          <nav className="breadcrumb-nav">
            <button type="button" className="breadcrumb-back" onClick={goBack} disabled={!history.length || loading}>
              ← {messages.portfolio.backFolder}
            </button>
            <span className="breadcrumb-separator">/</span>
            <button type="button" className="breadcrumb-item" onClick={() => {
              setHistory([]);
              setFolderId("");
              setCurrentFolderName("");
              loadData("", search).catch(() => undefined);
            }}>
              Root
            </button>
            {history.map((entry, i) => (
              <span key={entry.id}>
                <span className="breadcrumb-separator">/</span>
                <button type="button" className="breadcrumb-item" onClick={() => {
                  const newHistory = history.slice(0, i);
                  setHistory(newHistory);
                  setFolderId(entry.id);
                  setCurrentFolderName(entry.name);
                  loadData(entry.id, search).catch(() => undefined);
                }}>
                  {entry.name}
                </button>
              </span>
            ))}
            {currentFolderName && (
              <>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-current">{currentFolderName}</span>
              </>
            )}
          </nav>
        )}

        <div className="inline-fields">
          <input
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
            placeholder={messages.common.folderIdOptional}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={messages.common.searchByName}
          />
          <button type="button" onClick={() => { eventBus.emit("gallery:load", { folderId, search }); loadData(folderId, search); }} disabled={loading}>
            {loading ? messages.common.loading : messages.common.refresh}
          </button>
        </div>
        <p className="path-label">{messages.portfolio.currentFolder}: {activeFolderLabel}</p>
      </section>

      {error ? <p className="error-banner">{error}</p> : null}

      {viewMode === "canvas" ? (
        <FabricCanvas items={items} selectedId={selectedId} labels={messages.common} folderPreviews={folderPreviews} />
      ) : (
        <GalleryGrid
          items={items}
          labels={messages.common}
          selectedId={selectedId}
          folderPreviews={folderPreviews}
          onOpenFolder={openFolder}
          onSelectItem={(item) => eventBus.emit("gallery:select", { item })}
          onViewFile={(item) => setLightboxItem(item)}
        />
      )}

      {lightboxItem && (
        <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} closeLabel={messages.common.view} />
      )}
    </section>
  );
}
