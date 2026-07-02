# Day 11｜Imperative API 入門：註冊活動詳情工具

> 素材狀態：可開始寫正式草稿。
> 對應程式版本：`day-11-event-details-tool`（預計）

## 核心問題

當網站功能不是單純 HTML form 時，如何用 JavaScript 將它註冊成 WebMCP Tool？

Day 6～Day 10 的 `search_events` 走 Declarative API，因為搜尋本來就是一個表單。Day 11 要切到另一條路：Imperative API。

這篇不急著做複雜旅程。第一個 Imperative Tool 只做一件低風險、公開、唯讀的事：

```text
get_event_details
```

它根據活動 ID 取得公開活動詳情，更新畫面上的詳情區，並回傳最小必要結果。

## 文章定位

Day 11 是第三階段的入口。這篇要把讀者從 Declarative Form 帶到 Imperative Tool registration。

主軸不是「怎麼做活動詳情頁」，而是：

1. 為什麼表單以外的功能需要 Imperative API。
2. `document.modelContext.registerTool()` 的責任是什麼。
3. Tool definition 裡的 name、description、input schema、execute、annotations 各自解決什麼問題。
4. 為什麼要用 WebMCP Adapter 隔離實驗 API。
5. Tool 執行後必須同步 UI 與 Tool Result。

## WebMCP 要證明什麼

Day 11 要證明：

- 網站可以用 `document.modelContext.registerTool()` 註冊 Imperative Tool。
- `get_event_details` 是 page-scoped Tool，不是全站永遠存在的背景能力。
- Tool execute 不直接讀資料庫，而是走既有 API / use case。
- Tool 成功後，畫面詳情區與回傳結果指向同一個活動。
- Tool 失敗時，能回傳可理解錯誤，不暴露 stack trace、SQL 或內部例外。
- 不支援 WebMCP runtime 時，人類仍能用活動列表與詳情 UI。

## Tool Catalog 對應

`get_event_details` 已在 Tool Catalog 中定義：

| 欄位 | 內容 |
| --- | --- |
| Name | `get_event_details` |
| Title | 查看活動詳情 |
| API | Imperative |
| Risk | R0：公開唯讀 |
| Login | 不需要 |
| Routes | `/events`、`/events/:id` |
| Annotation | `readOnlyHint: true`、`untrustedContentHint: true` |
| Side effect | 更新目前選取活動或詳情 UI；不改變伺服器資料 |

正式 description：

```text
取得一個公開活動的日期、地點、費用、剩餘名額、報名期限與摘要。已從搜尋結果辨識到活動 ID，或使用者詢問特定活動時使用。
```

Input schema：

```json
{
  "type": "object",
  "properties": {
    "event_id": {
      "type": "string",
      "maxLength": 64,
      "description": "搜尋結果或目前頁面提供的活動識別碼。"
    }
  },
  "required": ["event_id"]
}
```

## 預計程式素材

預計新增或調整：

| 檔案 | 用途 |
| --- | --- |
| `apps/web/src/webmcp.ts` | 補上 Imperative Tool 型別、Adapter 雛形與 feature detection。 |
| `apps/web/src/eventDetailsTool.ts` | 定義 `get_event_details` Tool。 |
| `apps/web/src/main.ts` | 顯示活動詳情區，註冊 Tool，處理 UI 同步。 |
| `apps/web/src/api.ts` | 新增 `fetchEventDetails(eventId)`。 |
| `apps/api/src/app.ts` | 新增 `GET /api/events/:eventId`。 |
| `packages/contracts/src/index.ts` | 新增活動詳情 DTO 與 Tool result 型別。 |
| `packages/validation/src/eventDetails.ts` | 驗證 `event_id`。 |

這些只是 Day 11 預計素材，不代表目前已完成。

## 文章段落草案

1. 從 Declarative 轉到 Imperative：表單以外的功能怎麼辦？
2. `get_event_details` 為什麼適合作為第一個 Imperative Tool？
3. Tool definition 五件事：name、description、input schema、execute、annotations。
4. Adapter：不要讓 `document.modelContext` 散落在每個頁面。
5. Execute 只走 API / use case，不直接碰 DB。
6. UI 與 Tool Result 要同步。
7. 錯誤結果要可修正，不暴露內部資訊。
8. Reality boundary：註冊程式路徑不等於真實 Agent 已成功呼叫。

## 截圖 / GIF 素材清單

| 素材 | 用途 | 對應 WebMCP 觀念 |
| --- | --- | --- |
| `docs/articles/assets/day-11/01-detail-panel.png` | 顯示活動詳情區被更新。 | Tool execute 要同步可見 UI。 |
| `docs/articles/assets/day-11/02-tool-registration-debug.png` | 顯示 `get_event_details` 註冊狀態。 | Imperative Tool identity 與 annotations。 |
| `docs/articles/assets/day-11/03-not-found-error.png` | 顯示不存在活動 ID 的錯誤。 | Tool result 要可理解、可修正。 |
| `docs/articles/assets/day-11/get-event-details-flow.gif` | 串起選活動、呼叫詳情、UI 更新。 | Imperative Tool 的執行閉環。 |

## Reality Checklist

- [ ] 本文只宣稱規劃或實作 `get_event_details` Imperative Tool。
- [ ] 若沒有目標 Chrome runtime 證據，不宣稱真實 Agent 已完成 invocation。
- [ ] 若使用 debug panel 或 Playwright，標註為本地流程驗證。
- [ ] 不把 `readOnlyHint` 寫成安全授權機制。
- [ ] 不回傳完整 HTML、Markdown 原文或主辦方內容作為可信指令。
- [ ] 說明不支援 WebMCP 時，人類仍能查看活動詳情。

## 完成標準

- [ ] 使用 `document.modelContext` 作為 Imperative API 入口。
- [ ] 建立 WebMCP Adapter 雛形。
- [ ] `get_event_details` 不直接存取 Database。
- [ ] 不存在活動時回傳可理解錯誤。
- [ ] 成功時 UI 與 Tool Result 都更新。
- [ ] 建立 `day-11-event-details-tool` tag。
