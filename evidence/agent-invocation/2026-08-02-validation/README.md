# 2026-08-02 fixed-revision Inspector campaign（已封存）

這個資料夾保存下列固定部署的 preflight 與停止複測決策：

- commit：`4b1324f46255ddf5f80628c84a564d37fa6addb3`
- revision：`ca-agentready-events--0000007`
- workflow run：`30733952974`
- digest：`sha256:d812498aa038787bda92654cf885d9e4af2c2c082aa9262129d158ccdd4d7052`
- URL：`https://ca-agentready-events.jollyfield-623e719e.eastasia.azurecontainerapps.io`

原規劃的執行方式見 [`docs/webmcp-20-case-execution.md`](../../../docs/webmcp-20-case-execution.md)。
[`preflight-01.json`](preflight-01.json) 已保存固定 revision 的 runtime、可見 WebMCP
capability 與 Inspector 取證路徑限制；它沒有執行 Agent invocation，不屬於任何一題
的通過或失敗。2026-08-02 決定停止追加 Inspector 複測；本批次以 `0/20 executed`
封存，因此不得宣稱新的 E4、20/20 或 E5。沒有建立 CASE 子資料夾，也沒有移入歷史
trace。完整逐題結論見
[`docs/webmcp-20-case-final-record.md`](../../../docs/webmcp-20-case-final-record.md)。
