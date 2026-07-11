import { expect, test } from "@playwright/test";

test("human fallback and local E2 execution update the visible detail", async ({ page }) => {
  await page.goto("/labs/day-10-imperative-tool/index.html");
  await page.getByRole("button", { name: "本地執行 Tool" }).click();
  await expect(page.getByRole("heading", { name: "WebMCP 入門工作坊" })).toBeVisible();
  await expect(page.getByText("E2 local execution")).toBeVisible();
  await expect(page.getByLabel("執行結果")).toContainText('"ok": true');
});
