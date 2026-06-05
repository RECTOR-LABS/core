import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { z } from "zod";

const HackathonSchema = z.object({
  name: z.string(),
  prize: z.string(),
  prizeValue: z.number().int().nonnegative(),
  deadlineLabel: z.string(),
  deadlineWIB: z.string(),
  deadlineSort: z.string().datetime().nullable(),
  fit: z.number().int().min(0).max(3),
  location: z.enum(["Remote", "Hybrid", "On-site"]),
  theme: z.string(),
  status: z.enum(["open", "upcoming", "closed", "dead", "ineligible"]),
  link: z.string().url().nullable(),
  platform: z.string(),
  eligibility: z.string(),
  about: z.string(),
  correction: z.string().nullable(),
});

const FileSchema = z.object({
  asOf: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "asOf must be YYYY-MM-DD"),
  source: z.object({ label: z.string(), url: z.string().url() }),
  hackathons: z.array(z.unknown()),
});

export type Hackathon = z.infer<typeof HackathonSchema>;

export interface HackathonsResult {
  asOf: string;
  source: { label: string; url: string };
  /** All entries in file order. */
  all: Hackathon[];
  /** Status open or upcoming (closed/dead/ineligible excluded). */
  enterable: Hackathon[];
  /** Nearest deadlineSort first; null deadlines grouped at the end. */
  sortedByDeadline: Hackathon[];
  /** Entries with a non-null correction, file order. */
  corrections: Hackathon[];
}

const DEFAULT_PATH = path.join(process.cwd(), "data", "hackathons.yml");
const ENTERABLE = new Set(["open", "upcoming"]);

export function loadHackathons(filePath: string = DEFAULT_PATH): HackathonsResult {
  const raw = fs.readFileSync(filePath, "utf8");
  const file = FileSchema.parse(yaml.load(raw));

  const all: Hackathon[] = file.hackathons.map((entry, i) => {
    const result = HackathonSchema.safeParse(entry);
    if (!result.success) {
      throw new Error(`Invalid hackathon at index ${i}: ${result.error.message}`);
    }
    return result.data;
  });

  const enterable = all.filter((h) => ENTERABLE.has(h.status));

  const sortedByDeadline = [...all].sort((a, b) => {
    const x = a.deadlineSort ? Date.parse(a.deadlineSort) : Infinity;
    const y = b.deadlineSort ? Date.parse(b.deadlineSort) : Infinity;
    return x - y;
  });

  const corrections = all.filter((h) => h.correction !== null);

  return { asOf: file.asOf, source: file.source, all, enterable, sortedByDeadline, corrections };
}
