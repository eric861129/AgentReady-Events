import { Router } from "express";
import { EVENTS } from "../../shared/fixtures";
import type { RegistrationInput } from "../../shared/contracts";
import { OPAQUE_ID } from "../../shared/validation";
import { ensureSession, validCsrf } from "../session/demo-session";
import { cancelRegistration, cancellationSummary, createRegistration, listRegistrations } from "../services/registrations";
import type { MemoryStore } from "../store/memory-store";
import type { EventDetail } from "../../shared/contracts";
import type { FailurePolicy } from "../failure/failure-policy";

function parseInput(body: unknown): (RegistrationInput & { interactionMode: "human" | "agent" }) | undefined {
  if (!body || typeof body !== "object") return undefined;
  const value = body as Record<string, unknown>;
  if (typeof value.eventId !== "string" || !OPAQUE_ID.test(value.eventId)) return undefined;
  if (typeof value.attendeeName !== "string" || value.attendeeName.trim().length < 1 || value.attendeeName.trim().length > 80) return undefined;
  if (typeof value.email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.email) || value.email.length > 120) return undefined;
  if (value.interactionMode !== "human" && value.interactionMode !== "agent") return undefined;
  return { eventId: value.eventId, attendeeName: value.attendeeName.trim(), email: value.email, interactionMode: value.interactionMode };
}

export function createRegistrationsRouter(
  store: MemoryStore,
  events: readonly EventDetail[] = EVENTS,
  failurePolicy?: FailurePolicy
): Router {
  const router = Router();
  router.get("/", (request, response) => {
    const failure = failurePolicy?.result();
    if (failure?.code === "AUTHENTICATION_REQUIRED") {
      return response.status(401).json({
        code: failure.code,
        reason: failure.reason,
        message: "工作階段已過期，請重新開始。",
        retryable: false
      });
    }
    const session = ensureSession(request, response, store);
    response.json({ registrations: listRegistrations(session) });
  });
  router.get("/:registrationId/cancellation-summary", (request, response) => {
    const failure = failurePolicy?.result();
    if (failure?.code === "AUTHENTICATION_REQUIRED") {
      return response.status(401).json({
        code: failure.code,
        reason: failure.reason,
        message: "工作階段已過期，請重新開始。",
        retryable: false
      });
    }
    if (failure?.code === "TEMPORARY_FAILURE") {
      return response.status(503).json({
        code: failure.code,
        reason: failure.reason,
        message: "服務暫時無法使用，請稍後重試。",
        retryable: true
      });
    }
    const session = ensureSession(request, response, store);
    if (!OPAQUE_ID.test(request.params.registrationId)) return response.status(400).json({ code: "VALIDATION_ERROR", reason: "INVALID_REGISTRATION_ID", message: "報名 ID 格式無效。" });
    const summary = cancellationSummary(session, request.params.registrationId);
    if (!summary) return response.status(404).json({ code: "NOT_FOUND", reason: "REGISTRATION_NOT_FOUND", message: "找不到可取消的報名。" });
    return response.json({ summary });
  });
  router.post("/:registrationId/cancel", (request, response) => {
    const session = ensureSession(request, response, store);
    if (!validCsrf(session, request.get("x-csrf-token"))) return response.status(403).json({ code: "FORBIDDEN", reason: "CSRF_INVALID", message: "請重新整理後再試。" });
    if (!OPAQUE_ID.test(request.params.registrationId)) return response.status(400).json({ code: "VALIDATION_ERROR", reason: "INVALID_REGISTRATION_ID", message: "報名 ID 格式無效。" });
    if (request.body?.interactionMode !== "human" && request.body?.interactionMode !== "agent") return response.status(400).json({ code: "VALIDATION_ERROR", reason: "INVALID_INTERACTION_MODE", message: "互動來源格式無效。" });
    if (request.body.interactionMode !== "human") return response.status(403).json({ code: "FORBIDDEN", reason: "HUMAN_CONFIRMATION_REQUIRED", message: "請由使用者在可見介面確認。" });
    const result = cancelRegistration(session, request.params.registrationId);
    if (result.kind === "not-found") return response.status(404).json({ code: "NOT_FOUND", reason: "REGISTRATION_NOT_FOUND", message: "找不到可取消的報名。" });
    return response.json({ registrationId: result.registrationId, alreadyCancelled: result.alreadyCancelled });
  });
  router.post("/", (request, response) => {
    const session = ensureSession(request, response, store);
    if (!validCsrf(session, request.get("x-csrf-token"))) return response.status(403).json({ code: "FORBIDDEN", reason: "CSRF_INVALID", message: "請重新整理後再試。" });
    const input = parseInput(request.body);
    if (!input) return response.status(400).json({ code: "VALIDATION_ERROR", reason: "INVALID_REGISTRATION_INPUT", message: "報名資料格式無效。" });
    if (input.interactionMode !== "human") return response.status(403).json({ code: "FORBIDDEN", reason: "HUMAN_CONFIRMATION_REQUIRED", message: "請由使用者在可見介面確認。" });
    const result = createRegistration(session, events, input);
    if (result.kind === "not-found") return response.status(404).json({ code: "NOT_FOUND", reason: "EVENT_NOT_FOUND", message: "找不到公開活動。" });
    if (result.kind === "unavailable") return response.status(409).json({ code: "CONFLICT", reason: result.reason, message: "活動目前無法報名。" });
    if (result.kind === "duplicate") return response.status(409).json({ code: "CONFLICT", reason: "DUPLICATE_REGISTRATION", message: "你已報名這場活動。" });
    return response.status(201).json({ registration: result.registration });
  });
  return router;
}
