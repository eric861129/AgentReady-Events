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

describe("GET /api/events/:eventId", () => {
  const app = createApp();

  it("回傳公開活動詳情並包含報名狀態", async () => {
    const response = await request(app)
      .get("/api/events/evt-frontend-accessible-ui")
      .expect(200);

    expect(response.body).toMatchObject({
      id: "evt-frontend-accessible-ui",
      title: expect.any(String),
      summary: expect.any(String),
      remainingCapacity: expect.any(Number),
      registrationDeadline: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
      registrationState: "open",
      detailUrl: "/events/evt-frontend-accessible-ui"
    });
  });

  it("eventId 超過長度限制時回傳 validation error", async () => {
    const response = await request(app)
      .get(`/api/events/${"x".repeat(65)}`)
      .expect(400);

    expect(response.body).toMatchObject({
      error: "validation_error",
      fieldErrors: [
        {
          field: "event_id",
          message: "活動識別碼長度不可超過 64 個字元。"
        }
      ]
    });
  });

  it("找不到公開活動時回傳 not_found", async () => {
    const response = await request(app)
      .get("/api/events/evt-missing")
      .expect(404);

    expect(response.body).toMatchObject({
      error: "not_found",
      message: "找不到符合條件的公開活動。"
    });
  });
});
