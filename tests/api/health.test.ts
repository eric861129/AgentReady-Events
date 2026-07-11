import request from "supertest";
import { expect, it } from "vitest";
import { createApp } from "../../src/server/app";

it("exposes a public liveness endpoint", async () => {
  const response = await request(createApp()).get("/health/live");
  expect(response.status).toBe(200);
  expect(response.body).toEqual({ status: "ok" });
});
