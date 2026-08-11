import { defineConfig, devices } from "@playwright/test";

const basePath = process.env.PORTFOLIO_BASE_PATH ?? "/Personal-Website";
const origin = process.env.PORTFOLIO_ORIGIN ?? "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `${origin}${basePath}/`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: process.env.PORTFOLIO_SKIP_WEBSERVER ? undefined : {
    command: "npm run build && npm run preview",
    url: `${origin}${basePath}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "chromium-mobile", use: { ...devices["Pixel 5"] } },
    { name: "firefox-desktop", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit-desktop", use: { ...devices["Desktop Safari"] } },
  ],
});
