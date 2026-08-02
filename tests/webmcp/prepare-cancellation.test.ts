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

it("binds an omitted registration ID to the only active registration on the current page", async () => {
  const summary = { registrationId: "reg-route-bound", eventId: "evt-1", eventTitle: "WebMCP 入門", startsAt: "2027-01-23", effect: "取消後釋出名額" };
  const load = vi.fn().mockResolvedValue(summary);
  const dependencies = {
    load,
    show: vi.fn(),
    cancel: vi.fn(),
    getStateVersion: () => 2,
    getDefaultRegistrationId: () => "reg-route-bound"
  };
  const tool = createPrepareCancellationTool(dependencies);

  expect(tool.inputSchema).not.toHaveProperty("required");
  await expect(tool.execute({} as { registration_id: string })).resolves.toMatchObject({
    code: "CONFIRMATION_REQUIRED",
    summary
  });
  expect(load).toHaveBeenCalledWith("reg-route-bound");
});

it("asks for a selection when no single page-bound registration can be resolved", async () => {
  const tool = createPrepareCancellationTool({
    load: vi.fn(),
    show: vi.fn(),
    cancel: vi.fn(),
    getStateVersion: () => 2
  });

  await expect(tool.execute({} as { registration_id: string })).resolves.toMatchObject({
    code: "INVALID_INPUT",
    reason: "REGISTRATION_SELECTION_REQUIRED",
    retryable: false,
    uiUpdated: false
  });
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
  const expired = createPrepareCancellationTool({
    ...base,
    load: vi.fn().mockRejectedValue(new ApiClientError(401, "private session", "SESSION_EXPIRED"))
  });
  await expect(expired.execute({ registration_id: "reg-1" })).resolves.toMatchObject({
    code: "UNAUTHORIZED",
    reason: "SESSION_EXPIRED",
    nextAction: expect.stringContaining("重新開始"),
    retryable: false,
    uiUpdated: false
  });
  const forbidden = createPrepareCancellationTool({ ...base, load: vi.fn().mockRejectedValue(new ApiClientError(403, "owner private")) });
  await expect(forbidden.execute({ registration_id: "reg-1" })).resolves.toMatchObject({ code: "FORBIDDEN", retryable: false });
  const conflict = createPrepareCancellationTool({ ...base, load: vi.fn().mockRejectedValue(new ApiClientError(409, "state private")) });
  await expect(conflict.execute({ registration_id: "reg-1" })).resolves.toMatchObject({ code: "CONFLICT", retryable: false });
  const controller = new AbortController();
  controller.abort();
  await expect(tool.execute({ registration_id: "reg-1" }, { signal: controller.signal })).resolves.toMatchObject({ code: "ABORTED", retryable: false });
});
