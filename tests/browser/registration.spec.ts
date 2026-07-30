import { expect, test } from "@playwright/test";

test("registration page makes the Agent and human boundary unmistakable", async ({ page }) => {
  await page.goto("/events/evt-webmcp-intro/register");

  await expect(page.getByRole("heading", { name: "報名 WebMCP 入門工作坊" })).toBeVisible();
  await expect(page.getByText("Agent 可以準備資料")).toBeVisible();
  await expect(page.getByText("送出後會建立一筆正式報名")).toBeVisible();
  await expect(page.getByText("Email 只用於這次 Demo 驗證，不會保存")).toBeVisible();
  await expect(page.getByRole("button", { name: "我確認並送出報名" })).toBeVisible();
});

test("Agent-like preparation causes zero POST and human confirmation creates one registration", async ({ page }) => {
  let posts = 0;
  page.on("request", (request) => { if (request.method() === "POST" && request.url().endsWith("/api/registrations")) posts += 1; });
  await page.goto("/events/evt-webmcp-intro/register");
  const form = page.locator("form");
  await expect(form).toHaveAttribute("toolname", "prepare_event_registration");
  await expect(form).not.toHaveAttribute("toolautosubmit", /.*/);
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
