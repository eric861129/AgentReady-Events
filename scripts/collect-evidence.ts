import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SENSITIVE_KEYS = /^(cookie|csrfToken|token|password|secret|email|privatePrompt)$/i;
export type EvidenceRecord = Record<string, unknown>;

const EVIDENCE_LEVELS = new Set(["E0", "E1", "E2", "E3", "E4", "E5"]);
const EVIDENCE_RESULTS = new Set(["passed", "failed", "blocked"]);
const EVIDENCE_STATUSES = new Set(["not_tested", "passed", "failed", "blocked"]);
const SOURCE_TYPES = new Set(["browser_capture", "test_output", "generated_diagram", "live_capture", "record_replay", "narrative", "official_source"]);
const TEST_HARNESSES = new Set(["none", "unit", "direct_execution", "synthetic_submit", "record_replay", "browser_automation"]);

function requireString(record: EvidenceRecord, field: string): string {
  const value = record[field];
  if (typeof value !== "string" || !value.trim()) throw new Error(`Evidence requires ${field}.`);
  return value;
}

function containsSensitiveKey(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsSensitiveKey);
  if (!value || typeof value !== "object") return false;
  return Object.entries(value as Record<string, unknown>).some(([key, child]) => SENSITIVE_KEYS.test(key) || containsSensitiveKey(child));
}

export function validateEvidenceRecord(record: EvidenceRecord): void {
  const evidenceLevel = requireString(record, "evidenceLevel");
  const capturedAt = requireString(record, "captured_at");
  requireString(record, "commit");
  requireString(record, "url");
  requireString(record, "browser_version");
  requireString(record, "command");
  const sourceType = requireString(record, "source_type");
  const result = requireString(record, "result");
  const runtimeIntegration = requireString(record, "runtime_integration");
  const webMcpCapability = requireString(record, "webmcp_capability");
  const agentInvocation = requireString(record, "agent_invocation");
  const testHarness = requireString(record, "test_harness");
  if (!record.environment || typeof record.environment !== "object" || Array.isArray(record.environment)) throw new Error("Evidence requires environment.");
  if (!Array.isArray(record.limitations) || !record.limitations.every((item) => typeof item === "string")) throw new Error("Evidence requires limitations as a string array.");
  if (Number.isNaN(Date.parse(capturedAt))) throw new Error("Evidence captured_at must be an ISO timestamp.");
  if (!EVIDENCE_LEVELS.has(evidenceLevel)) throw new Error(`Unsupported evidenceLevel: ${evidenceLevel}.`);
  if (!EVIDENCE_RESULTS.has(result)) throw new Error(`Unsupported evidence result: ${result}.`);
  if (!SOURCE_TYPES.has(sourceType)) throw new Error(`Unsupported source_type: ${sourceType}.`);
  for (const [field, value] of [["runtime_integration", runtimeIntegration], ["webmcp_capability", webMcpCapability], ["agent_invocation", agentInvocation]] as const) {
    if (!EVIDENCE_STATUSES.has(value)) throw new Error(`Unsupported ${field}: ${value}.`);
  }
  if (!TEST_HARNESSES.has(testHarness)) throw new Error(`Unsupported test_harness: ${testHarness}.`);
  if (containsSensitiveKey(record)) throw new Error("Evidence contains a sensitive key.");
  if (evidenceLevel === "E3" && runtimeIntegration !== "passed") throw new Error("E3 requires passed runtime_integration but does not imply WebMCP capability.");
  if (agentInvocation === "passed" && webMcpCapability !== "passed") throw new Error("Agent invocation requires passed WebMCP capability.");
  if (evidenceLevel === "E4" && (webMcpCapability !== "passed" || agentInvocation !== "passed" || !record.discoveredSchema || !record.invocation)) throw new Error("E4 requires observed WebMCP discovery and Agent invocation.");
  if (evidenceLevel === "E5" && (webMcpCapability !== "passed" || agentInvocation !== "passed" || !record.discoveredSchema || !record.invocation || !record.cleanReplayTask)) throw new Error("E5 requires discovery, invocation and clean replay task.");
}

export function collect(day: string): void {
  if (!/^\d{1,2}$/.test(day)) throw new Error("Day must be numeric.");
  const directory = resolve(`evidence/day-${day.padStart(2, "0")}`);
  const files = readdirSync(directory, { recursive: true }).filter((name) => String(name).endsWith(".json")).map(String).sort();
  const entries = files.map((file) => {
    const bytes = readFileSync(resolve(directory, file));
    const record = JSON.parse(bytes.toString()) as EvidenceRecord;
    validateEvidenceRecord(record);
    return {
      path: file,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      evidenceLevel: record.evidenceLevel,
      result: record.result,
      runtime_integration: record.runtime_integration,
      webmcp_capability: record.webmcp_capability,
      agent_invocation: record.agent_invocation,
      test_harness: record.test_harness
    };
  });
  const index = { day: Number(day), generatedAt: new Date().toISOString(), entries, levelCounts: Object.fromEntries(["E0","E1","E2","E3","E4","E5"].map((level) => [level, entries.filter((entry) => entry.evidenceLevel === level).length])) };
  writeFileSync(resolve(directory, "index.json"), `${JSON.stringify(index, null, 2)}\n`);
  console.log(`Collected ${entries.length} evidence record(s) for Day ${day}.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) collect(process.argv[process.argv.indexOf("--day") + 1] ?? "");
