import Link from "next/link";
import type { PortfolioEntry, Profile } from "@/lib/schema";
import { Contact, Diagram } from "./Portfolio";

export function EntryDetails({ entry, profile }: { entry: PortfolioEntry; profile: Profile }) {
  const isProject = entry.kind === "project";
  return (
    <main id="main">
      <article className="story-page wrap">
        <Link href={isProject ? "/projects" : "/experience"} className="back-link">
          ← {isProject ? "All projects" : "All roles"}
        </Link>
        <header className="story-header">
          <p className="eyebrow">
            {isProject ? (entry.status ?? "Project") : entry.organization} / {entry.period}
          </p>
          <h1>{entry.title}</h1>
          {!isProject && entry.position && <p className="story-role">{entry.position}</p>}
          <p className="story-lede">{entry.summary}</p>
          {isProject && <p className="story-role">{entry.role}</p>}
          <ul className="tags" aria-label="Skills and technologies">
            {[...new Set([...entry.skills, ...entry.technologies])].map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </header>
        {isProject && (
          <div className="contribution">
            <p className="eyebrow">My contribution</p>
            <p>{entry.contribution}</p>
          </div>
        )}
        {entry.accomplishments.length > 0 && (
          <section className="story-prose" aria-labelledby="accomplishments-heading">
            <h2 id="accomplishments-heading">Selected accomplishments</h2>
            <ul className="resume-accomplishments">
              {entry.accomplishments.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}
        <nav className="story-contents" aria-label="On this page">
          {entry.sections.map((section, index) => (
            <a key={section.title} href={`#section-${index}`}>
              {section.title}
            </a>
          ))}
          {entry.decisions.length > 0 && <a href="#decisions">Design choices & tradeoffs</a>}
        </nav>
        {entry.diagram.length > 0 && (
          <Diagram
            steps={entry.diagram}
            caption={entry.diagram_caption}
            description={entry.diagram_description}
          />
        )}
        <div className="story-prose">
          {entry.sections.map((section, index) => (
            <section key={section.title} id={`section-${index}`}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
          {entry.decisions.length > 0 && (
            <section id="decisions" aria-labelledby="decisions-heading">
              <h2 id="decisions-heading">Design choices & tradeoffs</h2>
              {entry.decisions.map((decision) => (
                <article key={decision.title} className="decision-card">
                  <h3>{decision.title}</h3>
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
            </section>
          )}
          <aside className="evidence">
            <h2>Source & scope</h2>
            <p>{entry.evidence}</p>
          </aside>
          <div className="actions">
            {entry.links.map((link) => (
              <a className="button" href={link.url} key={link.url}>
                {link.label} ↗
              </a>
            ))}
            <Link className="button" href="/resume">
              Full profile ↗
            </Link>
          </div>
        </div>
      </article>
      <Contact profile={profile} />
    </main>
  );
}
