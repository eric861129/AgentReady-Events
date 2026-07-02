# Day 06｜WebMCP Runtime 與 Diagnostics Baseline

## 核心定位

Day 6 不急著寫 Tool。這篇先建立可啟動的活動網站骨架，並做出 WebMCP runtime diagnostics，讓後續每一篇都能回答同一個問題：目前瀏覽器環境到底支援哪些 WebMCP 能力？

## 文章要回答的問題

- WebMCP 實作前，為什麼要先確認 secure context 與 `document.modelContext`？
- 為什麼 diagnostics page 應該是開發與文章素材入口，而不是產品首頁主角？
- 我們如何把「網站可跑」和「WebMCP 可用」拆成兩層驗證？

## 寫作主軸

1. 先有一個正常活動網站骨架，WebMCP 才有承載的頁面。
2. `document.modelContext` 是後續 WebMCP 能力偵測的入口，但不能假設每個瀏覽器都有。
3. diagnostics page 的價值是留下可重複檢查的基準線：secure context、`document.modelContext`、`registerTool()`、`getTools()`、`executeTool()`。
4. 這一天不註冊 `search_events`，避免把 runtime readiness 和 Tool 設計混在一起。

## 素材清單

- 專案文件：Architecture、WebMCP Baseline、Tool Catalog
- 程式版本：`day-06-webmcp-diagnostics`
- 程式重點：monorepo 初版、API health check、WebMCP feature detection、`#/diagnostics`
- 操作畫面：首頁、WebMCP 狀態頁

## 截圖 / GIF

| 素材 | 文章位置 | 用途 | 對應 git tag | WebMCP 觀念 |
| --- | --- | --- | --- | --- |
| `docs/articles/assets/day-06/01-home.png` | 開頭或「今天完成什麼」段落 | 先交代這是一個正常活動網站，不是 WebMCP 教學頁。 | `day-06-webmcp-diagnostics` | WebMCP 應建立在既有網站能力上。 |
| `docs/articles/assets/day-06/02-diagnostics.png` | 說明 runtime detection 時 | 展示 secure context、`document.modelContext` 與 WebMCP API 偵測結果。 | `day-06-webmcp-diagnostics` | 實作 Tool 前，先建立可重複檢查的 runtime baseline。 |
| `docs/articles/assets/day-06/02-diagnostics.png` | 結尾的「今日邊界」段落 | 強調 Day 6 尚未註冊 Tool，只完成環境檢查。 | `day-06-webmcp-diagnostics` | 分清楚 runtime readiness 與 Tool readiness。 |

## 不要誤寫

- 不要說 Day 6 已經完成 Declarative Tool。
- 不要把一般瀏覽器裡的 diagnostics 畫面寫成「Chrome Agent 已成功呼叫 Tool」。
- 不要把前端切版寫成主線；主線是 WebMCP runtime baseline。

發布前套用：`docs/06-webmcp-reality-checklist.md`
