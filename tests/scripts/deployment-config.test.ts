import { expect, it } from "vitest";
import { PRODUCTION_HOST, resolvePort } from "../../src/server/server";

it("validates production host and port", () => {
  expect(PRODUCTION_HOST).toBe("0.0.0.0");
  expect(resolvePort(undefined)).toBe(3000);
  expect(resolvePort("43129")).toBe(43129);
  expect(() => resolvePort("3.14")).toThrow();
  expect(() => resolvePort("70000")).toThrow();
});
