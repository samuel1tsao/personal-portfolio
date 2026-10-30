import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getPortfolio } from "@/lib/api";
import { siteOrigin, isIndexable } from "@/lib/config";
import { allProjects, allExperiences } from "@/lib/projects";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  if (!isIndexable) return [];
  const data = await getPortfolio();
  const projectPaths = allProjects(data).map((p) => `/work/${p.project_id}`);
  const expPaths = allExperiences(data).map((e) => `/experience/${e.experience_id}`);

  return ["/", "/resume", "/projects", "/chat", ...projectPaths, ...expPaths].map((path) => ({
    url: `${siteOrigin()}${path}`,
    lastModified: data.updated,
  }));
}
