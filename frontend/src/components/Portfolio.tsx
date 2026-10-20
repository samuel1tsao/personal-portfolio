import Link from "next/link";
import type { Profile, Story } from "@/lib/schema";
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
          <a className="button primary" href="#work">
            Explore my work <span aria-hidden="true">↘</span>
          </a>
          <Link className="button" href="/resume">
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

export function Work({ stories }: { stories: Story[] }) {
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
      <div className={styles.stories}>
        {stories.length === 0 && (
          <p>Selected stories are being updated. Explore my experience below.</p>
        )}
        {stories.map((story, index) => (
          <StoryCard key={story.slug} story={story} index={index} />
        ))}
      </div>
    </section>
  );
}

export function StoryCard({ story, index }: { story: Story; index: number }) {
  return (
    <article className={styles.storyCard}>
      <div className={styles.storyNumber} aria-hidden="true">
        0{index + 1}
      </div>
      <div className={styles.storyContent}>
        <p className="eyebrow">
          {story.kind === "project"
            ? "Personal project · Applied ML"
            : story.role.split(" · ").at(-1)}
        </p>
        <h3>
          <Link href={`/work/${story.slug}`}>{story.title}</Link>
        </h3>
        <p>{story.summary}</p>
        <ul className="tags" aria-label="Technologies">
          {story.skills.slice(0, 4).map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      </div>
      <Link
        href={`/work/${story.slug}`}
        className={styles.storyArrow}
        aria-label={`Read ${story.title}`}
      >
        <span aria-hidden="true">↗</span>
      </Link>
    </article>
  );
}

export function Experience({ profile }: { profile: Profile }) {
  return (
    <section className="section wrap" id="experience" aria-labelledby="experience-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Career / 02</p>
          <h2 id="experience-heading">Built on experience.</h2>
        </div>
        <Link className="inline-link" href="/resume">
          Full resume ↗
        </Link>
      </div>
      <div className={styles.timeline}>
        {profile.roles.map((role) => (
          <article key={role.company} className={styles.role}>
            <p className={styles.roleDate}>{rolePeriod(role.start, role.end)}</p>
            <div>
              <h3>{role.company}</h3>
              <p className={styles.roleTitle}>{role.title}</p>
              <p>{role.summary}</p>
            </div>
            <span className={styles.roleMark} aria-hidden="true">
              ↗
            </span>
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
          <a className={styles.email} href={`mailto:${profile.email}`}>
            {profile.email} <span aria-hidden="true">↗</span>
          </a>
          <CopyEmail email={profile.email} />
          <div className={styles.socials}>
            {profile.links.map((link) => (
              <a key={link.url} href={link.url}>
                {link.label} ↗
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Diagram({ steps }: { steps: string[] }) {
  return (
    <figure className={styles.diagram}>
      <figcaption>Conceptual flow · asset recommendation project</figcaption>
      <ol>
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p>Historical data informs models, recommendations, and scenario evaluation.</p>
    </figure>
  );
}
