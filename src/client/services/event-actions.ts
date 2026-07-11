import type { EventDetail, SaveEventResponse, SearchEventsQuery, SearchEventsResponse } from "../../shared/contracts";
import { recordActivity } from "../ui/activity-timeline";

export type ActionContext = { mode: "human" | "agent" };

export function createEventActions(dependencies: {
  search(query: SearchEventsQuery): Promise<SearchEventsResponse>;
  loadDetails(eventId: string): Promise<EventDetail>;
  save?(eventId: string, context: ActionContext): Promise<SaveEventResponse>;
  undoSave?(eventId: string): Promise<void>;
}) {
  return {
    async search(query: SearchEventsQuery, context: ActionContext) {
      const result = await dependencies.search(query);
      recordActivity("search_events", context.mode, "SUCCESS");
      return result;
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
