import { expect, test } from "@playwright/test";

test("direct opaque-ID route renders the same public detail", async ({ page }) => {
  await page.goto("/events/evt-webmcp-intro");
  await expect(page.getByRole("heading", { name: "WebMCP 入門工作坊" })).toBeVisible();
  await expect(page.getByText("台北前端共學空間")).toBeVisible();
});
