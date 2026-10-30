import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { splitProjects } from "../../src/lib/projects";
import { portfolioEntrySchema } from "../../src/lib/schema";

const source = JSON.parse(
  readFileSync(new URL("../../../backend/content/portfolio.json", import.meta.url), "utf8"),
);
const entries = source.entries.map((entry: unknown) => portfolioEntrySchema.parse(entry));

it("features Personal Portfolio first in ML regardless of source order", () => {
  const groups = splitProjects([...entries].reverse());
  expect(groups.machineLearning[0].slug).toBe("personal-portfolio");
  expect(groups.softwareEngineering.some((entry) => entry.slug === "personal-portfolio")).toBe(
    false,
  );
  const projects = [...groups.machineLearning, ...groups.softwareEngineering];
  expect(new Set(projects.map((entry) => entry.slug)).size).toBe(projects.length);
  expect(projects).toHaveLength(
    entries.filter((entry: { kind: string }) => entry.kind === "project").length,
  );
});

it("keeps curated highlights separate from complete accomplishments", () => {
  const entry = entries.find((entry: { slug: string }) => entry.slug === "personal-portfolio")!;
  expect(entry.highlights[0]).toContain("agentic chat");
  expect(entry.highlights.join(" ")).not.toContain("transfer budget");
  expect(entry.accomplishments.join(" ")).toContain("transfer budget");
  expect(
    portfolioEntrySchema.safeParse({ ...entry, highlights: Array(4).fill("Outcome") }).success,
  ).toBe(false);
  const legacy = { ...entry };
  Reflect.deleteProperty(legacy, "highlights");
  expect(portfolioEntrySchema.parse(legacy).highlights).toEqual([]);
});
