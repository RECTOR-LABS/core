import { cache } from "react";
import type { Metadata } from "next";
import {
  GitBranch,
  Mail,
  Globe,
  MapPin,
  ArrowUpRight,
  ShieldCheck,
  Code2,
  Lock,
  Server,
  Database,
  Blocks,
  Wrench,
  Sparkles,
  Zap,
  BookOpen,
  Trophy,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { loadResume } from "@/lib/content/resume";
import { loadAchievements } from "@/lib/content/achievements";
import { webBullets, featuredProjects } from "@/lib/content/superteam";

import { Counter } from "@/components/islands/Counter";
import { ScrollReveal } from "@/components/islands/ScrollReveal";
import { PrintButton } from "@/components/islands/PrintButton";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import "./hoe.css";

// Dedupe the YAML read+parse across generateMetadata and the page body within a
// single render pass (same cache() pattern as the work + superteam routes).
const getResume = cache(() => loadResume());

// ---------------------------------------------------------------------------
// Static SSG. All data is local YAML (resume.yml + achievements.yml) — no live
// GitHub, no request-time fetch → no `revalidate`. Deploy = publish.
// noindex,nofollow is inherited from the shared /apply layout.
// ---------------------------------------------------------------------------

export function generateMetadata(): Metadata {
  const resume = getResume();
  return {
    title: "Rheza Sulaiman — Head of Engineering (Crypto / Fintech)",
    description:
      "Crypto-native engineering leader. Tech Lead @ Arbital. 1st of 116 in a Solana security audit. Ships production systems across Rust, TypeScript, Python.",
    openGraph: {
      title: "Rheza Sulaiman — Head of Engineering (Crypto / Fintech)",
      description: resume.summary.web,
      type: "profile",
    },
  };
}

// ── Curated hero metrics (presentation-only; not the YAML stats) ────────────
const METRICS = [
  { value: "1st", number: 1, sub: "of 116 · Solana security audit" },
  { value: "13", number: 13, sub: "vulnerabilities reported" },
  { value: "11", number: 11, sub: "wins · hackathons & bounties" },
  { value: "$36K+", number: 36, sub: "ecosystem earnings" },
  { value: "5+", number: 5, sub: "languages shipped to production" },
  { value: "64+", number: 64, sub: "public repositories" },
] as const;

// ── Leadership principles ───────────────────────────────────────────────────
const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: "Security is a property, not a phase",
    body: "Ship audited. I placed 1st of 116 reviewing 14 protocols — I bring that lens into every system my teams build.",
  },
  {
    icon: Code2,
    title: "Polyglot by necessity",
    body: "Rust, TypeScript, Python, Ruby, SQL — all in production. The right tool wins; a new language (Go next) is a 2–4 week ramp, not a blocker.",
  },
  {
    icon: Zap,
    title: "Ship under pressure",
    body: "11 competition wins translate hackathon velocity into production discipline — fast without cutting the edges that matter.",
  },
  {
    icon: BookOpen,
    title: "Document or it didn't happen",
    body: "Every architectural choice is traceable. The next engineer — or auditor — can follow the why, not just the what.",
  },
] as const;

// ── Skill-category → icon map ───────────────────────────────────────────────
const SKILL_ICON: Record<string, typeof Code2> = {
  Languages: Code2,
  Security: Lock,
  Frameworks: Sparkles,
  Databases: Database,
  Infrastructure: Server,
  Blockchain: Blocks,
};

// ── Date helpers ────────────────────────────────────────────────────────────
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function fmtDate(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}
function dateRange(a: string, b: string): string {
  return `${fmtDate(a)} — ${fmtDate(b)}`;
}

export default function HeadOfEngineeringPage() {
  const resume = getResume();
  const { totalEarnings, winCount } = loadAchievements();
  const { personal, experience, projects, skills, security_expertise, education } = resume;

  const githubUrl = `https://${personal.github}`;
  const websiteUrl = personal.website.startsWith("http")
    ? personal.website
    : `https://${personal.website}`;
  const avatarSrc = `/images/${personal.avatar}`;
  const initials = personal.name.split(" ").map((p) => p[0]).join("").slice(0, 2);
  const buildDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="hoe-page">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden">
        <div className="hoe-grid-bg pointer-events-none absolute inset-0 hoe-no-print" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-5 pt-16 pb-12 sm:pt-24">
          <div className="flex flex-col items-center text-center">
            <Avatar className="size-24 border-2 border-primary/40 shadow-lg sm:size-28">
              <AvatarImage src={avatarSrc} alt={personal.name} />
              <AvatarFallback className="text-2xl font-semibold">{initials}</AvatarFallback>
            </Avatar>

            <div className="mt-5 flex items-center gap-2 text-xs">
              <Badge variant="outline" className="border-primary/40 text-primary">
                Open to Head of Engineering roles
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <MapPin className="size-3" /> Remote · {personal.location.split(",")[0]}
              </Badge>
            </div>

            <h1 className="hoe-text-gradient mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
              {personal.name}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              <span className="font-medium text-foreground">{personal.alias}</span>
              {" · "}
              Head of Engineering — Fintech (Crypto)
            </p>

            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
              Crypto-native engineering leader. I ship production systems across
              stacks — Rust, TypeScript, Python — and lead teams that do the same.
              Tech Lead at Arbital, where I built the Agentic Terminal from scratch.
              1st of 116 in a Solana security audit.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
              <Button asChild>
                <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                  <GitBranch className="size-4" /> GitHub
                </a>
              </Button>
              <Button asChild variant="secondary">
                <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
                  <Globe className="size-4" /> rectorspace.com
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href={`mailto:${personal.email}`}>
                  <Mail className="size-4" /> {personal.email}
                </a>
              </Button>
              <PrintButton />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-24">
        {/* ── METRICS ──────────────────────────────────────────────────────── */}
        <ScrollReveal className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" delay={70}>
          {METRICS.map((m) => (
            <div
              key={m.sub}
              className="hoe-card-hover rounded-xl border border-border bg-card/60 p-4 text-center"
            >
              <div className="text-2xl font-bold text-foreground sm:text-3xl">
                <Counter number={m.number} display={m.value} />
              </div>
              <div className="mt-1 text-[11px] leading-tight text-muted-foreground">{m.sub}</div>
            </div>
          ))}
        </ScrollReveal>

        {/* ── ABOUT ────────────────────────────────────────────────────────── */}
        <section className="mt-16">
          <SectionTitle eyebrow="01" title="Profile" />
          <Card className="hoe-card-hover">
            <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>
                I lead engineering for crypto-native products end-to-end —
                architecture, security, and the team that ships them. As Tech
                Lead at <strong className="text-foreground">Arbital</strong>, I
                architected and built the Agentic Terminal from scratch in Rust
                and TypeScript, after joining as a full-stack developer and
                earning the promotion to lead the product line.
              </p>
              <p>
                Before that, two years building and auditing Solana Anchor
                programs independently — including a privacy layer (SIP
                Protocol) combining NEAR Intents and Zcash shielded transactions,
                and a government spending-transparency platform on Solana. I
                also build production AI agents and the MCP tooling they run on.
              </p>
              <p className="text-foreground">
                {education.text}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* ── SIGNATURE: SECURITY AUDIT WIN ────────────────────────────────── */}
        <section className="mt-16">
          <SectionTitle eyebrow="★" title="Signature — Security Audit" />
          <Card className="hoe-card-hover overflow-hidden border-primary/30">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShieldCheck className="size-5 text-primary" />
                  1st of 116 — Solana Security Audit
                </CardTitle>
                <Badge className="gap-1">
                  <Trophy /> Top finisher
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>
                Reviewed <strong className="text-foreground">14 open-source
                protocols</strong> and reported{" "}
                <strong className="text-foreground">13 findings</strong>. The top
                finding was a framework-level Anchor CPI vulnerability
                (CVSS 7.5) that was fixed upstream — a class of bug affecting
                every program built on the framework.
              </p>
              <p>
                Security is not a separate phase in my work; it is the lens I use
                to design systems — PDA validation, signer authority, privilege
                escalation, reentrancy, and cryptographic correctness from day
                one.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* ── EXPERIENCE ───────────────────────────────────────────────────── */}
        <section className="mt-16">
          <SectionTitle eyebrow="02" title="Experience" />
          <div className="space-y-5">
            {experience.map((exp, i) => {
              const bullets = webBullets(exp.bullets);
              const isFeatured = i === 0;
              return (
                <Card
                  key={`${exp.company}-${exp.date_start}`}
                  className={`hoe-card-hover ${isFeatured ? "border-primary/40" : ""}`}
                >
                  <CardHeader>
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <CardTitle className="text-base sm:text-lg">{exp.title}</CardTitle>
                        {isFeatured && (
                          <Badge variant="secondary" className="gap-1">
                            <Sparkles className="size-3" /> Most recent · Tech Lead
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{exp.company}</span>
                        <span aria-hidden>·</span>
                        <span>{dateRange(exp.date_start, exp.date_end)}</span>
                        <span aria-hidden>·</span>
                        <span>{exp.location}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {bullets.map((b) => (
                        <li key={b.text} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/70" aria-hidden />
                          <span>{b.text}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ── FEATURED PROJECTS ────────────────────────────────────────────── */}
        <section className="mt-16">
          <SectionTitle eyebrow="03" title="Selected Work" />
          <ScrollReveal className="grid gap-4 sm:grid-cols-2" delay={80}>
            {featuredProjects(projects).map((p, i) => {
              const flagship = i === 0;
              return (
                <Card
                  key={p.name}
                  className={cn("hoe-card-hover group", flagship && "sm:col-span-2")}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">
                        {p.name}
                        {flagship ? (
                          <Badge variant="secondary" className="ml-2 align-middle text-[10px]">
                            Flagship
                          </Badge>
                        ) : null}
                      </CardTitle>
                      <a
                        href={p.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground transition-colors hover:text-primary"
                        aria-label={`${p.name} on GitHub`}
                      >
                        <ArrowUpRight className="size-4" />
                      </a>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={cn(
                        flagship
                          ? "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
                          : "space-y-3",
                      )}
                    >
                      <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                        {p.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {p.tags.slice(0, 5).map((t) => (
                          <Badge
                            key={t}
                            variant="outline"
                            className="font-normal text-muted-foreground"
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {p.live_url ? (
                      <a
                        href={p.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Globe className="size-3" /> {p.live_url.replace(/^https?:\/\//, "")}
                      </a>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </ScrollReveal>
        </section>

        {/* ── SKILLS (tabs, polyglot-led) ──────────────────────────────────── */}
        <section className="mt-16">
          <SectionTitle eyebrow="04" title="Capabilities" />
          <Tabs defaultValue={skills[0]?.category ?? "Languages"}>
            <TabsList className="flex w-full flex-wrap justify-start gap-1 h-auto p-1">
              {skills.map((s) => {
                const Icon = SKILL_ICON[s.category] ?? Wrench;
                return (
                  <TabsTrigger key={s.category} value={s.category} className="gap-1.5">
                    <Icon className="size-3.5" /> {s.category}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {skills.map((s) => (
              <TabsContent key={s.category} value={s.category} className="mt-4">
                {s.category === "Languages" && (
                  <p className="mb-3 text-xs text-muted-foreground">
                    Polyglot to production. Currently ramping on{" "}
                    <span className="font-medium text-foreground">Go</span> — the
                    mental model (concurrency, async runtime) transfers directly
                    from Rust/Tokio.
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  {s.items.map((item) => (
                    <Badge key={item} variant="secondary" className="px-2.5 py-1 font-normal">
                      {item}
                    </Badge>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Security expertise — visible grid (depth at a glance) */}
          <div className="mt-8">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Lock className="size-4 text-primary" /> Security expertise
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {security_expertise.map((area, i) => (
                <div
                  key={area.area}
                  className={cn(
                    "rounded-lg border border-border bg-card/50 p-3",
                    i === security_expertise.length - 1 && "sm:col-span-2",
                  )}
                >
                  <div className="text-sm font-medium text-foreground">{area.area}</div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{area.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW I LEAD ───────────────────────────────────────────────────── */}
        <section className="mt-16">
          <SectionTitle eyebrow="05" title="How I lead" />
          <ScrollReveal className="grid gap-4 sm:grid-cols-2" delay={80}>
            {PRINCIPLES.map((p) => (
              <Card key={p.title} className="hoe-card-hover">
                <CardContent className="flex gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <p.icon className="size-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{p.title}</div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ScrollReveal>
        </section>

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <footer className="mt-20 border-t border-border pt-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="text-sm text-muted-foreground">
              <div className="font-medium text-foreground">{personal.name}</div>
              <div className="text-xs">
                {personal.email} · {totalEarnings > 0 || winCount > 0 ? "Open to Head of Engineering (Crypto / Fintech)" : ""}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="ghost" size="sm">
                <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                  <GitBranch className="size-3.5" /> GitHub
                </a>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                  <Globe className="size-3.5" /> Website
                </a>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <a href={`mailto:${personal.email}`} className="gap-1.5">
                  <Mail className="size-3.5" /> Email
                </a>
              </Button>
            </div>
          </div>
          <Separator className="my-5" />
          <p className="hoe-no-print text-[11px] text-muted-foreground">
            Built with Next.js 16 · React 19 · shadcn/ui · Tailwind v4 ·{" "}
            {winCount} wins · ${totalEarnings.toLocaleString("en-US")}+ earned ·
            updated {buildDate}
          </p>
        </footer>
      </main>
    </div>
  );
}

// ── Small local section-title helper ────────────────────────────────────────
function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="font-mono text-xs text-primary">{eyebrow}</span>
      <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">{title}</h2>
      <span className="h-px flex-1 bg-border" aria-hidden />
    </div>
  );
}
