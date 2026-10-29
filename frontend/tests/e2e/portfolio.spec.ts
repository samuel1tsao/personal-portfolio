import { readFileSync } from "node:fs";
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
    await expect(page.getByRole("heading", { name: "Problem", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Solution", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Impact & accomplishments" })).toBeVisible();
    expect(await page.locator(".decision-card").count()).toBeGreaterThanOrEqual(3);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new RegExp(`/work/${slug}$`),
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(
      (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze())
        .violations,
    ).toEqual([]);
    await page.screenshot({ path: `artifacts/project-${slug}-mobile.png`, fullPage: true });
  });
}

test("project directory separates ML and software engineering projects", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/projects");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Projects");
  await expect(page.getByRole("heading", { name: "Machine learning projects" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Software engineering projects" })).toBeVisible();
  await expect(page.locator(".project-directory article")).toHaveCount(12);
  await expect(
    page
      .locator(".project-directory article h3 a")
      .evaluateAll((links) => links.slice(0, 7).map((link) => link.getAttribute("href"))),
  ).resolves.toEqual([
    "/work/asset-recommendation-engine",
    "/work/fog-density-detection",
    "/work/asr-bias-research",
    "/work/wordrix",
    "/work/2d-detector-benchmark",
    "/work/rag-fact-checking",
    "/work/license-plate-super-resolution",
  ]);
  await expect(page.getByText("Lucra Tournament API Exercise")).toHaveCount(0);
  await expect(page.getByText("StarResonanceDps Localization & Fixes")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(
    (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze()).violations,
  ).toEqual([]);
  await page.screenshot({ path: "artifacts/projects-mobile.png", fullPage: true });
});

test("the previous financial app URL redirects to the combined project", async ({ page }) => {
  await page.goto("/work/financial-analytics-app");
  await expect(page).toHaveURL(/\/work\/asset-recommendation-engine$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Financial Analytics & Asset Recommendation",
  );
});

test("overview lists every role and project without full case studies", async ({ page }) => {
  await page.goto("/resume");
  for (const entry of portfolio.entries.filter(
    (entry: { published: boolean; slug: string }) => entry.published && entry.slug !== "personal",
  )) {
    await expect(page.locator(`article[id="${entry.slug}"]`)).toBeVisible();
  }
  await expect(page.locator(".project-case-study")).toHaveCount(0);
  await expect(page.locator("details")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Read details/ })).toHaveCount(0);
  await expect(page.locator(".resume-accomplishments a")).toHaveCount(0);
  await expect(page.locator("main")).not.toContainText("the resume notes");
  await page.screenshot({ path: "artifacts/resume-overview.png", fullPage: true });
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".overview-nav")).toBeHidden();
});

test("recruiter paths, private backend, metadata and recovery", async ({ page, request }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Samuel Tsao/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Reliable systems");
  await page.goto("/resume");
  await page
    .getByRole("link", { name: "Financial Analytics & Asset Recommendation", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: "My ownership", exact: true })).toBeVisible();
  await expect(page.locator(".story-prose")).toContainText("financial");
  await expect(page.locator("figure")).toHaveCount(0);
  await page.getByRole("link", { name: "Resume & Work", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Resume & Work", exact: true })).toBeVisible();
  expect((await request.get("/api/v1/portfolio")).status()).toBe(404);
  expect((await request.get("/api/v1/entries/asset-recommendation-engine")).status()).toBe(404);
  expect((await request.get("/backend/api/v1/portfolio")).status()).toBe(404);
  const missing = await page.goto("/work/missing-story");
  expect([200, 404]).toContain(missing?.status());
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
  await page.goto("/resume");
  await page
    .getByRole("link", { name: "Financial Analytics & Asset Recommendation", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: "Problem", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "← Resume & Work", exact: true }).click();
  await page.getByRole("link", { name: "Wordrix — Vocabulary Learning", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Problem", exact: true })).toBeVisible();
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

const portfolio = JSON.parse(
  readFileSync(new URL("../../../backend/content/portfolio.json", import.meta.url), "utf8"),
);

for (const width of [320, 1440]) {
  test(`resume shows every recorded technology at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/resume");
    for (const entry of portfolio.entries.filter(
      (item: { published: boolean; slug: string }) => item.published && item.slug !== "personal",
    )) {
      const expected = [
        ...new Set([
          ...entry.technologies,
          ...(entry.work_projects ?? []).flatMap(
            (project: { technologies: string[] }) => project.technologies,
          ),
        ]),
      ];
      await expect(page.locator(`article[id="${entry.slug}"] .resume-technologies`)).toHaveText(
        `Technologies: ${expected.join(" · ")}`,
      );
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.emulateMedia({ media: "print" });
    await expect(page.locator(".resume-technologies").first()).toBeVisible();
  });
}

test("homepage uses profile content and omits decorative copy", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(portfolio.profile.headline);
  for (const text of [
    portfolio.profile.intro,
    portfolio.profile.about,
    ...portfolio.profile.interests,
  ]) {
    await expect(page.locator("main")).toContainText(text);
  }
  await expect(
    page.getByText(
      /ENGINEERING PERSPECTIVE|Real problems\. Deliberate decisions\.|From complexity|01 \/ FOCUS/,
    ),
  ).toHaveCount(0);
});

for (const entry of portfolio.entries.filter((entry: { published: boolean }) => entry.published)) {
  test(`published content is rendered completely: ${entry.slug}`, async ({ page }) => {
    await page.goto(`/${entry.kind === "project" ? "work" : "experience"}/${entry.slug}`);
    const article = page.locator("main > article");
    for (const text of [
      entry.title,
      entry.summary,
      entry.period,
      ...(entry.kind === "project"
        ? [entry.role, entry.contribution, entry.evidence, ...(entry.status ? [entry.status] : [])]
        : [entry.organization, entry.position]),
      ...entry.accomplishments,
      ...entry.additional_accomplishments,
      ...entry.skills,
      ...entry.technologies,
      ...entry.work_projects.flatMap(
        (project: {
          title: string;
          problem: string;
          solution: string;
          impact: string;
          technologies: string[];
          references: { label: string; url: string }[];
        }) => [
          project.title,
          project.problem,
          project.solution,
          project.impact,
          ...project.technologies,
          ...project.references.map((reference) => reference.label),
        ],
      ),
      ...(entry.related_projects ?? []).flatMap((slug: string) => {
        const project = portfolio.entries.find((item: { slug: string }) => item.slug === slug);
        return project ? [project.title, project.summary] : [];
      }),
      ...entry.sections.flatMap((section: { title: string; body: string }) => [
        section.title,
        section.body,
      ]),
      ...(entry.decisions ?? []).flatMap(
        (decision: { title: string; choice: string; rationale: string; tradeoff: string }) =>
          Object.values(decision),
      ),
    ]) {
      await expect(article).toContainText(text);
    }
    for (const link of entry.links) {
      await expect(
        article.getByRole("link", { name: `${link.label} ↗`, exact: true }).first(),
      ).toHaveAttribute("href", new URL(link.url).href);
    }
    for (const project of entry.work_projects) {
      for (const reference of project.references) {
        await expect(
          article.getByRole("link", { name: `${reference.label} ↗`, exact: true }),
        ).toHaveAttribute("href", new URL(reference.url).href);
      }
    }
    await expect(article.locator("figure")).toHaveCount(0);
  });
}

for (const width of [320, 1440]) {
  test(`employer project links, focus and recovery at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/resume");
    const link = page.locator(".overview-projects a").first();
    const href = await link.getAttribute("href");
    await link.click();
    await expect(page).toHaveURL(href!);
    await expect(page.locator(":target")).toBeFocused();
    await expect(page.locator(":target")).toBeInViewport();
    await page.reload();
    await expect(page.locator(":target")).toBeFocused();
    await page.goBack();
    await expect(page).toHaveURL("/resume");
    await expect(page.locator(".overview-projects a").first()).toBeFocused();
    await page.goto(`${href!.split("#")[0]}#outdated-anchor`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.getByRole("link", { name: "← Resume & Work", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Resume & Work" })).toBeVisible();
  });
}

test("deferred chat opens and survives repeated close and reopen", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open chat", exact: true }).click();
  await expect(page.getByText("Chat is currently unavailable")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open chat", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Open chat", exact: true }).click();
  await expect(page.getByText("Chat is currently unavailable")).toBeVisible();
});
