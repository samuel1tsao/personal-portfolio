import { detailAnchor } from "@/lib/detail-links";
import Link from "next/link";
import type { PortfolioEntry } from "@/lib/schema";

const GROUPS = [
  { id: "problem", title: "Problem" },
  { id: "solution", title: "Solution" },
  { id: "impact", title: "Impact & accomplishments" },
] as const;

export function ProjectCaseStudy({
  entry,
  headingLevel = 2,
}: {
  entry: PortfolioEntry;
  headingLevel?: 2 | 4;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h4";
  const Subheading = headingLevel === 2 ? "h3" : "h5";

  return (
    <div className="project-case-study">
      {GROUPS.map((group) => {
        const sections = entry.sections.filter((section) => section.group === group.id);
        const isImpact = group.id === "impact";
        if (
          sections.length === 0 &&
          !(isImpact && (entry.contribution || entry.accomplishments.length))
        )
          return null;

        return (
          <section key={group.id} id={group.id} tabIndex={-1} aria-label={group.title}>
            <Heading>{group.title}</Heading>
            {isImpact && entry.contribution && (
              <div>
                <Subheading>My ownership</Subheading>
                <p>{entry.contribution}</p>
              </div>
            )}
            {sections.map((section) => (
              <div key={section.title}>
                <Subheading>{section.title}</Subheading>
                <p>{section.body}</p>
              </div>
            ))}
            {isImpact && entry.accomplishments.length > 0 && (
              <div>
                <Subheading>Accomplishments</Subheading>
                <ul className="resume-accomplishments">
                  {entry.accomplishments.map((item) => (
                    <li key={item} id={detailAnchor(item)} tabIndex={-1}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {isImpact && (
              <div>
                <Subheading>Evidence and scope</Subheading>
                <p>{entry.evidence}</p>
              </div>
            )}
            {group.id === "solution" && entry.decisions.length > 0 && (
              <div>
                <Subheading>Design choices & tradeoffs</Subheading>
                {entry.decisions.map((decision) => (
                  <article key={decision.title} className="decision-card">
                    <h5>{decision.title}</h5>
                    <dl>
                      <dt>Choice</dt>
                      <dd>{decision.choice}</dd>
                      <dt>Why this approach</dt>
                      <dd>{decision.rationale}</dd>
                      <dt>Tradeoff</dt>
                      <dd>{decision.tradeoff}</dd>
                    </dl>
                  </article>
                ))}
              </div>
            )}
          </section>
        );
      })}
      <p className="experience-project-technologies">
        <strong>Technologies:</strong>{" "}
        {[...new Set([...entry.skills, ...entry.technologies])].join(" · ")}
      </p>
      <p className="resume-links">
        <Link href={`/work/${entry.slug}`}>{entry.title} full project page ↗</Link>
        {entry.links.map((link) => (
          <a key={link.url} href={link.url}>
            {link.label} ↗
          </a>
        ))}
      </p>
    </div>
  );
}
