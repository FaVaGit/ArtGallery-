import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";

import { ApiError } from "../api/client";
import type { AppConfig } from "../config/appConfig";
import type { AppMessages } from "../i18n/messages";
import { getDriveStatus, listItems } from "../api/driveApi";
import { trackEvent } from "../api/analyticsApi";
import { GalleryGrid } from "../components/GalleryGrid";
import { Lightbox } from "../components/Lightbox";
import { FilterBar, type FilterState } from "../components/FilterBar";
import { SkeletonGrid } from "../components/SkeletonCard";
import { eventBus, useEvent } from "../events";
import type { DriveItem } from "../types";

const FabricCanvas = lazy(() => import("../components/FabricCanvas").then((m) => ({ default: m.FabricCanvas })));

type ViewMode = "grid" | "canvas";

interface PortfolioPageProps {
  config: AppConfig;
  messages: AppMessages;
  token: string | null;
}

function applyClientFilters(items: DriveItem[], filters: FilterState): DriveItem[] {
  let filtered = items;

  if (filters.type === "folders") {
    filtered = filtered.filter((i) => i.itemType === "folder");
  } else if (filters.type === "images") {
    filtered = filtered.filter((i) => i.itemType === "file");
  }

  filtered = [...filtered].sort((a, b) => {
    if (filters.sortBy === "name") {
      const cmp = a.name.localeCompare(b.name);
      return filters.sortOrder === "desc" ? -cmp : cmp;
    }
    const da = new Date(a.modifiedTime ?? "").getTime() || 0;
    const db = new Date(b.modifiedTime ?? "").getTime() || 0;
    return filters.sortOrder === "desc" ? db - da : da - db;
  });

  return filtered;
}

export function PortfolioPage({ config, messages, token }: PortfolioPageProps) {
  const [rawItems, setRawItems] = useState<DriveItem[]>([]);
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
  const [navDirection, setNavDirection] = useState<"enter" | "back" | null>(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ type: "all", sortBy: "name", sortOrder: "asc" });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const items = applyClientFilters(rawItems, filters);

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

      setRawItems(response.items);
      eventBus.emit("gallery:loaded", { items: response.items, folderId: nextFolderId });

      // Track search
      if (nextSearch) {
        trackEvent("search", undefined, { term: nextSearch });
      }

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

  /* ── Debounced search ──────────────────────── */
  function handleSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadData(folderId, value).catch(() => undefined);
    }, 300);
  }

  function clearSearch() {
    setSearch("");
    loadData(folderId, "").catch(() => undefined);
  }

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

  /* ── Deep-linking: parse ?item=<id> from hash ── */
  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/[?&]item=([^&]+)/);
    if (!match || rawItems.length === 0) return;

    const itemId = decodeURIComponent(match[1]);
    const found = rawItems.find((i) => i.id === itemId);
    if (found && found.itemType === "file") {
      setLightboxItem(found);
      // Clear the item param from the URL to avoid re-opening on navigation
      const cleanHash = hash.replace(/[?&]item=[^&]+/, "").replace(/\?$/, "");
      if (cleanHash !== hash) {
        window.location.hash = cleanHash || "#/";
      }
    }
  }, [rawItems]);

  /* ── Event-driven: navigate into folder ──────── */
  useEvent("gallery:navigate", ({ item }) => {
    if (item.itemType !== "folder") return;
    setNavDirection("enter");
    setTimeout(() => setNavDirection(null), 400);
    setHistory((prev) => (folderId ? [...prev, { id: folderId, name: currentFolderName }] : prev));
    setCurrentFolderName(item.name);
    setFolderId(item.id);
    trackEvent("folder_open", item.id);
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
    setNavDirection("back");
    setTimeout(() => setNavDirection(null), 400);
    setHistory((prev) => {
      const clone = [...prev];
      const previous = clone.pop();
      setFolderId(previous?.id ?? "");
      setCurrentFolderName(previous?.name ?? "");
      loadData(previous?.id ?? "", search).catch(() => undefined);
      return clone;
    });
  }

  const galleryTransitionClass = navDirection === "enter" ? "gallery-slide-enter" : navDirection === "back" ? "gallery-slide-back" : "";

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

      {/* ── Gallery Toolbar ─────────────────────── */}
      <div className="gallery-toolbar">
        <div className="toolbar-left">
          <div className="view-toggle">
            <button
              type="button"
              className={viewMode === "grid" ? "active" : ""}
              onClick={() => { setViewMode("grid"); eventBus.emit("canvas:viewMode", { mode: "grid" }); }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/></svg>
              Grid
            </button>
            <button
              type="button"
              className={viewMode === "canvas" ? "active" : ""}
              onClick={() => { setViewMode("canvas"); eventBus.emit("canvas:viewMode", { mode: "canvas" }); }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5zm10-1h6v2h-6V4zm0 4h4v2h-4V8zM4 14a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4zm10-1h6v2h-6v-2zm0 4h4v2h-4v-2z"/></svg>
              Canvas
            </button>
          </div>

          <FilterBar filters={filters} onChange={setFilters} labels={messages.filter} />

          <span className="toolbar-count">
            {items.length > 0 && messages.portfolio.itemCount.replace("{count}", String(items.length))}
          </span>
        </div>

        <div className="toolbar-right">
          {searchOpen ? (
            <div className="toolbar-search">
              <div className="search-input-wrapper">
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onBlur={() => { if (!search) setSearchOpen(false); }}
                  placeholder={messages.portfolio.searchPlaceholder}
                />
                {search && (
                  <button type="button" className="search-clear" onClick={clearSearch} aria-label="Clear search">✕</button>
                )}
              </div>
              <button type="button" className="search-go" onClick={() => loadData(folderId, search).catch(() => undefined)} disabled={loading}>
                {loading ? "…" : "↵"}
              </button>
            </div>
          ) : (
            <button type="button" className="toolbar-icon-btn" onClick={() => setSearchOpen(true)} title={messages.portfolio.searchPlaceholder}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Breadcrumb Path Bar ─────────────────── */}
      <nav className="path-bar" role="navigation" aria-label="Breadcrumb">
        {(history.length > 0 || currentFolderName) && (
          <button type="button" className="path-back" onClick={goBack} disabled={!history.length || loading} title={messages.portfolio.backFolder}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        <button type="button" className="path-segment path-home" onClick={() => {
          setHistory([]);
          setFolderId("");
          setCurrentFolderName("");
          setSearch("");
          loadData("", "").catch(() => undefined);
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>{messages.portfolio.home}</span>
        </button>

        {history.map((entry, i) => (
          <span key={entry.id} className="path-crumb">
            <svg className="path-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            <button type="button" className="path-segment" onClick={() => {
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
          <span className="path-crumb">
            <svg className="path-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            <span className="path-current">{currentFolderName}</span>
          </span>
        )}
      </nav>

      {error ? (
        <div className="error-banner" role="alert" aria-live="assertive">
          <span>{error}</span>
          <button type="button" className="ghost retry-btn" onClick={() => loadData(folderId, search).catch(() => undefined)}>
            {messages.common.refresh}
          </button>
        </div>
      ) : null}

      <div className={galleryTransitionClass}>
        {loading && rawItems.length === 0 ? (
          <SkeletonGrid count={8} />
        ) : viewMode === "canvas" ? (
          <Suspense fallback={<SkeletonGrid count={6} />}>
            <FabricCanvas items={items} selectedId={selectedId} labels={messages.common} folderPreviews={folderPreviews} />
          </Suspense>
        ) : (
          <GalleryGrid
            items={items}
            labels={messages.common}
            shareLabels={messages.share}
            selectedId={selectedId}
            folderPreviews={folderPreviews}
            onOpenFolder={openFolder}
            onSelectItem={(item) => eventBus.emit("gallery:select", { item })}
            onViewFile={(item) => setLightboxItem(item)}
          />
        )}
      </div>

      {lightboxItem && (
        <Lightbox
          item={lightboxItem}
          onClose={() => setLightboxItem(null)}
          messages={messages}
          token={token}
          items={items}
          onNavigate={(newItem) => setLightboxItem(newItem)}
        />
      )}
    </section>
  );
}
