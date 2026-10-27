import { notFound } from "next/navigation";
import { EntryDetails } from "@/components/EntryDetails";
import { getPortfolio } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";

export const instant = false;

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const entry = (await getPortfolio()).entries.find(
    (item) => item.slug === slug && item.kind === "project",
  );
  if (!entry) return pageMetadata("Project unavailable | Samuel Tsao");
  return pageMetadata(`${entry.title} | Samuel Tsao`, entry.summary, `/work/${slug}`);
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const { profile, entries } = await getPortfolio();
  const entry = entries.find((item) => item.slug === slug && item.kind === "project");
  if (!entry) notFound();
  return <EntryDetails entry={entry} profile={profile} />;
}
