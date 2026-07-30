# AgentReady Events V3 重建基線

> 建立日期：2026-07-30  
> 正式來源：`origin/main`  
> 來源 commit：`85c1abb`  
> Worktree branch：`feat/v3-rebuild`  
> Worktree bootstrap：`5ca1468`

## 目的

在移植 V2 產品視覺與重建 Day 01–30 快照前，先固定目前 AgentReady-Events 的
可執行、安全與依賴狀態。後續若出現失敗，必須能判斷是既有問題或重建造成的
回歸。

## 重建前驗證

| Gate | 結果 |
|---|---|
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS：47 files／138 tests |
| `npm run build` | PASS |
| `npm audit` | FAIL：4 high、0 critical |

四個 high findings 來自開發依賴鏈：

- `concurrently` → `shell-quote`
- `eslint` → `minimatch` → `brace-expansion`
- `vite` → `postcss` → `nanoid`

本次未使用 major upgrade，也未直接執行強制修復。`npm audit fix --dry-run`
確認可由相容範圍內的 lockfile 更新處理。

## 依賴修復

| Package | Before | After |
|---|---:|---:|
| `concurrently` | 10.0.3 | 10.0.4 |
| `shell-quote` | 1.8.4 | 1.9.0 |
| `brace-expansion` | 5.0.7 | 5.0.8 |
| `postcss` | 8.5.16 | 8.5.25 |
| `nanoid` | 3.3.15 | 3.3.16 |

## 修復後門檻

依賴修復後必須再次通過：

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm audit
```

`npm audit` 必須為 0 vulnerabilities，且測試與 build 不得退化。
