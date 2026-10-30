import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:8889";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node tests/support/static-server.js",
    url: `${baseURL}/tests/harness/harness.html`,
    reuseExistingServer: !process.env.CI,
  },
});
