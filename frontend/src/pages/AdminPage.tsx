import { useEffect, useState } from "react";

import { ApiError } from "../api/client";
import type { AppConfig } from "../config/appConfig";
import type { AppMessages } from "../i18n/messages";
import { copyItem, createFolder, deleteItem, listItems, moveItem, renameItem } from "../api/driveApi";
import { AdminActions } from "../components/AdminActions";
import { GalleryGrid } from "../components/GalleryGrid";
import { eventBus, useEvent } from "../events";
import type { AuthUser, DriveItem } from "../types";

interface AdminPageProps {
  token: string | null;
  user: AuthUser | null;
  messages: AppMessages;
  config: AppConfig;
}

export function AdminPage({ token, user, messages, config }: AdminPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [folderId, setFolderId] = useState("");
  const [search, setSearch] = useState("");
  const [configDraft, setConfigDraft] = useState<AppConfig>(config);
  const [items, setItems] = useState<DriveItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<DriveItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";

  useEffect(() => { setConfigDraft(config); }, [config]);

  /* ── Listen for auth events to clear error ── */
  useEvent("auth:loginFailed", ({ error: msg }) => setError(msg));
  useEvent("auth:loginSuccess", () => setError(null));

  /* ── Listen for drive action results ──────── */
  useEvent("drive:actionSuccess", ({ message }) => { setFeedback(message); loadData().catch(() => undefined); });
  useEvent("drive:actionFailed", ({ message }) => setError(message));

  async function loadData(nextFolderId = folderId, nextSearch = search) {
    setLoading(true);
    setError(null);
    try {
      const res = await listItems({
        folderId: nextFolderId || config.defaultFolderId || undefined,
        search: nextSearch || undefined,
        pageSize: 200,
      });
      setItems(res.items);
      setSelectedItem(null);
      eventBus.emit("gallery:loaded", { items: res.items, folderId: nextFolderId });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : messages.admin.loadDriveFailed);
    } finally { setLoading(false); }
  }

  async function perform(action: () => Promise<unknown>, successMessage: string) {
    if (!token) { setError(messages.admin.pleaseLogin); return; }
    try {
      setError(null); setFeedback(null);
      await action();
      setFeedback(successMessage);
      eventBus.emit("drive:actionSuccess", { message: successMessage });
      eventBus.emit("notify:success", { message: successMessage });
      await loadData();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : messages.admin.actionFailed;
      setError(msg);
      eventBus.emit("drive:actionFailed", { message: msg });
      eventBus.emit("notify:error", { message: msg });
    }
  }

  function saveConfiguration() {
    const normalized: AppConfig = {
      brandName: configDraft.brandName.trim() || config.brandName,
      apiBaseUrl: configDraft.apiBaseUrl.trim(),
      defaultFolderId: configDraft.defaultFolderId.trim(),
      visibilityMode: configDraft.visibilityMode,
    };
    eventBus.emit("config:changed", { config: normalized });
    setConfigDraft(normalized);
  }

  /* ── Login form ─────────────────────────────── */
  if (!token || !user) {
    return (
      <section className="page">
        <header className="hero-panel">
          <div>
            <p className="eyebrow">{messages.admin.accessEyebrow}</p>
            <h1>{messages.admin.accessTitle}</h1>
            <p className="subtitle">{messages.admin.accessSubtitle}</p>
          </div>
        </header>

        <form
          className="login-panel"
          onSubmit={(e) => {
            e.preventDefault();
            eventBus.emit("auth:login", { username, password });
          }}
        >
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={messages.admin.username}
            autoComplete="username"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={messages.admin.password}
            autoComplete="current-password"
          />
          <button type="submit">{messages.admin.login}</button>
        </form>
        {error ? <p className="error-banner">{error}</p> : null}
      </section>
    );
  }

  /* ── Admin workspace ────────────────────────── */
  return (
    <section className="page">
      <header className="hero-panel">
        <div>
          <p className="eyebrow">{messages.admin.workspaceEyebrow}</p>
          <h1>{messages.admin.workspaceTitle}</h1>
          <p className="subtitle">{messages.admin.workspaceSubtitle}</p>
        </div>
        <span className={`status-pill ${isAdmin ? "ok" : "error"}`}>
          {messages.admin.role}: {user.role}
        </span>
      </header>

      {/* Runtime configuration section */}
      <section className="admin-actions config-panel">
        <h2>{messages.admin.configTitle}</h2>
        <div className="inline-fields">
          <input
            value={configDraft.brandName}
            onChange={(e) => setConfigDraft((prev) => ({ ...prev, brandName: e.target.value }))}
            placeholder={messages.admin.brandName}
          />
          <input
            value={configDraft.apiBaseUrl}
            onChange={(e) => setConfigDraft((prev) => ({ ...prev, apiBaseUrl: e.target.value }))}
            placeholder={messages.admin.apiBaseUrl}
          />
          <input
            value={configDraft.defaultFolderId}
            onChange={(e) => setConfigDraft((prev) => ({ ...prev, defaultFolderId: e.target.value }))}
            placeholder={messages.admin.defaultFolderId}
          />
          <select
            value={configDraft.visibilityMode}
            onChange={(e) =>
              setConfigDraft((prev) => ({
                ...prev,
                visibilityMode: e.target.value === "private" ? "private" : "public",
              }))
            }
          >
            <option value="public">{messages.admin.visibilityMode}: {messages.admin.publicMode}</option>
            <option value="private">{messages.admin.visibilityMode}: {messages.admin.privateMode}</option>
          </select>
        </div>
        <button type="button" onClick={saveConfiguration}>{messages.admin.saveConfig}</button>
      </section>

      {/* Content browser */}
      <section className="filters-panel">
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
          <button type="button" onClick={() => loadData()} disabled={loading}>
            {loading ? messages.common.loading : messages.admin.loadItems}
          </button>
        </div>
      </section>

      {feedback ? <p className="success-banner">{feedback}</p> : null}
      {error ? <p className="error-banner">{error}</p> : null}

      <GalleryGrid
        items={items}
        labels={messages.common}
        selectedId={selectedItem?.id}
        onOpenFolder={(item) => {
          if (item.itemType !== "folder") return;
          setFolderId(item.id);
          loadData(item.id, search).catch(() => undefined);
        }}
        onSelectItem={setSelectedItem}
      />

      {isAdmin ? (
        <AdminActions
          labels={messages.actions}
          selectedItem={selectedItem}
          onCreateFolder={(name, parentId) =>
            perform(() => createFolder(token, name, parentId), messages.actions.folderCreated.replace("{name}", name))
          }
          onRename={(itemId, name) => perform(() => renameItem(token, itemId, name), messages.actions.itemRenamed)}
          onMove={(itemId, targetParentId) =>
            perform(() => moveItem(token, itemId, targetParentId), messages.actions.itemMoved)
          }
          onCopy={(itemId, targetParentId, name) =>
            perform(() => copyItem(token, itemId, targetParentId, name), messages.actions.itemCopied)
          }
          onDelete={(itemId) => perform(() => deleteItem(token, itemId), messages.actions.itemDeleted)}
        />
      ) : (
        <p className="error-banner">{messages.admin.viewerReadOnly}</p>
      )}
    </section>
  );
}
