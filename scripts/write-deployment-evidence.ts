import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export interface DeploymentEvidence {
  commit: string;
  imageRef: string;
  fqdn: string;
  url: string;
  revision: string;
  region: "eastasia" | "japaneast";
  workflowRunUrl: string;
  resourceTypes: string[];
  [key: string]: unknown;
}

const imagePattern = /^ghcr\.io\/eric861129\/agentready-events@sha256:[0-9a-f]{64}$/;
const sensitiveKeyPattern = /token|password|secret|tenantid|subscriptionid|email|cookie|csrf/i;
const allowedResourceTypes = new Set([
  "Microsoft.App/managedEnvironments",
  "Microsoft.App/containerApps"
]);

function assertNoSensitiveKeys(value: unknown, path = "record"): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoSensitiveKeys(item, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (sensitiveKeyPattern.test(key)) throw new Error(`Sensitive key is forbidden at ${path}.${key}.`);
    assertNoSensitiveKeys(child, `${path}.${key}`);
  }
}

export function validateDeploymentEvidence(value: DeploymentEvidence): DeploymentEvidence {
  assertNoSensitiveKeys(value);
  if (!/^[0-9a-f]{40}$/.test(value.commit)) throw new Error("A full lowercase commit SHA is required.");
  if (!imagePattern.test(value.imageRef)) throw new Error("An immutable GHCR digest is required.");
  if (!value.fqdn || !/^[a-z0-9.-]+$/.test(value.fqdn)) throw new Error("A valid Azure FQDN is required.");
  if (value.url !== `https://${value.fqdn}`) throw new Error("The deployment URL must be exact HTTPS.");
  if (!value.revision) throw new Error("An Azure revision is required.");
  if (!['eastasia', 'japaneast'].includes(value.region)) throw new Error("The approved Azure region is required.");
  if (!/^https:\/\/github\.com\/eric861129\/AgentReady-Events\/actions\/runs\/\d+$/.test(value.workflowRunUrl)) {
    throw new Error("A GitHub workflow run URL is required.");
  }
  for (const resourceType of value.resourceTypes) {
    if (!allowedResourceTypes.has(resourceType)) {
      throw new Error(`Excluded Azure resource type: ${resourceType}.`);
    }
  }
  return value;
}

export function writeDeploymentEvidence(
  value: DeploymentEvidence,
  directory = resolve("evidence/deployments")
): string {
  const validated = validateDeploymentEvidence(value);
  mkdirSync(directory, { recursive: true });
  const output = join(directory, `${validated.commit}.json`);
  writeFileSync(output, `${JSON.stringify(validated, null, 2)}\n`);
  return output;
}

function fromEnvironment(): DeploymentEvidence {
  return {
    commit: process.env.DEPLOYMENT_COMMIT ?? "",
    imageRef: process.env.DEPLOYMENT_IMAGE_REF ?? "",
    fqdn: process.env.DEPLOYMENT_FQDN ?? "",
    url: process.env.DEPLOYMENT_URL ?? "",
    revision: process.env.DEPLOYMENT_REVISION ?? "",
    region: (process.env.DEPLOYMENT_REGION ?? "") as DeploymentEvidence["region"],
    workflowRunUrl: process.env.DEPLOYMENT_WORKFLOW_RUN_URL ?? "",
    resourceTypes: ["Microsoft.App/managedEnvironments", "Microsoft.App/containerApps"]
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const output = writeDeploymentEvidence(fromEnvironment());
    console.log(output);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
