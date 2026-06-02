// @vitest-environment node
import { describe, expect, it } from "vitest";
import { renderOgImage, size } from "@/lib/og/render";

// ---------------------------------------------------------------------------
// OG image renderer — constants + response contract
//
// Full Satori/resvg rendering is NOT exercised here (too slow for unit tests,
// and pointless — next/og handles rendering correctness). We verify:
//   1. The exported `size` constant matches the required canvas dimensions.
//      (The OG alt text now lives in lib/seo.ts as the single source — see
//      pageMetadata's openGraph.images[].alt — and is covered by seo.test.ts.)
//   2. renderOgImage() resolves to a Response (ImageResponse) with status 200
//      and the correct content-type. Both are set synchronously by
//      ImageResponse's constructor, so body streaming is unnecessary.
//   3. The renderer builds the composition (fonts, profile image, achievements
//      data) without throwing.
// ---------------------------------------------------------------------------

describe("og/render constants", () => {
  it("exports size as 1200×630", () => {
    expect(size).toEqual({ width: 1200, height: 630 });
  });
});

describe("renderOgImage", () => {
  it("resolves without throwing", async () => {
    await expect(renderOgImage()).resolves.toBeDefined();
  });

  it("resolves to a Response with status 200", async () => {
    const res = await renderOgImage();
    expect(res.status).toBe(200);
  });

  it("resolves to a Response whose content-type includes image/png", async () => {
    const res = await renderOgImage();
    expect(res.headers.get("content-type")).toContain("image/png");
  });
});
