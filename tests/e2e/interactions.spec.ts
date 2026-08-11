import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("keyboard entry begins with the skip link", async ({ page }) => {
  await page.goto("./");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeVisible();
});

test("mobile menu manages focus and closes with Escape", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile navigation behavior");
  await page.goto("./");
  const button = page.getByRole("button", { name: "Open navigation menu" });
  await button.click();
  await expect(page.getByRole("button", { name: "Close navigation menu" })).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("navigation", { name: "Mobile primary" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Mobile primary" }).getByRole("link").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open navigation menu" })).toBeFocused();
  await expect(page.getByRole("navigation", { name: "Mobile primary" })).toBeHidden();
});

test("theme choice persists across client navigation", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("button", { name: /Theme: system/ }).click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await page.getByRole("link", { name: "Projects", exact: true }).first().click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await expect(page.getByRole("button", { name: /Theme: light/ })).toBeVisible();
});

test("desktop résumé timeline tracks its active entry and links to related work", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop career index behavior");
  await page.goto("./resume/");

  const timeline = page.getByRole("navigation", { name: "Career timeline" });
  const lonardiLink = timeline.getByRole("link", { name: /Lonardi Lab/ });
  await lonardiLink.click();
  await expect(page).toHaveURL(/#experience-lonardi-lab$/);
  await expect(lonardiLink).toHaveAttribute("aria-current", "location");
  await expect(page.locator("#experience-lonardi-lab")).toBeInViewport();
  await expect(page.locator("#experience-lonardi-lab").getByRole("link", { name: "Explore MTP Lite research" }))
    .toHaveAttribute("href", /\/research\/optimal-read-selection\/$/);

  await page.locator("#experience-hastest").evaluate((element) => element.scrollIntoView({ block: "center" }));
  await expect(timeline.getByRole("link", { name: /Hastest/ })).toHaveAttribute("aria-current", "location");
});

test("mobile résumé timeline keeps the current role visible while scrolling", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile career status behavior");
  await page.goto("./resume/");
  await page.locator("#experience-sadredini-lab").evaluate((element) => element.scrollIntoView({ block: "center" }));
  await expect(page.locator('[data-active-timeline-label="sadredini-lab"]')).toBeVisible();
});

test("résumé remains complete in print and reduced-motion modes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./resume/");
  const transitionDuration = await page.locator("#experience-brisk-lab .resume-timeline-card")
    .evaluate((element) => Number.parseFloat(getComputedStyle(element).transitionDuration));
  expect(transitionDuration).toBeLessThan(0.001);

  await page.emulateMedia({ media: "print", reducedMotion: "reduce" });
  await expect(page.getByRole("navigation", { name: "Career timeline" })).toBeHidden();
  await expect(page.locator("[data-experience-id]")).toHaveCount(4);
  await expect(page.getByText(/Researched and documented an Intel Simics/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Genome Assembly Optimization Using k-mer-Based Read Selection" })).toBeVisible();
});

test("résumé remains accessible in the dark theme", async ({ page }) => {
  await page.goto("./resume/");
  await page.getByRole("button", { name: /Theme: system/ }).click();
  await page.getByRole("button", { name: /Theme: light/ }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical")).toEqual([]);
});

for (const route of ["./", "./projects/12v-to-3v3-buck-converter/", "./resume/"]) {
  test(`${route} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical")).toEqual([]);
  });
}
