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
