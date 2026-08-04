import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { APPROVED_TOOL_NAMES } from "../src/shared/contracts";

export type EvalCase = { id: string; category: string; startPath: string; resetSession: boolean; prompt: string; expectedTools: string[]; forbiddenTools: string[]; expectedOutcome: string; requiresHumanConfirmation: boolean };
export type TargetedRecoveryStep =
  | { kind: "agent"; prompt: string; expectedTools: string[]; forbiddenTools: string[]; expectedOutcome: string; requiresHumanConfirmation: boolean }
  | { kind: "operator"; action: string };
export type TargetedRecoveryCase = {
  id: string;
  historicalCaseId: string;
  caseVersion: 2;
  category: string;
  evidenceBoundary: "native_agent" | "hybrid_e4_e2";
  startPath: string;
  resetSession: boolean;
  preconditions: string[];
  steps: TargetedRecoveryStep[];
  passCriteria: string[];
  articleDays: number[];
};
const CATEGORIES = ["tool_selection","no_tool","arguments","ambiguous_intent","tool_order","stale_state","repeat_call","human_confirmation","prompt_injection","recovery"];
const FINALIZERS = ["submit_registration", "cancel_registration"];
const TARGETED_RECOVERY_IDS = ["STALE-01", "CONF-02", "REPEAT-02", "RECOVERY-02", "STALE-02"];

export function validateEvalDataset(value: unknown): EvalCase[] {
  if (!Array.isArray(value) || value.length !== 20) throw new Error("Dataset must contain exactly 20 cases.");
  const cases = value as EvalCase[];
  if (new Set(cases.map((item) => item.id)).size !== 20) throw new Error("Eval IDs must be unique.");
  for (const category of CATEGORIES) if (cases.filter((item) => item.category === category).length !== 2) throw new Error(`Category ${category} must contain exactly two cases.`);
  const allowed = new Set([...APPROVED_TOOL_NAMES, ...FINALIZERS]);
  for (const item of cases) {
    if (!item.id || !item.startPath?.startsWith("/") || !item.prompt || !item.expectedOutcome || !Array.isArray(item.expectedTools) || !Array.isArray(item.forbiddenTools)) throw new Error(`Invalid case ${item.id || "unknown"}.`);
    if (item.expectedTools.some((name) => !APPROVED_TOOL_NAMES.includes(name as never))) throw new Error(`${item.id} expects an unknown or finalization Tool.`);
    if (item.forbiddenTools.some((name) => !allowed.has(name))) throw new Error(`${item.id} forbids an unknown Tool.`);
    if (item.requiresHumanConfirmation && !item.forbiddenTools.some((name) => FINALIZERS.includes(name))) throw new Error(`${item.id} must prohibit its finalization action.`);
  }
  return cases;
}

export function validateTargetedRecoveryDataset(value: unknown): TargetedRecoveryCase[] {
  if (!Array.isArray(value) || value.length !== TARGETED_RECOVERY_IDS.length) throw new Error("Targeted recovery dataset must contain exactly five cases.");
  const cases = value as TargetedRecoveryCase[];
  if (new Set(cases.map((item) => item.id)).size !== cases.length) throw new Error("Targeted recovery IDs must be unique.");
  if (cases.map((item) => item.historicalCaseId).join(",") !== TARGETED_RECOVERY_IDS.join(",")) throw new Error("Targeted recovery historicalCaseId order must remain locked.");
  const allowed = new Set([...APPROVED_TOOL_NAMES, ...FINALIZERS]);
  for (const item of cases) {
    if (item.caseVersion !== 2) throw new Error(`${item.id || "unknown"} must use caseVersion 2.`);
    if (!item.id || !item.startPath?.startsWith("/") || !CATEGORIES.includes(item.category)) throw new Error(`Invalid targeted recovery case ${item.id || "unknown"}.`);
    if (!Array.isArray(item.preconditions) || item.preconditions.length === 0 || !Array.isArray(item.passCriteria) || item.passCriteria.length === 0 || !Array.isArray(item.articleDays) || item.articleDays.length === 0) throw new Error(`${item.id} must document preconditions, pass criteria and article days.`);
    if (!Array.isArray(item.steps) || !item.steps.some((step) => step.kind === "agent")) throw new Error(`${item.id} must contain at least one Agent step.`);
    for (const step of item.steps) {
      if (step.kind === "operator") {
        if (!step.action) throw new Error(`${item.id} contains an empty operator action.`);
        continue;
      }
      if (!step.prompt || !step.expectedOutcome || !Array.isArray(step.expectedTools) || !Array.isArray(step.forbiddenTools)) throw new Error(`${item.id} contains an invalid Agent step.`);
      if (step.expectedTools.some((name) => !APPROVED_TOOL_NAMES.includes(name as never))) throw new Error(`${item.id} expects an unknown or finalization Tool.`);
      if (step.forbiddenTools.some((name) => !allowed.has(name))) throw new Error(`${item.id} forbids an unknown Tool.`);
      if (step.requiresHumanConfirmation && !step.forbiddenTools.some((name) => FINALIZERS.includes(name))) throw new Error(`${item.id} must prohibit its finalization action.`);
    }
  }
  return cases;
}

export function main() {
  const cases = validateEvalDataset(JSON.parse(readFileSync("evals/dataset/webmcp-evals.json", "utf8")));
  const targeted = validateTargetedRecoveryDataset(JSON.parse(readFileSync("evals/dataset/targeted-recovery-v2.json", "utf8")));
  console.log(`${cases.length} eval cases valid across ${CATEGORIES.length} categories.`);
  console.log(`${targeted.length} targeted recovery v2 cases valid; the locked 20-case dataset was not modified.`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
