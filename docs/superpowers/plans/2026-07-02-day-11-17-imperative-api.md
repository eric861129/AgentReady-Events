# Day 11-17 Imperative API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the third stage of AgentReady Events: Imperative WebMCP tools, tool lifecycle management, deterministic debug tooling, shared use cases, and the first multi-tool journey.

**Architecture:** Keep WebMCP as progressive enhancement. Human UI, API routes, and WebMCP tools must call the same application-facing functions; tools must not bypass validation or directly read SQLite. Imperative API access is centralized behind an adapter and registry so `document.modelContext` does not spread across page code.

**Tech Stack:** Vite, TypeScript, semantic HTML, native CSS, Express, SQLite seed data, Vitest, Playwright, WebMCP `document.modelContext.registerTool()`.

---

## Scope

This plan defines the Day 11-17 program nodes. It is not an instruction to start development now.

The main proof across the week:

```text
search_events -> get_event_details -> save_event
```

The WebMCP focus is not UI polish. The focus is proving that Imperative tools can be registered, scoped, executed, debugged, and composed without creating Agent-only shortcuts.

## Current Baseline

Already complete:

- Day 6: runtime diagnostics baseline.
- Day 7: human-usable search form.
- Day 8: `search_events` identity.
- Day 9: field descriptions and schema snapshot.
- Day 10: local Declarative submit lifecycle handling.

Important boundary:

- Day 11-17 may use local debug and Playwright evidence.
- Do not claim real Chrome Agent invocation until E3/E4 evidence is captured: Chrome version, runtime support, discovery evidence, invocation input/output, and commit/tag.

## Planned Files

Likely files to create:

- `apps/web/src/webmcpAdapter.ts`: wrapper around `document.modelContext`.
- `apps/web/src/webmcpRegistry.ts`: page-scoped tool registration and disposal.
- `apps/web/src/tools/getEventDetailsTool.ts`: `get_event_details` definition.
- `apps/web/src/tools/saveEventTool.ts`: `save_event` definition.
- `apps/web/src/services/eventService.ts`: frontend service for event search/detail calls.
- `apps/web/src/services/savedEventService.ts`: frontend service for saved-event operations.
- `packages/validation/src/eventDetails.ts`: `event_id` validation.
- `packages/validation/src/saveEvent.ts`: save-event input validation.
- `docs/articles/day-11.md` through `docs/articles/day-17.md`: article materials and drafts.
- `docs/articles/assets/day-11` through `docs/articles/assets/day-17`: screenshots and GIFs.

Likely files to modify:

- `apps/web/src/main.ts`: route state, detail panel, debug panel, tool registration hooks.
- `apps/web/src/api.ts`: `fetchEventDetails`, save-event API client functions.
- `apps/web/src/webmcp.ts`: shared constants/types or migration to adapter modules.
- `apps/web/src/styles.css`: detail panel, debug panel, lifecycle badges.
- `apps/api/src/app.ts`: `GET /api/events/:eventId`, saved-event endpoints for local demo.
- `apps/api/src/search.ts`: share event lookup helpers.
- `packages/contracts/src/index.ts`: event detail DTO, saved-event DTO, `ToolResult` refinements.
- `packages/test-fixtures/src/events.ts`: ensure stable IDs for Day 11-17 prompts.
- `docs/04-tool-catalog.md`: only if the implementation reveals a catalog correction.
- `docs/06-webmcp-reality-checklist.md`: extend reality checklist for Imperative runtime evidence if needed.

## Day 11: `get_event_details` Imperative Tool

**WebMCP proof:** A non-form feature can be exposed through `document.modelContext.registerTool()` while preserving normal human UI behavior.

**Expected tag:** `day-11-event-details-tool`

**Files:**

- Create: `apps/web/src/webmcpAdapter.ts`
- Create: `apps/web/src/tools/getEventDetailsTool.ts`
- Create: `packages/validation/src/eventDetails.ts`
- Modify: `apps/web/src/main.ts`
- Modify: `apps/web/src/api.ts`
- Modify: `apps/api/src/app.ts`
- Modify: `packages/contracts/src/index.ts`
- Modify: `docs/articles/day-11.md`

- [ ] Define the `get_event_details` contract from `docs/04-tool-catalog.md`.

Proof details:

- Tool name: `get_event_details`.
- Description: `取得一個公開活動的日期、地點、費用、剩餘名額、報名期限與摘要。已從搜尋結果辨識到活動 ID，或使用者詢問特定活動時使用。`
- Input: required `event_id`, string, max length 64.
- Annotations: `readOnlyHint: true`, `untrustedContentHint: true`.

- [ ] Add API support for event details.

Acceptance:

- `GET /api/events/:eventId` returns one public event detail DTO.
- Invalid ID returns validation error.
- Unknown ID returns not found without stack trace.
- Tool code calls API/client service, not database or fixture data directly.

- [ ] Add a visible event detail panel.

Acceptance:

- Human users can open event details without WebMCP.
- Tool execution updates the same detail panel.
- The current selected event ID is visible in debug state or URL state.

- [ ] Add the first WebMCP Adapter wrapper.

Acceptance:

- Feature detection uses `document.modelContext`.
- Unsupported runtime returns a clean unsupported status.
- Adapter owns the call to `registerTool()`.
- Page code does not call `document.modelContext.registerTool()` directly.

- [ ] Capture Day 11 materials.

Screenshots/GIFs:

- Detail panel updated.
- Tool registration/debug state.
- Not-found error.
- Event detail flow.

- [ ] Verification commands.

Run:

```bash
npm.cmd run typecheck
npm.cmd run test
```

Expected:

- Typecheck passes.
- API validation and event detail tests pass.

## Day 12: Schema Quality for Imperative Tools

**WebMCP proof:** Clear names, descriptions, input schema, enums, and required fields reduce tool-selection and parameter mistakes.

**Expected tag:** `day-12-imperative-schema-quality`

**Files:**

- Create: `apps/web/src/tools/schemaHelpers.ts`
- Create: `docs/articles/day-12.md`
- Modify: `apps/web/src/tools/getEventDetailsTool.ts`
- Modify: `apps/web/src/tools/saveEventTool.ts` if the placeholder is introduced for comparison only.
- Modify: `packages/validation/src/eventDetails.ts`
- Modify: `docs/articles/assets/day-12`

- [ ] Build bad/good schema examples for article and debug view.

Proof details:

- Bad example: vague name like `details`.
- Good example: `get_event_details`.
- Bad example: free-form event name.
- Good example: required `event_id` with max length and description.

- [ ] Extract schema helpers.

Acceptance:

- Required string helper creates consistent JSON Schema fragments.
- Enum helper creates stable enum + labels.
- Tool schemas match Tool Catalog wording.

- [ ] Add schema quality tests.

Acceptance:

- Test rejects missing `event_id`.
- Test rejects overly long `event_id`.
- Test documents that activity name or URL is not accepted as ID.

- [ ] Capture Day 12 materials.

Screenshots:

- Bad/good schema comparison.
- Debug view showing improved input schema.
- Validation error examples.

## Day 13: Tool Result Contract and Recoverable Errors

**WebMCP proof:** Tool outputs need a stable envelope that helps Agent and UI recover without exposing internals.

**Expected tag:** `day-13-tool-result-contract`

**Files:**

- Create: `packages/contracts/src/toolResult.ts` or extend `packages/contracts/src/index.ts`.
- Create: `apps/web/src/tools/toolErrors.ts`
- Create: `docs/articles/day-13.md`
- Modify: `apps/web/src/tools/getEventDetailsTool.ts`
- Modify: `apps/api/src/app.ts`
- Modify: `packages/contracts/src/index.ts`

- [ ] Formalize `ToolResult<T>`.

Expected fields:

- `ok`
- `code`
- `message`
- `data`
- `fieldErrors`
- `uiUpdated`
- `stateVersion`
- `retryable`

- [ ] Map API errors to Tool errors.

Acceptance:

- Invalid ID: `VALIDATION_ERROR / INVALID_ID`.
- Missing event: `NOT_FOUND / EVENT_NOT_FOUND`.
- Hidden event: public-safe forbidden or not-found equivalent.
- Temporary failure: `TEMPORARY_FAILURE`, `retryable: true`.

- [ ] Add raw result debug panel.

Acceptance:

- Debug panel shows compact result.
- No stack trace, SQL, cookie, token, or internal exception appears.

- [ ] Capture Day 13 materials.

Screenshots:

- Success result.
- Invalid ID result.
- Not found result.
- Debug panel raw result.

## Day 14: Page-Scoped Tool Lifecycle

**WebMCP proof:** Imperative tools must appear and disappear with page state, route state, login state, and resource state.

**Expected tag:** `day-14-tool-lifecycle-registry`

**Files:**

- Create: `apps/web/src/webmcpRegistry.ts`
- Create: `docs/articles/day-14.md`
- Modify: `apps/web/src/main.ts`
- Modify: `apps/web/src/webmcpAdapter.ts`
- Modify: `apps/web/src/tools/getEventDetailsTool.ts`
- Modify: `apps/web/src/tools/saveEventTool.ts`

- [ ] Implement `WebMcpRegistry`.

Acceptance:

- Register by unique tool name.
- Dispose on route/page state change.
- Prevent duplicate registration.
- Convert `AbortController` into `dispose()`.

- [ ] Scope `get_event_details`.

Acceptance:

- Available on event list/detail contexts.
- Removed after leaving event-related context.
- Re-entering does not create duplicate registrations.

- [ ] Prepare `save_event` availability rules.

Acceptance:

- Available only when logged in, on a public event detail, and not already saved.
- Removed on logout, route leave, or successful save.

- [ ] Capture Day 14 materials.

Screenshots/GIFs:

- Tool lifecycle panel.
- Route change removes page-scoped tool.
- Duplicate registration prevention.

## Day 15: Deterministic Debug with `getTools()` and `executeTool()`

**WebMCP proof:** Tool correctness can be tested without relying on non-deterministic Agent choice.

**Expected tag:** `day-15-webmcp-debug-panel`

**Files:**

- Create: `apps/web/src/debug/webmcpDebugPanel.ts`
- Create: `docs/articles/day-15.md`
- Modify: `apps/web/src/webmcpAdapter.ts`
- Modify: `apps/web/src/webmcpRegistry.ts`
- Modify: `apps/web/src/main.ts`

- [ ] Add debug-only adapter methods.

Acceptance:

- `listToolsForDebug()` wraps `document.modelContext.getTools?.()`.
- `executeToolForDebug()` wraps `document.modelContext.executeTool?.()`.
- Missing debug API returns `UNSUPPORTED_DEBUG_API`.
- Human website still works when debug APIs are missing.

- [ ] Add Agent Debug Panel.

Acceptance:

- Lists currently registered tools.
- Shows name, description, schema, annotations, and origin when available.
- Allows manual JSON input for `get_event_details`.
- Shows execution time, result, error, and whether UI updated.

- [ ] Capture Day 15 materials.

Screenshots/GIFs:

- Tool list.
- Manual execution success.
- Manual execution validation error.
- Debug API unsupported state.

## Day 16: Shared Use Case for Human UI and `save_event`

**WebMCP proof:** Human UI and WebMCP Tool must share the same application path; Agent tools must not bypass validation or authorization.

**Expected tag:** `day-16-shared-save-event-use-case`

**Files:**

- Create: `apps/web/src/tools/saveEventTool.ts`
- Create: `apps/web/src/services/eventService.ts`
- Create: `apps/web/src/services/savedEventService.ts`
- Create: `packages/validation/src/saveEvent.ts`
- Create: `docs/articles/day-16.md`
- Modify: `apps/web/src/main.ts`
- Modify: `apps/web/src/api.ts`
- Modify: `apps/api/src/app.ts`
- Modify: `packages/contracts/src/index.ts`

- [ ] Add local saved-event API behavior.

Acceptance:

- Save event requires simulated login state.
- Missing login returns authentication result.
- Unknown event returns not found.
- Re-saving an event is idempotent.

- [ ] Add shared frontend use case.

Acceptance:

- Human save button and `save_event` tool call the same service function.
- UI updates saved state after success.
- Undo UI appears after success.

- [ ] Add `save_event` Imperative Tool.

Proof details:

- Risk: R1 personal state write.
- Annotation: `readOnlyHint: false`.
- It does not use blocking confirmation in this stage.
- It provides visible result and undo UI.

- [ ] Capture Day 16 materials.

Screenshots/GIFs:

- Human save flow.
- Tool save flow.
- Not logged in result.
- Already saved result.

## Day 17: First Multi-Tool Journey

**WebMCP proof:** Separate tools can compose into a natural-language journey while preserving UI state, tool scope, and clear handoff between outputs.

**Expected tag:** `day-17-search-detail-save-journey`

**Files:**

- Create: `docs/articles/day-17.md`
- Create: `docs/articles/assets/day-17`
- Modify: `apps/web/src/main.ts`
- Modify: `apps/web/src/debug/webmcpDebugPanel.ts`
- Modify: `apps/web/src/webmcpRegistry.ts`
- Modify: `apps/web/src/tools/getEventDetailsTool.ts`
- Modify: `apps/web/src/tools/saveEventTool.ts`

- [ ] Define journey prompts.

Prompts:

- `搜尋台北免費前端活動並收藏第一場。`
- `搜尋週末初學者活動，查看第二場詳情。`
- `未登入時幫我收藏第一場活動。`

- [ ] Capture tool handoff state.

Acceptance:

- `search_events` output includes IDs needed by `get_event_details`.
- `get_event_details` output includes `eventId` and current detail state.
- `save_event` consumes a clear `event_id`.
- Agent does not need to infer screen coordinates.

- [ ] Validate page and login scoped availability.

Acceptance:

- Detail tool is available in event contexts.
- Save tool appears only when logged in and eligible.
- Save tool disappears or returns an actionable result after state changes.

- [ ] Capture Day 17 materials.

Screenshots/GIFs:

- Search -> detail -> save flow.
- Tool debug panel during journey.
- Login-required branch.
- Journey evidence table.

## Stage Verification

Run after each day:

```bash
npm.cmd run typecheck
npm.cmd run test
```

Run before tagging:

```bash
npm.cmd run build
npm.cmd run typecheck
npm.cmd run test
```

Run when UI or lifecycle changes:

```bash
npm.cmd run test:e2e
```

Reality check before every article:

- Do not describe local Playwright or debug-panel evidence as real Chrome Agent invocation.
- Do not treat `readOnlyHint` or UI lifecycle events as authorization.
- Do not allow Tool code to bypass API/use-case validation.
- Record Chrome version and runtime evidence before claiming E3/E4 support.

## Commit and Tag Plan

- Day 11 commit: `feat(webmcp): register event details tool`
- Day 11 tag: `day-11-event-details-tool`
- Day 12 commit: `feat(webmcp): document imperative schema quality`
- Day 12 tag: `day-12-imperative-schema-quality`
- Day 13 commit: `feat(webmcp): standardize tool result contract`
- Day 13 tag: `day-13-tool-result-contract`
- Day 14 commit: `feat(webmcp): manage page scoped tool lifecycle`
- Day 14 tag: `day-14-tool-lifecycle-registry`
- Day 15 commit: `feat(webmcp): add deterministic debug panel`
- Day 15 tag: `day-15-webmcp-debug-panel`
- Day 16 commit: `feat(webmcp): share save event use case`
- Day 16 tag: `day-16-shared-save-event-use-case`
- Day 17 commit: `feat(webmcp): compose first multi tool journey`
- Day 17 tag: `day-17-search-detail-save-journey`

## Self-Review

- Spec coverage: Day 11-17 outline items are covered: Imperative registration, schema quality, result contract, lifecycle, debug APIs, shared use case, and multi-tool journey.
- Placeholder scan: No task uses open-ended placeholder wording as an implementation requirement; screenshots are named as planned article materials.
- Reality boundary: The plan requires E3/E4 evidence before claiming real runtime invocation.
- Type consistency: Tool names use Tool Catalog names: `get_event_details`, `save_event`, `search_events`.
