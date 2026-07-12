import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const script = readFileSync("scripts/rollback-azure.sh", "utf8");

it("accepts only the exact public immutable image", () => {
  expect(script).toContain("ghcr\\.io/eric861129/agentready-events@sha256:");
  expect(script).toContain("[0-9a-f]{64}");
  expect(script).not.toContain(":latest");
});

it("defaults to dry-run and scopes the command to production", () => {
  expect(script).toContain("MODE=dry-run");
  expect(script).toContain("RESOURCE_GROUP=rg-agentready-events-prod");
  expect(script).toContain("APP_NAME=ca-agentready-events");
  expect(script).toContain('az containerapp update --resource-group "$RESOURCE_GROUP" --name "$APP_NAME" --image "$IMAGE_REF"');
});

it("never deletes resources and always smoke-tests an executed rollback", () => {
  expect(script).not.toMatch(/\b(delete|remove|purge)\b/);
  expect(script).toContain("npm run smoke:azure");
  expect(script).toContain("--execute");
});
