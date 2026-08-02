import { Router } from "express";
import { ensureSession, validCsrf } from "../session/demo-session";
import type { MemoryStore } from "../store/memory-store";

export function createSessionRouter(
  store: MemoryStore,
  options: { enableEvaluationFixtures?: boolean } = {}
): Router {
  const router = Router();
  router.get("/", (request, response) => {
    const session = ensureSession(request, response, store);
    response.json({ csrfToken: session.csrfToken });
  });
  router.post("/evaluation/expire-current", (request, response) => {
    if (!options.enableEvaluationFixtures) {
      return response.status(404).json({ code: "NOT_FOUND", reason: "API_ROUTE_NOT_FOUND", message: "找不到 API。" });
    }
    const session = ensureSession(request, response, store);
    if (!validCsrf(session, request.get("x-csrf-token"))) {
      return response.status(403).json({ code: "FORBIDDEN", reason: "CSRF_INVALID", message: "請重新整理後再試。" });
    }
    if (request.body?.interactionMode !== "human") {
      return response.status(403).json({ code: "FORBIDDEN", reason: "HUMAN_CONFIRMATION_REQUIRED", message: "請由使用者在受控測試介面啟用。" });
    }
    store.expireSession(session);
    return response.status(204).end();
  });
  return router;
}
