import { useRef, useState } from "react";

import { ApiError } from "../api/client";
import type { AppConfig } from "../config/appConfig";
import type { AppMessages } from "../i18n/messages";
import { copyItem, createFolder, deleteItem, listItems, moveItem, renameItem } from "../api/driveApi";
import { uploadFile } from "../api/socialApi";
import { AdminActions } from "../components/AdminActions";
import { GalleryGrid } from "../components/GalleryGrid";
import { FileUpload } from "../components/FileUpload";
import { AnalyticsDashboard } from "../components/AnalyticsDashboard";
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

  // Sync config prop to local state during render (avoids setState in effect)
  const prevConfigRef = useRef(config);
  if (config !== prevConfigRef.current) {
    prevConfigRef.current = config;
    setConfigDraft(config);
  }

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

  async function handleUpload(file: File) {
    if (!token) throw new Error(messages.admin.pleaseLogin);
    eventBus.emit("drive:uploadStart", { fileName: file.name });
    try {
      await uploadFile(token, file, folderId || config.defaultFolderId || undefined);
      eventBus.emit("drive:uploadComplete", { fileName: file.name });
      eventBus.emit("notify:success", { message: `${messages.upload.uploadComplete} — ${file.name}` });
      await loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : messages.upload.uploadFailed;
      eventBus.emit("drive:uploadFailed", { fileName: file.name, error: msg });
      throw err;
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

      {feedback ? <p className="success-banner" role="status" aria-live="polite">{feedback}</p> : null}
      {error ? (
        <div className="error-banner" role="alert" aria-live="assertive">
          <span>{error}</span>
          <button type="button" className="ghost retry-btn" onClick={() => loadData()}>
            {messages.common.refresh}
          </button>
        </div>
      ) : null}

      {/* ── 1. Configuration (collapsible) ── */}
      <details className="collapsible-section">
        <summary className="collapsible-header">
          <h2>{messages.admin.configTitle}</h2>
          <span className="help-text">{messages.admin.configHelp}</span>
        </summary>
        <div className="collapsible-body">
          <div className="labeled-fields">
            <label className="field-group">
              <span className="field-label">{messages.admin.brandName}</span>
              <input
                value={configDraft.brandName}
                onChange={(e) => setConfigDraft((prev) => ({ ...prev, brandName: e.target.value }))}
                placeholder="Facciate Gallery"
              />
            </label>
            <label className="field-group">
              <span className="field-label">{messages.admin.apiBaseUrl}</span>
              <input
                value={configDraft.apiBaseUrl}
                onChange={(e) => setConfigDraft((prev) => ({ ...prev, apiBaseUrl: e.target.value }))}
                placeholder={messages.admin.apiBaseUrlHint}
              />
            </label>
            <label className="field-group">
              <span className="field-label">{messages.admin.defaultFolderId}</span>
              <input
                value={configDraft.defaultFolderId}
                onChange={(e) => setConfigDraft((prev) => ({ ...prev, defaultFolderId: e.target.value }))}
                placeholder={messages.admin.defaultFolderIdHint}
              />
            </label>
            <label className="field-group">
              <span className="field-label">{messages.admin.visibilityMode}</span>
              <select
                value={configDraft.visibilityMode}
                onChange={(e) =>
                  setConfigDraft((prev) => ({
                    ...prev,
                    visibilityMode: e.target.value === "private" ? "private" : "public",
                  }))
                }
              >
                <option value="public">{messages.admin.publicMode}</option>
                <option value="private">{messages.admin.privateMode}</option>
              </select>
            </label>
          </div>
          <button type="button" onClick={saveConfiguration}>{messages.admin.saveConfig}</button>
        </div>
      </details>

      {/* ── 2. Content browser (collapsible, open by default) ── */}
      <details className="collapsible-section" open>
        <summary className="collapsible-header">
          <h2>{messages.admin.loadItems}</h2>
          <span className="help-text">{messages.admin.browseHelp}</span>
        </summary>
        <div className="collapsible-body">
          <div className="labeled-fields two-col">
            <label className="field-group">
              <span className="field-label">{messages.common.folderIdOptional}</span>
              <input
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                placeholder="1aBcDeFgHiJkLmN..."
              />
            </label>
            <label className="field-group">
              <span className="field-label">{messages.common.searchByName}</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={messages.common.searchByName}
              />
            </label>
          </div>
          <button type="button" onClick={() => loadData()} disabled={loading}>
            {loading ? messages.common.loading : messages.admin.loadItems}
          </button>
        </div>
      </details>

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

      {/* ── 3. Admin actions (collapsible) ── */}
      {isAdmin ? (
        <>
          <details className="collapsible-section">
            <summary className="collapsible-header">
              <h2>{messages.actions.title}</h2>
              <span className="help-text">{messages.admin.adminActionsHelp}</span>
            </summary>
            <div className="collapsible-body">
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
            </div>
          </details>

          {/* ── 4. File Upload (collapsible) ── */}
          <details className="collapsible-section">
            <summary className="collapsible-header">
              <h2>{messages.upload.title}</h2>
            </summary>
            <div className="collapsible-body">
              <FileUpload onUpload={handleUpload} labels={messages.upload} />
            </div>
          </details>

          {/* ── 5. Analytics Dashboard (collapsible) ── */}
          <details className="collapsible-section">
            <summary className="collapsible-header">
              <h2>{messages.analytics.title}</h2>
            </summary>
            <div className="collapsible-body">
              <AnalyticsDashboard token={token} labels={messages.analytics} />
            </div>
          </details>
        </>
      ) : (
        <p className="error-banner">{messages.admin.viewerReadOnly}</p>
      )}
    </section>
  );
}
