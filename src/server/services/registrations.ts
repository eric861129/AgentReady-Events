import { randomUUID } from "node:crypto";
import type { EventDetail, RegistrationInput, RegistrationListItem } from "../../shared/contracts";
import type { DemoSession } from "../store/memory-store";

export type RegistrationServiceResult =
  | { kind: "created"; registration: RegistrationListItem }
  | { kind: "not-found" }
  | { kind: "unavailable"; reason: "EVENT_NOT_OPEN" }
  | { kind: "duplicate" };

export function createRegistration(session: DemoSession, events: EventDetail[], input: RegistrationInput): RegistrationServiceResult {
  const event = events.find((candidate) => candidate.id === input.eventId);
  if (!event) return { kind: "not-found" };
  if (event.state !== "open" || event.remainingCapacity < 1) return { kind: "unavailable", reason: "EVENT_NOT_OPEN" };
  if ([...session.registrations.values()].some((registration) => registration.eventId === event.id && registration.status === "active")) return { kind: "duplicate" };
  const registration: RegistrationListItem = {
    id: `reg-${randomUUID()}`,
    eventId: event.id,
    eventTitle: event.title,
    startsAt: event.startsAt,
    attendeeName: input.attendeeName,
    status: "active"
  };
  session.registrations.set(registration.id, registration);
  return { kind: "created", registration };
}
