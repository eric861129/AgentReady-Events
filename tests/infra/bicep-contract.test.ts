import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const read = (path: string): string => readFileSync(path, "utf8");

it("defines a scale-to-zero HTTPS-only Container Apps production boundary", () => {
  const main = read("infra/main.bicep");
  const module = read("infra/modules/container-app.bicep");

  expect(main).toContain("cae-agentready-events-ea");
  expect(main).toContain("ca-agentready-events");
  expect(module).toContain("minReplicas: 0");
  expect(module).toContain("maxReplicas: 1");
  expect(module).toContain("cpu: json('0.25')");
  expect(module).toContain("memory: '0.5Gi'");
  expect(module).toContain("allowInsecure: false");
  expect(module).toContain("external: true");
  expect(module).toContain("targetPort: 3000");
  expect(module).toContain("activeRevisionsMode: 'Single'");
  expect(main).not.toContain("appLogsConfiguration");

  for (const forbidden of [
    "Microsoft.ContainerRegistry",
    "Microsoft.OperationalInsights",
    "Microsoft.Network",
    "Microsoft.DBfor",
    "dapr"
  ]) {
    expect(`${main}\n${module}`).not.toContain(forbidden);
  }
});

it("accepts only the approved public immutable GHCR image", () => {
  const main = read("infra/main.bicep");
  expect(main).toContain("ghcr.io/eric861129/agentready-events@sha256:");
  expect(main).toContain("@minLength(108)");
  expect(main).toContain("@maxLength(108)");
  expect(main).not.toContain("latest");
});

it("keeps the controlled evaluation fixture disabled unless deployment explicitly enables it", () => {
  const main = read("infra/main.bicep");
  const module = read("infra/modules/container-app.bicep");

  expect(main).toContain("param enableEvaluationFixtures bool = false");
  expect(main).toContain("enableEvaluationFixtures: enableEvaluationFixtures");
  expect(module).toContain("param enableEvaluationFixtures bool = false");
  expect(module).toContain("name: 'ENABLE_EVALUATION_FIXTURES'");
  expect(module).toContain("value: 'true'");
});

it("defines a resource-group-filtered monthly budget with three actual alerts", () => {
  const budget = read("infra/budget.bicep");
  expect(budget).toContain("@minValue(1)");
  expect(budget).toContain("category: 'Cost'");
  expect(budget).toContain("timeGrain: 'Monthly'");
  expect(budget).toContain("name: 'ResourceGroupName'");
  expect(budget).toContain("rg-agentready-events-prod");
  for (const threshold of [50, 80, 100]) {
    expect(budget).toContain(`threshold: ${threshold}`);
  }
  expect(budget.match(/thresholdType: 'Actual'/g)).toHaveLength(3);
});

it("keeps only non-sensitive defaults in the checked-in parameter file", () => {
  const parameters = JSON.parse(read("infra/main.parameters.json")) as {
    parameters: Record<string, { value: unknown }>;
  };
  expect(parameters.parameters).toEqual({
    location: { value: "eastasia" },
    environmentName: { value: "cae-agentready-events-ea" },
    containerAppName: { value: "ca-agentready-events" }
  });
});
