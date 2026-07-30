import { Router } from "express";
import { OPAQUE_ID } from "../../shared/validation";
import { ensureSession, validCsrf } from "../session/demo-session";
import type { ConfirmationAction, MemoryStore } from "../store/memory-store";

function parseInput(body: unknown): { action: ConfirmationAction; targetId: string } | undefined {
  if (!body || typeof body !== "object") return undefined;
  const value = body as Record<string, unknown>;
  if (value.action !== "submit_registration" && value.action !== "cancel_registration") return undefined;
  if (typeof value.targetId !== "string" || !OPAQUE_ID.test(value.targetId)) return undefined;
  if (value.interactionMode !== "human") return undefined;
  return { action: value.action, targetId: value.targetId };
}

export function createConfirmationIntentsRouter(store: MemoryStore): Router {
  const router = Router();
  router.post("/", (request, response) => {
    const session = ensureSession(request, response, store);
    if (!validCsrf(session, request.get("x-csrf-token"))) {
      return response.status(403).json({
        code: "FORBIDDEN",
        reason: "CSRF_INVALID",
        message: "請重新整理後再試。"
      });
    }

    const input = parseInput(request.body);
    if (!input) {
      return response.status(400).json({
        code: "VALIDATION_ERROR",
        reason: "INVALID_CONFIRMATION_INTENT_INPUT",
        message: "確認意圖格式無效。"
      });
    }

    const targetExists =
      input.action === "submit_registration"
        ? store.inventory.find(input.targetId) !== undefined
        : session.registrations.has(input.targetId);
    if (!targetExists) {
      return response.status(404).json({
        code: "NOT_FOUND",
        reason: input.action === "submit_registration" ? "EVENT_NOT_FOUND" : "REGISTRATION_NOT_FOUND",
        message: input.action === "submit_registration" ? "找不到公開活動。" : "找不到可取消的報名。"
      });
    }

    return response.status(201).json({
      confirmationIntent: store.createConfirmationIntent(session, input.action, input.targetId)
    });
  });
  return router;
}
