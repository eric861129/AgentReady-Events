import { expect, it, vi } from "vitest";
import { createCancellationPreparation, RISK_LEVELS } from "../../labs/shared/risk";

it("prepares a visible summary without mutating", async () => {
  const showSummary = vi.fn();
  const mutate = vi.fn();
  const preparation = createCancellationPreparation(showSummary, mutate);
  await expect(preparation.prepare({ eventTitle: "WebMCP 入門", startsAt: "2026-08-01T10:00:00+08:00" })).resolves.toMatchObject({ code: "CONFIRMATION_REQUIRED" });
  expect(showSummary).toHaveBeenCalledOnce();
  expect(mutate).not.toHaveBeenCalled();
  expect(RISK_LEVELS.cancellation).toBe("R3");
});
