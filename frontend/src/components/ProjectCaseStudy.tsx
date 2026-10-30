import { detailAnchor } from "@/lib/detail-links";
import type { Project } from "@/lib/schema";

export function ProjectCaseStudy({
  project,
  headingLevel = 2,
}: {
  project: Project;
  headingLevel?: 2 | 4;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h4";
  const Subheading = headingLevel === 2 ? "h3" : "h5";

  return (
    <div className="project-case-study">
      <section id="problem" tabIndex={-1} aria-label="Problem">
        <Heading>Problem</Heading>
        <div>
          <Subheading>The Challenge</Subheading>
          <p style={{ whiteSpace: "pre-line" }}>{project.problem_statement}</p>
        </div>
      </section>

      <section id="solution" tabIndex={-1} aria-label="Solution">
        <Heading>Solution</Heading>
        <div>
          <Subheading>Technical Implementation</Subheading>
          <p style={{ whiteSpace: "pre-line" }}>{project.solution}</p>
        </div>
      </section>

      <section id="impact" tabIndex={-1} aria-label="Impact & accomplishments">
        <Heading>Impact & Accomplishments</Heading>
        <ul className="resume-accomplishments">
          {project.impacts.map((impact) => (
            <li key={impact.id} id={detailAnchor(impact.one_line_summary)} tabIndex={-1}>
              <strong>{impact.one_line_summary}</strong>
              {impact.full_description !== impact.one_line_summary && (
                <p style={{ marginTop: "0.5rem", whiteSpace: "pre-line" }}>
                  {impact.full_description}
                </p>
              )}
            </li>
          ))}
        </ul>

        {project.links.length > 0 && (
          <div>
            <Subheading>References & Links</Subheading>
            <ul className="project-links">
              {project.links.map((link) => (
                <li key={link.url}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
