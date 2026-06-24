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

describe("GET /api/events", () => {
  const app = createApp();

  it("未帶條件時回傳活動列表", async () => {
    const response = await request(app).get("/api/events").expect(200);

    expect(response.body.total).toBeGreaterThanOrEqual(12);
    expect(response.body.returned).toBe(response.body.events.length);
    expect(response.body.events[0]).toMatchObject({
      id: expect.any(String),
      title: expect.any(String)
    });
  });

  it("end_date 早於 start_date 時回傳驗證錯誤", async () => {
    const response = await request(app)
      .get("/api/events")
      .query({ start_date: "2026-07-10", end_date: "2026-07-01" })
      .expect(400);

    expect(response.body.error).toBe("validation_error");
    expect(response.body.fieldErrors).toContainEqual({
      field: "end_date",
      message: "結束日期不可早於開始日期。"
    });
  });

  it("enum 值不合法時回傳驗證錯誤", async () => {
    const response = await request(app)
      .get("/api/events")
      .query({ category: "mobile" })
      .expect(400);

    expect(response.body.error).toBe("validation_error");
    expect(response.body.fieldErrors[0].field).toBe("category");
  });
});
