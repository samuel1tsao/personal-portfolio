import { About, Contact, Hero } from "@/components/Portfolio";
import { getPortfolio } from "@/lib/api";
import { profileData, safeJsonLd } from "@/lib/seo";

export const instant = false;

export default async function Home() {
  const { profile } = await getPortfolio();
  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(profileData(profile)) }}
      />
      <Hero profile={profile} />
      <About profile={profile} />
      <Contact profile={profile} />
    </main>
  );
}
