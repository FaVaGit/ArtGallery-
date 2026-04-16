import { getApiBaseUrl } from "../api/client";
import { getDemoItems, DEMO_ADMIN_USERNAME, DEMO_ADMIN_PASSWORD, DEMO_TOKEN } from "./demoData";
import type { DriveItemsResponse, LoginResponse } from "../types";

export { DEMO_TOKEN };

const DEMO_MODE_KEY = "artgallery.demo.mode";

let _isDemoMode: boolean | null = null;

/**
 * Check if the backend is reachable. If not, activate demo mode.
 * Result is cached for the session.
 */
export async function checkDemoMode(): Promise<boolean> {
  if (_isDemoMode !== null) return _isDemoMode;

  // If previously detected in this browser session
  const stored = sessionStorage.getItem(DEMO_MODE_KEY);
  if (stored === "true") { _isDemoMode = true; return true; }

  try {
    const base = getApiBaseUrl();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${base}/drive/status`, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      _isDemoMode = false;
      sessionStorage.removeItem(DEMO_MODE_KEY);
      return false;
    }
  } catch {
    // Network error or timeout — backend unreachable
  }

  _isDemoMode = true;
  sessionStorage.setItem(DEMO_MODE_KEY, "true");
  return true;
}

export function isDemoMode(): boolean {
  return _isDemoMode === true;
}

/** Reset demo mode (e.g. when user changes API base URL) */
export function resetDemoMode(): void {
  _isDemoMode = null;
  sessionStorage.removeItem(DEMO_MODE_KEY);
}

/* ── Demo API implementations ─────────────── */

export function demoGetDriveStatus(): { ok: boolean } {
  return { ok: true };
}

export function demoListItems(folderId?: string, search?: string): DriveItemsResponse {
  return { items: getDemoItems(folderId, search) };
}

export function demoLogin(username: string, password: string): LoginResponse | null {
  if (username === DEMO_ADMIN_USERNAME && password === DEMO_ADMIN_PASSWORD) {
    return {
      token: DEMO_TOKEN,
      expiresIn: "24h",
      user: { username: DEMO_ADMIN_USERNAME, role: "admin" },
    };
  }
  return null;
}

export function demoGetCurrentUser(): { user: LoginResponse["user"] } | null {
  return { user: { username: DEMO_ADMIN_USERNAME, role: "admin" } };
}
