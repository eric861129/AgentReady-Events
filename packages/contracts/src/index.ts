export const EVENT_LOCATIONS = ["taipei", "new_taipei", "taichung", "kaohsiung", "online"] as const;
export const EVENT_PRICES = ["free", "paid"] as const;
export const EVENT_CATEGORIES = ["frontend", "backend", "ai", "devops", "security", "data"] as const;
export const EVENT_LEVELS = ["beginner", "intermediate", "advanced"] as const;

export type EventLocation = (typeof EVENT_LOCATIONS)[number];
export type EventPrice = (typeof EVENT_PRICES)[number];
export type EventCategory = (typeof EVENT_CATEGORIES)[number];
export type EventLevel = (typeof EVENT_LEVELS)[number];

export interface EventSummary {
  id: string;
  title: string;
  summary: string;
  startsAt: string;
  endsAt: string;
  location: EventLocation;
  locationLabel: string;
  venue: string;
  price: EventPrice;
  priceLabel: string;
  category: EventCategory;
  categoryLabel: string;
  level: EventLevel;
  levelLabel: string;
  remainingCapacity: number;
  featured: boolean;
  detailUrl: string;
}

export interface SearchEventsQuery {
  query?: string;
  start_date?: string;
  end_date?: string;
  location?: EventLocation;
  price?: EventPrice;
  category?: EventCategory;
  level?: EventLevel;
}

export interface SearchEventsResponse {
  total: number;
  returned: number;
  hasMore: boolean;
  events: EventSummary[];
}

export interface ValidationErrorItem {
  field: keyof SearchEventsQuery;
  message: string;
}

export interface ValidationErrorResponse {
  error: "validation_error";
  message: string;
  fieldErrors: ValidationErrorItem[];
}

export interface ToolResult<TData> {
  ok: boolean;
  message: string;
  data?: TData;
}
