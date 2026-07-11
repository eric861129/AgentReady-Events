import request from "supertest";
import { expect, it } from "vitest";
import { createApp } from "../../src/server/app";

async function session(agent: ReturnType<typeof request.agent>) {
  return (await agent.get("/api/session")).body.csrfToken as string;
}

it("requires CSRF, validates event, and saves idempotently", async () => {
  const agent = request.agent(createApp());
  const csrf = await session(agent);
  expect((await agent.post("/api/saved-events").send({ eventId: "evt-webmcp-intro", interactionMode: "human" })).status).toBe(403);
  expect((await agent.post("/api/saved-events").set("x-csrf-token", csrf).send({ eventId: "evt-missing", interactionMode: "human" })).status).toBe(404);
  const first = await agent.post("/api/saved-events").set("x-csrf-token", csrf).send({ eventId: "evt-webmcp-intro", interactionMode: "agent" });
  expect(first.status).toBe(200);
  expect(first.body).toMatchObject({ eventId: "evt-webmcp-intro", alreadySaved: false });
  const repeat = await agent.post("/api/saved-events").set("x-csrf-token", csrf).send({ eventId: "evt-webmcp-intro", interactionMode: "human" });
  expect(repeat.body.alreadySaved).toBe(true);
});

it("isolates saved events by Session and supports owned Undo", async () => {
  const app = createApp();
  const owner = request.agent(app);
  const stranger = request.agent(app);
  const ownerCsrf = await session(owner);
  await session(stranger);
  await owner.post("/api/saved-events").set("x-csrf-token", ownerCsrf).send({ eventId: "evt-webmcp-intro", interactionMode: "human" });
  expect((await owner.get("/api/saved-events")).body.eventIds).toEqual(["evt-webmcp-intro"]);
  expect((await stranger.get("/api/saved-events")).body.eventIds).toEqual([]);
  const undone = await owner.delete("/api/saved-events/evt-webmcp-intro").set("x-csrf-token", ownerCsrf);
  expect(undone.status).toBe(200);
  expect((await owner.get("/api/saved-events")).body.eventIds).toEqual([]);
});
