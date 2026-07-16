import { expect, test } from "@playwright/test";

test("route state adds and removes the details Tool without duplicates", async ({ page }) => {
  await page.addInitScript(() => {
    const tools = new Map<string, { name: string; description: string; inputSchema: Record<string, unknown>; execute(input: object): Promise<unknown> }>();
    const metrics = { registerCalls: 0, toolchanges: 0, executeCalls: 0 };
    class FakeModelContext extends EventTarget {
      async registerTool(tool: { name: string; description: string; inputSchema: Record<string, unknown>; execute(input: object): Promise<unknown> }, options?: { signal?: AbortSignal }) {
        if (tools.has(tool.name)) throw new Error("duplicate");
        metrics.registerCalls += 1;
        tools.set(tool.name, tool);
        options?.signal?.addEventListener("abort", () => {
          tools.delete(tool.name);
          metrics.toolchanges += 1;
          this.dispatchEvent(new Event("toolchange"));
        }, { once: true });
        metrics.toolchanges += 1;
        this.dispatchEvent(new Event("toolchange"));
      }
      async getTools() {
        return [...tools.values()].map((tool) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: JSON.stringify(tool.inputSchema),
          origin: location.origin
        })).sort((left, right) => left.name.localeCompare(right.name));
      }
      async executeTool(descriptor: { name: string }, input: string) {
        metrics.executeCalls += 1;
        return tools.get(descriptor.name)?.execute(JSON.parse(input));
      }
    }
    Object.defineProperty(Document.prototype, "modelContext", { configurable: true, value: new FakeModelContext() });
    Object.defineProperty(window, "__webmcpMetrics", { value: metrics });
  });
  await page.goto("/labs/day-11-tool-lifecycle/index.html?route=list");
  await expect(page.getByText("Active project Tools: get_event_details")).toBeVisible();
  await expect(page.getByText("Discovered Tools: get_event_details")).toBeVisible();
  await page.getByRole("button", { name: "執行已發現 Tool" }).click();
  await expect(page.getByLabel("Tool 執行結果")).toContainText('"ok": true');
  await page.getByRole("link", { name: "About route" }).click();
  await expect(page.getByText("Active project Tools: none")).toBeVisible();
  await expect(page.getByText("Discovered Tools: none")).toBeVisible();
  await page.getByRole("link", { name: "List route" }).click();
  await expect(page.getByText("Active project Tools: get_event_details")).toBeVisible();
  await expect(page.getByText("Register calls: 2")).toBeVisible();
  await expect.poll(() => page.evaluate(() => (window as typeof window & { __webmcpMetrics: { toolchanges: number } }).__webmcpMetrics.toolchanges)).toBe(3);
});
