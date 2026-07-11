import request from "supertest";
import { expect, it } from "vitest";
import { createApp } from "../../src/server/app";
import { FailurePolicy, type FailureScenario } from "../../src/server/failure/failure-policy";

const expected = {
  expired: { code: "AUTHENTICATION_REQUIRED", reason: "SESSION_EXPIRED", retryable: false },
  full: { code: "CONFLICT", reason: "EVENT_FULL", retryable: false },
  "repeat-save": { code: "SUCCESS", alreadySaved: true },
  "repeat-cancel": { code: "SUCCESS", alreadyCancelled: true },
  timeout: { code: "TEMPORARY_FAILURE", reason: "API_TIMEOUT", retryable: true },
  temporary: { code: "TEMPORARY_FAILURE", reason: "API_UNAVAILABLE", retryable: true }
} as const;

for (const scenario of Object.keys(expected) as FailureScenario[]) {
  it(`maps ${scenario} deterministically`, () => expect(new FailurePolicy(scenario).result()).toEqual(expected[scenario]));
}

it("cannot enable Failure Lab through a request header or query", async () => {
  const app = createApp();
  const response = await request(app).get("/api/events?failure=timeout").set("x-failure-scenario", "timeout");
  expect(response.status).toBe(200);
  expect(app.locals.failurePolicy).toBeUndefined();
});
