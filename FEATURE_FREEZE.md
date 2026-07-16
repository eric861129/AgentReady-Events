# Day 22 Feature Freeze

Freeze point：`day-22-v1`。

正式產品包含 exactly five 個 WebMCP Tools：

1. `search_events`
2. `get_event_details`
3. `save_event`
4. `prepare_event_registration`
5. `prepare_registration_cancellation`

`submit_registration` 與 `cancel_registration` 不得成為第六個或第七個 Tool。報名送出與取消完成會改變伺服器狀態，因此最終確認必須保留為人類操作。

## 固定 Journey

- 搜尋活動 → 查看詳情 → 收藏活動。
- 準備報名資料 → 人類檢查 → 人類送出。
- 準備取消摘要 → 人類閱讀影響 → 人類確認取消。

## 不變條件

- `save_event` 必須保持 idempotent，重複呼叫不得建立重複收藏。
- 準備報名與準備取消不得送出 mutation request。
- 最終 mutation 前必須重新檢查 CSRF、session、owner 與當下狀態。
- 活動與報名內容一律視為 untrusted data，不得成為指令或動態 HTML。
- Tool failure 必須提供安全、可行動的結構化結果，且不得包含 stack、session、token 或個資。
- Playwright、Fake ModelContext 與直接呼叫 Tool 最多證明 E2，不得宣稱為真實 Agent discovery 或 invocation。

Day 23 之後可以改善測試、安全、部署、可觀測性、可靠度與文件，但不得新增產品功能、擴張正式 catalog 或削弱人類確認邊界。
