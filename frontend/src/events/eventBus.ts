import type { EventMap } from "./types";

/* ────────────────────────────────────────────────────────────────
 * Type-safe EventBus  –  Singleton publish / subscribe hub
 *
 * Core of the Event-Driven Architecture.  Every module in the
 * application communicates exclusively through this bus, keeping
 * components loosely coupled and highly testable.
 *
 * Usage:
 *   eventBus.on("gallery:loaded", (payload) => { … });
 *   eventBus.emit("gallery:load", { folderId: "abc" });
 *   const off = eventBus.on("auth:logout", () => { … });
 *   off();                         // unsubscribe
 * ──────────────────────────────────────────────────────────── */

type Handler<T> = (payload: T) => void;

class EventBus {
  private listeners = new Map<string, Set<Handler<unknown>>>();

  /** Subscribe to an event. Returns an unsubscribe function. */
  on<K extends keyof EventMap>(
    event: K,
    handler: Handler<EventMap[K]>,
  ): () => void {
    const key = event as string;

    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    const set = this.listeners.get(key)!;
    set.add(handler as Handler<unknown>);

    return () => {
      set.delete(handler as Handler<unknown>);
      if (set.size === 0) this.listeners.delete(key);
    };
  }

  /** Publish an event to all current subscribers. */
  emit<K extends keyof EventMap>(
    ...args: EventMap[K] extends void ? [event: K] : [event: K, payload: EventMap[K]]
  ): void {
    const [event, payload] = args as [string, unknown];
    const set = this.listeners.get(event);
    if (!set) return;
    for (const handler of set) {
      try {
        handler(payload);
      } catch (err) {
        console.error(`[EventBus] Error in handler for "${event}"`, err);
      }
    }
  }

  /** Remove every listener (useful for tests / hot-reload). */
  clear(): void {
    this.listeners.clear();
  }
}

/** Application-wide singleton instance */
export const eventBus = new EventBus();
