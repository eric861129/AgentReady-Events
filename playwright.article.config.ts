import { defineConfig } from "@playwright/test";

const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "tests/evidence",
  outputDir: "evidence/article-screenshots/.playwright",
  fullyParallel: false,
  workers: 1,
  reporter: "line",
  use: {
    baseURL: externalBaseUrl ?? "http://127.0.0.1:5173",
    colorScheme: "light",
    locale: "zh-TW",
    screenshot: "off",
    trace: "off",
    viewport: { width: 1440, height: 900 }
  },
  ...(externalBaseUrl
    ? {}
    : {
        webServer: [
          {
            command: "npm run dev:api",
            url: "http://127.0.0.1:3000/health/live",
            reuseExistingServer: !process.env.CI
          },
          {
            command: "npm run dev:web",
            url: "http://127.0.0.1:5173",
            reuseExistingServer: !process.env.CI
          }
        ]
      })
});
