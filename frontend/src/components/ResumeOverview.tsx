import type { PortfolioEntry } from "@/lib/schema";
import { entryTechnologies } from "@/lib/projects";
import { detailAnchor, detailPath } from "@/lib/detail-links";

// JSX components follow the existing component-length exception in Shell.tsx.
export function Technologies({ entry }: { entry: PortfolioEntry }) {
  const technologies = entryTechnologies(entry);
  if (!technologies.length) return null;
  return (
    <p className="resume-technologies">
      <strong>Technologies:</strong> {technologies.join(" · ")}
    </p>
  );
}

export function AchievementList({ entry }: { entry: PortfolioEntry }) {
  return (
    <ul className="resume-accomplishments" aria-label="Impact highlights">
      {entry.highlights.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function EmployerProjects({ entry }: { entry: PortfolioEntry }) {
  if (!entry.work_projects.length) return null;
  return (
    <div className="overview-projects">
      <h4>Projects</h4>
      <ul>
        {entry.work_projects.map((project) => (
          <li key={project.title}>
            <a href={`${detailPath(entry)}#${detailAnchor(project.title)}`}>{project.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
