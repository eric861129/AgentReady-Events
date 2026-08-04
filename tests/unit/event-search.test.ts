import { describe, expect, it, vi } from "vitest";
import { createEventActions } from "../../src/client/services/event-actions";

const loadDetails = vi.fn();

describe("formal search action", () => {
  it.each(["human", "agent"] as const)("returns the same normalized success in %s mode", async (mode) => {
    const events = [{ id: "evt-1", title: "WebMCP" }];
    const search = vi.fn().mockResolvedValue({ events });
    const actions = createEventActions({ search, loadDetails });
    await expect(actions.search({ location: "taipei" }, { mode })).resolves.toEqual({
      ok: true,
      code: "SUCCESS",
      count: 1,
      events,
      appliedFilters: { location: "taipei" },
      constraintsRelaxed: false,
      requiresUserDecision: false,
      availableActions: ["get_event_details"],
      nextAction: "若使用者要查看詳情，請將 events 中的原始 id 傳給 get_event_details，不得自行產生 ID。"
    });
    expect(search).toHaveBeenCalledWith({ location: "taipei" });
  });

  it("normalizes invalid input without exposing transport details", async () => {
    const actions = createEventActions({
      search: vi.fn().mockRejectedValue(Object.assign(new Error("server internals"), { status: 400 })),
      loadDetails
    });
    await expect(actions.search({ location: "invalid" as "taipei" }, { mode: "agent" })).resolves.toEqual({
      ok: false,
      code: "INVALID_INPUT",
      message: "搜尋條件格式無效，請檢查欄位值。",
      retryable: false
    });
  });

  it("normalizes temporary API failure as retryable", async () => {
    const actions = createEventActions({ search: vi.fn().mockRejectedValue(new Error("timeout stack")), loadDetails });
    await expect(actions.search({}, { mode: "agent" })).resolves.toEqual({
      ok: false,
      code: "TEMPORARY_FAILURE",
      message: "活動搜尋暫時無法完成，請稍後再試。",
      retryable: true
    });
  });
});
