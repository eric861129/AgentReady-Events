import { describe, expect, it } from "vitest";

import {
  buildDay02EvidenceMatrixHtml,
  type Day02EvidenceMatrixCase
} from "../evidence/support/day-02-evidence-matrix";

const screenshotDataUrl = "data:image/png;base64,AA==";

function caseFixture(overrides: Partial<Day02EvidenceMatrixCase>): Day02EvidenceMatrixCase {
  return {
    number: "01",
    title: "原始介面",
    mutation: "沒有修改",
    locator: 'getByRole("button", { name: "搜尋活動" })',
    primaryOutcome: "click 成功，顯示 1 場",
    recoveryOutcome: null,
    detail: "原始 Locator 找到按鈕。",
    screenshotDataUrl,
    tone: "success",
    ...overrides
  };
}

describe("Day 2 evidence matrix", () => {
  it("renders four visually distinct Playwright outcomes from runtime data", () => {
    const cases = [
      caseFixture({ number: "01", title: "原始介面" }),
      caseFixture({ number: "02", title: "DOM 包裝", mutation: "新增 .action-shell" }),
      caseFixture({
        number: "03",
        title: "文案改名",
        mutation: "搜尋活動 → 探索場次",
        primaryOutcome: "舊名稱 Timeout 500ms",
        recoveryOutcome: "新名稱 click 成功",
        tone: "expected-failure"
      }),
      caseFixture({
        number: "04",
        title: "CSS 結構",
        mutation: "button 不再是直接子元素",
        locator: "#search-form > button",
        primaryOutcome: "CSS Timeout 500ms",
        recoveryOutcome: "role Locator click 成功",
        tone: "expected-failure"
      })
    ];

    const html = buildDay02EvidenceMatrixHtml(cases);

    for (const expected of [
      "原始介面",
      "DOM 包裝",
      "文案改名",
      "CSS 結構",
      "舊名稱 Timeout 500ms",
      "CSS Timeout 500ms",
      "新名稱 click 成功",
      "role Locator click 成功"
    ]) {
      expect(html).toContain(expected);
    }
    expect(html.match(/data:image\/png;base64/g)).toHaveLength(4);
    expect(html).toContain("#search-form &gt; button");
  });

  it("rejects an incomplete runtime comparison", () => {
    expect(() => buildDay02EvidenceMatrixHtml([
      caseFixture({ number: "01", title: "原始介面" })
    ])).toThrow("exactly four runtime cases");
  });
});
