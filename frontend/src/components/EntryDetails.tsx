import { DetailNavigation } from "./DetailNavigation";
import { entryTechnologies } from "@/lib/projects";
import { rolePeriod } from "@/lib/seo";
import Link from "next/link";
import { ExperienceProjectCard } from "@/components/ExperienceProjectCard";
import { ProjectCaseStudy } from "@/components/ProjectCaseStudy";
import type { Portfolio, Project, Experience } from "@/lib/schema";
import { Contact } from "./Portfolio";

export function EntryDetails({
  item,
  portfolio,
}: {
  item: Project | Experience;
  portfolio: Portfolio;
}) {
  const isProject = "project_id" in item;
  const techs = entryTechnologies(item);
  const skills = [...new Set([...item.ml_skills, ...item.software_skills])];

  return (
    <main id="main">
      <article className="story-page wrap">
        <Link
          href={isProject ? "/resume#projects" : `/resume#${item.experience_id}`}
          className="back-link"
        >
          ← Resume & Work
        </Link>
        <header className="story-header">
          <p className="eyebrow">
            {isProject
              ? item.ml_technologies.length > 0
                ? "Machine Learning Project"
                : "Software Engineering Project"
              : item.organization}
          </p>
          {!isProject && <p className="muted">{rolePeriod(item.from_date, item.to_date)}</p>}
          <h1>{item.title}</h1>
          <p className="story-lede">
            {isProject
              ? (item.impacts[0]?.one_line_summary ?? item.problem_statement)
              : item.summary}
          </p>
          <ul className="tags" aria-label="Skills and technologies">
            {[...new Set([...techs.all, ...skills])].map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </header>

        <DetailNavigation item={item} />

        <div className="story-prose">
          {isProject ? (
            <ProjectCaseStudy project={item} />
          ) : (
            <div>
              <section>
                <h2>Role Overview</h2>
                <p>{item.summary}</p>
              </section>
              {item.projects.length > 0 && (
                <section aria-labelledby="experience-projects-heading">
                  <h2 id="experience-projects-heading">Projects</h2>
                  <div className="experience-project-list">
                    {item.projects.map((project) => (
                      <ExperienceProjectCard
                        key={project.project_id}
                        project={project}
                        headingLevel={3}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          <div className="actions">
            {isProject &&
              item.links.map((link) => (
                <a
                  className="button"
                  href={link.url}
                  key={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label} ↗
                </a>
              ))}
            <Link
              className="button"
              href={isProject ? "/resume#projects" : `/resume#${item.experience_id}`}
            >
              {isProject ? "View in resume" : "Full resume entry"} ↗
            </Link>
          </div>
        </div>
      </article>
      <Contact portfolio={portfolio} />
    </main>
  );
}
