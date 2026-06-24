# 技術來源清單：AgentReady Events / WebMCP

> 對應系列：《網站不只給人用：30 天打造 AI Agent 看得懂的 WebMCP 網站》

| 欄位 | 內容 |
|---|---|
| 文件狀態 | Active |
| 建立日期 | 2026-06-24 |
| 最後查核日期 | 2026-06-24 |
| 維護頻率 | 開賽前每週一次；比賽期間每 3～5 天一次 |
| 使用範圍 | 30 天文章、AgentReady Events 實作、README、技術決策與測試 |

---

## 1. 建立這份清單的目的

WebMCP 目前仍是快速變動中的提案。規格草案、Chrome 實作文件、瀏覽器支援狀態與範例程式碼可能在短時間內調整。

因此，本專案不只保存網址，也替每一份來源標記：

- 來源層級與可信度
- 適合用來回答的問題
- 預計對應的文章天數
- 是否需要定期重新查核
- 是否可以作為技術結論的唯一依據

本文件的目標不是蒐集最多連結，而是建立一份可以持續維護、可追溯、能避免引用過時資料的技術來源登錄表。

---

## 2. 來源優先順序

### P0：規格與標準提案

包含 WebMCP 規格草案、官方 Repository、Explainer、Issue 與 Pull Request。

適合回答：

- API 在設計上「應該」如何運作
- 名詞與資料模型如何定義
- 尚未解決的議題有哪些
- 提案目前正在討論哪些變更

> P0 來源最接近規格本身，但草案內容不保證已經被瀏覽器完整實作。

### P1：瀏覽器實作與官方開發文件

以 Chrome for Developers、Chrome Status、Blink Intent 與 DevTools 文件為主。

適合回答：

- 目前 Chrome 實際支援什麼
- 應該使用哪一個 API 名稱
- 如何開啟測試 Flag 或加入 Origin Trial
- 如何在 DevTools、Lighthouse 與 Inspector 中測試

> 寫可執行程式碼時，P1 通常比規格草案更接近目前實際環境。

### P2：既有 Web 標準、資安與可及性文件

包含 WHATWG、W3C、JSON Schema、MCP、OWASP 與 NIST。

適合回答：

- HTML 表單與 DOM 的正確行為
- Schema、登入、授權、Session 與資安設計
- Human-in-the-loop、Prompt Injection 與風險管理
- 無障礙與語意化 HTML 的要求

### P3：工具、Demo 與社群案例

包含 Chrome Labs 工具、示範專案、Awesome WebMCP 與社群文章。

適合：

- 尋找可執行範例
- 觀察常見實作方式
- 蒐集 Demo 靈感與踩坑紀錄

> P3 不應作為規格行為、瀏覽器支援度或安全結論的唯一依據。

---

## 3. 引用與查核規則

1. **規格定義**優先引用 WebMCP Draft 與官方 Repository。
2. **目前可執行語法**優先依據 Chrome 官方文件與實際測試結果。
3. 規格與 Chrome 文件若不一致，文章中必須明確分成「規格提案」與「Chrome 目前實作」。
4. 所有 WebMCP 程式碼都要記錄：撰寫日期、Chrome 版本、測試 Flag 或 Origin Trial 狀態。
5. Blog、Medium、社群貼文與 AI 產生內容不得作為 API 行為的唯一證據。
6. 每篇文章至少保留一份第一手來源；重要技術結論盡量交叉比對兩份官方來源。
7. 遇到尚未定案的設計，使用「目前提案」、「Chrome 現行實作」或「仍在討論」等措辭，不寫成已確定標準。
8. 範例程式必須以本專案實測結果為準，不能只因官方文件有程式碼就假設一定可執行。

---

## 4. 目前必須知道的 WebMCP 基準狀態

> 本節只是來源清單中的快速警示；正式版本基準另寫於 `docs/05-webmcp-baseline.md`。

- WebMCP 目前是**提議中的 Web 標準**，不是已完成的 W3C Recommendation。
- WebMCP 目前提供兩條主要實作路徑：Declarative API 與 Imperative API。
- Chrome 現行文件使用 `document.modelContext`。
- 舊版範例中的 `navigator.modelContext` 已在 Chrome 150 標示為棄用。
- Chrome 149 起可加入 WebMCP Origin Trial；正式時程仍可能調整。
- 本專案必須把 WebMCP 視為 Progressive Enhancement，不可讓不支援 WebMCP 的瀏覽器失去基本網站功能。
- Firefox 與 Safari/WebKit 的標準立場仍需持續追蹤，不能假設跨瀏覽器支援已經成立。

---

# 5. WebMCP 核心規格與治理來源

| ID | 優先級 | 來源 | 主要用途 | 對應文章 | 查核頻率 |
|---|---:|---|---|---|---|
| WMCP-001 | P0 | [WebMCP Specification Draft](https://webmachinelearning.github.io/webmcp/) | API 介面、資料結構、工具註冊、Annotation、跨來源暴露等正式提案文字 | Day 3、8～14、24、29 | 每週 |
| WMCP-002 | P0 | [webmachinelearning/webmcp](https://github.com/webmachinelearning/webmcp) | 規格原始碼、Explainer、最新 Commit、議題與提案變動 | 全系列 | 每週 |
| WMCP-003 | P0 | [WebMCP README / Explainer](https://github.com/webmachinelearning/webmcp/blob/main/README.md) | 背景、設計動機、使用情境、WebMCP 與後端整合的差異 | Day 1～5 | 每週 |
| WMCP-004 | P0 | [Declarative API Explainer](https://github.com/webmachinelearning/webmcp/blob/main/declarative-api-explainer.md) | HTML 表單如何轉為工具、欄位與 Tool Schema 的對應 | Day 7～10、18 | 每週 |
| WMCP-005 | P0 | [Security and Privacy Questionnaire](https://github.com/webmachinelearning/webmcp/blob/main/security-privacy-questionnaire.md) | 提案層級的安全、隱私、權限與跨來源風險 | Day 19～24 | 每週 |
| WMCP-006 | P0 | [WebMCP Issues](https://github.com/webmachinelearning/webmcp/issues) | 追蹤未解決問題、爭議、API 命名與可能破壞性變更 | 全系列 | 每 3～5 天 |
| WMCP-007 | P0 | [WebMCP Pull Requests](https://github.com/webmachinelearning/webmcp/pulls) | 追蹤即將合併的規格變更與新功能 | 全系列 | 每 3～5 天 |
| WMCP-008 | P0 | [W3C Web Machine Learning Community Group](https://www.w3.org/community/webmachinelearning/) | 確認提案孵化社群、會議與標準化背景 | Day 3、29、30 | 每月 |
| WMCP-009 | P3 | [Awesome WebMCP](https://github.com/webmachinelearning/awesome-webmcp) | 尋找 Demo、工具、文章與社群實驗；不可作為規格唯一依據 | Day 2、6、30 | 每兩週 |

---

# 6. Chrome 實作與官方教學來源

| ID | 優先級 | 來源 | 主要用途 | 對應文章 | 查核頻率 |
|---|---:|---|---|---|---|
| CHROME-001 | P1 | [WebMCP Overview](https://developer.chrome.com/docs/ai/webmcp) | WebMCP 定位、支援能力、限制、Flag、Origin Trial 與整體導覽 | Day 1～6、29、30 | 每週 |
| CHROME-002 | P1 | [How WebMCP Fits in User Journeys](https://developer.chrome.com/docs/ai/webmcp/use-cases) | Critical User Journey、工具策略與人類／Agent 協作情境 | Day 5、17～22 | 每兩週 |
| CHROME-003 | P1 | [Declarative API](https://developer.chrome.com/docs/ai/webmcp/declarative-api) | `toolname`、`tooldescription`、欄位描述、表單提交與事件 | Day 7～10、18 | 每週 |
| CHROME-004 | P1 | [Imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api) | `document.modelContext`、`registerTool()`、Schema、execute 與移除工具 | Day 11～17 | 每週 |
| CHROME-005 | P1 | [WebMCP Best Practices](https://developer.chrome.com/docs/ai/webmcp/best-practices) | Tool Strategy、命名、Schema、動態註冊、可靠性與測試 | Day 5、12～17、27 | 每週 |
| CHROME-006 | P1 | [WebMCP Tool Security](https://developer.chrome.com/docs/ai/webmcp/secure-tools) | Prompt Injection、可信內容、安全 Annotation、跨來源工具暴露 | Day 19～24 | 每週 |
| CHROME-007 | P1 | [WebMCP Evals](https://developer.chrome.com/docs/ai/webmcp/evals) | Tool Selection、參數、工具順序、完整任務與 Eval Dataset | Day 25～27 | 每週 |
| CHROME-008 | P1 | [When to Use WebMCP and MCP](https://developer.chrome.com/docs/ai/webmcp/compare-mcp) | WebMCP、MCP、前端分頁狀態與後端服務的差異 | Day 4 | 每月 |
| CHROME-009 | P1 | [Debug WebMCP Tools in DevTools](https://developer.chrome.com/docs/devtools/application/webmcp) | 查看、手動呼叫、追蹤工具執行與回傳內容 | Day 6、15、25 | 每週 |
| CHROME-010 | P1 | [Join the WebMCP Origin Trial](https://developer.chrome.com/blog/ai-webmcp-origin-trial) | Origin Trial 起始版本、註冊方式與試驗性質 | Day 6、29 | 每週 |
| CHROME-011 | P1 | [WebMCP Chrome Status](https://chromestatus.com/feature/5117755740913664) | Chrome 開發階段、試驗版本、里程碑與實作狀態 | Day 6、29、30 | 每 3～5 天 |
| CHROME-012 | P1 | [Intent to Experiment](https://groups.google.com/a/chromium.org/g/blink-dev/search?q=WebMCP) | Blink 團隊的實驗意圖、風險、標準化與跨瀏覽器訊號 | Day 3、6、29 | 每兩週 |
| CHROME-013 | P1 | [WebMCP Early Preview](https://developer.chrome.com/blog/webmcp-epp) | 早期公開背景與 Chrome 推動方向 | Day 1、3 | 封存參考 |
| CHROME-014 | P1 | [Registered WebMCP Tools Audit](https://developer.chrome.com/docs/lighthouse/agentic-browsing/registered-webmcp-tools) | 使用 Lighthouse 列出 Declarative 與 Imperative Tools | Day 25、28 | 每月 |
| CHROME-015 | P1 | [Forms Missing Declarative WebMCP Audit](https://developer.chrome.com/docs/lighthouse/agentic-browsing/forms-missing-declarative-webmcp) | 檢查表單是否缺少 `toolname` 與 `tooldescription` | Day 9、25 | 每月 |
| CHROME-016 | P1 | [WebMCP Schema Validity Audit](https://developer.chrome.com/docs/lighthouse/agentic-browsing/webmcp-schema-validity) | 檢查工具名稱、描述、欄位名稱與參數說明 | Day 9、12、25 | 每月 |
| CHROME-017 | P1 | [Lighthouse Agentic Browsing Scoring](https://developer.chrome.com/docs/lighthouse/agentic-browsing/scoring) | 瞭解 Agentic Browsing 類別仍屬實驗性，以及目前稽核呈現方式 | Day 25、28～30 | 每月 |
| CHROME-018 | P1 | [Accessibility for Agents](https://developer.chrome.com/docs/lighthouse/agentic-browsing/accessibility-for-agents) | Accessibility Tree、標籤與 Agent 可理解性 | Day 7、28 | 每月 |
| CHROME-019 | P1 | [Layout Stability for Agents](https://developer.chrome.com/docs/lighthouse/agentic-browsing/layout-stability) | 說明畫面位移如何影響以座標與截圖操作的 Agent | Day 2、28 | 每月 |
| CHROME-020 | P1 | [Chrome DevTools 149: WebMCP Support](https://developer.chrome.com/blog/new-in-devtools-149) | DevTools Flag、Tool Schema、手動執行與 Invocation 追蹤 | Day 6、15 | 封存參考 |

---

# 7. 瀏覽器互通性與標準立場

| ID | 優先級 | 來源 | 主要用途 | 對應文章 | 查核頻率 |
|---|---:|---|---|---|---|
| BROWSER-001 | P1 | [Mozilla Standards Position: WebMCP](https://github.com/mozilla/standards-positions/issues/1412) | 追蹤 Firefox／Mozilla 對提案的評估、疑慮與最終立場 | Day 3、29、30 | 每兩週 |
| BROWSER-002 | P1 | [WebKit Standards Position: WebMCP](https://github.com/WebKit/standards-positions/issues/670) | 追蹤 Safari／WebKit 對 API、安全、隱私、可攜性與使用案例的意見 | Day 3、23、29、30 | 每兩週 |
| BROWSER-003 | P0 | [WebMCP Accessibility Meta Issue](https://github.com/webmachinelearning/webmcp/issues/65) | 追蹤 Agent 操作、ARIA、可及性與輔助科技之間的關係 | Day 7、28、30 | 每月 |

---

# 8. MCP 與 Schema 基礎來源

| ID | 優先級 | 來源 | 主要用途 | 對應文章 | 查核頻率 |
|---|---:|---|---|---|---|
| FOUNDATION-001 | P2 | [Model Context Protocol Specification 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25) | 定義 MCP，避免把 MCP 與 WebMCP 混為一談 | Day 4 | 每月 |
| FOUNDATION-002 | P2 | [MCP Tools](https://modelcontextprotocol.io/specification/2025-11-25/server/tools) | 工具名稱、描述、輸入 Schema 與 Tool Calling 基本概念 | Day 3、4、12 | 每月 |
| FOUNDATION-003 | P2 | [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12) | `type`、`properties`、`required`、`enum`、組合條件與驗證 | Day 9、12、13、25 | 每季 |
| FOUNDATION-004 | P2 | [JSON Schema Understanding Guide](https://json-schema.org/understanding-json-schema/) | 以較容易理解的方式教學 Schema 設計 | Day 9、12 | 每季 |

---

# 9. HTML、DOM、權限與 Web 平台基礎

| ID | 優先級 | 來源 | 主要用途 | 對應文章 | 查核頻率 |
|---|---:|---|---|---|---|
| WEB-001 | P2 | [WHATWG HTML Standard — Forms](https://html.spec.whatwg.org/multipage/forms.html) | HTML 表單、控制項、驗證、提交與標準行為 | Day 7～10、18 | 每季 |
| WEB-002 | P2 | [WHATWG DOM Standard](https://dom.spec.whatwg.org/) | Document、事件、AbortSignal 與 DOM 生命週期 | Day 11、14、15 | 每季 |
| WEB-003 | P2 | [Secure Contexts](https://w3c.github.io/webappsec-secure-contexts/) | HTTPS 與高權限 Web API 的安全前提 | Day 6、20、29 | 每季 |
| WEB-004 | P2 | [Permissions Policy](https://w3c.github.io/webappsec-permissions-policy/) | `tools` Policy、iframe 與跨來源能力控制的基礎 | Day 20、24、29 | 每季 |
| WEB-005 | P2 | [MDN Progressive Enhancement](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement) | 不支援 WebMCP 時仍維持可用網站的設計原則 | Day 7、29 | 每季 |

---

# 10. 無障礙與語意化表單來源

| ID | 優先級 | 來源 | 主要用途 | 對應文章 | 查核頻率 |
|---|---:|---|---|---|---|
| A11Y-001 | P2 | [W3C WAI Forms Tutorial](https://www.w3.org/WAI/tutorials/forms/) | Label、Instructions、Validation、Grouping 與 User Notification | Day 7～10、18、28 | 每季 |
| A11Y-002 | P2 | [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | 無障礙驗收依據；避免為 Agent 增強卻破壞人類使用者體驗 | Day 7、18、28～30 | 每季 |
| A11Y-003 | P2 | [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/) | 對話框、狀態訊息、焦點管理與互動元件模式 | Day 10、19、22、28 | 每季 |

---

# 11. AI Agent 與應用安全來源

| ID | 優先級 | 來源 | 主要用途 | 對應文章 | 查核頻率 |
|---|---:|---|---|---|---|
| SECURITY-001 | P2 | [OWASP LLM01: Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) | Direct／Indirect Prompt Injection、惡意內容與 Agent 誤導 | Day 23、24、27 | 每月 |
| SECURITY-002 | P2 | [OWASP Top 10 for LLM Applications 2025](https://genai.owasp.org/llm-top-10/) | 建立完整 LLM／Agent 風險背景與文章安全章節 | Day 19、23、24、27 | 每月 |
| SECURITY-003 | P2 | [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) | 最小權限、預設拒絕、每次 Request 驗證與伺服器端授權 | Day 19～22、27 | 每季 |
| SECURITY-004 | P2 | [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) | Session、Cookie、逾時與登入狀態管理 | Day 20、21、27 | 每季 |
| SECURITY-005 | P2 | [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) | Agent 觸發寫入操作時仍需維持一般 Web 防護 | Day 20、22、24 | 每季 |
| SECURITY-006 | P2 | [OWASP Cross Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) | 活動內容、Tool Output 與 UI 呈現的輸出編碼及 Sanitization | Day 13、23、24 | 每季 |
| SECURITY-007 | P2 | [NIST AI RMF Generative AI Profile](https://www.nist.gov/itl/ai-risk-management-framework/nist-ai-rmf-playbook) | AI 風險辨識、量測、管理與治理框架 | Day 23～27、30 | 每季 |

---

# 12. 測試與實作工具官方來源

| ID | 優先級 | 來源 | 主要用途 | 對應文章 | 查核頻率 |
|---|---:|---|---|---|---|
| TOOLING-001 | P3 | [GoogleChromeLabs/webmcp-tools](https://github.com/GoogleChromeLabs/webmcp-tools) | Inspector、Evals CLI、Demo 與可執行測試工具 | Day 6、15、25～27 | 每週 |
| TOOLING-002 | P2 | [Vitest Guide](https://vitest.dev/guide/) | Domain Service、Schema 與 Tool Adapter 單元測試 | Day 25、27 | 每月 |
| TOOLING-003 | P2 | [Playwright Documentation](https://playwright.dev/docs/intro) | UI、表單、登入、確認流程與跨頁面 E2E 測試 | Day 25、27～29 | 每月 |
| TOOLING-004 | P2 | [Vite Guide](https://vite.dev/guide/) | 前端專案、開發伺服器、建置與環境變數 | Day 6、29 | 每月 |
| TOOLING-005 | P2 | [Node.js Documentation](https://nodejs.org/docs/latest/api/) | 後端 Runtime、HTTP 與測試環境 | Day 16、20、29 | 每月 |
| TOOLING-006 | P2 | [SQLite Documentation](https://www.sqlite.org/docs.html) | 活動、收藏、報名與稽核資料儲存 | Day 16、20～22 | 每季 |

---

# 13. 各階段必讀來源

## Day 1～Day 5：看懂 Agentic Web 與題目定位

必讀：

1. `CHROME-001` WebMCP Overview
2. `WMCP-003` WebMCP README / Explainer
3. `CHROME-002` User Journeys
4. `CHROME-008` WebMCP versus MCP
5. `CHROME-005` Best Practices
6. `BROWSER-001` Mozilla Position
7. `BROWSER-002` WebKit Position

主要產出：

- WebMCP 解決的問題
- WebMCP、MCP、REST API 與 Browser Automation 比較
- Critical User Journey
- 初版 Tool Strategy

## Day 6～Day 10：Declarative API 與語意化表單

必讀：

1. `CHROME-003` Declarative API
2. `WMCP-004` Declarative API Explainer
3. `WEB-001` WHATWG Forms
4. `A11Y-001` WAI Forms Tutorial
5. `CHROME-009` DevTools
6. `CHROME-015` Declarative Form Audit
7. `CHROME-016` Schema Validity Audit

主要產出：

- `search_events`
- 搜尋表單 Schema
- Agent 與人類共用的表單
- Feature Detection 與測試頁

## Day 11～Day 17：Imperative API、Schema 與生命週期

必讀：

1. `CHROME-004` Imperative API
2. `CHROME-005` Best Practices
3. `WMCP-001` Specification Draft
4. `FOUNDATION-003` JSON Schema
5. `WEB-002` DOM Standard
6. `TOOLING-001` Chrome Labs Tools

主要產出：

- `get_event_details`
- `save_event`
- 動態註冊與移除工具
- Tool Result／Error Contract
- Agent Debug Panel

## Day 18～Day 22：Human-in-the-loop、登入與高風險操作

必讀：

1. `CHROME-002` User Journeys
2. `CHROME-006` Tool Security
3. `SECURITY-003` Authorization
4. `SECURITY-004` Session Management
5. `SECURITY-005` CSRF Prevention
6. `A11Y-003` ARIA Practices

主要產出：

- `prepare_event_registration`
- `get_my_registrations`
- `cancel_registration`
- 確認流程、資源歸屬與稽核紀錄

## Day 23～Day 27：Prompt Injection、安全測試與 Evals

必讀：

1. `CHROME-006` Tool Security
2. `WMCP-005` Security and Privacy Questionnaire
3. `SECURITY-001` OWASP Prompt Injection
4. `SECURITY-002` OWASP LLM Top 10
5. `CHROME-007` WebMCP Evals
6. `CHROME-009` DevTools
7. `CHROME-014`～`CHROME-017` Lighthouse Audits
8. `TOOLING-002` Vitest
9. `TOOLING-003` Playwright

主要產出：

- Prompt Injection 測試資料
- Tool Security Policy
- 單元與 E2E 測試
- Eval Prompt Dataset
- 失敗與重試測試

## Day 28～Day 30：正式化、相容性與未來展望

必讀：

1. `CHROME-010` Origin Trial
2. `CHROME-011` Chrome Status
3. `BROWSER-001` Mozilla Position
4. `BROWSER-002` WebKit Position
5. `WEB-005` Progressive Enhancement
6. `A11Y-002` WCAG 2.2
7. `WMCP-006` Issues
8. `WMCP-007` Pull Requests

主要產出：

- 不支援 WebMCP 的降級策略
- Agent Activity Panel
- 部署與版本鎖定
- Agent-ready Website Checklist
- 最終限制與未來展望

---

# 14. 建議閱讀順序

第一次進入 WebMCP 時，建議依照以下順序閱讀，避免一開始直接陷入規格細節：

1. `CHROME-001` WebMCP Overview
2. `WMCP-003` README / Explainer
3. `CHROME-008` WebMCP versus MCP
4. `CHROME-002` User Journeys
5. `CHROME-003` Declarative API
6. `CHROME-004` Imperative API
7. `CHROME-005` Best Practices
8. `CHROME-006` Tool Security
9. `CHROME-007` Evals
10. `WMCP-001` Specification Draft
11. `WMCP-006` Issues
12. `BROWSER-001` 與 `BROWSER-002` 瀏覽器立場

---

# 15. 每週技術來源稽核清單

每次稽核時完成下列項目：

- [ ] 查看 `webmachinelearning/webmcp` 最近 Commit
- [ ] 查看 WebMCP Open Issues 與 Pull Requests
- [ ] 搜尋 `modelContext`、`registerTool`、Declarative API、`exposedTo`、Annotation 是否有變更
- [ ] 確認 Chrome 官方文件的 Last updated 日期
- [ ] 確認 Chrome Status 的 Origin Trial 與 Milestone
- [ ] 確認 `navigator.modelContext`／`document.modelContext` 建議是否改變
- [ ] 確認 Declarative API 屬性名稱是否改變
- [ ] 確認 DevTools 與 Lighthouse 的啟用方式
- [ ] 查看 Mozilla Standards Position
- [ ] 查看 WebKit Standards Position
- [ ] 在目前使用的 Chrome 版本執行 Smoke Test
- [ ] 更新 `docs/05-webmcp-baseline.md`
- [ ] 記錄受影響的文章與程式碼

---

# 16. 來源變更紀錄

| 日期 | 來源 ID | 查核結果 | 影響 | 後續行動 |
|---|---|---|---|---|
| 2026-06-24 | CHROME-001 | WebMCP 仍標示為 proposed web standard；Chrome 149 起提供 Origin Trial | 全系列的技術定位 | 所有文章標示 Experimental／Proposed |
| 2026-06-24 | CHROME-004 | Chrome 文件使用 `document.modelContext`；`navigator.modelContext` 在 Chrome 150 棄用 | Day 11～17 程式碼 | 全專案只使用 `document.modelContext` |
| 2026-06-24 | CHROME-003 | Declarative API 以 HTML Form Annotation 建立工具 | Day 7～10、18 | 先以原生 HTML 建立搜尋與報名工具 |
| 2026-06-24 | CHROME-011 | Origin Trial 與預計里程碑仍可能調整 | Day 6、29、30 | 不將預計 Shipping 版本寫成確定日期 |
| 2026-06-24 | BROWSER-001 | Mozilla Position Issue 尚需持續追蹤 | Day 29、30 | 不宣稱 Firefox 支援 |
| 2026-06-24 | BROWSER-002 | WebKit Position Issue 提出多項 API、安全與隱私疑慮 | Day 23、29、30 | 在系列中保留批判與限制章節 |

---

# 17. 單篇文章引用紀錄模板

每篇文章可在草稿底部使用以下格式：

```markdown
## 本文技術基準

- 撰寫日期：2026-XX-XX
- 測試瀏覽器：Chrome XXX
- WebMCP 狀態：Flag / Origin Trial
- API 基準：document.modelContext

## 主要來源

- [WMCP-001] WebMCP Specification Draft
- [CHROME-004] Imperative API
- [CHROME-005] WebMCP Best Practices

## 實測備註

- 已驗證：
- 與官方文件不同之處：
- 已知限制：
```

---

# 18. 本文件的完成標準

- [x] 已建立來源可信度分級
- [x] 已收錄 WebMCP 規格與治理來源
- [x] 已收錄 Chrome 實作、Origin Trial、DevTools 與 Lighthouse 文件
- [x] 已收錄 Firefox 與 WebKit 標準立場追蹤來源
- [x] 已收錄 MCP、JSON Schema、HTML、DOM 與 Permissions Policy
- [x] 已收錄 OWASP、NIST、WCAG 與表單無障礙來源
- [x] 已建立 30 天文章階段對照
- [x] 已建立每週查核與變更紀錄機制

下一份規劃文件：`docs/03-architecture.md`
