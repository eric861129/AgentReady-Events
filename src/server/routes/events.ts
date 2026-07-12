import { Router } from "express";
import { EVENTS } from "../../shared/fixtures";
import { OPAQUE_ID, parseSearchQuery } from "../../shared/validation";
import { findPublicEvent, searchEvents } from "../services/events";
import type { EventDetail } from "../../shared/contracts";
import type { FailurePolicy } from "../failure/failure-policy";

export function createEventsRouter(
  events: readonly EventDetail[] = EVENTS,
  failurePolicy?: FailurePolicy
): Router {
  const router = Router();
  router.get("/", (request, response) => {
    const query = parseSearchQuery(request.query);
    if (!query) return response.status(400).json({ code: "VALIDATION_ERROR", reason: "INVALID_SEARCH_QUERY", message: "搜尋條件格式無效。" });
    return response.json({ events: searchEvents(events, query) });
  });
  router.get("/:eventId", (request, response) => {
    if (!OPAQUE_ID.test(request.params.eventId)) return response.status(400).json({ code: "VALIDATION_ERROR", reason: "INVALID_EVENT_ID", message: "活動 ID 格式無效。" });
    const failure = failurePolicy?.result();
    if (failure?.code === "TEMPORARY_FAILURE") {
      return response.status(503).json({
        code: failure.code,
        reason: failure.reason,
        message: "服務暫時無法使用，請稍後重試。",
        retryable: true
      });
    }
    const event = findPublicEvent(events, request.params.eventId);
    if (!event) return response.status(404).json({ code: "NOT_FOUND", reason: "EVENT_NOT_FOUND", message: "找不到公開活動。" });
    return response.json({ event });
  });
  return router;
}
