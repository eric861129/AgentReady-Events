import { expect, test } from "@playwright/test";

test("Declarative metadata upgrades the existing human search", async ({ page }) => {
  await page.goto("/events");
  const form = page.locator("form");
  await expect(form).toHaveAttribute("toolname", "search_events");
  await expect(form).toHaveAttribute("tooldescription", /目前公開活動/);
  await expect(page.getByLabel("關鍵字")).toHaveAttribute("toolparamdescription", /最多 100 字/);
  await expect(form).not.toHaveAttribute("toolautosubmit", /.*/);
  await page.getByLabel("地點").selectOption("taipei");
  await page.getByRole("button", { name: "搜尋活動" }).click();
  await expect(page.getByText("WebMCP 入門工作坊")).toBeVisible();
});
