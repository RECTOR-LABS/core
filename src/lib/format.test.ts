import { describe, it, expect } from "vitest";
import { numberWithDelimiter, humanizeCount } from "./format";

// ---------------------------------------------------------------------------
// numberWithDelimiter — port of Rails number_with_delimiter (delimiter: ",")
// ---------------------------------------------------------------------------

describe("numberWithDelimiter", () => {
  it("returns '0' for zero", () => {
    expect(numberWithDelimiter(0)).toBe("0");
  });

  it("returns a plain string for numbers below 1000", () => {
    expect(numberWithDelimiter(850)).toBe("850");
  });

  it("inserts a comma at the thousands boundary", () => {
    expect(numberWithDelimiter(1234)).toBe("1,234");
  });

  it("handles a five-digit number with a single thousands separator", () => {
    expect(numberWithDelimiter(36050)).toBe("36,050");
  });

  it("handles a seven-digit number with two commas", () => {
    expect(numberWithDelimiter(1234567)).toBe("1,234,567");
  });
});

// ---------------------------------------------------------------------------
// humanizeCount — port of Rails number_to_human used in the activity bar
//   precision: 1, significant: false, format: '%n%u', units: { thousand: 'k' }
// ---------------------------------------------------------------------------

describe("humanizeCount", () => {
  describe("below 1000 — returns integer string, no unit", () => {
    it("returns '0' for 0", () => {
      expect(humanizeCount(0)).toBe("0");
    });

    it("returns '5' for 5", () => {
      expect(humanizeCount(5)).toBe("5");
    });

    it("returns '42' for 42", () => {
      expect(humanizeCount(42)).toBe("42");
    });

    it("returns '850' for 850", () => {
      expect(humanizeCount(850)).toBe("850");
    });

    it("returns '999' for 999", () => {
      expect(humanizeCount(999)).toBe("999");
    });
  });

  describe("1000 ≤ n < 1_000_000 — appends 'k' with 1 decimal, strips .0", () => {
    it("returns '1k' for 1000", () => {
      expect(humanizeCount(1000)).toBe("1k");
    });

    it("returns '1.5k' for 1500", () => {
      expect(humanizeCount(1500)).toBe("1.5k");
    });

    it("returns '1.9k' for 1900", () => {
      expect(humanizeCount(1900)).toBe("1.9k");
    });

    it("returns '2k' for 2000 (strips .0)", () => {
      expect(humanizeCount(2000)).toBe("2k");
    });

    it("returns '12k' for 12000", () => {
      expect(humanizeCount(12000)).toBe("12k");
    });

    it("returns '12.3k' for 12345", () => {
      expect(humanizeCount(12345)).toBe("12.3k");
    });

    it("returns '45.7k' for 45678", () => {
      expect(humanizeCount(45678)).toBe("45.7k");
    });
  });
});
