import { expect, it, vi } from "vitest";
import { prepareRegistration, submitRegistration } from "../../src/client/services/registration-actions";

it("prepares visible fields and returns confirmation without POST", async () => {
  const fields = { eventId: { value: "" }, attendeeName: { value: "" }, email: { value: "" } };
  const post = vi.fn();
  const result = prepareRegistration(fields, { eventId: "evt-webmcp-intro", attendeeName: "王小明", email: "reader@example.com" });
  expect(result).toMatchObject({ code: "CONFIRMATION_REQUIRED" });
  expect(fields.attendeeName.value).toBe("王小明");
  expect(post).not.toHaveBeenCalled();
});

it("rejects Agent context for final submit", async () => {
  const post = vi.fn();
  await expect(submitRegistration(post, { eventId: "evt-webmcp-intro", attendeeName: "王小明", email: "reader@example.com" }, { mode: "agent" })).rejects.toThrow("human confirmation");
  expect(post).not.toHaveBeenCalled();
});
