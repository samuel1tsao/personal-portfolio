import Link from "next/link";
import { notFound } from "next/navigation";
import { Contact, Diagram } from "@/components/Portfolio";
import { getPortfolio } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

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
  return (
    <main id="main">
      <article className="story-page wrap">
        <Link href="/#work" className="back-link">
          ← All work
        </Link>
        <header className="story-header">
          <p className="eyebrow">
            {story.kind === "project" ? "Applied ML project" : "Experience story"} / {story.period}
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
        {story.diagram.length > 0 && <Diagram steps={story.diagram} />}
        <div className="story-prose">
          {story.sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
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
        </div>
      </article>
      <Contact profile={profile} />
    </main>
  );
}
