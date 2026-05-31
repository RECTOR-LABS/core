// @vitest-environment node
import { describe, expect, it } from "vitest";
import Image, {
  alt,
  contentType,
  size,
} from "@/app/opengraph-image";

// ---------------------------------------------------------------------------
// opengraph-image — static exports + response contract
//
// Full Satori/resvg rendering is NOT exercised here (too slow for unit tests,
// and pointless — Next.js handles rendering correctness). We verify:
//   1. Static metadata exports match the required canvas dimensions.
//   2. The default function returns a Response with status 200 and the
//      correct content-type header.  Both are set synchronously by
//      ImageResponse's constructor, so body streaming is unnecessary.
// ---------------------------------------------------------------------------

describe("opengraph-image static exports", () => {
  it("exports size as 1200×630", () => {
    expect(size).toEqual({ width: 1200, height: 630 });
  });

  it("exports contentType as image/png", () => {
    expect(contentType).toBe("image/png");
  });

  it("exports a non-empty alt string", () => {
    expect(typeof alt).toBe("string");
    expect(alt.length).toBeGreaterThan(0);
  });
});

describe("opengraph-image default handler", () => {
  it("returns a Response with status 200", async () => {
    const res = await Image();
    expect(res.status).toBe(200);
  });

  it("returns a Response whose content-type includes image/png", async () => {
    const res = await Image();
    expect(res.headers.get("content-type")).toContain("image/png");
  });
});
