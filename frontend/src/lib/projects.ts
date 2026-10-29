import type { PortfolioEntry } from "./schema";

const ML_PROJECT_SLUGS = new Set([
  "asset-recommendation-engine",
  "fog-density-detection",
  "asr-bias-research",
  "wordrix",
  "2d-detector-benchmark",
  "rag-fact-checking",
  "license-plate-super-resolution",
]);

export function professionalRoles(entries: PortfolioEntry[]) {
  return entries.filter((entry) => entry.kind === "experience" && entry.slug !== "personal");
}

export function splitProjects(entries: PortfolioEntry[]) {
  const projects = entries.filter((entry) => entry.kind === "project");
  return {
    machineLearning: projects.filter((project) => ML_PROJECT_SLUGS.has(project.slug)),
    softwareEngineering: projects.filter((project) => !ML_PROJECT_SLUGS.has(project.slug)),
  };
}
