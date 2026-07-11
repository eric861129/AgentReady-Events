import { expect, it } from "vitest";
import { APPROVED_TOOL_NAMES as clientCatalog } from "../../src/client/webmcp/catalog";
import { APPROVED_TOOL_NAMES as sharedCatalog } from "../../src/shared/contracts";

it("freezes the product at exactly five preparation-safe Tools", () => {
  const expected = ["search_events", "get_event_details", "save_event", "prepare_event_registration", "prepare_registration_cancellation"];
  expect([...clientCatalog]).toEqual(expected);
  expect([...sharedCatalog]).toEqual(expected);
  expect(expected).not.toContain("submit_registration");
  expect(expected).not.toContain("cancel_registration");
});
