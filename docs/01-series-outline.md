# 30 天系列文章大綱：AgentReady Events

> 系列名稱：《網站不只給人用：30 天打造 AI Agent 看得懂的 WebMCP 網站》

| 欄位 | 內容 |
|---|---|
| 文件狀態 | Accepted |
| 文件版本 | 1.0.0 |
| 建立日期 | 2026-06-24 |
| 最後更新日期 | 2026-06-24 |
| 建議參賽組別 | Modern Web |
| 實作專案 | AgentReady Events |
| 系列語言 | 繁體中文（`zh-TW`） |
| 文章數量 | 30 篇，連續 30 天 |
| 每日 Git Tag | `day-01`～`day-30` |
| 技術基準 | `docs/05-webmcp-baseline.md` Baseline 1.0.0 |
| Tool 契約 | `docs/04-tool-catalog.md` Catalog 1.0.0 |
| 相關文件 | `00-project-brief.md`、`02-source-list.md`、`03-architecture.md`、`04-tool-catalog.md`、`05-webmcp-baseline.md` |

---

## 1. 文件目的

本文件是 30 天系列文章的 **Editorial Single Source of Truth**，負責固定：

- 30 篇文章的先後順序與敘事主線。
- 每一天唯一的核心問題與學習目標。
- 每一天應完成的程式功能、測試、文件與可見成果。
- 文章之間的依賴關係與五個主要里程碑。
- 每篇文章所需引用的技術來源類別。
- 系列範圍、品質標準、Git Tag 與完稿條件。

本文件不重複定義 WebMCP Tool 的完整 Schema、Output Contract 或安全規則；這些內容以 `04-tool-catalog.md` 為準。WebMCP API、Chrome 版本與相容性則以 `05-webmcp-baseline.md` 為準。

若文章草稿與上述文件衝突，優先順序如下：

```text
05-webmcp-baseline.md
        ↓
04-tool-catalog.md
        ↓
03-architecture.md
        ↓
01-series-outline.md
        ↓
每日文章草稿與範例程式碼
```

---

# 2. 系列定位

## 2.1 正式名稱

# 《網站不只給人用：30 天打造 AI Agent 看得懂的 WebMCP 網站》

## 2.2 副標題

> 從 Agentic Web、結構化工具、Human-in-the-loop，到安全與 Evals 的完整實戰

## 2.3 系列標語

> **別再讓 AI 猜按鈕，讓網站主動說明自己能做什麼。**

## 2.4 一句話介紹

本系列將從零打造 AgentReady Events，示範一個原本只服務人類的活動網站，如何透過 WebMCP Declarative／Imperative API，逐步成為可被瀏覽器 AI Agent 發現、理解、呼叫，而且仍然安全、可測試與可由人類掌控的 Agent-ready 網站。

## 2.5 系列要回答的核心問題

1. AI Agent 為什麼不能只靠截圖、DOM 與模擬點擊操作網站？
2. 網站如何把功能公開成 Agent 能理解的結構化 Tool？
3. Declarative API 與 Imperative API 分別適合哪些情境？
4. Tool 如何與既有 UI、Session、Application Service 與後端權限共存？
5. 報名、取消與個資操作，如何保留人類的最終控制權？
6. Prompt Injection、錯誤參數、重複呼叫與跨來源暴露該如何防範？
7. 如何以 Deterministic Tests 與 Agent Evals 驗證網站真的 Agent-ready？
8. 實驗性標準要如何部署、降級、版本鎖定與誠實說明限制？

---

# 3. 目標讀者與先備知識

## 3.1 目標讀者

| 讀者 | 可獲得的價值 |
|---|---|
| 前端工程師 | WebMCP、語意化 HTML、Tool Lifecycle 與 Agent-ready UI 的實作方式 |
| 後端工程師 | Tool、API、Session、授權、冪等與稽核之間的責任邊界 |
| AI Agent 開發者 | 網站端如何提供清楚的名稱、描述、Schema、狀態與可修正錯誤 |
| 架構師與技術主管 | WebMCP 的適用範圍、導入風險、相容策略與工程取捨 |
| 資安人員 | Prompt Injection、Tool Poisoning、個資、跨來源與 Human-in-the-loop 風險 |
| 對 AI 與 Web 有興趣的讀者 | 透過一個大眾化活動平台理解 Agentic Web 的完整發展脈絡 |

## 3.2 先備知識

讀者只需具備：

- 基本 HTML、CSS 與 JavaScript。
- 知道 HTTP API、JSON 與表單提交的概念。
- 能閱讀簡單 TypeScript。
- 不需要先熟悉 MCP、WebMCP、JSON Schema 或 Agent Evals。

## 3.3 系列結束後的能力

讀者應能：

1. 判斷一項網站功能是否值得公開成 WebMCP Tool。
2. 將可用的 HTML Form 轉為 Declarative Tool。
3. 使用 `document.modelContext.registerTool()` 註冊 Imperative Tool。
4. 設計名稱清楚、用途不重疊的 Tool Catalog。
5. 設計可被 Agent 正確使用的 Input Schema 與 Result Contract。
6. 根據頁面、登入與資源狀態動態管理 Tool Lifecycle。
7. 讓 Human UI 與 Agent Tool 共用相同 Use Case，而非複製商業邏輯。
8. 實作 Human-in-the-loop、後端授權、個資最小化與稽核紀錄。
9. 建立 Prompt Injection、安全、Unit、E2E 與 Agent Eval 測試。
10. 為不支援 WebMCP 的瀏覽器提供完整可用的漸進式降級方案。

---

# 4. 實作專案與最終承諾

## 4.1 專案名稱

# AgentReady Events

中文定位：

> AI Agent 友善的活動探索與報名平台

## 4.2 四條最終 Demo Journey

### Journey A：搜尋、查看與收藏

```text
自然語言搜尋條件
→ search_events
→ get_event_details
→ save_event
→ UI 同步顯示收藏結果
```

### Journey B：Agent 協助準備報名，人類正式送出

```text
選擇活動
→ prepare_event_registration
→ Agent 填入可見表單
→ 使用者檢查
→ 使用者親自確認送出
```

### Journey C：查看個人報名並匯出行程

```text
get_my_registrations
→ 選擇未來活動
→ export_my_schedule
→ 顯示並下載最小化的行程資料
```

### Journey D：取消報名但保留人類控制權

```text
get_my_registrations
→ cancel_registration
→ 可見確認 Dialog
→ 使用者確認
→ 後端重新驗證並取消
→ 留下稽核紀錄
```

## 4.3 最終交付成果

Day 30 前必須公開：

| 類別 | 成果 |
|---|---|
| 文章 | 30 篇可獨立閱讀、又能串成完整故事的技術文章 |
| 程式 | 可執行的 AgentReady Events Repository |
| Tool | 7 個與 `04-tool-catalog.md` 一致的 WebMCP Tools |
| Demo | 至少四條可展示的端到端 Journey |
| 測試 | Unit、Integration、E2E、Deterministic WebMCP Tests |
| Evals | 至少 20 組 Tool Selection、Argument、Sequence 與 Journey Prompts |
| 安全 | Prompt Injection 測試資料、確認流程、後端授權與稽核紀錄 |
| 文件 | 架構、Tool Catalog、Baseline、部署與 Agent-ready Checklist |
| 版本 | `day-01`～`day-30` Git Tags 與 Release Notes |
| 相容性 | WebMCP 不可用時，Human UI 仍可完成核心任務 |

---

# 5. 系列範圍與非目標

## 5.1 系列會處理

- Agentic Web 與 Browser Actuation 的問題背景。
- WebMCP 與 MCP、REST API、Browser Automation 的差異。
- Declarative 與 Imperative API。
- HTML Form、JSON Schema、Tool Output 與 Error Contract。
- Tool Registration、Unregistration 與頁面狀態。
- Session、授權、個資、Human-in-the-loop 與稽核。
- Prompt Injection、Annotation 與跨來源風險。
- Unit、E2E、DevTools、Lighthouse 與 Agent Evals。
- Progressive Enhancement、Origin Trial、版本快照與部署。

## 5.2 系列不會處理

- 從零建立大型語言模型或通用 Browser Agent。
- 完整 MCP Server 教學。
- 真實金流、票券、座位與驗票系統。
- 大型活動主辦方後台。
- 第三方 OAuth、企業 SSO 或多租戶 SaaS。
- 複雜推薦演算法與向量資料庫。
- 將 Tool 暴露給任意跨來源網站或 iframe。
- 宣稱 WebMCP 已是成熟、普遍支援的正式 Web 標準。

---

# 6. 編輯與實作原則

| ID | 原則 | 執行方式 |
|---|---|---|
| OUTLINE-001 | 一天只解決一個核心問題 | 每篇文章以一個可回答的問題為主，不同技術不要硬塞在同一天 |
| OUTLINE-002 | 一天至少一個可見成果 | UI、Tool、測試、圖表、Debug Panel 或文件至少完成一項 |
| OUTLINE-003 | 先有正常網站，再加 WebMCP | Declarative Tool 必須建立在可用、可存取的 HTML Form 上 |
| OUTLINE-004 | 實作與觀念交錯 | 不連續多天只講理論，也不連續多天只貼程式碼 |
| OUTLINE-005 | 每篇都有失敗案例 | 至少呈現一種錯誤輸入、錯誤狀態、風險或設計反例 |
| OUTLINE-006 | 所有 Tool 以 Catalog 為準 | 不在文章中臨時發明第 8 個 Tool 或任意改名 |
| OUTLINE-007 | 所有 WebMCP API 以 Baseline 為準 | 主線只使用 `document.modelContext`，不新增 `navigator.modelContext` |
| OUTLINE-008 | Tool 不取代後端安全 | Tool 可提示意圖，但登入、授權與狀態由後端重新驗證 |
| OUTLINE-009 | 高風險操作保留人類控制 | 正式報名與取消不得只靠 Agent 自動完成 |
| OUTLINE-010 | 誠實標示實驗性 | 每篇含 WebMCP 程式碼的文章都附版本標頭與實測環境 |
| OUTLINE-011 | 程式碼可還原 | 每篇對應單一 Git Tag，讀者可切換到當天狀態 |
| OUTLINE-012 | 來源優先採官方與規格 | 引用清單與更新頻率以 `02-source-list.md` 為準 |

---

# 7. 六階段敘事主線

| 階段 | Day | 核心問題 | 主要成果 |
|---|---:|---|---|
| I. 看懂 Agentic Web | 1～5 | 為什麼網站需要 Agent 介面？哪些功能應成為 Tool？ | 問題定義、比較矩陣、Critical User Journey、Tool Strategy |
| II. 第一個 Declarative Tool | 6～10 | 如何讓既有 HTML Form 直接成為 Agent 可理解的 Tool？ | 環境、語意化搜尋表單、`search_events`、Schema、可見執行回饋 |
| III. Imperative API 與應用架構 | 11～17 | 如何把 JavaScript 功能、狀態與商業邏輯安全地公開給 Agent？ | `get_event_details`、`save_event`、Result Contract、Lifecycle、Debug Panel |
| IV. Human-in-the-loop 與個人操作 | 18～22 | Agent 可以協助到什麼程度？誰負責最後決策？ | 報名、個人報名、匯出、取消、登入、授權、確認與稽核 |
| V. 安全、測試與 Evals | 23～27 | Tool 可以動之後，如何證明它安全、可靠且能被 Agent 正確使用？ | Prompt Injection、Annotations、Unit/E2E、Eval Dataset、故障演練 |
| VI. 正式化與完賽 | 28～30 | 如何讓實驗性 API 成為可展示、可降級、可維護的作品？ | Activity Panel、無障礙、部署、相容策略、Checklist、最終 Demo |

---

# 8. 主要里程碑

| 里程碑 | 截止 | 驗收成果 |
|---|---:|---|
| M1：第一個可執行 Tool | Day 10 | Agent 可發現並使用 `search_events`，搜尋結果更新可見 UI |
| M2：第一條多 Tool Journey | Day 17 | `search_events` → `get_event_details` → `save_event` 可完整執行 |
| M3：七個 Tool 與核心產品完成 | Day 22 | 報名準備、查詢、匯出、取消與人類確認流程全部完成 |
| M4：品質與安全完成 | Day 27 | Prompt Injection、安全政策、自動測試、Evals 與故障測試完成 |
| M5：正式發表 | Day 30 | 線上 Demo、完整文件、Checklist、Release 與最終文章完成 |

---

# 9. 30 天總覽

> 文章名稱為 v1 工作標題。發文前可以微調語氣，但不可改變當天的核心範圍、交付物與依賴關係。

| Day | 工作標題 | 核心交付物 | 主要 Tool／主題 | Git Tag |
|---:|---|---|---|---|
| 01 | 網站多了一種使用者：AI Agent | 系列地圖、Demo 目標、Repository 導覽 | Agentic Web | `day-01` |
| 02 | Agent 是怎麼在網站上迷路的？ | Browser Actuation 脆弱性 Demo | Screenshot／DOM／座標操作 | `day-02` |
| 03 | WebMCP 初登場：讓網站主動說明自己會什麼 | WebMCP 流程圖與最小概念模型 | Discovery／Schema／State | `day-03` |
| 04 | WebMCP、MCP、API 與 Browser Automation 別再混在一起 | 技術比較與選型矩陣 | WebMCP vs MCP | `day-04` |
| 05 | 不要急著寫 Tool：先畫 Critical User Journey | Journey Map 與七 Tool Strategy | Tool Catalog 設計 | `day-05` |
| 06 | 把實驗環境架起來：Chrome、Vite 與 WebMCP 診斷頁 | 專案骨架與 Support Diagnostic | Baseline／Feature Detection | `day-06` |
| 07 | Agent-ready 的第一步不是 AI，而是語意化 HTML | 可由人類完整使用的活動搜尋頁 | Semantic Form／A11y | `day-07` |
| 08 | 第一個 Declarative Tool：讓搜尋表單被 Agent 發現 | `search_events` 初版 | Declarative API | `day-08` |
| 09 | HTML 如何變成 JSON Schema？ | 搜尋參數 Schema 與 Lighthouse 檢查 | Form-to-Schema | `day-09` |
| 10 | Agent 幫忙填，人類看得見：提交、回傳與焦點狀態 | `search_events` 完整執行 | `respondWith()`／可見狀態 | `day-10` |
| 11 | Imperative API 入門：註冊活動詳情工具 | `get_event_details` | `registerTool()` | `day-11` |
| 12 | Schema 寫得好，Agent 才不用猜 | 共用 Schema 模組與反例測試 | JSON Schema／Description | `day-12` |
| 13 | Tool 回什麼才有用？結果契約與可修正錯誤 | `ToolResult<T>` 與 Error Mapping | Output／Error Contract | `day-13` |
| 14 | Tool 不是永遠都能用：頁面狀態與生命週期 | Tool Registry 與動態解除註冊 | AbortSignal／State | `day-14` |
| 15 | 不用等 Agent：DevTools、getTools 與 executeTool | Agent Debug Panel | Chrome-only Debug API | `day-15` |
| 16 | UI 與 Agent 不該各寫一套：共用 Use Case | Application Service 與 `save_event` | Architecture／R1 Write | `day-16` |
| 17 | 串起第一條完整旅程：搜尋、查看、收藏 | 第一條端到端 Agent Journey | 3-Tool Journey | `day-17` |
| 18 | Agent 幫你填，但不能替你承諾：活動報名表 | `prepare_event_registration` | Declarative／Form Assist | `day-18` |
| 19 | Human-in-the-loop：哪些操作一定要停下來確認？ | R0～R3 風險矩陣與共用 Confirm UI | Human Control | `day-19` |
| 20 | Agent 不是管理員：Session、授權與後端再驗證 | 登入、授權與 API 安全邊界 | AuthN／AuthZ／CSRF | `day-20` |
| 21 | 個人資料最小化：我的報名與匯出行程 | `get_my_registrations`、`export_my_schedule` | Privacy／Read-only Tools | `day-21` |
| 22 | 高風險取消流程：確認、冪等與稽核紀錄 | `cancel_registration` 與確認流程 | R3／Audit／Idempotency | `day-22` |
| 23 | Prompt Injection 進到活動內容後會發生什麼？ | 惡意活動資料與攻擊重現 | Indirect Prompt Injection | `day-23` |
| 24 | 替 Tool 貼上安全標籤：Annotation 與跨來源邊界 | Tool Security Policy | `readOnlyHint`／`untrustedContentHint` | `day-24` |
| 25 | 先測 JavaScript，再測 Agent | Unit、Integration、E2E 與 Tool Tests | Deterministic Testing | `day-25` |
| 26 | Agent 不只要能呼叫，還要呼叫正確 | 至少 20 組 Eval Prompts | Tool Selection／Arguments／Journey | `day-26` |
| 27 | 故意讓它失敗：過期狀態、重複呼叫與重試 | Reliability Report 與故障測試 | Failure Engineering | `day-27` |
| 28 | 使用者必須知道 Agent 做了什麼 | Agent Activity Panel 與無障礙改善 | Observability／A11y | `day-28` |
| 29 | 實驗 API 怎麼上線？漸進式增強與版本鎖定 | 線上 Demo、Fallback 與部署文件 | Origin Trial／Progressive Enhancement | `day-29` |
| 30 | 網站正式成為 Agent-ready：最終 Demo 與檢查表 | Release、Checklist、回顧與未來展望 | Final Integration | `day-30` |

---

# 10. 每日詳細規劃

## 第一階段：看懂 Agentic Web（Day 1～Day 5）

## Day 01｜網站多了一種使用者：AI Agent

### 核心問題

當網站開始被瀏覽器 AI Agent 操作，前端設計需要多考慮什麼？

### 文章目標

- 建立「人類使用者＋Agent 使用者」的雙介面觀念。
- 說明系列不是做聊天機器人，而是改造既有網站能力的公開方式。
- 展示 AgentReady Events 最終四條 Journey 與 30 天路線圖。
- 誠實說明 WebMCP 是提議中、實驗性的 Web 標準。

### 實作與素材

- 建立首頁 Skeleton、專案 Logo／名稱與 Demo 導覽區。
- 在 README 放入系列名稱、標語、里程碑與最終成果。
- 製作「Human UI / WebMCP Tools / API」三層概念圖。

### 當日完成標準

- [ ] 讀者能用一句話說明系列要解決的問題。
- [ ] Repository 可啟動並顯示專案首頁。
- [ ] 首頁列出四條 Journey 與目前進度。
- [ ] 建立 `day-01` Tag。

### 主要來源

`CHROME-001`、`WMCP-003`、`CHROME-013`、iThome 2026 官方活動頁。

### 下一篇銜接

先不要急著介紹 API；Day 02 先實際看清楚目前 Agent 操作網站為什麼容易失敗。

---

## Day 02｜Agent 是怎麼在網站上迷路的？拆解截圖、DOM 與模擬點擊

### 核心問題

AI Agent 已經可以點網頁，為什麼還需要網站主動公開 Tool？

### 文章目標

- 解釋 Screenshot、DOM、Accessibility Tree、Selector 與座標 Actuation。
- 區分「看得見畫面」與「穩定理解功能」並不是同一件事。
- 呈現 UI 改版、文字變更、版面位移與非同步狀態對操作可靠度的影響。

### 實作與素材

建立一個 Actuation Fragility Lab：

1. 版本 A 的搜尋按鈕具有固定位置與文字。
2. 版本 B 改變版面、按鈕文字或載入順序。
3. 用座標或脆弱 Selector 模擬操作失敗。
4. 保留正常人類操作，作為後續 WebMCP 對照組。

### 當日完成標準

- [ ] 至少重現兩種 UI 改動造成的操作失敗。
- [ ] 清楚說明這不是宣稱所有 Browser Agent 都必然失敗，而是展示 actuation 的結構性脆弱點。
- [ ] 保存 Before／After GIF 或短影片。
- [ ] 建立 `day-02` Tag。

### 主要來源

`CHROME-001`、`CHROME-019`、`CHROME-018`、`WMCP-009`。

### 失敗案例

以座標點擊的腳本在新增 Banner 後點到錯誤按鈕。

---

## Day 03｜WebMCP 初登場：讓網站主動說明自己會什麼

### 核心問題

WebMCP 如何把網站功能轉成 Agent 能發現、理解與呼叫的結構化 Tool？

### 文章目標

- 解釋 Discovery、Description、Input Schema、Execution、State 與 Result。
- 說明 WebMCP 讓 Tool 在目前頁面與 Session 情境中執行。
- 區分 Declarative 與 Imperative 兩條實作路線。
- 說明 Community Group Draft 與正式 W3C Standard 的差異。

### 實作與素材

- 製作 WebMCP 呼叫流程圖。
- 寫出不依賴實際 API 的最小 Tool Definition 示意。
- 在網站加入「目前頁面可提供哪些能力」的靜態 Tool Preview。

### 當日完成標準

- [ ] 讀者能說出 Tool 至少包含名稱、描述與結構化輸入。
- [ ] 讀者理解 Tool 與目前頁面狀態存在關係。
- [ ] 文章明確標記 WebMCP 仍在演進。
- [ ] 建立 `day-03` Tag。

### 主要來源

`WMCP-001`、`WMCP-003`、`CHROME-001`、`CHROME-012`。

---

## Day 04｜WebMCP、MCP、API 與 Browser Automation 別再混在一起

### 核心問題

這四種技術都能「讓程式做事」，它們究竟解決不同層次的哪些問題？

### 文章目標

- 比較功能位置、生命週期、UI 所有權、登入狀態與通訊方式。
- 說明 WebMCP 不是 MCP 的替代品，也不是直接把 MCP Server 搬到瀏覽器。
- 說明 REST API 不會因 WebMCP 出現而消失。
- 建立「何時選哪一種」的決策框架。

### 實作與素材

- 完成四技術比較矩陣。
- 以 AgentReady Events 搜尋、後端資料、頁面狀態為例畫出組合方式。
- 製作一張「Agent 在網站內／網站外」的定位圖。

### 當日完成標準

- [ ] 比較至少包含 Location、Lifetime、State、UI、Auth、Use Case 六個維度。
- [ ] 不將 MCP 與 WebMCP 寫成二選一競爭關係。
- [ ] 建立 `day-04` Tag。

### 主要來源

`CHROME-008`、`FOUNDATION-001`、`FOUNDATION-002`、`WMCP-003`。

---

## Day 05｜不要急著寫 Tool：先畫 Critical User Journey

### 核心問題

要把哪些功能公開成 Tool，又該如何避免 Agent 面對一大堆重疊選項？

### 文章目標

- 從使用者目標而不是 UI 按鈕反推 Tool。
- 介紹 Critical User Journey 與 Tool Strategy。
- 解釋單一職責、非重疊描述、動態可用性與 Context Cost。
- 公開七個 Tool 的選擇理由與不建立的 Tool。

### 實作與素材

- 畫出四條最終 Journey。
- 展示七 Tool Catalog 總覽。
- 展示 `login`、`submit_registration`、`run_action` 等不建立案例。
- 將 `04-tool-catalog.md` 連結至 README。

### 當日完成標準

- [ ] 每個 Tool 都能對應至少一條 Journey。
- [ ] 每個 Tool 只有單一清楚目的。
- [ ] 正式報名與取消的最終確認權留給人類。
- [ ] 建立 `day-05` Tag。

### 主要來源

`CHROME-002`、`CHROME-005`、`WMCP-003`、`04-tool-catalog.md`。

### 階段驗收

讀者已經理解「問題、定位、邊界與工具策略」，但尚未被大量 API 細節淹沒。

---

## 第二階段：第一個 Declarative Tool（Day 6～Day 10）

## Day 06｜把實驗環境架起來：Chrome、Vite 與 WebMCP 診斷頁

### 核心問題

面對仍在演進的 WebMCP，要如何建立可重現、可除錯且不誤導讀者的開發環境？

### 文章目標

- 建立 Vite、TypeScript、Node.js 與專案基本目錄。
- 介紹 WebMCP Testing Flag、HTTPS／Origin Trial 與 Feature Detection。
- 說明 `document.modelContext` 與 Legacy API 的界線。
- 建立版本標頭與 Baseline Snapshot 概念。

### 實作與素材

完成 `/debug/support` 診斷頁，顯示：

- 目前 Chrome User Agent 與完整版本。
- `document.modelContext` 是否存在。
- Debug-only API 是否可用。
- WebMCP unavailable 時的提示。
- Baseline 版本與 Snapshot 日期。

### 當日完成標準

- [ ] `npm install`、`npm run dev` 可正常啟動。
- [ ] 不支援 WebMCP 時頁面不崩潰。
- [ ] 主線程式碼沒有 `navigator.modelContext`。
- [ ] 文章使用 `05-webmcp-baseline.md` 的版本標頭。
- [ ] 建立 `day-06` Tag。

### 主要來源

`CHROME-001`、`CHROME-009`、`CHROME-010`、`CHROME-020`、`05-webmcp-baseline.md`。

---

## Day 07｜Agent-ready 的第一步不是 AI，而是語意化 HTML

### 核心問題

在加入 WebMCP 之前，搜尋表單本身是否已經對人類、鍵盤與輔助科技可用？

### 文章目標

- 建立 Semantic HTML、Label、Input Type、Required 與 Validation 基礎。
- 說明 Accessibility Tree 與 Agent 可理解性之間的關係，但不把兩者畫上等號。
- 實踐 Progressive Enhancement：沒有 WebMCP 仍能完成搜尋。

### 實作與素材

完成活動列表與搜尋 Form：

- 關鍵字。
- 地點。
- 開始／結束日期。
- 免費活動篩選。
- 程度選擇。
- 清除條件與搜尋結果區。

### 當日完成標準

- [ ] 所有欄位具有正確 `label` 與 `name`。
- [ ] 全程可用鍵盤完成搜尋。
- [ ] 錯誤訊息可被看見與讀取。
- [ ] 關閉 WebMCP 後仍能搜尋。
- [ ] 建立 `day-07` Tag。

### 主要來源

`WEB-001`、`WEB-005`、`A11Y-001`、`A11Y-002`、`CHROME-018`。

---

## Day 08｜第一個 Declarative Tool：讓搜尋表單被 Agent 發現

### 核心問題

如何只增加少量 HTML Annotation，就把既有搜尋 Form 轉成 Agent 可發現的 Tool？

### 文章目標

- 使用 `toolname` 與 `tooldescription` 註冊 Declarative Tool。
- 解釋 Form 是 Tool 的 Source of Truth。
- 說明移除 Attribute 即解除註冊的生命週期。
- 初步使用 `toolparamdescription` 改善欄位語意。

### 實作與素材

將 Day 07 Form 轉為：

```text
search_events
```

並在 Debug UI 顯示目前 Tool 名稱、描述與可用狀態。

### 當日完成標準

- [ ] Tool Name 與 Catalog 完全一致。
- [ ] Description 明確說明用途與適用時機。
- [ ] Tool Attribute 移除後可觀察到解除註冊。
- [ ] 不重複以 Imperative API 註冊同名 Tool。
- [ ] 建立 `day-08` Tag。

### 主要來源

`CHROME-003`、`WMCP-004`、`04-tool-catalog.md`。

---

## Day 09｜HTML 如何變成 JSON Schema？參數、型別與驗證

### 核心問題

瀏覽器如何從 Form Controls 產生 Tool Input Schema，而開發者又該負責哪些驗證？

### 文章目標

- 對照 `input`、`select`、`option`、`required`、`name` 與 Schema。
- 解釋 `type`、`properties`、`required`、`enum` 與欄位描述。
- 說明「Schema 寬鬆、Runtime 嚴格」的設計原則。
- 使用 Lighthouse／DevTools 檢查工具與表單品質。

### 實作與素材

- 顯示 `search_events` 產生的 Schema Snapshot。
- 補上日期範圍與字數的 Runtime Validation。
- 建立錯誤輸入測試：結束日早於開始日、過長關鍵字、未知程度。

### 當日完成標準

- [ ] Schema 與 Form 欄位一一對應。
- [ ] Runtime Validation 不依賴 Agent 一定遵守 Schema。
- [ ] 至少展示一個 Lighthouse 或 DevTools 檢查結果。
- [ ] 建立 `day-09` Tag。

### 主要來源

`CHROME-003`、`CHROME-015`、`CHROME-016`、`FOUNDATION-003`、`FOUNDATION-004`。

---

## Day 10｜Agent 幫忙填，人類看得見：提交、回傳與焦點狀態

### 核心問題

當 Agent 呼叫 Declarative Tool，網站如何執行搜尋、回傳結果，並讓使用者清楚看到發生了什麼？

### 文章目標

- 比較手動提交與 `toolautosubmit`。
- 使用 `SubmitEvent.agentInvoked` 區分 Agent 觸發情境。
- 使用 `preventDefault()` 與 `respondWith()` 回傳 Tool Result。
- 處理 `toolactivated`、`toolcancel` 與可見焦點狀態。

### 實作與素材

- `search_events` 由 Agent 填入並執行搜尋。
- 搜尋結果更新原本 UI，而非只把文字回給 Agent。
- 顯示執行中、成功、無結果與驗證失敗狀態。
- 自訂 `:tool-form-active` 與 `:tool-submit-active` 樣式。

### 當日完成標準

- [ ] Agent 呼叫後，使用者可見 Form 與結果變化。
- [ ] 驗證失敗可透過 `respondWith()` 回傳可修正訊息。
- [ ] Cancel／Reset 後狀態正確清除。
- [ ] 完成 M1：第一個可執行 Tool。
- [ ] 建立 `day-10` Tag。

### 主要來源

`CHROME-003`、`WMCP-004`、`A11Y-003`。

---

## 第三階段：Imperative API 與應用架構（Day 11～Day 17）

## Day 11｜Imperative API 入門：註冊活動詳情工具

### 核心問題

當網站功能不是單純表單時，如何用 JavaScript 將它註冊成 WebMCP Tool？

### 文章目標

- 介紹 `document.modelContext.registerTool()`。
- 說明 Name、Description、Input Schema、Execute 與 Annotation。
- 以活動 ID 查詢詳情，保持 UI 與 Tool Result 同步。
- 建立 WebMCP Adapter 雛形，隔離實驗 API。

### 實作與素材

完成：

```text
get_event_details
```

Tool 取得活動詳情後：

- 開啟或更新活動詳情區。
- 回傳最小必要資料。
- 不回傳內部欄位。

### 當日完成標準

- [ ] 使用 `document.modelContext`。
- [ ] Tool 不直接存取 Database。
- [ ] 不存在活動時回傳可理解錯誤。
- [ ] UI 與 Tool Result 都更新。
- [ ] 建立 `day-11` Tag。

### 主要來源

`CHROME-004`、`WMCP-001`、`WEB-002`、`03-architecture.md`。

---

## Day 12｜Schema 寫得好，Agent 才不用猜

### 核心問題

哪些 Tool Name、Description 與 Schema 設計會讓 Agent 容易選錯或傳錯參數？

### 文章目標

- 比較模糊名稱與動詞清楚名稱。
- 比較重疊 Tool 與單一職責 Tool。
- 使用 `enum`、`required`、格式說明與自然語言描述。
- 避免要求 Agent 自行計算、轉換或猜測內部 ID。
- 引入 Description 與 Output 字元預算。

### 實作與素材

- 建立 Bad／Good Schema 對照頁。
- 抽出共用 Schema Helpers。
- 為 `get_event_details`、`save_event` 預先建立 ID Contract。
- 寫入至少五組錯誤參數測試資料。

### 當日完成標準

- [ ] Tool 名稱、描述與參數符合 Catalog 規則。
- [ ] Schema 不承擔授權責任。
- [ ] 讀者能看懂至少三種常見反例。
- [ ] 建立 `day-12` Tag。

### 主要來源

`CHROME-005`、`CHROME-006`、`FOUNDATION-003`、`FOUNDATION-004`、`04-tool-catalog.md`。

---

## Day 13｜Tool 回什麼才有用？結果契約與可修正錯誤

### 核心問題

Tool 成功或失敗時，應該回傳多少資料，才能讓 Agent 知道下一步，又不洩漏內部資訊？

### 文章目標

- 建立統一 `ToolResult<T>` Envelope。
- 區分 Validation、Authentication、Forbidden、Not Found、Conflict 與 Temporary Failure。
- 說明 Retryable、Recovery、Field Errors 與 UI Updated。
- 將外部活動內容視為資料，不視為指令。

### 實作與素材

- 完成 Frontend／Backend Error Mapping。
- 將 `get_event_details` 改用正式 Output Contract。
- 測試無效 ID、活動不存在、暫時錯誤與過長輸出。
- 在 Debug Panel 顯示 Raw Result 與可讀摘要。

### 當日完成標準

- [ ] 不回傳 Stack Trace、SQL、Cookie、Token 或內部 Exception。
- [ ] 錯誤訊息能提示 Agent 修正，而不是只寫「失敗」。
- [ ] 外部內容經 Sanitization 後仍標記為不可信資料。
- [ ] 建立 `day-13` Tag。

### 主要來源

`CHROME-005`、`CHROME-006`、`SECURITY-006`、`04-tool-catalog.md`。

---

## Day 14｜Tool 不是永遠都能用：頁面狀態與生命週期

### 核心問題

活動、登入與頁面狀態改變時，Agent 看到的 Tool 清單應如何同步改變？

### 文章目標

- 解釋 Page-scoped Tool 與目前 Document 情境。
- 使用 `AbortController`／`AbortSignal` 解除 Imperative Tool。
- 依頁面、登入、收藏、報名開放狀態管理 Tool。
- 使用 Registry 防止重複名稱與忘記清理。

### 實作與素材

完成：

- `WebMcpRegistry`。
- Route 進出時註冊／解除工具。
- 登出後移除個人與寫入 Tools。
- 活動已收藏後移除 `save_event`。
- Tool Lifecycle 視覺化面板。

### 當日完成標準

- [ ] 離開詳情頁後，頁面專屬 Tool 不再可用。
- [ ] 登出後不保留個人 Tool。
- [ ] 重複進入頁面不造成同名 Tool 衝突。
- [ ] 建立 `day-14` Tag。

### 主要來源

`CHROME-004`、`CHROME-005`、`WEB-002`、`03-architecture.md`。

---

## Day 15｜不用等 Agent：DevTools、getTools 與 executeTool

### 核心問題

Agent 行為具有不確定性時，如何先證明 Tool 本身的註冊、Schema、執行與輸出是正確的？

### 文章目標

- 使用 Chrome DevTools 檢查已註冊 Tool。
- 使用 `getTools()` 與 `executeTool()` 做 Deterministic Debug。
- 說明這兩個 API 在本專案中是 Debug-only，而非產品核心依賴。
- 監聽 `toolchange` 更新 Debug Panel。

### 實作與素材

完成 Agent Debug Panel：

- 列出目前 Tool。
- 顯示名稱、描述、Schema、Annotation 與 Origin。
- 手動輸入 JSON 執行 Tool。
- 顯示執行時間、Result、Error 與 UI 是否同步。

### 當日完成標準

- [ ] 不需 LLM 即可測試目前 Tools。
- [ ] Debug-only API 缺失時，正式網站仍可運作。
- [ ] 文章明確標示 Chrome 現行實作與 CG Draft 的邊界。
- [ ] 建立 `day-15` Tag。

### 主要來源

`CHROME-004`、`CHROME-009`、`CHROME-020`、`TOOLING-001`、`05-webmcp-baseline.md`。

---

## Day 16｜UI 與 Agent 不該各寫一套：共用 Use Case

### 核心問題

如何避免人類 UI 有完整驗證，而 WebMCP Tool 卻偷偷走另一條簡化捷徑？

### 文章目標

- 實踐「一個 Use Case，多個入口」。
- 建立 Frontend Facade、Backend Use Case 與 Repository 邊界。
- 讓人類收藏按鈕與 `save_event` 呼叫相同 Application Service。
- 說明 Interaction Mode 只供觀測，不作授權依據。

### 實作與素材

完成：

```text
save_event
```

並抽離：

- `EventService`。
- `SavedEventService`。
- API Client。
- UI Store 更新。
- 可見完成提示與 Undo UI。

### 當日完成標準

- [ ] Human UI 與 Tool 共用同一 Use Case。
- [ ] Tool 不直接呼叫 SQLite。
- [ ] 未登入、活動不存在、已收藏皆有正式結果。
- [ ] 收藏結果同步反映 UI。
- [ ] 建立 `day-16` Tag。

### 主要來源

`03-architecture.md`、`04-tool-catalog.md`、`TOOLING-005`、`TOOLING-006`。

---

## Day 17｜串起第一條完整旅程：搜尋、查看、收藏

### 核心問題

三個各自正確的 Tool，組合成 Journey 後是否仍然能選對順序、交換正確狀態並完成任務？

### 文章目標

- 串接 `search_events`、`get_event_details`、`save_event`。
- 說明前一個 Tool Output 如何提供下一步必要識別資訊。
- 驗證 Tool 依頁面與登入狀態正確出現。
- 建立第一批 Journey Prompt 與手動成功紀錄。

### 實作與素材

測試至少三個 Prompt：

1. 搜尋台北免費前端活動並收藏第一場。
2. 搜尋週末初學者活動，查看第二場詳情。
3. 未登入時要求收藏，正確引導至登入 UI。

### 當日完成標準

- [ ] Journey 可由自然語言完整完成。
- [ ] Agent 不需要猜測 UI 座標。
- [ ] 每一步 UI 均可見且狀態一致。
- [ ] 完成 M2：第一條多 Tool Journey。
- [ ] 建立 `day-17` Tag。

### 主要來源

`CHROME-002`、`CHROME-005`、`CHROME-007`、`04-tool-catalog.md`。

---

## 第四階段：Human-in-the-loop 與個人操作（Day 18～Day 22）

## Day 18｜Agent 幫你填，但不能替你承諾：活動報名表

### 核心問題

如何讓 Agent 協助完成繁瑣表單，同時避免它未經使用者檢查就正式報名？

### 文章目標

- 建立 `prepare_event_registration` Declarative Tool。
- 解釋「準備資料」與「正式提交」的命名差異。
- 不使用自動最終提交，讓 Form 保持可見與可編輯。
- 處理姓名、Email、場次、備註與表單驗證。

### 實作與素材

完成報名頁：

- Agent 可填入資料。
- 使用者可檢查、修改或重設。
- 正式 Submit Button 保持人類操作。
- Agent 取消時清除特殊狀態，不清除已確認的人類輸入。

### 當日完成標準

- [ ] Tool 名稱明確表示「prepare」而非「submit」。
- [ ] Agent 不會直接產生正式報名紀錄。
- [ ] 表單可用鍵盤與螢幕閱讀器操作。
- [ ] 建立 `day-18` Tag。

### 主要來源

`CHROME-003`、`WMCP-004`、`A11Y-001`、`A11Y-002`、`04-tool-catalog.md`。

---

## Day 19｜Human-in-the-loop：哪些操作一定要停下來確認？

### 核心問題

不是所有寫入都同樣危險；網站應如何決定 Agent 可以自動做什麼、必須在哪裡停下來？

### 文章目標

- 建立 R0～R3 風險分級。
- 比較查詢、收藏、填表、正式報名與取消。
- 說明 Confirmation 不只是彈窗，而是完整的決策資訊。
- 建立可重用、無障礙的確認元件。

### 實作與素材

確認元件必須顯示：

- 即將執行的動作。
- 影響的活動或報名。
- 是否可逆。
- 重要截止時間或後果。
- 確認與取消按鈕。

### 當日完成標準

- [ ] R0～R3 每級都有明確範例與處理策略。
- [ ] Dialog 焦點可正確進入、循環與返回。
- [ ] 不使用預設勾選或模糊按鈕文字誘導使用者。
- [ ] 建立 `day-19` Tag。

### 主要來源

`CHROME-002`、`CHROME-006`、`A11Y-003`、`04-tool-catalog.md`。

---

## Day 20｜Agent 不是管理員：Session、授權與後端再驗證

### 核心問題

Tool 只在登入頁面出現，是否就代表 API 已經安全？

### 文章目標

- 區分 Authentication、Authorization、Resource Ownership 與 UI State。
- 說明 Tool 可見性不是安全邊界。
- 實作 Session Cookie、CSRF 防護與後端逐 Request 驗證。
- 說明 `interactionMode: agent` 可被偽造，僅供觀測。

### 實作與素材

完成簡化登入與安全中介層：

- Session 建立／過期／登出。
- SameSite／Secure／HttpOnly Cookie。
- CSRF Token 或等價防護。
- 後端 Owner Check。
- 登出後 Tool Registry 更新。

### 當日完成標準

- [ ] 直接呼叫 API 也無法繞過登入與資源歸屬。
- [ ] Session 過期回傳正式 Error Contract。
- [ ] 登出會移除個人與寫入 Tools。
- [ ] 建立 `day-20` Tag。

### 主要來源

`SECURITY-003`、`SECURITY-004`、`SECURITY-005`、`WEB-003`、`03-architecture.md`。

---

## Day 21｜個人資料最小化：我的報名與匯出行程

### 核心問題

Read-only Tool 不會改資料，是否就代表沒有安全與隱私風險？

### 文章目標

- 實作 `get_my_registrations`。
- 實作 `export_my_schedule`。
- 說明最小資料回傳、遮罩、筆數上限與可見下載結果。
- 區分 Tool Output、UI 詳細資料與匯出檔案的資料範圍。

### 實作與素材

完成：

```text
get_my_registrations
export_my_schedule
```

匯出格式以簡單 `.ics` 或 JSON／CSV 其中一種為主，文章重點放在：

- 只匯出已登入使用者的有效未來報名。
- 不在 Tool Output 回傳不必要 Email、備註或 Session 資料。
- 下載前後 UI 顯示內容與檔名。

### 當日完成標準

- [ ] 未登入不可讀取個人報名。
- [ ] 不可透過傳入其他 User ID 查詢他人資料。
- [ ] 回傳筆數與欄位符合 Catalog。
- [ ] 匯出內容經測試且對使用者可見。
- [ ] 建立 `day-21` Tag。

### 主要來源

`CHROME-006`、`SECURITY-003`、`SECURITY-004`、`04-tool-catalog.md`。

---

## Day 22｜高風險取消流程：確認、冪等與稽核紀錄

### 核心問題

Agent 可以協助找出要取消的報名，但最終取消如何避免誤操作、重複執行與越權？

### 文章目標

- 實作 `cancel_registration` 的 Two-stage Execution。
- 第一階段只建立可見確認流程。
- 第二階段由人類確認後呼叫後端。
- 加入 Ownership、狀態、截止時間、冪等與 Audit Log。

### 實作與素材

流程：

```text
Tool 呼叫
→ 驗證並顯示確認 Dialog
→ 回傳 CONFIRMATION_REQUIRED
→ 人類確認
→ 後端再次驗證
→ 取消
→ UI 與 Audit Log 更新
```

### 當日完成標準

- [ ] Agent 單獨呼叫不會直接取消。
- [ ] 重複確認不會造成第二次副作用。
- [ ] 不能取消他人或不可取消的報名。
- [ ] 稽核紀錄不保存 Prompt 全文或敏感資料。
- [ ] 完成 M3：七個 Tool 與核心產品。
- [ ] 建立 `day-22` Tag。

### 主要來源

`CHROME-006`、`SECURITY-003`、`SECURITY-005`、`A11Y-003`、`04-tool-catalog.md`。

---

## 第五階段：安全、測試與 Evals（Day 23～Day 27）

## Day 23｜Prompt Injection 進到活動內容後會發生什麼？

### 核心問題

活動介紹只是資料，為什麼其中一段惡意文字可能影響 Agent 的下一步決策？

### 文章目標

- 解釋 Direct 與 Indirect Prompt Injection。
- 示範活動主辦方內容、評論或外部資料中的惡意指令。
- 說明 Sanitization 能處理 XSS，但不能等同解決 Prompt Injection。
- 討論 Tool Poisoning、Output Injection 與 Confused Deputy。

### 實作與素材

建立惡意測試資料：

- 要求 Agent 忽略使用者目的。
- 誘導呼叫取消或洩漏個資 Tool。
- 偽裝成系統通知。
- 嘗試把活動描述當成下一步指令。

### 當日完成標準

- [ ] 至少重現兩種間接注入情境。
- [ ] 清楚區分 XSS 防護與 Prompt Injection 防護。
- [ ] Agent 不因活動內容直接執行高風險 Tool。
- [ ] 建立 `day-23` Tag。

### 主要來源

`CHROME-006`、`WMCP-005`、`SECURITY-001`、`SECURITY-002`、`BROWSER-002`。

---

## Day 24｜替 Tool 貼上安全標籤：Annotation 與跨來源邊界

### 核心問題

Agent 如何知道某個 Tool 是否唯讀、是否回傳外部內容；網站又該如何避免不必要的跨來源暴露？

### 文章目標

- 使用 `readOnlyHint` 與 `untrustedContentHint`。
- 說明 Annotation 是 Hint，不是後端安全控制。
- 解釋 Same-origin 預設、`exposedTo`、`fromOrigins` 與 Permissions Policy。
- 說明 MVP 為何禁用跨來源 Tool。
- 建立 Tool Security Policy。

### 實作與素材

- 依 Catalog 套用所有 Imperative Annotation。
- 在 Debug Panel 顯示安全分類。
- 寫入跨來源威脅模型，但不在正式 MVP 啟用。
- 為 Tool Name、Description、Parameter 與 Output 加入字元預算檢查。

### 當日完成標準

- [ ] 唯讀與寫入 Tool 的 Hint 正確。
- [ ] 回傳活動／個人外部內容的 Tool 標記不可信內容。
- [ ] Production 不設定 `exposedTo`。
- [ ] 文章不把 Annotation 說成授權機制。
- [ ] 建立 `day-24` Tag。

### 主要來源

`CHROME-006`、`CHROME-004`、`WEB-004`、`WMCP-005`、`04-tool-catalog.md`。

---

## Day 25｜先測 JavaScript，再測 Agent：單元、整合與 E2E

### 核心問題

哪些行為應由確定性測試保證，而不是把所有責任都交給不穩定的 LLM 測試？

### 文章目標

- 建立 Testing Pyramid。
- 使用 Vitest 測 Domain、Use Case、Validation、Error Mapping 與 Adapter。
- 使用 Playwright 測表單、登入、確認、UI 同步與 Fallback。
- 使用 DevTools／Debug API 測 Tool Schema 與執行。
- 使用 Lighthouse Agentic Browsing Audits 作輔助檢查。

### 實作與素材

最低測試集合：

- 搜尋日期範圍。
- 活動不存在。
- 收藏登入與重複收藏。
- 報名表不自動送出。
- 他人報名不可取消。
- 取消冪等。
- WebMCP unavailable 時 Human UI 正常。

### 當日完成標準

- [ ] 核心 Use Case 有 Unit Tests。
- [ ] 四條 Journey 的關鍵 Human UI 流程有 E2E。
- [ ] Tool Schema 與 Catalog 可做 Snapshot Check。
- [ ] 建立 `day-25` Tag。

### 主要來源

`CHROME-007`、`CHROME-009`、`CHROME-014`～`CHROME-017`、`TOOLING-002`、`TOOLING-003`。

---

## Day 26｜Agent 不只要能呼叫，還要呼叫正確：WebMCP Evals

### 核心問題

Tool 程式碼全部通過測試，是否就代表 Agent 一定會選對 Tool、參數與順序？

### 文章目標

- 解釋 Deterministic Test 與 Probabilistic Eval 的分工。
- 建立 Tool Selection、Argument Mapping、Sequence、Journey 四類 Evals。
- 定義 Baseline、Ideal Result、Pass Criteria 與人工 Review。
- 避免只測 Happy Path。

### 實作與素材

建立至少 20 組 Prompt Dataset：

| 類別 | 最低數量 |
|---|---:|
| 正確選擇單一 Tool | 5 |
| 不應呼叫 Tool／需要澄清 | 4 |
| 參數與格式映射 | 4 |
| 多 Tool 順序 | 4 |
| 安全與 Human Confirmation | 3 |

每筆至少包含：

- User Prompt。
- 預期 Tool／不呼叫 Tool。
- 必要參數。
- 禁止副作用。
- 評分規則。

### 當日完成標準

- [ ] Dataset 至少 20 組。
- [ ] 涵蓋四條正式 Journey。
- [ ] 包含模糊語意、錯誤順序與安全案例。
- [ ] 保存首次 Baseline Result。
- [ ] 建立 `day-26` Tag。

### 主要來源

`CHROME-007`、`CHROME-005`、`TOOLING-001`、`NIST AI RMF` 對應來源。

---

## Day 27｜故意讓它失敗：過期狀態、重複呼叫與重試

### 核心問題

Agent、網路、頁面與後端狀態不同步時，網站是否能安全失敗並協助恢復？

### 文章目標

- 建立 Failure Mode Matrix。
- 模擬 Timeout、Rate Limit、Session 過期、活動額滿、重複報名、重複取消與頁面過期。
- 區分可重試與不可重試錯誤。
- 驗證 Agent 不會因重試造成重複副作用。
- 用結果回頭修正 Description、Schema、Error 與 Lifecycle。

### 實作與素材

完成 Reliability Report：

- 故障注入方式。
- 修正前行為。
- 修正後行為。
- 自動化測試。
- Eval Regression。
- 尚未解決的限制。

### 當日完成標準

- [ ] 至少測試六種 Failure Mode。
- [ ] 所有寫入都有重複呼叫防護或明確衝突結果。
- [ ] Session 過期不洩漏個人資料。
- [ ] 完成 M4：品質與安全。
- [ ] 建立 `day-27` Tag。

### 主要來源

`CHROME-005`、`CHROME-007`、`SECURITY-002`、`SECURITY-003`、`TOOLING-002`、`TOOLING-003`。

---

## 第六階段：正式化與完賽（Day 28～Day 30）

## Day 28｜使用者必須知道 Agent 做了什麼：可觀測性與無障礙

### 核心問題

即使 Agent 正確完成任務，使用者若看不見執行內容、狀態與影響，是否真的能信任它？

### 文章目標

- 建立 Agent Activity Panel。
- 顯示正在執行、成功、失敗、取消與等待確認。
- 顯示 Tool 名稱的使用者友善翻譯，不直接暴露敏感參數。
- 處理焦點、Live Region、狀態訊息、Reduced Motion 與 Layout Stability。
- 區分前端 Activity 與後端 Audit Log。

### 實作與素材

Activity Panel 顯示：

- 時間。
- 動作摘要。
- 影響的活動或報名。
- 執行結果。
- 是否需要人類確認。
- 可撤銷操作入口（適用時）。

### 當日完成標準

- [ ] 使用者可理解 Agent 做了什麼，而非只看到「完成」。
- [ ] 敏感資料不出現在 Activity Panel。
- [ ] Keyboard、Screen Reader 與 Focus Flow 通過基本驗收。
- [ ] Layout 變動不造成主要操作跳動。
- [ ] 建立 `day-28` Tag。

### 主要來源

`CHROME-014`、`CHROME-017`～`CHROME-019`、`A11Y-002`、`A11Y-003`、`03-architecture.md`。

---

## Day 29｜實驗 API 怎麼上線？漸進式增強、版本鎖定與部署

### 核心問題

WebMCP 尚未普遍支援時，如何公開 Demo 又不讓整個網站綁死在單一實驗 API？

### 文章目標

- 實踐 Feature Detection 與 Progressive Enhancement。
- 說明本機 Flag、HTTPS、Origin Trial 與公開 Demo 的差異。
- 固定 Baseline、Chrome 實測版本與 Spec Snapshot。
- 建立不支援瀏覽器的清楚 Fallback。
- 說明同源部署、環境變數、Migration 與 Rollback。

### 實作與素材

完成：

- Production Build。
- HTTPS 線上 Demo。
- Origin Trial Token 設定（若當時仍需要）。
- Compatibility Banner。
- `SPEC_SNAPSHOT.md`／Baseline 連結。
- Deployment Runbook。
- WebMCP 關閉後的完整 Smoke Test。

### 當日完成標準

- [ ] Human UI 在不支援 WebMCP 的瀏覽器仍可完成核心任務。
- [ ] 不把規劃中的 Chrome Shipping 版本寫成既定事實。
- [ ] Demo 頁清楚標示實驗性、支援條件與測試日期。
- [ ] 建立 `day-29` Tag。

### 主要來源

`CHROME-001`、`CHROME-010`、`CHROME-011`、`WEB-003`、`WEB-005`、`BROWSER-001`、`BROWSER-002`、`05-webmcp-baseline.md`。

---

## Day 30｜網站正式成為 Agent-ready：最終 Demo、檢查表與未來展望

### 核心問題

完成 30 天後，我們究竟證明了什麼；哪些問題仍然沒有被 WebMCP 解決？

### 文章目標

- 完整展示四條 Journey 與七個 Tool。
- 回顧從 Browser Actuation 到 Structured Tool 的改善。
- 公開測試、Eval、Reliability 與已知限制。
- 提供 Agent-ready Website Checklist。
- 討論標準化、跨瀏覽器、安全與未來研究方向。
- 避免把單一 Demo 的成功推論成所有網站都應立即導入。

### 實作與素材

發布：

- `v1.0.0` Release。
- 完整 README。
- Demo 影片或 GIF。
- Agent-ready Website Checklist。
- Eval Dataset 與結果摘要。
- Architecture、Tool Catalog、Baseline 與 Changelog。
- 「適合／不適合使用 WebMCP」決策表。

### 當日完成標準

- [ ] 四條 Journey 可展示或有誠實的失敗說明。
- [ ] 七個 Tool 與 Catalog 一致。
- [ ] 測試與 Evals 可重現。
- [ ] 已知限制、瀏覽器支援與安全風險完整揭露。
- [ ] 完成 M5 與 `day-30` Tag。
- [ ] 建立正式 GitHub Release `v1.0.0`。

### 主要來源

`WMCP-001`、`WMCP-006`、`WMCP-007`、`WMCP-008`、`CHROME-001`、`CHROME-011`、`BROWSER-001`、`BROWSER-002`、`NIST AI RMF` 對應來源。

---

# 11. 每篇文章固定格式

每篇文章建議採用以下結構，避免 30 天後半段風格失控。

```markdown
# Day XX｜文章標題

> 技術基準
>
> - 撰寫／查核日期：2026-08-XX
> - AgentReady Events Baseline：1.0.0
> - Chrome：填入實測完整版本
> - WebMCP 狀態：Experimental / Origin Trial
> - API Entry：document.modelContext

## 昨日完成了什麼

用 2～3 句交代目前專案狀態。

## 今天要解決的問題

只提出一個可回答的核心問題。

## 先看結果

先放最終畫面、GIF 或行為摘要。

## 核心觀念

解釋今天最重要的概念與適用邊界。

## 實作

只展示 1～3 個關鍵程式片段；完整程式以 Git Tag 為準。

## 失敗案例

展示至少一個錯誤輸入、錯誤設計、風險或失敗狀態。

## 測試與驗收

列出正常案例、失敗案例與實際結果。

## 今日成果

- 完成功能
- 畫面／圖表
- Git Tag
- 已知限制

## 主要來源

列出 docs/02-source-list.md 中的來源 ID 與實際查核日期。

## 明日預告

用一段自然問題銜接下一篇。
```

---

# 12. 每日產出標準

| 項目 | 標準 |
|---|---|
| 中文篇幅 | 約 1,500～2,500 字；複雜安全或架構篇可略高 |
| 核心觀念 | 一篇一個，不以篇幅堆疊證明深度 |
| 程式碼 | 1～3 個主要片段，完整版本放 Repository |
| 可見素材 | 至少一張 UI、流程圖、架構圖、表格或 GIF |
| 實際變更 | 至少一個可執行或可驗證成果 |
| 失敗案例 | 至少一個，不只展示 Happy Path |
| 測試 | 至少一個正常與一個失敗驗收；理論篇則以反例或比較取代 |
| 引用 | 優先 P0／P1，標示查核日期與實驗性狀態 |
| Git | 一篇一 Tag，不把多日成果混在同一 Tag |
| 明日銜接 | 清楚解釋下一篇為何是自然的下一步 |

---

# 13. Repository 與文章檔案規劃

```text
agent-ready-events/
├─ apps/
│  ├─ web/
│  └─ api/
├─ packages/
│  ├─ domain/
│  ├─ application/
│  ├─ shared-schema/
│  └─ webmcp-tools/
├─ tests/
│  ├─ unit/
│  ├─ integration/
│  ├─ e2e/
│  ├─ webmcp/
│  └─ evals/
├─ docs/
│  ├─ 00-project-brief.md
│  ├─ 01-series-outline.md
│  ├─ 02-source-list.md
│  ├─ 03-architecture.md
│  ├─ 04-tool-catalog.md
│  ├─ 05-webmcp-baseline.md
│  ├─ articles/
│  │  ├─ day-01.md
│  │  ├─ day-02.md
│  │  └─ ...
│  ├─ diagrams/
│  ├─ security/
│  ├─ baselines/
│  └─ decisions/
├─ evals/
│  ├─ prompts.jsonl
│  ├─ rubric.md
│  └─ results/
├─ CHANGELOG.md
├─ README.md
└─ package.json
```

## 13.1 Branch 與 Tag

建議：

```text
main                 可發布、可執行版本
article/day-XX       當日草稿與程式變更
```

每日完成：

```bash
git tag -a day-XX -m "Day XX: <topic>"
git push origin day-XX
```

Day 30：

```bash
git tag -a v1.0.0 -m "AgentReady Events Ironman release"
git push origin v1.0.0
```

## 13.2 Commit 類型

```text
docs:    文章、來源、架構、Baseline
feat:    新功能或 Tool
fix:     修正行為
test:    Unit、E2E、Evals
security: 安全修正與政策
chore:   Tooling、CI、Build
```

---

# 14. 來源與事實查核策略

每篇文章必須：

1. 先查看 `02-source-list.md` 的對應 Day 區段。
2. 優先讀 WebMCP CG Draft、Chrome 官方文件與 Web Platform 規格。
3. 若引用瀏覽器支援、Origin Trial、版本或 Vendor Position，發文當日重新查核。
4. 對「目前」「已支援」「預計推出」使用明確日期與版本。
5. 將下列三種內容分開寫：

```text
規格草案定義
Chrome 現行實作
AgentReady Events 專案自行約定
```

6. 不以第三方文章作為 API 行為的唯一依據。
7. API 改版時依 `05-webmcp-baseline.md` 的 Change Policy 處理，不靜默改寫歷史。

---

# 15. 開賽前完成度目標

為降低連續 30 天發文風險，開賽前建議達到：

| 項目 | 開賽前目標 |
|---|---:|
| 核心產品程式 | 90～100% |
| Day 1～Day 10 草稿 | 100% |
| Day 11～Day 20 草稿 | 至少 60% |
| Day 21～Day 30 大綱與素材 | 100% |
| 截圖／GIF／架構圖 | 至少完成前 15 天 |
| Unit／E2E 測試 | 核心流程已可執行 |
| Eval Dataset | 先完成 10 組，Day 26 擴充到至少 20 組 |
| 線上 Demo | 至少 Staging 可用 |
| 緊急備稿 | 至少 3 篇不依賴當日新開發的文章 |

## 15.1 建議優先完成順序

```text
1. Human UI 與資料模型
2. 七個 Tool 的核心邏輯
3. 登入、授權與 Human Confirmation
4. Unit／E2E Tests
5. WebMCP Adapter 與 Debug Panel
6. Evals 與安全測試
7. 文章草稿、圖表與 GIF
8. Production Demo 與 Release 文件
```

---

# 16. 風險與備援

| 風險 | 對系列的影響 | 備援方式 |
|---|---|---|
| WebMCP API 在比賽前改版 | 程式範例失效 | Adapter、Baseline、Migration Note、保留舊 Tag |
| Chrome Agent UI 不穩定 | 無法穩定展示自然語言 Journey | DevTools、`getTools()`／`executeTool()`、錄製成功 Demo |
| Origin Trial 時程改變 | 公開 Demo 無法直接啟用 | 本機 Testing Flag＋完整 Human UI＋錄製影片 |
| Agent 結果不一致 | Eval 結果波動 | 固定 Dataset、重複執行、保存模型與環境資訊 |
| 功能範圍膨脹 | 開發拖延、文章中斷 | 嚴格遵守非目標，不新增第 8 個 Tool |
| 每篇內容太深 | 讀者跟不上 | 一篇一問題、先結果再原理、提供 Git Tag |
| 每篇內容太像文件翻譯 | 缺乏個人價值 | 每篇都加入專案決策、失敗案例與實測結果 |
| 安全章節過度理論化 | 難以理解 | 使用惡意活動內容、越權取消、過期 Session 等可重現案例 |
| 發文當日臨時除錯 | 失去連載節奏 | 程式提前完成，文章使用已驗證 Tag |

---

# 17. 系列 Definition of Done

只有同時滿足下列條件，系列才視為完成：

## 17.1 文章

- [ ] 連續發表 30 篇。
- [ ] 每篇只有一個清楚核心問題。
- [ ] 每篇都有可見成果、失敗案例與來源。
- [ ] 含 WebMCP 程式碼的文章具有版本標頭。
- [ ] 文章之間能形成完整敘事，不是 30 篇獨立筆記。

## 17.2 程式

- [ ] 七個 Tool 與 Catalog 名稱、Schema、風險與行為一致。
- [ ] Human UI 不依賴 WebMCP 仍可使用。
- [ ] UI 與 Tool 共用 Application Use Case。
- [ ] Tool 不直接繞過 API、授權或資料層。
- [ ] R3 操作需要人類確認。

## 17.3 品質

- [ ] Unit、Integration、E2E 與 Deterministic Tool Tests 通過。
- [ ] 至少 20 組 Eval Prompts 與結果可查閱。
- [ ] Prompt Injection 與越權測試有重現方式。
- [ ] Failure Matrix 至少涵蓋六種故障。
- [ ] Agent Activity、Audit 與敏感資料最小化完成。

## 17.4 發布

- [ ] `day-01`～`day-30` Tags 完整。
- [ ] 線上 Demo 或可替代的錄製展示可用。
- [ ] README、Architecture、Catalog、Baseline 與 Checklist 完整。
- [ ] 發布 `v1.0.0` Release。
- [ ] 清楚揭露實驗性、瀏覽器支援與已知限制。

---

# 18. 變更管理

## 18.1 可以直接微調

- 文章標題語氣。
- 圖表順序。
- 程式片段長度。
- 例子中的活動名稱與測試資料。
- 不影響核心交付物的 UI 細節。

## 18.2 必須更新本文件版本

- 更換實作專案主題。
- 改變 Day 順序或合併／拆分文章。
- 新增、刪除或改名 WebMCP Tool。
- 改變里程碑或最終交付成果。
- 改變 Human-in-the-loop 政策。
- WebMCP API Breaking Change 造成多篇文章範圍重寫。

## 18.3 版本規則

```text
Patch：文字、錯字與不影響範圍的澄清
Minor：調整某幾天內容但不改變系列主線與 Tool Catalog
Major：改變系列定位、主要 Journey、Tool Catalog 或技術架構
```

---

# 19. 變更紀錄

| 日期 | 版本 | 變更 |
|---|---:|---|
| 2026-06-24 | 1.0.0 | 建立完整 30 天文章大綱；對齊 Architecture 1.0.0、Tool Catalog 1.0.0 與 WebMCP Baseline 1.0.0 |
