import express, { type Express } from "express";
import { createEventsRouter } from "./routes/events";
import { createSavedEventsRouter } from "./routes/saved-events";
import { createSessionRouter } from "./routes/session";
import { createRegistrationsRouter } from "./routes/registrations";
import { MemoryStore } from "./store/memory-store";

export function createApp(): Express {
  const app = express();
  const store = new MemoryStore();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "16kb" }));
  app.get("/health/live", (_request, response) => response.json({ status: "ok" }));
  app.use("/api/events", createEventsRouter());
  app.use("/api/session", createSessionRouter(store));
  app.use("/api/saved-events", createSavedEventsRouter(store));
  app.use("/api/registrations", createRegistrationsRouter(store));
  return app;
}
