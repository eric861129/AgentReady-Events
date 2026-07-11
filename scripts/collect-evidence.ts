import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SENSITIVE_KEYS = /^(cookie|csrfToken|token|password|secret|email|privatePrompt)$/i;
export type EvidenceRecord = Record<string, unknown> & { evidenceLevel: string; commit: string; url: string; environment: unknown };

function containsSensitiveKey(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsSensitiveKey);
  if (!value || typeof value !== "object") return false;
  return Object.entries(value as Record<string, unknown>).some(([key, child]) => SENSITIVE_KEYS.test(key) || containsSensitiveKey(child));
}

export function validateEvidenceRecord(record: EvidenceRecord): void {
  if (!record.commit || !record.url || !record.environment) throw new Error("Evidence requires commit, URL and environment.");
  if (containsSensitiveKey(record)) throw new Error("Evidence contains a sensitive key.");
  if (record.evidenceLevel === "E4" && (!record.discoveredSchema || !record.invocation)) throw new Error("E4 requires discovery and invocation.");
  if (record.evidenceLevel === "E5" && (!record.discoveredSchema || !record.invocation || !record.cleanReplayTask)) throw new Error("E5 requires discovery, invocation and clean replay task.");
}

export function collect(day: string): void {
  if (!/^\d{1,2}$/.test(day)) throw new Error("Day must be numeric.");
  const directory = resolve(`evidence/day-${day.padStart(2, "0")}`);
  const files = readdirSync(directory, { recursive: true }).filter((name) => String(name).endsWith(".json")).map(String).sort();
  const entries = files.map((file) => {
    const bytes = readFileSync(resolve(directory, file));
    const record = JSON.parse(bytes.toString()) as EvidenceRecord;
    validateEvidenceRecord(record);
    return { path: file, sha256: createHash("sha256").update(bytes).digest("hex"), evidenceLevel: record.evidenceLevel };
  });
  const index = { day: Number(day), generatedAt: new Date().toISOString(), entries, levelCounts: Object.fromEntries(["E0","E1","E2","E3","E4","E5"].map((level) => [level, entries.filter((entry) => entry.evidenceLevel === level).length])) };
  writeFileSync(resolve(directory, "index.json"), `${JSON.stringify(index, null, 2)}\n`);
  console.log(`Collected ${entries.length} evidence record(s) for Day ${day}.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) collect(process.argv[process.argv.indexOf("--day") + 1] ?? "");
