import type { EventDetail, SearchEventsQuery, SearchEventsResponse } from "../../shared/contracts";

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
