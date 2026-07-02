# Day 10｜`toolautosubmit`、`respondWith()` 與可見狀態

## 核心定位

Day 10 完成 `search_events` 的第一個執行閉環：Agent 可以填入搜尋條件、提交表單、讓頁面更新結果，並透過 `respondWith()` 回傳可序列化結果。使用者也要看見 Agent 正在做什麼，以及取消後畫面保留在哪個狀態。

## 文章要回答的問題

- `toolautosubmit` 適合用在哪些低風險 Tool？為什麼搜尋可以，報名不行？
- `agentInvoked` 如何讓網站分辨一般使用者提交與 Agent 呼叫？
- `respondWith()` 應該回傳什麼，才能讓 Agent 知道結果已完成？
- `toolactivated` 與 `toolcancel` 如何讓使用者看見 Agent 狀態？

## 寫作主軸

1. `search_events` 是唯讀、低風險、可重複執行的搜尋工具，所以可以使用 `toolautosubmit`。
2. `agentInvoked` 讓同一個 submit handler 依呼叫來源顯示不同狀態。
3. `respondWith()` 回傳搜尋結果摘要，而不是替使用者做下一個高風險決定。
4. `toolactivated` 和 `toolcancel` 是人類可見狀態，不是裝飾；它們讓使用者知道 Agent 正在介入或已停止。

## 素材清單

- 專案文件：Tool Catalog submit lifecycle
- 程式版本：`day-10-agent-submit-loop`
- 程式重點：`toolautosubmit`、`agentInvoked`、`respondWith()`、`toolactivated`、`toolcancel`
- 操作畫面：Agent active 狀態、搜尋完成狀態、取消狀態

## 截圖 / GIF

| 素材 | 文章位置 | 用途 | 對應 git tag | WebMCP 觀念 |
| --- | --- | --- | --- | --- |
| `docs/articles/assets/day-10/01-agent-activated.png` | 說明 `toolactivated` 時 | 展示 Agent 介入搜尋流程時，使用者看得到狀態。 | `day-10-agent-submit-loop` | Agent 執行狀態必須可見，不能只在背景發生。 |
| `docs/articles/assets/day-10/02-agent-complete.png` | 說明 `agentInvoked` / `respondWith()` 時 | 展示 Agent 搜尋完成後，列表更新並留下狀態回饋。 | `day-10-agent-submit-loop` | 同一個 submit handler 可同時服務人類與 Agent 呼叫。 |
| `docs/articles/assets/day-10/03-agent-cancel.png` | 說明 `toolcancel` 時 | 展示 Agent 取消後，頁面保留目前結果並告知使用者。 | `day-10-agent-submit-loop` | 取消也是可見狀態，使用者要知道流程停在哪裡。 |
| `docs/articles/assets/day-10/04-autosubmit-diagnostics.png` | 解釋 `toolautosubmit` 時 | 展示 diagnostics 中的 autosubmit 狀態。 | `day-10-agent-submit-loop` | 只有低風險搜尋 Tool 適合自動提交。 |
| `docs/articles/assets/day-10/agent-search-flow.gif` | 結尾流程回顧 | 用動態流程串起 activated、agent submit、results、cancel。 | `day-10-agent-submit-loop` | `search_events` 完成第一個 Declarative Tool 執行閉環。 |

## 不要誤寫

- 不要把 `toolautosubmit` 推廣到報名、取消或登入等高風險流程。
- 不要說 Agent 已替使用者完成報名；Day 10 只完成搜尋。
- 不要把 Playwright 模擬事件寫成真實 Chrome Agent 實測；它是文章素材與流程驗證。

發布前套用：`docs/06-webmcp-reality-checklist.md`
