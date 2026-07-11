import { expect, it } from "vitest";
import { EVENTS } from "../../src/shared/fixtures";
import { searchEvents } from "../../src/server/services/events";

it("filters Taipei free public summaries", () => {
  const result = searchEvents(EVENTS, { location: "taipei", price: "free" });
  expect(result).toHaveLength(1);
  expect(result[0]).toEqual({
    id: "evt-webmcp-intro",
    title: "WebMCP 入門工作坊",
    summary: "從語意 HTML 到第一個網站 Tool。",
    startsAt: "2026-08-01T10:00:00+08:00",
    location: "taipei",
    price: "free",
    level: "beginner"
  });
});
