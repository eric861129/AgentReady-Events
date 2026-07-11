import { expect, it } from "vitest";
import { validateEvidenceRecord } from "../../scripts/collect-evidence";

const base = { evidenceLevel: "E3", commit: "abc", url: "http://127.0.0.1", environment: { browser: "Chrome" } };
it("rejects inflated runtime evidence", () => {
  expect(() => validateEvidenceRecord({ ...base, evidenceLevel: "E4" })).toThrow("E4");
  expect(() => validateEvidenceRecord({ ...base, evidenceLevel: "E5", discoveredSchema: {}, invocation: {} })).toThrow("E5");
});
it("rejects missing provenance and sensitive keys", () => {
  expect(() => validateEvidenceRecord({ ...base, commit: "" })).toThrow("commit");
  expect(() => validateEvidenceRecord({ ...base, environment: { cookie: "secret" } })).toThrow("sensitive");
});
it("accepts truthful E3 and complete E4/E5 records", () => {
  expect(() => validateEvidenceRecord(base)).not.toThrow();
  expect(() => validateEvidenceRecord({ ...base, evidenceLevel: "E4", discoveredSchema: {}, invocation: {} })).not.toThrow();
  expect(() => validateEvidenceRecord({ ...base, evidenceLevel: "E5", discoveredSchema: {}, invocation: {}, cleanReplayTask: "task-1" })).not.toThrow();
});
