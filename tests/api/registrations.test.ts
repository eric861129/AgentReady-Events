import request from "supertest";
import { expect, it } from "vitest";
import { createApp } from "../../src/server/app";

async function csrf(agent: ReturnType<typeof request.agent>) {
  return (await agent.get("/api/session")).body.csrfToken as string;
}

it("requires CSRF and validates event state", async () => {
  const agent = request.agent(createApp());
  const token = await csrf(agent);
  const input = { eventId: "evt-webmcp-intro", attendeeName: "王小明", email: "reader@example.com", interactionMode: "human" };
  expect((await agent.post("/api/registrations").send(input)).status).toBe(403);
  expect((await agent.post("/api/registrations").set("x-csrf-token", token).send({ ...input, eventId: "evt-semantic-html" })).status).toBe(409);
});

it("creates one owned registration without persisting or returning email", async () => {
  const agent = request.agent(createApp());
  const token = await csrf(agent);
  const input = { eventId: "evt-webmcp-intro", attendeeName: "王小明", email: "reader@example.com", interactionMode: "human" };
  const first = await agent.post("/api/registrations").set("x-csrf-token", token).send(input);
  expect(first.status).toBe(201);
  expect(first.body.registration).toMatchObject({ eventId: "evt-webmcp-intro", status: "active", attendeeName: "王小明" });
  expect(JSON.stringify(first.body)).not.toContain("reader@example.com");
  const duplicate = await agent.post("/api/registrations").set("x-csrf-token", token).send(input);
  expect(duplicate.status).toBe(409);
  expect(duplicate.body.reason).toBe("DUPLICATE_REGISTRATION");
});
