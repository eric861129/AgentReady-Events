import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

const dockerfile = readFileSync("Dockerfile", "utf8");

it("pins the production runtime contract and OCI provenance", () => {
  expect(dockerfile).toContain("FROM node:22-alpine AS runtime");
  expect(dockerfile).toContain("ARG VCS_REF");
  expect(dockerfile).toContain("ARG BUILD_DATE");
  expect(dockerfile).toContain("ARG VERSION=1.0.0");
  expect(dockerfile).toContain("org.opencontainers.image.revision=\"$VCS_REF\"");
  expect(dockerfile).toContain("org.opencontainers.image.created=\"$BUILD_DATE\"");
  expect(dockerfile).toContain(
    "org.opencontainers.image.source=\"https://github.com/eric861129/AgentReady-Events\""
  );
  expect(dockerfile).toContain("HEALTHCHECK");
  expect(dockerfile).toContain("http://127.0.0.1:3000/health/live");
});
