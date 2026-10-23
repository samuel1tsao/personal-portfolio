import Link from "next/link";
import { notFound } from "next/navigation";
import { Contact, Diagram } from "@/components/Portfolio";
import { getPortfolio } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";

export const instant = false;

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const data = await getPortfolio();
  const story = data.stories.find((item) => item.slug === slug);
  if (!story) return pageMetadata("Story unavailable | Samuel Tsao");
  return pageMetadata(`${story.title} | Samuel Tsao`, story.summary, `/work/${slug}`);
}

export default async function StoryPage({ params }: Props) {
  const { slug } = await params;
  const { profile, stories } = await getPortfolio();
  const story = stories.find((item) => item.slug === slug);
  if (!story) notFound();
  const projects = stories.filter((item) => item.kind === "project" && item.slug !== slug);
  return (
    <main id="main">
      <article className="story-page wrap">
        <Link href={story.kind === "project" ? "/projects" : "/#work"} className="back-link">
          ← {story.kind === "project" ? "All projects" : "All work"}
        </Link>
        <header className="story-header">
          <p className="eyebrow">
            {story.kind === "project" ? "Project case study" : "Experience story"} / {story.period}
          </p>
          <h1>{story.title}</h1>
          <p className="story-lede">{story.summary}</p>
          <p className="story-role">{story.role}</p>
          <ul className="tags">
            {story.skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </header>
        <div className="contribution">
          <p className="eyebrow">My contribution</p>
          <p>{story.contribution}</p>
        </div>
        <nav className="story-contents" aria-label="On this page">
          {story.sections.map((section, index) => (
            <a key={section.title} href={`#section-${index}`}>
              {section.title}
            </a>
          ))}
          {story.decisions.length > 0 && <a href="#decisions">Design choices & tradeoffs</a>}
        </nav>
        {story.diagram.length > 0 && (
          <Diagram
            steps={story.diagram}
            caption={story.diagram_caption}
            description={story.diagram_description}
          />
        )}
        <div className="story-prose">
          {story.sections.map((section, index) => (
            <section key={section.title} id={`section-${index}`}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
          {story.decisions.length > 0 && (
            <section id="decisions" aria-labelledby="decisions-heading">
              <h2 id="decisions-heading">Design choices & tradeoffs</h2>
              {story.decisions.map((decision) => (
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
            <p>{story.evidence}</p>
          </aside>
          <div className="actions">
            {story.links.map((link) => (
              <a className="button" href={link.url} key={link.url}>
                {link.label} ↗
              </a>
            ))}
            <Link className="button" href="/resume">
              View resume ↗
            </Link>
          </div>
          {story.kind === "project" && (
            <section className="related-projects" aria-labelledby="related-heading">
              <h2 id="related-heading">More projects</h2>
              <ul>
                {projects.map((project) => (
                  <li key={project.slug}>
                    <Link href={`/work/${project.slug}`}>{project.title} ↗</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </article>
      <Contact profile={profile} />
    </main>
  );
}
