# Day 07｜先有可用 HTML Form，才有 Declarative Tool

## 核心定位

Day 7 的重點不是 WebMCP attribute，而是建立一個人類可正常使用的搜尋表單。Declarative API 不是替壞表單貼上 AI 標籤；它應該建立在語意清楚、可提交、可驗證的 HTML form 上。

## 文章要回答的問題

- 為什麼 WebMCP Declarative Tool 應該從既有 HTML form 長出來？
- 一個準備好給 Agent 使用的表單，對人類使用者需要先滿足哪些條件？
- 搜尋 API、URL query state、結果列表和錯誤狀態如何形成穩定的使用者流程？

## 寫作主軸

1. 先完成活動搜尋表單與 API，再談 Declarative API。
2. 表單欄位要有 label、name、合理 input/select type，這些是 Day 9 schema 的基礎。
3. 搜尋送出後要更新畫面，也要讓 URL/query 保留狀態，方便截圖、測試和文章重現。
4. 無 WebMCP 支援時，網站仍要能完成搜尋。這是 Agent-ready，而不是 Agent-only。

## 素材清單

- 專案文件：Day 7 大綱、Critical User Journey
- 程式版本：`day-07-human-search`
- 程式重點：搜尋表單、活動列表、`GET /api/events`、query validation
- 操作畫面：搜尋前、搜尋後、URL/query 同步

## 截圖 / GIF

| 素材 | 文章位置 | 用途 | 對應 git tag | WebMCP 觀念 |
| --- | --- | --- | --- | --- |
| `docs/articles/assets/day-07/01-search-before.png` | 說明「先做給人用」時 | 展示搜尋表單、活動列表與產品頁面基礎狀態。 | `day-07-human-search` | Declarative Tool 應從可用 HTML form 長出來。 |
| `docs/articles/assets/day-07/02-search-after.png` | 說明送出與結果更新時 | 展示搜尋後 URL/query、狀態列與結果列表同步。 | `day-07-human-search` | Tool 背後需要穩定的使用者流程與可重現狀態。 |
| `docs/articles/assets/day-07/search-flow.gif` | 小結或流程展示段落 | 用動態流程呈現填表、送出、結果更新。 | `day-07-human-search` | 無 WebMCP 支援時，表單仍要能完成搜尋。 |

## 不要誤寫

- 不要在 Day 7 說表單已被 WebMCP 發現；這一天還沒有 `toolname`。
- 不要把搜尋 API 的實作細節寫成主角；它只是支撐 WebMCP demo 的產品能力。
- 不要把收藏、登入或報名提前寫成已完成。

發布前套用：`docs/06-webmcp-reality-checklist.md`
