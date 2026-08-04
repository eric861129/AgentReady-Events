import { randomUUID } from "node:crypto";
import { Router } from "express";
import type { RegistrationListItem } from "../../shared/contracts";
import { ensureSession, validCsrf } from "../session/demo-session";
import type { DemoSession, MemoryStore } from "../store/memory-store";

function prepareRecoveryRegistration(store: MemoryStore, session: DemoSession): RegistrationListItem | undefined {
  for (const registration of session.registrations.values()) {
    if (registration.status === "active") store.inventory.release(registration.eventId);
  }
  session.registrations.clear();

  const event = store.inventory.find("evt-webmcp-intro") ?? store.inventory.list()[0];
  if (!event) return undefined;
  const registration: RegistrationListItem = {
    id: `reg-recovery-${randomUUID()}`,
    eventId: event.id,
    eventTitle: event.title,
    startsAt: event.startsAt,
    attendeeName: "RECOVERY-02 測試讀者",
    status: "active"
  };
  session.registrations.set(registration.id, registration);
  return registration;
}

export function createSessionRouter(
  store: MemoryStore,
  options: { enableEvaluationFixtures?: boolean } = {}
): Router {
  const router = Router();
  const evaluationFixturesEnabled = options.enableEvaluationFixtures === true;
  router.get("/", (request, response) => {
    const session = ensureSession(request, response, store);
    response.json({
      csrfToken: session.csrfToken,
      evaluationFixturesEnabled
    });
  });
  router.post("/evaluation/expire-current", (request, response) => {
    if (!evaluationFixturesEnabled) {
      return response.status(404).json({ code: "NOT_FOUND", reason: "API_ROUTE_NOT_FOUND", message: "找不到 API。" });
    }
    const session = ensureSession(request, response, store);
    if (!validCsrf(session, request.get("x-csrf-token"))) {
      return response.status(403).json({ code: "FORBIDDEN", reason: "CSRF_INVALID", message: "請重新整理後再試。" });
    }
    if (request.body?.interactionMode !== "human") {
      return response.status(403).json({ code: "FORBIDDEN", reason: "HUMAN_CONFIRMATION_REQUIRED", message: "請由使用者在受控測試介面啟用。" });
    }
    const registration = prepareRecoveryRegistration(store, session);
    if (!registration) {
      return response.status(409).json({
        code: "CONFLICT",
        reason: "EVALUATION_FIXTURE_UNAVAILABLE",
        message: "沒有可用的公開活動可建立測試狀態。"
      });
    }
    store.expireSession(session);
    return response.json({
      registration,
      instruction: "RECOVERY-02 已就緒。請勿重新整理，直接在 Inspector 執行取消準備。"
    });
  });
  return router;
}
