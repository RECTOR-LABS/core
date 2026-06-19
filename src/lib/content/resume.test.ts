import path from "node:path";
import { describe, it, expect } from "vitest";
import { loadResume } from "./resume";

const REAL_YAML = path.join(process.cwd(), "data", "resume.yml");

describe("loadResume", () => {
  it("loads and validates the real resume.yml without throwing", () => {
    expect(() => loadResume(REAL_YAML)).not.toThrow();
  });

  it("personal section has the correct name and email", () => {
    const resume = loadResume(REAL_YAML);
    expect(resume.personal.name).toBe("Rheza Sulaiman");
    expect(resume.personal.alias).toBe("RECTOR");
    expect(resume.personal.email).toBe("rector@rectorspace.com");
    expect(resume.personal.location).toBe("Jakarta, Indonesia");
  });

  it("personal section contains all expected string fields", () => {
    const { personal } = loadResume(REAL_YAML);
    expect(typeof personal.name).toBe("string");
    expect(personal.name.length).toBeGreaterThan(0);
    expect(typeof personal.website).toBe("string");
    expect(typeof personal.github).toBe("string");
  });

  it("skills is a non-empty array with the expected categories", () => {
    const { skills } = loadResume(REAL_YAML);
    expect(Array.isArray(skills)).toBe(true);
    expect(skills.length).toBeGreaterThan(0);
    // Real YAML has 6 categories
    expect(skills.length).toBe(6);
    const categories = skills.map((s) => s.category);
    expect(categories).toContain("Languages");
    expect(categories).toContain("Security");
    expect(categories).toContain("Frameworks");
    expect(categories).toContain("Databases");
    expect(categories).toContain("Infrastructure");
    expect(categories).toContain("Blockchain");
    // Each category has at least one item
    for (const skill of skills) {
      expect(Array.isArray(skill.items)).toBe(true);
      expect(skill.items.length).toBeGreaterThan(0);
    }
  });

  it("experience is a non-empty array with the expected fields", () => {
    const { experience } = loadResume(REAL_YAML);
    expect(Array.isArray(experience)).toBe(true);
    // Real YAML has 2 experience entries
    expect(experience.length).toBe(2);
    for (const exp of experience) {
      expect(typeof exp.title).toBe("string");
      expect(exp.title.length).toBeGreaterThan(0);
      expect(typeof exp.company).toBe("string");
      expect(Array.isArray(exp.bullets)).toBe(true);
      expect(exp.bullets.length).toBeGreaterThan(0);
      // Each bullet has a text field
      for (const bullet of exp.bullets) {
        expect(typeof bullet.text).toBe("string");
      }
    }
    // First entry is the (NDA-anonymized) most-recent role
    expect(experience[0].company).toBe("Confidential DeFi Startup");
  });

  it("projects is a non-empty array with the expected fields", () => {
    const { projects } = loadResume(REAL_YAML);
    expect(Array.isArray(projects)).toBe(true);
    // Real YAML has 7 projects
    expect(projects.length).toBe(7);
    for (const project of projects) {
      expect(typeof project.name).toBe("string");
      expect(project.name.length).toBeGreaterThan(0);
      expect(typeof project.github_url).toBe("string");
      expect(Array.isArray(project.tags)).toBe(true);
    }
    // SIP Protocol is the first project and is featured
    expect(projects[0].name).toBe("SIP Protocol");
    expect(projects[0].featured).toBe(true);
  });

  it("security_expertise is a non-empty array with area and detail fields", () => {
    const { security_expertise } = loadResume(REAL_YAML);
    expect(Array.isArray(security_expertise)).toBe(true);
    // Real YAML has 5 security expertise areas
    expect(security_expertise.length).toBe(5);
    for (const item of security_expertise) {
      expect(typeof item.area).toBe("string");
      expect(item.area.length).toBeGreaterThan(0);
      expect(typeof item.detail).toBe("string");
    }
    expect(security_expertise[0].area).toBe("Cryptographic Implementation");
  });

  it("stats section is present and has the expected entries", () => {
    const { stats } = loadResume(REAL_YAML);
    expect(Array.isArray(stats)).toBe(true);
    expect(stats.length).toBe(2);
    const labels = stats.map((s) => s.label);
    expect(labels).toContain("Vulnerabilities Found");
    expect(labels).toContain("Repositories");
    for (const stat of stats) {
      expect(typeof stat.number).toBe("number");
      expect(stat.number).toBeGreaterThan(0);
    }
  });

  it("summary section has pdf and web fields", () => {
    const { summary } = loadResume(REAL_YAML);
    expect(typeof summary.pdf).toBe("string");
    expect(summary.pdf.length).toBeGreaterThan(0);
    expect(typeof summary.web).toBe("string");
    expect(summary.web.length).toBeGreaterThan(0);
  });

  it("education section is present and non-empty", () => {
    const { education } = loadResume(REAL_YAML);
    expect(typeof education.text).toBe("string");
    expect(education.text.length).toBeGreaterThan(0);
  });
});
