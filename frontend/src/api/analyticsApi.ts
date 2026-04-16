import { apiRequest } from "./client";

export interface AnalyticsSummary {
  totalViews: number;
  uniqueItems: number;
  totalSearches: number;
  viewsOverTime: { date: string; count: number }[];
  topItems: { item_id: string; count: number }[];
  topSearches: { term: string; count: number }[];
}

export async function trackEvent(eventType: string, itemId?: string, metadata?: Record<string, string>): Promise<void> {
  try {
    await apiRequest<void>("/analytics/event", {
      method: "POST",
      body: JSON.stringify({ eventType, itemId, metadata }),
    });
  } catch {
    // fire-and-forget — ignore errors
  }
}

export async function getAnalyticsSummary(token: string): Promise<AnalyticsSummary> {
  return apiRequest<AnalyticsSummary>("/analytics/summary", { token });
}
