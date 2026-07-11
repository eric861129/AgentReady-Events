import { expect, it } from "vitest";
import { VERIFY_COMMANDS } from "../../scripts/verify";

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
