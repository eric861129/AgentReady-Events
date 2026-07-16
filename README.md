# AgentReady Events：Day 1 基線

這是《網站不只給人用：30 天打造 AI Agent 看得懂的 WebMCP 網站》的第一個可執行 checkpoint。今天只確認環境、首頁、測試與 production build 都能正常運作；Browser Automation 與 WebMCP 會從後續分支逐步加入。

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

## 接到 Day 2

下一篇會從這個 checkpoint 建立 `day-02`，加入 Actuation Failure Lab。你會先用 Locator 找到「搜尋活動」，再把按鈕改成「探索場次」，觀察同一條 Browser Automation 操作為什麼失敗。
