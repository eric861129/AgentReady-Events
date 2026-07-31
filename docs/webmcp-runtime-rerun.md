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

這兩筆只對該歷史部署可列為 E4，不能外推為 20/20，也不能證明寫入 Tool、確認停點、目前 release 或跨乾淨環境 E5 已通過。原始文字、截圖與 SHA-256 provenance 已保存於：

- `evidence/agent-invocation/2026-07-29/sel-01-search-events-e4.txt`
- `evidence/agent-invocation/2026-07-29/sel-02-current-page-e4.txt`
- `evidence/agent-invocation/2026-07-29/provenance.json`

Inspector trace 本身沒有內嵌 URL、commit、revision 或 image digest；`d0fe4df`／
`0000004` 的對應來自同一測試 session 的部署紀錄，所以應標示為 correlated evidence，
不得寫成自包含的 cryptographic linkage。

## 2026-07-30：P0 release 已取得同版本 E3

最終 release `8e89e6519406388a0de8c456a890d6fcc8cc5544`／`v3-p0-release.1`
已由 workflow run `30549409859` 部署至 revision
`ca-agentready-events--0000006`，image digest 為
`sha256:8f43bff7fad16300e6eb534cbacda4f4e1969112da0be2e0997773cff77aee41`。
`/health/version` 與 artifact 四個座標一致；完整 production smoke 後活動名額仍為 8。

Chrome testing surface 在該 HTTPS `/events` 發現 `search_events`，secure context、
`navigator.modelContext` 與 `navigator.modelContextTesting` 均存在，因此此版本可列
E3。原始輸出保存於
`evidence/runtime/2026-07-30/current-release-e3.json`。

Inspector 側邊面板仍需由使用者在 Chrome UI 開啟並送出 prompt。此時尚無精確
revision 的 Agent trace，所以當天沒有沿用 `d0fe4df` 的兩份歷史 trace 升級為 E4。

## 2026-07-31：最終 release 的兩題 read-only E4

維持同一個 immutable release：

```text
tag       v3-p0-release.1
commit    8e89e6519406388a0de8c456a890d6fcc8cc5544
revision  ca-agentready-events--0000006
digest    sha256:8f43bff7fad16300e6eb534cbacda4f4e1969112da0be2e0997773cff77aee41
run       30549409859
```

在受控交接測試 session 預先開啟最終公開 `/events` 與
`/events/evt-webmcp-intro`。使用者只在 Inspector 輸入自然語言 prompt，沒有在
prompt 提示 Tool 名稱，也沒有手動按下 `Execute Tool`：

1. SEL-01：Agent 選擇 `search_events`，帶入台北、免費、入門 filters，回傳
   2027-01-23 的 WebMCP 入門工作坊並正確整理。
2. SEL-02：Agent 在詳情頁選擇 `get_event_details {}`，回傳相同活動、場地、時間與
   `remainingCapacity=8` 並正確整理。

這兩題各自滿足 User prompt、Tool call、input、Tool result、AI result 五段，故可列
為 current-release E4。原始資料保存於：

- `evidence/agent-invocation/2026-07-31/sel-01-search-events-current-release-e4.txt`
- `evidence/agent-invocation/2026-07-31/sel-02-current-page-current-release-e4.txt`
- `evidence/agent-invocation/2026-07-31/provenance.json`

關聯品質仍是 correlated：截圖與 Copy trace 沒有內嵌 URL、commit、revision 或
digest；精確版本是由受控 session、預先開啟的兩條 public route、2027 fixture 與
既有 release 座標共同建立。這只補上 SEL-01、SEL-02；其餘 18 題、完整三條 Journey、
寫入／確認路徑與 E5 都沒有因此通過。搜尋頁截圖裡的 `E4 TEST TARGET` 是送出這次
trace 前就存在於 immutable revision 的靜態標籤，不代表本文用畫面文案自我認證。

## 下一輪有效重跑

1. 在乾淨 profile 使用相容的 WebMCP Agent，不在 prompt 中提示 Tool 名稱。
2. 從其餘 18 題與三條完整 Journey 繼續；保存 discovered schema、Agent invocation、結果、失敗案例與遮蔽敏感資訊後的原始紀錄。
3. 每一題獨立判定 E4，不用 SEL-01、SEL-02 替其餘案例升級。
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
