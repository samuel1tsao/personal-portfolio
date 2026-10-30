import { detailAnchor } from "@/lib/detail-links";
import type { Project } from "@/lib/schema";

export function ExperienceProjectCard({
  project,
  headingLevel,
}: {
  project: Project;
  headingLevel: 3 | 5;
}) {
  const Heading = headingLevel === 3 ? "h3" : "h5";

  return (
    <article className="experience-project-card" id={detailAnchor(project.title)} tabIndex={-1}>
      <Heading>{project.title}</Heading>
      <dl className="experience-project-fields">
        <div>
          <dt>Problem</dt>
          <dd>{project.problem_statement}</dd>
        </div>
        <div>
          <dt>Solution</dt>
          <dd>{project.solution}</dd>
        </div>
        <div>
          <dt>Impact</dt>
          <dd>
            {project.impacts.map((i) => (
              <p key={i.id}>{i.one_line_summary}</p>
            ))}
          </dd>
        </div>
      </dl>
      {project.ml_technologies.length > 0 && (
        <p className="experience-project-technologies">
          <strong>ML Technologies:</strong> {project.ml_technologies.join(" · ")}
        </p>
      )}
      {project.software_technologies.length > 0 && (
        <p className="experience-project-technologies">
          <strong>Software Technologies:</strong> {project.software_technologies.join(" · ")}
        </p>
      )}
      {project.links.length > 0 && (
        <p className="experience-project-references">
          <strong>References:</strong>{" "}
          {project.links.map((reference) => (
            <a href={reference.url} key={reference.url}>
              {reference.label} ↗
            </a>
          ))}
        </p>
      )}
    </article>
  );
}
