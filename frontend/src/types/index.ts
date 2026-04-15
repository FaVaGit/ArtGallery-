export type UserRole = "admin" | "viewer";

export interface AuthUser {
  username: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  expiresIn: string;
  user: AuthUser;
}

export interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string | null;
  thumbnailLink: string | null;
  createdTime: string | null;
  modifiedTime: string | null;
  parents: string[];
  itemType: "folder" | "file";
}

export interface DriveItemsResponse {
  items: DriveItem[];
  nextPageToken?: string;
}

export interface DriveFoldersResponse {
  items: DriveItem[];
}
