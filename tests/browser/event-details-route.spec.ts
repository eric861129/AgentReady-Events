import { expect, test } from "@playwright/test";

test("direct opaque-ID route renders the same public detail", async ({ page }) => {
  await page.goto("/events/evt-webmcp-intro");
  await expect(page.getByRole("heading", { name: "WebMCP 入門工作坊" })).toBeVisible();
  await expect(page.getByText("台北前端共學空間")).toBeVisible();
});

test("detail page explains availability and keeps registration visible to the human", async ({ page }) => {
  await page.goto("/events/evt-webmcp-intro");

  await expect(page.getByText("開放報名")).toBeVisible();
  await expect(page.getByText("剩餘 8 名")).toBeVisible();
  await expect(page.getByText("2026 年 8 月 1 日")).toBeVisible();
  await expect(page.getByRole("link", { name: "前往報名" })).toHaveAttribute(
    "href",
    "/events/evt-webmcp-intro/register",
  );
  await expect(page.getByText("目前頁面公開 2 個 Tool")).toBeVisible();
  await expect(page.getByText("get_event_details", { exact: true })).toBeVisible();
  await expect(page.getByText("save_event", { exact: true })).toBeVisible();
});
