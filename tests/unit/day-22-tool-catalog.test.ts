import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { APPROVED_TOOL_NAMES as clientCatalog, IMPERATIVE_TOOL_ANNOTATIONS } from "../../src/client/webmcp/catalog";
import { APPROVED_TOOL_NAMES as sharedCatalog } from "../../src/shared/contracts";

it("freezes the product at exactly five preparation-safe Tools", () => {
  const expected = ["search_events", "get_event_details", "save_event", "prepare_event_registration", "prepare_registration_cancellation"];
  expect([...clientCatalog]).toEqual(expected);
  expect([...sharedCatalog]).toEqual(expected);
  expect(expected).not.toContain("submit_registration");
  expect(expected).not.toContain("cancel_registration");
  expect(new Set(expected).size).toBe(5);
  expect(Object.keys(IMPERATIVE_TOOL_ANNOTATIONS).sort()).toEqual([
    "get_event_details",
    "prepare_registration_cancellation",
    "save_event"
  ]);
  const freeze = readFileSync("FEATURE_FREEZE.md", "utf8");
  expect(freeze).toContain("exactly five");
  expect(freeze).toContain("必須保留為人類操作");
});
