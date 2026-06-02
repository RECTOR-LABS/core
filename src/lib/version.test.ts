import { describe, it, expect } from "vitest";

import { parseVersionFile } from "./version";

describe("parseVersionFile", () => {
  it("returns the parsed object for a well-formed version file", () => {
    const raw =
      '{"sha":"abc123","branch":"main","commitCount":5,"buildTime":"2026-01-01T00:00:00.000Z"}';
    expect(parseVersionFile(raw)).toEqual({
      sha: "abc123",
      branch: "main",
      commitCount: 5,
      buildTime: "2026-01-01T00:00:00.000Z",
    });
  });

  it("degrades to {} for the literal `null` (valid JSON, but not an object)", () => {
    // Regression guard: JSON.parse("null") succeeds, so the catch never fires;
    // without the object guard, downstream `file.sha` throws at build time.
    expect(parseVersionFile("null")).toEqual({});
  });

  it("degrades to {} for non-object JSON scalars and arrays", () => {
    expect(parseVersionFile("42")).toEqual({});
    expect(parseVersionFile('"a string"')).toEqual({});
    expect(parseVersionFile("true")).toEqual({});
    expect(parseVersionFile("[1,2,3]")).toEqual({});
  });

  it("degrades to {} for malformed / non-JSON input", () => {
    expect(parseVersionFile("not json")).toEqual({});
    expect(parseVersionFile("{ broken")).toEqual({});
    expect(parseVersionFile("")).toEqual({});
  });

  it("degrades to {} for null / undefined input", () => {
    expect(parseVersionFile(null)).toEqual({});
    expect(parseVersionFile(undefined)).toEqual({});
  });
});
