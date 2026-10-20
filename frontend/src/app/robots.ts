import type { MetadataRoute } from "next";
import { isIndexable, siteOrigin } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: isIndexable
      ? [
          { userAgent: "*", allow: "/", disallow: "/api/" },
          {
            userAgent: ["OAI-SearchBot", "Claude-SearchBot", "Claude-User"],
            allow: "/",
            disallow: "/api/",
          },
          { userAgent: ["GPTBot", "ClaudeBot"], disallow: "/" },
        ]
      : [{ userAgent: "*", disallow: "/" }],
    sitemap: `${siteOrigin()}/sitemap.xml`,
  };
}
