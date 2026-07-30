import { expect, test } from "@playwright/test";

test("my registrations page presents cancellation as a visible consequence", async ({ page }) => {
  await page.goto("/events/evt-webmcp-intro/register");
  await page.getByLabel("姓名").fill("王小明");
  await page.getByLabel("Email（不保存）").fill("reader@example.com");
  await page.getByRole("button", { name: "我確認並送出報名" }).click();
  await expect(page.getByRole("status")).toContainText("報名完成");

  await page.goto("/registrations");
  await expect(page.getByRole("heading", { name: "我的報名" })).toBeVisible();
  await expect(page.getByText("取消前先看清楚後果")).toBeVisible();
  await expect(page.getByText("報名有效")).toBeVisible();

  await page.getByRole("button", { name: "準備取消" }).click();
  const dialog = page.getByRole("dialog", { name: "確認取消報名" });
  await expect(dialog.getByText("Agent 已停下來")).toBeVisible();
  await expect(dialog.getByText("這是最後的人類確認")).toBeVisible();
});

test("preparation opens an accessible dialog and human confirmation performs one cancel POST", async ({ page }) => {
  await page.goto("/events/evt-webmcp-intro/register");
  await page.getByLabel("姓名").fill("王小明");
  await page.getByLabel("Email（不保存）").fill("reader@example.com");
  await page.getByRole("button", { name: "我確認並送出報名" }).click();
  await expect(page.getByRole("status")).toContainText("報名完成");
  let cancelPosts = 0;
  page.on("request", (request) => { if (request.method() === "POST" && request.url().endsWith("/cancel")) cancelPosts += 1; });
  await page.goto("/registrations");
  const trigger = page.getByRole("button", { name: "準備取消" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "確認取消報名" });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("button", { name: "保留報名" })).toBeFocused();
  expect(cancelPosts).toBe(0);
  await page.getByRole("button", { name: "保留報名" }).click();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole("button", { name: "確認取消" }).click();
  await expect.poll(() => cancelPosts).toBe(1);
  await expect(page.getByRole("status")).toContainText("已取消報名");
});
