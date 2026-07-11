import { expect, it } from "vitest";
import { SEARCH_TOOL_DESCRIPTION, SEARCH_TOOL_NAME } from "../../labs/shared/declarative";

it("uses one precise Declarative identity", () => {
  expect(SEARCH_TOOL_NAME).toBe("search_events");
  expect(SEARCH_TOOL_DESCRIPTION).toContain("地點、費用與程度");
  expect(SEARCH_TOOL_DESCRIPTION).not.toContain("任何");
});
