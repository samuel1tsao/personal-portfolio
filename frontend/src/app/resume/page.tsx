import Link from "next/link";
import { OverviewReturn } from "@/components/OverviewReturn";

import { AchievementList, EmployerProjects } from "@/components/ResumeOverview";
import { getPortfolio } from "@/lib/api";
import { professionalRoles, splitProjects } from "@/lib/projects";
import { pageMetadata, rolePeriod } from "@/lib/seo";

export const instant = false;

export const metadata = pageMetadata(
  "Resume | Samuel Tsao",
  "Samuel Tsao's engineering accomplishments, applied ML research, personal projects, skills, and education.",
  "/resume",
);
export default async function Resume() {
  const { profile, entries } = await getPortfolio();
  const roles = professionalRoles(entries);
  const { machineLearning, softwareEngineering } = splitProjects(entries);
  return (
    <main id="main" className="resume-page wrap">
      <OverviewReturn />
      <p className="eyebrow">Experience & education</p>
      <h1>Resume & Work</h1>
      <p>{profile.name}</p>
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
      <nav className="overview-nav" aria-label="Resume sections">
        <a href="#experience">Experience</a>
        <a href="#projects">Projects</a>
        <a href="#education">Education</a>
        <a href="#skills">Skills</a>
      </nav>
      <section id="experience">
        <h2>Experience</h2>
        {roles.map((role) => (
          <article className="resume-experience" id={role.slug} key={role.slug}>
            <h3>
              <Link href={`/experience/${role.slug}`}>{role.organization}</Link>
            </h3>
            <p className="muted">{role.start ? rolePeriod(role.start, role.end) : role.period}</p>
            <p className="resume-role-title">{role.position}</p>
            <p>{role.summary}</p>
            <AchievementList entry={role} />
            <EmployerProjects entry={role} />
            <Link href={`/experience/${role.slug}`}>Full experience details</Link>
          </article>
        ))}
      </section>
      <section id="projects">
        <h2>Projects</h2>
        <ResumeProjectGroup title="Machine learning projects" projects={machineLearning} />
        <ResumeProjectGroup title="Software engineering projects" projects={softwareEngineering} />
      </section>
      <section id="education">
        <h2>Education</h2>
        {profile.education.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </section>
      <section id="skills">
        <h2>Skills</h2>
        <p>{profile.skills.join(" · ")}</p>
      </section>
      <Link className="inline-link" href="/#connect">
        Connect with Samuel ↗
      </Link>
    </main>
  );
}

function ResumeProjectGroup({
  title,
  projects,
}: {
  title: string;
  projects: ReturnType<typeof splitProjects>["machineLearning"];
}) {
  return (
    <section className="resume-project-group" aria-label={title}>
      <h3>{title}</h3>
      {projects.map((project) => (
        <article className="resume-personal-project" id={project.slug} key={project.slug}>
          <h4>
            <Link href={`/work/${project.slug}`}>{project.title}</Link>
          </h4>
          <p className="muted">{project.period}</p>
          <p>{project.summary}</p>
          <AchievementList entry={project} />
          <Link href={`/work/${project.slug}`}>Full project details</Link>
        </article>
      ))}
    </section>
  );
}
