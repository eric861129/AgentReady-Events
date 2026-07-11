import { expect, test } from "@playwright/test";

test("copy-coupled actuation fails after the visible label changes", async ({ page }) => {
  await page.goto("/labs/day-02-actuation/index.html?variant=renamed");
  await expect(page.getByRole("button", { name: "搜尋活動" })).toHaveCount(0);
  await expect(page.locator('[data-action="search-events"]')).toHaveCount(1);
  await expect(page.getByText("尚未搜尋")).toBeVisible();
});

test("the renamed human control still performs the search", async ({ page }) => {
  await page.goto("/labs/day-02-actuation/index.html?variant=renamed");
  await page.getByRole("button", { name: "探索場次" }).click();
  await expect(page.getByText("已搜尋：WebMCP")).toBeVisible();
});
