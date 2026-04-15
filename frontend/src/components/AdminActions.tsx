import { useMemo, useState } from "react";

import type { DriveItem } from "../types";

interface AdminActionsProps {
  labels: {
    title: string;
    selected: string;
    noSelected: string;
    createFolder: string;
    folderName: string;
    parentFolderIdOptional: string;
    create: string;
    saving: string;
    selectedActions: string;
    newName: string;
    rename: string;
    targetParentFolderId: string;
    move: string;
    copyNameOptional: string;
    copy: string;
    delete: string;
    deleting: string;
  };
  selectedItem: DriveItem | null;
  onCreateFolder: (name: string, parentId?: string) => Promise<void>;
  onRename: (itemId: string, name: string) => Promise<void>;
  onMove: (itemId: string, targetParentId: string) => Promise<void>;
  onCopy: (itemId: string, targetParentId: string, name?: string) => Promise<void>;
  onDelete: (itemId: string) => Promise<void>;
}

export function AdminActions({
  labels,
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
      return labels.noSelected;
    }

    return `${selectedItem.name} (${selectedItem.itemType})`;
  }, [selectedItem, labels.noSelected]);

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
      <h2>{labels.title}</h2>
      <p className="selected-row">{labels.selected}: {selectedLabel}</p>

      <div className="admin-block">
        <h3>{labels.createFolder}</h3>
        <div className="inline-fields">
          <input
            value={createName}
            onChange={(event) => setCreateName(event.target.value)}
            placeholder={labels.folderName}
          />
          <input
            value={createParentId}
            onChange={(event) => setCreateParentId(event.target.value)}
            placeholder={labels.parentFolderIdOptional}
          />
          <button
            type="button"
            onClick={() => run("create", () => onCreateFolder(createName, createParentId || undefined))}
            disabled={!createName || busy !== null}
          >
            {busy === "create" ? labels.saving : labels.create}
          </button>
        </div>
      </div>

      <div className="admin-block">
        <h3>{labels.selectedActions}</h3>
        <div className="inline-fields">
          <input
            value={renameName}
            onChange={(event) => setRenameName(event.target.value)}
            placeholder={labels.newName}
          />
          <button
            type="button"
            disabled={!selectedItem || !renameName || busy !== null}
            onClick={() => selectedItem && run("rename", () => onRename(selectedItem.id, renameName))}
          >
            {busy === "rename" ? labels.saving : labels.rename}
          </button>
        </div>

        <div className="inline-fields">
          <input
            value={targetParentId}
            onChange={(event) => setTargetParentId(event.target.value)}
            placeholder={labels.targetParentFolderId}
          />
          <button
            type="button"
            disabled={!selectedItem || !targetParentId || busy !== null}
            onClick={() => selectedItem && run("move", () => onMove(selectedItem.id, targetParentId))}
          >
            {busy === "move" ? labels.saving : labels.move}
          </button>

          <input
            value={copyName}
            onChange={(event) => setCopyName(event.target.value)}
            placeholder={labels.copyNameOptional}
          />
          <button
            type="button"
            disabled={!selectedItem || !targetParentId || busy !== null}
            onClick={() =>
              selectedItem && run("copy", () => onCopy(selectedItem.id, targetParentId, copyName || undefined))
            }
          >
            {busy === "copy" ? labels.saving : labels.copy}
          </button>

          <button
            type="button"
            className="danger"
            disabled={!selectedItem || busy !== null}
            onClick={() => selectedItem && run("delete", () => onDelete(selectedItem.id))}
          >
            {busy === "delete" ? labels.deleting : labels.delete}
          </button>
        </div>
      </div>
    </section>
  );
}
