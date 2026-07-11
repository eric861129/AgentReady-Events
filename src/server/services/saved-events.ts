import type { EventDetail } from "../../shared/contracts";
import type { DemoSession } from "../store/memory-store";

export function saveEvent(session: DemoSession, events: EventDetail[], eventId: string) {
  if (!events.some((event) => event.id === eventId)) return { kind: "not-found" as const };
  const alreadySaved = session.savedEventIds.has(eventId);
  session.savedEventIds.add(eventId);
  return { kind: "saved" as const, eventId, alreadySaved };
}

export function removeSavedEvent(session: DemoSession, eventId: string) {
  const existed = session.savedEventIds.delete(eventId);
  return { eventId, existed };
}
