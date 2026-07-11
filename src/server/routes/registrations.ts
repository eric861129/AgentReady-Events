import { Router } from "express";
import { EVENTS } from "../../shared/fixtures";
import type { RegistrationInput } from "../../shared/contracts";
import { OPAQUE_ID } from "../../shared/validation";
import { ensureSession, validCsrf } from "../session/demo-session";
import { createRegistration } from "../services/registrations";
import type { MemoryStore } from "../store/memory-store";

function parseInput(body: unknown): (RegistrationInput & { interactionMode: "human" | "agent" }) | undefined {
  if (!body || typeof body !== "object") return undefined;
  const value = body as Record<string, unknown>;
  if (typeof value.eventId !== "string" || !OPAQUE_ID.test(value.eventId)) return undefined;
  if (typeof value.attendeeName !== "string" || value.attendeeName.trim().length < 1 || value.attendeeName.trim().length > 80) return undefined;
  if (typeof value.email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.email) || value.email.length > 120) return undefined;
  if (value.interactionMode !== "human" && value.interactionMode !== "agent") return undefined;
  return { eventId: value.eventId, attendeeName: value.attendeeName.trim(), email: value.email, interactionMode: value.interactionMode };
}

export function createRegistrationsRouter(store: MemoryStore): Router {
  const router = Router();
  router.post("/", (request, response) => {
    const session = ensureSession(request, response, store);
    if (!validCsrf(session, request.get("x-csrf-token"))) return response.status(403).json({ code: "FORBIDDEN", reason: "CSRF_INVALID", message: "請重新整理後再試。" });
    const input = parseInput(request.body);
    if (!input) return response.status(400).json({ code: "VALIDATION_ERROR", reason: "INVALID_REGISTRATION_INPUT", message: "報名資料格式無效。" });
    const result = createRegistration(session, EVENTS, input);
    if (result.kind === "not-found") return response.status(404).json({ code: "NOT_FOUND", reason: "EVENT_NOT_FOUND", message: "找不到公開活動。" });
    if (result.kind === "unavailable") return response.status(409).json({ code: "CONFLICT", reason: result.reason, message: "活動目前無法報名。" });
    if (result.kind === "duplicate") return response.status(409).json({ code: "CONFLICT", reason: "DUPLICATE_REGISTRATION", message: "你已報名這場活動。" });
    return response.status(201).json({ registration: result.registration });
  });
  return router;
}
