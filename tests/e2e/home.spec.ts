import { expect, test } from "@playwright/test";

test("首頁可搜尋活動並同步 URL 狀態", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "找下一場值得參加的開發者活動" })).toBeVisible();

  await page.getByLabel("關鍵字").fill("前端");
  await page.getByLabel("地點").selectOption("taipei");
  await page.getByRole("button", { name: "搜尋活動" }).click();

  await expect(page).toHaveURL(/query=.*%E5%89%8D%E7%AB%AF/);
  await expect(page).toHaveURL(/location=taipei/);
  await expect(
    page.getByLabel("活動搜尋結果").getByRole("heading", { name: "台北前端可及性實作工作坊" })
  ).toBeVisible();
});

test("搜尋表單具備 search_events declarative tool identity", async ({ page }) => {
  await page.goto("/");
  const form = page.locator("#search-form");

  await expect(form).toHaveAttribute("toolname", "search_events");
  await expect(form).toHaveAttribute(
    "tooldescription",
    "依關鍵字、日期、地點、費用、類別與難度搜尋目前公開活動，並更新活動列表。使用者想找活動或縮小活動範圍時使用。"
  );
});

test("診斷頁顯示 search_events schema 與欄位描述", async ({ page }) => {
  await page.goto("/#/diagnostics");

  await expect(page.getByRole("heading", { name: "WebMCP 狀態" })).toBeVisible();
  await expect(page.getByText("document.modelContext")).toBeVisible();
  await expect(page.getByText("\"name\": \"query\"")).toBeVisible();
  await expect(page.getByText("活動標題、摘要、場地或主題關鍵字。")).toBeVisible();
});
