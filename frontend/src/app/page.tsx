import { About, Contact, Hero, Work, ExperienceSection } from "@/components/Portfolio";
import { getPortfolio } from "@/lib/api";
import { profileData, safeJsonLd } from "@/lib/seo";

export const instant = false;

export default async function Home() {
  const portfolio = await getPortfolio();
  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(profileData(portfolio)) }}
      />
      <Hero portfolio={portfolio} />
      <Work portfolio={portfolio} />
      <ExperienceSection portfolio={portfolio} />
      <About portfolio={portfolio} />
      <Contact portfolio={portfolio} />
    </main>
  );
}
