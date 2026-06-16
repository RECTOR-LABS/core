import { describe, it, expect } from "vitest";
import { splitOnRadar } from "./page";

describe("splitOnRadar", () => {
  it("returns [whole, null, null] when no token present", () => {
    expect(splitOnRadar("# hi\n\nbody")).toEqual(["# hi\n\nbody", null, null]);
  });

  it("splits into intro + outro around a bare token, key null", () => {
    expect(splitOnRadar("intro\n\n<!--RADAR-->\n\nouttro")).toEqual([
      "intro\n\n",
      "\n\nouttro",
      null,
    ]);
  });

  it("extracts the dataset key from a keyed token", () => {
    expect(splitOnRadar("x\n\n<!--RADAR:hackathons-2026-06-remote-->\n\ny")).toEqual([
      "x\n\n",
      "\n\ny",
      "hackathons-2026-06-remote",
    ]);
  });

  it("only splits on the first token occurrence", () => {
    const [intro, outro, key] = splitOnRadar("a<!--RADAR-->b<!--RADAR-->c");
    expect(intro).toBe("a");
    expect(outro).toBe("b<!--RADAR-->c");
    expect(key).toBeNull();
  });
});
