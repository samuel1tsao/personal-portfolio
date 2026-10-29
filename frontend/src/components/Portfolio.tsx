import Link from "next/link";
import type { PortfolioEntry, Profile } from "@/lib/schema";
import { professionalRoles, splitProjects } from "@/lib/projects";
import { rolePeriod } from "@/lib/seo";
import { CopyEmail } from "./CopyEmail";
import { ExperienceProjectCard } from "./ExperienceProjectCard";
import styles from "./Portfolio.module.css";

export function Hero({ profile }: { profile: Profile }) {
  return (
    <section className={`${styles.hero} wrap`} aria-labelledby="intro-heading">
      <div className={styles.heroMain}>
        <p className="eyebrow">
          <span className="status-dot" /> {profile.name}
        </p>
        <h1 id="intro-heading">{profile.headline}</h1>
        <p className={styles.intro}>{profile.intro}</p>
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
          <span aria-hidden="true">◎</span> {profile.location}
        </p>
      </div>
    </section>
  );
}

export function Work({ entries }: { entries: PortfolioEntry[] }) {
  const { machineLearning, softwareEngineering } = splitProjects(entries);
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

function ProjectGroup({ title, projects }: { title: string; projects: PortfolioEntry[] }) {
  if (projects.length === 0) return null;
  return (
    <section className={styles.projectGroup} aria-label={title}>
      <h3>{title}</h3>
      <div className={styles.stories}>
        {projects.map((project, index) => (
          <StoryCard key={project.slug} entry={project} index={index} />
        ))}
      </div>
    </section>
  );
}

export function StoryCard({ entry, index }: { entry: PortfolioEntry; index: number }) {
  const href = entry.kind === "project" ? `/work/${entry.slug}` : `/resume#${entry.slug}`;
  return (
    <article className={styles.storyCard}>
      <div className={styles.storyNumber} aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </div>
      <div className={styles.storyContent}>
        <p className="eyebrow">
          {entry.kind === "project"
            ? (entry.status ?? "Project")
            : `${entry.organization} · ${entry.period}`}
        </p>
        <h3>
          <Link
            href={href}
            data-analytics-event="CaseStudyClick"
            data-analytics-target={entry.slug}
          >
            {entry.title}
          </Link>
        </h3>
        {entry.position && <p className={styles.roleTitle}>{entry.position}</p>}
        <p>{entry.summary}</p>
        <ul className="tags" aria-label="Technologies">
          {entry.skills.slice(0, 4).map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      </div>
      <Link
        href={href}
        className={styles.storyArrow}
        aria-label={`Read ${entry.title}`}
        data-analytics-event="CaseStudyClick"
        data-analytics-target={entry.slug}
      >
        <span aria-hidden="true">↗</span>
      </Link>
    </article>
  );
}

export function Experience({ entries }: { entries: PortfolioEntry[] }) {
  const roles = professionalRoles(entries);
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
          <article key={role.slug} className={styles.role}>
            <p className={styles.roleDate}>
              {role.start ? rolePeriod(role.start, role.end) : role.period}
            </p>
            <div>
              <h3>
                <Link href={`/resume#${role.slug}`}>{role.organization}</Link>
              </h3>
              <p className={styles.roleTitle}>{role.position}</p>
              <p>{role.summary}</p>
              {role.work_projects.length > 0 && (
                <div className={styles.roleProjects}>
                  <h4>Projects</h4>
                  {role.work_projects.map((project) => (
                    <ExperienceProjectCard key={project.title} project={project} headingLevel={5} />
                  ))}
                </div>
              )}
              <Link className="inline-link" href={`/resume#${role.slug}`}>
                Full role description ↗
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function About({ profile }: { profile: Profile }) {
  return (
    <section className={`${styles.about} section wrap`} id="about" aria-labelledby="about-heading">
      <div>
        <h2 id="about-heading">My philosophy & direction</h2>
        <p>{profile.about}</p>
      </div>
      <div className={styles.aboutDetails}>
        <h3>Interests</h3>
        {profile.interests.map((interest) => (
          <p key={interest}>{interest}</p>
        ))}
      </div>
    </section>
  );
}

export function Contact({ profile }: { profile: Profile }) {
  return (
    <section className={`${styles.contact} wrap`} id="connect" aria-labelledby="connect-heading">
      <div className={styles.contactBody}>
        <div>
          <h2 id="connect-heading">Contact</h2>
        </div>
        <div className={styles.contactLinks}>
          <a
            className={styles.email}
            href={`mailto:${profile.email}`}
            data-analytics-event="EmailClick"
            data-analytics-location="contact"
          >
            {profile.email} <span aria-hidden="true">↗</span>
          </a>
          <CopyEmail email={profile.email} />
          <div className={styles.socials}>
            {profile.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                data-analytics-event="ProfileLinkClick"
                data-analytics-target={link.label.toLowerCase()}
              >
                {link.label} ↗
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
