import { expect, test } from "@playwright/test";

test("human can search with labels and keyboard without invoking WebMCP", async ({ page }) => {
  await page.goto("/events");
  await page.getByLabel("地點").selectOption("taipei");
  await page.getByLabel("費用").selectOption("free");
  await page.getByLabel("關鍵字").press("Enter");
  await expect(page.getByRole("list", { name: "活動搜尋結果" }).getByRole("listitem")).toHaveCount(1);
  await expect(page.getByText("WebMCP 入門工作坊")).toBeVisible();
});

test("human fallback still works when the browser has no modelContext", async ({ page }) => {
  await page.goto("/events");
  await expect(page.evaluate(() => "modelContext" in document)).resolves.toBe(false);
  await page.getByLabel("關鍵字").fill("Agent");
  await page.getByLabel("關鍵字").press("Enter");
  await expect(page.getByText("Agent 測試實戰")).toBeVisible();
});
