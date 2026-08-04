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

test("visible evaluation control expires the current session before cancellation preparation", async ({ page }) => {
  test.skip(
    Boolean(process.env.PLAYWRIGHT_BASE_URL) && process.env.ENABLE_EVALUATION_FIXTURES !== "true",
    "外部部署必須明確啟用受控 evaluation fixture。"
  );
  await page.addInitScript(() => {
    Object.defineProperty(document, "modelContext", {
      configurable: true,
      value: {
        registerTool: async (tool: { name: string }, _options?: { signal?: AbortSignal }) => {
          const testWindow = window as Window & { __registeredTools?: Record<string, unknown> };
          testWindow.__registeredTools ??= {};
          testWindow.__registeredTools[tool.name] = tool;
        }
      }
    });
  });
  await page.route(/\/api\/registrations$/, async (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({
      registrations: [{
        id: "reg-expiry-fixture",
        eventId: "evt-webmcp-intro",
        eventTitle: "WebMCP 入門工作坊",
        startsAt: "2027-01-23T10:00:00+08:00",
        attendeeName: "工作階段測試讀者",
        status: "active"
      }]
    })
  }));
  await page.goto("/registrations");
  const registrationId = (await page.locator(".registration-item code").textContent())!.trim();
  await expect.poll(() => page.evaluate(() => {
    const tools = (window as Window & { __registeredTools?: Record<string, unknown> }).__registeredTools;
    return Boolean(tools?.prepare_registration_cancellation);
  })).toBe(true);

  let cancelPosts = 0;
  page.on("request", (request) => {
    if (request.method() === "POST" && request.url().endsWith("/cancel")) cancelPosts += 1;
  });
  const evaluationControls = page.getByRole("region", { name: "受控測試工具" });
  await expect(evaluationControls).toBeVisible();
  await evaluationControls.getByRole("button", { name: "讓目前工作階段過期" }).click();
  await expect(evaluationControls.getByRole("status")).toContainText("SESSION_EXPIRED 已建立");

  const result = await page.evaluate(async (id) => {
    const tools = (window as Window & {
      __registeredTools?: Record<string, { execute(input: object): Promise<unknown> }>;
    }).__registeredTools;
    return tools?.prepare_registration_cancellation?.execute({ registration_id: id });
  }, registrationId);

  expect(result).toMatchObject({
    ok: false,
    code: "UNAUTHORIZED",
    reason: "SESSION_EXPIRED",
    retryable: false,
    uiUpdated: false
  });
  await expect(page.getByRole("dialog", { name: "確認取消報名" })).toBeHidden();
  expect(cancelPosts).toBe(0);
  await expect(page.getByText("報名有效")).toBeVisible();
});

test("one visible active registration lets the Tool omit the opaque ID and still stop before cancellation", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(document, "modelContext", {
      configurable: true,
      value: {
        registerTool: async (tool: { name: string }, _options?: { signal?: AbortSignal }) => {
          const testWindow = window as Window & { __registeredTools?: Record<string, unknown> };
          testWindow.__registeredTools ??= {};
          testWindow.__registeredTools[tool.name] = tool;
        }
      }
    });
  });
  await page.route(/\/api\/registrations$/, async (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({
      registrations: [{
        id: "reg-route-bound",
        eventId: "evt-webmcp-intro",
        eventTitle: "WebMCP 入門工作坊",
        startsAt: "2027-01-23T10:00:00+08:00",
        attendeeName: "測試讀者",
        status: "active"
      }]
    })
  }));
  await page.route("**/api/registrations/reg-route-bound/cancellation-summary", async (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({
      summary: {
        registrationId: "reg-route-bound",
        eventId: "evt-webmcp-intro",
        eventTitle: "WebMCP 入門工作坊",
        startsAt: "2027-01-23T10:00:00+08:00",
        effect: "取消後會釋出名額；本 Demo 不會寄送通知。"
      }
    })
  }));
  await page.goto("/registrations");
  await expect.poll(() => page.evaluate(() => {
    const tools = (window as Window & { __registeredTools?: Record<string, unknown> }).__registeredTools;
    return Boolean(tools?.prepare_registration_cancellation);
  })).toBe(true);

  let cancelPosts = 0;
  page.on("request", (request) => {
    if (request.method() === "POST" && request.url().endsWith("/cancel")) cancelPosts += 1;
  });
  const result = await page.evaluate(async () => {
    const tools = (window as Window & {
      __registeredTools?: Record<string, { execute(input: object): Promise<unknown> }>;
    }).__registeredTools;
    return tools?.prepare_registration_cancellation?.execute({});
  });

  expect(result).toMatchObject({
    code: "CONFIRMATION_REQUIRED",
    summary: { registrationId: "reg-route-bound" },
    uiUpdated: true
  });
  await expect(page.getByRole("dialog", { name: "確認取消報名" })).toBeVisible();
  await expect(page.getByRole("button", { name: "保留報名" })).toBeFocused();
  expect(cancelPosts).toBe(0);
});
