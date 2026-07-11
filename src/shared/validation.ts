import type { EventLevel, EventLocation, EventPrice, SearchEventsQuery } from "./contracts";

const LOCATIONS = new Set<EventLocation>(["taipei", "kaohsiung", "online"]);
const PRICES = new Set<EventPrice>(["free", "paid"]);
const LEVELS = new Set<EventLevel>(["beginner", "intermediate", "advanced"]);
export const OPAQUE_ID = /^[a-z0-9_-]{1,64}$/;

export function parseSearchQuery(raw: Record<string, unknown>): SearchEventsQuery | undefined {
  const read = (key: string) => typeof raw[key] === "string" ? raw[key].trim() : "";
  const query = read("query");
  const location = read("location");
  const price = read("price");
  const level = read("level");
  if (query.length > 100) return undefined;
  if (location && !LOCATIONS.has(location as EventLocation)) return undefined;
  if (price && !PRICES.has(price as EventPrice)) return undefined;
  if (level && !LEVELS.has(level as EventLevel)) return undefined;
  return {
    ...(query ? { query } : {}),
    ...(location ? { location: location as EventLocation } : {}),
    ...(price ? { price: price as EventPrice } : {}),
    ...(level ? { level: level as EventLevel } : {})
  };
}
