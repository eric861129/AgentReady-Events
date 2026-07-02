import { describe, expect, it, vi } from "vitest";
import type { GetEventDetailsResponse } from "../../../../packages/contracts/src/index";
import { createGetEventDetailsTool } from "./getEventDetailsTool";

const detail: GetEventDetailsResponse = {
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
};

describe("createGetEventDetailsTool", () => {
  it("建立符合 Catalog 的唯讀活動詳情 Tool", () => {
    const tool = createGetEventDetailsTool({
      loadEventDetails: vi.fn(),
      showEventDetails: vi.fn()
    });

    expect(tool.name).toBe("get_event_details");
    expect(tool.description).toBe("取得一個公開活動的日期、地點、費用、剩餘名額、報名期限與摘要。已從搜尋結果辨識到活動 ID，或使用者詢問特定活動時使用。");
    expect(tool.annotations).toEqual({
      readOnlyHint: true,
      untrustedContentHint: true
    });
    expect(tool.inputSchema).toMatchObject({
      required: ["event_id"],
      properties: {
        event_id: {
          type: "string",
          maxLength: 64
        }
      }
    });
  });

  it("execute 取得詳情後同步 UI 並回傳 ToolResult", async () => {
    const loadEventDetails = vi.fn(async () => detail);
    const showEventDetails = vi.fn();
    const tool = createGetEventDetailsTool({ loadEventDetails, showEventDetails });

    const result = await tool.execute({ event_id: " evt-frontend-accessible-ui " });

    expect(loadEventDetails).toHaveBeenCalledWith("evt-frontend-accessible-ui");
    expect(showEventDetails).toHaveBeenCalledWith(detail);
    expect(result).toMatchObject({
      ok: true,
      message: "已取得活動詳情並更新畫面。",
      data: detail
    });
  });

  it("event_id 不合法時回傳可修正錯誤且不呼叫 API", async () => {
    const loadEventDetails = vi.fn(async () => detail);
    const showEventDetails = vi.fn();
    const tool = createGetEventDetailsTool({ loadEventDetails, showEventDetails });

    const result = await tool.execute({ event_id: "x".repeat(65) });

    expect(loadEventDetails).not.toHaveBeenCalled();
    expect(showEventDetails).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      ok: false,
      message: "活動識別碼長度不可超過 64 個字元。"
    });
  });
});
