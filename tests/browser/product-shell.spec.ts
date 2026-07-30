import { expect, test } from "@playwright/test";

test("renders the V2-inspired formal product shell", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "活動探索站" })).toHaveAttribute("href", "/");
  await expect(page.getByRole("navigation", { name: "主要導覽" })).toBeVisible();
  await expect(page.getByRole("link", { name: "探索活動", exact: true })).toHaveAttribute("href", "/events");
  await expect(page.getByRole("link", { name: "我的報名", exact: true })).toHaveAttribute("href", "/registrations");
  await expect(page.getByRole("heading", {
    name: "把下一場值得參加的活動，交給人類與 Agent 一起找到",
  })).toBeVisible();
  await expect(page.getByText("5 個正式 Tool")).toBeVisible();
  await expect(page.getByText("3 條可信任 Journey")).toBeVisible();
  await expect(page.getByRole("link", { name: "開始探索活動" })).toHaveAttribute("href", "/events");
  await expect(page.getByText("Source contract：5 Tools")).toBeVisible();
  await expect(page.getByText("Browser capability：unavailable")).toBeVisible();
  await expect(page.getByText("Agent invocation：current revision pending")).toBeVisible();
  await expect(page.getByText("E2 VERIFIED", { exact: true })).toBeVisible();
  await expect(page.getByText("E4 TEST TARGET", { exact: true })).toBeVisible();
  await expect(page.getByText("E4 READY", { exact: true })).toHaveCount(0);
  await expect(page.getByText("E4 實測導向", { exact: true })).toHaveCount(0);
});

test("offers keyboard users a visible route to main content", async ({ page }) => {
  await page.goto("/events");

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "跳到主要內容" })).toBeFocused();
  await expect(page.locator("#app")).toHaveAttribute("tabindex", "-1");
});
