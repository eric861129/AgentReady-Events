import { Router } from "express";
import { EVENTS } from "../../shared/fixtures";
import { OPAQUE_ID, parseSearchQuery } from "../../shared/validation";
import { findPublicEvent, searchEvents } from "../services/events";

export function createEventsRouter(): Router {
  const router = Router();
  router.get("/", (request, response) => {
    const query = parseSearchQuery(request.query);
    if (!query) return response.status(400).json({ code: "VALIDATION_ERROR", reason: "INVALID_SEARCH_QUERY", message: "搜尋條件格式無效。" });
    return response.json({ events: searchEvents(EVENTS, query) });
  });
  router.get("/:eventId", (request, response) => {
    if (!OPAQUE_ID.test(request.params.eventId)) return response.status(400).json({ code: "VALIDATION_ERROR", reason: "INVALID_EVENT_ID", message: "活動 ID 格式無效。" });
    const event = findPublicEvent(EVENTS, request.params.eventId);
    if (!event) return response.status(404).json({ code: "NOT_FOUND", reason: "EVENT_NOT_FOUND", message: "找不到公開活動。" });
    return response.json({ event });
  });
  return router;
}
