import { expect, test } from "@playwright/test";

async function dispatchSyntheticAgentSubmission(page: import("@playwright/test").Page) {
  return page.evaluate(async () => {
    const form = document.querySelector("form");
    if (!(form instanceof HTMLFormElement)) throw new Error("找不到搜尋表單");

    let response: Promise<unknown> | undefined;
    const event = new Event("submit", { bubbles: true, cancelable: true });
    Object.defineProperties(event, {
      agentInvoked: { value: true },
      respondWith: { value: (promise: Promise<unknown>) => { response = promise; } }
    });
    form.dispatchEvent(event);
    return response;
  });
}

function firstErrorLine(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.split("\n").find((line) => line.trim().length > 0)?.trim() ?? message;
}

test("the Day 1 baseline locator performs the original search", async ({ page }) => {
  await page.goto("/labs/day-02-actuation/index.html");
  await page.getByRole("button", { name: "搜尋活動" }).click();
  await expect(page.getByRole("status")).toContainText("人類操作已完成：1 場");
});

test("the old accessible-name locator records a real timeout after the UI changes", async ({ page }, testInfo) => {
  await page.goto("/labs/day-02-actuation/index.html?variant=renamed");

  let locatorError: unknown;
  try {
    await page.getByRole("button", { name: "搜尋活動" }).click({ timeout: 500 });
  } catch (error) {
    locatorError = error;
  }

  const errorLine = firstErrorLine(locatorError);
  console.info(`[預期失敗] ${errorLine}`);
  await testInfo.attach("old-locator-timeout.txt", {
    body: Buffer.from(locatorError instanceof Error ? locatorError.message : String(locatorError)),
    contentType: "text/plain"
  });

  expect(errorLine).toContain("Timeout 500ms exceeded");
  await expect(page.getByRole("status")).toHaveText("尚未搜尋");
});

test("the renamed human control still performs the same search", async ({ page }) => {
  await page.goto("/labs/day-02-actuation/index.html?variant=renamed");
  await page.getByRole("button", { name: "探索場次" }).click();
  await expect(page.getByRole("status")).toContainText("人類操作已完成：1 場");
});

test("the Declarative preview still submits after the label and DOM change", async ({ page }) => {
  await page.goto("/labs/day-02-actuation/index.html?variant=renamed");
  const form = page.locator("form");
  await expect(form).toHaveAttribute("toolname", "search_events");
  await expect(form).toHaveAttribute("toolautosubmit", "");

  const result = await dispatchSyntheticAgentSubmission(page);
  expect(result).toMatchObject({ ok: true, count: 1 });
  await expect(page.getByRole("status")).toContainText("E2 synthetic Agent submission（非真實 Agent invocation）：1 場");
});
