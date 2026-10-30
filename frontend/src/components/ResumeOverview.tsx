import type { Experience, Project } from "@/lib/schema";
import { entryTechnologies, entrySkills } from "@/lib/projects";
import { detailAnchor, detailPath } from "@/lib/detail-links";

export function Skills({
  item,
  mode = "all",
}: {
  item: Experience | Project;
  mode?: "all" | "split";
}) {
  const { ml, software, all } = entrySkills(item);
  if (!all.length) return null;

  if (mode === "split") {
    return (
      <div className="resume-skills">
        {ml.length > 0 && (
          <p>
            <strong>ML Competencies:</strong> {ml.join(" · ")}
          </p>
        )}
        {software.length > 0 && (
          <p>
            <strong>Core Competencies:</strong> {software.join(" · ")}
          </p>
        )}
      </div>
    );
  }

  return (
    <p className="resume-skills">
      <strong>Skills:</strong> {all.join(" · ")}
    </p>
  );
}

export function Technologies({
  item,
  mode = "split",
}: {
  item: Experience | Project;
  mode?: "all" | "split";
}) {
  const { ml, software, all } = entryTechnologies(item);
  if (!ml.length && !software.length) return null;

  if (mode === "all") {
    return (
      <p className="resume-technologies">
        <strong>Technologies:</strong> {all.join(" · ")}
      </p>
    );
  }

  return (
    <div className="resume-technologies">
      {ml.length > 0 && (
        <p>
          <strong>ML Technologies:</strong> {ml.join(" · ")}
        </p>
      )}
      {software.length > 0 && (
        <p>
          <strong>Software Technologies:</strong> {software.join(" · ")}
        </p>
      )}
    </div>
  );
}

export function AchievementList({ item }: { item: Experience | Project }) {
  let highlights: string[] = [];
  if ("impacts" in item) {
    highlights = item.impacts.map((i) => i.one_line_summary);
  } else if ("projects" in item) {
    highlights = item.projects.flatMap((p) => p.impacts.map((i) => i.one_line_summary)).slice(0, 3);
  }
  if (!highlights.length) return null;
  return (
    <ul className="resume-accomplishments" aria-label="Impact highlights">
      {highlights.map((summary) => (
        <li key={summary}>{summary}</li>
      ))}
    </ul>
  );
}

export function EmployerProjects({ entry }: { entry: Experience }) {
  if (!entry.projects.length) return null;
  return (
    <div className="overview-projects">
      <h4>Projects</h4>
      <ul>
        {entry.projects.map((project) => (
          <li key={project.title}>
            <a href={`${detailPath(entry)}#${detailAnchor(project.title)}`}>{project.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
