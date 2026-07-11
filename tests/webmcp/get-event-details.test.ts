import { expect, it, vi } from "vitest";
import { ApiClientError } from "../../src/client/api/client";
import { createGetEventDetailsTool } from "../../src/client/webmcp/tools/get-event-details";

it("validates opaque ID before loading", async () => {
  const load = vi.fn();
  const tool = createGetEventDetailsTool({ load, show: vi.fn(), getStateVersion: () => 1 });
  await expect(tool.execute({ event_id: "../../secret" })).resolves.toMatchObject({ ok: false, code: "VALIDATION_ERROR", retryable: false });
  expect(load).not.toHaveBeenCalled();
});

it("maps not found and temporary failures without private details", async () => {
  const show = vi.fn();
  const notFound = createGetEventDetailsTool({ load: vi.fn().mockRejectedValue(new ApiClientError(404, "找不到公開活動。")), show, getStateVersion: () => 2 });
  await expect(notFound.execute({ event_id: "evt-missing" })).resolves.toMatchObject({ ok: false, code: "NOT_FOUND", retryable: false });
  const temporary = createGetEventDetailsTool({ load: vi.fn().mockRejectedValue(new Error("private stack")), show, getStateVersion: () => 2 });
  const result = await temporary.execute({ event_id: "evt-webmcp-intro" });
  expect(result).toMatchObject({ ok: false, code: "TEMPORARY_FAILURE", retryable: true });
  expect(JSON.stringify(result)).not.toContain("private stack");
});

it("updates visible detail and returns the same opaque ID", async () => {
  const detail = { id: "evt-webmcp-intro", title: "WebMCP 入門" } as never;
  const show = vi.fn();
  const tool = createGetEventDetailsTool({ load: vi.fn().mockResolvedValue(detail), show, getStateVersion: () => 7 });
  await expect(tool.execute({ event_id: "evt-webmcp-intro" })).resolves.toMatchObject({ ok: true, data: { event: detail }, uiUpdated: true, stateVersion: 7 });
  expect(show).toHaveBeenCalledWith(detail);
});
