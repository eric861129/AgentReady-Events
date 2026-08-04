import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { validateEvalDataset, validateTargetedRecoveryDataset } from "../../scripts/validate-evals";

const dataset = () => JSON.parse(readFileSync("evals/dataset/webmcp-evals.json", "utf8"));
const targetedRecoveryDataset = () => JSON.parse(readFileSync("evals/dataset/targeted-recovery-v2.json", "utf8"));
it("accepts the locked 20-case dataset", () => expect(validateEvalDataset(dataset())).toHaveLength(20));
it("accepts the versioned five-case targeted recovery dataset", () => {
  const cases = validateTargetedRecoveryDataset(targetedRecoveryDataset());
  expect(cases).toHaveLength(5);
  expect(cases.map((item) => item.historicalCaseId)).toEqual([
    "STALE-01",
    "CONF-02",
    "REPEAT-02",
    "RECOVERY-02",
    "STALE-02"
  ]);
});
it("rejects duplicates, wrong counts and finalizers as expected Tools", () => {
  const duplicate = dataset(); duplicate[1].id = duplicate[0].id; expect(() => validateEvalDataset(duplicate)).toThrow("unique");
  expect(() => validateEvalDataset(dataset().slice(1))).toThrow("exactly 20");
  const finalizer = dataset(); finalizer[0].expectedTools = ["submit_registration"]; expect(() => validateEvalDataset(finalizer)).toThrow("unknown or finalization");
});
it("rejects incomplete targeted recovery protocols", () => {
  const wrongVersion = targetedRecoveryDataset();
  wrongVersion[0].caseVersion = 1;
  expect(() => validateTargetedRecoveryDataset(wrongVersion)).toThrow("caseVersion");

  const missingAgentTurn = targetedRecoveryDataset();
  missingAgentTurn[0].steps = missingAgentTurn[0].steps.filter((step: { kind: string }) => step.kind !== "agent");
  expect(() => validateTargetedRecoveryDataset(missingAgentTurn)).toThrow("Agent step");
});
