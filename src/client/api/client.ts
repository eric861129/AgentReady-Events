import type { EventDetail, InteractionMode, RegistrationInput, RegistrationResponse, SaveEventResponse, SearchEventsQuery, SearchEventsResponse, SessionSummary } from "../../shared/contracts";

export class ApiClientError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
    this.name = "ApiClientError";
  }
}

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json();
  if (!response.ok) throw new ApiClientError(response.status, typeof body?.message === "string" ? body.message : "服務暫時無法使用。");
  return body as T;
}

export async function searchEventsRequest(query: SearchEventsQuery): Promise<SearchEventsResponse> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) if (value) params.set(key, value);
  return readJson<SearchEventsResponse>(await fetch(`/api/events?${params}`));
}

export async function eventDetailsRequest(eventId: string): Promise<EventDetail> {
  const body = await readJson<{ event: EventDetail }>(await fetch(`/api/events/${encodeURIComponent(eventId)}`));
  return body.event;
}

let sessionPromise: Promise<SessionSummary> | undefined;
export function sessionRequest(): Promise<SessionSummary> {
  sessionPromise ??= fetch("/api/session").then((response) => readJson<SessionSummary>(response));
  return sessionPromise;
}

export async function saveEventRequest(eventId: string, context: { mode: InteractionMode }): Promise<SaveEventResponse> {
  const session = await sessionRequest();
  return readJson<SaveEventResponse>(await fetch("/api/saved-events", {
    method: "POST",
    headers: { "content-type": "application/json", "x-csrf-token": session.csrfToken },
    body: JSON.stringify({ eventId, interactionMode: context.mode })
  }));
}

export async function undoSavedEventRequest(eventId: string): Promise<void> {
  const session = await sessionRequest();
  await readJson(await fetch(`/api/saved-events/${encodeURIComponent(eventId)}`, { method: "DELETE", headers: { "x-csrf-token": session.csrfToken } }));
}

export async function registrationRequest(input: RegistrationInput, context: { mode: InteractionMode }): Promise<RegistrationResponse> {
  const session = await sessionRequest();
  return readJson<RegistrationResponse>(await fetch("/api/registrations", {
    method: "POST",
    headers: { "content-type": "application/json", "x-csrf-token": session.csrfToken },
    body: JSON.stringify({ ...input, interactionMode: context.mode })
  }));
}
