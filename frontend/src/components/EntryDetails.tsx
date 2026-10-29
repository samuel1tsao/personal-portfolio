import { DetailNavigation } from "./DetailNavigation";
import { detailAnchor } from "@/lib/detail-links";
import Link from "next/link";
import { ExperienceProjectCard } from "@/components/ExperienceProjectCard";
import { ProjectCaseStudy } from "@/components/ProjectCaseStudy";
import type { PortfolioEntry, Profile } from "@/lib/schema";
import { Contact } from "./Portfolio";

export function EntryDetails({
  entry,
  profile,
  entries,
}: {
  entry: PortfolioEntry;
  profile: Profile;
  entries: PortfolioEntry[];
}) {
  const isProject = entry.kind === "project";
  const relatedProjects = entry.related_projects
    .map((slug) => entries.find((item) => item.slug === slug && item.kind === "project"))
    .filter((project): project is PortfolioEntry => project !== undefined);
  return (
    <main id="main">
      <article className="story-page wrap">
        <Link href={`/resume#${entry.slug}`} className="back-link">
          ← Resume & Work
        </Link>
        <header className="story-header">
          <p className="eyebrow">{isProject ? (entry.status ?? "Project") : entry.organization}</p>
          {!isProject && <p className="muted">{entry.period}</p>}
          <h1>{isProject ? entry.title : (entry.position ?? entry.title)}</h1>
          {isProject && <p className="muted">{entry.period}</p>}
          <p className="story-lede">{entry.summary}</p>
          {isProject && <p className="story-role">{entry.role}</p>}
          <ul className="tags" aria-label="Skills and technologies">
            {[...new Set([...entry.skills, ...entry.technologies])].map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </header>
        <DetailNavigation entry={entry} />
        <div className="story-prose">
          {isProject && <ProjectCaseStudy entry={entry} />}
          {!isProject && <ExperienceContext entry={entry} />}
          {!isProject && entry.accomplishments.length > 0 && (
            <section aria-labelledby="experience-accomplishments-heading">
              <h2 id="experience-accomplishments-heading">Resume accomplishments</h2>
              <ul className="resume-accomplishments">
                {entry.accomplishments.map((item) => (
                  <li key={item} id={detailAnchor(item)} tabIndex={-1}>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {!isProject && (entry.work_projects.length > 0 || relatedProjects.length > 0) && (
            <section aria-labelledby="experience-projects-heading">
              <h2 id="experience-projects-heading">Projects</h2>
              <div className="experience-project-list">
                {entry.work_projects.map((project) => (
                  <ExperienceProjectCard key={project.title} project={project} headingLevel={3} />
                ))}
                {relatedProjects.map((project) => (
                  <article className="experience-project-card" key={project.slug}>
                    <h3>
                      <Link href={`/work/${project.slug}`}>{project.title}</Link>
                    </h3>
                    <p>{project.summary}</p>
                    <Link className="inline-link" href={`/work/${project.slug}`}>
                      View project details ↗
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          )}
          {!isProject && entry.additional_accomplishments.length > 0 && (
            <section aria-labelledby="additional-accomplishments-heading">
              <h2 id="additional-accomplishments-heading">Additional accomplishments</h2>
              <ul className="resume-accomplishments">
                {entry.additional_accomplishments.map((item) => (
                  <li key={item} id={detailAnchor(item)} tabIndex={-1}>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}
          <div className="actions">
            {entry.links.map((link) => (
              <a className="button" href={link.url} key={link.url}>
                {link.label} ↗
              </a>
            ))}
            <Link
              className="button"
              href={isProject ? "/resume#projects" : `/resume#${entry.slug}`}
            >
              {isProject ? "View in resume" : "Full resume entry"} ↗
            </Link>
          </div>
        </div>
      </article>
      <Contact profile={profile} />
    </main>
  );
}

function ExperienceContext({ entry }: { entry: PortfolioEntry }) {
  return (
    <>
      <section>
        <h2>Role & scope</h2>
        <p>{entry.role}</p>
        <p>{entry.contribution}</p>
        <p>{entry.evidence}</p>
      </section>
      {entry.sections.map((section) => (
        <section key={section.title}>
          <h2>{section.title}</h2>
          <p>{section.body}</p>
        </section>
      ))}
    </>
  );
}
