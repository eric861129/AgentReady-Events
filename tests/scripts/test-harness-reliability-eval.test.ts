import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

type ReliabilityEval = {
  id: string;
  evidenceAxis: string;
  baseline: { score: number; maxScore: number; result: string };
  after: { score: number; maxScore: number; result: string };
  change: { file: string; before: string; after: string };
  limitations: string[];
};

it("records the real public capture timeout fix without upgrading it to Agent evidence", () => {
  const record = JSON.parse(readFileSync("evals/results/test-harness-reliability.json", "utf8")) as ReliabilityEval;
  const source = readFileSync(record.change.file, "utf8");

  expect(record).toMatchObject({
    id: "HARNESS-NAV-01",
    evidenceAxis: "test_harness",
    baseline: { score: 0, maxScore: 1, result: "failed" },
    after: { score: 1, maxScore: 1, result: "passed" }
  });
  expect(record.change.before).toContain("networkidle");
  expect(record.change.after).toContain("domcontentloaded");
  expect(source).toContain("waitUntil: \"domcontentloaded\"");
  expect(record.limitations.join(" ")).toMatch(/not an Agent|not WebMCP/i);
});
