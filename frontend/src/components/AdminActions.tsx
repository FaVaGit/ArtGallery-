import { useMemo, useState } from "react";

import type { DriveItem } from "../types";

interface AdminActionsProps {
  selectedItem: DriveItem | null;
  onCreateFolder: (name: string, parentId?: string) => Promise<void>;
  onRename: (itemId: string, name: string) => Promise<void>;
  onMove: (itemId: string, targetParentId: string) => Promise<void>;
  onCopy: (itemId: string, targetParentId: string, name?: string) => Promise<void>;
  onDelete: (itemId: string) => Promise<void>;
}

export function AdminActions({
  selectedItem,
  onCreateFolder,
  onRename,
  onMove,
  onCopy,
  onDelete,
}: AdminActionsProps) {
  const [createName, setCreateName] = useState("");
  const [createParentId, setCreateParentId] = useState("");
  const [renameName, setRenameName] = useState("");
  const [targetParentId, setTargetParentId] = useState("");
  const [copyName, setCopyName] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const selectedLabel = useMemo(() => {
    if (!selectedItem) {
      return "No item selected";
    }

    return `${selectedItem.name} (${selectedItem.itemType})`;
  }, [selectedItem]);

  async function run(key: string, action: () => Promise<void>) {
    setBusy(key);

    try {
      await action();
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="admin-actions">
      <h2>Admin Controls</h2>
      <p className="selected-row">Selected: {selectedLabel}</p>

      <div className="admin-block">
        <h3>Create Folder</h3>
        <div className="inline-fields">
          <input
            value={createName}
            onChange={(event) => setCreateName(event.target.value)}
            placeholder="Folder name"
          />
          <input
            value={createParentId}
            onChange={(event) => setCreateParentId(event.target.value)}
            placeholder="Parent folder ID (optional)"
          />
          <button
            type="button"
            onClick={() => run("create", () => onCreateFolder(createName, createParentId || undefined))}
            disabled={!createName || busy !== null}
          >
            {busy === "create" ? "Saving..." : "Create"}
          </button>
        </div>
      </div>

      <div className="admin-block">
        <h3>Selected Item Actions</h3>
        <div className="inline-fields">
          <input
            value={renameName}
            onChange={(event) => setRenameName(event.target.value)}
            placeholder="New name"
          />
          <button
            type="button"
            disabled={!selectedItem || !renameName || busy !== null}
            onClick={() => selectedItem && run("rename", () => onRename(selectedItem.id, renameName))}
          >
            {busy === "rename" ? "Saving..." : "Rename"}
          </button>
        </div>

        <div className="inline-fields">
          <input
            value={targetParentId}
            onChange={(event) => setTargetParentId(event.target.value)}
            placeholder="Target parent folder ID"
          />
          <button
            type="button"
            disabled={!selectedItem || !targetParentId || busy !== null}
            onClick={() => selectedItem && run("move", () => onMove(selectedItem.id, targetParentId))}
          >
            {busy === "move" ? "Saving..." : "Move"}
          </button>

          <input
            value={copyName}
            onChange={(event) => setCopyName(event.target.value)}
            placeholder="Copy name (optional)"
          />
          <button
            type="button"
            disabled={!selectedItem || !targetParentId || busy !== null}
            onClick={() =>
              selectedItem && run("copy", () => onCopy(selectedItem.id, targetParentId, copyName || undefined))
            }
          >
            {busy === "copy" ? "Saving..." : "Copy"}
          </button>

          <button
            type="button"
            className="danger"
            disabled={!selectedItem || busy !== null}
            onClick={() => selectedItem && run("delete", () => onDelete(selectedItem.id))}
          >
            {busy === "delete" ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </section>
  );
}
