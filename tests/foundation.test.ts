import { describe, expect, it } from "vitest";
import { SERIES_TITLE, SERIES_TOOL_NAMES } from "../labs/index";

describe("v3 foundation", () => {
  it("locks the content-first series identity and five names", () => {
    expect(SERIES_TITLE).toBe("網站不只給人用：30 天打造 Agent-ready 的 WebMCP 網站");
    expect(SERIES_TOOL_NAMES).toEqual([
      "search_events",
      "get_event_details",
      "save_event",
      "prepare_event_registration",
      "prepare_registration_cancellation"
    ]);
  });
});
