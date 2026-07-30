import request from "supertest";
import { expect, it } from "vitest";
import { createApp } from "../../src/server/app";

it("exposes a public liveness endpoint", async () => {
  const response = await request(createApp()).get("/health/live");
  expect(response.status).toBe(200);
  expect(response.body).toEqual({ status: "ok" });
});

it("exposes sanitized build and runtime coordinates without secrets", async () => {
  const original = {
    appCommit: process.env.APP_COMMIT,
    appVersion: process.env.APP_VERSION,
    revision: process.env.CONTAINER_APP_REVISION
  };
  process.env.APP_COMMIT = "0123456789abcdef0123456789abcdef01234567";
  process.env.APP_VERSION = "3.0.0";
  process.env.CONTAINER_APP_REVISION = "ca-agentready-events--0000042";

  try {
    const response = await request(createApp()).get("/health/version");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      commit: "0123456789abcdef0123456789abcdef01234567",
      version: "3.0.0",
      revision: "ca-agentready-events--0000042"
    });
    expect(JSON.stringify(response.body)).not.toMatch(/token|secret|key/i);
  } finally {
    if (original.appCommit === undefined) delete process.env.APP_COMMIT;
    else process.env.APP_COMMIT = original.appCommit;
    if (original.appVersion === undefined) delete process.env.APP_VERSION;
    else process.env.APP_VERSION = original.appVersion;
    if (original.revision === undefined) delete process.env.CONTAINER_APP_REVISION;
    else process.env.CONTAINER_APP_REVISION = original.revision;
  }
});
