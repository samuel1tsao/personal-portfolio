import type { Metadata } from "next";
import { isIndexable, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, siteOrigin } from "./config";
import type { Portfolio } from "./schema";

export function pageMetadata(
  title = SITE_TITLE,
  description = SITE_DESCRIPTION,
  path = "/",
): Metadata {
  return {
    title,
    description,
    metadataBase: new URL(siteOrigin()),
    alternates: { canonical: path },
    robots: { index: isIndexable, follow: isIndexable },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export function profileData(portfolio: Portfolio) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      "@id": `${siteOrigin()}/#samuel-tsao`,
      name: portfolio.name,
      url: siteOrigin(),
      jobTitle: portfolio.headline_summary,
      description: portfolio.engineering_philosophy,
      sameAs: [portfolio.contact.github_url, portfolio.contact.linkedin_url],
      knowsAbout: [...portfolio.ml_skills, ...portfolio.software_skills],
    },
  };
}

export function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function rolePeriod(start: string | null, end: string | null) {
  if (!start) return "Ongoing";
  const format = (date: string) => {
    const fullDate = date.length === 7 ? `${date}-01` : date;
    return new Date(`${fullDate}T00:00:00Z`).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };
  return `${format(start)} — ${end ? format(end) : "Present"}`;
}
