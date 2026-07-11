import { expect, it, vi } from "vitest";
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
