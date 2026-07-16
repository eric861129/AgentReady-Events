import { expect, it, vi } from "vitest";
import {
  readSearchQuery,
  respondToAgentSubmission,
  SEARCH_EVENTS_TOOL_DESCRIPTION,
  SEARCH_EVENTS_TOOL_NAME
} from "../../src/client/webmcp/declarative";

it("locks the exact identity and parameter handoff", () => {
  const data = new FormData();
  data.set("query", " WebMCP ");
  data.set("location", "taipei");
  data.set("price", "free");
  expect(SEARCH_EVENTS_TOOL_NAME).toBe("search_events");
  expect(SEARCH_EVENTS_TOOL_DESCRIPTION).toContain("目前公開活動");
  expect(readSearchQuery(data)).toEqual({ query: "WebMCP", location: "taipei", price: "free" });
});

it("hands the same action promise to respondWith only for Agent submission", () => {
  const result = Promise.resolve({ count: 0, events: [] });
  const respondWith = vi.fn();
  expect(respondToAgentSubmission({ agentInvoked: true, respondWith }, result)).toBe(true);
  expect(respondWith).toHaveBeenCalledWith(result);
  expect(respondToAgentSubmission({ agentInvoked: false, respondWith }, result)).toBe(false);
});
