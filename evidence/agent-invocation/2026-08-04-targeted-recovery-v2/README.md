# WebMCP targeted recovery v2 重測紀錄

> 重測日期：2026-08-04～2026-08-05
> 執行原則：每個 v2 case 只執行一次；revision `0000008` 的 8 PASS／5 FAIL 維持原樣。

## 固定版本座標

| 項目 | 值 |
| --- | --- |
| Source commit | `31202dbbc92904d00dd856eb683c618225e677de` |
| Azure revision | `ca-agentready-events--0000009` |
| Image digest | `sha256:f9737a54d079d5a5af4fb23b9e933855cbae89a0f9c8c75fce9f46db2e4257ae` |
| Workflow run | `30867599365` |
| Public URL | `https://ca-agentready-events.jollyfield-623e719e.eastasia.azurecontainerapps.io` |
| Initial remaining capacity | `8` |

`RECOVERY-02-V2` 因一鍵 expiry fixture 在下一個受控驗收版完成，使用以下同站新
revision；前四題的 revision `0000009` 證據維持原樣：

| 項目 | `RECOVERY-02-V2` 值 |
| --- | --- |
| Source commit | `243a8d343b346ba43178dd95bd825c9a56f122b3` |
| Azure revision | `ca-agentready-events--0000010` |
| Image digest | `sha256:1630235f9ad2a8cbab5ade3e582d6dd564d7a5e7d229cc08f6cd785fb0ffaddb` |
| Workflow run | `30893507987` |
| Public URL | `https://ca-agentready-events.jollyfield-623e719e.eastasia.azurecontainerapps.io` |
| Initial remaining capacity | `8` |

## 執行進度

| 順序 | Case | 狀態 | 備註 |
| ---: | --- | --- | --- |
| 1 | `STALE-01-V2` | **PASS** | 詳情頁以 `{}` 讀取；換回列表後沿用同一個 opaque event ID；沒有收藏或猜測 catalog 外 Tool |
| 2 | `CONF-02-V2` | **PASS** | 只呼叫取消準備 Tool；顯示正確摘要並停在可見人類確認，零取消 POST |
| 3 | `STALE-02-V2` | **PASS** | 重新整理後只呼叫取消準備 Tool；解析目前唯一有效報名並停在確認前，零取消 POST |
| 4 | `REPEAT-02-V2` | **PASS** | Agent 只準備取消並停在人類確認；第一次人工取消成功；重播已消耗 intent 被安全拒絕，另以 fresh intent 的 deterministic companion 驗證重複取消回 `alreadyCancelled:true` 且名額只回補一次 |
| 5 | `RECOVERY-02-V2` | **PASS** | 只呼叫取消準備 Tool；回 `UNAUTHORIZED / SESSION_EXPIRED / retryable:false` 並要求重新開始，沒有猜測 catalog 外 Tool；零 mutation 由同 revision browser companion 驗證 |

每一題的原始 Copy trace、畫面與判定保存在同名子資料夾。PASS 只適用於該題、
該次 Agent invocation 與上述固定 revision，不代表尚未執行的題目或 E5。

目前 5／5 題均已完成並通過。這只代表 targeted recovery v2 題庫在各自記錄的固定
revision 通過，不會覆寫 revision `0000008` 的 8 PASS／5 FAIL，也不代表 E5。
