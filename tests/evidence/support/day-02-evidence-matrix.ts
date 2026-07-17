export interface Day02EvidenceMatrixCase {
  number: string;
  title: string;
  mutation: string;
  locator: string;
  primaryOutcome: string;
  recoveryOutcome: string | null;
  detail: string;
  screenshotDataUrl: string;
  tone: "success" | "expected-failure";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderRecovery(outcome: string | null) {
  if (!outcome) return "";
  return `<p class="outcome recovery"><span>修正後</span>${escapeHtml(outcome)}</p>`;
}

function renderCase(item: Day02EvidenceMatrixCase) {
  const toneLabel = item.tone === "expected-failure" ? "預期失敗已重現" : "操作成功";
  return `
    <article class="case-card ${item.tone}">
      <header>
        <span class="case-number">${escapeHtml(item.number)}</span>
        <div>
          <h2>${escapeHtml(item.title)}</h2>
          <p class="tone-label">${toneLabel}</p>
        </div>
      </header>
      <figure>
        <img src="${escapeHtml(item.screenshotDataUrl)}" alt="${escapeHtml(item.title)}的 Playwright 實際執行畫面">
      </figure>
      <dl>
        <div><dt>介面變動</dt><dd>${escapeHtml(item.mutation)}</dd></div>
        <div><dt>實際 Locator</dt><dd><code>${escapeHtml(item.locator)}</code></dd></div>
      </dl>
      <p class="outcome primary"><span>執行結果</span>${escapeHtml(item.primaryOutcome)}</p>
      ${renderRecovery(item.recoveryOutcome)}
      <p class="detail">${escapeHtml(item.detail)}</p>
    </article>`;
}

export function buildDay02EvidenceMatrixHtml(cases: Day02EvidenceMatrixCase[]) {
  if (cases.length !== 4) throw new Error("Day 02 evidence matrix requires exactly four runtime cases");

  return `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Day 2 Playwright 四個修改前後實驗</title>
  <style>
    :root {
      font-family: Inter, "Noto Sans TC", system-ui, sans-serif;
      color: #172033;
      background: #edf1f7;
    }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 30px; }
    .matrix { width: 1360px; margin: 0 auto; }
    .matrix-title { display: flex; align-items: end; justify-content: space-between; margin-bottom: 20px; }
    .matrix-title h1 { margin: 0; font-size: 32px; letter-spacing: -.02em; }
    .matrix-title p { margin: 0; color: #566174; font-size: 16px; }
    .cases { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
    .case-card {
      min-width: 0;
      padding: 18px;
      border: 2px solid #b8d8ca;
      border-radius: 18px;
      background: #fff;
      box-shadow: 0 8px 24px rgb(23 32 51 / 8%);
    }
    .case-card.expected-failure { border-color: #e5a49a; }
    header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .case-number {
      display: grid; place-items: center; width: 48px; height: 48px;
      border-radius: 14px; color: #fff; background: #27775d; font: 800 20px/1 ui-monospace, monospace;
    }
    .expected-failure .case-number { background: #b44b3d; }
    h2 { margin: 0 0 2px; font-size: 22px; }
    .tone-label { margin: 0; color: #27775d; font-size: 14px; font-weight: 800; }
    .expected-failure .tone-label { color: #a33c31; }
    figure { margin: 0 0 12px; height: 158px; overflow: hidden; border: 1px solid #dce1e9; border-radius: 12px; background: #f7f9fc; }
    img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top; }
    dl { display: grid; gap: 7px; margin: 0 0 10px; }
    dl div { display: grid; grid-template-columns: 88px 1fr; gap: 8px; min-width: 0; }
    dt { color: #687386; font-size: 13px; font-weight: 800; }
    dd { min-width: 0; margin: 0; font-size: 14px; font-weight: 650; }
    code { display: block; overflow: hidden; color: #342a7a; font: 600 12px/1.4 ui-monospace, SFMono-Regular, Consolas, monospace; white-space: nowrap; text-overflow: ellipsis; }
    .outcome {
      display: grid; grid-template-columns: 74px 1fr; gap: 8px; margin: 7px 0 0; padding: 8px 10px;
      border-radius: 10px; background: #e9f7f0; color: #16583f; font-size: 14px; font-weight: 800;
    }
    .expected-failure .outcome.primary { background: #fff0ed; color: #8c2f26; }
    .outcome.recovery { background: #e9f7f0; color: #16583f; }
    .outcome span { font-size: 12px; opacity: .75; }
    .detail { margin: 9px 2px 0; color: #596477; font-size: 13px; line-height: 1.45; }
  </style>
</head>
<body>
  <main class="matrix">
    <div class="matrix-title">
      <h1>同一支搜尋，四種 Playwright 實測結果</h1>
      <p>綠色＝操作成功；紅色＝測試正確捕捉預期 Timeout</p>
    </div>
    <section class="cases" aria-label="Day 2 四個 Playwright 實驗">
      ${cases.map(renderCase).join("\n")}
    </section>
  </main>
</body>
</html>`;
}
