import { expect, test } from "@playwright/test";

import { captureEvidence } from "./support/capture-evidence";

test("Day 02 captures the original locator succeeding", async ({ page }) => {
  await page.goto("/labs/day-02-actuation/index.html?evidence=1");
  const locator = page.getByRole("button", { name: "搜尋活動" });
  await locator.click();
  await expect(page.getByRole("status")).toContainText("人類操作已完成");
  await page.locator("#locator-expression").evaluate((node) => { node.textContent = 'getByRole("button", { name: "搜尋活動" })'; });
  await page.locator("#automation-outcome").evaluate((node) => { node.textContent = "Locator resolved one control; click completed and visible status changed."; });
  await captureEvidence(page, {
    id: "day-02-button-before-after",
    day: 2,
    route: "/labs/day-02-actuation/index.html?evidence=1",
    fixture: "original-search-button",
    selector: "body",
    action: "click the original control with its accessible-name locator",
    assertion: "the original locator resolves one control and the visible search status changes",
    finalAsset: "assets/day-02/button-before-after.webp",
    evidenceAxis: "test_harness",
    evidenceLevel: "E2",
    limitations: ["This capture proves a Playwright locator against the original UI; it is not an Agent invocation."]
  });
});

test("Day 02 captures the real locator failure and synthetic Tool success", async ({ page }) => {
  await page.goto("/labs/day-02-actuation/index.html?variant=renamed&evidence=1");
  const oldLocator = page.getByRole("button", { name: "搜尋活動" });
  let errorMessage = "";
  try {
    await oldLocator.click({ timeout: 500 });
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : String(error);
  }
  expect(errorMessage).toContain("Timeout 500ms exceeded");
  const sanitizedError = (errorMessage.split("\n    at ", 1).at(0) ?? errorMessage).slice(0, 900);
  await page.locator("#locator-expression").evaluate((node) => { node.textContent = 'getByRole("button", { name: "搜尋活動" })'; });
  await page.locator("#locator-error").evaluate((node, message) => { node.textContent = message; }, sanitizedError);
  await page.locator("#dom-after").evaluate((node, markup) => { node.textContent = markup; }, await page.getByRole("button", { name: "探索場次" }).evaluate((button) => button.parentElement?.outerHTML ?? button.outerHTML));

  const result = await page.evaluate(async () => {
    const form = document.querySelector("form")!;
    let response: Promise<unknown> | undefined;
    const event = new Event("submit", { bubbles: true, cancelable: true });
    Object.defineProperties(event, {
      agentInvoked: { value: true },
      respondWith: { value: (promise: Promise<unknown>) => { response = promise; } }
    });
    form.dispatchEvent(event);
    return response;
  });
  expect(result).toMatchObject({ ok: true, count: 1 });
  await expect(page.getByRole("status")).toContainText("E2 synthetic Agent submission");
  await captureEvidence(page, {
    id: "day-02-locator-failure",
    day: 2,
    route: "/labs/day-02-actuation/index.html?variant=renamed&evidence=1",
    fixture: "renamed-and-wrapped-search-button",
    selector: "body",
    action: "run the old accessible-name locator, preserve its error, then dispatch the Declarative form synthetically",
    assertion: "the old locator times out while search_events returns one result through the E2 synthetic submission path",
    expectedFailure: "Playwright accessible-name locator times out after the visible label and DOM wrapper change.",
    finalAsset: "assets/day-02/locator-failure.webp",
    evidenceAxis: "test_harness",
    evidenceLevel: "E2",
    limitations: ["The WebMCP comparison uses a synthetic SubmitEvent fixture; it does not prove a real Agent discovered or invoked the Tool."]
  });
});

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
