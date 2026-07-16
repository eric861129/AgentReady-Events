import { expect, it, vi } from "vitest";
import {
  readDeclarativeSearchInput,
  SEARCH_TOOL_DESCRIPTION,
  SEARCH_TOOL_NAME,
  useAgentRespondWith
} from "../../labs/shared/declarative";
import type { SearchEventsResult } from "../../labs/shared/search-tool";

it("uses one precise Declarative identity", () => {
  expect(SEARCH_TOOL_NAME).toBe("search_events");
  expect(SEARCH_TOOL_DESCRIPTION).toContain("關鍵字、城市與活動形式");
  expect(SEARCH_TOOL_DESCRIPTION).toContain("空陣列");
});

it("reads only the three shared search fields from FormData", () => {
  const data = new FormData();
  data.set("keyword", "  Agent  ");
  data.set("city", "taipei");
  data.set("format", "onsite");
  expect(readDeclarativeSearchInput(data)).toEqual({ keyword: "Agent", city: "taipei", format: "onsite" });
});

it("uses respondWith only for a synthetic Agent submission", async () => {
  const result: Promise<SearchEventsResult> = Promise.resolve({ ok: true, count: 0, events: [] });
  const respondWith = vi.fn();
  expect(useAgentRespondWith({ agentInvoked: true, respondWith }, result)).toBe(true);
  expect(respondWith).toHaveBeenCalledWith(result);
  expect(useAgentRespondWith({ agentInvoked: false, respondWith }, result)).toBe(false);
  expect(respondWith).toHaveBeenCalledTimes(1);
});
