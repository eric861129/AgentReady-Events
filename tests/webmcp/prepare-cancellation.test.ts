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

it("maps invalid input, authorization, conflict, and abort", async () => {
  const base = { show: vi.fn(), cancel: vi.fn(), getStateVersion: () => 1 };
  const tool = createPrepareCancellationTool({ ...base, load: vi.fn() });
  await expect(tool.execute({} as { registration_id: string })).resolves.toMatchObject({ code: "INVALID_INPUT" });
  await expect(tool.execute({ registration_id: "../../secret" })).resolves.toMatchObject({ code: "INVALID_INPUT", retryable: false });
  const unauthorized = createPrepareCancellationTool({ ...base, load: vi.fn().mockRejectedValue(new ApiClientError(401, "private session")) });
  await expect(unauthorized.execute({ registration_id: "reg-1" })).resolves.toMatchObject({ code: "UNAUTHORIZED", retryable: false });
  const forbidden = createPrepareCancellationTool({ ...base, load: vi.fn().mockRejectedValue(new ApiClientError(403, "owner private")) });
  await expect(forbidden.execute({ registration_id: "reg-1" })).resolves.toMatchObject({ code: "FORBIDDEN", retryable: false });
  const conflict = createPrepareCancellationTool({ ...base, load: vi.fn().mockRejectedValue(new ApiClientError(409, "state private")) });
  await expect(conflict.execute({ registration_id: "reg-1" })).resolves.toMatchObject({ code: "CONFLICT", retryable: false });
  const controller = new AbortController();
  controller.abort();
  await expect(tool.execute({ registration_id: "reg-1" }, { signal: controller.signal })).resolves.toMatchObject({ code: "ABORTED", retryable: false });
});
