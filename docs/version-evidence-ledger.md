# 版本證據帳本

> 更新日期：2026-08-04
> 原則：commit、Azure revision、image digest、Inspector trace 必須對到同一個 source state，否則不得互相升級證據。

| 用途 | 精確 commit | 部署座標 | 可主張 | 不可主張 |
| --- | --- | --- | --- | --- |
| 歷史 E3 | `2a2c02701da6a381106c1e24903f0415e03a19b0` | `ca-agentready-events--0000002`、run `29179363328` | 歷史 HTTPS／capability evidence | 新版 E3／E4 |
| 歷史兩題 read-only E4 | `d0fe4df19112d6c4eaac4dee71c55d47d5367c09` | `ca-agentready-events--0000004`、run `30439991021` | SEL-01、SEL-02 各一題 E4 | 20/20、write E4、E5、新版 E4 |
| 重建候選版 | `3a9b1245d6f9f6663554c321de72d98105e59578` | 未做同版本 E4 部署 | 本機 E2 | 用歷史 trace 替它升級 |
| P0 首次部署 | `9897bf506986ac45c7037ec6173b7ce8745ed2b9`、`v3-p0-release` | `ca-agentready-events--0000005`、run `30548558072` | E2、E3；暴露 smoke 留下報名副作用 | 正式最終版、E4、E5 |
| P0 最終 release | `8e89e6519406388a0de8c456a890d6fcc8cc5544`、`v3-p0-release.1` | `ca-agentready-events--0000006`、run `30549409859`、digest `sha256:8f43bff7fad16300e6eb534cbacda4f4e1969112da0be2e0997773cff77aee41` | E2、E3；完整 smoke 後名額仍為 8；SEL-01、SEL-02 各一題 current-release read-only E4 | 20/20、完整 Journey、write E4、E5 |
| 20 題固定驗收 release（已封存） | `4b1324f46255ddf5f80628c84a564d37fa6addb3` | `ca-agentready-events--0000007`、run `30733952974`、digest `sha256:d812498aa038787bda92654cf885d9e4af2c2c082aa9262129d158ccdd4d7052` | E2、E3；immutable deployment、production smoke、受控 `RECOVERY-02` fixture | 本批次未執行逐題 Inspector 重跑，不得主張任何新 E4、20/20 或 E5 |
| 13 題單次重測 release | `4d7f6528a88ad0e43b268aa7817a479d186a8cfa` | `ca-agentready-events--0000008`、run `30792961501`、digest `sha256:40e21d6951f77068bd2b161553ef050694e78ac8da6d3b3793cb146ac6e2411e` | E2、E3；13 題同版本 Inspector trace，8 PASS／5 FAIL | 未執行的 7 題、20/20、跨環境成功率、E5 |
| targeted recovery v2 release | `31202dbbc92904d00dd856eb683c618225e677de` | `ca-agentready-events--0000009`、run `30867599365`、digest `sha256:f9737a54d079d5a5af4fb23b9e933855cbae89a0f9c8c75fce9f46db2e4257ae` | E2、E3；完整自動化、production smoke、受控 fixture 可見、初始名額 8；`STALE-01-V2` 單題 E4 | 其餘 4 題尚未執行，不能主張整批成功率或 E5 |

Machine-readable 版本位於
[`evidence/version-ledger.json`](../evidence/version-ledger.json)。

## Targeted recovery v2 release

run `30867599365` 將 commit `31202dbbc92904d00dd856eb683c618225e677de`
以 immutable digest `sha256:f9737a54d079d5a5af4fb23b9e933855cbae89a0f9c8c75fce9f46db2e4257ae`
部署為 revision `ca-agentready-events--0000009`。公開 `/health/version` 回傳相同
commit 與 revision；evaluation fixture 已啟用，公開頁面可見「受控測試工具」，初始
`remainingCapacity` 為 8。

這個版本仍維持五個 Tool：`search_events`、`get_event_details`、`save_event`、
`prepare_event_registration`、`prepare_registration_cancellation`。新的
[`targeted-recovery-v2.json`](../evals/dataset/targeted-recovery-v2.json) 是獨立題庫，
原始 20 題與 revision `0000008` 的 8 PASS／5 FAIL 均未改寫。`STALE-01-V2`
已在同版本 Inspector 執行一次並通過；原始 trace 與判定保存在
[`2026-08-04-targeted-recovery-v2`](../evidence/agent-invocation/2026-08-04-targeted-recovery-v2/README.md)。
其餘四題仍是 PENDING，不能由這一題推論整批成功率。

## 歷史 E4 原始資料

- [`SEL-01 search_events trace`](../evidence/agent-invocation/2026-07-29/sel-01-search-events-e4.txt)
- [`SEL-02 current-page trace`](../evidence/agent-invocation/2026-07-29/sel-02-current-page-e4.txt)
- [`provenance.json`](../evidence/agent-invocation/2026-07-29/provenance.json)

兩份 trace 由 Inspector Copy trace 與原始截圖保存。截圖 SHA-256 已寫入
`provenance.json`。必須主動說明：Inspector 內容本身沒有內嵌 URL、commit、
revision 或 image digest；`d0fe4df`／`0000004` 的關聯來自同一測試 session 的部署紀錄，
因此是 correlated evidence，不是完全自包含證據。

## P0 最終 release 的 E4 原始資料

- [`SEL-01 search_events trace`](../evidence/agent-invocation/2026-07-31/sel-01-search-events-current-release-e4.txt)
- [`SEL-02 current-page trace`](../evidence/agent-invocation/2026-07-31/sel-02-current-page-current-release-e4.txt)
- [`provenance.json`](../evidence/agent-invocation/2026-07-31/provenance.json)

2026-07-31 在預先開啟的最終公開 `/events` 與
`/events/evt-webmcp-intro` 分頁，用 Inspector 送出固定 prompt。Agent 未被提示
Tool 名稱，仍分別選擇 `search_events` 與 `get_event_details {}`；Tool result 與
最終回答也對上最終版的 2027 活動資料，因此這兩個 case 可列為 current-release E4。

證據仍標為 correlated：截圖與 Copy trace 沒有自行嵌入網址列、commit、revision
或 digest，精確版本關聯來自受控交接測試 session、預先開啟的兩條公開 route 與
相符的 2027 fixture。這不會把其餘 18 題、完整 Journey、write path 或 E5 一起升級。

## P0 runtime release 的驗收

`9897bf5` 修正的不是新功能，而是原本產品契約：

1. server-side inventory 在報名成功時扣一，第一次取消時補一，重複取消不再增加。
2. server 與 UI 都使用 deadline 判斷；時鐘可注入並測試截止前後邊界。
3. 最終 mutation 需要綁定 session、action、target 的五分鐘單次 confirmation intent。
4. `interactionMode` 仍只算 audit metadata；confirmation intent 也不等於真實人類身分證明。
5. `/health/version` 提供 sanitized commit、version 與 Azure revision，讓新版部署可自行證明座標。

第一次部署到 revision `0000005` 後，公開名額由 8 變成 7。根因不是產品 API，而是
deployment smoke 的 Journey B 建立報名後沒有清理。`8e89e65` 讓會改名額的 Journey
在同一 session 完成取消，並將共享 inventory 的 browser suite 固定單 worker；
多 session 最後一個名額的競爭仍由 API 測試獨立覆蓋。

最終 revision `0000006` 的 `/health/version` 回傳 commit `8e89e65...` 與正確
revision，HTTPS runtime、三條 Journey、session isolation、Agent finalization
拒絕均通過；smoke 結束後公開活動仍有 8 個名額。Chrome testing surface 又在該
HTTPS `/events` 發現 `search_events`，因此可列 E3。2026-07-31 的兩份 Inspector
trace 再讓 SEL-01 與 SEL-02 分別取得 current-release E4；其他 case 仍維持未重跑。

## 20 題固定驗收 release

run `30733952974` 將 commit `4b1324f46255ddf5f80628c84a564d37fa6addb3`
以 immutable digest `sha256:d812498aa038787bda92654cf885d9e4af2c2c082aa9262129d158ccdd4d7052`
部署為 revision `ca-agentready-events--0000007`。GitHub Actions 已重新通過完整
verification、Linux container smoke、restricted Bicep what-if 與 production smoke；
公開 `/health/version` 也回傳相同 commit 與 revision。

這個 revision 只為 `RECOVERY-02` 顯式開啟受控 current-session expiry fixture；
fixture 仍要求同 session CSRF 與 `interactionMode: "human"`，不能指定或終止其他 session。
部署 artifact 原樣保存在 `evidence/github-run-30733952974/`。桌面控制未能安全操作
Inspector 側邊面板；依 2026-08-02 的停止複測決策，本批次以 `0/20 executed` 封存。
歷史 trace 沒有搬入，未重跑題目也沒有標成成功。完整逐題紀錄見
[`webmcp-20-case-final-record.md`](webmcp-20-case-final-record.md)。
