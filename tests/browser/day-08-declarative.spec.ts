import { expect, test } from "@playwright/test";

test("adds Declarative identity while preserving human fallback", async ({ page }) => {
  await page.goto("/labs/day-08-declarative-tool/index.html");
  const form = page.locator("form");
  await expect(form).toHaveAttribute("toolname", "search_events");
  await expect(form).toHaveAttribute("tooldescription", "依關鍵字、地點、費用與程度搜尋目前公開活動，並更新使用者可見的活動列表。");
  await page.getByLabel("地點").selectOption("taipei");
  await page.getByRole("button", { name: "搜尋活動" }).click();
  await expect(page.getByText("WebMCP 入門工作坊")).toBeVisible();
  await expect(page.getByText("人類 fallback 已完成")).toBeVisible();
});
