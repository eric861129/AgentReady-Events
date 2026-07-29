# WebMCP runtime rerun record

## 2026-07-27：E3 capability discovery

以 Chrome `150.0.7871.125`、公開 HTTPS `/events`、新的瀏覽器 profile，並啟用 Chrome 文件所述的 WebMCP testing flags 進行重跑。頁面是 secure context，`originAgentCluster` 為 `true`，`document.modelContext` 與 `navigator.modelContextTesting` 都可觀察到；testing surface 的 `listTools()` 回傳 `search_events` 與其 schema。

這是 E3：瀏覽器 testing surface 可以發現工具。它不是 E4，因為沒有相容 Agent 在未被提示 Tool 名稱的情況下，真實選擇並呼叫工具。直接呼叫 testing API 或 `executeTool()` 都只能用於除錯，不能當成 Agent invocation evidence。

## 與 Day 27 baseline 的關係

Day 27 的 0/20 environment-classified baseline 保持不變：當時的測試 surface 沒有 discovery，因此沒有可評分的 invocation。這次重跑只補充 browser capability 座標，不會回寫為 20 題 Agent 成功。

## 2026-07-29：兩題 E4 Agent invocation

公開站已更新至 commit `d0fe4df`、GitHub workflow run `30439991021`、Azure revision `ca-agentready-events--0000004`。使用 Chrome 150、`WebMCP for testing` flag、WebMCP Inspector 與 `Gemini 3 Flash Preview`，在 Prompt 未指定 Tool 名稱、也未手動執行 Tool 的前提下取得兩筆成功紀錄：

1. 「幫我找台北、免費，而且適合入門者的活動。」由 Agent 選擇並呼叫 `search_events`，輸入為 `location=taipei`、`price=free`、`level=beginner`。
2. 「請整理我現在看的活動名稱、地點、時間與剩餘名額。」由 Agent 在活動詳情頁選擇並呼叫 `get_event_details`，輸入為 `{}`，結果包含 `remainingCapacity=8`。

這兩筆可列為 E4，但不能外推為 20/20，也不能證明寫入 Tool、確認停點或跨乾淨環境 E5 已通過。第一筆紀錄保存於文章專案 `evidence/day-27/inspector-e4-sel-01.txt`，第二筆保存於 `evidence/day-27/inspector-e4-sel-02.txt`。

## 下一輪有效重跑

1. 在乾淨 profile 使用相容的 WebMCP Agent，不在 prompt 中提示 Tool 名稱。
2. 沿用固定二十題、三條 Journey 與資料集；保存 discovered schema、Agent invocation、結果、失敗案例與遮蔽敏感資訊後的原始紀錄。
3. 每一題獨立判定 E4，不用兩題成功替其餘案例升級。
4. 另以獨立乾淨環境重播同一題、同一資料版本與同一部署座標，才可主張該題 E5。

## 可重跑指令

```powershell
$env:WEBMCP_CHROME_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$env:WEBMCP_URL = 'https://<your-authorized-deployment>/events'
npm run probe:webmcp
```

此腳本只會列出 testing surface 可見的工具；它強制使用可見瀏覽器，且不會執行任何 Tool。

## 外部依據

- [Get started with WebMCP](https://developer.chrome.com/docs/ai/webmcp)
- [WebMCP draft](https://webmachinelearning.github.io/webmcp/)
