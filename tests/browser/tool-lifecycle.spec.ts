import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(document, "modelContext", {
      configurable: true,
      value: {
        registerTool: async (tool: { name: string }, options?: { signal?: AbortSignal }) => {
          const names = JSON.parse(sessionStorage.getItem("registered") ?? "[]") as string[];
          names.push(tool.name);
          sessionStorage.setItem("registered", JSON.stringify(names));
          const testWindow = window as Window & { __registeredTools?: Record<string, unknown> };
          testWindow.__registeredTools ??= {};
          testWindow.__registeredTools[tool.name] = tool;
          options?.signal?.addEventListener("abort", () => sessionStorage.setItem("aborted", String(Number(sessionStorage.getItem("aborted") ?? 0) + 1)));
        }
      }
    });
  });
});

test("detail registration is disposed when navigation leaves its route", async ({ page }) => {
  await page.goto("/events/evt-webmcp-intro");
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("registered"))).toContain("get_event_details");
  const registeredCount = await page.evaluate(() => (JSON.parse(sessionStorage.getItem("registered") ?? "[]") as string[]).length);
  await page.getByRole("link", { name: "回活動列表" }).click();
  await expect.poll(() => page.evaluate(() => Number(sessionStorage.getItem("aborted") ?? 0))).toBe(registeredCount);
  await expect(page.locator('[toolname="search_events"]')).toHaveCount(1);
});

test("detail Tool reads the route-bound event without an ID", async ({ page }) => {
  await page.goto("/events/evt-webmcp-intro");
  await expect.poll(() => page.evaluate(() => {
    const tools = (window as Window & { __registeredTools?: Record<string, unknown> }).__registeredTools;
    return Boolean(tools?.get_event_details);
  })).toBe(true);
  const result = await page.evaluate(async () => {
    const tools = (window as Window & { __registeredTools?: Record<string, { execute(input: object): Promise<unknown> }> }).__registeredTools;
    const detailsTool = tools?.get_event_details;
    return detailsTool?.execute({});
  });

  expect(result).toMatchObject({
    ok: true,
    data: { event: { id: "evt-webmcp-intro" } },
    uiUpdated: true
  });
  await expect(page.getByRole("list", { name: "操作紀錄" })).toContainText("agent · get_event_details · SUCCESS · evt-webmcp-intro");
});

test("events route supports search, details, and save as one registered Tool journey", async ({ page }) => {
  await page.goto("/events");
  await expect.poll(() => page.evaluate(() => {
    const tools = (window as Window & { __registeredTools?: Record<string, unknown> }).__registeredTools;
    return [Boolean(tools?.get_event_details), Boolean(tools?.save_event)];
  })).toEqual([true, true]);

  await page.getByLabel("地點").selectOption("taipei");
  await page.getByLabel("費用").selectOption("free");
  await page.getByLabel("程度").selectOption("beginner");
  const searchResult = await page.evaluate(async () => {
    const form = document.querySelector<HTMLFormElement>("#event-search")!;
    let response: Promise<unknown> | undefined;
    const event = new Event("submit", { bubbles: true, cancelable: true });
    Object.defineProperties(event, {
      agentInvoked: { value: true },
      respondWith: { value: (promise: Promise<unknown>) => { response = promise; } }
    });
    form.dispatchEvent(event);
    return response;
  }) as { events: Array<{ id: string }> };
  const eventId = searchResult.events[0]?.id;
  expect(eventId).toBe("evt-webmcp-intro");

  const detailsResult = await page.evaluate(async (id) => {
    const tools = (window as Window & {
      __registeredTools?: Record<string, { execute(input: object): Promise<unknown> }>;
    }).__registeredTools;
    return tools?.get_event_details?.execute({ event_id: id });
  }, eventId);
  expect(detailsResult).toMatchObject({ ok: true, data: { event: { id: eventId } }, uiUpdated: true });
  await expect(page.locator("#journey-event-detail")).toContainText("WebMCP 入門工作坊");

  const saveResult = await page.evaluate(async (id) => {
    const tools = (window as Window & {
      __registeredTools?: Record<string, { execute(input: object): Promise<unknown> }>;
    }).__registeredTools;
    return tools?.save_event?.execute({ event_id: id });
  }, eventId);
  expect(saveResult).toMatchObject({ ok: true, data: { eventId }, uiUpdated: true });
  await expect(page.locator("#journey-saved-status")).toContainText("已收藏");
});
