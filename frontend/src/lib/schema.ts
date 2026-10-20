import { z } from "zod";

const text = z.string().trim().min(1).max(8000);
const link = z.object({ label: text, url: z.url().startsWith("https://") });
export const storySchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  kind: z.enum(["project", "experience"]),
  title: text,
  summary: text,
  role: text,
  period: text,
  contribution: text,
  skills: z.array(text),
  sections: z.array(z.object({ title: text, body: text })),
  evidence: text,
  links: z.array(link),
  diagram: z.array(text),
  published: z.literal(true),
  order: z.number().int().nonnegative(),
});
export const portfolioSchema = z.object({
  schema_version: z.literal("1"),
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
    roles: z.array(
      z.object({
        company: text,
        title: text,
        start: z.iso.date(),
        end: z.iso.date().nullable(),
        summary: text,
      }),
    ),
  }),
  stories: z.array(storySchema),
});
export type Portfolio = z.infer<typeof portfolioSchema>;
export type Story = z.infer<typeof storySchema>;
export type Profile = Portfolio["profile"];
