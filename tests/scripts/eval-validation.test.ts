import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { validateEvalDataset } from "../../scripts/validate-evals";

const dataset = () => JSON.parse(readFileSync("evals/dataset/webmcp-evals.json", "utf8"));
it("accepts the locked 20-case dataset", () => expect(validateEvalDataset(dataset())).toHaveLength(20));
it("rejects duplicates, wrong counts and finalizers as expected Tools", () => {
  const duplicate = dataset(); duplicate[1].id = duplicate[0].id; expect(() => validateEvalDataset(duplicate)).toThrow("unique");
  expect(() => validateEvalDataset(dataset().slice(1))).toThrow("exactly 20");
  const finalizer = dataset(); finalizer[0].expectedTools = ["submit_registration"]; expect(() => validateEvalDataset(finalizer)).toThrow("unknown or finalization");
});
