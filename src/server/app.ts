import express, { type Express } from "express";
import { createEventsRouter } from "./routes/events";

export function createApp(): Express {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "16kb" }));
  app.get("/health/live", (_request, response) => response.json({ status: "ok" }));
  app.use("/api/events", createEventsRouter());
  return app;
}
