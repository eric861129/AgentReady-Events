# Azure deployment source

- Current release: targeted recovery v2 final controlled release
- Source commit: `243a8d343b346ba43178dd95bd825c9a56f122b3`
- Deployment status: E3 verified; `RECOVERY-02-V2` passed once with Inspector and same-revision browser companion evidence
- Source repository: `https://github.com/eric861129/AgentReady-Events`
- Image: `ghcr.io/eric861129/agentready-events@sha256:1630235f9ad2a8cbab5ade3e582d6dd564d7a5e7d229cc08f6cd785fb0ffaddb`
- Azure revision: `ca-agentready-events--0000010`
- Workflow run: `30893507987`
- Public URL: `https://ca-agentready-events.jollyfield-623e719e.eastasia.azurecontainerapps.io`
- Public `/health/version`: commit and revision match this record.
- Immutable evidence snapshot: `v3-evidence-release.1`（只封存文件與證據；runtime source 仍以上述 commit、digest 與 revision 為準）。
- CI verification、container smoke 與 production smoke 全部通過。
- 公開 `/api/session` 顯示受控 evaluation fixture 已啟用；瀏覽器頁面可見「受控測試工具」。
- 初始 server-side inventory 已確認為 8；開始手動測試後必須逐題記錄任何名額變化。
- WebMCP catalog 仍只包含既有五個 Tool；此版本沒有加入第六個 Tool。
- 新題庫為 `evals/dataset/targeted-recovery-v2.json`；前四題記錄在 revision `0000009`，最後一題記錄在 revision `0000010`，整批 5／5 均已完成。這不改寫原始 20 題題庫或 revision `0000008` 的 8 PASS／5 FAIL，也不代表 E5。
- 完整跨版本結果見 [`../version-evidence-ledger.md`](../version-evidence-ledger.md) 與 [`../../evidence/agent-invocation/2026-08-04-targeted-recovery-v2/README.md`](../../evidence/agent-invocation/2026-08-04-targeted-recovery-v2/README.md)。
- revision `0000008` 的 final evaluation record: [`../webmcp-13-case-retest-final-record.md`](../webmcp-13-case-retest-final-record.md).

## Rollback coordinate

- 前一個已知良好 runtime source：`31202dbbc92904d00dd856eb683c618225e677de`
- 前一個 Azure revision：`ca-agentready-events--0000009`
- 前一個 immutable image digest：`sha256:f9737a54d079d5a5af4fb23b9e933855cbae89a0f9c8c75fce9f46db2e4257ae`
- 對應 workflow run：`30867599365`

本文件只記錄回滾座標，沒有執行回滾。實際處理時，先確認舊 revision 仍存在且可接流量；
若需重新部署，必須從 GitHub Actions 手動以完整 source commit 觸發，不能用移動中的
`main` 代替 immutable ref。重新部署會建立新的 Azure revision，不能沿用 `0000009`
冒充同一個 runtime。
