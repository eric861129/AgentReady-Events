import { expect, test } from "@playwright/test";

test("human can search with labels and keyboard without invoking WebMCP", async ({ page }) => {
  await page.goto("/events");
  await page.getByLabel("地點").selectOption("taipei");
  await page.getByLabel("費用").selectOption("free");
  await page.getByLabel("關鍵字").press("Enter");
  await expect(page.getByRole("list", { name: "活動搜尋結果" }).getByRole("listitem")).toHaveCount(1);
  await expect(page.getByText("WebMCP 入門工作坊")).toBeVisible();
});
