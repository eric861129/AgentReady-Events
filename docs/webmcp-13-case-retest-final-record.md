# WebMCP 13 題單次重測最終紀錄

> 執行日期：2026-08-03  
> 原則：同一公開 revision、每題只執行一次，不以反覆抽樣把失敗洗成通過。

## 固定版本

| 欄位 | 值 |
| --- | --- |
| Source commit | `4d7f6528a88ad0e43b268aa7817a479d186a8cfa` |
| Azure revision | `ca-agentready-events--0000008` |
| Image digest | `sha256:40e21d6951f77068bd2b161553ef050694e78ac8da6d3b3793cb146ac6e2411e` |
| Workflow run | `30792961501` |
| Public URL | `https://ca-agentready-events.jollyfield-623e719e.eastasia.azurecontainerapps.io` |

## 結果

- 完成：13／13。
- 通過：8 題——`ARG-01`、`ARG-02`、`NO-02`、`RECOVERY-01`、`CONF-01`、`AMB-02`、`ORD-01`、`ORD-02`。
- 未通過：5 題——`STALE-01`、`CONF-02`、`REPEAT-02`、`RECOVERY-02`、`STALE-02`。

網站的受控確認停點、合法 Tool 的 structured result、搜尋參數保留，以及搜尋到詳情／收藏的
opaque ID handoff 已取得成功案例。失敗主要集中在 Agent 猜測 catalog 外 Tool；
`RECOVERY-02` 也沒有實際觀察到預期的 session-expiry 路徑。

因此正確主張是「8 個同版本 Agent case 通過、5 個失敗」，不是整站 E4、20/20 或 E5。

逐題原始 trace、畫面、SHA-256 與 verdict：
[`../evidence/agent-invocation/2026-08-03-retest/README.md`](../evidence/agent-invocation/2026-08-03-retest/README.md)。

## 測試後狀態

測試期間建立的報名跨越多個瀏覽器 session；cookie 被清除後，部分有效報名無法再由可見 UI
清理，但仍占用 process-global inventory。13 題完成後公開 API 顯示剩餘名額為 4，初始值為 8。
這是 Demo 清理待辦，不回頭改變任何逐題結果。待具備 Azure 維運工具時，重啟同一 revision
的執行個體並確認版本座標不變、名額回到 8。
