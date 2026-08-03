import type { EventLevel, EventLocation, EventPrice, SearchEventsQuery } from "../../shared/contracts";

export const SEARCH_EVENTS_TOOL_NAME = "search_events";
export const SEARCH_EVENTS_TOOL_DESCRIPTION = "只在使用者要搜尋目前公開活動時，依關鍵字、地點、費用與程度執行搜尋，並更新可見列表。必須保留使用者提供的全部條件；結果為 0 時不得自行放寬或重試其他條件，應先詢問使用者。每筆結果都提供本站相對 URL 與不透明 ID，不得自行推測網域、路徑或 ID。若使用者只詢問一般知識、系列篇數，或明確要求不要搜尋活動，請直接回答，不要執行任何網站 Tool。";

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
