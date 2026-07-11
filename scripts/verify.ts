import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const VERIFY_COMMANDS: ReadonlyArray<readonly [string, readonly string[]]> = [
  ["npm", ["run", "typecheck"]],
  ["npm", ["run", "test"]],
  ["npm", ["run", "test:api"]],
  ["npx", ["vitest", "run", "tests/security"]],
  ["npm", ["run", "test:e2e"]],
  ["npm", ["run", "build"]]
];

export function runVerification(): number {
  const commit = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8", shell: false }).stdout.trim();
  const report = { commit, node: process.version, platform: `${process.platform}-${process.arch}`, startedAt: new Date().toISOString(), completedAt: "", success: false, commands: [] as Array<Record<string, unknown>> };
  let exitCode = 0;
  for (const [command, args] of VERIFY_COMMANDS) {
    const startedAt = new Date().toISOString();
    const result = spawnSync(command, [...args], { stdio: "inherit", shell: false });
    const commandExitCode = result.status ?? 1;
    report.commands.push({ command, args, startedAt, completedAt: new Date().toISOString(), exitCode: commandExitCode });
    if (commandExitCode !== 0) { exitCode = commandExitCode; break; }
  }
  report.completedAt = new Date().toISOString();
  report.success = exitCode === 0 && report.commands.length === VERIFY_COMMANDS.length;
  const output = resolve("evidence/latest/verification.json");
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
  return report.success ? 0 : (exitCode || 1);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = runVerification();
