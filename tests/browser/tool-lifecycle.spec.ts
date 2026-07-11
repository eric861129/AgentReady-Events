import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(document, "modelContext", {
      configurable: true,
      value: {
        registerTool: async (tool: { name: string }, options?: { signal?: AbortSignal }) => {
          const names = JSON.parse(sessionStorage.getItem("registered") ?? "[]") as string[];
          names.push(tool.name);
          sessionStorage.setItem("registered", JSON.stringify(names));
          options?.signal?.addEventListener("abort", () => sessionStorage.setItem("aborted", String(Number(sessionStorage.getItem("aborted") ?? 0) + 1)));
        }
      }
    });
  });
});

test("detail registration is disposed when navigation leaves its route", async ({ page }) => {
  await page.goto("/events/evt-webmcp-intro");
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("registered"))).toContain("get_event_details");
  const registeredCount = await page.evaluate(() => (JSON.parse(sessionStorage.getItem("registered") ?? "[]") as string[]).length);
  await page.getByRole("link", { name: "回活動列表" }).click();
  await expect.poll(() => page.evaluate(() => Number(sessionStorage.getItem("aborted") ?? 0))).toBe(registeredCount);
  await expect(page.locator('[toolname="search_events"]')).toHaveCount(1);
});
