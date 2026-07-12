import request from "supertest";
import { expect, it } from "vitest";
import { createApp } from "../../src/server/app";
import { originTrialHeader } from "../../src/server/security/origin-trial";

it("omits the header by default", async () => {
  expect(originTrialHeader(undefined)).toBeUndefined();
  expect((await request(createApp()).get("/events")).headers["origin-trial"]).toBeUndefined();
});

it("emits a bounded origin-bound token", async () => {
  const token = "A".repeat(80);
  expect(originTrialHeader(token)).toBe(token);
  const response = await request(createApp({ originTrialToken: token })).get("/events");
  expect(response.headers["origin-trial"]).toBe(token);
  expect(response.body).not.toHaveProperty("originTrialToken");
});

it("trims safe tokens and rejects unsafe header values", () => {
  expect(originTrialHeader("  abcDEF012+/_=-.  ")).toBe("abcDEF012+/_=-.");
  expect(() => originTrialHeader("bad\nheader")).toThrow(/invalid characters/);
  expect(() => originTrialHeader("bad token")).toThrow(/invalid characters/);
  expect(() => originTrialHeader("A".repeat(4097))).toThrow(/4096/);
});
