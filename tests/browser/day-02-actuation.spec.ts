import { expect, test } from "@playwright/test";

async function dispatchSyntheticAgentSubmission(page: import("@playwright/test").Page) {
  return page.evaluate(async () => {
    const form = document.querySelector("form")!;
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

test("the original accessible-name locator performs the search", async ({ page }) => {
  await page.goto("/labs/day-02-actuation/index.html");
  await page.getByRole("button", { name: "搜尋活動" }).click();
  await expect(page.getByRole("status")).toContainText("人類操作已完成");
});

test("copy-coupled actuation fails after the visible label changes", async ({ page }) => {
  await page.goto("/labs/day-02-actuation/index.html?variant=renamed");
  await expect(page.getByRole("button", { name: "搜尋活動" })).toHaveCount(0);
  await expect(page.locator('[data-action="search-events"]')).toHaveCount(0);
  await expect(page.locator('[data-action="explore-events"]')).toHaveCount(1);
  await expect(page.getByText("尚未搜尋")).toBeVisible();
});

test("the renamed human control still performs the search", async ({ page }) => {
  await page.goto("/labs/day-02-actuation/index.html?variant=renamed");
  await page.getByRole("button", { name: "探索場次" }).click();
  await expect(page.getByRole("status")).toContainText("人類操作已完成");
});

test("the Declarative contract still submits after the label and DOM change", async ({ page }) => {
  await page.goto("/labs/day-02-actuation/index.html?variant=renamed");
  const form = page.locator("form");
  await expect(form).toHaveAttribute("toolname", "search_events");
  await expect(form).toHaveAttribute("toolautosubmit", "");
  const result = await dispatchSyntheticAgentSubmission(page);
  expect(result).toMatchObject({ ok: true, count: 1 });
  await expect(page.getByRole("status")).toContainText("E2 synthetic Agent submission");
});
