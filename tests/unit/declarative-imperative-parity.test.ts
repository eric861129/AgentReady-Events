import { describe, expect, it, vi } from "vitest";
import { createSearchEventsLabTool } from "../../labs/day-10-imperative-tool/tool";
import { executeSearchEvents } from "../../labs/shared/search-tool";

describe("Declarative and Imperative search_events parity", () => {
  const cases: Array<{ label: string; input: Record<string, unknown> }> = [
    { label: "normal search", input: { keyword: "Agent", format: "online" } },
    { label: "empty filters", input: {} },
    { label: "invalid city", input: { city: "taichung" } },
    { label: "invalid format", input: { format: "hybrid" } },
    { label: "unknown field", input: { limit: 1 } },
    { label: "no results", input: { keyword: "完全不存在的活動" } }
  ];

  it.each(cases)("returns the same domain result for $label", async ({ input }) => {
    const imperative = createSearchEventsLabTool(executeSearchEvents, vi.fn());
    await expect(imperative.execute(input)).resolves.toEqual(await executeSearchEvents(input));
  });

  it("returns the same normalized temporary failure", async () => {
    const unavailable = async () => ({
      ok: false as const,
      code: "TEMPORARY_FAILURE" as const,
      message: "活動搜尋暫時無法完成，請稍後再試。",
      retryable: true
    });
    const imperative = createSearchEventsLabTool(unavailable, vi.fn());
    await expect(imperative.execute({ keyword: "Agent" })).resolves.toEqual(await unavailable());
  });
});
