import type { EventDetail, SaveEventResponse, SearchEventsQuery, SearchEventsResponse } from "../../shared/contracts";
import { recordActivity } from "../ui/activity-timeline";

export type ActionContext = { mode: "human" | "agent" };

export type SearchActionFailure = {
  ok: false;
  code: "INVALID_INPUT" | "TEMPORARY_FAILURE";
  message: string;
  retryable: boolean;
};

export type SearchActionResult = {
  count: number;
  events: SearchEventsResponse["events"];
} | SearchActionFailure;

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
        return { count: result.events.length, events: result.events } satisfies SearchActionResult;
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
