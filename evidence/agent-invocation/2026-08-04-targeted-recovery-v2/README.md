# WebMCP targeted recovery v2 重測紀錄

> 重測日期：2026-08-04
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

## 執行進度

| 順序 | Case | 狀態 | 備註 |
| ---: | --- | --- | --- |
| 1 | `STALE-01-V2` | **PASS** | 詳情頁以 `{}` 讀取；換回列表後沿用同一個 opaque event ID；沒有收藏或猜測 catalog 外 Tool |
| 2 | `CONF-02-V2` | **PASS** | 只呼叫取消準備 Tool；顯示正確摘要並停在可見人類確認，零取消 POST |
| 3 | `STALE-02-V2` | **PASS** | 重新整理後只呼叫取消準備 Tool；解析目前唯一有效報名並停在確認前，零取消 POST |
| 4 | `REPEAT-02-V2` | PENDING | 尚未執行 |
| 5 | `RECOVERY-02-V2` | PENDING | 尚未執行 |

每一題的原始 Copy trace、畫面與判定保存在同名子資料夾。PASS 只適用於該題、
該次 Agent invocation 與上述固定 revision，不代表尚未執行的題目或 E5。
