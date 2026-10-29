import { redirect } from "next/navigation";
import { pageMetadata } from "@/lib/seo";

export const instant = false;

export const metadata = pageMetadata(
  "Experience | Samuel Tsao",
  "Role-by-role details, accomplishments, systems, and engineering impact across Samuel Tsao's career.",
  "/experience",
);

export default function ExperiencePage() {
  redirect("/resume#experience");
}
