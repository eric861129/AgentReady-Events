import { expect, test } from "@playwright/test";

test("human search works through semantic controls without WebMCP", async ({ page }) => {
  await page.goto("/labs/day-07-semantic-form/index.html");
  await expect(page.locator("[toolname]")).toHaveCount(0);
  await page.getByLabel("地點").selectOption("taipei");
  await page.getByLabel("費用").selectOption("free");
  await page.getByLabel("關鍵字").press("Enter");
  await expect(page.getByRole("list", { name: "活動搜尋結果" }).getByRole("listitem")).toHaveCount(1);
  await expect(page.getByText("WebMCP 入門工作坊")).toBeVisible();
});
