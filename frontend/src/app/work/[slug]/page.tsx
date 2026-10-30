import { notFound } from "next/navigation";
import { EntryDetails } from "@/components/EntryDetails";
import { getPortfolio } from "@/lib/api";
import { findProject } from "@/lib/projects";
import { pageMetadata } from "@/lib/seo";

export const instant = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const portfolio = await getPortfolio();
  const project = findProject(portfolio, slug);
  if (!project) return pageMetadata("Project unavailable | Samuel Tsao");
  return pageMetadata(
    `${project.title} | Samuel Tsao`,
    project.impacts[0]?.one_line_summary ?? project.problem_statement,
    `/work/${slug}`,
  );
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const portfolio = await getPortfolio();
  const project = findProject(portfolio, slug);
  if (!project) notFound();
  return <EntryDetails item={project} portfolio={portfolio} />;
}
