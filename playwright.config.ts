import { defineConfig } from "@playwright/test";

const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL;
const apiPort = process.env.PLAYWRIGHT_API_PORT ?? "3000";
const webPort = process.env.PLAYWRIGHT_WEB_PORT ?? "5173";
const localBaseUrl = `http://127.0.0.1:${webPort}`;

export default defineConfig({
  testDir: "tests/browser",
  use: { baseURL: externalBaseUrl ?? localBaseUrl },
  ...(externalBaseUrl
    ? {}
    : {
        webServer: [
        {
          command: "npm run dev:api",
          url: `http://127.0.0.1:${apiPort}/health/live`,
          env: { ...process.env, PORT: apiPort },
          reuseExistingServer: !process.env.CI && apiPort === "3000"
        },
        {
          command: `npm run dev:web -- --port ${webPort}`,
          url: localBaseUrl,
          env: {
            ...process.env,
            API_PROXY_TARGET: `http://127.0.0.1:${apiPort}`
          },
          reuseExistingServer: !process.env.CI && webPort === "5173"
        }
        ]
      })
});
