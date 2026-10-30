import { z } from "zod";

const text = z.string().trim().min(1).max(8000);

export const MachineLearningTechnologyEnum = z.enum([
  "AI Gateway",
  "AI SDK",
  "Agentic workflows",
  "Automatic speech recognition",
  "CUDA",
  "Channel attention",
  "Coding agents",
  "ComfyUI",
  "Computer vision",
  "COCO",
  "DETR",
  "E5 embeddings",
  "EDSR",
  "Encoder-decoder models",
  "FLUX.1",
  "GPT",
  "Image super-resolution",
  "Jupyter",
  "KITTI",
  "Knowledge distillation",
  "LLM evaluation",
  "MLOps",
  "Machine-learning infrastructure",
  "NLI",
  "Neural networks",
  "Ollama",
  "On-device personalization",
  "Parameter-efficient fine-tuning",
  "PyTorch",
  "Qdrant",
  "RLHF",
  "RT-DETR",
  "Recommendation systems",
  "Reinforcement learning",
  "Sobel edge-aware loss",
  "Transformers",
  "U-Net",
  "Word embeddings",
  "YOLO",
  "YOLO11",
  "scikit-learn",
]);

export type MachineLearningTechnology = z.infer<typeof MachineLearningTechnologyEnum>;

export const SoftwareTechnologyEnum = z.enum([
  "A/B testing",
  "ACH",
  "API integrations",
  "AWS",
  "AWS ECS",
  "AWS Lambda",
  "Advertising infrastructure",
  "Algolia",
  "Angular",
  "AngularJS",
  "Aurora",
  "BullJS",
  "CI/CD",
  "CSS",
  "Caching",
  "Cassandra",
  "Cloudflare",
  "Data security",
  "Datadog",
  "Distributed systems",
  "Docker",
  "ESLint",
  "ETL pipelines",
  "Elasticsearch",
  "Enterprise middleware",
  "Enterprise technology evaluation",
  "EventBridge",
  "FastAPI",
  "Financial ledgers",
  "Flask",
  "GCP",
  "Geospatial APIs",
  "GitHub Actions",
  "Go",
  "Google Apps Script",
  "Google Sheets",
  "GraphQL",
  "HTML",
  "High-concurrency load testing",
  "Infrastructure libraries",
  "IoT",
  "Java",
  "JavaScript",
  "Jenkins",
  "Kafka",
  "Kinesis Firehose",
  "Kotlin",
  "Kubernetes",
  "Localization",
  "Microservices",
  "MySQL Aurora",
  "Next.js",
  "NoSQL",
  "Node.js",
  "PagerDuty",
  "Perl",
  "Plaid",
  "Playwright",
  "PostgreSQL",
  "Prettier",
  "Project management",
  "Puppet",
  "Pydantic",
  "Python",
  "REST APIs",
  "Rate limiting",
  "React",
  "Redis",
  "Relational databases",
  "S3",
  "SQL",
  "SQS",
  "Scryfall API",
  "Security protocols",
  "Spring Boot",
  "Temporal",
  "Terraform",
  "TypeScript",
  "UX collaboration",
  "VPC networking",
  "Vercel",
  "Vitest",
  "Zod",
  "esbuild",
  "pytest",
]);

export type SoftwareTechnology = z.infer<typeof SoftwareTechnologyEnum>;

export const MachineLearningSkillEnum = z.enum([
  "Agentic workflows",
  "Coding agents",
  "LLM evaluation",
  "RLHF",
  "RAG & claim validation",
  "Computer vision",
  "Object detection",
  "Image super-resolution",
  "Automatic speech recognition",
  "Speech bias evaluation",
  "Recommendation systems",
  "Reinforcement learning",
  "Transformer architectures",
  "Parameter-efficient fine-tuning",
  "Knowledge distillation",
  "Neural networks",
  "Vector search & retrieval",
  "On-device personalization",
  "MLOps",
]);

export type MachineLearningSkill = z.infer<typeof MachineLearningSkillEnum>;

export const SoftwareSkillEnum = z.enum([
  "Distributed systems",
  "Microservices",
  "High-concurrency engineering",
  "Event-driven architecture",
  "ETL pipelines",
  "Database migration",
  "Relational data modeling",
  "NoSQL data modeling",
  "Cache design",
  "Financial ledgers & transactions",
  "Search infrastructure",
  "Geospatial discovery",
  "Cloud infrastructure",
  "Container orchestration",
  "Infrastructure as Code",
  "CI/CD & automation",
  "Observability & incident response",
  "API design & integration",
  "Full-stack web development",
  "A/B testing & experimentation",
  "Data security & compliance",
  "Localization",
  "Financial simulation & analytics",
  "Automated test verification",
  "Engineering leadership & project management",
]);

export type SoftwareSkill = z.infer<typeof SoftwareSkillEnum>;

export const SkillEnum = z.union([MachineLearningSkillEnum, SoftwareSkillEnum]);
export type Skill = z.infer<typeof SkillEnum>;

export const TechnologyEnum = z.union([MachineLearningTechnologyEnum, SoftwareTechnologyEnum]);
export type Technology = z.infer<typeof TechnologyEnum>;

export const linkSchema = z.object({
  label: text,
  url: z.url().startsWith("https://"),
});

export type Link = z.infer<typeof linkSchema>;

export const impactSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  one_line_summary: z.string().trim().min(1).max(500),
  full_description: z.string().trim().min(1).max(4000),
});

export type Impact = z.infer<typeof impactSchema>;

export const projectSchema = z.object({
  project_id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  experience_id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: text,
  problem_statement: text,
  solution: text,
  impacts: z.array(impactSchema).min(1).max(10),
  ml_technologies: z.array(MachineLearningTechnologyEnum).default([]),
  software_technologies: z.array(SoftwareTechnologyEnum).default([]),
  ml_skills: z.array(MachineLearningSkillEnum).default([]),
  software_skills: z.array(SoftwareSkillEnum).default([]),
  links: z.array(linkSchema).default([]),
  featured: z.boolean().default(false),
  order: z.number().int().nonnegative().default(0),
});

export type Project = z.infer<typeof projectSchema>;

export const experienceTypeSchema = z.enum([
  "professional",
  "personal_software",
  "personal_machine_learning",
]);

export type ExperienceType = z.infer<typeof experienceTypeSchema>;

export const experienceSchema = z.object({
  experience_id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  type: experienceTypeSchema,
  organization: text,
  title: text,
  from_date: text.nullable().default(null),
  to_date: text.nullable().default(null),
  summary: text,
  ml_technologies: z.array(MachineLearningTechnologyEnum).default([]),
  software_technologies: z.array(SoftwareTechnologyEnum).default([]),
  ml_skills: z.array(MachineLearningSkillEnum).default([]),
  software_skills: z.array(SoftwareSkillEnum).default([]),
  projects: z.array(projectSchema).default([]),
  order: z.number().int().nonnegative().default(0),
});

export type Experience = z.infer<typeof experienceSchema>;

export const portfolioSchema = z.object({
  schema_version: z.literal("3"),
  content_revision: z.string().regex(/^[a-f0-9]{64}$/),
  updated: z.iso.date(),
  name: text,
  headline_summary: text,
  engineering_philosophy: text,
  location: text,
  education: z.array(text).default([]),
  interests: z.array(text).default([]),
  contact: z.object({
    email: z.email(),
    github_url: z.url().startsWith("https://"),
    linkedin_url: z.url().startsWith("https://"),
  }),
  ml_skills: z.array(MachineLearningSkillEnum).default([]),
  software_skills: z.array(SoftwareSkillEnum).default([]),
  ml_technologies: z.array(MachineLearningTechnologyEnum).default([]),
  software_technologies: z.array(SoftwareTechnologyEnum).default([]),
  work_experience: z.array(experienceSchema),
  personal_experience: z.array(experienceSchema),
});

export type Portfolio = z.infer<typeof portfolioSchema>;
