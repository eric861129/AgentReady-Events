import { describe, expect, it } from "vitest";
import { LAB_EVENTS } from "../../labs/shared/events";
import { executeSearchEvents, type SearchEventsInput } from "../../labs/shared/search-tool";

describe("shared search_events contract", () => {
  it("returns a normalized result for valid filters", async () => {
    await expect(executeSearchEvents({ keyword: "WebMCP", city: "taipei", format: "onsite" })).resolves.toEqual({
      ok: true,
      count: 1,
      events: [expect.objectContaining({ id: "evt-webmcp-intro" })]
    });
  });

  it("accepts empty filters", async () => {
    const result = await executeSearchEvents({});
    expect(result).toMatchObject({ ok: true, count: LAB_EVENTS.length });
  });

  it.each([
    [{ city: "taichung" }, "city", ["taipei", "kaohsiung"]],
    [{ format: "hybrid" }, "format", ["onsite", "online"]]
  ])("rejects an invalid enum without executing the search", async (input, field, allowed) => {
    await expect(executeSearchEvents(input)).resolves.toEqual({
      ok: false,
      code: "VALIDATION_ERROR",
      message: `欄位 ${field} 的值不在允許範圍內。`,
      retryable: false,
      details: { field, allowed }
    });
  });

  it("rejects unknown fields", async () => {
    await expect(executeSearchEvents({ keyword: "Agent", limit: 10 })).resolves.toEqual({
      ok: false,
      code: "VALIDATION_ERROR",
      message: "輸入包含未定義的欄位。",
      retryable: false,
      details: { unknownFields: ["limit"] }
    });
  });

  it("treats no results as a successful search", async () => {
    await expect(executeSearchEvents({ keyword: "完全不存在的活動" })).resolves.toEqual({
      ok: true,
      count: 0,
      events: []
    });
  });

  it("normalizes temporary execution failures", async () => {
    const input: SearchEventsInput = { keyword: "Agent" };
    await expect(executeSearchEvents(input, {
      events: LAB_EVENTS,
      search: () => {
        throw new Error("upstream timeout with internal details");
      }
    })).resolves.toEqual({
      ok: false,
      code: "TEMPORARY_FAILURE",
      message: "活動搜尋暫時無法完成，請稍後再試。",
      retryable: true
    });
  });
});
