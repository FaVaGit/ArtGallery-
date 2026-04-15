import { useState } from "react";

import { ApiError } from "../api/client";
import {
  copyItem,
  createFolder,
  deleteItem,
  listItems,
  moveItem,
  renameItem,
} from "../api/driveApi";
import { AdminActions } from "../components/AdminActions";
import { GalleryGrid } from "../components/GalleryGrid";
import type { AuthUser, DriveItem } from "../types";

interface AdminPageProps {
  token: string | null;
  user: AuthUser | null;
  onLogin: (username: string, password: string) => Promise<void>;
}

export function AdminPage({ token, user, onLogin }: AdminPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [folderId, setFolderId] = useState("");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<DriveItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<DriveItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";

  async function loadData(nextFolderId = folderId, nextSearch = search) {
    setLoading(true);
    setError(null);

    try {
      const response = await listItems({
        folderId: nextFolderId || undefined,
        search: nextSearch || undefined,
        pageSize: 200,
      });

      setItems(response.items);
      setSelectedItem(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load Drive items");
    } finally {
      setLoading(false);
    }
  }

  async function perform(action: () => Promise<unknown>, successMessage: string) {
    if (!token) {
      setError("Please login first");
      return;
    }

    try {
      setError(null);
      setFeedback(null);
      await action();
      setFeedback(successMessage);
      await loadData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed");
    }
  }

  if (!token || !user) {
    return (
      <section className="page">
        <header className="hero-panel">
          <div>
            <p className="eyebrow">Administrator Access</p>
            <h1>Manage Portfolio Content</h1>
            <p className="subtitle">Login as admin or viewer. Only admin can modify Google Drive content.</p>
          </div>
        </header>

        <form
          className="login-panel"
          onSubmit={(event) => {
            event.preventDefault();
            onLogin(username, password).catch((err: unknown) => {
              const message = err instanceof ApiError ? err.message : "Login failed";
              setError(message);
            });
          }}
        >
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Username"
            autoComplete="username"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            autoComplete="current-password"
          />
          <button type="submit">Login</button>
        </form>
        {error ? <p className="error-banner">{error}</p> : null}
      </section>
    );
  }

  return (
    <section className="page">
      <header className="hero-panel">
        <div>
          <p className="eyebrow">Admin Workspace</p>
          <h1>Drive Content Management</h1>
          <p className="subtitle">Folder operations are protected by role-based authorization.</p>
        </div>
        <span className={`status-pill ${isAdmin ? "ok" : "error"}`}>Role: {user.role}</span>
      </header>

      <section className="filters-panel">
        <div className="inline-fields">
          <input
            value={folderId}
            onChange={(event) => setFolderId(event.target.value)}
            placeholder="Folder ID (optional)"
          />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name" />
          <button type="button" onClick={() => loadData()} disabled={loading}>
            {loading ? "Loading..." : "Load Items"}
          </button>
        </div>
      </section>

      {feedback ? <p className="success-banner">{feedback}</p> : null}
      {error ? <p className="error-banner">{error}</p> : null}

      <GalleryGrid
        items={items}
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
          selectedItem={selectedItem}
          onCreateFolder={(name, parentId) =>
            perform(() => createFolder(token, name, parentId), `Folder "${name}" created.`)
          }
          onRename={(itemId, name) => perform(() => renameItem(token, itemId, name), "Item renamed.")}
          onMove={(itemId, targetParentId) =>
            perform(() => moveItem(token, itemId, targetParentId), "Item moved.")
          }
          onCopy={(itemId, targetParentId, name) =>
            perform(() => copyItem(token, itemId, targetParentId, name), "Item copied.")
          }
          onDelete={(itemId) => perform(() => deleteItem(token, itemId), "Item deleted.")}
        />
      ) : (
        <p className="error-banner">Viewer role is read-only. Login with admin role for write actions.</p>
      )}
    </section>
  );
}
