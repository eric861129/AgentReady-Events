# WebMCP 技術基準：AgentReady Events

> 對應系列：《網站不只給人用：30 天打造 AI Agent 看得懂的 WebMCP 網站》

| 欄位 | 內容 |
|---|---|
| 文件狀態 | Accepted / Frozen Baseline |
| Baseline 版本 | 1.0.0 |
| Snapshot 日期 | 2026-06-24 |
| 最後查核日期 | 2026-06-24 |
| 主要 Runtime | Google Chrome 149+ Experimental WebMCP |
| 主要 API Entry | `document.modelContext` |
| 本機啟用方式 | `chrome://flags/#enable-webmcp-testing` |
| 公開 Demo | HTTPS + Chrome Origin Trial（試驗期間） |
| 標準狀態 | W3C Web Machine Learning Community Group Draft；非 W3C Recommendation |
| 相容策略 | Progressive Enhancement；完整 Human UI 為必要基線 |
| 相關文件 | `02-source-list.md`、`03-architecture.md`、`04-tool-catalog.md` |

---

## 1. 文件目的

WebMCP 仍在快速演進。API 名稱、Chrome 實作、Declarative 行為、Origin Trial 期間與跨瀏覽器立場，都可能在鐵人賽開始前或 30 天連載期間改變。

本文件負責固定 AgentReady Events 的技術基準，明確區分：

1. **WebMCP CG Draft 已描述的介面**。
2. **Chrome 現行實作與官方文件提供的能力**。
3. **專案自行定義的 Adapter、Output、Confirmation 與安全政策**。
4. **目前不採用或不得依賴的實驗能力**。

這份 Baseline 的目的不是宣稱 API 已穩定，而是讓程式碼、文章、測試與 Demo 在同一組假設下可重現。

---

# 2. 一頁結論

AgentReady Events v1 固定採用：

```text
WebMCP status       = Experimental / Proposed Web Standard
Primary browser     = Google Chrome 149+
Primary entry point = document.modelContext
Imperative API      = registerTool()
Declarative API     = annotated HTML form
Local flag          = chrome://flags/#enable-webmcp-testing
Public enablement   = Origin Trial token while required
Cross-origin tools  = Disabled
Headless use        = Out of scope
Fallback            = Fully functional human-facing website
```

禁止採用：

```text
navigator.modelContext
Tool logic that bypasses backend authorization
Cross-origin exposedTo in MVP
WebMCP-only forms with no normal HTML behavior
Automatic final registration or cancellation without human confirmation
Product logic that depends on getTools() or executeTool()
Claims that WebMCP is already a completed W3C standard
```

---

# 3. Baseline 決策

| ID | 固定決策 | 理由 |
|---|---|---|
| BASE-001 | WebMCP 一律標示為提議中、實驗性標準 | 目前是 Community Group Draft，不是 Recommendation |
| BASE-002 | 使用 `document.modelContext` | 現行 CG Draft 與 Chrome 文件皆以 Document 為入口 |
| BASE-003 | 禁止新增 `navigator.modelContext` 程式碼 | Chrome 150 已標示棄用；舊文章只能作歷史說明 |
| BASE-004 | Imperative Tool 只透過 Adapter 註冊 | 隔離 API 變更並集中處理型別、錯誤與生命週期 |
| BASE-005 | Declarative Tool 固定使用四個核心 HTML Attribute | `toolname`、`tooldescription`、`toolparamdescription`、必要時 `toolautosubmit` |
| BASE-006 | `getTools()`、`executeTool()` 只供 Debug／Tests | Chrome 有文件，但目前 CG Draft IDL 未固定這兩個方法 |
| BASE-007 | MVP 不使用 `exposedTo` 或 `fromOrigins` | 降低跨來源信任與權限複雜度 |
| BASE-008 | 使用 `AbortSignal` 管理 Imperative Tool 生命週期 | 目前規格與 Chrome 文件均有對應設計 |
| BASE-009 | Tool Output Envelope 是專案契約 | WebMCP 允許回傳值，但不替本專案定義 Output Schema |
| BASE-010 | R3 Confirmation 使用網站自身可見 Dialog | 不依賴尚未固定的瀏覽器通用確認 API |
| BASE-011 | WebMCP 是 Progressive Enhancement | 不支援時 Human UI 仍須完整可用 |
| BASE-012 | Runtime 與後端驗證不可省略 | JSON Schema 與 Annotation 都不是安全邊界 |
| BASE-013 | 所有正式 Demo 使用同源架構 | 簡化 Session、Cookie、Permissions Policy 與 Tool ownership |
| BASE-014 | 不支援純 Headless Agent Journey | Chrome 官方目前要求可見 Browser Tab 或 WebView |
| BASE-015 | 每篇文章記錄實測 Chrome 版本 | 讓讀者辨識範例對應的實驗環境 |

---

# 4. 2026-06-24 Runtime Snapshot

截至 2026 年 6 月 24 日，Chrome 官方發布資訊顯示：

| Channel | 觀察版本 | 本專案用途 |
|---|---|---|
| Stable | Chrome `149.0.7827.196/197`（Windows / macOS rollout） | 最低公開試驗與讀者主要驗證版本 |
| Early Stable | Chrome `150.0.7871.24/.25`（少量 rollout） | 提前檢查 API 變更 |
| Beta | Chrome `150.0.7871.24` | 開發相容測試，特別驗證 `document.modelContext` |
| Dev | Chrome `151.0.7896.2` | 只做前瞻檢查，不作文章唯一基準 |

官方 Chrome Status 當前規劃：

```text
Dev Trial    : Chrome 146
Origin Trial : Chrome 149–156
Shipping     : Chrome 157（規劃值，可能改變）
```

## 4.1 專案實際支援聲明

AgentReady Events v1 的聲明是：

- **主要驗證：Chrome 149 Stable 與 Chrome 150 Beta。**
- 不承諾 Firefox、Safari、Edge 或其他 Chromium Browser 具備相同行為。
- 即使瀏覽器基於 Chromium，也不能直接推定 Origin Trial、Agent UI 或 Flag 完全一致。
- WebMCP 不可用時，只缺少 Tool Discovery／Invocation；網站本身仍可正常使用。

## 4.2 跨瀏覽器立場快照

| Browser / Vendor | 2026-06-24 狀態 | 專案結論 |
|---|---|---|
| Chrome / Chromium | Origin Trial 與官方開發文件可用 | 主要實驗平台 |
| Mozilla / Firefox | Standards Position issue 仍為 Proposed / Open | 不列入支援基準 |
| WebKit / Safari | Standards Position 標示 Oppose，並提出 API、安全、隱私等疑慮 | 不宣稱短期跨瀏覽器支援 |

這些立場可能改變，文章中應使用日期與來源，不寫成永久結論。

---

# 5. 標準與 Chrome 實作的邊界

## 5.1 能力矩陣

| 能力 | CG Draft | Chrome 官方文件 | AgentReady Events 政策 |
|---|---:|---:|---|
| `document.modelContext` | 是 | 是 | 正式使用 |
| `registerTool()` | 是 | 是 | 正式使用 |
| `title` | 是 | 可能依實作呈現 | 可提供，但邏輯不得依賴 UI 一定顯示 |
| `description` | 是 | 是 | 必填、固定文字 |
| `inputSchema` | 是 | 是 | 使用；仍做 Runtime Validation |
| `execute()` | 是 | 是 | 使用；只呼叫既有 Application Service |
| `annotations.readOnlyHint` | 是 | 是 | Imperative Tool 依 Catalog 設定 |
| `annotations.untrustedContentHint` | 是 | 是 | Imperative Tool 依 Catalog 設定 |
| `AbortSignal` 解除註冊 | 是 | 是 | 正式使用 |
| `exposedTo` | 是 | 是 | MVP 禁用 |
| `toolchange` | 是 | 是 | Adapter / Debug 可使用 |
| `getTools()` | **目前 Draft IDL 未固定** | 是 | 僅 Debug／Deterministic Tests |
| `executeTool()` | **目前 Draft IDL 未固定** | 是 | 僅 Debug／Deterministic Tests |
| Declarative Form API | Draft 章節仍未完整規範 | 是，有官方教學 | 依 Chrome 實作與 Declarative Explainer |
| Tool Output Schema | 無固定 Output Schema | 回傳可序列化值 | 使用專案 `ToolResult<T>` |
| 通用瀏覽器確認 API | 未固定 | 文件只描述敏感操作需要互動 | 使用網站自身 Dialog |
| Headless invocation | 非主設計目標 | 官方明確列為不支援 | 不納入 MVP |

## 5.2 寫作措辭規則

正確：

```text
「目前 WebMCP CG Draft 定義……」
「Chrome 149–150 現行實作提供……」
「AgentReady Events 額外約定……」
「截至 2026-06-24，Declarative API 的正式規格仍在補完。」
```

避免：

```text
「WebMCP 標準保證所有瀏覽器都……」
「WebMCP 已經正式成為 W3C 標準……」
「所有 Agent 都會以完全相同方式……」
「getTools() 是目前 WebMCP CG Draft 已固定的核心方法……」
```

---

# 6. 固定的 Imperative API Surface

## 6.1 Production Surface

AgentReady Events 的正式功能只依賴：

```typescript
await document.modelContext.registerTool(tool, {
  signal: controller.signal,
});
```

固定 Tool Definition：

```typescript
interface ProjectWebMcpTool<TInput extends object = Record<string, unknown>> {
  name: string;
  title?: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  execute(input: TInput): Promise<unknown>;
  annotations?: {
    readOnlyHint?: boolean;
    untrustedContentHint?: boolean;
  };
}
```

固定 Registration Options：

```typescript
interface ProjectWebMcpRegistrationOptions {
  signal?: AbortSignal;

  // Baseline v1 禁止設定。
  exposedTo?: never;
}
```

## 6.2 Debug-only Surface

下列方法由 Chrome 文件提供，但不得成為一般使用者功能的必要依賴：

```typescript
await document.modelContext.getTools?.();
await document.modelContext.executeTool?.(tool, JSON.stringify(input));
```

允許用途：

- Agent Debug Panel。
- 手動 Tool Invocation。
- Schema Snapshot。
- Tool Lifecycle 測試。
- Deterministic WebMCP Tests。

禁止用途：

- 正式 UI 藉此執行自己的 Tool。
- 以 `getTools()` 結果作後端授權。
- 因 `executeTool()` 不存在就阻止人類操作網站。
- 把 Chrome-only Debug API 當成跨瀏覽器標準保證。

## 6.3 Legacy API

禁止：

```typescript
navigator.modelContext
```

Migration 規則：

```diff
- navigator.modelContext.registerTool(...)
+ document.modelContext.registerTool(...)
```

舊語法只可出現在「API 演進歷史」或 Migration 對照，不得出現在可執行主線程式碼。

---

# 7. 固定的 Declarative API Surface

## 7.1 Form Attributes

Baseline v1 使用：

| Attribute | 用途 | 專案規則 |
|---|---|---|
| `toolname` | Tool 唯一名稱 | 使用 `lower_snake_case` |
| `tooldescription` | Tool 功能與適用時機 | 固定繁中內容，不插入動態資料 |
| `toolparamdescription` | 欄位在 Schema 中的說明 | Label 不足以表達語意時必填 |
| `toolautosubmit` | Agent 填值後自動送出 Form | 只允許 `search_events`；報名 Form 禁用 |

## 7.2 Events 與 SubmitEvent 擴充

Baseline v1 允許使用：

```text
SubmitEvent.agentInvoked
SubmitEvent.respondWith(Promise<any>)
window "toolactivated" event
window "toolcancel" event
```

專案規則：

- 呼叫 `respondWith()` 前必須配合 `preventDefault()`，依 Chrome 現行文件處理。
- `respondWith()` 回傳 `ToolResult<T>`，不回傳完整個資。
- `toolactivated` 用於 Agent Activity UI、焦點與資料來源提示。
- `toolcancel` 用於清除暫時狀態，不應偷偷送出資料。
- 所有行為需在目標 Chrome 版本實測，不能只依型別假設。

## 7.3 CSS Pseudo-classes

Baseline v1 可以使用：

```css
form:tool-form-active { /* visible agent focus */ }
button:tool-submit-active { /* visible submit focus */ }
```

CSS 只是額外視覺提示；仍需符合一般 `:focus-visible`、對比與無障礙要求。

## 7.4 Declarative Schema 限制

- CG Draft 的 Declarative 章節仍未完整規範合成演算法。
- Chrome 可能依 Form Control、Label、`required`、`select` 等合成不同 Schema 結構。
- 專案以「語意契約」為主，不鎖死 `anyOf`、`oneOf` 或屬性排序。
- 每次 Chrome Major 升級後，使用 DevTools／Inspector 重新保存 Schema Snapshot。
- Runtime 與後端不能假設瀏覽器已驗證所有 JSON Schema Keyword。

---

# 8. Feature Detection 與 Adapter

## 8.1 禁止 Browser Sniffing

不要以 User-Agent 判斷 WebMCP：

```typescript
// 不採用
navigator.userAgent.includes("Chrome/149");
```

使用能力偵測：

```typescript
export function isWebMcpSupported(doc: Document = document): boolean {
  const candidate = doc as Document & {
    modelContext?: { registerTool?: unknown };
  };

  return typeof candidate.modelContext?.registerTool === "function";
}
```

## 8.2 Adapter 要求

```typescript
export interface WebMcpAdapter {
  isSupported(): boolean;

  registerTool<TInput extends object>(
    definition: ProjectWebMcpTool<TInput>,
  ): Promise<{ name: string; dispose(): void }>;

  listToolsForDebug(): Promise<readonly unknown[]>;

  executeToolForDebug(
    name: string,
    input: unknown,
    signal?: AbortSignal,
  ): Promise<unknown>;

  onToolsChanged(listener: () => void): () => void;
}
```

Adapter 必須：

- 封裝 Experimental DOM Types。
- 將 `AbortController` 轉成 `dispose()`。
- 捕捉 `NotAllowedError`、`SecurityError`、`InvalidStateError` 等註冊錯誤。
- Debug API 不存在時回傳清楚的 `UNSUPPORTED_DEBUG_API`。
- 不把 WebMCP API 散落到每個 Page Component。

## 8.3 TypeScript Ambient Types

在 TypeScript 標準 DOM Library 尚未完整提供 WebMCP 型別時，使用專案內部最小型別：

```typescript
declare global {
  interface Document {
    readonly modelContext?: ProjectModelContext;
  }
}

interface ProjectModelContext extends EventTarget {
  registerTool<TInput extends object>(
    tool: ProjectWebMcpTool<TInput>,
    options?: { signal?: AbortSignal; exposedTo?: readonly string[] },
  ): Promise<void>;

  // Chrome-only debug surface；故意標記 optional。
  getTools?(options?: { fromOrigins?: readonly string[] }): Promise<readonly unknown[]>;

  executeTool?(
    tool: unknown,
    input: string,
    options?: { signal?: AbortSignal },
  ): Promise<unknown | null>;
}
```

注意：

- 自訂型別只是編譯輔助，不代表瀏覽器一定實作。
- `getTools` 與 `executeTool` 必須保持 optional。
- Runtime 一律先做 Feature Detection。

---

# 9. 本機開發基準

## 9.1 建議 Browser

主要開發組合：

```text
Chrome Stable 149.x
Chrome Beta 150.x
Windows 10/11 或目前受支援桌面 OS
```

至少在 Stable 與 Beta 各跑一次核心 Tool 測試。

## 9.2 啟用步驟

1. 開啟 Chrome。
2. 前往：

```text
chrome://flags/#enable-webmcp-testing
```

3. 設為 `Enabled`。
4. Relaunch Chrome。
5. 開啟本機網站。
6. 在 Console 檢查：

```javascript
console.table({
  secureContext: window.isSecureContext,
  documentModelContext: "modelContext" in document,
  registerTool:
    typeof document.modelContext?.registerTool === "function",
  getToolsDebug:
    typeof document.modelContext?.getTools === "function",
  executeToolDebug:
    typeof document.modelContext?.executeTool === "function",
});
```

預期核心條件：

```text
secureContext       = true
modelContext        = available
registerTool        = function
```

`getToolsDebug` 與 `executeToolDebug` 若不存在，只影響 Debug／Testing，不應使網站核心 UI 失效。

## 9.3 Localhost 與 Secure Context

WebMCP 介面屬於 Secure Context API。開發時：

- 先確認 `window.isSecureContext === true`。
- `localhost` 通常被瀏覽器視為 potentially trustworthy，但仍以目標版本實測為準。
- LAN IP、任意 HTTP Domain 或不安全 iframe 不應假設可用。

---

# 10. 公開 Demo 與 Origin Trial

## 10.1 Baseline

Chrome 官方文件目前提供從 Chrome 149 開始的 WebMCP Origin Trial。

公開 Demo 必須：

- 使用 HTTPS。
- 依 Chrome Origin Trial 入口申請與目標 Origin 相符的 Token。
- 使用 HTTP Header 或 HTML Meta 加入 Token。
- 驗證正式 Domain，而不是只在 localhost 成功。
- 記錄 Token 的到期 Milestone。

HTML 範例：

```html
<meta http-equiv="origin-trial" content="WEBMCP_ORIGIN_TRIAL_TOKEN" />
```

HTTP Header 範例：

```http
Origin-Trial: WEBMCP_ORIGIN_TRIAL_TOKEN
```

Origin Trial Token 會傳送到 Browser 並可被檢視，不應當作應用程式 Secret；但仍需妥善管理環境與到期更新。

## 10.2 Public Demo 驗證清單

- [ ] HTTPS 有效。
- [ ] Token 對應正確 Origin。
- [ ] Chrome 目標版本中 `document.modelContext` 存在。
- [ ] 無 Flag 的乾淨 Profile 可以探索 Tool。
- [ ] Declarative 與 Imperative Tool 都可見。
- [ ] 登入／登出後 Tool 清單正確改變。
- [ ] 不支援 WebMCP 時網站仍可用。
- [ ] Origin Trial 到期日期記錄於 README。

---

# 11. Security、Origin 與 Permissions Baseline

## 11.1 Secure Context

固定要求：

```text
Production = HTTPS
Local dev  = trustworthy local context + testing flag
```

## 11.2 Origin Isolation

Chrome 官方文件指出 WebMCP 需要 origin-isolated document。

AgentReady Events 必須：

- 不使用 `document.domain`。
- 不設定會停用 Origin-Agent-Cluster 的 `Origin-Agent-Cluster: ?0`。
- 確認反向代理與 Hosting 沒有注入不相容 Header。
- 註冊失敗時記錄 `SecurityError`，但不阻擋 Human UI。

## 11.3 Permissions Policy

WebMCP 的 `tools` Permissions Policy 預設 allowlist 為 `self`。

MVP 固定：

```text
Top-level same-origin usage = allowed by default
Same-origin iframe          = only when architecture actually needs it
Cross-origin iframe         = not delegated
allow="tools"               = not used in MVP
Permissions-Policy tools    = do not broaden beyond self
```

可考慮明確收緊：

```http
Permissions-Policy: tools=(self)
```

部署前需以目標 Chrome 實測 Header 語法與行為。

## 11.4 Cross-origin API

Baseline v1 禁止：

```typescript
{ exposedTo: ["https://partner.example"] }
getTools({ fromOrigins: ["https://partner.example"] })
```

若未來要加入，必須：

1. 建立新 ADR。
2. 升級 Baseline Major／Minor。
3. 列出可信 Origin。
4. 完成資料外洩、iframe、撤銷與 Prompt Injection 測試。
5. 重新檢視 WebKit／Mozilla 與規格最新討論。

---

# 12. Tool Annotation Baseline

Imperative Tool 可用：

```typescript
annotations: {
  readOnlyHint: boolean,
  untrustedContentHint: boolean,
}
```

## 12.1 專案對照

| Tool | readOnlyHint | untrustedContentHint |
|---|---:|---:|
| `get_event_details` | `true` | `true` |
| `save_event` | `false` | `false` |
| `get_my_registrations` | `true` | `true` |
| `cancel_registration` | `false` | `false` |
| `export_my_schedule` | `true` | `true` |

Declarative Tool 目前沒有在本 Baseline 使用對等 Annotation Attribute。

## 12.2 Annotation 不代表

- 不代表 Browser 已完成 Authorization。
- 不代表 Tool 一定安全。
- 不代表 Agent 絕不受 Prompt Injection 影響。
- 不代表 `readOnlyHint: true` 可跳過登入或資料保護。
- 不代表 `untrustedContentHint: false` 的內容可以當成系統指令。

---

# 13. Human-in-the-loop Baseline

WebMCP 的核心情境是使用者與 Agent 在可見網頁共同完成任務。

AgentReady Events v1 固定：

| 操作 | Agent 權限 |
|---|---|
| 搜尋與查看公開活動 | 可直接完成 |
| 收藏活動 | 使用者有明確收藏意圖時可完成；UI 顯示與可撤銷 |
| 填寫報名資料 | 可準備、不可自動正式送出 |
| 查看我的報名 | 登入後可完成；輸出個資最小化 |
| 取消報名 | 只能開啟確認流程；人類在頁面確認後才寫入 |
| 匯出行程 | 可完成；UI 顯示下載內容與數量 |

目前不依賴一個假設存在的通用瀏覽器「確認命令」。正式確認由網站自身 Dialog、Button 與後端授權完成。

---

# 14. Output 與錯誤 Baseline

## 14.1 沒有 `outputSchema` 假設

Baseline v1 不在 Tool Definition 加入未固定的：

```typescript
outputSchema
```

所有 Output 由專案 `ToolResult<T>` 約定，詳見 `04-tool-catalog.md`。

## 14.2 可序列化輸出

`execute()` 與 `respondWith()` 回傳：

- Plain object。
- Array。
- String（僅簡單 Debug 範例，不建議正式 Tool）。

不回傳：

- DOM Node。
- Window / Document。
- Circular object。
- Function。
- Error object 原始內容。
- Response stream 或不可序列化值。

## 14.3 錯誤處理

Tool 不將可預期 Domain Error 全部 `throw` 成不透明 Exception。

建議：

```typescript
return {
  ok: false,
  code: "CONFLICT",
  reason: "EVENT_FULL",
  message: "活動已額滿，畫面已更新為不可報名。",
  retryable: false,
  uiUpdated: true,
};
```

真正未預期錯誤：

- 內部記錄 Request ID 與 Stack。
- 對 Agent 回傳 `TEMPORARY_FAILURE`。
- 對 UI 顯示安全且可理解的錯誤。
- 不洩漏技術內部資訊。

---

# 15. Testing Baseline

## 15.1 測試分層

| 層級 | 工具 | 目的 |
|---|---|---|
| Unit | Vitest | Schema、Validator、Use Case、Result Mapper |
| Integration | Vitest + Test SQLite | Repository、Transaction、Domain Policy、Audit |
| UI E2E | Playwright | Human UI、Form、Dialog、Progressive Enhancement |
| WebMCP Deterministic | Chrome + `getTools()` / `executeTool()` | Tool discovery、execution、lifecycle |
| Agent Evals | WebMCP Inspector / Eval tooling | Tool selection、arguments、journey、security |

## 15.2 Deterministic API 使用限制

`getTools()` 與 `executeTool()`：

- 可以用於目標 Chrome 的測試。
- 必須透過 Adapter Optional API。
- 若 Chrome 未提供，測試要標示 `skipped: debug API unavailable`，不是 Product Failure。
- 不可取代 UI E2E 與後端測試。

## 15.3 每次 Chrome Major 升級必測

- [ ] `document.modelContext` 是否存在。
- [ ] `registerTool()` 是否成功。
- [ ] Duplicate Name 的錯誤行為。
- [ ] `AbortSignal` 是否解除 Tool。
- [ ] `toolchange` 是否觸發。
- [ ] Declarative Tool 是否被探索。
- [ ] Form 合成 Schema 是否改變。
- [ ] `agentInvoked` 與 `respondWith()` 是否正常。
- [ ] `toolactivated`、`toolcancel` 是否正常。
- [ ] `:tool-form-active` 與 `:tool-submit-active` 是否仍有效。
- [ ] `getTools()`、`executeTool()` 是否仍可用於 Debug。
- [ ] Origin Trial 與正式 Domain 是否有效。
- [ ] 不支援環境的人類流程是否完整。

---

# 16. Known Limitations

截至 Baseline 日期，必須公開說明：

1. WebMCP 仍處於實驗與標準孵化階段。
2. Declarative API 在 CG Draft 中仍未完成完整規範文字。
3. Chrome 行為可能比 Draft 多出 Debug／Agent Client 方法。
4. Browser Agent 的觀察、推理與 UI 呈現屬實作決定，不保證所有 Agent 相同。
5. Tool Description、Schema 與 Annotation 不能完全防止 Prompt Injection。
6. WebMCP 需要目前 Browser Context，官方目前不支援純 Headless Tool Invocation。
7. Tool 必須先在頁面中註冊，Agent 不能在未造訪網站時全域探索。
8. Origin Trial 與版本時程可能改變。
9. Safari / WebKit 目前持反對立場，Mozilla 尚未定案。
10. WebMCP 不取代 REST API、MCP Server、Authentication 或 Authorization。
11. Declarative Form 的最終合成 Schema 需要對目標 Chrome 實測。
12. `getTools()`、`executeTool()` 不應被視為本專案跨瀏覽器產品契約。

---

# 17. Baseline 更新政策

## 17.1 版本規則

```text
Major：核心 API、Tool Model 或安全架構不相容變更
Minor：新增可選能力、Chrome 實作變化但可相容遷移
Patch：文件澄清、版本號、來源或不影響程式碼的修正
```

## 17.2 觸發重新查核的事件

- Chrome Stable Major 更新。
- Chrome WebMCP 文件更新。
- WebMCP Repository 合併 API 變更。
- Declarative Explainer 併入正式 Draft。
- Origin Trial 延長、縮短或 Shipping Milestone 改變。
- `document.modelContext`、Attribute、Event 或 Annotation 改名。
- Mozilla 或 WebKit Position 改變。
- 發現安全議題會影響 Tool Catalog。

## 17.3 預定查核

| 時間 | 動作 |
|---|---|
| 2026-06-24 | 建立 Baseline 1.0.0 |
| 2026-06-30 | 第一次週檢查 |
| 2026-07 每週 | 檢查 Draft、Chrome Docs、Status、Issues／PRs |
| 2026-07-27～31 | 開賽前最後 Compatibility Pass；必要時發布 1.1.0 |
| 比賽期間每 3～5 天 | 快速查核是否有 Breaking Change |
| 每篇發文前 | 記錄實際 Chrome Version 與測試結果 |

## 17.4 不靜默改寫歷史

若 API 改變：

1. 保留舊 Baseline 與 Git Tag。
2. 新增 Migration Note。
3. 文章頂部加入版本警示。
4. 新程式碼升級 Baseline Version。
5. 不把舊文章修改成看似當時就使用新 API。

---

# 18. 文章版本標頭模板

每篇含 WebMCP 程式碼的文章建議加入：

```markdown
> 技術基準
>
> - 撰寫／查核日期：2026-08-XX
> - AgentReady Events Baseline：1.0.0
> - Chrome：149.x / 150.x（填入實測完整版本）
> - WebMCP 狀態：Experimental / Origin Trial
> - API Entry：`document.modelContext`
> - 本文範例不使用：`navigator.modelContext`
```

若文章內容使用 Chrome-only Debug API：

```markdown
> 本文使用的 `getTools()`／`executeTool()` 是 Chrome 現行測試與除錯介面，
> 不代表 WebMCP CG Draft 已固定相同 API，也不應作為網站核心功能的必要依賴。
```

---

# 19. 建議保存的 Machine-readable Snapshot

Repository 可額外建立：

```json
{
  "baselineVersion": "1.0.0",
  "snapshotDate": "2026-06-24",
  "status": "experimental",
  "apiEntry": "document.modelContext",
  "legacyApiForbidden": "navigator.modelContext",
  "minimumChromeMajor": 149,
  "primaryStableVersion": "149.0.7827.196/197",
  "compatibilityBetaVersion": "150.0.7871.24",
  "localFlag": "enable-webmcp-testing",
  "originTrial": {
    "startMajor": 149,
    "plannedEndMajor": 156,
    "plannedShippingMajor": 157
  },
  "crossOriginTools": false,
  "headless": false,
  "progressiveEnhancement": true
}
```

建議路徑：

```text
docs/baselines/webmcp-1.0.0.json
```

這是專案 Snapshot，不是 Chrome 或 W3C 提供的官方 Manifest。

---

# 20. Baseline Acceptance Checklist

## 標準與文件

- [x] WebMCP 明確標示為 CG Draft／Experimental。
- [x] `document.modelContext` 定為唯一正式入口。
- [x] `navigator.modelContext` 禁止用於主線程式碼。
- [x] CG Draft 與 Chrome-only API 已分開記錄。
- [x] Declarative API 未完成規格化的風險已記錄。

## Runtime

- [x] Chrome 149+ 為主要目標。
- [x] Local Testing Flag 已固定。
- [x] Public Origin Trial 路徑已固定。
- [x] Secure Context、Origin Isolation 與 Permissions Policy 已納入。
- [x] Headless 明確排除。

## Architecture

- [x] WebMCP Adapter 邊界已固定。
- [x] Debug API 不會成為 Product Dependency。
- [x] Cross-origin Tools 已禁用。
- [x] Progressive Enhancement 已固定。
- [x] Human Confirmation 由網站自身 UI 處理。

## Tool Contract

- [x] 7 個 Tool 已在 `04-tool-catalog.md` 定案。
- [x] Annotation 對照已固定。
- [x] Tool Output Envelope 已固定。
- [x] Runtime／Server Validation 原則已固定。
- [x] 測試與 Evals 邊界已固定。

---

# 21. 第一手來源 Snapshot

| ID | 來源 | 本 Baseline 使用內容 | 2026-06-24 狀態 |
|---|---|---|---|
| BASE-SRC-001 | [WebMCP CG Draft](https://webmachinelearning.github.io/webmcp/) | `Document.modelContext`、`registerTool`、Tool Dictionary、Annotation、AbortSignal、Permissions Policy | Active CG Draft |
| BASE-SRC-002 | [WebMCP Official Repository](https://github.com/webmachinelearning/webmcp) | Explainer、生命週期、Declarative 背景與跨來源討論 | Active development |
| BASE-SRC-003 | [Chrome WebMCP Overview](https://developer.chrome.com/docs/ai/webmcp) | Origin Trial、Local Flag、限制、Origin Isolation、Permissions Policy | Updated 2026-06-09 |
| BASE-SRC-004 | [Chrome Imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api) | `document.modelContext`、Deprecated legacy API、`getTools`、`executeTool`、AbortSignal | Updated 2026-06-18 |
| BASE-SRC-005 | [Chrome Declarative API](https://developer.chrome.com/docs/ai/webmcp/declarative-api) | Form Attributes、SubmitEvent、Events、Pseudo-classes | Published 2026-05-18 |
| BASE-SRC-006 | [Chrome WebMCP Security](https://developer.chrome.com/docs/ai/webmcp/secure-tools) | Prompt Injection、Annotation、Cross-origin exposure | Published 2026-06-09 |
| BASE-SRC-007 | [Chrome WebMCP Best Practices](https://developer.chrome.com/docs/ai/webmcp/best-practices) | Tool strategy、生命週期、Schema、可靠性與 Evals | Published 2026-05-18 |
| BASE-SRC-008 | [Chrome Status: WebMCP](https://chromestatus.com/feature/5117755740913664) | Trial 與規劃 Milestone | Active |
| BASE-SRC-009 | [Chrome Releases — June 2026](https://chromereleases.googleblog.com/2026/06/) | Stable、Beta、Dev 版本 Snapshot | Checked 2026-06-24 |
| BASE-SRC-010 | [Mozilla Standards Position #1412](https://github.com/mozilla/standards-positions/issues/1412) | Firefox／Mozilla 評估狀態 | Proposed / Open |
| BASE-SRC-011 | [WebKit Standards Position #670](https://github.com/WebKit/standards-positions/issues/670) | WebKit 立場與疑慮 | Oppose / Closed |

---

# 22. 變更紀錄

| 版本 | 日期 | 變更 |
|---|---|---|
| 1.0.0 | 2026-06-24 | 固定 WebMCP 狀態、Chrome Runtime、API Surface、Declarative／Imperative 邊界、安全、測試與升級政策 |
