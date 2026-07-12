import { expect, it } from "vitest";
import {
  AZURE_HTTP_CHECKS,
  parseAzureSmokeArgs,
  validateDeployedImage
} from "../../scripts/azure-smoke-plan";
import { cookieHeaderFrom } from "../../scripts/smoke-azure";

const digest = `sha256:${"a".repeat(64)}`;

it("locks the public production HTTP contract", () => {
  expect(AZURE_HTTP_CHECKS).toEqual([
    { path: "/health/live", status: 200, contains: '"status":"ok"' },
    { path: "/events", status: 200, contains: 'id="app"' },
    { path: "/events/evt-webmcp-intro", status: 200, contains: 'id="app"' },
    { path: "/api/does-not-exist", status: 404, contains: "API_ROUTE_NOT_FOUND" }
  ]);
});

it("requires an exact Azure HTTPS origin and immutable digest", () => {
  expect(
    parseAzureSmokeArgs([
      "--url",
      "https://ca-agentready-events.example.eastasia.azurecontainerapps.io/",
      "--digest",
      digest
    ])
  ).toEqual({
    url: "https://ca-agentready-events.example.eastasia.azurecontainerapps.io",
    digest
  });
  expect(() =>
    parseAzureSmokeArgs([
      "--url",
      "http://ca-agentready-events.example.eastasia.azurecontainerapps.io",
      "--digest",
      digest
    ])
  ).toThrow(/HTTPS/);
  expect(() =>
    parseAzureSmokeArgs([
      "--url",
      "https://example.com",
      "--digest",
      "latest"
    ])
  ).toThrow(/Azure Container Apps/);
});

it("requires the deployed app to use the expected public digest", () => {
  const image = `ghcr.io/eric861129/agentready-events@${digest}`;
  expect(() => validateDeployedImage(image, digest)).not.toThrow();
  expect(() => validateDeployedImage(`${image}0`, digest)).toThrow(/deployed image/);
});

it("keeps only cookie name/value pairs in the private session jar", () => {
  expect(
    cookieHeaderFrom([
      "are_session=opaque-value; Path=/; HttpOnly; Secure; SameSite=Lax",
      "preference=compact; Path=/"
    ])
  ).toBe("are_session=opaque-value; preference=compact");
  expect(() => cookieHeaderFrom([])).toThrow(/session cookie/);
});
