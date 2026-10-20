import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchPortfolio } from "../../src/lib/api";
import { validOrigin } from "../../src/lib/config";
import { safeJsonLd } from "../../src/lib/seo";

const fixture = JSON.parse(
  readFileSync(new URL("../../../backend/content/portfolio.json", import.meta.url), "utf8"),
);
const content = {
  ...fixture,
  content_revision: createHash("sha256").update("fixture").digest("hex"),
  profile: {
    ...fixture.profile,
    roles: fixture.profile.roles.map((role: object) => ({ end: null, ...role })),
  },
  stories: fixture.stories.map((story: object) => ({ diagram: [], links: [], ...story })),
};
const success = () => new Response(JSON.stringify(content));
afterEach(() => vi.unstubAllEnvs());

describe("content contract", () => {
  it("accepts a valid response and safe metadata", async () => {
    const fetcher = vi.fn().mockResolvedValue(success());
    expect((await fetchPortfolio(fetcher)).profile.name).toBe("Samuel Tsao");
    expect(fetcher.mock.calls[0][1]).toMatchObject({ cache: "no-store", redirect: "error" });
    expect(safeJsonLd({ text: "</script>" })).not.toContain("</script>");
  });
  it("recovers once from a timeout", async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new Error("timeout"))
      .mockResolvedValue(success());
    expect((await fetchPortfolio(fetcher)).stories).toHaveLength(3);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it.each(["revision", "schema", "partial", "oversized", "unavailable", "draft"])(
    "rejects %s",
    async (caseName) => {
      const body = structuredClone(content);
      if (caseName === "revision") vi.stubEnv("CONTENT_REVISION", "incorrect");
      if (caseName === "schema") body.schema_version = "2";
      if (caseName === "partial") body.profile = {};
      if (caseName === "draft") body.stories[0].published = false;
      const raw = caseName === "oversized" ? "x".repeat(200001) : JSON.stringify(body);
      const fetcher = vi
        .fn()
        .mockImplementation(() =>
          Promise.resolve(new Response(raw, { status: caseName === "unavailable" ? 503 : 200 })),
        );
      await expect(fetchPortfolio(fetcher)).rejects.toThrow("deployment stopped");
      expect(fetcher).toHaveBeenCalledTimes(2);
    },
  );
  it("keeps preview bypass credentials on the server request", async () => {
    vi.stubEnv("CONTENT_API_BYPASS_SECRET", "private-test");
    const fetcher = vi.fn().mockResolvedValue(success());
    const result = await fetchPortfolio(fetcher);
    expect(fetcher.mock.calls[0][1].headers["x-vercel-protection-bypass"]).toBe("private-test");
    expect(JSON.stringify(result)).not.toContain("private-test");
  });
  it.each(["http://example.com", "https://user:pass@example.com", "https://example.com/path"])(
    "rejects unsafe origin %s",
    (value) => {
      expect(() => validOrigin(value, "origin")).toThrow();
    },
  );
});
