import { useEffect } from "react";
import { eventBus } from "./eventBus";
import type { EventMap } from "./types";

/**
 * React hook – subscribe to an EventBus event for the lifetime
 * of the component.  Automatically unsubscribes on unmount.
 */
export function useEvent<K extends keyof EventMap>(
  event: K,
  handler: (payload: EventMap[K]) => void,
): void {
  useEffect(() => {
    const off = eventBus.on(event, handler);
    return off;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);
}
