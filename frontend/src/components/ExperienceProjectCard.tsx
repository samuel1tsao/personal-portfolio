import { detailAnchor } from "@/lib/detail-links";
import type { PortfolioEntry } from "@/lib/schema";

type ExperienceProject = PortfolioEntry["work_projects"][number];

export function ExperienceProjectCard({
  project,
  headingLevel,
}: {
  project: ExperienceProject;
  headingLevel: 3 | 5;
}) {
  const Heading = headingLevel === 3 ? "h3" : "h5";

  return (
    <article className="experience-project-card" id={detailAnchor(project.title)} tabIndex={-1}>
      <Heading>{project.title}</Heading>
      <dl className="experience-project-fields">
        <div>
          <dt>Problem</dt>
          <dd>{project.problem}</dd>
        </div>
        <div>
          <dt>Solution</dt>
          <dd>{project.solution}</dd>
        </div>
        <div>
          <dt>Impact</dt>
          <dd>{project.impact}</dd>
        </div>
      </dl>
      {project.technologies.length > 0 && (
        <p className="experience-project-technologies">
          <strong>Technologies:</strong> {project.technologies.join(" · ")}
        </p>
      )}
      {project.references.length > 0 && (
        <p className="experience-project-references">
          <strong>References:</strong>{" "}
          {project.references.map((reference) => (
            <a href={reference.url} key={reference.url}>
              {reference.label} ↗
            </a>
          ))}
        </p>
      )}
    </article>
  );
}
