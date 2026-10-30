import Link from "next/link";
import { OverviewReturn } from "@/components/OverviewReturn";
import { AchievementList, EmployerProjects, Technologies } from "@/components/ResumeOverview";
import { getPortfolio } from "@/lib/api";
import { professionalRoles, splitProjects, allPortfolioSkills } from "@/lib/projects";
import type { Project } from "@/lib/schema";
import { pageMetadata, rolePeriod } from "@/lib/seo";

export const instant = false;

export const metadata = pageMetadata(
  "Resume | Samuel Tsao",
  "Samuel Tsao's engineering accomplishments, applied ML research, personal projects, skills, and education.",
  "/resume",
);

export default async function Resume() {
  const portfolio = await getPortfolio();
  const roles = professionalRoles(portfolio);
  const { machineLearning, softwareEngineering } = splitProjects(portfolio);

  return (
    <main id="main" className="resume-page wrap">
      <OverviewReturn />
      <p className="eyebrow">Experience & education</p>
      <h1>Resume & Work</h1>
      <p>{portfolio.name}</p>
      <p className="story-lede">{portfolio.headline_summary}</p>
      <p>
        {portfolio.location} ·{" "}
        <a href={`mailto:${portfolio.contact.email}`}>{portfolio.contact.email}</a>
      </p>
      <p className="resume-note">
        A comprehensive overview of my experience and projects, with full case studies linked below.
      </p>
      <p className="resume-links">
        <a href={portfolio.contact.github_url}>GitHub ↗</a>
        <a href={portfolio.contact.linkedin_url}>LinkedIn ↗</a>
      </p>
      <nav className="overview-nav" aria-label="Resume sections">
        <a href="#experience">Experience</a>
        <a href="#projects">Projects</a>
        <a href="#education">Education</a>
        <a href="#skills">Skills & Technologies</a>
      </nav>

      <section id="experience">
        <h2>Experience</h2>
        {roles.map((role) => (
          <article className="resume-experience" id={role.experience_id} key={role.experience_id}>
            <h3>
              <Link href={`/experience/${role.experience_id}`}>{role.organization}</Link>
            </h3>
            <p className="muted">{rolePeriod(role.from_date, role.to_date)}</p>
            <p className="resume-role-title">{role.title}</p>
            <p>{role.summary}</p>
            <AchievementList item={role} />
            <EmployerProjects entry={role} />
            <Technologies item={role} />
            <Link href={`/experience/${role.experience_id}`}>Full experience details</Link>
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
        {portfolio.education.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </section>

      <section id="skills">
        <h2>Skills & Technologies</h2>
        <div style={{ marginBottom: "1.5rem" }}>
          <h3>All Engineering Competencies</h3>
          <p>{allPortfolioSkills(portfolio).all.join(" · ")}</p>
        </div>
        <div style={{ marginBottom: "1.5rem" }}>
          <h3>Machine Learning</h3>
          <p>
            <strong>ML Technologies:</strong> {portfolio.ml_technologies.join(" · ")}
          </p>
          <p>
            <strong>ML Competencies:</strong> {portfolio.ml_skills.join(" · ")}
          </p>
        </div>
        <div>
          <h3>Software Engineering</h3>
          <p>
            <strong>Software Technologies:</strong> {portfolio.software_technologies.join(" · ")}
          </p>
          <p>
            <strong>Core Competencies:</strong> {portfolio.software_skills.join(" · ")}
          </p>
        </div>
      </section>

      <Link className="inline-link" href="/#connect">
        Connect with Samuel ↗
      </Link>
    </main>
  );
}

function ResumeProjectGroup({ title, projects }: { title: string; projects: Project[] }) {
  return (
    <section className="resume-project-group" aria-label={title}>
      <h3>{title}</h3>
      {projects.map((project) => (
        <article
          className="resume-personal-project"
          id={project.project_id}
          key={project.project_id}
        >
          <h4>
            <Link href={`/work/${project.project_id}`}>{project.title}</Link>
          </h4>
          <p>{project.impacts[0]?.one_line_summary ?? project.problem_statement}</p>
          <AchievementList item={project} />
          <Technologies item={project} />
          <Link href={`/work/${project.project_id}`}>Full project details</Link>
        </article>
      ))}
    </section>
  );
}
