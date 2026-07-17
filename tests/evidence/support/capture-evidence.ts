import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { Page } from "@playwright/test";

export type EvidenceAxis = "runtime_integration" | "webmcp_capability" | "agent_invocation" | "test_harness";

export interface CaptureRequest {
  id: string;
  day: number;
  route: string;
  fixture: string;
  selector: string;
  action: string;
  assertion: string;
  expectedFailure?: string | null;
  finalAsset: string;
  evidenceAxis: EvidenceAxis;
  evidenceLevel: "E1" | "E2" | "E3" | "E4" | "E5";
  limitations: string[];
  sourceCommand?: string;
  sourceFiles?: string[];
}

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

function commitSha() {
  return execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: repositoryRoot,
    encoding: "utf8"
  }).trim();
}

function outputRoot() {
  const articleRoot = process.env.ARTICLE_REPO_ROOT?.trim();
  return articleRoot
    ? path.join(path.resolve(articleRoot), "evidence/article-screenshots")
    : path.join(repositoryRoot, "evidence/article-screenshots");
}

export async function captureEvidence(page: Page, request: CaptureRequest) {
  if (!/^day-\d{2}-[a-z0-9-]+$/.test(request.id)) throw new Error(`Invalid evidence id: ${request.id}`);
  if (!request.limitations.length) throw new Error(`${request.id}: limitations are required`);

  const root = outputRoot();
  fs.mkdirSync(root, { recursive: true });
  const imageName = `${request.id}.raw.png`;
  const evidenceName = `${request.id}.evidence.json`;
  const imagePath = path.join(root, imageName);
  const target = page.locator(request.selector);
  await target.waitFor({ state: "visible" });
  await target.screenshot({ path: imagePath, animations: "disabled" });

  const capturedAt = new Date().toISOString();
  const evidence = {
    schemaVersion: 1,
    id: request.id,
    day: request.day,
    source_type: "browser_capture",
    source_command: request.sourceCommand ?? `npm run evidence:articles -- --grep "Day ${String(request.day).padStart(2, "0")}"`,
    source_files: request.sourceFiles ?? [
      "tests/evidence/article-screenshots.spec.ts",
      "tests/evidence/support/capture-evidence.ts"
    ],
    captured_at: capturedAt,
    commit: commitSha(),
    route: request.route,
    fixture: request.fixture,
    selector: request.selector,
    action: request.action,
    assertion: request.assertion,
    expected_failure: request.expectedFailure ?? null,
    raw_output: `evidence/article-screenshots/${imageName}`,
    final_asset: request.finalAsset,
    evidence_axis: request.evidenceAxis,
    evidence_level: request.evidenceLevel,
    environment: {
      platform: process.platform,
      browser: page.context().browser()?.browserType().name() ?? "unknown",
      browserVersion: page.context().browser()?.version() ?? "unknown",
      viewport: page.viewportSize()
    },
    limitations: request.limitations
  };
  fs.writeFileSync(path.join(root, evidenceName), `${JSON.stringify(evidence, null, 2)}\n`);
  return evidence;
}
