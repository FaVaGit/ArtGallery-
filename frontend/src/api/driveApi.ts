import { apiRequest } from "./client";
import type { DriveFoldersResponse, DriveItem, DriveItemsResponse } from "../types";

interface ListItemsParams {
  folderId?: string;
  pageSize?: number;
  pageToken?: string;
  search?: string;
}

function toQueryString(params: Record<string, string | undefined>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function getDriveStatus(): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>("/drive/status");
}

export async function listFolders(parentId?: string): Promise<DriveFoldersResponse> {
  const query = toQueryString({ parentId });
  return apiRequest<DriveFoldersResponse>(`/drive/folders${query}`);
}

export async function listItems(params: ListItemsParams): Promise<DriveItemsResponse> {
  const query = toQueryString({
    folderId: params.folderId,
    pageSize: params.pageSize ? String(params.pageSize) : undefined,
    pageToken: params.pageToken,
    search: params.search,
  });

  return apiRequest<DriveItemsResponse>(`/drive/items${query}`);
}

export async function createFolder(token: string, name: string, parentId?: string): Promise<DriveItem> {
  return apiRequest<DriveItem>("/drive/folders", {
    method: "POST",
    token,
    body: JSON.stringify({ name, parentId }),
  });
}

export async function renameItem(token: string, itemId: string, name: string): Promise<DriveItem> {
  return apiRequest<DriveItem>(`/drive/items/${itemId}/rename`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ name }),
  });
}

export async function moveItem(token: string, itemId: string, targetParentId: string): Promise<DriveItem> {
  return apiRequest<DriveItem>(`/drive/items/${itemId}/move`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ targetParentId }),
  });
}

export async function copyItem(
  token: string,
  itemId: string,
  targetParentId: string,
  name?: string,
): Promise<DriveItem> {
  return apiRequest<DriveItem>("/drive/items/copy", {
    method: "POST",
    token,
    body: JSON.stringify({ itemId, targetParentId, name }),
  });
}

export async function deleteItem(token: string, itemId: string): Promise<void> {
  await apiRequest<void>(`/drive/items/${itemId}`, {
    method: "DELETE",
    token,
  });
}
