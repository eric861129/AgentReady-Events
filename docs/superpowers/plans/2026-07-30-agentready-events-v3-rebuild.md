# AgentReady Events V3 Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild AgentReady Events with the V2 event-explorer product experience, preserve the current five-Tool security architecture, and publish truthful source milestones only for article days with meaningful code differences.

**Architecture:** Keep the current Vite/TypeScript client, Express server, shared actions, WebMCP adapter, five-Tool catalog, three Journeys, and server authority. Replace only the presentation shell and page rendering needed for the polished event-explorer experience. Reader branches and immutable tags point only to verified commits with observable code or behavior differences; conceptual and evidence-only days link to the relevant source, tests, or records instead of duplicating a source state.

**Tech Stack:** TypeScript, Vite, Express, Vitest, Playwright, WebMCP Declarative/Imperative APIs, Git branches and tags.

## Execution Override

On 2026-07-30, the author explicitly requested direct development on the local `main`
branch. The temporary `feat/v3-rebuild` worktree was fast-forwarded into local `main` and
removed. All remaining tasks run in `D:\MySelf\WebMCP\AgentReady-Events`; remote push and
deployment still require a separate explicit approval.

## Global Constraints

- The approved article contract is `D:\MySelf\WebMCP\WEBMCP-iThome-2026-Draft-V3\BookProposal.md` plus `ArticleBriefs.md`.
- Keep exactly these Tool names: `search_events`, `get_event_details`, `save_event`, `prepare_event_registration`, `prepare_registration_cancellation`.
- Registration and cancellation finalization remain human UI actions.
- `evt-webmcp-intro` is the primary event fixture.
- Do not add OAuth, a database, payment, an admin console, email delivery, or a sixth Tool.
- Only `src/client/webmcp/adapter.ts` may read `document.modelContext`.
- Use Traditional Chinese for UI, test data, docs, and comments.
- Use TDD for behavior changes.
- Never claim E4 from Fake ModelContext, direct execution, synthetic submission, Playwright, or Inspector manual Execute Tool.
- Do not push remote branches or tags until the author approves the reviewed local ref set.

---

### Task 1: Secure and Record the Clean Baseline

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `docs/rebuild-baseline.md`

**Interfaces:**
- Consumes: current `main` at `85c1abb`, local worktree bootstrap commit `5ca1468`.
- Produces: audit-clean dependency lock and an immutable baseline record for later comparison.

- [ ] **Step 1: Record the existing baseline**

Run:

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm audit --json
```

Expected: lint/typecheck/build pass; 47 test files and 138 tests pass; audit initially reports four high-severity development dependency findings.

- [ ] **Step 2: Apply only non-breaking audit updates**

Run:

```powershell
npm audit fix
```

Expected lock updates: `concurrently` 10.0.4, `shell-quote` 1.9.0, `postcss` 8.5.25, `brace-expansion` 5.0.8, and compatible `nanoid`.

- [ ] **Step 3: Re-run baseline gates**

Run the five commands from Step 1. Expected: zero known audit vulnerabilities and no regression.

- [ ] **Step 4: Commit**

```powershell
git add package.json package-lock.json docs/rebuild-baseline.md
git diff --cached --check
git commit -m "chore(deps): secure V3 rebuild baseline"
```

### Task 2: Define the Reader Code Milestone Contract

**Files:**
- Create: `docs/reader-code-milestones.md`
- Modify: `README.md`

**Interfaces:**
- Each milestone records an article day, branch, annotated tag, exact commit, and observable code difference.
- Days without a standalone source delta link to the closest relevant milestone, source file, test, or evidence record.

- [x] **Step 1: Inventory verified commits with meaningful reader-visible differences**
- [x] **Step 2: Reject duplicate refs for conceptual, operational, and evidence-only days**
- [x] **Step 3: Create the approved local branches and annotated tags**
- [x] **Step 4: Verify every branch and peeled tag commit against its intended SHA**
- [x] **Step 5: Commit the reader milestone documentation**

### Task 3: Restore the V2 Event Explorer Visual Foundation

**Files:**
- Create: `src/client/styles.css`
- Create: `tests/browser/product-shell.spec.ts`
- Modify: `index.html`
- Modify: `src/client/app.ts`
- Modify: `tests/foundation.test.ts`

**Interfaces:**
- Produces: a persistent shell with `.site-header`, `.site-nav`, `.page-shell`, skip link, branded navigation, and a route-aware current link.
- Page renderers continue receiving the existing `#app` element.

- [ ] **Step 1: Write the failing browser assertions**

Assert a skip link, `活動探索站` brand, navigation links, one `main` landmark, and a visible route heading on `/events`.

- [ ] **Step 2: Verify RED**

```powershell
npx playwright test tests/browser/product-shell.spec.ts
```

- [ ] **Step 3: Implement the shell and visual tokens**

Use a refined editorial/event-poster direction based on V2: ink navy, warm paper, electric blue accent, restrained amber highlight, visible focus, high contrast, responsive navigation, and no remote font dependency.

- [ ] **Step 4: Verify GREEN**

```powershell
npx playwright test tests/browser/product-shell.spec.ts
npm run lint
npm run typecheck
```

- [ ] **Step 5: Commit**

```powershell
git add index.html src/client/app.ts src/client/styles.css tests/browser/product-shell.spec.ts tests/foundation.test.ts
git diff --cached --check
git commit -m "feat(ui): restore event explorer visual foundation"
```

### Task 4: Rebuild the Search Results Experience

**Files:**
- Modify: `src/client/pages/events-page.ts`
- Modify: `src/client/styles.css`
- Modify: `tests/browser/human-journey.spec.ts`
- Modify: `tests/browser/day-08-declarative.spec.ts`

**Interfaces:**
- Keeps the existing Declarative `search_events` metadata and `EventActions.search`.
- Adds visual result cards without changing the Tool input or result contract.

- [ ] Write failing assertions for hero copy, grouped filters, status summary, result cards, metadata, and `查看詳情`.
- [ ] Implement semantic fieldsets, responsive card grid, empty/error states, and current search summary.
- [ ] Run focused browser tests, lint, typecheck, and unit tests.
- [ ] Commit as `feat(events): rebuild search and result experience`.

### Task 5: Rebuild Event Detail and Saved State

**Files:**
- Modify: `src/client/pages/event-detail-page.ts`
- Modify: `src/client/styles.css`
- Modify: `tests/browser/human-journey.spec.ts`
- Modify: `tests/browser/journey.spec.ts`
- Modify: `tests/webmcp/get-event-details.test.ts`
- Modify: `tests/webmcp/save-event.test.ts`

**Interfaces:**
- Keeps route-grounded `get_event_details`, `save_event`, opaque IDs, state version, and shared actions.
- Adds product metadata, capacity, time, venue, registration link, saved-state feedback, and human undo.

- [ ] Write failing detail-page and saved-state assertions.
- [ ] Implement the visual detail composition and accessible status behavior.
- [ ] Verify Tool schemas/results are unchanged.
- [ ] Commit as `feat(events): refine detail and saved state`.

### Task 6: Rebuild Registration and Cancellation Confirmation

**Files:**
- Modify: `src/client/pages/registration-page.ts`
- Modify: `src/client/pages/registrations-page.ts`
- Modify: `src/client/ui/confirmation-dialog.ts`
- Modify: `src/client/styles.css`
- Modify: `tests/browser/cancellation.spec.ts`
- Modify: `tests/evidence/article-screenshots.spec.ts`

**Interfaces:**
- Preserves prepare-only Tool behavior and zero mutation before human confirmation.
- Final POST and cancel remain human interactions.

- [ ] Write failing assertions for visible consequence copy, confirmation summary, initial safe focus, loading state, and success state.
- [ ] Implement the product UI without adding finalization Tools.
- [ ] Verify registration and cancellation network boundaries.
- [ ] Commit as `feat(registration): clarify human confirmation boundaries`.

### Task 7: Refine the Human/Agent Activity Timeline

**Files:**
- Modify: `src/client/ui/activity-timeline.ts`
- Modify: `src/client/styles.css`
- Modify: `tests/unit/activity.test.ts`
- Modify: `tests/browser/journey.spec.ts`

**Interfaces:**
- Keeps sanitized metadata and the 20-entry session limit.
- Adds localized source/result labels and a clear empty state without exposing prompt, email, cookie, CSRF token, API key, or access token.

- [ ] Write failing sanitization and visible timeline tests.
- [ ] Implement localized timeline cards.
- [ ] Run unit/browser/security tests.
- [ ] Commit as `feat(activity): make human and Agent actions legible`.

### Task 8: Verify Responsive, Accessibility, and Production Behavior

**Files:**
- Create: `tests/browser/responsive-accessibility.spec.ts`
- Modify: `src/client/styles.css`
- Modify: `playwright.config.ts` only if deterministic project settings are required.

- [ ] Test desktop and mobile navigation, focus order, dialog keyboard behavior, reduced motion, overflow, and empty/error states.
- [ ] Fix only observed defects.
- [ ] Run lint, typecheck, unit, API, security, browser, build, and audit gates.
- [ ] Commit as `test(ui): verify responsive and accessible journeys`.

### Task 9: Publish Day 01–12 Reader Milestones

- [x] Map Day 02, 05, 11, and 12 to real verified source differences.
- [x] Document why conceptual Days 01, 03–04, and 06–10 have no duplicate refs.
- [x] Preserve historical Lab paths and commit subjects while mapping them to the new article days.
- [x] Create and verify the four local branches and annotated tags.

### Task 10: Publish Day 13–22 Product Milestones

- [x] Map Days 14, 15, 19, 20, and 21 to focused, verified product commits.
- [x] Document why Days 13, 16–18, and 22 do not receive artificial duplicate refs.
- [x] Create and verify the five local branches and annotated tags.
- [x] Preserve the five Tool names and human-confirmation boundaries.

### Task 11: Publish Day 23–30 Trust and Evidence Milestones

- [x] Create Day 25 as the verified rebuilt release-candidate source milestone.
- [x] Keep verification, security, deployment, Inspector, Gemini, E4 Eval, and release ledger as evidence links unless they introduce a real source delta.
- [x] Do not create a Day 30 code ref or a sixth Tool.
- [ ] Preserve historical E4 traces as historical evidence until the rebuilt deployment is rerun.

### Task 12: Final Review, Deployment, and Remote Publication Gate

**Files:**
- Modify: `README.md`
- Modify: `docs/reader-code-milestones.md`
- Modify: article mapping docs and evidence only after final verification.

- [ ] Run the full local verification suite and audit.
- [ ] Start the production build and inspect `/events`, detail, registration, and cancellation with Playwright CLI.
- [x] Review the 10 local branches/tags against the approved article briefs and actual commit differences.
- [ ] Review the complete local `main` diff and commit history; no feature-branch merge is
  required under the author's direct-main override.
- [ ] Ask for explicit approval before pushing `main`, Day branches, tags, or deploying.
- [ ] After approval, push the exact reviewed refs, deploy the saved commit, rerun Inspector E4, and update article links.
