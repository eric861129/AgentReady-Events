export const APPROVED_TOOL_NAMES = [
  "search_events",
  "get_event_details",
  "save_event",
  "prepare_event_registration",
  "prepare_registration_cancellation"
] as const;

export type InteractionMode = "human" | "agent";

export type EventLocation = "taipei" | "kaohsiung" | "online";
export type EventPrice = "free" | "paid";
export type EventLevel = "beginner" | "intermediate" | "advanced";

export type SearchEventsQuery = {
  query?: string;
  location?: EventLocation;
  price?: EventPrice;
  level?: EventLevel;
};

export type EventSummary = {
  id: string;
  url?: string;
  title: string;
  summary: string;
  startsAt: string;
  location: EventLocation;
  price: EventPrice;
  level: EventLevel;
};

export type EventDetail = EventSummary & {
  endsAt: string;
  venue: string;
  remainingCapacity: number;
  registrationDeadline: string;
  state: "open" | "full" | "closed";
};

export type SearchEventsResponse = { events: EventSummary[] };

export type SessionSummary = { csrfToken: string };
export type SaveEventResponse = { eventId: string; alreadySaved: boolean };

export type RegistrationInput = {
  eventId: string;
  attendeeName: string;
  email: string;
};

export type RegistrationListItem = {
  id: string;
  eventId: string;
  eventTitle: string;
  startsAt: string;
  attendeeName: string;
  status: "active" | "cancelled";
};

export type RegistrationResponse = { registration: RegistrationListItem };

export type CancellationSummary = {
  registrationId: string;
  eventId: string;
  eventTitle: string;
  startsAt: string;
  effect: string;
};

export type CancellationResponse = { registrationId: string; alreadyCancelled: boolean };
