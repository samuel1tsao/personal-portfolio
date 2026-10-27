import Link from "next/link";
import { StoryCard } from "@/components/Portfolio";
import { getPortfolio } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";

export const instant = false;

export const metadata = pageMetadata(
  "Projects | Samuel Tsao",
  "Product thinking, engineering decisions, and tradeoffs across Samuel Tsao's software and applied ML projects.",
  "/projects",
);

export default async function Projects() {
  const { entries } = await getPortfolio();
  const projects = entries.filter((entry) => entry.kind === "project");
  return (
    <main id="main" className="story-page wrap">
      <Link className="back-link" href="/#work">
        ← Selected work
      </Link>
      <header className="story-header">
        <p className="eyebrow">Projects & applied research</p>
        <h1>From problem to product.</h1>
        <p className="story-lede">
          The people I’m building for, the systems behind the experience, and the choices that shape
          each project.
        </p>
      </header>
      <div className="project-directory">
        {projects.map((project, index) => (
          <StoryCard key={project.slug} entry={project} index={index} />
        ))}
      </div>
    </main>
  );
}
