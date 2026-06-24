import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app";

describe("health check", () => {
  const app = createApp();

  it("回傳 live 狀態", async () => {
    const response = await request(app).get("/health/live").expect(200);

    expect(response.body).toEqual({ status: "ok" });
  });
});
