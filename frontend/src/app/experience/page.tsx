import Link from "next/link";
import { StoryCard } from "@/components/Portfolio";
import { getPortfolio } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";

export const instant = false;

export const metadata = pageMetadata(
  "Experience | Samuel Tsao",
  "Role-by-role details, accomplishments, systems, and engineering impact across Samuel Tsao's career.",
  "/experience",
);

export default async function ExperiencePage() {
  const { entries } = await getPortfolio();
  const roles = entries.filter((entry) => entry.kind === "experience");
  return (
    <main id="main" className="story-page wrap">
      <Link className="back-link" href="/#experience">
        ← Career overview
      </Link>
      <header className="story-header">
        <p className="eyebrow">Career / role by role</p>
        <h1>Systems built over time.</h1>
        <p className="story-lede">
          A complete view of my roles, responsibilities, accomplishments, and the systems behind the
          work.
        </p>
      </header>
      <div className="project-directory">
        {roles.map((role, index) => (
          <StoryCard key={role.slug} entry={role} index={index} />
        ))}
      </div>
    </main>
  );
}
