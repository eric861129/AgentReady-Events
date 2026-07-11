import { expect, it, vi } from "vitest";
import { ApiClientError } from "../../src/client/api/client";
import { createPrepareCancellationTool } from "../../src/client/webmcp/tools/prepare-cancellation";

it("loads and shows a summary without calling cancel", async () => {
  const summary = { registrationId: "reg-1", eventId: "evt-1", eventTitle: "WebMCP 入門", startsAt: "2026-08-01", effect: "取消後釋出名額" };
  const load = vi.fn().mockResolvedValue(summary);
  const show = vi.fn();
  const cancel = vi.fn();
  const tool = createPrepareCancellationTool({ load, show, cancel, getStateVersion: () => 4 });
  await expect(tool.execute({ registration_id: "reg-1" })).resolves.toMatchObject({ ok: false, code: "CONFIRMATION_REQUIRED", summary });
  expect(show).toHaveBeenCalledWith(summary);
  expect(cancel).not.toHaveBeenCalled();
});

it("maps not found and temporary errors", async () => {
  const base = { show: vi.fn(), cancel: vi.fn(), getStateVersion: () => 1 };
  const notFound = createPrepareCancellationTool({ ...base, load: vi.fn().mockRejectedValue(new ApiClientError(404, "missing")) });
  await expect(notFound.execute({ registration_id: "reg-missing" })).resolves.toMatchObject({ code: "NOT_FOUND", retryable: false });
  const temporary = createPrepareCancellationTool({ ...base, load: vi.fn().mockRejectedValue(new Error("private")) });
  await expect(temporary.execute({ registration_id: "reg-1" })).resolves.toMatchObject({ code: "TEMPORARY_FAILURE", retryable: true });
});
