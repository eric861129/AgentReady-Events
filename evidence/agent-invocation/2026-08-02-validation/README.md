# 2026-08-02 fixed-revision Inspector rerun

這個資料夾只接受下列固定部署的新增證據：

- commit：`4b1324f46255ddf5f80628c84a564d37fa6addb3`
- revision：`ca-agentready-events--0000007`
- workflow run：`30733952974`
- digest：`sha256:d812498aa038787bda92654cf885d9e4af2c2c082aa9262129d158ccdd4d7052`
- URL：`https://ca-agentready-events.jollyfield-623e719e.eastasia.azurecontainerapps.io`

執行方式見 [`docs/webmcp-20-case-execution.md`](../../../docs/webmcp-20-case-execution.md)。
[`preflight-01.json`](preflight-01.json) 已保存固定 revision 的 runtime、可見 WebMCP
capability 與 Inspector 取證路徑限制；它沒有執行 Agent invocation，不屬於任何一題
的通過或失敗。目前尚未保存任何這個 revision 的 Inspector invocation，因此不得宣稱
新的 E4 或 20/20。每一題建立獨立子資料夾，每次重跑新增 attempt 編號；歷史失敗不得
覆蓋。
