import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/browser",
  use: { baseURL: "http://127.0.0.1:5173" },
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
});
