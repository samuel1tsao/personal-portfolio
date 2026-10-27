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
  const { profile, entries } = await getPortfolio();
  const roles = entries.filter((entry) => entry.kind === "experience");
  const projects = entries.filter((entry) => entry.kind === "project");
  return (
    <main id="main" className="resume-page wrap">
      <p className="eyebrow">Experience & education</p>
      <h1>{profile.name}</h1>
      <p className="story-lede">{profile.headline}</p>
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
        <p>{profile.about}</p>
        {profile.interests.length > 0 && (
          <p>
            <strong>Interests:</strong> {profile.interests.join(" · ")}
          </p>
        )}
      </section>
      <section>
        <h2>Experience</h2>
        {roles.map((role) => (
          <article key={role.slug}>
            <h3>
              <Link href={`/experience/${role.slug}`}>
                {role.organization} · {role.position} ↗
              </Link>
            </h3>
            <p className="muted">{role.start ? rolePeriod(role.start, role.end) : role.period}</p>
            <p>{role.summary}</p>
            <ul className="resume-accomplishments">
              {role.accomplishments.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="resume-links">
              <Link href={`/experience/${role.slug}`}>Full role details ↗</Link>
            </p>
          </article>
        ))}
      </section>
      {projects.length > 0 && (
        <section>
          <h2>Projects & applied research</h2>
          {projects.map((project) => (
            <article key={project.slug}>
              <h3>
                <Link href={`/work/${project.slug}`}>{project.title} ↗</Link>
              </h3>
              <p className="muted">{project.status}</p>
              <p>{project.summary}</p>
              <ul className="resume-accomplishments">
                {project.accomplishments.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="resume-technologies">
                <strong>Technologies:</strong>{" "}
                {[...new Set([...project.skills, ...project.technologies])].join(" · ")}
              </p>
              <p className="resume-links">
                <Link href={`/work/${project.slug}`}>Full project details & tradeoffs ↗</Link>
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
