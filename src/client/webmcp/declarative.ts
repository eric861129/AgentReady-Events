import type { EventLevel, EventLocation, EventPrice, SearchEventsQuery } from "../../shared/contracts";

export const SEARCH_EVENTS_TOOL_NAME = "search_events";
export const SEARCH_EVENTS_TOOL_DESCRIPTION = "搜尋本站目前公開活動，依使用者提供的關鍵字、地點、費用與程度更新可見列表。完整保留搜尋條件；結果為 0 時由使用者決定是否調整條件。每筆結果提供本站相對 URL 與原始不透明 ID，供後續讀取詳情。一般知識、系列篇數與非活動搜尋問題由 Agent 直接回答。";

export type DeclarativeSubmitEvent = {
  agentInvoked?: boolean;
  respondWith?: (result: Promise<unknown>) => void;
};

export function readSearchQuery(data: FormData): SearchEventsQuery {
  const get = (name: string) => String(data.get(name) ?? "").trim();
  return {
    ...(get("query") ? { query: get("query") } : {}),
    ...(get("location") ? { location: get("location") as EventLocation } : {}),
    ...(get("price") ? { price: get("price") as EventPrice } : {}),
    ...(get("level") ? { level: get("level") as EventLevel } : {})
  };
}

export function respondToAgentSubmission<T>(event: DeclarativeSubmitEvent, result: Promise<T>): boolean {
  if (!event.agentInvoked) return false;
  event.respondWith?.(result);
  return true;
}
