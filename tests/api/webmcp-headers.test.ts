import request from "supertest";
import { expect, it } from "vitest";
import { createApp } from "../../src/server/app";

it("declares the WebMCP origin-isolation and same-origin tool policy", async () => {
  const response = await request(createApp()).get("/health/live");

  expect(response.headers["origin-agent-cluster"]).toBe("?1");
  expect(response.headers["permissions-policy"]).toBe("tools=(self)");
});
