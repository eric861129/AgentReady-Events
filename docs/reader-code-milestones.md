# 讀者版程式里程碑

> 更新日期：2026-07-30
> 狀態：公開 Repository、`main`、10 組 Day branches 與 annotated tags 均已發布

## 為什麼不是 30 天各一份程式碼

文章共有 30 天，但不是每天都會改程式。觀念拆解、規格判讀、Inspector
操作、Gemini 預算與證據分級，不應為了湊數而複製相同 source state。

本專案只在「讀者切換後，能觀察到有意義的程式或行為差異」時建立里程碑：

- branch 方便讀者探索該階段，名稱可在未發布前修正。
- annotated tag 固定文章引用的精確 commit，不跟著後續修改移動。
- 沒有獨立程式差異的 Day，文章直接引用最接近的里程碑、檔案或測試，不建立假快照。

## 已建立的里程碑

| 文章日次 | Branch | Annotated tag | Commit | 讀者可觀察的差異 |
| --- | --- | --- | --- | --- |
| Day 02 | `day-02-reproducible-baseline` | `v3-day-02` | `7aa4e64` | 固定可重現的相依套件與測試基線 |
| Day 05 | `day-05-copy-change-failure` | `v3-day-05` | `078fe7b` | 重現 Locator 與文案耦合後的失敗 |
| Day 11 | `day-11-declarative-lab` | `v3-day-11` | `5d0e782` | 以表單宣告 `search_events` Tool |
| Day 12 | `day-12-imperative-lifecycle` | `v3-day-12` | `c9191fb` | 註冊、執行、回傳與解除註冊的完整生命週期 |
| Day 14 | `day-14-search-events` | `v3-day-14` | `c9ec850` | 正式活動搜尋 UI、篩選條件與結果 |
| Day 15 | `day-15-current-event-details` | `v3-day-15` | `5912f53` | route-aware 活動詳情與目前頁面上下文 |
| Day 19 | `day-19-prepare-registration` | `v3-day-19` | `d7e93d6` | Agent 準備報名資料，人類執行最後送出 |
| Day 20 | `day-20-prepare-cancellation` | `v3-day-20` | `81f807d` | 取消後果、稽核資訊與 human confirmation |
| Day 21 | `day-21-trusted-journeys` | `v3-day-21` | `e3112d0` | 三條 Journey 共用的人類／Agent 操作時間線 |
| Day 25 | `day-25-rebuild-release-candidate` | `v3-day-25` | `3a9b124` | 經測試與無障礙修正後的部署候選版本 |

## 讀者版 Lab 路徑

`main` 提供與文章日次一致的固定入口。讀者不必理解內部模組如何重用，只要依文章
開啟下列路徑即可：

| 文章日次 | 讀者版路徑 | 驗證主題 |
| --- | --- | --- |
| Day 04 | `labs/day-04-playwright-locator/` | Locator 對 DOM 與 accessible name 的耦合 |
| Day 07 | `labs/day-07-semantic-form/` | 語意表單與 human fallback |
| Day 11 | `labs/day-11-declarative-tool/` | Declarative Tool 與表單契約 |
| Day 12 | `labs/day-12-imperative-lifecycle/` | Imperative Tool 註冊、執行與解除註冊 |

Git branch 與 annotated tag 仍固定重要程式里程碑；讀者版 Lab 路徑則以 `main`
為準，避免文章日次和操作入口產生不必要的認知負擔。

## 沒有獨立 ref 的 Day

- Day 01、03–04、06–10、13：問題設定、規格、證據座標與產品決策，沒有獨立 source delta。
- Day 16–18：Tool contract、失敗語意與收藏能力主要來自既有架構；新版沒有可誠實切出的單一新增 commit。
- Day 22–24、26–30：feature freeze、驗證、安全、部署、Inspector、Gemini 與 E4 證據屬於流程或紀錄，不是假裝成產品程式改版。
- Day 30 是系列回顧，不新增第六個 Tool，也不建立程式 branch。

若後續真的補上可獨立驗證的程式差異，才新增對應里程碑；不回頭為文章排版補造 commit。

## 讀者切換方式

```powershell
git fetch --all --tags
git switch day-14-search-events
```

若要完全重現文章引用的固定版本，使用 tag：

```powershell
git switch --detach v3-day-14
```

回到最新版：

```powershell
git switch main
```

## 公開匿名重播

2026-07-30 從全新、無既有工作目錄的匿名 clone 實際重播：

1. Day 02：47 files／138 tests 與 production build 通過。
2. Day 11：1 unit 與 1 browser test 通過；若本機 `5173` 已被其他服務占用，
   可透過 `PLAYWRIGHT_WEB_PORT` 改用其他 port 重播。
3. Day 14：2 個 focused files／6 tests 與 4 browser tests 通過。
4. Day 25：`npm run verify` 全程通過，包括 47 files／138 deterministic tests、
   11 API tests、6 security tests、36 browser tests 與 production build。

當時的正式發布版本另以 `v3-p0-release.1` 固定；它加入部署 smoke 自行恢復名額的
驗證責任，不移動任何 Day tag。20 題原生 Agent 驗收則固定在 commit `4b1324f`、
Azure revision `ca-agentready-events--0000007`；兩者是不同時間點的證據座標，不得混用。
