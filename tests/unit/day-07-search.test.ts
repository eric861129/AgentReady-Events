import { expect, it } from "vitest";
import { LAB_EVENTS, searchLabEvents } from "../../labs/shared/events";

it("filters the semantic baseline without WebMCP", () => {
  expect(searchLabEvents(LAB_EVENTS, { location: "taipei", price: "free" })).toEqual([
    expect.objectContaining({ id: "evt-webmcp-intro" })
  ]);
});

it("matches trimmed keyword case-insensitively", () => {
  expect(searchLabEvents(LAB_EVENTS, { query: "  AGENT  " }).map((event) => event.id)).toEqual([
    "evt-agent-testing"
  ]);
});
