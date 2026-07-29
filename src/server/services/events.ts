import type { EventDetail, EventSummary, SearchEventsQuery } from "../../shared/contracts";

function toSummary(event: EventDetail): EventSummary {
  const { id, title, summary, startsAt, location, price, level } = event;
  return { id, url: `/events/${id}`, title, summary, startsAt, location, price, level };
}

export function searchEvents(events: EventDetail[], query: SearchEventsQuery): EventSummary[] {
  const keyword = query.query?.toLocaleLowerCase("zh-Hant") ?? "";
  return events.filter((event) => {
    if (keyword && !`${event.title} ${event.summary}`.toLocaleLowerCase("zh-Hant").includes(keyword)) return false;
    if (query.location && event.location !== query.location) return false;
    if (query.price && event.price !== query.price) return false;
    if (query.level && event.level !== query.level) return false;
    return true;
  }).map(toSummary);
}

export function findPublicEvent(events: EventDetail[], id: string): EventDetail | undefined {
  return events.find((event) => event.id === id);
}
