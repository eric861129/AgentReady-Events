# WebMCP 真實性檢查清單

更新日期：2026-07-02

這份清單用來保護 Day 6～Day 10 的文章敘事。它的目的不是降低成果，而是把「已實作」、「已模擬驗證」和「已由目標 Chrome / WebMCP runtime 實測」分清楚。

## 核心原則

不要把一般瀏覽器截圖、Playwright 流程驗證，或本地 diagnostics 畫面寫成「Chrome Agent 已實測成功」。

目前可以說：

- 我們完成 `search_events` Declarative attributes。
- 我們完成 WebMCP feature detection。
- 我們完成 Declarative submit lifecycle handling。
- 我們用 Playwright 對本地網站做了流程驗證與素材截圖。

目前不能說：

- Chrome Agent 已經自動發現並呼叫 `search_events`。
- Chrome / WebMCP runtime 已在目標版本中完整支援本專案所有行為。
- diagnostics snapshot 就是 Chrome 最終產生的正式 Tool Schema。
- Playwright dispatch 的 `toolactivated`、`toolcancel`、`agentInvoked` 等事件等同於真實 Agent runtime。

實際 Chrome / WebMCP runtime 支援狀態需要另外驗證。

## 證據等級

| 等級 | 名稱 | 可以證明 | 不能證明 |
| --- | --- | --- | --- |
| E0 | 文件設計 | Tool Catalog、Baseline、Architecture 已定義預期行為。 | 程式已實作或瀏覽器已支援。 |
| E1 | 靜態實作 | HTML attribute、TypeScript handler、API endpoint 已寫進程式。 | Agent 已成功發現或呼叫 Tool。 |
| E2 | 本地流程驗證 | Playwright 可操作頁面，並可模擬 submit lifecycle。 | 目標 Chrome / WebMCP runtime 已真實執行。 |
| E3 | 目標瀏覽器能力偵測 | 目標 Chrome 顯示 secure context、`document.modelContext` 與相關 API 狀態。 | Agent 一定能正確選 tool 或填參數。 |
| E4 | 真實 Agent / DevTools 呼叫 | Tool 可被目標 runtime 發現、呼叫、回傳結果，並留下可重現證據。 | 所有瀏覽器或所有 Chrome 版本都支援。 |

Day 6～Day 10 目前主要證據層級是 E1～E2。若要升到 E3～E4，必須另外記錄 Chrome 版本、flag / origin trial 狀態、DevTools 或 Agent invocation 證據。

## 可用措辭

| 情境 | 建議寫法 |
| --- | --- |
| Declarative attributes | 「我們在搜尋表單上加入 `toolname`、`tooldescription` 與欄位描述。」 |
| Feature detection | 「診斷頁會檢查目前瀏覽器是否暴露 WebMCP 相關入口。」 |
| Schema snapshot | 「這是專案用來觀察表單語意的 snapshot，不把它視為永久規格格式。」 |
| Playwright GIF | 「這段 GIF 來自本地流程驗證，用來展示網站 handler 如何回應 Agent-like 事件。」 |
| Lifecycle handling | 「網站已處理 `agentInvoked`、`respondWith()`、`toolactivated` 與 `toolcancel` 的程式路徑。」 |

## 禁用措辭

| 不要寫 | 原因 | 可改成 |
| --- | --- | --- |
| 「Chrome Agent 已成功搜尋活動」 | 目前截圖不是來自真實 Chrome Agent invocation。 | 「本地流程驗證顯示 Agent-like submit path 可以更新搜尋結果。」 |
| 「WebMCP 已正式支援」 | 支援狀態會隨 Chrome 版本、flag、origin trial 改變。 | 「實際 runtime 支援狀態需以目標 Chrome 版本另行驗證。」 |
| 「瀏覽器產生的完整正式 Schema 如下」 | 目前 diagnostics 是專案 snapshot，不是正式規格輸出保證。 | 「以下是專案用來觀察欄位語意的 schema snapshot。」 |
| 「Agent 可以替使用者完成報名」 | Day 10 只實作搜尋，且報名屬於較高風險操作。 | 「Day 10 只完成低風險搜尋 Tool 的執行閉環。」 |
| 「`toolautosubmit` 適合所有表單」 | 自動提交只適合低風險、可重複、可撤回或無副作用流程。 | 「`toolautosubmit` 目前只套用在 `search_events`。」 |

## Day 6～Day 10 發布前檢查

### Day 6

- [ ] 文章只宣稱完成 runtime diagnostics baseline。
- [ ] 有說明 `document.modelContext` 可能不存在。
- [ ] 沒有宣稱已註冊或呼叫 `search_events`。
- [ ] 截圖標註為本地網站 diagnostics，不標註為真實 Agent invocation。

### Day 7

- [ ] 文章強調先做出人類可用的 HTML form。
- [ ] 沒有宣稱表單已被 WebMCP 發現。
- [ ] 搜尋 GIF 標註為一般使用者搜尋流程。
- [ ] 有說明無 WebMCP 支援時，網站仍可使用。

### Day 8

- [ ] 文章只宣稱加入 `toolname` 與 `tooldescription`。
- [ ] `tooldescription` 和 Tool Catalog 文字一致。
- [ ] 沒有宣稱已完成 autosubmit 或 submit lifecycle。
- [ ] 沒有把 Tool name 翻成中文。

### Day 9

- [ ] 文章說明 `name`、input type、select options 與 `toolparamdescription` 的角色。
- [ ] Schema 圖片標註為 project snapshot。
- [ ] 沒有宣稱 snapshot 是 Chrome 永久輸出格式。
- [ ] 有提醒 Declarative API 規格與實作仍需依當前版本確認。

### Day 10

- [ ] 文章明確說 `toolautosubmit` 只用於低風險搜尋。
- [ ] GIF 標註為 Playwright 流程驗證或 Agent-like lifecycle simulation。
- [ ] 沒有宣稱真實 Chrome Agent 已完成 invocation。
- [ ] 有說明 `respondWith()` 回傳搜尋結果，不代表替使用者做後續決策。
- [ ] 有區分 `toolactivated`、`toolcancel` 是可見狀態回饋，不是安全授權機制。

## 升級到真實 runtime 實測時要補的證據

若後續要把文章從 E2 提升到 E3/E4，至少補齊：

- [ ] Chrome 版本與 channel。
- [ ] 是否使用 flag、origin trial 或特定實驗設定。
- [ ] `document.modelContext` 實際偵測結果。
- [ ] DevTools WebMCP panel 或等效工具截圖。
- [ ] `search_events` 被 runtime 發現的證據。
- [ ] Agent / DevTools 手動 invocation 的輸入與輸出紀錄。
- [ ] `respondWith()` 回傳內容的可重現截圖或 log。
- [ ] 測試日期與 commit/tag。

## 寫作時的標準註記

在 Day 6～Day 10 文章中，若使用本地截圖或 GIF，可加上這句：

> 本文截圖與 GIF 來自本地 demo 與 Playwright 流程驗證，用來說明網站實作與 lifecycle handling；實際 Chrome / WebMCP runtime 支援狀態需依目標瀏覽器版本另行驗證。
