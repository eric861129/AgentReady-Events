import { expect, test } from "@playwright/test";

test("preparation leaves mutation at zero until visible human confirmation", async ({ page }) => {
  await page.goto("/labs/day-12-confirmation-safety/index.html");
  await page.getByRole("button", { name: "準備取消摘要" }).click();
  const dialog = page.getByRole("dialog", { name: "確認取消報名" });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("button", { name: "保留報名" })).toBeFocused();
  await expect(page.getByText("Mutation count: 0")).toBeVisible();
  await page.getByRole("button", { name: "確認取消" }).click();
  await expect(page.getByText("Mutation count: 1")).toBeVisible();
});

test("closing the dialog restores focus without WebMCP", async ({ page }) => {
  await page.goto("/labs/day-12-confirmation-safety/index.html");
  const trigger = page.getByRole("button", { name: "準備取消摘要" });
  await trigger.click();
  await page.getByRole("button", { name: "保留報名" }).click();
  await expect(trigger).toBeFocused();
});
