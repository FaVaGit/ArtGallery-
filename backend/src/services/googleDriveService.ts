import { google } from "googleapis";

import { HttpError } from "../utils/httpError.js";

const DRIVE_SCOPES = ["https://www.googleapis.com/auth/drive"];
const FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";

type ItemType = "folder" | "file";

export interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string | null;
  thumbnailLink: string | null;
  createdTime: string | null;
  modifiedTime: string | null;
  parents: string[];
  itemType: ItemType;
}

export interface DriveListResult {
  items: DriveItem[];
  nextPageToken?: string;
}

interface ServiceAccountCredentials {
  client_email: string;
  private_key: string;
}

function readServiceAccountCredentials(): ServiceAccountCredentials {
  const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson) as Partial<ServiceAccountCredentials>;

      if (!parsed.client_email || !parsed.private_key) {
        throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is missing required keys");
      }

      return {
        client_email: parsed.client_email,
        private_key: parsed.private_key,
      };
    } catch {
      throw new HttpError(500, "Invalid GOOGLE_SERVICE_ACCOUNT_JSON");
    }
  }

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new HttpError(
      500,
      "Google credentials missing. Set GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY.",
    );
  }

  return {
    client_email: clientEmail,
    private_key: privateKey,
  };
}

function mapDriveItem(item: {
  id?: string | null;
  name?: string | null;
  mimeType?: string | null;
  webViewLink?: string | null;
  thumbnailLink?: string | null;
  createdTime?: string | null;
  modifiedTime?: string | null;
  parents?: string[] | null;
}): DriveItem {
  return {
    id: item.id ?? "",
    name: item.name ?? "",
    mimeType: item.mimeType ?? "",
    webViewLink: item.webViewLink ?? null,
    thumbnailLink: item.thumbnailLink ?? null,
    createdTime: item.createdTime ?? null,
    modifiedTime: item.modifiedTime ?? null,
    parents: item.parents ?? [],
    itemType: item.mimeType === FOLDER_MIME_TYPE ? "folder" : "file",
  };
}

function getDriveClient() {
  const credentials = readServiceAccountCredentials();

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: DRIVE_SCOPES,
  });

  return google.drive({ version: "v3", auth });
}

export async function checkDriveConnection(): Promise<{ ok: true }> {
  const drive = getDriveClient();
  await drive.about.get({ fields: "user,storageQuota" });
  return { ok: true };
}

export async function listFolders(parentId: string): Promise<DriveItem[]> {
  const drive = getDriveClient();

  const response = await drive.files.list({
    q: `'${parentId}' in parents and mimeType='${FOLDER_MIME_TYPE}' and trashed=false`,
    fields:
      "files(id,name,mimeType,webViewLink,thumbnailLink,createdTime,modifiedTime,parents)",
    orderBy: "name",
    pageSize: 200,
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
  });

  return (response.data.files ?? []).map(mapDriveItem);
}

export async function listItems(options: {
  folderId: string;
  pageSize?: number;
  pageToken?: string;
  search?: string;
}): Promise<DriveListResult> {
  const drive = getDriveClient();

  const conditions = [`'${options.folderId}' in parents`, "trashed=false"];

  if (options.search) {
    const escaped = options.search.replace(/'/g, "\\'");
    conditions.push(`name contains '${escaped}'`);
  }

  const response = await drive.files.list({
    q: conditions.join(" and "),
    fields:
      "nextPageToken,files(id,name,mimeType,webViewLink,thumbnailLink,createdTime,modifiedTime,parents)",
    orderBy: "folder,name",
    pageSize: options.pageSize ?? 100,
    pageToken: options.pageToken,
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
  });

  return {
    items: (response.data.files ?? []).map(mapDriveItem),
    nextPageToken: response.data.nextPageToken ?? undefined,
  };
}

export async function createFolder(input: {
  name: string;
  parentId: string;
}): Promise<DriveItem> {
  const drive = getDriveClient();

  const response = await drive.files.create({
    requestBody: {
      name: input.name,
      mimeType: FOLDER_MIME_TYPE,
      parents: [input.parentId],
    },
    fields: "id,name,mimeType,webViewLink,thumbnailLink,createdTime,modifiedTime,parents",
    supportsAllDrives: true,
  });

  return mapDriveItem(response.data);
}

export async function renameItem(input: {
  itemId: string;
  name: string;
}): Promise<DriveItem> {
  const drive = getDriveClient();

  const response = await drive.files.update({
    fileId: input.itemId,
    requestBody: { name: input.name },
    fields: "id,name,mimeType,webViewLink,thumbnailLink,createdTime,modifiedTime,parents",
    supportsAllDrives: true,
  });

  return mapDriveItem(response.data);
}

export async function moveItem(input: {
  itemId: string;
  targetParentId: string;
}): Promise<DriveItem> {
  const drive = getDriveClient();

  const fileData = await drive.files.get({
    fileId: input.itemId,
    fields: "parents",
    supportsAllDrives: true,
  });

  const previousParents = (fileData.data.parents ?? []).join(",");

  const response = await drive.files.update({
    fileId: input.itemId,
    addParents: input.targetParentId,
    removeParents: previousParents,
    fields: "id,name,mimeType,webViewLink,thumbnailLink,createdTime,modifiedTime,parents",
    supportsAllDrives: true,
  });

  return mapDriveItem(response.data);
}

export async function copyItem(input: {
  itemId: string;
  targetParentId: string;
  name?: string;
}): Promise<DriveItem> {
  const drive = getDriveClient();

  const response = await drive.files.copy({
    fileId: input.itemId,
    requestBody: {
      name: input.name,
      parents: [input.targetParentId],
    },
    fields: "id,name,mimeType,webViewLink,thumbnailLink,createdTime,modifiedTime,parents",
    supportsAllDrives: true,
  });

  return mapDriveItem(response.data);
}

export async function deleteItem(itemId: string): Promise<void> {
  const drive = getDriveClient();

  await drive.files.delete({
    fileId: itemId,
    supportsAllDrives: true,
  });
}

export async function getThumbnail(
  fileId: string,
  size = 220,
): Promise<{ buffer: Buffer; mimeType: string }> {
  const drive = getDriveClient();

  const meta = await drive.files.get({
    fileId,
    fields: "thumbnailLink",
    supportsAllDrives: true,
  });

  const link = meta.data.thumbnailLink;
  if (!link) {
    throw new HttpError(404, "No thumbnail available for this file");
  }

  // Replace the default size suffix with the requested size
  const url = link.replace(/=s\d+$/, `=s${size}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new HttpError(502, "Failed to fetch thumbnail from Google");
  }

  const arrayBuffer = await response.arrayBuffer();
  const contentType = response.headers.get("content-type") ?? "image/png";

  return { buffer: Buffer.from(arrayBuffer), mimeType: contentType };
}

export async function uploadFile(input: {
  buffer: Buffer;
  mimeType: string;
  name: string;
  parentId: string;
}): Promise<DriveItem> {
  const drive = getDriveClient();

  const { Readable } = await import("stream");
  const stream = Readable.from(input.buffer);

  const response = await drive.files.create({
    requestBody: {
      name: input.name,
      parents: [input.parentId],
    },
    media: {
      mimeType: input.mimeType,
      body: stream,
    },
    fields: "id,name,mimeType,webViewLink,thumbnailLink,createdTime,modifiedTime,parents",
    supportsAllDrives: true,
  });

  return mapDriveItem(response.data);
}
