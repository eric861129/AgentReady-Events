# AgentReady Events v3

The Day 22 feature-frozen reference product teaches WebMCP through five deliberately small Tools and three verifiable human–Agent Journeys. See [FEATURE_FREEZE.md](FEATURE_FREEZE.md) for the immutable boundary; Day 23–29 focus on proving, securing, packaging, and evaluating this product rather than adding features.

這是「網站不只給人用：30 天打造 Agent-ready 的 WebMCP 網站」的可執行程式庫。

## 五部分

1. Day 1–6：理解 WebMCP 在 AI Agent 時代的價值。
2. Day 7–12：以隔離 Labs 學習 Semantic HTML、Declarative 與 Imperative WebMCP。
3. Day 13–22：由 Codex 建立 AgentReady Events，完成五個 Tool 與三條 Journey。
4. Day 23–29：執行 deterministic tests、安全實驗、部署候選、Codex Evals 與 release。
5. Day 30：作者回顧，不建立程式 branch。

## 文章與程式對照

30 天文章使用的程式、測試、圖片與重現指令，集中維護在文章專案的[文章與範例專案對照表](https://github.com/eric861129/WEBMCP-iThome-2026-Draft/blob/main/docs/article-project-mapping.md)。本機若將兩個 repository 放在同一層，可在文章專案設定 `AGENTREADY_EVENTS_ROOT` 後執行 `npm run validate:mapping`，檢查對照表是否引用不存在的檔案或指令。

## 邊界

- `labs/` 只服務 Day 1–12 教學；正式產品在 Day 13 才進入 `src/`。
- 沒有 WebMCP 時，人類操作仍需完整可用。
- Fake ModelContext 與直接呼叫 Tool 只能算 deterministic E2，不等於真實 Agent discovery／invocation。
- v2 與 legacy repositories 均保留，不在本 repo 改寫。

## 開始

```bash
npm install
npm run typecheck
npm test
npm run build
npm run verify
npm run evals:validate
npm run smoke:deployment
```

Runtime proof currently tops out at E3: deterministic and real-browser integration are green, while real Codex WebMCP discovery requires an author-authorized HTTPS deployment and compatible Codex/Chrome surface. See `docs/runtime-evidence.md`; no result is promoted by simulation.
