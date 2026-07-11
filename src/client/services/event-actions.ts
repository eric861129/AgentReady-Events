import type { EventDetail, SaveEventResponse, SearchEventsQuery, SearchEventsResponse } from "../../shared/contracts";

export type ActionContext = { mode: "human" | "agent" };

export function createEventActions(dependencies: {
  search(query: SearchEventsQuery): Promise<SearchEventsResponse>;
  loadDetails(eventId: string): Promise<EventDetail>;
  save?(eventId: string, context: ActionContext): Promise<SaveEventResponse>;
  undoSave?(eventId: string): Promise<void>;
}) {
  return {
    search(query: SearchEventsQuery, _context: ActionContext) {
      return dependencies.search(query);
    },
    loadDetails(eventId: string, _context: ActionContext) {
      return dependencies.loadDetails(eventId);
    },
    saveEvent(eventId: string, context: ActionContext) {
      if (!dependencies.save) return Promise.reject(new Error("Save action is unavailable."));
      return dependencies.save(eventId, context);
    },
    undoSavedEvent(eventId: string) {
      if (!dependencies.undoSave) return Promise.reject(new Error("Undo action is unavailable."));
      return dependencies.undoSave(eventId);
    }
  };
}

export type EventActions = ReturnType<typeof createEventActions>;
