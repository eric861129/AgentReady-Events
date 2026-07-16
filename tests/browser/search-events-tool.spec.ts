import { expect, test } from "@playwright/test";

test("Declarative metadata is executable while preserving human search", async ({ page }) => {
  await page.goto("/events");
  const form = page.locator("form");
  await expect(form).toHaveAttribute("toolname", "search_events");
  await expect(form).toHaveAttribute("tooldescription", /目前公開活動/);
  await expect(page.getByLabel("關鍵字")).toHaveAttribute("toolparamdescription", /最多 100 字/);
  await expect(form).toHaveAttribute("toolautosubmit", "");
  await page.getByLabel("地點").selectOption("taipei");
  await page.getByRole("button", { name: "搜尋活動" }).click();
  await expect(page.getByText("WebMCP 入門工作坊")).toBeVisible();
});

test("Agent submission succeeds after the visible button is renamed", async ({ page }) => {
  await page.goto("/events");
  await page.getByLabel("地點").selectOption("taipei");
  await page.getByRole("button", { name: "搜尋活動" }).evaluate((button) => { button.textContent = "尋找課程"; });
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
  expect(result).toMatchObject({ count: 1, events: [{ id: "evt-webmcp-intro" }] });
  await expect(page.getByRole("status")).toContainText("Agent 搜尋已完成");
  await expect(page.getByText("WebMCP 入門工作坊")).toBeVisible();
});

test("Agent submission returns invalid input and updates visible status", async ({ page }) => {
  await page.goto("/events");
  const result = await page.evaluate(async () => {
    const select = document.querySelector<HTMLSelectElement>("[name='location']")!;
    select.add(new Option("未知", "invalid"));
    select.value = "invalid";
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
  expect(result).toMatchObject({ ok: false, code: "INVALID_INPUT", retryable: false });
  await expect(page.getByRole("status")).toContainText("搜尋條件格式無效");
});

test("no results is success and temporary failure stays retryable", async ({ page }) => {
  await page.goto("/events");
  await page.getByLabel("關鍵字").fill("完全不存在的活動");
  await page.getByRole("button", { name: "搜尋活動" }).click();
  await expect(page.getByRole("status")).toContainText("找到 0 場活動");
  await page.route("**/api/events?**", async (route) => route.fulfill({
    status: 503,
    contentType: "application/json",
    body: JSON.stringify({ message: "internal upstream name" })
  }));
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
  expect(result).toEqual({
    ok: false,
    code: "TEMPORARY_FAILURE",
    message: "活動搜尋暫時無法完成，請稍後再試。",
    retryable: true
  });
  await expect(page.getByRole("status")).toContainText("活動搜尋暫時無法完成");
  await expect(page.getByRole("status")).not.toContainText("internal upstream name");
});
