# AgentReady Events

AgentReady Events 是《網站不只給人用：30 天做一個 Agent-ready 網站，驗證 WebMCP 到底做得到哪裡》的可執行範例專案。Day 2 先用 Playwright 拆解 UI Locator；Day 7–12 使用隔離 Lab 說明 Semantic HTML、Declarative API 與 Imperative API；Day 13–22 把相同觀念放進正式活動網站；Day 23–29 再處理測試、安全、部署與 Eval。

文章不是另一套示意程式。文章中的檔案路徑、Tool 名稱、命令與錯誤結果都以這個 repository 為準，雙向對照見文章專案的 `docs/article-project-mapping.md`。

## 目前產品邊界

正式 catalog 固定五項 Tool：

1. `search_events`
2. `get_event_details`
3. `save_event`
4. `prepare_event_registration`
5. `prepare_registration_cancellation`

報名與取消只有 prepare Tool。受控 UI Journey 會在使用者按下可見按鈕後，向 server 取得綁定 session、action 與 target 的短效單次確認意圖，再執行最後 mutation；`submit_registration` 與 `cancel_registration` 不屬於正式 catalog。這個 Demo 停點可被測試，但不等於 server 能以密碼學方式證明「真的由人類點擊」。完整 freeze 見 [FEATURE_FREEZE.md](FEATURE_FREEZE.md)。

## 技術架構

- Client：TypeScript、Vite、原生 DOM API
- Server：Express、TypeScript
- WebMCP：Declarative form、Imperative Tool factory、registry adapter
- Tests：Vitest、Supertest、Playwright
- Build：Vite client bundle、esbuild server bundle
- Deployment：Docker、GHCR、GitHub Actions OIDC、Azure Container Apps
- Evidence：JSON schema、raw browser capture、machine-readable verification record

人類 UI 與 Tool 共用 `src/client/services/` 的 action。REST API 仍是資料來源；WebMCP 沒有取代 server authorization，也沒有讓 client 取得額外權限。

## 環境需求

- Node.js `>= 22.12.0`
- npm（隨 Node 安裝）
- Git
- Playwright 管理的 Chromium

目前 `package.json` 鎖定 `@playwright/test 1.61.1`。瀏覽器實際版本以 `npx playwright --version` 與當次 evidence 為準，不要把文章截圖中的版本當成永久需求。

Docker 與 Azure CLI 只在本機重播 container／Azure 流程時需要。一般 Lab、開發、build 與測試不依賴 Azure credential。

## 從零安裝

```powershell
git clone https://github.com/eric861129/AgentReady-Events.git
Set-Location AgentReady-Events
npm ci
npx playwright --version
npx playwright install --list
npx playwright install chromium
```

第一次先跑快速檢查：

```powershell
npm run typecheck
npm test
npm run build
```

## 啟動網站

```powershell
npm run dev
```

啟動後可開啟：

- Web：`http://127.0.0.1:5173/events`
- API health：`http://127.0.0.1:3000/health/live`
- 版本座標：`http://127.0.0.1:3000/health/version`
- Production build：先執行 `npm run build`，再執行 `npm start`

Vite 會把 `/api` 與 `/health` proxy 到 `127.0.0.1:3000`。若 3000 或 5173 已被占用，先停止既有 process；不要隨意改 port 後仍沿用文章中的 URL。

## 文章使用的隔離 Labs

執行 `npm run dev` 後，可由 Vite 直接開啟：

| Day | URL | 重點 |
| ---: | --- | --- |
| 04 | `/labs/day-04-playwright-locator/` | role Locator、accessible name 與 CSS Selector 修改前後實驗 |
| 07 | `/labs/day-07-semantic-form/` | Semantic form 與 human fallback |
| 11 | `/labs/day-11-declarative-tool/` | `toolautosubmit`、表單契約與 human fallback |
| 12 | `/labs/day-12-imperative-lifecycle/` | register、execute、route leave、abort 與 unregister |

部分 Lab 會使用 synthetic event 或直接 `execute()` 固定 Tool 行為。它們屬於 E2 test harness，不是真實 Agent invocation。Day 4 沒有 Tool submission，只驗證 Playwright 對 UI 的操作。

Day 4 focused spec：

```powershell
npx playwright test tests/browser/reader-facing-labs.spec.ts --grep "Day 4" --reporter=line
npx playwright test tests/browser/reader-facing-labs.spec.ts --grep "Day 4" --headed --workers=1
npx playwright test tests/browser/reader-facing-labs.spec.ts --grep "Day 4" --debug --workers=1
```

四個案例分開比較原始介面、只增加 DOM wrapper、只修改 visible name，以及直接子元素 CSS Selector。兩個預期失敗都會留下 Playwright 的真實 TimeoutError attachment。

若要重新產生文章第 7 節使用的 2×2 實測矩陣，先把文章 repository 路徑交給 evidence test：

```powershell
$env:ARTICLE_REPO_ROOT = (Resolve-Path "..\WEBMCP-iThome-2026-Draft").Path
npm run evidence:articles -- --grep "four distinct locator experiments"
```

這個命令會依序重播原始介面、DOM 包裝、文案改名與直接子元素 CSS Selector 四個案例。矩陣裡的頁面、Timeout 與修正結果都來自這次執行，並連同 evidence JSON 寫入文章 repository。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript no-emit check |
| `npm test` | Unit、contract、integration、security 等 Vitest tests，不含 browser/evidence |
| `npm run test:api` | API tests |
| `npm run test:e2e` | 產品與 Labs 的 Playwright browser tests |
| `npm run build` | Client 與 server production build |
| `npm run verify` | 依固定順序執行 lint、typecheck、tests、security、E2E、build，並寫入 verification JSON |
| `npm run evals:validate` | 驗證固定 20 題 Eval dataset 與結果格式 |
| `npm run evidence:articles` | 產生文章用 raw browser captures 與 assertion JSON |
| `npm run evidence:collect -- --day 29` | 驗證並彙整 evidence，不補寫缺少的成功 |
| `npm run smoke:container` | 在已啟動 container 上執行 smoke plan |
| `npm run smoke:azure` | 對指定 Azure URL 執行 HTTPS checks |

完整驗證：

```powershell
npm run verify
npm run evals:validate
```

## 測試 Fixtures

- 活動：`src/shared/fixtures.ts`
- 惡意活動文案：`src/shared/security-fixtures.ts`
- Failure Lab：`src/server/failure/failure-policy.ts`
- Eval dataset：`evals/dataset/webmcp-evals.json`
- Browser Journey：`tests/browser/journeys.spec.ts`

Failure Lab 只能由 test code 注入。Query string 或 request header 不能啟用它，避免公開網站出現測試後門。

`RECOVERY-02` 另有一個預設關閉的 current-session fixture。只有設定
`ENABLE_EVALUATION_FIXTURES=true` 時，`POST /api/session/evaluation/expire-current`
才存在；呼叫者必須提供目前 session 的 CSRF token 與
`interactionMode: "human"`。它只能讓呼叫者自己的 session 過期，不能指定或影響
其他 session。下一次 Tool request 會收到
`AUTHENTICATION_REQUIRED / SESSION_EXPIRED / retryable: false`，同時不會開啟取消對話框或
執行取消 POST。正式日常環境維持關閉，只在受控驗收 revision 明確啟用。

## 環境變數

[.env.example](.env.example) 是變數清單，不會被應用程式自動載入。請在 PowerShell、CI 或啟動工具中設定需要的值。

主要變數：

- `PORT`：production server port，預設 3000
- `PLAYWRIGHT_BASE_URL`：讓 browser tests 指向外部已啟動環境
- `PLAYWRIGHT_API_PORT`、`PLAYWRIGHT_WEB_PORT`：覆寫本機 E2E server；`npm run verify` 預設使用 3300／5573，避免接到手動開發用的 3000／5173
- `ENABLE_EVALUATION_FIXTURES`：預設 false；只在受控 `RECOVERY-02` 驗收環境開啟 current-session expiry fixture
- `ARTICLE_REPO_ROOT`：把 article evidence 寫入文章 repository
- `PUBLIC_SITE_URL`：公開 HTTPS origin，用於 Day 25–27 evidence capture
- `PUBLIC_DEPLOYMENT_COMMIT`：上述公開站對應的完整 commit SHA
- `DEPLOYMENT_*`：CI 產生 deployment evidence 時使用的版本座標

不要把 Origin Trial token、Azure credential、cookie 或 bearer token 寫入 `.env.example`、article evidence 或 commit。

## 目錄

```text
labs/          Day 4、7、11、12 的讀者版隔離教學
src/client/    人類頁面、shared actions、WebMCP adapter 與 Tools
src/server/    Express routes、services、authorization
src/shared/    contract、validation、fixtures、activity types
tests/         Unit、API、security、browser、evidence 與 infra tests
evals/         固定 dataset、baseline、受阻與 reliability 結果
evidence/      Verification、runtime、deployment 與 screenshot evidence
infra/         Azure Container Apps Bicep
.github/       GHCR／Azure deployment workflow
```

## 文章 Day 對應

- Day 1–6：基礎概念、Browser Automation、catalog、evidence axes
- Day 7–12：`labs/`
- Day 13–17：產品骨架、搜尋、詳情、shared actions
- Day 18–22：收藏、報名／取消準備、Journey、feature freeze
- Day 23–29：verification、安全、container、Azure、capability preflight、Eval、release evidence
- Day 30：作者回顧，不建立新的程式 branch 或第六個 Tool

精確檔案、測試與可切換的 Git refs 請查
[讀者版程式里程碑](docs/reader-code-milestones.md)。只有實際存在程式差異的 Day
才建立 branch／annotated tag，不複製 30 份相同程式碼。

## Evidence 與目前限制

Evidence 分成四個獨立軸：`runtime_integration`、`webmcp_capability`、`agent_invocation`、`test_harness`。詳見 [evidence/README.md](evidence/README.md)。

目前可查核狀態：

- 本機 verification record 是 E2 test harness，不代表 Agent invocation。
- 20 題固定驗收 release `4b1324f` 已由 run `30733952974` 部署為 Azure revision `ca-agentready-events--0000007`，immutable digest 為 `sha256:d812498aa038787bda92654cf885d9e4af2c2c082aa9262129d158ccdd4d7052`。
- 公開 `/health/version` 與 artifact 的 commit／revision 一致；production smoke 已完成三條 Journey、session isolation 與 forged Agent finalization rejection，因此這個固定 revision 目前可列為 E3。
- `RECOVERY-02` 所需的受控 current-session expiry fixture 只在這個驗收 revision 開啟，且仍要求同 session CSRF 與 `interactionMode: "human"`。
- 公開站可由 HTTPS 開啟；2026-07-29 回應包含 `Permissions-Policy: tools=(self)` 與 `Origin-Agent-Cluster: ?1`，沒有 `Origin-Trial` header。
- 20 題固定 Eval 定義已通過 schema 驗證，分布在 10 個類別；這只代表題目可執行，不代表 20 題 Agent 測試已通過。
- 2026-07-31，WebMCP Inspector 內的 Gemini Agent 曾在前一個固定 release `8e89e65`／revision `0000006` 完成 SEL-01、SEL-02 兩題 read-only E4；這些 trace 保留為歷史證據，不替 revision `0000007` 升級。
- revision `0000007` 的 20 題 Inspector 原始 trace 尚未完成保存，因此目前不得主張新的 E4、20/20 或跨乾淨環境 E5。

最新版的 commit、revision、image digest 與 Inspector trace 必須成組記錄在
[版本證據帳本](docs/version-evidence-ledger.md)。網站畫面只標示 source contract、
目前瀏覽器 capability 與逐 case 的 current revision invocation 狀態；歷史 SEL-01、SEL-02 的 E4 必須連同它們原本的 revision 一起解讀。

請依 [runtime rerun record](docs/webmcp-runtime-rerun.md) 保留固定 Prompt、工具輸入、原始回傳與失敗分類。Fake ModelContext、testing API、DevTools 手動 execution 或直接 `executeTool()` 都不能取代真實 Agent invocation。

revision `0000007` 的逐題順序、狀態前置、Request conditions、受控 session expiry 與
人類確認界線，統一記錄在 [20 題固定 revision 執行手冊](docs/webmcp-20-case-execution.md)。

## 本機與 Azure 權限界線

- 本機開發不需要 Azure credential。
- GitHub Actions 透過 OIDC 登入 Azure，不使用長效 client secret。
- Infrastructure deployment 只允許核准的 resource type 與 immutable public GHCR digest。
- Browser input、Tool annotation 與 `interactionMode` 都不是 authorization。
- Server 必須重新驗證 session、ownership、state、截止時間、名額與 mutation 條件。
- 最後報名／取消還需短效、單次且綁定 session/action/target 的 confirmation intent；它降低重播與錯誤 target 風險，但不構成真實人類身分證明。
- Demo 名額是單一 Node.js 執行個體內的 server-side state。正式多 revision／多 replica 系統必須改用資料庫交易或等價的原子性儲存。

## 常見問題

### Playwright 找不到瀏覽器

```powershell
npx playwright install --list
npx playwright install chromium
```

### `npm run dev` 啟動後 API 失敗

先開 `http://127.0.0.1:3000/health/live`。若無回應，檢查 3000 port 是否被占用與 `dev:api` 的 terminal output。

### 公開站 evidence test 被 skip

Day 25 需要同時設定 `PUBLIC_SITE_URL` 與 `PUBLIC_DEPLOYMENT_COMMIT`；Day 26、27 至少需要 `PUBLIC_SITE_URL`。Skip 代表缺少 capture coordinate，不是成功。

### E2E 全綠，為什麼文章仍寫 Agent invocation 未測？

Playwright 驗證 browser behavior。只有相容 Agent 實際發現、選擇並呼叫 Tool，才能建立 E4 evidence。
