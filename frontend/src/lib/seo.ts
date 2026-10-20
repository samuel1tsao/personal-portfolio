import type { Metadata } from "next";
import { isIndexable, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, siteOrigin } from "./config";
import type { Profile } from "./schema";

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

export function profileData(profile: Profile) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      "@id": `${siteOrigin()}/#samuel-tsao`,
      name: profile.name,
      url: siteOrigin(),
      jobTitle: "Senior Software Engineer",
      description: profile.intro,
      sameAs: profile.links.map((link) => link.url),
      knowsAbout: profile.skills,
    },
  };
}

export function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function rolePeriod(start: string, end: string | null) {
  const format = (date: string) =>
    new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  return `${format(start)} — ${end ? format(end) : "Present"}`;
}
