import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { APPROVED_TOOL_NAMES } from "../src/shared/contracts";

export type EvalSetup =
  | { kind: "none" }
  | {
      kind: "create_registration";
      eventId: string;
      attendeeName: "Eval Reader";
      email: "reader@example.com";
    };
export type EvalTarget =
  | "production"
  | "eval-security"
  | "eval-failure-temporary"
  | "eval-failure-expired";
export type EvalCase = {
  id: string;
  category: string;
  startPath: string;
  resetSession: boolean;
  prompt: string;
  expectedTools: string[];
  forbiddenTools: string[];
  expectedOutcome: string;
  requiresHumanConfirmation: boolean;
  target: EvalTarget;
  setup: EvalSetup;
};
const CATEGORIES = ["tool_selection","no_tool","arguments","ambiguous_intent","tool_order","stale_state","repeat_call","human_confirmation","prompt_injection","recovery"];
const FINALIZERS = ["submit_registration", "cancel_registration"];
const TARGETS = new Set<EvalTarget>([
  "production",
  "eval-security",
  "eval-failure-temporary",
  "eval-failure-expired"
]);
const REGISTRATION_SETUP = new Set(["AMB-02", "STALE-02", "REPEAT-02", "CONF-02", "RECOVERY-02"]);

function lockedFields(item: EvalCase): Omit<EvalCase, "target" | "setup"> {
  return {
    id: item.id,
    category: item.category,
    startPath: item.startPath,
    resetSession: item.resetSession,
    prompt: item.prompt,
    expectedTools: item.expectedTools,
    forbiddenTools: item.forbiddenTools,
    expectedOutcome: item.expectedOutcome,
    requiresHumanConfirmation: item.requiresHumanConfirmation
  };
}

function expectedTarget(id: string): EvalTarget {
  if (id === "INJECT-01" || id === "INJECT-02") return "eval-security";
  if (id === "RECOVERY-01") return "eval-failure-temporary";
  if (id === "RECOVERY-02") return "eval-failure-expired";
  return "production";
}

export function validateEvalDataset(value: unknown): EvalCase[] {
  if (!Array.isArray(value) || value.length !== 20) throw new Error("Dataset must contain exactly 20 cases.");
  const cases = value as EvalCase[];
  if (new Set(cases.map((item) => item.id)).size !== 20) throw new Error("Eval IDs must be unique.");
  for (const category of CATEGORIES) if (cases.filter((item) => item.category === category).length !== 2) throw new Error(`Category ${category} must contain exactly two cases.`);
  const allowed = new Set([...APPROVED_TOOL_NAMES, ...FINALIZERS]);
  const snapshot = JSON.parse(readFileSync("evals/dataset/locked-fields.json", "utf8")) as Array<
    Omit<EvalCase, "target" | "setup">
  >;
  const snapshotById = new Map(snapshot.map((item) => [item.id, item]));
  if (snapshotById.size !== 20) throw new Error("Locked-field snapshot must contain exactly 20 cases.");
  for (const item of cases) {
    if (!item.id || !item.startPath?.startsWith("/") || !item.prompt || !item.expectedOutcome || !Array.isArray(item.expectedTools) || !Array.isArray(item.forbiddenTools)) throw new Error(`Invalid case ${item.id || "unknown"}.`);
    if (item.expectedTools.some((name) => !APPROVED_TOOL_NAMES.includes(name as never))) throw new Error(`${item.id} expects an unknown or finalization Tool.`);
    if (item.forbiddenTools.some((name) => !allowed.has(name))) throw new Error(`${item.id} forbids an unknown Tool.`);
    if (item.requiresHumanConfirmation && !item.forbiddenTools.some((name) => FINALIZERS.includes(name))) throw new Error(`${item.id} must prohibit its finalization action.`);
    if (!TARGETS.has(item.target)) throw new Error(`${item.id} has an unknown target.`);
    if (item.target !== expectedTarget(item.id)) throw new Error(`${item.id} targets the wrong runtime.`);
    if (!item.setup || (item.setup.kind !== "none" && item.setup.kind !== "create_registration")) {
      throw new Error(`${item.id} has an unknown setup kind.`);
    }
    if (REGISTRATION_SETUP.has(item.id)) {
      if (
        item.setup.kind !== "create_registration" ||
        item.setup.eventId !== "evt-webmcp-intro" ||
        item.setup.attendeeName !== "Eval Reader" ||
        item.setup.email !== "reader@example.com"
      ) {
        throw new Error(`${item.id} registration setup must use the approved example email and fixture.`);
      }
      if (!item.resetSession) throw new Error(`${item.id} registration setup requires a reset Session.`);
    } else if (item.setup.kind !== "none") {
      throw new Error(`${item.id} must not create setup state.`);
    }
    const approved = snapshotById.get(item.id);
    if (!approved || JSON.stringify(lockedFields(item)) !== JSON.stringify(approved)) {
      throw new Error(`${item.id} has locked-field drift.`);
    }
  }
  return cases;
}

export function main() { const cases = validateEvalDataset(JSON.parse(readFileSync("evals/dataset/webmcp-evals.json", "utf8"))); console.log(`${cases.length} eval cases valid across ${CATEGORIES.length} categories.`); }
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
