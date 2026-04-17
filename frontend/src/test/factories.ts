import type { DriveItem } from "../types";

export function makeDriveItem(overrides: Partial<DriveItem> = {}): DriveItem {
  return {
    id: "item-1",
    name: "Test Item",
    mimeType: "image/jpeg",
    webViewLink: null,
    thumbnailLink: null,
    createdTime: "2025-01-15T10:00:00Z",
    modifiedTime: "2025-06-01T12:00:00Z",
    parents: ["root"],
    itemType: "file",
    description: null,
    location: null,
    ...overrides,
  };
}

export function makeFolder(overrides: Partial<DriveItem> = {}): DriveItem {
  return makeDriveItem({
    mimeType: "application/vnd.google-apps.folder",
    itemType: "folder",
    name: "Test Folder",
    ...overrides,
  });
}

export const defaultLabels = {
  noContent: "No content",
  folder: "Folder",
  file: "File",
  updated: "Updated",
  open: "Open",
  view: "View",
};

export const defaultShareLabels = {
  share: "Share",
  copyLink: "Copy link",
  copiedToClipboard: "Copied!",
  shareOn: "Share on",
};

export const defaultFilterLabels = {
  typeAll: "All",
  typeFolders: "Folders only",
  typeImages: "Images only",
  sortNameAsc: "Name A–Z",
  sortNameDesc: "Name Z–A",
  sortNewest: "Newest first",
  sortOldest: "Oldest first",
  sortBy: "Sort",
  filterType: "Type",
};

export const defaultCreateFolderLabels = {
  title: "Create New Folder",
  nameLabel: "Folder name",
  namePlaceholder: "Enter folder name…",
  create: "Create",
  cancel: "Cancel",
};

export const defaultConfirmLabels = {
  title: "Confirm Action",
  message: "Are you sure?",
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
};
