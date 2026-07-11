import { expect, test } from "@playwright/test";

test("human save shows visible idempotent feedback and Undo", async ({ page }) => {
  await page.goto("/events/evt-webmcp-intro");
  await page.getByRole("button", { name: "收藏活動" }).click();
  await expect(page.getByRole("status")).toContainText("已收藏");
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByText("已移除收藏")).toBeVisible();
});
