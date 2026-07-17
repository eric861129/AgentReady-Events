import { expect, test, type Locator, type TestInfo } from "@playwright/test";

async function captureExpectedTimeout(locator: Locator, attachmentName: string, testInfo: TestInfo) {
  let locatorError: unknown;
  try {
    await locator.click({ timeout: 500 });
  } catch (error) {
    locatorError = error;
  }

  const message = locatorError instanceof Error ? locatorError.message : String(locatorError);
  const firstLine = message.split("\n").find((line) => line.trim().length > 0)?.trim() ?? message;
  await testInfo.attach(attachmentName, {
    body: Buffer.from(message),
    contentType: "text/plain"
  });
  expect(firstLine).toContain("Timeout 500ms exceeded");
  return firstLine;
}

test("the original accessible-name locator performs the search", async ({ page }) => {
  await page.goto("/labs/day-02-actuation/index.html");
  await page.getByLabel("關鍵字").fill("WebMCP");
  await page.getByRole("button", { name: "搜尋活動" }).click();
  await expect(page.getByRole("status")).toContainText("人類操作已完成：1 場");
});

test("the role locator survives an extra DOM wrapper", async ({ page }) => {
  await page.goto("/labs/day-02-actuation/index.html?variant=wrapped");

  await expect(page.locator(".action-shell")).toHaveCount(1);
  await page.getByRole("button", { name: "搜尋活動" }).click();
  await expect(page.getByRole("status")).toContainText("人類操作已完成：1 場");
});

test("the old accessible name records a real timeout after the label changes", async ({ page }, testInfo) => {
  await page.goto("/labs/day-02-actuation/index.html?variant=renamed");

  const errorLine = await captureExpectedTimeout(
    page.getByRole("button", { name: "搜尋活動" }),
    "old-accessible-name-timeout.txt",
    testInfo
  );
  console.info(`[預期失敗：accessible name] ${errorLine}`);

  await expect(page.locator(".action-shell")).toHaveCount(0);
  await expect(page.getByRole("status")).toHaveText("尚未搜尋");
  await page.getByRole("button", { name: "探索場次" }).click();
  await expect(page.getByRole("status")).toContainText("人類操作已完成：1 場");
});

test("a direct-child CSS selector breaks after wrapping while the role locator still works", async ({ page }, testInfo) => {
  await page.goto("/labs/day-02-actuation/index.html");
  await page.locator("#search-form > button").click();
  await expect(page.getByRole("status")).toContainText("人類操作已完成：1 場");

  await page.goto("/labs/day-02-actuation/index.html?variant=wrapped");

  const errorLine = await captureExpectedTimeout(
    page.locator("#search-form > button"),
    "direct-child-css-timeout.txt",
    testInfo
  );
  console.info(`[預期失敗：CSS selector] ${errorLine}`);

  await expect(page.getByRole("status")).toHaveText("尚未搜尋");
  await page.getByRole("button", { name: "搜尋活動" }).click();
  await expect(page.getByRole("status")).toContainText("人類操作已完成：1 場");
});
