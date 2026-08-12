import { defineConfig, devices } from "@playwright/test";
import { productionBasePath } from "./config/site";

const origin = process.env.PORTFOLIO_ORIGIN ?? "http://127.0.0.1:3000";
const webServer = {
  command: "npm run preview",
  url: `${origin}${productionBasePath}/`,
  reuseExistingServer: !process.env.CI,
  timeout: 30_000,
};

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  ...(process.env.CI ? { workers: 2 } : {}),
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `${origin}${productionBasePath}/`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  ...(process.env.PORTFOLIO_SKIP_WEBSERVER ? {} : { webServer }),
  projects: [
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "chromium-mobile", use: { ...devices["Pixel 5"] } },
    { name: "firefox-desktop", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit-desktop", use: { ...devices["Desktop Safari"] } },
  ],
});
