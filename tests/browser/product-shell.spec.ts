import { expect, test } from "@playwright/test";

test("renders the formal product shell before features", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "AgentReady Events" })).toBeVisible();
  await expect(page.getByText("產品功能從 Day 14 開始")).toBeVisible();
  await expect(page.getByRole("link", { name: "活動" })).toHaveAttribute("href", "/events");
});
