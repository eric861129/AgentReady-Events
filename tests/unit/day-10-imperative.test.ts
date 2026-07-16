import { expect, it, vi } from "vitest";
import { createSearchEventsLabTool } from "../../labs/day-10-imperative-tool/tool";
import { executeSearchEvents } from "../../labs/shared/search-tool";

it("defines the complete read-only search_events metadata", () => {
  const tool = createSearchEventsLabTool(executeSearchEvents, vi.fn());
  expect(tool).toMatchObject({
    name: "search_events",
    description: expect.stringContaining("關鍵字、城市與活動形式"),
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    inputSchema: { type: "object", additionalProperties: false }
  });
});

it("executes shared validation and renders the normalized result", async () => {
  const execute = vi.fn(executeSearchEvents);
  const render = vi.fn();
  const tool = createSearchEventsLabTool(execute, render);
  const result = await tool.execute({ keyword: "Agent", format: "online" });
  expect(result).toMatchObject({ ok: true, count: 1 });
  expect(execute).toHaveBeenCalledWith({ keyword: "Agent", format: "online" });
  expect(render).toHaveBeenCalledWith(result);
});

it("returns validation and temporary failures without throwing", async () => {
  const tool = createSearchEventsLabTool(executeSearchEvents, vi.fn());
  await expect(tool.execute({ city: "taichung" })).resolves.toMatchObject({ ok: false, code: "VALIDATION_ERROR", retryable: false });
  const unavailable = createSearchEventsLabTool(async () => ({
    ok: false,
    code: "TEMPORARY_FAILURE",
    message: "活動搜尋暫時無法完成，請稍後再試。",
    retryable: true
  }), vi.fn());
  await expect(unavailable.execute({})).resolves.toMatchObject({ ok: false, code: "TEMPORARY_FAILURE", retryable: true });
});
