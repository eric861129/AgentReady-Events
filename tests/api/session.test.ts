import request from "supertest";
import { expect, it } from "vitest";
import { createApp } from "../../src/server/app";

it("creates an opaque HttpOnly SameSite session and public CSRF summary", async () => {
  const response = await request(createApp()).get("/api/session");
  expect(response.status).toBe(200);
  expect(response.headers["set-cookie"]?.[0]).toMatch(/are_session=.*HttpOnly.*SameSite=Lax/i);
  expect(response.body.csrfToken).toMatch(/^[a-f0-9-]{36}$/);
  expect(response.body).not.toHaveProperty("sessionId");
});
