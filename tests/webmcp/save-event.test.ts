import { expect, it, vi } from "vitest";
import { ApiClientError } from "../../src/client/api/client";
import { createSaveEventTool } from "../../src/client/webmcp/tools/save-event";

it("binds save to the currently displayed event and updates visible state", async () => {
  const save = vi.fn().mockResolvedValue({ eventId: "evt-webmcp-intro", alreadySaved: false });
  const show = vi.fn();
  const tool = createSaveEventTool({ getCurrentEventId: () => "evt-webmcp-intro", save, show, getStateVersion: () => 3 });
  await expect(tool.execute({ event_id: "evt-webmcp-intro" })).resolves.toMatchObject({ ok: true, data: { eventId: "evt-webmcp-intro" }, uiUpdated: true });
  expect(save).toHaveBeenCalledWith("evt-webmcp-intro", { mode: "agent" });
  expect(show).toHaveBeenCalledOnce();
  await expect(tool.execute({ event_id: "evt-agent-testing" })).resolves.toMatchObject({ ok: false, code: "CONFLICT", reason: "STALE_EVENT_TARGET" });
});

it("validates input and maps forbidden, temporary, and aborted execution", async () => {
  const base = { getCurrentEventId: () => "evt-webmcp-intro", show: vi.fn(), getStateVersion: () => 3 };
  const save = vi.fn();
  const tool = createSaveEventTool({ ...base, save });
  await expect(tool.execute({} as { event_id: string })).resolves.toMatchObject({ code: "INVALID_INPUT" });
  await expect(tool.execute({ event_id: "../../secret" })).resolves.toMatchObject({ code: "INVALID_INPUT", retryable: false });
  expect(save).not.toHaveBeenCalled();
  const forbidden = createSaveEventTool({ ...base, save: vi.fn().mockRejectedValue(new ApiClientError(403, "csrfToken=private")) });
  const forbiddenResult = await forbidden.execute({ event_id: "evt-webmcp-intro" });
  expect(forbiddenResult).toMatchObject({ code: "FORBIDDEN", retryable: false, nextAction: expect.any(String) });
  expect(JSON.stringify(forbiddenResult)).not.toContain("csrfToken");
  const temporary = createSaveEventTool({ ...base, save: vi.fn().mockRejectedValue(new Error("private stack")) });
  await expect(temporary.execute({ event_id: "evt-webmcp-intro" })).resolves.toMatchObject({ code: "TEMPORARY_FAILURE", retryable: true });
  const controller = new AbortController();
  controller.abort();
  await expect(tool.execute({ event_id: "evt-webmcp-intro" }, { signal: controller.signal })).resolves.toMatchObject({ code: "ABORTED", retryable: false });
});
