import request from "supertest";
import { expect, it } from "vitest";
import { createApp } from "../../src/server/app";

it("rejects forged Agent finalization, missing CSRF, expired session and malformed JSON safely", async () => {
  const agent = request.agent(createApp());
  const session = await agent.get("/api/session");
  const token = session.body.csrfToken as string;
  const input = { eventId: "evt-webmcp-intro", attendeeName: "王小明", email: "reader@example.com", interactionMode: "agent" };
  const forged = await agent.post("/api/registrations").set("x-csrf-token", token).send(input);
  expect(forged.status).toBe(403);
  expect(forged.body.reason).toBe("HUMAN_CONFIRMATION_REQUIRED");
  expect((await agent.post("/api/registrations").send({ ...input, interactionMode: "human" })).body.reason).toBe("CSRF_INVALID");
  const expired = await request(createApp()).post("/api/registrations").set("Cookie", "are_session=expired").set("x-csrf-token", token).send({ ...input, interactionMode: "human" });
  expect(expired.body.reason).toBe("CSRF_INVALID");
  const malformed = await request(createApp()).post("/api/registrations").set("Content-Type", "application/json").send('{"broken"');
  expect(malformed.body).toEqual({ code: "VALIDATION_ERROR", reason: "MALFORMED_JSON", message: "JSON 格式無效。" });
  expect(JSON.stringify([forged.body, malformed.body])).not.toMatch(/stack|\/Users\/|csrfToken/i);
});

it("does not reveal or mutate a foreign registration", async () => {
  const app = createApp(); const owner = request.agent(app); const stranger = request.agent(app);
  const ownerToken = (await owner.get("/api/session")).body.csrfToken as string;
  const strangerToken = (await stranger.get("/api/session")).body.csrfToken as string;
  const created = await owner.post("/api/registrations").set("x-csrf-token", ownerToken).send({ eventId: "evt-webmcp-intro", attendeeName: "王小明", email: "reader@example.com", interactionMode: "human" });
  const response = await stranger.post(`/api/registrations/${created.body.registration.id}/cancel`).set("x-csrf-token", strangerToken).send({ interactionMode: "human" });
  expect(response.status).toBe(404);
  expect(response.body.reason).toBe("REGISTRATION_NOT_FOUND");
});
