import express, { type Express } from "express";
import type { EventDetail } from "../shared/contracts";
import { EVENTS } from "../shared/fixtures";
import { createConfirmationIntentsRouter } from "./routes/confirmation-intents";
import { createEventsRouter } from "./routes/events";
import { createSavedEventsRouter } from "./routes/saved-events";
import { createSessionRouter } from "./routes/session";
import { createRegistrationsRouter } from "./routes/registrations";
import { MemoryStore } from "./store/memory-store";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { FailurePolicy } from "./failure/failure-policy";
import { SessionExpiredError } from "./session/demo-session";

export function createApp(options: {
  failurePolicy?: FailurePolicy;
  events?: EventDetail[];
  now?: () => Date;
  sessionTtlMs?: number;
  enableEvaluationFixtures?: boolean;
} = {}): Express {
  const app = express();
  app.locals.failurePolicy = options.failurePolicy;
  const store = new MemoryStore(options.events ?? EVENTS, options.now ?? (() => new Date()), options.sessionTtlMs);
  app.disable("x-powered-by");
  app.use((_request, response, next) => {
    response.setHeader("Origin-Agent-Cluster", "?1");
    response.setHeader("Permissions-Policy", "tools=(self)");
    next();
  });
  app.use(express.json({ limit: "16kb" }));
  app.get("/health/live", (_request, response) => response.json({ status: "ok" }));
  app.get("/health/version", (_request, response) => response.json({
    commit: process.env.APP_COMMIT ?? "development",
    version: process.env.APP_VERSION ?? "development",
    revision: process.env.CONTAINER_APP_REVISION ?? "local"
  }));
  app.use("/api/events", createEventsRouter(store));
  app.use("/api/session", createSessionRouter(store, {
    enableEvaluationFixtures:
      options.enableEvaluationFixtures ?? process.env.ENABLE_EVALUATION_FIXTURES === "true"
  }));
  app.use("/api/confirmation-intents", createConfirmationIntentsRouter(store));
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
    if (error instanceof SessionExpiredError) {
      return response.status(401).json({
        code: "AUTHENTICATION_REQUIRED",
        reason: "SESSION_EXPIRED",
        message: "工作階段已過期，請重新開始。",
        retryable: false
      });
    }
    if (error instanceof SyntaxError) return response.status(400).json({ code: "VALIDATION_ERROR", reason: "MALFORMED_JSON", message: "JSON 格式無效。" });
    return next(error);
  });
  return app;
}
