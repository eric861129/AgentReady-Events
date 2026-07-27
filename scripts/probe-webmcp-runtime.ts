import { chromium } from "@playwright/test";

type DiscoveredTool = {
  description?: string;
  inputSchema?: unknown;
  name: string;
};

type WebMcpTestingSurface = {
  listTools: () => Promise<DiscoveredTool[]>;
};

type NavigatorWithWebMcp = Navigator & {
  modelContext?: unknown;
  modelContextTesting?: WebMcpTestingSurface;
};

const chromePath = process.env.WEBMCP_CHROME_PATH;
const targetUrl = process.env.WEBMCP_URL;

if (!chromePath || !targetUrl) {
  throw new Error("請設定 WEBMCP_CHROME_PATH 與 WEBMCP_URL，再執行 WebMCP runtime probe。");
}

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: false,
  args: ["--enable-features=WebMCPTesting,DevToolsWebMCPSupport"]
});

try {
  const page = await browser.newPage();
  const response = await page.goto(targetUrl, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(async () => {
    const testing = (navigator as NavigatorWithWebMcp).modelContextTesting;
    return testing !== undefined && (await testing.listTools()).length > 0;
  }, undefined, { timeout: 10_000 });

  const result = await page.evaluate(async () => {
    const browserNavigator = navigator as NavigatorWithWebMcp;
    const testing = browserNavigator.modelContextTesting;
    if (!testing) throw new Error("瀏覽器沒有提供 navigator.modelContextTesting。");

    return {
      isSecureContext: window.isSecureContext,
      navigatorModelContext: typeof browserNavigator.modelContext,
      testingSurface: typeof testing,
      tools: await testing.listTools()
    };
  });

  console.log(JSON.stringify({
    capturedAt: new Date().toISOString(),
    evidenceLevel: "E3",
    limitations: [
      "這是 Chrome testing surface 的 capability discovery，不是真實 Agent discovery 或 invocation。",
      "腳本刻意不執行 Tool；E4 仍須由相容 Agent 實際選擇並呼叫 Tool。"
    ],
    responseStatus: response?.status() ?? null,
    targetUrl,
    ...result
  }, null, 2));
} finally {
  await browser.close();
}
