# Evidence

Release-to-evidence coordinates are indexed in
[`version-ledger.json`](version-ledger.json) and
[`docs/version-evidence-ledger.md`](../docs/version-evidence-ledger.md).
Historical Inspector traces live under `agent-invocation/`; they must not be
reused to upgrade a different commit or Azure revision.

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

Day 25–27 會讀取公開站座標。Day 25 需要 URL 與部署 commit 同時存在，避免把 mutable URL 誤配到錯誤原始碼：

```powershell
$env:ARTICLE_REPO_ROOT = "D:\path\to\WEBMCP-iThome-2026-Draft"
$env:PUBLIC_SITE_URL = "https://example.azurecontainerapps.io"
$env:PUBLIC_DEPLOYMENT_COMMIT = "完整 40 字元 commit SHA"
npm run evidence:articles -- --grep "Day (25|26|27)"
```

Each capture records Day, route, fixture, selector, action, assertion, expected failure, raw output, final asset, evidence axis, browser version, commit and limitations. A passing Playwright assertion remains E2／`test_harness`; it must not be relabeled as real Agent discovery or invocation.

## Deployment evidence

CI 透過 `npm run evidence:deployment` 寫入 commit、immutable GHCR digest、Azure FQDN、revision、region 與 workflow run URL。`scripts/write-deployment-evidence.ts` 會拒絕 mutable tag、非 GHCR image 與敏感 key。

目前保留的 GitHub run 29179363328 對應 commit `2a2c027`。Artifact 可以證明該 commit 的 container smoke 與 Azure deployment，不能代表目前 local `main` 已部署。

## 不可寫入 Evidence 的資料

- Azure client secret、access token、Origin Trial token
- Cookie、Authorization header、Session ID
- 使用者真實 email 或報名個資
- 只有截圖、沒有 command／commit／limitations 的成功宣告

若外部環境無法使用，請保存 `blocked` 或 `not_tested`。Collector 的工作是驗證現有紀錄，不是補出 E4／E5。
