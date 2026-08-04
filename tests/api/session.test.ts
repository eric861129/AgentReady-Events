import request from "supertest";
import { expect, it } from "vitest";
import { createApp } from "../../src/server/app";

it("creates an opaque HttpOnly SameSite session and public CSRF summary", async () => {
  const response = await request(createApp()).get("/api/session");
  expect(response.status).toBe(200);
  expect(response.headers["set-cookie"]?.[0]).toMatch(/are_session=.*HttpOnly.*SameSite=Lax/i);
  expect(response.body.csrfToken).toMatch(/^[a-f0-9-]{36}$/);
  expect(response.body.evaluationFixturesEnabled).toBe(false);
  expect(response.body).not.toHaveProperty("sessionId");
});

it("reports whether the controlled evaluation fixture is available", async () => {
  const response = await request(createApp({ enableEvaluationFixtures: true })).get("/api/session");

  expect(response.status).toBe(200);
  expect(response.body.evaluationFixturesEnabled).toBe(true);
});

it("returns SESSION_EXPIRED instead of silently replacing an expired session", async () => {
  let currentTime = new Date("2027-02-01T00:00:00+08:00");
  const agent = request.agent(createApp({ now: () => currentTime, sessionTtlMs: 1_000 }));
  await agent.get("/api/session");

  currentTime = new Date("2027-02-01T00:00:02+08:00");
  const response = await agent.get("/api/registrations");

  expect(response.status).toBe(401);
  expect(response.body).toEqual({
    code: "AUTHENTICATION_REQUIRED",
    reason: "SESSION_EXPIRED",
    message: "工作階段已過期，請重新開始。",
    retryable: false
  });
  expect(response.headers["set-cookie"]?.[0]).toMatch(/are_session=;.*Max-Age=0/i);
});

it("keeps the current-session expiry fixture disabled unless explicitly enabled", async () => {
  const disabled = request.agent(createApp());
  const disabledToken = (await disabled.get("/api/session")).body.csrfToken as string;
  expect(
    (
      await disabled
        .post("/api/session/evaluation/expire-current")
        .set("x-csrf-token", disabledToken)
        .send({ interactionMode: "human" })
    ).status
  ).toBe(404);

  const enabled = request.agent(createApp({ enableEvaluationFixtures: true }));
  const enabledToken = (await enabled.get("/api/session")).body.csrfToken as string;
  const expired = await enabled
    .post("/api/session/evaluation/expire-current")
    .set("x-csrf-token", enabledToken)
    .send({ interactionMode: "human" });
  expect(expired.status).toBe(200);
  expect(expired.body.registration).toMatchObject({
    eventId: "evt-webmcp-intro",
    attendeeName: "RECOVERY-02 測試讀者",
    status: "active"
  });
  expect(expired.body.instruction).toContain("請勿重新整理");

  const afterExpiry = await enabled.get("/api/registrations");
  expect(afterExpiry.status).toBe(401);
  expect(afterExpiry.body.reason).toBe("SESSION_EXPIRED");
});

it("prepares exactly one visible recovery registration without consuming inventory", async () => {
  const app = createApp({ enableEvaluationFixtures: true });
  const operator = request.agent(app);
  const observer = request.agent(app);
  const token = (await operator.get("/api/session")).body.csrfToken as string;
  const before = await observer.get("/api/events/evt-webmcp-intro");

  const prepared = await operator
    .post("/api/session/evaluation/expire-current")
    .set("x-csrf-token", token)
    .send({ interactionMode: "human" });

  expect(prepared.status).toBe(200);
  expect(prepared.body.registration).toMatchObject({
    eventId: "evt-webmcp-intro",
    eventTitle: "WebMCP 入門工作坊",
    attendeeName: "RECOVERY-02 測試讀者",
    status: "active"
  });
  expect(prepared.body.registration.id).toMatch(/^reg-recovery-/);
  const after = await observer.get("/api/events/evt-webmcp-intro");
  expect(after.body.event.remainingCapacity).toBe(before.body.event.remainingCapacity);
});
