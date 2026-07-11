import { expect, it, vi } from "vitest";
import { createEventDetailsLabTool } from "../../labs/day-10-imperative-tool/tool";

it("loads details with an opaque ID and updates visible UI", async () => {
  const load = vi.fn().mockResolvedValue({ id: "evt-1", title: "WebMCP 入門" });
  const show = vi.fn();
  const tool = createEventDetailsLabTool(load, show);
  await expect(tool.execute({ event_id: "evt-1" })).resolves.toMatchObject({ ok: true, uiUpdated: true });
  expect(load).toHaveBeenCalledWith("evt-1");
  expect(show).toHaveBeenCalledOnce();
});

it("rejects invalid IDs before loading", async () => {
  const load = vi.fn();
  const tool = createEventDetailsLabTool(load, vi.fn());
  await expect(tool.execute({ event_id: "../../secret" })).resolves.toMatchObject({ ok: false, code: "VALIDATION_ERROR" });
  expect(load).not.toHaveBeenCalled();
});
