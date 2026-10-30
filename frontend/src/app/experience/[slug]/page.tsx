import { notFound } from "next/navigation";
import { EntryDetails } from "@/components/EntryDetails";
import { getPortfolio } from "@/lib/api";
import { findExperience } from "@/lib/projects";
import { pageMetadata } from "@/lib/seo";

export const instant = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const portfolio = await getPortfolio();
  const experience = findExperience(portfolio, slug);
  if (!experience) return pageMetadata("Experience unavailable | Samuel Tsao");
  return pageMetadata(
    `${experience.organization} | Samuel Tsao`,
    experience.summary,
    `/experience/${slug}`,
  );
}

export default async function ExperienceDetails({ params }: Props) {
  const { slug } = await params;
  const portfolio = await getPortfolio();
  const experience = findExperience(portfolio, slug);
  if (!experience) notFound();
  return <EntryDetails item={experience} portfolio={portfolio} />;
}
