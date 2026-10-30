import Link from "next/link";
import { StoryCard } from "@/components/Portfolio";
import { getPortfolio } from "@/lib/api";
import { splitProjects } from "@/lib/projects";
import type { Project } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const instant = false;

export const metadata = pageMetadata(
  "Projects | Samuel Tsao",
  "Product thinking, engineering decisions, and tradeoffs across Samuel Tsao's software and applied ML projects.",
  "/projects",
);

export default async function Projects() {
  const portfolio = await getPortfolio();
  const { machineLearning, softwareEngineering } = splitProjects(portfolio);
  return (
    <main id="main" className="story-page wrap">
      <Link className="back-link" href="/resume#projects">
        ← Resume & Work
      </Link>
      <header className="story-header">
        <h1>Projects</h1>
      </header>
      <ProjectDirectory title="Machine learning projects" projects={machineLearning} />
      <ProjectDirectory title="Software engineering projects" projects={softwareEngineering} />
    </main>
  );
}

function ProjectDirectory({ title, projects }: { title: string; projects: Project[] }) {
  return (
    <section className="project-group" aria-labelledby={`${title.replaceAll(" ", "-")}-heading`}>
      <h2 id={`${title.replaceAll(" ", "-")}-heading`}>{title}</h2>
      <div className="project-directory">
        {projects.map((project, index) => (
          <StoryCard key={project.project_id} project={project} index={index} />
        ))}
      </div>
    </section>
  );
}
