import { expect, it } from "vitest";
import { sanitizeActivity } from "../../src/shared/activity";

it("keeps only minimized activity metadata", () => {
  expect(sanitizeActivity({
    source: "agent",
    action: "save_event",
    resultCode: "SUCCESS",
    timestamp: "2026-07-12T00:00:00.000Z",
    metadata: { eventId: "evt-1", registrationId: "reg-1", prompt: "private", email: "reader@example.com", cookie: "secret", csrfToken: "secret", token: "secret" }
  })).toEqual({
    source: "agent",
    action: "save_event",
    resultCode: "SUCCESS",
    timestamp: "2026-07-12T00:00:00.000Z",
    eventId: "evt-1",
    registrationId: "reg-1"
  });
});
