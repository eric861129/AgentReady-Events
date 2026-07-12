import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { EvalCase } from "../validate-evals";

export type RuntimeEvidenceLevel = "E3" | "E4" | "E5" | "ENVIRONMENT_FAILURE";

export interface RuntimeSetupEvidence {
  kind: "none" | "create_registration";
  completed: boolean;
  agentInvocationCount: number;
  registrationId?: string;
}

export interface AzureRuntimeResult {
  caseId: string;
  datasetHash: string;
  imageDigest: string;
  fqdn: string;
  codexTask: { id: string; clean: boolean };
  browser: { name: string; version: string; secureContext: boolean };
  setup: RuntimeSetupEvidence;
  evidenceLevel: RuntimeEvidenceLevel;
  discoveredTools: Array<{ name: string; schema: Record<string, unknown> }>;
  invocations: Array<{ tool: string; arguments: Record<string, unknown>; phase: "agent" | "setup" }>;
  outcome: { status: "pass" | "fail" | "environment-failure"; cause: string };
  e4Reference?: string;
  cleanContext?: boolean;
  [key: string]: unknown;
}

const sensitiveKeyPattern = /token|password|secret|email|cookie|csrf/i;
const emailValuePattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;

function loadDataset(): EvalCase[] {
  return JSON.parse(readFileSync("evals/dataset/webmcp-evals.json", "utf8")) as EvalCase[];
}

function expectedDatasetHash(): string {
  return createHash("sha256").update(readFileSync("evals/dataset/webmcp-evals.json")).digest("hex");
}

function assertSanitized(value: unknown, path = "result"): void {
  if (typeof value === "string") {
    if (emailValuePattern.test(value)) throw new Error(`Sensitive value is forbidden at ${path}.`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((child, index) => assertSanitized(child, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (sensitiveKeyPattern.test(key)) throw new Error(`Sensitive key is forbidden at ${path}.${key}.`);
    assertSanitized(child, `${path}.${key}`);
  }
}

export function validateAzureRuntimeResult(result: AzureRuntimeResult): AzureRuntimeResult {
  assertSanitized(result);
  const dataset = loadDataset();
  const evalCase = dataset.find((item) => item.id === result.caseId);
  if (!evalCase) throw new Error("Runtime result requires a locked case ID.");
  if (result.datasetHash !== expectedDatasetHash()) throw new Error("Runtime result dataset hash is missing or stale.");
  if (!/^sha256:[0-9a-f]{64}$/.test(result.imageDigest)) throw new Error("Runtime result requires an image digest.");
  if (!/^[a-z0-9.-]+\.azurecontainerapps\.io$/.test(result.fqdn)) {
    throw new Error("Runtime result requires the Azure FQDN.");
  }
  if (!result.codexTask?.id) throw new Error("Runtime result requires a Codex task.");
  if (!result.browser?.version) throw new Error("Runtime result requires a browser version.");
  if (!result.browser.name) throw new Error("Runtime result requires a browser name.");
  if (!result.setup?.completed) throw new Error("Runtime result requires completed setup evidence.");
  if (result.setup.agentInvocationCount !== 0 || result.invocations.some((item) => item.phase === "setup")) {
    throw new Error("Human setup calls cannot be counted as Agent invocations.");
  }
  if (evalCase.setup.kind === "create_registration") {
    if (result.setup.kind !== "create_registration" || !/^reg-[a-z0-9-]+$/.test(result.setup.registrationId ?? "")) {
      throw new Error(`${result.caseId} requires visible registration setup evidence.`);
    }
  } else if (result.setup.kind !== "none") {
    throw new Error(`${result.caseId} must not contain registration setup evidence.`);
  }
  if (!Array.isArray(result.discoveredTools) || !Array.isArray(result.invocations)) {
    throw new Error("Runtime result requires discovery and invocation arrays.");
  }
  for (const invocation of result.invocations) {
    if (evalCase.forbiddenTools.includes(invocation.tool)) {
      throw new Error(`${result.caseId} invoked forbidden Tool ${invocation.tool}.`);
    }
  }
  if (result.evidenceLevel === "E4" || result.evidenceLevel === "E5") {
    if (
      result.discoveredTools.length === 0 ||
      result.discoveredTools.some((tool) => !tool.name || !tool.schema) ||
      result.invocations.length === 0
    ) {
      throw new Error(`${result.evidenceLevel} requires discovered schema and invocation evidence.`);
    }
  }
  if (result.evidenceLevel === "E5") {
    if (!result.e4Reference || !result.codexTask.clean || !result.cleanContext) {
      throw new Error("E5 requires an E4 reference, clean Codex task, and clean browser context.");
    }
  }
  if (result.evidenceLevel === "ENVIRONMENT_FAILURE" && result.outcome.status !== "environment-failure") {
    throw new Error("Environment failure evidence must use the environment-failure outcome.");
  }
  if (!result.outcome?.cause) throw new Error("Runtime result requires an outcome cause.");
  return result;
}

export function validateAzureBaseline(results: readonly AzureRuntimeResult[]): void {
  if (results.length !== 20) throw new Error("Azure baseline must contain exactly 20 results.");
  const ids = results.map((result) => result.caseId);
  if (new Set(ids).size !== 20) throw new Error("Azure baseline case IDs must be unique.");
  const expectedIds = loadDataset().map((item) => item.id).sort();
  if (JSON.stringify([...ids].sort()) !== JSON.stringify(expectedIds)) {
    throw new Error("Azure baseline must cover every locked case ID.");
  }
  results.forEach(validateAzureRuntimeResult);
}

function main(): void {
  const root = resolve("evidence/azure-baseline");
  let paths: string[] = [];
  try {
    paths = readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => resolve(root, entry.name, "result.json"));
  } catch {
    throw new Error("Azure baseline evidence directory is not available.");
  }
  const results = paths.map((path) => JSON.parse(readFileSync(path, "utf8")) as AzureRuntimeResult);
  validateAzureBaseline(results);
  console.log("20 Azure runtime results valid across the locked dataset.");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
