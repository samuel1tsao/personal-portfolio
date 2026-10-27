import Link from "next/link";
import type { PortfolioEntry, Profile } from "@/lib/schema";
import { rolePeriod } from "@/lib/seo";
import { CopyEmail } from "./CopyEmail";
import styles from "./Portfolio.module.css";

const FOCUS_AREAS = [
  {
    number: "01",
    title: "Production systems",
    detail: "Financial workflows, backend services, and dependable execution.",
  },
  {
    number: "02",
    title: "Marketplace discovery",
    detail: "Search, geographic context, and recommendation infrastructure.",
  },
  {
    number: "03",
    title: "Applied intelligence",
    detail: "Transformer models, reinforcement learning, and thoughtful evaluation.",
  },
];

export function Hero({ profile }: { profile: Profile }) {
  return (
    <section className={`${styles.hero} wrap`} aria-labelledby="intro-heading">
      <div className={styles.heroMain}>
        <p className="eyebrow">
          <span className="status-dot" /> Samuel Tsao · Software engineer
        </p>
        <h1 id="intro-heading">
          Reliable systems.
          <br />
          <em>Thoughtful</em>
          <br />
          intelligence.
        </h1>
        <p className={styles.intro}>{profile.intro}</p>
        <div className="actions">
          <a
            className="button primary"
            href="#work"
            data-analytics-event="WorkClick"
            data-analytics-location="hero"
          >
            Explore my work <span aria-hidden="true">↘</span>
          </a>
          <Link
            className="button"
            href="/resume"
            data-analytics-event="ResumeClick"
            data-analytics-location="hero"
          >
            View resume <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <p className={styles.location}>
          <span aria-hidden="true">◎</span> {profile.location}
        </p>
      </div>
      <div className={styles.heroAside}>
        <div className={styles.systemCard}>
          <div className={styles.systemTop}>
            <span>ENGINEERING PERSPECTIVE</span>
            <span aria-hidden="true">↗</span>
          </div>
          <p className={styles.systemTitle}>
            From complexity
            <br />
            to clarity.
          </p>
          <div
            className={styles.systemFlow}
            aria-label="Engineering perspective: understand the problem, design the system, evaluate the outcome"
          >
            <span>
              01 <b>Understand</b>
              <small>The problem & constraints</small>
            </span>
            <i aria-hidden="true">↓</i>
            <span>
              02 <b>Design</b>
              <small>The system & tradeoffs</small>
            </span>
            <i aria-hidden="true">↓</i>
            <span>
              03 <b>Evaluate</b>
              <small>The outcome & limitations</small>
            </span>
          </div>
          <p className={styles.systemNote}>Systems thinking, from infrastructure to ML.</p>
        </div>
        <p className={styles.marginNote}>
          A selection of work at the intersection
          <br />
          of software, systems, and intelligence.
        </p>
      </div>
    </section>
  );
}

export function Focus() {
  return (
    <section className={`${styles.focus} wrap`} aria-label="Engineering focus">
      {FOCUS_AREAS.map((area) => (
        <div key={area.number}>
          <span className="eyebrow">{area.number} / FOCUS</span>
          <h2>{area.title}</h2>
          <p>{area.detail}</p>
        </div>
      ))}
    </section>
  );
}

export function Work({ entries }: { entries: PortfolioEntry[] }) {
  const projects = entries.filter((entry) => entry.kind === "project");
  return (
    <section className="section wrap" id="work" aria-labelledby="work-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Selected work / 01</p>
          <h2 id="work-heading">Engineering in practice.</h2>
        </div>
        <p>
          Real problems. Deliberate decisions.
          <br />A closer look at my contributions.
        </p>
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
      <div className={styles.stories}>
        {projects.length === 0 && (
          <p>Selected work is being updated. Explore my experience below.</p>
        )}
        {projects.map((project, index) => (
          <StoryCard key={project.slug} entry={project} index={index} />
        ))}
      </div>
    </section>
  );
}

export function StoryCard({ entry, index }: { entry: PortfolioEntry; index: number }) {
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
            href={entry.kind === "project" ? `/work/${entry.slug}` : `/experience/${entry.slug}`}
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
        href={entry.kind === "project" ? `/work/${entry.slug}` : `/experience/${entry.slug}`}
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
  const roles = entries.filter((entry) => entry.kind === "experience");
  return (
    <section className="section wrap" id="experience" aria-labelledby="experience-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Career / 02</p>
          <h2 id="experience-heading">Built on experience.</h2>
        </div>
        <Link
          className="inline-link"
          href="/experience"
          data-analytics-event="ResumeClick"
          data-analytics-location="experience"
        >
          All roles ↗
        </Link>
      </div>
      <div className={styles.timeline}>
        {roles.map((role) => (
          <Link key={role.slug} href={`/experience/${role.slug}`} className={styles.role}>
            <p className={styles.roleDate}>{rolePeriod(role.start!, role.end)}</p>
            <div>
              <h3>{role.organization}</h3>
              <p className={styles.roleTitle}>{role.position}</p>
              <p>{role.summary}</p>
            </div>
            <span className={styles.roleMark} aria-hidden="true">
              ↗
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function About({ profile }: { profile: Profile }) {
  return (
    <section className={`${styles.about} section wrap`} id="about" aria-labelledby="about-heading">
      <div>
        <p className="eyebrow">Beyond the code / 03</p>
        <h2 id="about-heading">
          Curious by nature.
          <br />
          <em>Engineer</em> by practice.
        </h2>
        <p>{profile.about}</p>
      </div>
      <div className={styles.aboutDetails}>
        <h3>Always learning</h3>
        {profile.education.map((item) => (
          <p key={item}>{item}</p>
        ))}
        <h3>Tools of the craft</h3>
        <ul className="tags">
          {profile.skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
        <h3>Outside work</h3>
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
      <p className="eyebrow">Start a conversation / 04</p>
      <div className={styles.contactBody}>
        <div>
          <h2 id="connect-heading">
            Good work starts
            <br />
            with a <em>conversation.</em>
          </h2>
          <p>
            Hiring, collaborating, or exchanging ideas?
            <br />
            I’d be glad to hear from you.
          </p>
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

export function Diagram({
  steps,
  caption = "Conceptual flow",
  description = "A simplified view of the project workflow.",
}: {
  steps: string[];
  caption?: string;
  description?: string;
}) {
  return (
    <figure className={styles.diagram}>
      <figcaption>{caption}</figcaption>
      <ol>
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p>{description}</p>
    </figure>
  );
}
