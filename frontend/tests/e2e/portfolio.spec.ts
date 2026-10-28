import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const VIEWPORTS = [320, 768, 1440];
const STORY_PATH = "/work/asset-recommendation-engine";
const JS_BUDGET = 150 * 1024;

const PROJECT_SLUGS = [
  "asset-recommendation-engine",
  "fog-density-detection",
  "trajectory-financial-planning",
  "mtg-vault",
  "wordrix",
  "foundation-website",
  "personal-portfolio",
];

for (const slug of PROJECT_SLUGS) {
  test(`resume links to a detailed accessible case study: ${slug}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto("/resume");
    await page.locator(`main a[href="/work/${slug}"]`).first().click();
    await expect(page).toHaveURL(`/work/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Design choices & tradeoffs" })).toBeVisible();
    expect(await page.locator(".decision-card").count()).toBeGreaterThanOrEqual(3);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new RegExp(`/work/${slug}$`),
    );
    await page.getByRole("link", { name: "Design choices & tradeoffs", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/work/${slug}#decisions$`));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(
      (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze())
        .violations,
    ).toEqual([]);
    await page.screenshot({ path: `artifacts/project-${slug}-mobile.png`, fullPage: true });
    if (slug !== "asset-recommendation-engine") {
      await expect(page.locator("figcaption")).not.toContainText("asset recommendation research");
    }
  });
}

test("project directory contains all personal projects", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/projects");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("From problem to product.");
  await expect(page.locator(".project-directory article")).toHaveCount(12);
  await expect(
    page.getByText(/Lucra Tournament API Exercise|StarResonanceDps Localization & Fixes/),
  ).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(
    (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()).violations,
  ).toEqual([]);
  await page.screenshot({ path: "artifacts/projects-mobile.png", fullPage: true });
});

test("expanded resume presents accomplishments and projects on mobile and in print", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/resume");
  await expect(page.getByRole("heading", { name: "Projects & applied research" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Wordrix/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /LLM Evaluator/ })).toBeVisible();
  await expect(page.getByText(/100,000 dividends/)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(
    (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()).violations,
  ).toEqual([]);
  await page.screenshot({ path: "artifacts/resume-mobile.png", fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: "artifacts/resume-desktop.png", fullPage: true });
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".resume-note")).toBeHidden();
  await expect(page.getByRole("heading", { name: /Trajectory/ })).toBeVisible();
  await page.pdf({ path: "artifacts/resume-print.pdf", format: "A4" });
});

test("recruiter paths, private backend, metadata and recovery", async ({ page, request }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Samuel Tsao/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Reliable systems");
  await page
    .getByRole("link", { name: "Recommendations with a longer horizon", exact: true })
    .click();
  await expect(page.getByText("My contribution", { exact: true })).toBeVisible();
  await expect(page.getByText("Architected Transformer-based models")).toBeVisible();
  await expect(page.locator("figure")).toBeVisible();
  await page.getByRole("link", { name: "Resume", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Samuel Tsao", exact: true })).toBeVisible();
  expect((await request.get("/api/v1/portfolio")).status()).toBe(404);
  expect((await request.get("/api/v1/entries/asset-recommendation-engine")).status()).toBe(404);
  expect((await request.get("/backend/api/v1/portfolio")).status()).toBe(404);
  const missing = await page.goto("/work/missing-story");
  expect(missing?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "This page isn’t here." })).toBeVisible();
  await expect(page.locator('meta[name="robots"][content="noindex"]')).toHaveCount(1);
  await page.getByRole("link", { name: "Back to home" }).click();
  await expect(page).toHaveURL("/");
  const html = await (await request.get("/")).text();
  expect(html).toContain("application/ld+json");
  expect(html).toContain('rel="canonical"');
  expect(html).not.toContain("AI_GATEWAY_API_KEY");
});

for (const width of VIEWPORTS) {
  test(`responsive and accessible at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    await page.screenshot({ path: `artifacts/home-${width}.png`, fullPage: true });
    await page.goto(STORY_PATH);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const storyResults = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(storyResults.violations).toEqual([]);
  });
}

test("clipboard failure retains contact recovery", async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new Error("denied")) },
    }),
  );
  await page.goto("/#connect");
  await page.getByRole("button", { name: "Copy email" }).click();
  await expect(page.getByRole("status")).toContainText("Select this address");
  await expect(page.getByRole("link", { name: /tsao1samuel@gmail.com/ })).toHaveAttribute(
    "href",
    "mailto:tsao1samuel@gmail.com",
  );
});

test("chat page keeps direct-contact fallback accessible while disabled", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/chat");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Ask me about what I’m building.",
  );
  await expect(page.getByText("Chat is currently unavailable")).toBeVisible();
  await expect(page.getByLabel("Your question")).toBeDisabled();
  await expect(page.getByRole("button", { name: "Send" })).toBeDisabled();
  await expect(page.getByRole("link", { name: /tsao1samuel@gmail.com/ })).toHaveAttribute(
    "href",
    "mailto:tsao1samuel@gmail.com",
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(
    (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze())
      .violations,
  ).toEqual([]);
});

test("copy success, keyboard focus, reduced motion and zoom", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.getByRole("button", { name: "Copy email" }).click();
  await expect(page.getByRole("status")).toHaveText("Email copied.");
  await page.setViewportSize({ width: 640, height: 450 });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("core paths work without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await page.goto("/");
  await page
    .getByRole("link", { name: "Recommendations with a longer horizon", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: "The problem" })).toBeVisible();
  await page.getByRole("link", { name: "← All projects", exact: true }).click();
  await page.getByRole("link", { name: "Wordrix — Vocabulary Learning", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Design choices & tradeoffs" })).toBeVisible();
  await context.close();
});

test("20 simultaneous server-rendered pages retain profile content", async ({ request }) => {
  const responses = await Promise.all(Array.from({ length: 20 }, () => request.get("/")));
  expect(responses.every((response) => response.status() === 200)).toBe(true);
  const bodies = await Promise.all(responses.map((response) => response.text()));
  expect(
    bodies.every((body) => body.includes("Samuel Tsao") && body.includes("application/ld+json")),
  ).toBe(true);
});

test("initial JavaScript transfer stays within budget", async ({ page }) => {
  await page.goto("/");
  const scripts = await page
    .locator("script[src]:not([nomodule])")
    .evaluateAll((nodes) => nodes.map((node) => (node as HTMLScriptElement).src));
  let bytes = 0;
  for (const url of scripts) {
    const response = await page.request.get(url);
    const { gzipSync } = await import("node:zlib");
    bytes += gzipSync(await response.body()).byteLength;
  }
  expect(bytes).toBeLessThanOrEqual(JS_BUDGET);
});
