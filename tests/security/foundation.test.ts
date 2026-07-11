import { expect, it } from "vitest";
import { APPROVED_TOOL_NAMES } from "../../src/shared/contracts";

it("keeps mutation finalizers outside the approved Tool surface", () => {
  expect(APPROVED_TOOL_NAMES).not.toContain("submit_registration" as never);
  expect(APPROVED_TOOL_NAMES).not.toContain("cancel_registration" as never);
});
