import { expect, test } from "@playwright/test";

test("shows the Day 1 baseline without claiming Agent discovery", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "AgentReady Events：Day 1 基線" })).toBeVisible();
  await expect(page.getByText("尚未進行 Agent discovery", { exact: true })).toBeVisible();
  await expect(page.getByRole("list", { name: "後續會完成的五項網站能力" }).getByRole("listitem")).toHaveCount(5);
});
