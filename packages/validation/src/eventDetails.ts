import type { ValidationErrorItem } from "../../contracts/src/index";

type ParseResult =
  | { ok: true; value: { event_id: string } }
  | { ok: false; errors: ValidationErrorItem[] };

export function parseEventDetailsParams(input: { event_id?: unknown }): ParseResult {
  const eventId = typeof input.event_id === "string" ? input.event_id.trim() : "";

  if (!eventId) {
    return {
      ok: false,
      errors: [{ field: "event_id", message: "活動識別碼為必填。" }]
    };
  }

  if (eventId.length > 64) {
    return {
      ok: false,
      errors: [{ field: "event_id", message: "活動識別碼長度不可超過 64 個字元。" }]
    };
  }

  if (/^https?:\/\//i.test(eventId) || /['";\s]/.test(eventId)) {
    return {
      ok: false,
      errors: [{ field: "event_id", message: "活動識別碼格式不正確。" }]
    };
  }

  return { ok: true, value: { event_id: eventId } };
}
