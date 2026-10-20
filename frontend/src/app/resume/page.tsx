import Link from "next/link";
import { getPortfolio } from "@/lib/api";
import { pageMetadata, rolePeriod } from "@/lib/seo";

export const metadata = pageMetadata(
  "Resume | Samuel Tsao",
  "Samuel Tsao's software engineering experience, skills, and education.",
  "/resume",
);
export const dynamic = "force-static";

export default async function Resume() {
  const { profile } = await getPortfolio();
  return (
    <main id="main" className="resume-page wrap">
      <p className="eyebrow">Experience & education</p>
      <h1>{profile.name}</h1>
      <p className="story-lede">Senior Software Engineer · Systems & Applied ML</p>
      <p>
        {profile.location} · <a href={`mailto:${profile.email}`}>{profile.email}</a>
      </p>
      <p className="resume-note">Web resume · Use your browser’s Print / Save as PDF for a copy.</p>
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
          </article>
        ))}
      </section>
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
