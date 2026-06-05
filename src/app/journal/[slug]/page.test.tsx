import { describe, it, expect } from "vitest";
import { splitOnRadar } from "./page";

describe("splitOnRadar", () => {
  it("returns [whole, null] when no token present", () => {
    expect(splitOnRadar("# hi\n\nbody")).toEqual(["# hi\n\nbody", null]);
  });

  it("splits into intro + outro around the token", () => {
    expect(splitOnRadar("intro\n\n<!--RADAR-->\n\nouttro")).toEqual([
      "intro\n\n",
      "\n\nouttro",
    ]);
  });

  it("only splits on the first token occurrence", () => {
    const [intro, outro] = splitOnRadar("a<!--RADAR-->b<!--RADAR-->c");
    expect(intro).toBe("a");
    expect(outro).toBe("b<!--RADAR-->c");
  });
});
