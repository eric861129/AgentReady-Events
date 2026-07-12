import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const script = readFileSync("scripts/bootstrap-azure-oidc.sh", "utf8");
const credential = JSON.parse(readFileSync("infra/github-federated-credential.json", "utf8")) as {
  issuer: string;
  subject: string;
  audiences: string[];
};

it("registers Container Apps and creates only the dedicated resource group", () => {
  expect(script).toContain("az provider register --namespace Microsoft.App --wait");
  expect(script).toContain("RESOURCE_GROUP=rg-agentready-events-prod");
  expect(script).toMatch(/az group create[\s\\]+--name "\$RESOURCE_GROUP"/);
  expect(script).not.toContain("az group delete");
});

it("assigns Contributor only at the resource-group scope", () => {
  expect(script).toContain('RG_SCOPE=$(az group show --name "$RESOURCE_GROUP" --query id -o tsv)');
  expect(script).toMatch(/--role Contributor[\s\\]+--scope "\$RG_SCOPE"/);
  expect(script).not.toMatch(/--role\s+(Owner|User Access Administrator)/);
  expect(script).not.toMatch(/--scope\s+['"]?\/subscriptions\/\$\(/);
});

it("uses GitHub OIDC without a stored client secret", () => {
  expect(credential).toEqual({
    name: "github-agentready-events-production",
    issuer: "https://token.actions.githubusercontent.com",
    subject: "repo:eric861129/AgentReady-Events:environment:production",
    description: "OIDC for manually triggered AgentReady Events production deployments",
    audiences: ["api://AzureADTokenExchange"]
  });
  expect(script).not.toMatch(/credential reset|client[_ -]?secret|password/i);
});

it("sets the five production environment variables without echoing identifiers", () => {
  for (const name of [
    "AZURE_CLIENT_ID",
    "AZURE_TENANT_ID",
    "AZURE_SUBSCRIPTION_ID",
    "AZURE_RESOURCE_GROUP",
    "AZURE_LOCATION"
  ]) {
    expect(script).toContain(`gh variable set ${name} --env production`);
  }
  expect(script).toContain("REPOSITORY=eric861129/AgentReady-Events");
  expect(script).toContain('gh api --method PUT "repos/$REPOSITORY/environments/production"');
  expect(script).not.toMatch(/echo.*(APP_ID|TENANT_ID|SUBSCRIPTION_ID)/);
});
