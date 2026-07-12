import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const workflow = readFileSync(".github/workflows/deploy-azure.yml", "utf8");

it("is manually triggered and grants only required permissions", () => {
  expect(workflow).toMatch(/\non:\n\s+workflow_dispatch:/);
  for (const forbiddenTrigger of ["push:", "pull_request:", "schedule:"]) {
    expect(workflow).not.toContain(forbiddenTrigger);
  }
  expect(workflow).toContain("contents: read");
  expect(workflow).toContain("packages: write");
  expect(workflow).toContain("id-token: write");
});

it("verifies and publishes a commit-addressed Linux image", () => {
  for (const action of [
    "actions/checkout@v4",
    "actions/setup-node@v4",
    "docker/setup-buildx-action@v3",
    "docker/login-action@v3",
    "actions/upload-artifact@v4"
  ]) {
    expect(workflow).toContain(action);
  }
  expect(workflow).toContain("npm run verify");
  expect(workflow).toContain("npm run evals:validate");
  expect(workflow).toContain("npx playwright install --with-deps chromium");
  expect(workflow).toContain("npm run smoke:container");
  expect(workflow).toContain("s.bind(('127.0.0.1', 0))");
  expect(workflow).toContain('--port "$SMOKE_PORT"');
  expect(workflow).toContain("IMAGE_NAME: ghcr.io/eric861129/agentready-events");
  expect(workflow).toContain('echo "tag=$IMAGE_NAME:$SHA"');
  expect(workflow).toContain("--platform linux/amd64");
});

it("deploys only a verified digest through the production environment", () => {
  expect(workflow).toContain("environment: production");
  expect(workflow).toContain("if: ${{ inputs.deploy }}");
  expect(workflow).toContain("azure/login@v2");
  expect(workflow).toContain("image_ref=$IMAGE_NAME@$DIGEST");
  expect(workflow).toContain("az deployment group what-if");
  expect(workflow).toContain("az deployment group create");
  expect(workflow).toContain("npm run smoke:azure");
  expect(workflow).not.toMatch(/AZURE_CLIENT_SECRET|client-secret/i);
  expect(workflow).toContain("password: ${{ secrets.GITHUB_TOKEN }}");
  expect(workflow).not.toContain(":latest");
});
