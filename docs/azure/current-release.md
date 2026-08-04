# Azure deployment source

- Current release: 13-case single-run Inspector retest revision
- Source commit: `4d7f6528a88ad0e43b268aa7817a479d186a8cfa`
- Deployment status: E3 verified; 13/13 Inspector cases executed once, 8 passed and 5 failed; no 20/20 or E5 claim
- Source repository: `https://github.com/eric861129/AgentReady-Events`
- Image: `ghcr.io/eric861129/agentready-events@sha256:40e21d6951f77068bd2b161553ef050694e78ac8da6d3b3793cb146ac6e2411e`
- Azure revision: `ca-agentready-events--0000008`
- Workflow run: `30792961501`
- Public URL: `https://ca-agentready-events.jollyfield-623e719e.eastasia.azurecontainerapps.io`
- Public `/health/version`: commit and revision match this record.
- Raw trace、screenshot 與逐題 verdict 全部保存在同一個固定 revision 座標下。
- 這 8 題通過只證明對應案例的同版本 Agent invocation，不代表整站、20 題或跨環境 E5。
- 測試後 server-side inventory 尚待重啟同一 revision 清理；這項維運待辦不改變逐題判定。
- Final evaluation record: [`../webmcp-13-case-retest-final-record.md`](../webmcp-13-case-retest-final-record.md).
