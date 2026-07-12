import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import {
  validateDeploymentEvidence,
  writeDeploymentEvidence,
  type DeploymentEvidence
} from "../../scripts/write-deployment-evidence";

const digest = "a".repeat(64);
const commit = "b".repeat(40);

const valid: DeploymentEvidence = {
  commit,
  imageRef: `ghcr.io/eric861129/agentready-events@sha256:${digest}`,
  fqdn: "ca-agentready-events.example.eastasia.azurecontainerapps.io",
  url: "https://ca-agentready-events.example.eastasia.azurecontainerapps.io",
  revision: "ca-agentready-events--abc123",
  region: "eastasia",
  workflowRunUrl: "https://github.com/eric861129/AgentReady-Events/actions/runs/1",
  resourceTypes: ["Microsoft.App/managedEnvironments", "Microsoft.App/containerApps"]
};

it("accepts a sanitized immutable Azure deployment record", () => {
  expect(validateDeploymentEvidence(valid)).toEqual(valid);
});

it("rejects mutable images, HTTP origins, and missing deployment identity", () => {
  expect(() => validateDeploymentEvidence({ ...valid, imageRef: "ghcr.io/x:latest" })).toThrow(
    /immutable GHCR digest/
  );
  expect(() => validateDeploymentEvidence({ ...valid, url: `http://${valid.fqdn}` })).toThrow(
    /HTTPS/
  );
  expect(() => validateDeploymentEvidence({ ...valid, revision: "" })).toThrow(/revision/);
});

it("rejects sensitive keys and excluded Azure resource types", () => {
  expect(() =>
    validateDeploymentEvidence({ ...valid, metadata: { tenantId: "must-not-appear" } })
  ).toThrow(/sensitive key/i);
  expect(() =>
    validateDeploymentEvidence({ ...valid, resourceTypes: ["Microsoft.ContainerRegistry/registries"] })
  ).toThrow(/excluded Azure resource type/i);
});

it("writes the record under the full commit without leaking extra fields", () => {
  const directory = mkdtempSync(join(tmpdir(), "agentready-evidence-"));
  const output = writeDeploymentEvidence(valid, directory);
  expect(output).toBe(join(directory, `${commit}.json`));
  expect(JSON.parse(readFileSync(output, "utf8"))).toEqual(valid);
});
