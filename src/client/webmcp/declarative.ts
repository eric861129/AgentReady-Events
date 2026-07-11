import type { EventLevel, EventLocation, EventPrice, SearchEventsQuery } from "../../shared/contracts";

export const SEARCH_EVENTS_TOOL_NAME = "search_events";
export const SEARCH_EVENTS_TOOL_DESCRIPTION = "依關鍵字、地點、費用與程度搜尋目前公開活動，並更新使用者可見的活動列表。";

export function readSearchQuery(data: FormData): SearchEventsQuery {
  const get = (name: string) => String(data.get(name) ?? "").trim();
  return {
    ...(get("query") ? { query: get("query") } : {}),
    ...(get("location") ? { location: get("location") as EventLocation } : {}),
    ...(get("price") ? { price: get("price") as EventPrice } : {}),
    ...(get("level") ? { level: get("level") as EventLevel } : {})
  };
}
