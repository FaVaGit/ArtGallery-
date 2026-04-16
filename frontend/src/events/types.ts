import type { AppConfig } from "../config/appConfig";
import type { Language } from "../i18n/messages";
import type { AuthUser, DriveItem } from "../types";

/* ────────────────────────────────────────────────────────────────
 * Event-Driven Architecture – Event Payload Map
 *
 * Every event in the application is declared here, mapping the
 * event name (string literal) to the shape of its payload.
 * Producers call  eventBus.emit("name", payload)
 * Consumers call  eventBus.on("name", handler)
 * ──────────────────────────────────────────────────────────── */

export interface EventMap {
  /* ── Authentication ────────────────────────── */
  "auth:login": { username: string; password: string };
  "auth:loginSuccess": { token: string; user: AuthUser };
  "auth:loginFailed": { error: string };
  "auth:logout": void;
  "auth:sessionRestored": { user: AuthUser };

  /* ── Gallery / Drive ───────────────────────── */
  "gallery:load": { folderId?: string; search?: string };
  "gallery:loaded": { items: DriveItem[]; folderId?: string };
  "gallery:error": { message: string };
  "gallery:navigate": { item: DriveItem };
  "gallery:back": void;
  "gallery:select": { item: DriveItem | null };

  /* ── Admin actions on Drive items ──────────── */
  "drive:createFolder": { name: string; parentId?: string };
  "drive:rename": { itemId: string; name: string };
  "drive:move": { itemId: string; targetParentId: string };
  "drive:copy": { itemId: string; targetParentId: string; name?: string };
  "drive:delete": { itemId: string };
  "drive:actionSuccess": { message: string };
  "drive:actionFailed": { message: string };

  /* ── Drive connection status ───────────────── */
  "drive:status": { status: "checking" | "ok" | "error" };

  /* ── Configuration ─────────────────────────── */
  "config:changed": { config: AppConfig };

  /* ── Internationalization ──────────────────── */
  "i18n:changed": { language: Language };

  /* ── Canvas / Fabric.js ────────────────────── */
  "canvas:viewMode": { mode: "grid" | "canvas" };
  "canvas:zoom": { level: number };

  /* ── Notifications (UI toasts) ─────────────── */
  "notify:info": { message: string };
  "notify:error": { message: string };
  "notify:success": { message: string };
}
