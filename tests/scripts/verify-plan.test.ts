import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import * as verify from "../../scripts/verify";

const { VERIFY_COMMANDS } = verify;

it("resolves npm through ComSpec on Windows without shell mode", () => {
  expect(verify.resolveSpawnCommand).toBeTypeOf("function");
  expect(verify.resolveSpawnCommand?.("npm", ["run", "test"], "win32", "C:\\Windows\\System32\\cmd.exe")).toEqual({
    command: "C:\\Windows\\System32\\cmd.exe",
    args: ["/d", "/s", "/c", "npm", "run", "test"]
  });
});

it("keeps direct executables on non-Windows platforms", () => {
  expect(verify.resolveSpawnCommand).toBeTypeOf("function");
  expect(verify.resolveSpawnCommand?.("npm", ["run", "test"], "linux")).toEqual({
    command: "npm",
    args: ["run", "test"]
  });
});

it("isolates the Playwright verification servers from the documented manual ports", () => {
  expect(verify.resolveVerificationEnvironment).toBeTypeOf("function");
  expect(
    verify.resolveVerificationEnvironment?.("npm", ["run", "test:e2e"], { PATH: "test-path" })
  ).toMatchObject({
    PATH: "test-path",
    PLAYWRIGHT_API_PORT: "3300",
    PLAYWRIGHT_WEB_PORT: "5573"
  });
  expect(
    verify.resolveVerificationEnvironment?.("npm", ["run", "test:e2e"], {
      PLAYWRIGHT_API_PORT: "4300",
      PLAYWRIGHT_WEB_PORT: "6573"
    })
  ).toMatchObject({ PLAYWRIGHT_API_PORT: "4300", PLAYWRIGHT_WEB_PORT: "6573" });
});

it("classifies verification as a test harness instead of real Agent invocation", () => {
  expect(verify.createVerificationEvidenceMetadata).toBeTypeOf("function");
  expect(verify.createVerificationEvidenceMetadata?.("abc", "2026-07-16T06:30:00.000Z")).toMatchObject({
    evidenceLevel: "E2",
    captured_at: "2026-07-16T06:30:00.000Z",
    commit: "abc",
    command: "npm run verify",
    source_type: "test_output",
    webmcp_capability: "not_tested",
    agent_invocation: "not_tested",
    test_harness: "browser_automation"
  });
});

it("runs deterministic checks in the approved order", () => {
  expect(VERIFY_COMMANDS).toEqual([
    ["npm", ["run", "lint"]],
    ["npm", ["run", "typecheck"]],
    ["npm", ["run", "test"]],
    ["npm", ["run", "test:api"]],
    ["npx", ["vitest", "run", "tests/security"]],
    ["npm", ["run", "test:e2e"]],
    ["npm", ["run", "build"]]
  ]);
});

it("keeps Playwright suites out of the Vitest unit-test command", () => {
  const packageJson = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8")) as {
    scripts: Record<string, string>;
  };

  expect(packageJson.scripts.test).toContain("--exclude 'tests/browser/**'");
  expect(packageJson.scripts.test).toContain("--exclude 'tests/evidence/**'");
  expect(packageJson.scripts.test).toContain("--maxWorkers=1");
});
