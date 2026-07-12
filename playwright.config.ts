import { defineConfig } from "@playwright/test";

const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "tests/browser",
  use: { baseURL: externalBaseUrl ?? "http://127.0.0.1:5173" },
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
