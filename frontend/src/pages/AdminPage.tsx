import { useEffect, useState } from "react";

import { ApiError } from "../api/client";
import type { AppConfig } from "../config/appConfig";
import type { AppMessages } from "../i18n/messages";
import { copyItem, createFolder, deleteItem, listItems, moveItem, renameItem } from "../api/driveApi";
import { AdminActions } from "../components/AdminActions";
import { GalleryGrid } from "../components/GalleryGrid";
import type { AuthUser, DriveItem } from "../types";

interface AdminPageProps {
  token: string | null;
  user: AuthUser | null;
  messages: AppMessages;
  config: AppConfig;
  onConfigChange: (config: AppConfig) => void;
  onLogin: (username: string, password: string) => Promise<void>;
}

export function AdminPage({ token, user, messages, config, onConfigChange, onLogin }: AdminPageProps) {
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

  useEffect(() => {
    setConfigDraft(config);
  }, [config]);

  async function loadData(nextFolderId = folderId, nextSearch = search) {
    setLoading(true);
    setError(null);

    try {
      const response = await listItems({
        folderId: nextFolderId || config.defaultFolderId || undefined,
        search: nextSearch || undefined,
        pageSize: 200,
      });

      setItems(response.items);
      setSelectedItem(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : messages.admin.loadDriveFailed);
    } finally {
      setLoading(false);
    }
  }

  async function perform(action: () => Promise<unknown>, successMessage: string) {
    if (!token) {
      setError(messages.admin.pleaseLogin);
      return;
    }

    try {
      setError(null);
      setFeedback(null);
      await action();
      setFeedback(successMessage);
      await loadData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : messages.admin.actionFailed);
    }
  }

  function saveConfiguration() {
    const normalized: AppConfig = {
      brandName: configDraft.brandName.trim() || config.brandName,
      apiBaseUrl: configDraft.apiBaseUrl.trim(),
      defaultFolderId: configDraft.defaultFolderId.trim(),
      visibilityMode: configDraft.visibilityMode,
    };

    onConfigChange(normalized);
    setConfigDraft(normalized);
    setFeedback(messages.admin.configSaved);
  }

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
          onSubmit={(event) => {
            event.preventDefault();
            onLogin(username, password).catch((err: unknown) => {
              const message = err instanceof ApiError ? err.message : messages.admin.loginFailed;
              setError(message);
            });
          }}
        >
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder={messages.admin.username}
            autoComplete="username"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={messages.admin.password}
            autoComplete="current-password"
          />
          <button type="submit">{messages.admin.login}</button>
        </form>
        {error ? <p className="error-banner">{error}</p> : null}
      </section>
    );
  }

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

      <section className="admin-actions">
        <h2>{messages.admin.configTitle}</h2>
        <div className="inline-fields">
          <input
            value={configDraft.brandName}
            onChange={(event) => setConfigDraft((prev) => ({ ...prev, brandName: event.target.value }))}
            placeholder={messages.admin.brandName}
          />
          <input
            value={configDraft.apiBaseUrl}
            onChange={(event) => setConfigDraft((prev) => ({ ...prev, apiBaseUrl: event.target.value }))}
            placeholder={messages.admin.apiBaseUrl}
          />
          <input
            value={configDraft.defaultFolderId}
            onChange={(event) => setConfigDraft((prev) => ({ ...prev, defaultFolderId: event.target.value }))}
            placeholder={messages.admin.defaultFolderId}
          />
          <select
            value={configDraft.visibilityMode}
            onChange={(event) =>
              setConfigDraft((prev) => ({
                ...prev,
                visibilityMode: event.target.value === "private" ? "private" : "public",
              }))
            }
          >
            <option value="public">
              {messages.admin.visibilityMode}: {messages.admin.publicMode}
            </option>
            <option value="private">
              {messages.admin.visibilityMode}: {messages.admin.privateMode}
            </option>
          </select>
        </div>
        <button type="button" onClick={saveConfiguration}>
          {messages.admin.saveConfig}
        </button>
      </section>

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
          if (item.itemType !== "folder") {
            return;
          }

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
