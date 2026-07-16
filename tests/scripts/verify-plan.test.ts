import { expect, it } from "vitest";
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

it("runs deterministic checks in the approved order", () => {
  expect(VERIFY_COMMANDS).toEqual([
    ["npm", ["run", "typecheck"]],
    ["npm", ["run", "test"]],
    ["npm", ["run", "test:api"]],
    ["npx", ["vitest", "run", "tests/security"]],
    ["npm", ["run", "test:e2e"]],
    ["npm", ["run", "build"]]
  ]);
});
