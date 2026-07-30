import request from "supertest";
import { expect, it } from "vitest";
import { createApp } from "../../src/server/app";
import type { EventDetail } from "../../src/shared/contracts";

async function csrf(agent: ReturnType<typeof request.agent>) {
  return (await agent.get("/api/session")).body.csrfToken as string;
}

async function confirmationIntent(
  agent: ReturnType<typeof request.agent>,
  token: string,
  action: "submit_registration" | "cancel_registration",
  targetId: string
) {
  const response = await agent
    .post("/api/confirmation-intents")
    .set("x-csrf-token", token)
    .send({ action, targetId, interactionMode: "human" });
  expect(response.status).toBe(201);
  return response.body.confirmationIntent.token as string;
}

async function register(
  agent: ReturnType<typeof request.agent>,
  token: string,
  eventId = "evt-webmcp-intro"
) {
  const intentToken = await confirmationIntent(agent, token, "submit_registration", eventId);
  return agent
    .post("/api/registrations")
    .set("x-csrf-token", token)
    .send({
      eventId,
      attendeeName: "王小明",
      email: "reader@example.com",
      interactionMode: "human",
      confirmationIntent: intentToken
    });
}

it("requires CSRF and validates event state", async () => {
  const agent = request.agent(createApp());
  const token = await csrf(agent);
  const input = {
    eventId: "evt-webmcp-intro",
    attendeeName: "王小明",
    email: "reader@example.com",
    interactionMode: "human"
  };
  expect((await agent.post("/api/registrations").send(input)).status).toBe(403);
  const fullIntent = await confirmationIntent(agent, token, "submit_registration", "evt-semantic-html");
  expect(
    (
      await agent
        .post("/api/registrations")
        .set("x-csrf-token", token)
        .send({ ...input, eventId: "evt-semantic-html", confirmationIntent: fullIntent })
    ).status
  ).toBe(409);
});

it("requires a server-issued confirmation intent and consumes it once", async () => {
  const agent = request.agent(createApp());
  const token = await csrf(agent);
  const input = {
    eventId: "evt-webmcp-intro",
    attendeeName: "王小明",
    email: "reader@example.com",
    interactionMode: "human"
  };
  const missing = await agent.post("/api/registrations").set("x-csrf-token", token).send(input);
  expect(missing.status).toBe(403);
  expect(missing.body.reason).toBe("CONFIRMATION_INTENT_REQUIRED");

  const intentToken = await confirmationIntent(agent, token, "submit_registration", input.eventId);
  const first = await agent
    .post("/api/registrations")
    .set("x-csrf-token", token)
    .send({ ...input, confirmationIntent: intentToken });
  expect(first.status).toBe(201);
  expect(first.body.registration).toMatchObject({ eventId: "evt-webmcp-intro", status: "active", attendeeName: "王小明" });
  expect(JSON.stringify(first.body)).not.toContain("reader@example.com");

  const reused = await agent
    .post("/api/registrations")
    .set("x-csrf-token", token)
    .send({ ...input, confirmationIntent: intentToken });
  expect(reused.status).toBe(403);
  expect(reused.body.reason).toBe("CONFIRMATION_INTENT_INVALID");
});

it("decrements inventory on registration and restores it exactly once on cancellation", async () => {
  const app = createApp();
  const owner = request.agent(app);
  const stranger = request.agent(app);
  const ownerToken = await csrf(owner);
  const strangerToken = await csrf(stranger);
  const created = await register(owner, ownerToken);
  const id = created.body.registration.id as string;
  expect((await owner.get("/api/events/evt-webmcp-intro")).body.event.remainingCapacity).toBe(7);
  expect((await owner.get("/api/registrations")).body.registrations).toHaveLength(1);
  expect((await stranger.get("/api/registrations")).body.registrations).toEqual([]);
  expect(
    (
      await stranger
        .post("/api/confirmation-intents")
        .set("x-csrf-token", strangerToken)
        .send({ action: "cancel_registration", targetId: id, interactionMode: "human" })
    ).status
  ).toBe(404);

  const firstIntent = await confirmationIntent(owner, ownerToken, "cancel_registration", id);
  const first = await owner
    .post(`/api/registrations/${id}/cancel`)
    .set("x-csrf-token", ownerToken)
    .send({ interactionMode: "human", confirmationIntent: firstIntent });
  expect(first.body).toMatchObject({ registrationId: id, alreadyCancelled: false });
  expect((await owner.get("/api/events/evt-webmcp-intro")).body.event.remainingCapacity).toBe(8);

  const repeatIntent = await confirmationIntent(owner, ownerToken, "cancel_registration", id);
  const repeat = await owner
    .post(`/api/registrations/${id}/cancel`)
    .set("x-csrf-token", ownerToken)
    .send({ interactionMode: "human", confirmationIntent: repeatIntent });
  expect(repeat.body.alreadyCancelled).toBe(true);
  expect((await owner.get("/api/events/evt-webmcp-intro")).body.event.remainingCapacity).toBe(8);
});

it("allows only one of two sessions to reserve the final seat", async () => {
  const finalSeatEvent: EventDetail = {
    id: "evt-final-seat",
    title: "最後一席測試活動",
    summary: "驗證伺服器端名額競爭。",
    startsAt: "2027-03-01T10:00:00+08:00",
    endsAt: "2027-03-01T12:00:00+08:00",
    location: "taipei",
    venue: "台北測試場地",
    price: "free",
    level: "beginner",
    remainingCapacity: 1,
    registrationDeadline: "2027-02-28T23:59:59+08:00",
    state: "open"
  };
  const app = createApp({ events: [finalSeatEvent], now: () => new Date("2027-02-01T00:00:00+08:00") });
  const firstAgent = request.agent(app);
  const secondAgent = request.agent(app);
  const firstToken = await csrf(firstAgent);
  const secondToken = await csrf(secondAgent);
  const [first, second] = await Promise.all([
    register(firstAgent, firstToken, finalSeatEvent.id),
    register(secondAgent, secondToken, finalSeatEvent.id)
  ]);

  expect([first.status, second.status].sort()).toEqual([201, 409]);
  expect((await request(app).get(`/api/events/${finalSeatEvent.id}`)).body.event).toMatchObject({
    remainingCapacity: 0,
    state: "full"
  });
});

it("rejects expired and mismatched confirmation intents", async () => {
  let currentTime = new Date("2027-02-01T00:00:00+08:00");
  const app = createApp({ now: () => currentTime });
  const agent = request.agent(app);
  const token = await csrf(agent);
  const intentToken = await confirmationIntent(agent, token, "submit_registration", "evt-webmcp-intro");

  const mismatch = await agent
    .post("/api/registrations")
    .set("x-csrf-token", token)
    .send({
      eventId: "evt-agent-testing",
      attendeeName: "王小明",
      email: "reader@example.com",
      interactionMode: "human",
      confirmationIntent: intentToken
    });
  expect(mismatch.status).toBe(403);
  expect(mismatch.body.reason).toBe("CONFIRMATION_INTENT_INVALID");

  const expiringIntent = await confirmationIntent(agent, token, "submit_registration", "evt-webmcp-intro");
  currentTime = new Date("2027-02-01T00:06:00+08:00");
  const expired = await agent
    .post("/api/registrations")
    .set("x-csrf-token", token)
    .send({
      eventId: "evt-webmcp-intro",
      attendeeName: "王小明",
      email: "reader@example.com",
      interactionMode: "human",
      confirmationIntent: expiringIntent
    });
  expect(expired.status).toBe(403);
  expect(expired.body.reason).toBe("CONFIRMATION_INTENT_INVALID");
});

it("rejects final registration after the server-side deadline", async () => {
  const app = createApp({ now: () => new Date("2027-01-22T00:00:00+08:00") });
  const agent = request.agent(app);
  const token = await csrf(agent);
  const response = await register(agent, token);

  expect(response.status).toBe(409);
  expect(response.body.reason).toBe("EVENT_NOT_OPEN");
  expect((await agent.get("/api/events/evt-webmcp-intro")).body.event).toMatchObject({
    remainingCapacity: 8,
    state: "closed"
  });
});
