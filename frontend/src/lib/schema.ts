import { z } from "zod";

const text = z.string().trim().min(1).max(8000);
const link = z.object({ label: text, url: z.url().startsWith("https://") });
export const portfolioEntrySchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  kind: z.enum(["project", "experience"]),
  title: text,
  organization: text.nullable(),
  position: text.nullable(),
  start: z.iso.date().nullable(),
  end: z.iso.date().nullable(),
  summary: text,
  role: text,
  period: text,
  contribution: text,
  status: text.nullable(),
  accomplishments: z.array(text),
  technologies: z.array(text),
  skills: z.array(text).min(1).max(12),
  sections: z.array(z.object({ title: text, body: text })),
  evidence: text,
  links: z.array(link),
  diagram: z.array(text),
  diagram_caption: text.default("Conceptual flow"),
  diagram_description: text.default("A simplified view of the project workflow."),
  decisions: z
    .array(
      z.object({
        title: text,
        choice: text,
        rationale: text,
        tradeoff: text,
      }),
    )
    .default([]),
  published: z.literal(true),
  order: z.number().int().nonnegative(),
});
export const portfolioSchema = z.object({
  schema_version: z.literal("2"),
  content_revision: z.string().regex(/^[a-f0-9]{64}$/),
  updated: z.iso.date(),
  profile: z.object({
    name: text,
    headline: text,
    intro: text,
    location: text,
    email: z.email(),
    about: text,
    education: z.array(text),
    skills: z.array(text),
    links: z.array(link),
    interests: z.array(text),
  }),
  entries: z.array(portfolioEntrySchema),
});
export type Portfolio = z.infer<typeof portfolioSchema>;
export type PortfolioEntry = z.infer<typeof portfolioEntrySchema>;
export type Profile = Portfolio["profile"];
