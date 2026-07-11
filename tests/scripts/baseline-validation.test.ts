import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("preserves one immutable revision-1 result for every locked case", () => {
  const dataset = JSON.parse(readFileSync("evals/dataset/webmcp-evals.json", "utf8"));
  const baseline = JSON.parse(readFileSync("evals/results/baseline.json", "utf8"));
  expect(baseline.records.map((item: { id: string }) => item.id)).toEqual(dataset.map((item: { id: string }) => item.id));
  expect(new Set(baseline.records.map((item: { id: string }) => item.id)).size).toBe(20);
  expect(baseline.records.every((item: { revision: number }) => item.revision === 1)).toBe(true);
  expect(baseline.summary).toMatchObject({ passed: 0, failed: 20, environmentClassified: 20, highRiskBypasses: 0 });
});
