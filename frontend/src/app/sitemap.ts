import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getPortfolio } from "@/lib/api";
import { siteOrigin, isIndexable } from "@/lib/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  if (!isIndexable) return [];
  const data = await getPortfolio();
  return [
    "/",
    "/resume",
    "/projects",
    "/chat",
    ...data.entries.map(
      (entry) => `/${entry.kind === "project" ? "work" : "experience"}/${entry.slug}`,
    ),
  ].map((path) => ({ url: `${siteOrigin()}${path}`, lastModified: data.updated }));
}
