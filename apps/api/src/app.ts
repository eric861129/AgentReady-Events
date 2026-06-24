import express from "express";
import { eventFixtures } from "../../../packages/test-fixtures/src/index";
import { parseSearchEventsQuery } from "../../../packages/validation/src/index";
import { searchEvents } from "./search";

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

  return app;
}
