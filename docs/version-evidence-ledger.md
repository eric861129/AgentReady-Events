# 版本證據帳本

> 更新日期：2026-07-30
> 原則：commit、Azure revision、image digest、Inspector trace 必須對到同一個 source state，否則不得互相升級證據。

| 用途 | 精確 commit | 部署座標 | 可主張 | 不可主張 |
| --- | --- | --- | --- | --- |
| 歷史 E3 | `2a2c02701da6a381106c1e24903f0415e03a19b0` | `ca-agentready-events--0000002`、run `29179363328` | 歷史 HTTPS／capability evidence | 新版 E3／E4 |
| 歷史兩題 read-only E4 | `d0fe4df19112d6c4eaac4dee71c55d47d5367c09` | `ca-agentready-events--0000004`、run `30439991021` | SEL-01、SEL-02 各一題 E4 | 20/20、write E4、E5、新版 E4 |
| 重建候選版 | `3a9b1245d6f9f6663554c321de72d98105e59578` | 未做同版本 E4 部署 | 本機 E2 | 用歷史 trace 替它升級 |
| P0 runtime release | `9897bf506986ac45c7037ec6173b7ce8745ed2b9`、`v3-p0-release` | 尚待部署 | 本機 E2；名額、期限、確認意圖已有測試 | E3／E4／E5 |

Machine-readable 版本位於
[`evidence/version-ledger.json`](../evidence/version-ledger.json)。

## 歷史 E4 原始資料

- [`SEL-01 search_events trace`](../evidence/agent-invocation/2026-07-29/sel-01-search-events-e4.txt)
- [`SEL-02 current-page trace`](../evidence/agent-invocation/2026-07-29/sel-02-current-page-e4.txt)
- [`provenance.json`](../evidence/agent-invocation/2026-07-29/provenance.json)

兩份 trace 由 Inspector Copy trace 與原始截圖保存。截圖 SHA-256 已寫入
`provenance.json`。必須主動說明：Inspector 內容本身沒有內嵌 URL、commit、
revision 或 image digest；`d0fe4df`／`0000004` 的關聯來自同一測試 session 的部署紀錄，
因此是 correlated evidence，不是完全自包含證據。

## P0 runtime release 的驗收

`9897bf5` 修正的不是新功能，而是原本產品契約：

1. server-side inventory 在報名成功時扣一，第一次取消時補一，重複取消不再增加。
2. server 與 UI 都使用 deadline 判斷；時鐘可注入並測試截止前後邊界。
3. 最終 mutation 需要綁定 session、action、target 的五分鐘單次 confirmation intent。
4. `interactionMode` 仍只算 audit metadata；confirmation intent 也不等於真實人類身分證明。
5. `/health/version` 提供 sanitized commit、version 與 Azure revision，讓新版部署可自行證明座標。

完成部署後，必須把本表最後一列更新為精確 Azure revision、GHCR digest、workflow run
與公開 `/health/version` 回應。只有 Inspector 在該精確版本留下新 trace，才可把新版
`agent_invocation` 從 pending 改成 E4。
