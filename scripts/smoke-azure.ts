import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  AZURE_HTTP_CHECKS,
  parseAzureSmokeArgs,
  validateDeployedImage,
  type AzureSmokeOptions
} from "./azure-smoke-plan";

interface SessionSummary {
  csrfToken: string;
}

export function cookieHeaderFrom(setCookieHeaders: readonly string[]): string {
  const pairs = setCookieHeaders
    .map((header) => header.split(";", 1)[0]?.trim() ?? "")
    .filter((pair) => pair.includes("="));
  if (!pairs.some((pair) => pair.startsWith("are_session="))) {
    throw new Error("The Azure response did not create the required session cookie.");
  }
  return pairs.join("; ");
}

function setCookieHeaders(response: Response): string[] {
  const headers = response.headers as Headers & { getSetCookie?: () => string[] };
  const values = headers.getSetCookie?.() ?? [];
  if (values.length > 0) return values;
  const combined = response.headers.get("set-cookie");
  return combined ? [combined] : [];
}

class SessionClient {
  private cookie = "";
  private csrf = "";

  constructor(private readonly origin: string) {}

  async start(): Promise<void> {
    const response = await fetch(`${this.origin}/api/session`);
    if (!response.ok) throw new Error(`Session bootstrap returned HTTP ${response.status}.`);
    this.cookie = cookieHeaderFrom(setCookieHeaders(response));
    const summary = (await response.json()) as Partial<SessionSummary>;
    if (!summary.csrfToken) throw new Error("Session bootstrap omitted its public CSRF summary.");
    this.csrf = summary.csrfToken;
  }

  async request(path: string, init: RequestInit = {}): Promise<Response> {
    const headers = new Headers(init.headers);
    headers.set("cookie", this.cookie);
    if (init.method && init.method !== "GET" && init.method !== "HEAD") {
      headers.set("x-csrf-token", this.csrf);
    }
    return fetch(`${this.origin}${path}`, { ...init, headers });
  }
}

function command(commandName: string, args: readonly string[]): string {
  return execFileSync(commandName, [...args], { encoding: "utf8", shell: false }).trim();
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
}

async function waitForAzure(origin: string): Promise<number> {
  const started = Date.now();
  const deadline = started + 90_000;
  let lastError = "no response";
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${origin}/health/live`);
      if (response.ok) return Date.now() - started;
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await delay(1_000);
  }
  throw new Error(`Azure production did not become healthy within 90 seconds: ${lastError}`);
}

async function assertHttpChecks(origin: string): Promise<Array<Record<string, unknown>>> {
  const results: Array<Record<string, unknown>> = [];
  for (const check of AZURE_HTTP_CHECKS) {
    const response = await fetch(`${origin}${check.path}`);
    const body = await response.text();
    const passed = response.status === check.status && body.includes(check.contains);
    results.push({ ...check, actualStatus: response.status, passed });
    if (!passed) throw new Error(`Azure HTTP contract failed for ${check.path}.`);
  }
  return results;
}

async function assertSessionAndConfirmationBoundaries(origin: string): Promise<void> {
  const owner = new SessionClient(origin);
  const stranger = new SessionClient(origin);
  await owner.start();
  await stranger.start();

  const saved = await owner.request("/api/saved-events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ eventId: "evt-webmcp-intro", interactionMode: "human" })
  });
  if (saved.status !== 200) throw new Error(`Owner save returned HTTP ${saved.status}.`);

  const ownerList = (await (await owner.request("/api/saved-events")).json()) as { eventIds?: string[] };
  const strangerList = (await (await stranger.request("/api/saved-events")).json()) as {
    eventIds?: string[];
  };
  if (JSON.stringify(ownerList.eventIds) !== JSON.stringify(["evt-webmcp-intro"])) {
    throw new Error("Owner session did not retain its saved event.");
  }
  if (JSON.stringify(strangerList.eventIds) !== JSON.stringify([])) {
    throw new Error("Fresh Azure sessions were not isolated.");
  }

  const forged = await owner.request("/api/registrations", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      eventId: "evt-webmcp-intro",
      attendeeName: "Azure Smoke",
      email: "smoke@example.com",
      interactionMode: "agent"
    })
  });
  const forgedBody = (await forged.json()) as { reason?: string };
  if (forged.status !== 403 || forgedBody.reason !== "HUMAN_CONFIRMATION_REQUIRED") {
    throw new Error("Forged Agent finalization was not rejected by the deployed server.");
  }
}

function runBrowserJourneys(origin: string): void {
  const result = spawnSync("npx", ["playwright", "test", "tests/browser/journeys.spec.ts"], {
    env: { ...process.env, CI: "true", PLAYWRIGHT_BASE_URL: origin },
    stdio: "inherit",
    shell: false
  });
  if (result.status !== 0) throw new Error("The three deployed Playwright Journeys failed.");
}

export async function runAzureSmoke(
  options: AzureSmokeOptions = parseAzureSmokeArgs(process.argv.slice(2))
): Promise<void> {
  const reportPath = resolve("evidence/latest/azure-smoke.json");
  const commit = command("git", ["rev-parse", "HEAD"]);
  const startedAt = new Date().toISOString();
  const report: Record<string, unknown> = {
    commit,
    url: options.url,
    digest: options.digest,
    startedAt,
    completedAt: "",
    coldStartMs: null,
    httpChecks: [],
    sessionIsolation: false,
    forgedAgentFinalizationRejected: false,
    browserJourneys: false,
    success: false
  };
  let failure: unknown;

  try {
    const deployedImage = command("az", [
      "containerapp",
      "show",
      "--name",
      "ca-agentready-events",
      "--resource-group",
      "rg-agentready-events-prod",
      "--query",
      "properties.template.containers[0].image",
      "-o",
      "tsv"
    ]);
    validateDeployedImage(deployedImage, options.digest);
    report.coldStartMs = await waitForAzure(options.url);
    report.httpChecks = await assertHttpChecks(options.url);
    await assertSessionAndConfirmationBoundaries(options.url);
    report.sessionIsolation = true;
    report.forgedAgentFinalizationRejected = true;
    runBrowserJourneys(options.url);
    report.browserJourneys = true;
    report.success = true;
  } catch (error) {
    failure = error;
    report.error = error instanceof Error ? error.message : String(error);
  } finally {
    report.completedAt = new Date().toISOString();
    mkdirSync(dirname(reportPath), { recursive: true });
    writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  }

  if (failure) throw failure;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runAzureSmoke().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
