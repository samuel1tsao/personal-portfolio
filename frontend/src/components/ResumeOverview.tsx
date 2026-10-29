import type { PortfolioEntry } from "@/lib/schema";
import { detailAnchor, detailPath, SUMMARY_BULLET_LIMIT } from "@/lib/detail-links";

// JSX components follow the existing component-length exception in Shell.tsx.
export function AchievementList({ entry }: { entry: PortfolioEntry }) {
  return (
    <ul className="resume-accomplishments">
      {entry.accomplishments.slice(0, SUMMARY_BULLET_LIMIT).map((item) => (
        <li key={item}>
          {item}{" "}
          <a className="detail-link" href={`${detailPath(entry)}#${detailAnchor(item)}`}>
            Read details<span className="sr-only">: {item}</span>
          </a>
        </li>
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
            <p>{project.impact}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
