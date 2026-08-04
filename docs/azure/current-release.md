# Azure deployment source

- Current release: targeted recovery v2 candidate
- Source commit: `31202dbbc92904d00dd856eb683c618225e677de`
- Deployment status: E3 verified; targeted recovery v2 is 2/5 executed, with `STALE-01-V2` and `CONF-02-V2` passing once each
- Source repository: `https://github.com/eric861129/AgentReady-Events`
- Image: `ghcr.io/eric861129/agentready-events@sha256:f9737a54d079d5a5af4fb23b9e933855cbae89a0f9c8c75fce9f46db2e4257ae`
- Azure revision: `ca-agentready-events--0000009`
- Workflow run: `30867599365`
- Public URL: `https://ca-agentready-events.jollyfield-623e719e.eastasia.azurecontainerapps.io`
- Public `/health/version`: commit and revision match this record.
- CI verification、container smoke、production smoke 與 46 個 Playwright browser tests 全部通過。
- 公開 `/api/session` 顯示受控 evaluation fixture 已啟用；瀏覽器頁面可見「受控測試工具」。
- 初始 server-side inventory 已確認為 8；開始手動測試後必須逐題記錄任何名額變化。
- WebMCP catalog 仍只包含既有五個 Tool；此版本沒有加入第六個 Tool。
- 新題庫為 `evals/dataset/targeted-recovery-v2.json`，目前 2/5 executed；不改寫原始 20 題題庫或 revision `0000008` 的 8 PASS／5 FAIL。
- revision `0000008` 的 final evaluation record: [`../webmcp-13-case-retest-final-record.md`](../webmcp-13-case-retest-final-record.md).
