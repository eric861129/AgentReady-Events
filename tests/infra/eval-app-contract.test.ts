import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const bicep = readFileSync("infra/eval.bicep", "utf8");
const deploy = readFileSync("scripts/deploy-eval-app.sh", "utf8");
const cleanup = readFileSync("scripts/delete-eval-app.sh", "utf8");

it("reuses the production environment for one scale-to-zero Eval app", () => {
  expect(bicep).toContain("cae-agentready-events-ea");
  expect(bicep).toContain("existing =");
  expect(bicep).toContain("ca-agentready-events-eval");
  expect(bicep).toContain("modules/container-app.bicep");
  expect(bicep).toContain("environmentId: environment.id");
  expect(bicep).toContain("evalLab: mode");
  expect(bicep).not.toContain("Microsoft.OperationalInsights");
});

it("requires an immutable image and one startup-only mode", () => {
  expect(bicep).toContain("@minLength(108)");
  expect(deploy).toContain("@sha256:[0-9a-f]{64}");
  for (const mode of ["security", "failure:temporary", "failure:expired"]) {
    expect(deploy).toContain(mode);
  }
  expect(deploy).toContain("MODE=preview");
  expect(deploy).toContain("--execute");
});

it("can clean up only the exact ephemeral app after explicit confirmation", () => {
  expect(cleanup).toContain("--confirm ca-agentready-events-eval");
  expect(cleanup).toContain("az containerapp delete --name ca-agentready-events-eval --resource-group rg-agentready-events-prod --yes");
  expect(cleanup).not.toContain("az group delete");
  expect(cleanup.match(/az containerapp delete/g)).toHaveLength(1);
});
