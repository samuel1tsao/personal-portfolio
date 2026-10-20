import { defineConfig } from "@playwright/test";

const FRONTEND_URL = "http://127.0.0.1:3000";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  use: { baseURL: FRONTEND_URL, trace: "retain-on-failure" },
  webServer: {
    command: "node node_modules/next/dist/bin/next start --hostname 127.0.0.1",
    url: FRONTEND_URL,
    reuseExistingServer: !process.env.CI,
  },
});
