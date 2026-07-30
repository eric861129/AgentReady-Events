import request from "supertest";
import { expect, it } from "vitest";
import { createApp } from "../../src/server/app";

it("returns filtered public event summaries", async () => {
  const response = await request(createApp()).get("/api/events?location=taipei&price=free");
  expect(response.status).toBe(200);
  expect(response.body.events).toHaveLength(1);
  expect(Object.keys(response.body.events[0]).sort()).toEqual(["id", "level", "location", "price", "startsAt", "summary", "title", "url"]);
  expect(response.body.events[0].url).toBe("/events/evt-webmcp-intro");
});

it("rejects an invalid enum", async () => {
  const response = await request(createApp()).get("/api/events?price=cheap");
  expect(response.status).toBe(400);
  expect(response.body).toMatchObject({ code: "VALIDATION_ERROR", reason: "INVALID_SEARCH_QUERY" });
});

it("returns one public detail by opaque ID and a public 404", async () => {
  const found = await request(createApp({ now: () => new Date("2027-01-01T00:00:00+08:00") })).get("/api/events/evt-webmcp-intro");
  expect(found.status).toBe(200);
  expect(found.body.event).toMatchObject({ id: "evt-webmcp-intro", remainingCapacity: 8, state: "open" });
  const missing = await request(createApp()).get("/api/events/evt-missing");
  expect(missing.status).toBe(404);
  expect(missing.body).toEqual({ code: "NOT_FOUND", reason: "EVENT_NOT_FOUND", message: "找不到公開活動。" });
});

it("derives the public state from an injectable clock around the registration deadline", async () => {
  const before = await request(createApp({ now: () => new Date("2027-01-21T23:59:58+08:00") })).get(
    "/api/events/evt-webmcp-intro"
  );
  const after = await request(createApp({ now: () => new Date("2027-01-22T00:00:00+08:00") })).get(
    "/api/events/evt-webmcp-intro"
  );

  expect(before.body.event.state).toBe("open");
  expect(after.body.event.state).toBe("closed");
});
