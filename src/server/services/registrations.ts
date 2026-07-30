import { randomUUID } from "node:crypto";
import type { CancellationSummary, RegistrationInput, RegistrationListItem } from "../../shared/contracts";
import type { DemoSession } from "../store/memory-store";
import type { EventInventory } from "../store/event-inventory";

export type RegistrationServiceResult =
  | { kind: "created"; registration: RegistrationListItem }
  | { kind: "not-found" }
  | { kind: "unavailable"; reason: "EVENT_NOT_OPEN" }
  | { kind: "duplicate" };

export function createRegistration(
  session: DemoSession,
  inventory: EventInventory,
  input: RegistrationInput
): RegistrationServiceResult {
  if (
    [...session.registrations.values()].some(
      (registration) => registration.eventId === input.eventId && registration.status === "active"
    )
  ) {
    return { kind: "duplicate" };
  }

  const reservation = inventory.reserve(input.eventId);
  if (reservation.kind !== "reserved") return reservation;
  const event = reservation.event;
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

export function listRegistrations(session: DemoSession): RegistrationListItem[] {
  return [...session.registrations.values()].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function cancellationSummary(session: DemoSession, registrationId: string): CancellationSummary | undefined {
  const registration = session.registrations.get(registrationId);
  if (!registration || registration.status !== "active") return undefined;
  return {
    registrationId: registration.id,
    eventId: registration.eventId,
    eventTitle: registration.eventTitle,
    startsAt: registration.startsAt,
    effect: "取消後會釋出名額；本 Demo 不會寄送通知。"
  };
}

export function cancelRegistration(session: DemoSession, inventory: EventInventory, registrationId: string) {
  const registration = session.registrations.get(registrationId);
  if (!registration) return { kind: "not-found" as const };
  const alreadyCancelled = registration.status === "cancelled";
  if (!alreadyCancelled) {
    registration.status = "cancelled";
    inventory.release(registration.eventId);
  }
  return { kind: "cancelled" as const, registrationId, alreadyCancelled };
}
