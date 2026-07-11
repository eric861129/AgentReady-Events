import { expect, it } from "vitest";
import { failure, success } from "../../labs/shared/tool-result";

it("distinguishes retryable and non-retryable results", () => {
  expect(failure("VALIDATION_ERROR", "BAD_INPUT")).toMatchObject({ ok: false, retryable: false });
  expect(failure("TEMPORARY_FAILURE", "API_UNAVAILABLE")).toMatchObject({ ok: false, retryable: true });
  expect(success({ id: "evt-1" })).toEqual({ ok: true, code: "SUCCESS", data: { id: "evt-1" } });
});
