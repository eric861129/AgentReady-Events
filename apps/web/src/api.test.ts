import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchEventDetails } from "./api";

describe("fetchEventDetails", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("取得公開活動詳情", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({
        id: "evt-frontend-accessible-ui",
        title: "前端無障礙實作工作坊",
        summary: "以語意化 HTML 建立可操作活動頁。",
        startsAt: "2026-07-04T09:30:00+08:00",
        endsAt: "2026-07-04T12:30:00+08:00",
        location: "taipei",
        locationLabel: "台北",
        venue: "信義活動中心",
        price: "free",
        priceLabel: "免費",
        category: "frontend",
        categoryLabel: "Frontend",
        level: "beginner",
        levelLabel: "入門",
        remainingCapacity: 18,
        featured: true,
        detailUrl: "/events/evt-frontend-accessible-ui",
        registrationDeadline: "2026-07-02T15:59:59.000Z",
        registrationState: "open"
      })
    })));

    const detail = await fetchEventDetails("evt-frontend-accessible-ui");

    expect(fetch).toHaveBeenCalledWith("/api/events/evt-frontend-accessible-ui");
    expect(detail.id).toBe("evt-frontend-accessible-ui");
    expect(detail.registrationState).toBe("open");
  });

  it("API 錯誤時拋出可讀訊息", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: false,
      json: async () => ({
        error: "not_found",
        message: "找不到符合條件的公開活動。"
      })
    })));

    await expect(fetchEventDetails("evt-missing")).rejects.toThrow("找不到符合條件的公開活動。");
  });
});
