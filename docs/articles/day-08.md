# Day 08｜`toolname` 與 `tooldescription`

## 核心定位

Day 8 是第一個 Declarative Tool 的入口。這篇只做一件事：讓既有搜尋表單有穩定的 Tool identity。`toolname` 告訴 Agent 這個工具叫什麼，`tooldescription` 告訴 Agent 什麼時候該用它。

## 文章要回答的問題

- `toolname="search_events"` 為什麼要固定英文小寫蛇形？
- `tooldescription` 應該描述功能、適用時機，還是 UI 操作細節？
- 為什麼 Tool Catalog 的文字要和 HTML attribute 對齊？

## 寫作主軸

1. Declarative API 讓 HTML form 成為 Tool 的來源，不需要另外手寫一份重複 schema。
2. `toolname` 是穩定合約，不應因 UI 語言、按鈕文案或頁面標題改變。
3. `tooldescription` 要寫給 Agent 選工具用，不是寫給使用者看的行銷文案。
4. Day 8 只處理 Tool identity；欄位層級的 schema 留到 Day 9。

## 素材清單

- 專案文件：Tool Catalog `search_events`
- 程式版本：`day-08-search-events-identity`
- 程式重點：`toolname`、`tooldescription`
- 操作畫面：表單 attribute、diagnostics tool snapshot

## 截圖 / GIF

| 素材 | 文章位置 | 用途 | 對應 git tag | WebMCP 觀念 |
| --- | --- | --- | --- | --- |
| `docs/articles/assets/day-08/01-search-events-form.png` | 介紹 `search_events` 時 | 展示同一個搜尋表單開始承擔 Tool identity。 | `day-08-search-events-identity` | Declarative Tool 以 HTML form 為來源。 |
| `docs/articles/assets/day-08/02-tool-identity-snapshot.png` | 解釋 `toolname` / `tooldescription` 時 | 對照 diagnostics 裡的 Tool identity snapshot。 | `day-08-search-events-identity` | `toolname` 是穩定合約，`tooldescription` 是 Agent 選工具的依據。 |
| `docs/articles/assets/day-08/01-search-events-form.png` | 「漸進增強」段落 | 說明沒有 WebMCP runtime 時，表單仍可由人類提交。 | `day-08-search-events-identity` | Agent-ready 不等於 Agent-only。 |

## 不要誤寫

- 不要把 `tooldescription` 寫成 SEO description 或 UI helper text。
- 不要說 Day 8 已經完成自動提交；`toolautosubmit` 是 Day 10。
- 不要把 Tool name 翻成中文；Tool name 固定為 `search_events`。

發布前套用：`docs/06-webmcp-reality-checklist.md`
