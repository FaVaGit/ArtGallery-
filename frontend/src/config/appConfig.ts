export type VisibilityMode = "public" | "private";

export interface AppConfig {
  brandName: string;
  apiBaseUrl: string;
  defaultFolderId: string;
  visibilityMode: VisibilityMode;
}

const CONFIG_STORAGE_KEY = "artgallery.app.config";

export const DEFAULT_CONFIG: AppConfig = {
  brandName: "Facciate Gallery",
  apiBaseUrl: "",
  defaultFolderId: "",
  visibilityMode: "public",
};

export function loadAppConfig(): AppConfig {
  const raw = localStorage.getItem(CONFIG_STORAGE_KEY);

  if (!raw) {
    return DEFAULT_CONFIG;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppConfig>;

    return {
      brandName: parsed.brandName?.trim() || DEFAULT_CONFIG.brandName,
      apiBaseUrl: parsed.apiBaseUrl?.trim() || DEFAULT_CONFIG.apiBaseUrl,
      defaultFolderId: parsed.defaultFolderId?.trim() || DEFAULT_CONFIG.defaultFolderId,
      visibilityMode: parsed.visibilityMode === "private" ? "private" : "public",
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveAppConfig(config: AppConfig): void {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
}
