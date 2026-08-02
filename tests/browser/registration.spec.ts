import { expect, test } from "@playwright/test";

test("registration page makes the Agent and human boundary unmistakable", async ({ page }) => {
  await page.goto("/events/evt-webmcp-intro/register");

  await expect(page.getByRole("heading", { name: "報名 WebMCP 入門工作坊" })).toBeVisible();
  await expect(page.getByText("Agent 可以準備資料")).toBeVisible();
  await expect(page.getByText("送出後會建立一筆正式報名")).toBeVisible();
  await expect(page.getByText("Email 只用於這次 Demo 驗證，不會保存")).toBeVisible();
  await expect(page.getByRole("button", { name: "我確認並送出報名" })).toBeVisible();
});

test("Declarative Agent preparation completes through autosubmit with zero registration POST", async ({ page }) => {
  let posts = 0;
  page.on("request", (request) => { if (request.method() === "POST" && request.url().endsWith("/api/registrations")) posts += 1; });
  await page.goto("/events/evt-webmcp-intro/register");
  const form = page.locator("form");
  await expect(form).toHaveAttribute("toolname", "prepare_event_registration");
  await expect(form).toHaveAttribute("toolautosubmit", "");
  await page.getByLabel("姓名").fill("王小明");
  await page.getByLabel("Email（不保存）").fill("reader@example.com");
  const agentResult = await page.evaluate(async () => {
    const target = document.querySelector("form")!;
    let result: unknown;
    const event = new Event("submit", { bubbles: true, cancelable: true });
    Object.defineProperties(event, {
      agentInvoked: { value: true },
      respondWith: { value: async (promise: Promise<unknown>) => { result = await promise; } }
    });
    target.dispatchEvent(event);
    await new Promise((resolve) => setTimeout(resolve, 0));
    return result;
  });
  expect(agentResult).toMatchObject({ code: "CONFIRMATION_REQUIRED" });
  expect(posts).toBe(0);
  await page.getByRole("button", { name: "我確認並送出報名" }).click();
  await expect.poll(() => posts).toBe(1);
  await expect(page.getByRole("status")).toContainText("報名完成");
});

test("direct registration route removes the form when the server reports registration closed", async ({ page }) => {
  await page.route("**/api/events/evt-webmcp-intro", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        event: {
          id: "evt-webmcp-intro",
          title: "WebMCP 入門工作坊",
          summary: "從語意 HTML 到第一個網站 Tool。",
          startsAt: "2027-01-23T10:00:00+08:00",
          endsAt: "2027-01-23T12:00:00+08:00",
          location: "taipei",
          venue: "台北前端共學空間",
          price: "free",
          level: "beginner",
          remainingCapacity: 8,
          registrationDeadline: "2027-01-21T23:59:59+08:00",
          state: "closed"
        }
      })
    });
  });

  await page.goto("/events/evt-webmcp-intro/register");
  await expect(page.getByRole("heading", { name: "目前無法報名" })).toBeVisible();
  await expect(page.locator("#registration-form")).toHaveCount(0);
});
