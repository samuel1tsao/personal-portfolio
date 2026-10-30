import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { splitProjects } from "../../src/lib/projects";
import { portfolioSchema, impactSchema } from "../../src/lib/schema";

const source = JSON.parse(
  readFileSync(new URL("../../../backend/content/portfolio.json", import.meta.url), "utf8"),
);
const portfolio = portfolioSchema.parse({
  ...source,
  content_revision: "a".repeat(64),
});

it("features Personal Portfolio first in ML", () => {
  const groups = splitProjects(portfolio);
  expect(groups.machineLearning[0].project_id).toBe("personal-portfolio");
  expect(
    groups.softwareEngineering.some((entry) => entry.project_id === "personal-portfolio"),
  ).toBe(false);
  const projects = [...groups.machineLearning, ...groups.softwareEngineering];
  expect(new Set(projects.map((entry) => entry.project_id)).size).toBe(projects.length);
});

it("keeps curated one-line summaries separate from full descriptions", () => {
  const allProjects = [
    ...portfolio.work_experience.flatMap((e) => e.projects),
    ...portfolio.personal_experience.flatMap((e) => e.projects),
  ];
  const project = allProjects.find((p) => p.project_id === "personal-portfolio")!;
  expect(project.impacts[0].one_line_summary).toContain("agentic chat");
  expect(project.impacts[0].full_description).toBeDefined();

  expect(
    impactSchema.safeParse({
      id: "test-impact",
      one_line_summary: "Short outcome",
      full_description: "Detailed description",
    }).success,
  ).toBe(true);
});
