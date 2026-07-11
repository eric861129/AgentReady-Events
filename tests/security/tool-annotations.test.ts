import { expect, it } from "vitest";
import { IMPERATIVE_TOOL_ANNOTATIONS } from "../../src/client/webmcp/catalog";

it("locks the imperative annotation matrix", () => {
  expect(IMPERATIVE_TOOL_ANNOTATIONS).toEqual({
    get_event_details: { readOnlyHint: true, untrustedContentHint: true },
    save_event: { readOnlyHint: false, untrustedContentHint: true },
    prepare_registration_cancellation: { readOnlyHint: true, untrustedContentHint: true }
  });
});
