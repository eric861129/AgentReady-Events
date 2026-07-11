import { expect, it } from "vitest";
import { readSearchQuery, SEARCH_EVENTS_TOOL_DESCRIPTION, SEARCH_EVENTS_TOOL_NAME } from "../../src/client/webmcp/declarative";

it("locks the exact identity and parameter handoff", () => {
  const data = new FormData();
  data.set("query", " WebMCP ");
  data.set("location", "taipei");
  data.set("price", "free");
  expect(SEARCH_EVENTS_TOOL_NAME).toBe("search_events");
  expect(SEARCH_EVENTS_TOOL_DESCRIPTION).toContain("目前公開活動");
  expect(readSearchQuery(data)).toEqual({ query: "WebMCP", location: "taipei", price: "free" });
});
