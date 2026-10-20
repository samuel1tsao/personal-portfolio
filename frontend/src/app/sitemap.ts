import type { MetadataRoute } from "next";
import { getPortfolio } from "@/lib/api";
import { siteOrigin, isIndexable } from "@/lib/config";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isIndexable) return [];
  const data = await getPortfolio();
  return ["/", "/resume", ...data.stories.map((story) => `/work/${story.slug}`)].map((path) => ({
    url: `${siteOrigin()}${path}`,
    lastModified: data.updated,
  }));
}
