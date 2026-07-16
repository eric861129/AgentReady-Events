import { expect, it } from "vitest";
import { validateEvidenceRecord } from "../../scripts/collect-evidence";
import { createVerificationEvidenceMetadata } from "../../scripts/verify";

const base = {
  evidenceLevel: "E3",
  captured_at: "2026-07-16T06:30:00.000Z",
  commit: "abc",
  url: "http://127.0.0.1",
  environment: { browser: "Chrome" },
  browser_version: "Chrome 150",
  command: "npm run smoke:deployment",
  source_type: "browser_capture",
  result: "passed",
  limitations: ["No WebMCP capability was exposed."],
  runtime_integration: "passed",
  webmcp_capability: "blocked",
  agent_invocation: "blocked",
  test_harness: "browser_automation"
};

it("rejects legacy E3 records that conflate integration and WebMCP capability", () => {
  expect(() => validateEvidenceRecord({ evidenceLevel: "E3", commit: "abc", url: "http://127.0.0.1", environment: { browser: "Chrome" } })).toThrow("captured_at");
  expect(() => validateEvidenceRecord({ ...base, runtime_integration: "blocked" })).toThrow("E3");
});

it("rejects inflated WebMCP discovery and invocation evidence", () => {
  expect(() => validateEvidenceRecord({ ...base, evidenceLevel: "E4" })).toThrow("E4");
  expect(() => validateEvidenceRecord({ ...base, evidenceLevel: "E5", webmcp_capability: "passed", agent_invocation: "passed" })).toThrow("E5");
});

it("rejects missing provenance and sensitive keys", () => {
  expect(() => validateEvidenceRecord({ ...base, commit: "" })).toThrow("commit");
  expect(() => validateEvidenceRecord({ ...base, source_type: "handwritten_success_card" })).toThrow("source_type");
  expect(() => validateEvidenceRecord({ ...base, environment: { cookie: "secret" } })).toThrow("sensitive");
});

it("accepts truthful, independently classified E3, E4 and E5 records", () => {
  expect(() => validateEvidenceRecord(base)).not.toThrow();
  expect(() => validateEvidenceRecord({ ...base, evidenceLevel: "E4", webmcp_capability: "passed", agent_invocation: "passed", discoveredSchema: {}, invocation: {} })).not.toThrow();
  expect(() => validateEvidenceRecord({ ...base, evidenceLevel: "E5", webmcp_capability: "passed", agent_invocation: "passed", discoveredSchema: {}, invocation: {}, cleanReplayTask: "task-1" })).not.toThrow();
});

it("accepts verification metadata only as E2 harness evidence", () => {
  const verification = createVerificationEvidenceMetadata("abc", "2026-07-16T06:30:00.000Z");
  expect(() => validateEvidenceRecord(verification)).not.toThrow();
  expect(verification.agent_invocation).toBe("not_tested");
});
