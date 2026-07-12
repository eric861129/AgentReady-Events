import { expect, it } from "vitest";
import {
  CONTAINER_SMOKE_CHECKS,
  containerNameFor
} from "../../scripts/container-smoke-plan";
import {
  dockerRunArguments,
  parseContainerSmokeArgs,
  validateImageMetadata
} from "../../scripts/smoke-container";

it("checks the production contract in a fixed order", () => {
  expect(CONTAINER_SMOKE_CHECKS).toEqual([
    { path: "/health/live", status: 200, contains: '"status":"ok"' },
    { path: "/events", status: 200, contains: 'id="app"' },
    { path: "/events/evt-webmcp-intro", status: 200, contains: 'id="app"' },
    { path: "/api/does-not-exist", status: 404, contains: "API_ROUTE_NOT_FOUND" }
  ]);
});

it("uses a bounded explicit container name", () => {
  expect(containerNameFor("8d64b8a81074")).toBe("agentready-events-smoke-8d64b8a81074");
});

it("rejects values that are not lowercase commit SHAs", () => {
  expect(() => containerNameFor("LATEST")).toThrow(/lowercase SHA/);
});

it("requires an image and applies the bounded default port", () => {
  expect(parseContainerSmokeArgs(["--image", "agentready-events:test"])).toEqual({
    image: "agentready-events:test",
    port: 43130
  });
  expect(() => parseContainerSmokeArgs([])).toThrow(/--image/);
  expect(() => parseContainerSmokeArgs(["--image", "x", "--port", "80"])).toThrow(
    /1024–65535/
  );
});

it("builds a least-privilege, loopback-only docker invocation", () => {
  expect(
    dockerRunArguments("agentready-events-smoke-8d64b8a81074", 43130, "agentready-events:test")
  ).toEqual([
    "run",
    "--rm",
    "-d",
    "--name",
    "agentready-events-smoke-8d64b8a81074",
    "-e",
    "NODE_ENV=production",
    "-e",
    "PORT=3000",
    "-p",
    "127.0.0.1:43130:3000",
    "agentready-events:test"
  ]);
});

it("requires linux/amd64 and the exact OCI revision", () => {
  expect(() =>
    validateImageMetadata(
      { os: "linux", architecture: "arm64", revision: "8d64b8a81074" },
      "8d64b8a81074"
    )
  ).toThrow(/linux\/amd64/);
  expect(() =>
    validateImageMetadata(
      { os: "linux", architecture: "amd64", revision: "other" },
      "8d64b8a81074"
    )
  ).toThrow(/OCI revision/);
});
