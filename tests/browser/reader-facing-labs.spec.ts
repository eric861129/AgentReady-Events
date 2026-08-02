import { expect, test, type Locator, type TestInfo } from "@playwright/test";

async function captureExpectedTimeout(locator: Locator, attachmentName: string, testInfo: TestInfo) {
  let locatorError: unknown;
  try {
    await locator.click({ timeout: 500 });
  } catch (error) {
    locatorError = error;
  }

  const message = locatorError instanceof Error ? locatorError.message : String(locatorError);
  await testInfo.attach(attachmentName, {
    body: Buffer.from(message),
    contentType: "text/plain"
  });
  expect(message).toContain("Timeout 500ms exceeded");
}

test("Day 4 原始 accessible-name Locator 可完成搜尋", async ({ page }) => {
  await page.goto("/labs/day-04-playwright-locator/index.html");
  await page.getByRole("button", { name: "搜尋活動" }).click();
  await expect(page.getByRole("status")).toContainText("人類操作已完成：1 場");
});

test("Day 4 role Locator 可跨過新增的 DOM wrapper", async ({ page }) => {
  await page.goto("/labs/day-04-playwright-locator/index.html?variant=wrapped");
  await expect(page.locator(".action-shell")).toHaveCount(1);
  await page.getByRole("button", { name: "搜尋活動" }).click();
  await expect(page.getByRole("status")).toContainText("人類操作已完成：1 場");
});

test("Day 4 accessible name 改變時保留真實 timeout", async ({ page }, testInfo) => {
  await page.goto("/labs/day-04-playwright-locator/index.html?variant=renamed");
  await captureExpectedTimeout(
    page.getByRole("button", { name: "搜尋活動" }),
    "day-04-old-accessible-name-timeout.txt",
    testInfo
  );
  await page.getByRole("button", { name: "探索場次" }).click();
  await expect(page.getByRole("status")).toContainText("人類操作已完成：1 場");
});

test("Day 4 DOM wrapper 會破壞直接子元素 CSS Selector", async ({ page }, testInfo) => {
  await page.goto("/labs/day-04-playwright-locator/index.html?variant=wrapped");
  await captureExpectedTimeout(
    page.locator("#search-form > button"),
    "day-04-direct-child-css-timeout.txt",
    testInfo
  );
  await page.getByRole("button", { name: "搜尋活動" }).click();
  await expect(page.getByRole("status")).toContainText("人類操作已完成：1 場");
});

test("Day 11 讀者版路徑保留 Declarative 表單契約", async ({ page }) => {
  await page.goto("/labs/day-11-declarative-tool/index.html");
  const form = page.locator("form#event-search");

  await expect(form).toHaveAttribute("toolname", "search_events");
  await expect(form).toHaveAttribute("toolautosubmit", "");
  await page.getByLabel("城市").selectOption("taipei");
  await page.getByLabel("活動形式").selectOption("onsite");
  await page.getByRole("button", { name: "搜尋活動" }).click();
  await expect(page.getByRole("status")).toContainText("人類 fallback 已完成：1 場");
});

test("Day 12 讀者版路徑可觀察 Imperative Tool lifecycle", async ({ page }) => {
  await page.addInitScript(() => {
    const tools = new Map<string, {
      name: string;
      description: string;
      inputSchema: Record<string, unknown>;
      execute(input: object): Promise<unknown>;
    }>();

    class FakeModelContext extends EventTarget {
      async registerTool(
        tool: {
          name: string;
          description: string;
          inputSchema: Record<string, unknown>;
          execute(input: object): Promise<unknown>;
        },
        options?: { signal?: AbortSignal }
      ) {
        tools.set(tool.name, tool);
        options?.signal?.addEventListener("abort", () => {
          tools.delete(tool.name);
          this.dispatchEvent(new Event("toolchange"));
        }, { once: true });
        this.dispatchEvent(new Event("toolchange"));
      }

      async getTools() {
        return [...tools.values()].map((tool) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: JSON.stringify(tool.inputSchema),
          origin: location.origin
        }));
      }

      async executeTool(descriptor: { name: string }, input: string) {
        return tools.get(descriptor.name)?.execute(JSON.parse(input));
      }
    }

    Object.defineProperty(Document.prototype, "modelContext", {
      configurable: true,
      value: new FakeModelContext()
    });
  });
  await page.goto("/labs/day-12-imperative-lifecycle/index.html?route=list");

  await expect(page.getByRole("heading", { name: "知道何時離場的 Tool" })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("get_event_details");
  await expect(page.getByRole("button", { name: "執行已發現 Tool" })).toBeEnabled();
  await page.getByRole("link", { name: "About route" }).click();
  await expect(page.getByRole("status")).toContainText("none");
  await page.getByRole("link", { name: "List route" }).click();
  await expect(page.getByRole("status")).toContainText("get_event_details");
});
