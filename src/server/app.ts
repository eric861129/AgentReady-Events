import express, { type Express } from "express";
import { createEventsRouter } from "./routes/events";
import { createSavedEventsRouter } from "./routes/saved-events";
import { createSessionRouter } from "./routes/session";
import { createRegistrationsRouter } from "./routes/registrations";
import { MemoryStore } from "./store/memory-store";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { FailurePolicy } from "./failure/failure-policy";

export function createApp(options: { failurePolicy?: FailurePolicy } = {}): Express {
  const app = express();
  app.locals.failurePolicy = options.failurePolicy;
  const store = new MemoryStore();
  app.disable("x-powered-by");
  app.use((_request, response, next) => {
    response.setHeader("Origin-Agent-Cluster", "?1");
    response.setHeader("Permissions-Policy", "tools=(self)");
    next();
  });
  app.use(express.json({ limit: "16kb" }));
  app.get("/health/live", (_request, response) => response.json({ status: "ok" }));
  app.use("/api/events", createEventsRouter());
  app.use("/api/session", createSessionRouter(store));
  app.use("/api/saved-events", createSavedEventsRouter(store));
  app.use("/api/registrations", createRegistrationsRouter(store));
  app.use("/api", (_request, response) => response.status(404).json({ code: "NOT_FOUND", reason: "API_ROUTE_NOT_FOUND", message: "找不到 API。" }));
  if (process.env.NODE_ENV === "production") {
    const client = resolve("dist");
    if (existsSync(client)) {
      app.use(express.static(client));
      app.get("*", (_request, response) => response.sendFile(resolve(client, "index.html")));
    }
  }
  app.use((error: unknown, _request: express.Request, response: express.Response, next: express.NextFunction) => {
    if (error instanceof SyntaxError) return response.status(400).json({ code: "VALIDATION_ERROR", reason: "MALFORMED_JSON", message: "JSON 格式無效。" });
    return next(error);
  });
  return app;
}
