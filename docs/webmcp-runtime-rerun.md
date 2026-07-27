# WebMCP runtime rerun record

## 2026-07-27：E3 capability discovery

以 Chrome `150.0.7871.125`、公開 HTTPS `/events`、新的瀏覽器 profile，並啟用 Chrome 文件所述的 WebMCP testing flags 進行重跑。頁面是 secure context，`originAgentCluster` 為 `true`，`document.modelContext` 與 `navigator.modelContextTesting` 都可觀察到；testing surface 的 `listTools()` 回傳 `search_events` 與其 schema。

這是 E3：瀏覽器 testing surface 可以發現工具。它不是 E4，因為沒有相容 Agent 在未被提示 Tool 名稱的情況下，真實選擇並呼叫工具。直接呼叫 testing API 或 `executeTool()` 都只能用於除錯，不能當成 Agent invocation evidence。

## 與 Day 27 baseline 的關係

Day 27 的 0/20 environment-classified baseline 保持不變：當時的 Codex surface 沒有 discovery，因此沒有可評分的 invocation。這次重跑只補充 browser capability 座標，不會回寫為 20 題 Agent 成功。

目前公開 Azure artifact 仍落後本機 source：公開頁面沒有 `toolautosubmit`，而正式搜尋表單已在 `a29135b3e674e741dc6637ed01b26648e4564ebc` 加上該屬性。因此，在取得作者授權部署該 revision 前，不會對公開站宣稱 declarative execution 已驗證。

## 下一次有效的 E4 重跑

1. 以作者授權將含 `toolautosubmit` 的 revision 部署至公開 HTTPS origin，並記錄 commit、瀏覽器版本與 Origin Trial 狀態。
2. 在乾淨 profile 使用相容的 WebMCP Agent（例如官方 Inspector 搭配其要求的模型設定），不在 prompt 中提示 Tool 名稱。
3. 固定二十題、三條 Journey 與資料集；保存 discovered schema、Agent invocation、結果、失敗案例與遮蔽敏感資訊後的原始紀錄。
4. 僅在上述紀錄完整時，將結果從 E3 升為 E4；另以獨立乾淨環境重播才可主張 E5。

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
