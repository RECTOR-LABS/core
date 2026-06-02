import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema — mirrors the top-level keys and nested shapes of config/resume.yml.
// Fields are modelled from the actual file; no invented structure.
// ---------------------------------------------------------------------------

const PersonalSchema = z.object({
  name: z.string(),
  alias: z.string(),
  location: z.string(),
  email: z.string().email(),
  website: z.string(),
  github: z.string(),
  telegram: z.string(),
  twitter: z.string(),
  avatar: z.string(),
});

const StatSchema = z.object({
  label: z.string(),
  value: z.string(),
  number: z.number(),
});

const SummarySchema = z.object({
  pdf: z.string(),
  web: z.string(),
});

const SkillSchema = z.object({
  category: z.string(),
  items: z.array(z.string()),
});

const BulletSchema = z.object({
  text: z.string(),
  pdf: z.boolean(),
  web: z.boolean(),
});

const ExperienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  date_start: z.string(),
  date_end: z.string(),
  location: z.string(),
  bullets: z.array(BulletSchema),
});

const ProjectSchema = z.object({
  name: z.string(),
  org: z.string(),
  github_url: z.string().url(),
  live_url: z.string().url().optional(),
  description: z.string(),
  tags: z.array(z.string()),
  featured: z.boolean(),
});

const SecurityExpertiseSchema = z.object({
  area: z.string(),
  detail: z.string(),
});

const EducationSchema = z.object({
  text: z.string(),
});

const ResumeSchema = z.object({
  personal: PersonalSchema,
  stats: z.array(StatSchema),
  summary: SummarySchema,
  skills: z.array(SkillSchema),
  experience: z.array(ExperienceSchema),
  projects: z.array(ProjectSchema),
  security_expertise: z.array(SecurityExpertiseSchema),
  education: EducationSchema,
});

// ---------------------------------------------------------------------------
// Public type — inferred directly from the schema (no `any`, no duplication)
// ---------------------------------------------------------------------------
export type Resume = z.infer<typeof ResumeSchema>;

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

const DEFAULT_PATH = path.join(process.cwd(), "data", "resume.yml");

/**
 * Load and validate the resume YAML file.
 * Default path: <cwd>/data/resume.yml
 *
 * Returns a fully-typed Resume object validated against the real
 * config/resume.yml structure (personal, stats, summary, skills,
 * experience, projects, security_expertise, education).
 *
 * Awards are NOT in resume.yml — they live in achievements.yml.
 * Use loadAchievements() for those (matching Rails convention).
 */
export function loadResume(filePath: string = DEFAULT_PATH): Resume {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = yaml.load(raw);

  const result = ResumeSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Invalid resume.yml: ${result.error.message}`);
  }

  return result.data;
}
