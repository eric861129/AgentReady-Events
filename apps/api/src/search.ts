import type { EventSummary, SearchEventsQuery, SearchEventsResponse } from "../../../packages/contracts/src/index";

const MAX_RESULTS = 50;

export function searchEvents(events: EventSummary[], query: SearchEventsQuery): SearchEventsResponse {
  const keywords = normalize(query.query);

  const filtered = events.filter((event) => {
    if (keywords && !matchesKeywords(event, keywords)) {
      return false;
    }

    if (query.start_date && event.startsAt.slice(0, 10) < query.start_date) {
      return false;
    }

    if (query.end_date && event.startsAt.slice(0, 10) > query.end_date) {
      return false;
    }

    if (query.location && event.location !== query.location) {
      return false;
    }

    if (query.price && event.price !== query.price) {
      return false;
    }

    if (query.category && event.category !== query.category) {
      return false;
    }

    if (query.level && event.level !== query.level) {
      return false;
    }

    return true;
  });

  const sorted = [...filtered].sort((left, right) => left.startsAt.localeCompare(right.startsAt));
  const returnedEvents = sorted.slice(0, MAX_RESULTS);

  return {
    total: filtered.length,
    returned: returnedEvents.length,
    hasMore: filtered.length > returnedEvents.length,
    events: returnedEvents
  };
}

function matchesKeywords(event: EventSummary, keywords: string): boolean {
  const text = normalize([
    event.title,
    event.summary,
    event.locationLabel,
    event.venue,
    event.categoryLabel,
    event.levelLabel,
    event.priceLabel
  ].join(" "));

  return text.includes(keywords);
}

function normalize(value: string | undefined): string {
  return (value ?? "").trim().toLocaleLowerCase("zh-Hant-TW");
}
