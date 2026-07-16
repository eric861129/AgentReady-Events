import { expect, test } from "@playwright/test";

test("discovers precise metadata and preserves human fallback", async ({ page }) => {
  await page.goto("/labs/day-08-declarative-tool/index.html");
  const form = page.locator("form");
  await expect(form).toHaveAttribute("toolname", "search_events");
  await expect(form).toHaveAttribute("tooldescription", /關鍵字、城市與活動形式/);
  await expect(form).toHaveAttribute("toolautosubmit", "");
  await expect(page.getByLabel("關鍵字")).toHaveAttribute("toolparamdescription", /名稱與摘要/);
  await page.getByLabel("城市").selectOption("taipei");
  await page.getByLabel("活動形式").selectOption("onsite");
  await page.getByRole("button", { name: "搜尋活動" }).click();
  await expect(page.getByText("WebMCP 入門工作坊")).toBeVisible();
  await expect(page.getByText("人類 fallback 已完成")).toBeVisible();
});

test("returns success through respondWith without locating the button", async ({ page }) => {
  await page.goto("/labs/day-08-declarative-tool/index.html");
  await page.getByLabel("關鍵字").fill("Agent");
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
  expect(result).toMatchObject({ ok: true, count: 1, events: [{ id: "evt-agent-testing" }] });
  await expect(page.getByRole("status")).toContainText("E2 synthetic Agent submission");
  await expect(page.getByText("Agent 測試實戰")).toBeVisible();
});

test("returns validation failure through respondWith", async ({ page }) => {
  await page.goto("/labs/day-08-declarative-tool/index.html");
  const result = await page.evaluate(async () => {
    const select = document.querySelector<HTMLSelectElement>("[name='format']")!;
    select.add(new Option("混合", "hybrid"));
    select.value = "hybrid";
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
  expect(result).toMatchObject({ ok: false, code: "VALIDATION_ERROR", retryable: false });
  await expect(page.getByRole("status")).toContainText("VALIDATION_ERROR");
});

test("returns an empty successful result when nothing matches", async ({ page }) => {
  await page.goto("/labs/day-08-declarative-tool/index.html");
  await page.getByLabel("關鍵字").fill("完全不存在的活動");
  await page.getByRole("button", { name: "搜尋活動" }).click();
  await expect(page.getByRole("status")).toContainText("0 場");
  await expect(page.locator("#results li")).toHaveCount(0);
});
