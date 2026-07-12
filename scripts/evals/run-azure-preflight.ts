import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, type BrowserContext, type Page } from "playwright";
import type { EvalCase } from "../validate-evals";
import { createSetup } from "./runtime-case";
import { validateAzureBaseline, type AzureRuntimeResult } from "./validate-runtime-result";

const url = process.env.AZURE_EVAL_URL?.replace(/\/$/, "");
const imageDigest = process.env.AZURE_IMAGE_DIGEST;
const codexTaskId = process.env.CODEX_TASK_ID ?? "codex-goal-azure-inline";
if (!url || !/^https:\/\/.+\.azurecontainerapps\.io$/.test(url)) throw new Error("AZURE_EVAL_URL must be the production HTTPS URL.");
if (!imageDigest || !/^sha256:[0-9a-f]{64}$/.test(imageDigest)) throw new Error("AZURE_IMAGE_DIGEST must be immutable.");
const targetUrl = url;
const targetDigest = imageDigest;

const datasetBytes = readFileSync("evals/dataset/webmcp-evals.json");
const dataset = JSON.parse(datasetBytes.toString()) as EvalCase[];
const datasetHash = createHash("sha256").update(datasetBytes).digest("hex");
const fqdn = new URL(targetUrl).hostname;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const version = browser.version();
const results: AzureRuntimeResult[] = [];
let originTrialHeaderPresent = false;

function adapter(page: Page) {
  return {
    goto: async (path: string) => { await page.goto(`${targetUrl}${path}`, { waitUntil: "networkidle" }); },
    fillLabel: async (label: string, value: string) => { await page.getByLabel(label, { exact: false }).fill(value); },
    humanClick: async (name: string) => {
      const actual = name === "確認報名" ? "我確認並送出報名" : name;
      await page.getByRole("button", { name: actual, exact: true }).click();
      await page.getByRole("status").waitFor();
    },
    readRegistrationId: async () => {
      await page.goto(`${targetUrl}/registrations`, { waitUntil: "networkidle" });
      const id = await page.locator("[data-registration-id]").first().getAttribute("data-registration-id");
      if (!id) throw new Error("Visible registration list did not expose an opaque ID.");
      return id;
    }
  };
}

async function runCase(evalCase: EvalCase): Promise<void> {
  const context: BrowserContext = await browser.newContext();
  const page = await context.newPage();
  const setup = await createSetup(evalCase, adapter(page));
  const response = await page.goto(`${targetUrl}${evalCase.startPath}`, { waitUntil: "networkidle" });
  originTrialHeaderPresent ||= Boolean(response?.headers()["origin-trial"]);
  const capability = await page.evaluate(() => {
    const documentContext = (document as Document & { modelContext?: unknown }).modelContext;
    const navigatorContext = (navigator as Navigator & { modelContext?: unknown }).modelContext;
    return {
      secureContext: window.isSecureContext,
      documentModelContext: documentContext !== undefined,
      navigatorModelContext: navigatorContext !== undefined
    };
  });
  if (capability.documentModelContext || capability.navigatorModelContext) {
    throw new Error("WebMCP capability is available; stop the environment-failure runner and continue with E4 discovery.");
  }
  results.push({
    caseId: evalCase.id,
    datasetHash,
    imageDigest: targetDigest,
    fqdn,
    codexTask: { id: codexTaskId, clean: false },
    browser: { name: "Google Chrome", version, secureContext: capability.secureContext },
    setup,
    evidenceLevel: "ENVIRONMENT_FAILURE",
    discoveredTools: [],
    invocations: [],
    outcome: {
      status: "environment-failure",
      cause: "document.modelContext unavailable in Chrome 150 after HTTPS and Origin Trial header preflight"
    }
  });
  await context.close();
}

try {
  for (const evalCase of dataset) await runCase(evalCase);
  validateAzureBaseline(results);
  for (const result of results) {
    const dir = resolve("evidence/azure-baseline", result.caseId);
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, "result.json"), `${JSON.stringify(result, null, 2)}\n`);
  }
  const preflight = {
    date: "2026-07-12",
    url: targetUrl,
    imageDigest: targetDigest,
    workflowRunUrl: "https://github.com/eric861129/AgentReady-Events/actions/runs/29179363328",
    browser: `Google Chrome ${version}`,
    secureContext: results.every((result) => result.browser.secureContext),
    originTrialHeaderPresent,
    documentModelContext: false,
    codexDiscoveryAvailable: false,
    classification: "environment",
    evidenceLevel: "E3",
    cases: { total: results.length, environmentFailure: results.length, highRiskBypasses: 0 }
  };
  mkdirSync(resolve("evidence/azure-baseline"), { recursive: true });
  writeFileSync(resolve("evidence/azure-baseline/preflight.json"), `${JSON.stringify(preflight, null, 2)}\n`);
  console.log(`Wrote ${results.length} validated Azure environment-failure results after real Chrome preflight.`);
} finally {
  await browser.close();
}
