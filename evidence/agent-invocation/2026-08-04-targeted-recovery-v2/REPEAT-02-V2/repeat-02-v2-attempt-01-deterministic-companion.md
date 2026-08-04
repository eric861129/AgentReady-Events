# REPEAT-02-V2 deterministic companion

- 執行日期：2026-08-04
- 部署 source commit：`31202dbbc92904d00dd856eb683c618225e677de`
- Azure revision：`ca-agentready-events--0000009`
- 本機驗證 commit：`3e389225cbed2399d46d875137e9831bf7c35027`
- 程式差異核對：部署 source commit 到本機驗證 commit 的 `src/`、`tests/`、`package.json`、`package-lock.json` 無差異。

## 指令

```powershell
npx vitest run tests/api/registrations.test.ts --maxWorkers=1 --reporter=verbose
```

## 結果

```text
Test Files  1 passed (1)
Tests       6 passed (6)
Duration    6.20s
```

其中 `decrements inventory on registration and restores it exactly once on cancellation` 驗證：

1. 報名後剩餘名額為 7。
2. 第一次取消使用 server-issued confirmation intent，回 `alreadyCancelled:false`，剩餘名額恢復為 8。
3. 第二次取消必須取得新的 confirmation intent，回 `alreadyCancelled:true`，剩餘名額仍為 8。

另外，直接重播第一次 POST 會重用已消耗的 confirmation intent，預期應回
`FORBIDDEN / CONFIRMATION_INTENT_INVALID`。這是單次確認憑證的安全驗證，不是取消冪等失敗。

## 證據邊界

- Inspector Agent 準備階段與第一個人類確認屬 revision `0000009` 的實際瀏覽器證據。
- 第二次取消與名額只回補一次屬 deterministic E2 companion evidence。
- 不把 deterministic companion test 說成第二次原生 Agent invocation。
