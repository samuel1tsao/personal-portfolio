import Link from "next/link";
import type { Portfolio, Project } from "@/lib/schema";
import { professionalRoles, splitProjects, entryTechnologies } from "@/lib/projects";
import { rolePeriod } from "@/lib/seo";
import { CopyEmail } from "./CopyEmail";
import { ExperienceProjectCard } from "./ExperienceProjectCard";
import styles from "./Portfolio.module.css";

export function Hero({ portfolio }: { portfolio: Portfolio }) {
  return (
    <section className={`${styles.hero} wrap`} aria-labelledby="intro-heading">
      <div className={styles.heroMain}>
        <p className="eyebrow">
          <span className="status-dot" /> {portfolio.name}
        </p>
        <h1 id="intro-heading">{portfolio.headline_summary}</h1>
        <p className={styles.intro}>{portfolio.engineering_philosophy}</p>
        <div className="actions">
          <a
            className="button primary"
            href="/resume"
            data-analytics-event="WorkClick"
            data-analytics-location="hero"
          >
            Explore my work <span aria-hidden="true">↘</span>
          </a>
        </div>
        <p className={styles.location}>
          <span aria-hidden="true">◎</span> {portfolio.location}
        </p>
      </div>
    </section>
  );
}

export function Work({ portfolio }: { portfolio: Portfolio }) {
  const { machineLearning, softwareEngineering } = splitProjects(portfolio);
  return (
    <section className="section wrap" id="work" aria-labelledby="work-heading">
      <div className="section-heading">
        <div>
          <h2 id="work-heading">Selected projects</h2>
        </div>
      </div>
      <p>
        <Link
          className="inline-link"
          href="/projects"
          data-analytics-event="ProjectsClick"
          data-analytics-location="selected-work"
        >
          Explore all projects ↗
        </Link>
      </p>
      {machineLearning.length === 0 && softwareEngineering.length === 0 && (
        <p>Selected work is being updated. Explore my experience below.</p>
      )}
      <ProjectGroup title="Machine learning projects" projects={machineLearning} />
      <ProjectGroup title="Software engineering projects" projects={softwareEngineering} />
    </section>
  );
}

function ProjectGroup({ title, projects }: { title: string; projects: Project[] }) {
  if (projects.length === 0) return null;
  return (
    <section className={styles.projectGroup} aria-label={title}>
      <h3>{title}</h3>
      <div className={styles.stories}>
        {projects.map((project, index) => (
          <StoryCard key={project.project_id} project={project} index={index} />
        ))}
      </div>
    </section>
  );
}

export function StoryCard({ project, index }: { project: Project; index: number }) {
  const href = `/work/${project.project_id}`;
  const techs = entryTechnologies(project);
  return (
    <article className={styles.storyCard}>
      <div className={styles.storyNumber} aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </div>
      <div className={styles.storyContent}>
        <p className="eyebrow">
          {project.ml_technologies.length > 0 ? "Machine Learning" : "Software Engineering"}
        </p>
        <h3>
          <Link
            href={href}
            data-analytics-event="CaseStudyClick"
            data-analytics-target={project.project_id}
          >
            {project.title}
          </Link>
        </h3>
        <p>{project.impacts[0]?.one_line_summary ?? project.problem_statement}</p>
        <ul className="tags" aria-label="Technologies">
          {techs.all.slice(0, 4).map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>
      </div>
      <Link
        href={href}
        className={styles.storyArrow}
        aria-label={`Read ${project.title}`}
        data-analytics-event="CaseStudyClick"
        data-analytics-target={project.project_id}
      >
        <span aria-hidden="true">↗</span>
      </Link>
    </article>
  );
}

export function ExperienceSection({ portfolio }: { portfolio: Portfolio }) {
  const roles = professionalRoles(portfolio);
  return (
    <section className="section wrap" id="experience" aria-labelledby="experience-heading">
      <div className="section-heading">
        <div>
          <h2 id="experience-heading">Experience</h2>
        </div>
        <Link
          className="inline-link"
          href="/resume#experience"
          data-analytics-event="ResumeClick"
          data-analytics-location="experience"
        >
          Full resume ↗
        </Link>
      </div>
      <div className={styles.timeline}>
        {roles.map((role) => (
          <article key={role.experience_id} className={styles.role}>
            <p className={styles.roleDate}>{rolePeriod(role.from_date, role.to_date)}</p>
            <div>
              <h3>
                <Link href={`/resume#${role.experience_id}`}>{role.organization}</Link>
              </h3>
              <p className={styles.roleTitle}>{role.title}</p>
              <p>{role.summary}</p>
              {role.projects.length > 0 && (
                <div className={styles.roleProjects}>
                  <h4>Projects</h4>
                  {role.projects.map((project) => (
                    <ExperienceProjectCard key={project.title} project={project} headingLevel={5} />
                  ))}
                </div>
              )}
              <Link className="inline-link" href={`/resume#${role.experience_id}`}>
                Full role description ↗
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function About({ portfolio }: { portfolio: Portfolio }) {
  return (
    <section className={`${styles.about} section wrap`} id="about" aria-labelledby="about-heading">
      <div>
        <h2 id="about-heading">Engineering Philosophy</h2>
        <p style={{ whiteSpace: "pre-line" }}>{portfolio.engineering_philosophy}</p>
      </div>
      <div className={styles.aboutDetails}>
        <h3>Interests</h3>
        {portfolio.interests.map((interest) => (
          <p key={interest}>{interest}</p>
        ))}
      </div>
    </section>
  );
}

export function Contact({ portfolio }: { portfolio: Portfolio }) {
  return (
    <section className={`${styles.contact} wrap`} id="connect" aria-labelledby="connect-heading">
      <div className={styles.contactBody}>
        <div>
          <h2 id="connect-heading">Contact</h2>
        </div>
        <div className={styles.contactLinks}>
          <a
            className={styles.email}
            href={`mailto:${portfolio.contact.email}`}
            data-analytics-event="EmailClick"
            data-analytics-location="contact"
          >
            {portfolio.contact.email} <span aria-hidden="true">↗</span>
          </a>
          <CopyEmail email={portfolio.contact.email} />
          <div className={styles.socials}>
            <a
              href={portfolio.contact.github_url}
              data-analytics-event="ProfileLinkClick"
              data-analytics-target="github"
            >
              GitHub ↗
            </a>
            <a
              href={portfolio.contact.linkedin_url}
              data-analytics-event="ProfileLinkClick"
              data-analytics-target="linkedin"
            >
              LinkedIn ↗
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
