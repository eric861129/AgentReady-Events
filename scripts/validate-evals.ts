import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { APPROVED_TOOL_NAMES } from "../src/shared/contracts";

export type EvalCase = { id: string; category: string; startPath: string; resetSession: boolean; prompt: string; expectedTools: string[]; forbiddenTools: string[]; expectedOutcome: string; requiresHumanConfirmation: boolean };
const CATEGORIES = ["tool_selection","no_tool","arguments","ambiguous_intent","tool_order","stale_state","repeat_call","human_confirmation","prompt_injection","recovery"];
const FINALIZERS = ["submit_registration", "cancel_registration"];

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

export function main() { const cases = validateEvalDataset(JSON.parse(readFileSync("evals/dataset/webmcp-evals.json", "utf8"))); console.log(`${cases.length} eval cases valid across ${CATEGORIES.length} categories.`); }
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
