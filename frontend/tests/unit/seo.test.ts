import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

it("never indexes Vercel previews even when indexing is enabled", async () => {
  vi.stubEnv("SITE_INDEXABLE", "true");
  vi.stubEnv("VERCEL", "1");
  vi.stubEnv("VERCEL_ENV", "preview");
  vi.stubEnv("SITE_URL", "https://portfolio.example");
  const { default: robots } = await import("../../src/app/robots");
  expect(robots().rules).toEqual([{ userAgent: "*", disallow: "/" }]);
});

it("allows production search bots while separating training access", async () => {
  vi.stubEnv("SITE_INDEXABLE", "true");
  vi.stubEnv("VERCEL", "1");
  vi.stubEnv("VERCEL_ENV", "production");
  vi.stubEnv("SITE_URL", "https://portfolio.example");
  const { default: robots } = await import("../../src/app/robots");
  const rules = robots().rules;
  expect(rules).toContainEqual({ userAgent: ["GPTBot", "ClaudeBot"], disallow: "/" });
  expect(rules).toContainEqual({
    userAgent: ["OAI-SearchBot", "Claude-SearchBot", "Claude-User"],
    allow: "/",
    disallow: "/api/",
  });
  expect(robots().sitemap).toBe("https://portfolio.example/sitemap.xml");
});

it("requires an explicit production canonical origin", async () => {
  vi.stubEnv("VERCEL", "1");
  vi.stubEnv("SITE_URL", "");
  const { siteOrigin, validOrigin } = await import("../../src/lib/config");
  expect(() => siteOrigin()).toThrow("SITE_URL");
  expect(() => validOrigin("ftp://localhost", "origin")).toThrow();
});
