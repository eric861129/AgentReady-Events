import { expect, test } from "@playwright/test";

test("renders a deterministic project snapshot without claiming discovery", async ({ page }) => {
  await page.goto("/labs/day-09-declarative-schema/index.html");
  const snapshot = page.getByLabel("專案推導的參數快照");
  await expect(snapshot).toContainText('"name": "location"');
  await expect(snapshot).toContainText('"values"');
  await expect(page.getByText("這是專案 deterministic snapshot，不是真實 Agent discovery。")).toBeVisible();
  await expect(page.locator('[name="query"]')).toHaveAttribute("toolparamdescription", /關鍵字/);
});
