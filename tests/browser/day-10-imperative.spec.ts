import { expect, test } from "@playwright/test";

test("registers, executes, and unregisters the Imperative search_events Tool", async ({ page }) => {
  await page.addInitScript(() => {
    const lifecycle = { registered: [] as Array<Record<string, unknown>>, aborted: 0 };
    Object.defineProperty(window, "__toolLifecycle", { value: lifecycle });
    Object.defineProperty(Document.prototype, "modelContext", {
      configurable: true,
      value: {
        async registerTool(tool: Record<string, unknown>, options?: { signal?: AbortSignal }) {
          lifecycle.registered.push(tool);
          options?.signal?.addEventListener("abort", () => { lifecycle.aborted += 1; });
        }
      }
    });
  });
  await page.goto("/labs/day-10-imperative-tool/index.html");
  await expect.poll(() => page.evaluate(() => (window as typeof window & { __toolLifecycle: { registered: Array<{ name: string }> } }).__toolLifecycle.registered[0]?.name)).toBe("search_events");
  await page.getByLabel("關鍵字").fill("Agent");
  await page.getByLabel("活動形式").selectOption("online");
  await page.getByRole("button", { name: "本地執行 Tool" }).click();
  await expect(page.getByText("Agent 測試實戰", { exact: true })).toBeVisible();
  await expect(page.getByText("E2 local execution")).toBeVisible();
  await expect(page.getByLabel("執行結果")).toContainText('"ok": true');
  await expect(page.getByLabel("執行結果")).toContainText('"count": 1');
  await page.evaluate(() => window.dispatchEvent(new Event("beforeunload")));
  await expect.poll(() => page.evaluate(() => (window as typeof window & { __toolLifecycle: { aborted: number } }).__toolLifecycle.aborted)).toBe(1);
});
