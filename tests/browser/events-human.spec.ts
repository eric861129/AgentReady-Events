import { expect, test } from "@playwright/test";

test("presents search as a polished human-first product journey", async ({ page }) => {
  await page.goto("/events");

  await expect(page.getByRole("heading", { name: "探索下一場值得參加的活動" })).toBeVisible();
  await expect(page.getByText("先讓人類能找，再讓 Agent 能懂")).toBeVisible();
  await expect(page.locator("#event-search")).toHaveAttribute("toolname", "search_events");
  await expect(page.getByRole("status")).toContainText("設定條件");

  await page.getByLabel("地點").selectOption("taipei");
  await page.getByLabel("費用").selectOption("free");
  await page.getByLabel("程度").selectOption("beginner");
  await page.getByRole("button", { name: "搜尋活動" }).click();

  const result = page.getByRole("list", { name: "活動搜尋結果" }).getByRole("listitem");
  await expect(result).toHaveCount(1);
  await expect(result).toContainText("台北");
  await expect(result).toContainText("免費");
  await expect(result).toContainText("入門");
  await expect(result.getByRole("button", { name: "查看詳情" })).toBeVisible();
});

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
