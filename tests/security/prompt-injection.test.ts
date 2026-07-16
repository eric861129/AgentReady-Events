import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { MALICIOUS_EVENT_COPY, securityEventFixtures } from "../../src/shared/security-fixtures";
import { APPROVED_TOOL_NAMES } from "../../src/shared/contracts";
import { EVENTS } from "../../src/shared/fixtures";
import { IMPERATIVE_TOOL_ANNOTATIONS } from "../../src/client/webmcp/catalog";

it("keeps hostile event copy as inert untrusted result data", () => {
  expect(securityEventFixtures.at(0)!.summary).toBe(MALICIOUS_EVENT_COPY);
  expect(APPROVED_TOOL_NAMES.join(" ")).not.toContain(MALICIOUS_EVENT_COPY);
  const source = readFileSync("src/client/pages/registration-page.ts", "utf8");
  expect(source).not.toContain("<h1>報名 ${event.title}</h1>");
  expect(source).not.toContain('value="${event.id}"');
  expect(source).toContain("textContent = `報名 ${event.title}`");
  expect(Object.values(IMPERATIVE_TOOL_ANNOTATIONS).every((annotations) => annotations.untrustedContentHint)).toBe(true);
});

it("exposes the malicious fixture through the formal event route dataset", () => {
  expect(EVENTS.find((event) => event.id === "evt-malicious-copy")).toEqual(securityEventFixtures.at(0));
});
