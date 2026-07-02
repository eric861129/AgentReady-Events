import express from "express";
import { eventFixtures } from "../../../packages/test-fixtures/src/index";
import { parseEventDetailsParams, parseSearchEventsQuery } from "../../../packages/validation/src/index";
import { getEventDetails, searchEvents } from "./search";

export function createApp(): express.Express {
  const app = express();

  app.get("/health/live", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.get("/api/events", (request, response) => {
    const parsed = parseSearchEventsQuery(request.query);
    if (!parsed.ok) {
      response.status(400).json({
        error: "validation_error",
        message: "搜尋條件無法通過驗證。",
        fieldErrors: parsed.errors
      });
      return;
    }

    response.json(searchEvents(eventFixtures, parsed.value));
  });

  app.get("/api/events/:eventId", (request, response) => {
    const parsed = parseEventDetailsParams({ event_id: request.params.eventId });
    if (!parsed.ok) {
      response.status(400).json({
        error: "validation_error",
        message: "活動詳情查詢條件不正確。",
        fieldErrors: parsed.errors
      });
      return;
    }

    const detail = getEventDetails(eventFixtures, parsed.value.event_id);
    if (!detail) {
      response.status(404).json({
        error: "not_found",
        message: "找不到符合條件的公開活動。"
      });
      return;
    }

    response.json(detail);
  });

  return app;
}
