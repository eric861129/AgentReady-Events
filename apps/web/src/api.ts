import type { SearchEventsQuery, SearchEventsResponse, ValidationErrorResponse } from "../../../packages/contracts/src/index";

export async function fetchEvents(query: SearchEventsQuery): Promise<SearchEventsResponse> {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  const response = await fetch(`/api/events?${params.toString()}`);
  const body = await response.json() as SearchEventsResponse | ValidationErrorResponse;

  if (!response.ok) {
    const message = "fieldErrors" in body
      ? body.fieldErrors.map((error) => error.message).join(" ")
      : "搜尋活動時發生錯誤。";
    throw new Error(message);
  }

  return body as SearchEventsResponse;
}
