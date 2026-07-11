import { expect, test } from "@playwright/test";

test("route state adds and removes the details Tool without duplicates", async ({ page }) => {
  await page.goto("/labs/day-11-tool-lifecycle/index.html?route=list");
  await expect(page.getByText("Active project Tools: get_event_details")).toBeVisible();
  await page.getByRole("link", { name: "About route" }).click();
  await expect(page.getByText("Active project Tools: none")).toBeVisible();
  await page.getByRole("link", { name: "List route" }).click();
  await expect(page.getByText("Active project Tools: get_event_details")).toBeVisible();
  await expect(page.getByText("Register calls: 2")).toBeVisible();
});
