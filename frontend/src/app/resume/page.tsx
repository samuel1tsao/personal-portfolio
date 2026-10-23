import Link from "next/link";
import { getPortfolio } from "@/lib/api";
import { pageMetadata, rolePeriod } from "@/lib/seo";

export const instant = false;

export const metadata = pageMetadata(
  "Resume | Samuel Tsao",
  "Samuel Tsao's engineering accomplishments, applied ML research, personal projects, skills, and education.",
  "/resume",
);
export default async function Resume() {
  const { profile, stories } = await getPortfolio();
  return (
    <main id="main" className="resume-page wrap">
      <p className="eyebrow">Experience & education</p>
      <h1>{profile.name}</h1>
      <p className="story-lede">Senior Software Engineer · Systems & Applied ML</p>
      <p>
        {profile.location} · <a href={`mailto:${profile.email}`}>{profile.email}</a>
      </p>
      <p className="resume-note">Web resume · Use your browser’s Print / Save as PDF for a copy.</p>
      <p className="resume-links">
        {profile.links.map((link) => (
          <a key={link.url} href={link.url}>
            {link.label} ↗
          </a>
        ))}
      </p>
      <section>
        <h2>Profile</h2>
        <p>{profile.intro}</p>
      </section>
      <section>
        <h2>Experience</h2>
        {profile.roles.map((role) => (
          <article key={role.company}>
            <h3>
              {role.company} · {role.title}
            </h3>
            <p className="muted">{rolePeriod(role.start, role.end)}</p>
            <p>{role.summary}</p>
            <ul className="resume-accomplishments">
              {role.accomplishments.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {role.technologies.length > 0 && (
              <p className="resume-technologies">
                <strong>Technologies:</strong> {role.technologies.join(" · ")}
              </p>
            )}
          </article>
        ))}
      </section>
      {profile.projects.length > 0 && (
        <section>
          <h2>Projects & applied research</h2>
          {profile.projects.map((project) => (
            <article key={project.name}>
              <h3>
                {stories.some((story) => story.slug === project.story_slug) ? (
                  <Link href={`/work/${project.story_slug}`}>{project.name} ↗</Link>
                ) : (
                  project.name
                )}
              </h3>
              <p className="muted">{project.status}</p>
              <p>{project.summary}</p>
              <ul className="resume-accomplishments">
                {project.accomplishments.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="resume-technologies">
                <strong>Technologies:</strong> {project.technologies.join(" · ")}
              </p>
              <p className="resume-links">
                {stories.some((story) => story.slug === project.story_slug) && (
                  <Link href={`/work/${project.story_slug}`}>Product details & tradeoffs ↗</Link>
                )}
                {project.links.map((link) => (
                  <a key={link.url} href={link.url}>
                    {link.label} ↗
                  </a>
                ))}
              </p>
            </article>
          ))}
        </section>
      )}
      <section>
        <h2>Education</h2>
        {profile.education.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </section>
      <section>
        <h2>Skills</h2>
        <p>{profile.skills.join(" · ")}</p>
      </section>
      <Link className="inline-link" href="/#connect">
        Connect with Samuel ↗
      </Link>
    </main>
  );
}
