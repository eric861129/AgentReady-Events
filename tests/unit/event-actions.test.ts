import { expect, it, vi } from "vitest";
import { createEventActions } from "../../src/client/services/event-actions";

it("human and Agent contexts call the same dependencies", async () => {
  const search = vi.fn().mockResolvedValue({ events: [] });
  const loadDetails = vi.fn().mockResolvedValue({ id: "evt-1" });
  const actions = createEventActions({ search, loadDetails });
  await actions.search({}, { mode: "human" });
  await actions.search({}, { mode: "agent" });
  await actions.loadDetails("evt-1", { mode: "agent" });
  expect(search).toHaveBeenCalledTimes(2);
  expect(loadDetails).toHaveBeenCalledWith("evt-1");
});

it("preserves every requested constraint when a search has no matches", async () => {
  const query = { query: "Agent", location: "kaohsiung", price: "paid", level: "advanced" } as const;
  const actions = createEventActions({
    search: vi.fn().mockResolvedValue({ events: [] }),
    loadDetails: vi.fn()
  });

  await expect(actions.search(query, { mode: "agent" })).resolves.toEqual({
    ok: true,
    code: "SUCCESS",
    count: 0,
    events: [],
    appliedFilters: query,
    constraintsRelaxed: false,
    requiresUserDecision: true,
    availableActions: [],
    nextAction: "目前沒有同時符合所有條件的公開活動；請先詢問使用者是否要調整條件，不得自行放寬。"
  });
});

it("does not invent omitted filters in the Agent-visible search result", async () => {
  const query = { query: "WebMCP" } as const;
  const actions = createEventActions({
    search: vi.fn().mockResolvedValue({ events: [] }),
    loadDetails: vi.fn()
  });

  await expect(actions.search(query, { mode: "agent" })).resolves.toMatchObject({
    appliedFilters: { query: "WebMCP" },
    constraintsRelaxed: false
  });
});
