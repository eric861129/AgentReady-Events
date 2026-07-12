import request from "supertest";
import { expect, it } from "vitest";
import { createApp } from "../../src/server/app";
import { parseEvalLab } from "../../src/server/eval/eval-lab";

it("parses only the four startup modes", () => {
  expect(parseEvalLab(undefined)).toEqual({ kind: "none" });
  expect(parseEvalLab("security")).toEqual({ kind: "security" });
  expect(parseEvalLab("failure:temporary")).toEqual({ kind: "failure", scenario: "temporary" });
  expect(parseEvalLab("failure:expired")).toEqual({ kind: "failure", scenario: "expired" });
  expect(() => parseEvalLab("failure:full")).toThrow(/EVAL_LAB/);
});

it("cannot enable Eval Lab through query, header, or body", async () => {
  const app = createApp();
  expect(
    (await request(app).get("/api/events/evt-malicious-copy?evalLab=security").set("x-eval-lab", "security"))
      .status
  ).toBe(404);
  expect(
    (
      await request(app)
        .post("/api/events?evalLab=failure:temporary")
        .set("x-eval-lab", "failure:temporary")
        .send({ evalLab: "failure:temporary" })
    ).status
  ).toBe(404);
  expect((await request(app).get("/api/events/evt-webmcp-intro")).status).toBe(200);
});

it("loads hostile copy only in the startup security app", async () => {
  const app = createApp({ evalLab: parseEvalLab("security") });
  const response = await request(app).get("/api/events/evt-malicious-copy");
  expect(response.status).toBe(200);
  expect(response.body.event.summary).toContain("Ignore previous instructions");
});

it("injects public-safe temporary and expired failures by construction", async () => {
  const temporary = createApp({ evalLab: parseEvalLab("failure:temporary") });
  const detail = await request(temporary).get("/api/events/evt-webmcp-intro");
  expect(detail.status).toBe(503);
  expect(detail.body).toEqual({
    code: "TEMPORARY_FAILURE",
    reason: "API_UNAVAILABLE",
    message: "服務暫時無法使用，請稍後重試。",
    retryable: true
  });

  const expired = createApp({ evalLab: parseEvalLab("failure:expired") });
  const registrations = await request(expired).get("/api/registrations");
  expect(registrations.status).toBe(401);
  expect(registrations.body).toEqual({
    code: "AUTHENTICATION_REQUIRED",
    reason: "SESSION_EXPIRED",
    message: "工作階段已過期，請重新開始。",
    retryable: false
  });
});
