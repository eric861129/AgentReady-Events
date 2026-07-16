# Evidence

Evidence levels are claims, not progress badges. Every record separates four independent observations:

- `runtime_integration`: the built site and browser flow ran in the named environment.
- `webmcp_capability`: `document.modelContext`, WebMCP DevTools or equivalent discovery was actually observed.
- `agent_invocation`: a supported Agent discovered, selected and invoked a Tool.
- `test_harness`: unit, direct execution, synthetic submit, record replay or browser automation used to produce deterministic engineering evidence.

E2 is harness evidence and never proves real Agent invocation. E3 requires successful runtime integration but may still record WebMCP capability and Agent invocation as `blocked`. E4 requires observed discovery and invocation. E5 additionally requires a clean Agent task/environment replay.

Each JSON record follows `evidence/evidence.schema.json` and includes capture time, commit, environment, browser version, command, source type, result and limitations. `npm run evidence:collect -- --day 29` validates records, rejects sensitive keys, hashes source bytes and builds an index without inventing missing evidence.

## Article screenshot captures

Run the dedicated Playwright pipeline to capture raw PNG files and adjacent assertion JSON:

```powershell
npm run evidence:articles
```

The default output is `evidence/article-screenshots/`. To write the artifacts into the article repository so its visual builder can preserve local provenance, set `ARTICLE_REPO_ROOT` first:

```powershell
$env:ARTICLE_REPO_ROOT = "D:\path\to\WEBMCP-iThome-2026-Draft"
npm run evidence:articles -- --grep "Day 08"
```

Each capture records Day, route, fixture, selector, action, assertion, expected failure, raw output, final asset, evidence axis, browser version, commit and limitations. A passing Playwright assertion remains E2／`test_harness`; it must not be relabeled as real Agent discovery or invocation.
