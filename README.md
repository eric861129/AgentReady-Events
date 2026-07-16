# AgentReady Events：Day 2 操作失敗實驗

這是《網站不只給人用：30 天打造 AI Agent 看得懂的 WebMCP 網站》的第二個可執行 checkpoint。它保留 Day 1 的環境基線，再加入 Playwright Actuation Failure Lab：同一個搜尋功能，只改按鈕文案與 DOM 包裝，舊 Locator 就會真的逾時。

## 從 Day 1 接著做

如果你昨天是用 Git clone 取得 `day-01`，在同一個 `AgentReady-Events` 目錄執行：

```powershell
git fetch origin day-02
git switch day-02
npm ci
```

`day-02` 直接建立在 `day-01` 上，所以不必重建專案。`npm ci` 仍建議執行一次，用 lockfile 確認本機依賴與 checkpoint 一致。

也可以直接查看 [`day-02` 分支](https://github.com/eric861129/AgentReady-Events/tree/day-02)，或[下載 Day 2 ZIP](https://github.com/eric861129/AgentReady-Events/archive/refs/heads/day-02.zip)。Fresh clone 指令如下：

```powershell
git clone --branch day-02 --single-branch https://github.com/eric861129/AgentReady-Events.git
Set-Location AgentReady-Events
npm ci
npx playwright install chromium
```

## 手動操作 Day 2 Lab

先啟動 Vite：

```powershell
npm run dev
```

依序開啟兩個網址：

- 原始版：`http://127.0.0.1:5173/labs/day-02-actuation/index.html`
- 改版後：`http://127.0.0.1:5173/labs/day-02-actuation/index.html?variant=renamed`

兩頁都輸入 `WebMCP`。原始版按鈕是「搜尋活動」，改版後是「探索場次」；兩者由人類點擊都會顯示「人類操作已完成：1 場」。這一步先證明網站功能沒有壞。

## 重播 Playwright 成功與失敗

在另一個終端機執行四段實驗：

```powershell
npx playwright test tests/browser/day-02-actuation.spec.ts --reporter=line
```

測試會印出這段受控錯誤，最後仍以四個案例通過結束：

```text
[預期失敗] locator.click: Timeout 500ms exceeded.
4 passed
```

想看瀏覽器實際操作，可加上 `--headed`：

```powershell
npx playwright test tests/browser/day-02-actuation.spec.ts --headed --reporter=line
```

想保留完整錯誤與步驟，改用 HTML report：

```powershell
npx playwright test tests/browser/day-02-actuation.spec.ts --reporter=html
npx playwright show-report
```

在第二個案例的 Attachments 可以開啟 `old-locator-timeout.txt`。它是 Playwright 真正丟出的 TimeoutError，不是文章手寫的模擬訊息。

第四個案例會顯示 `E2 synthetic Agent submission（非真實 Agent invocation）`。這只是讓測試固定比較 UI Locator 與 Declarative contract 的對照 fixture；它沒有證明 Agent discovery，也沒有證明真實 Agent 呼叫成功。Day 8 才會從零拆解 Declarative API。

## 取得 Day 1 範例

- [在 GitHub 查看 `day-01` 分支](https://github.com/eric861129/AgentReady-Events/tree/day-01)
- [直接下載 `day-01` ZIP](https://github.com/eric861129/AgentReady-Events/archive/refs/heads/day-01.zip)

熟悉 Git 的讀者可以只 clone 這個分支：

```powershell
git clone --branch day-01 --single-branch https://github.com/eric861129/AgentReady-Events.git
Set-Location AgentReady-Events
```

如果使用 ZIP，請先解壓縮，再從終端機進入解壓後的 `AgentReady-Events-day-01`。ZIP 不包含 `.git`，因此不需要執行 `git switch` 或其他 Git 指令。

## 環境需求

- Node.js `>= 22.12.0`
- npm（隨 Node.js 安裝）
- Git（只有 clone 路線需要）

先確認版本：

```powershell
node --version
npm --version
```

## 安裝

在專案根目錄執行：

```powershell
npm ci
npx playwright install chromium
```

`npm ci` 會依 `package-lock.json` 安裝固定版本。Chromium 在 Day 1 的首頁啟動不會用到，但 Day 2 會以 Playwright 重現 Locator 成功與失敗；先安裝後，下一篇可以直接開始實驗。

## 啟動首頁

```powershell
npm run dev
```

終端機應顯示類似結果：

```text
VITE ready
Local: http://127.0.0.1:5173/
```

開啟 `http://127.0.0.1:5173/`，頁面應出現：

- 標題「AgentReady Events：Day 1 基線」
- 狀態「尚未進行 Agent discovery」
- 後續會完成的五項網站能力

五個名稱只是系列範圍。Day 1 還沒有註冊 WebMCP Tool，也沒有執行 Agent discovery 或 invocation。

## 驗證基線

保留開發伺服器，在另一個終端機執行：

```powershell
npm run typecheck
npm test
npm run test:e2e
npm run build
```

預期看到 Vitest 與 Playwright 測試通過，`dist/` 產生 production bundle。這些結果證明專案能啟動、測試與建置，不代表 WebMCP Agent 已經呼叫網站能力。

## 常見問題

### `npm ci` 顯示 Node 版本不符

執行 `node --version`。若低於 22.12，先升級 Node.js，再重新安裝依賴。

### Chromium executable 不存在

```powershell
npx playwright install chromium
```

### 5173 port 已被使用

停止占用 `127.0.0.1:5173` 的既有開發伺服器，再重新執行 `npm run dev`。不要任意改 port 後仍沿用文章網址。

## Day 1 的原始基線

`day-01` 仍保留在獨立分支，方便比較加入 Actuation Failure Lab 前後的差異。Day 3 會以今天的失敗面為起點，整理 WebMCP surface 與目前能驗證到的證據邊界。
