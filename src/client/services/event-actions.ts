import type { EventDetail, SaveEventResponse, SearchEventsQuery, SearchEventsResponse } from "../../shared/contracts";
import { recordActivity } from "../ui/activity-timeline";

export type ActionContext = { mode: "human" | "agent" };

export type SearchActionFailure = {
  ok: false;
  code: "INVALID_INPUT" | "TEMPORARY_FAILURE";
  message: string;
  retryable: boolean;
};

export type SearchActionSuccess = {
  ok: true;
  code: "SUCCESS";
  count: number;
  events: SearchEventsResponse["events"];
  appliedFilters: SearchEventsQuery;
  constraintsRelaxed: false;
  requiresUserDecision: boolean;
  nextAction: string;
};

export type SearchActionResult = SearchActionSuccess | SearchActionFailure;

function statusFrom(error: unknown): number | undefined {
  if (!error || typeof error !== "object" || !("status" in error)) return undefined;
  return typeof error.status === "number" ? error.status : undefined;
}

export function createEventActions(dependencies: {
  search(query: SearchEventsQuery): Promise<SearchEventsResponse>;
  loadDetails(eventId: string): Promise<EventDetail>;
  save?(eventId: string, context: ActionContext): Promise<SaveEventResponse>;
  undoSave?(eventId: string): Promise<void>;
}) {
  return {
    async search(query: SearchEventsQuery, context: ActionContext) {
      try {
        const result = await dependencies.search(query);
        recordActivity("search_events", context.mode, "SUCCESS");
        const noMatches = result.events.length === 0;
        return {
          ok: true,
          code: "SUCCESS",
          count: result.events.length,
          events: result.events,
          appliedFilters: { ...query },
          constraintsRelaxed: false,
          requiresUserDecision: noMatches,
          nextAction: noMatches
            ? "目前沒有同時符合所有條件的公開活動；請先詢問使用者是否要調整條件，不得自行放寬。"
            : "若使用者要查看詳情，請將 events 中的原始 id 傳給 get_event_details，不得自行產生 ID。"
        } satisfies SearchActionSuccess;
      } catch (error) {
        const invalidInput = statusFrom(error) === 400;
        const failure: SearchActionFailure = invalidInput
          ? { ok: false, code: "INVALID_INPUT", message: "搜尋條件格式無效，請檢查欄位值。", retryable: false }
          : { ok: false, code: "TEMPORARY_FAILURE", message: "活動搜尋暫時無法完成，請稍後再試。", retryable: true };
        recordActivity("search_events", context.mode, failure.code);
        return failure;
      }
    },
    async loadDetails(eventId: string, context: ActionContext) {
      const result = await dependencies.loadDetails(eventId);
      recordActivity("get_event_details", context.mode, "SUCCESS", { eventId });
      return result;
    },
    async saveEvent(eventId: string, context: ActionContext) {
      if (!dependencies.save) return Promise.reject(new Error("Save action is unavailable."));
      const result = await dependencies.save(eventId, context);
      recordActivity("save_event", context.mode, result.alreadySaved ? "ALREADY_SAVED" : "SUCCESS", { eventId });
      return result;
    },
    undoSavedEvent(eventId: string) {
      if (!dependencies.undoSave) return Promise.reject(new Error("Undo action is unavailable."));
      return dependencies.undoSave(eventId);
    }
  };
}

export type EventActions = ReturnType<typeof createEventActions>;
