import { expect, test } from "@playwright/test";

import { captureEvidence } from "./support/capture-evidence";

test("Day 07 captures the semantic human form result", async ({ page }) => {
  await page.goto("/labs/day-07-semantic-form/index.html");
  await page.getByLabel("地點").selectOption("taipei");
  await page.getByLabel("費用").selectOption("free");
  await page.getByLabel("關鍵字").press("Enter");
  const result = page.getByRole("list", { name: "活動搜尋結果" });
  await expect(result.getByRole("listitem")).toHaveCount(1);
  await captureEvidence(page, {
    id: "day-07-form-browser",
    day: 7,
    route: "/labs/day-07-semantic-form/index.html",
    fixture: "semantic-form-default-events",
    selector: "body",
    action: "select taipei/free and submit with Enter",
    assertion: "one result is visible and contains WebMCP 入門工作坊",
    finalAsset: "assets/day-07/form-browser.webp",
    evidenceAxis: "test_harness",
    evidenceLevel: "E2",
    limitations: ["This is a Playwright browser replay, not an Agent invocation."]
  });
});

test("Day 08 captures Declarative metadata and human fallback", async ({ page }) => {
  await page.goto("/labs/day-08-declarative-tool/index.html");
  await page.getByLabel("城市").selectOption("taipei");
  await page.getByLabel("活動形式").selectOption("onsite");
  await page.getByRole("button", { name: "搜尋活動" }).click();
  await expect(page.getByText("人類 fallback 已完成")).toBeVisible();
  await captureEvidence(page, {
    id: "day-08-declarative-devtools",
    day: 8,
    route: "/labs/day-08-declarative-tool/index.html",
    fixture: "declarative-search-contract",
    selector: "body",
    action: "submit the annotated form through the human control",
    assertion: "human fallback completes and renders the filtered event",
    finalAsset: "assets/day-08/declarative-devtools.webp",
    evidenceAxis: "test_harness",
    evidenceLevel: "E2",
    limitations: ["The capture proves the annotated form and fallback path; it does not prove browser-native Tool discovery."]
  });
});

test("Day 10 captures Imperative local execution", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Document.prototype, "modelContext", {
      configurable: true,
      value: { async registerTool() {} }
    });
  });
  await page.goto("/labs/day-10-imperative-tool/index.html");
  await page.getByLabel("關鍵字").fill("Agent");
  await page.getByLabel("活動形式").selectOption("online");
  await page.getByRole("button", { name: "本地執行 Tool" }).click();
  await expect(page.getByLabel("執行結果")).toContainText('"count": 1');
  await captureEvidence(page, {
    id: "day-10-imperative-devtools",
    day: 10,
    route: "/labs/day-10-imperative-tool/index.html",
    fixture: "imperative-search-contract",
    selector: "body",
    action: "execute search_events locally with Agent/online filters",
    assertion: "structured result reports count 1 and the page labels the path E2 local execution",
    finalAsset: "assets/day-10/imperative-devtools.webp",
    evidenceAxis: "test_harness",
    evidenceLevel: "E2",
    limitations: ["The local Tool execution uses a controlled modelContext fixture and is not a real Agent invocation."]
  });
});

test("Day 11 captures Tool discovery lifecycle through the browser fixture", async ({ page }) => {
  await page.addInitScript(() => {
    const tools = new Map<string, { name: string }>();
    class FakeModelContext extends EventTarget {
      async registerTool(tool: { name: string }, options?: { signal?: AbortSignal }) {
        tools.set(tool.name, tool);
        options?.signal?.addEventListener("abort", () => tools.delete(tool.name), { once: true });
      }
      async getTools() {
        return [...tools.values()].map((tool) => ({ ...tool, description: "fixture", inputSchema: "{}", origin: location.origin }));
      }
      async executeTool() { return { ok: true }; }
    }
    Object.defineProperty(Document.prototype, "modelContext", { configurable: true, value: new FakeModelContext() });
  });
  await page.goto("/labs/day-11-tool-lifecycle/index.html?route=list");
  await expect(page.getByText("Discovered Tools: get_event_details")).toBeVisible();
  await captureEvidence(page, {
    id: "day-11-cleanup-before-after",
    day: 11,
    route: "/labs/day-11-tool-lifecycle/index.html?route=list",
    fixture: "model-context-lifecycle",
    selector: "body",
    action: "enter list route and inspect registered/discovered Tools",
    assertion: "get_event_details is active and discoverable in the controlled browser fixture",
    finalAsset: "assets/day-11/cleanup-before-after.webp",
    evidenceAxis: "test_harness",
    evidenceLevel: "E2",
    limitations: ["The discovery surface is a deterministic browser fixture, not the Chrome implementation or a real Agent."]
  });
});
