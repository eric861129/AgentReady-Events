import { expect, test } from "@playwright/test";

test("Journey A: search → details → save keeps one opaque event ID", async ({ page }) => {
  await page.goto("/events");
  await page.getByLabel("地點").selectOption("taipei");
  await page.getByRole("button", { name: "搜尋活動" }).click();
  await page.getByRole("button", { name: "查看詳情" }).click();
  await expect(page).toHaveURL(/\/events\/evt-webmcp-intro$/);
  await page.getByRole("button", { name: "收藏活動" }).click();
  await expect(page.getByRole("status")).toContainText("已收藏");
  await page.getByRole("button", { name: "收藏活動" }).click();
  await expect(page.getByRole("status")).toContainText("沒有重複新增");
  const timeline = page.getByRole("list", { name: "操作紀錄" });
  await expect(timeline).toContainText("search_events");
  await expect(timeline).toContainText("get_event_details");
  await expect(timeline).toContainText("save_event");
  await expect(timeline).toContainText("evt-webmcp-intro");
});

test("Tool execution failure is visible in the minimized activity timeline", async ({ page }) => {
  await page.route("**/api/events?**", async (route) => route.fulfill({
    status: 503,
    contentType: "application/json",
    body: JSON.stringify({ message: "private upstream" })
  }));
  await page.goto("/events");
  await page.evaluate(async () => {
    const event = new Event("submit", { bubbles: true, cancelable: true });
    Object.defineProperties(event, { agentInvoked: { value: true }, respondWith: { value: () => undefined } });
    document.querySelector("form")!.dispatchEvent(event);
  });
  const timeline = page.getByRole("list", { name: "操作紀錄" });
  await expect(timeline).toContainText("agent · search_events · TEMPORARY_FAILURE");
  await expect(timeline).not.toContainText("private upstream");
});

test("Journey B: prepare registration → zero POST → human submit", async ({ page }) => {
  let posts = 0;
  page.on("request", (request) => { if (request.method() === "POST" && request.url().endsWith("/api/registrations")) posts += 1; });
  await page.goto("/events/evt-webmcp-intro/register");
  await page.getByLabel("姓名").fill("王小明");
  await page.getByLabel("Email（不保存）").fill("reader@example.com");
  await page.evaluate(() => {
    const event = new Event("submit", { bubbles: true, cancelable: true });
    Object.defineProperties(event, { agentInvoked: { value: true }, respondWith: { value: () => undefined } });
    document.querySelector("form")!.dispatchEvent(event);
  });
  expect(posts).toBe(0);
  await page.getByRole("button", { name: "我確認並送出報名" }).click();
  await expect.poll(() => posts).toBe(1);
});

test("Journey C: prepare cancellation → zero POST → human confirm", async ({ page }) => {
  await page.goto("/events/evt-webmcp-intro/register");
  await page.getByLabel("姓名").fill("王小明");
  await page.getByLabel("Email（不保存）").fill("reader@example.com");
  await page.getByRole("button", { name: "我確認並送出報名" }).click();
  await expect(page.getByRole("status")).toContainText("報名完成");
  let posts = 0;
  page.on("request", (request) => { if (request.method() === "POST" && request.url().endsWith("/cancel")) posts += 1; });
  await page.goto("/registrations");
  await page.getByRole("button", { name: "準備取消" }).click();
  expect(posts).toBe(0);
  await page.getByRole("button", { name: "確認取消" }).click();
  await expect.poll(() => posts).toBe(1);
});
