import type { EventLevel, EventLocation, EventPrice, SearchEventsQuery } from "../../shared/contracts";

export const SEARCH_EVENTS_TOOL_NAME = "search_events";
export const SEARCH_EVENTS_TOOL_DESCRIPTION = "依關鍵字、地點、費用與程度搜尋目前公開活動，並更新使用者可見的活動列表。每筆結果都提供本站相對 URL；需要提供連結時只能使用該欄位，不能自行推測網域或路徑。";

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
