import type { EventDetail, SearchEventsQuery, SearchEventsResponse } from "../../shared/contracts";

export type ActionContext = { mode: "human" | "agent" };

export function createEventActions(dependencies: {
  search(query: SearchEventsQuery): Promise<SearchEventsResponse>;
  loadDetails(eventId: string): Promise<EventDetail>;
}) {
  return {
    search(query: SearchEventsQuery, _context: ActionContext) {
      return dependencies.search(query);
    },
    loadDetails(eventId: string, _context: ActionContext) {
      return dependencies.loadDetails(eventId);
    }
  };
}

export type EventActions = ReturnType<typeof createEventActions>;
