import { Router } from "express";
import { EVENTS } from "../../shared/fixtures";
import { OPAQUE_ID } from "../../shared/validation";
import { ensureSession, validCsrf } from "../session/demo-session";
import { removeSavedEvent, saveEvent } from "../services/saved-events";
import type { MemoryStore } from "../store/memory-store";
import type { EventDetail } from "../../shared/contracts";

export function createSavedEventsRouter(store: MemoryStore, events: readonly EventDetail[] = EVENTS): Router {
  const router = Router();
  router.get("/", (request, response) => {
    const session = ensureSession(request, response, store);
    response.json({ eventIds: [...session.savedEventIds].sort() });
  });
  router.post("/", (request, response) => {
    const session = ensureSession(request, response, store);
    if (!validCsrf(session, request.get("x-csrf-token"))) return response.status(403).json({ code: "FORBIDDEN", reason: "CSRF_INVALID", message: "請重新整理後再試。" });
    const eventId = typeof request.body?.eventId === "string" ? request.body.eventId : "";
    const mode = request.body?.interactionMode;
    if (!OPAQUE_ID.test(eventId) || (mode !== "human" && mode !== "agent")) return response.status(400).json({ code: "VALIDATION_ERROR", reason: "INVALID_SAVE_INPUT", message: "收藏資料格式無效。" });
    const result = saveEvent(session, events, eventId);
    if (result.kind === "not-found") return response.status(404).json({ code: "NOT_FOUND", reason: "EVENT_NOT_FOUND", message: "找不到公開活動。" });
    return response.json({ eventId: result.eventId, alreadySaved: result.alreadySaved });
  });
  router.delete("/:eventId", (request, response) => {
    const session = ensureSession(request, response, store);
    if (!validCsrf(session, request.get("x-csrf-token"))) return response.status(403).json({ code: "FORBIDDEN", reason: "CSRF_INVALID", message: "請重新整理後再試。" });
    if (!OPAQUE_ID.test(request.params.eventId)) return response.status(400).json({ code: "VALIDATION_ERROR", reason: "INVALID_EVENT_ID", message: "活動 ID 格式無效。" });
    return response.json(removeSavedEvent(session, request.params.eventId));
  });
  return router;
}
