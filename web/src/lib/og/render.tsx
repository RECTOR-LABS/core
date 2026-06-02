import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { loadAchievements } from "@/lib/content/achievements";
import { numberWithDelimiter } from "@/lib/format";

// ---------------------------------------------------------------------------
// OG image composition — extracted here so it can be served at the prod-parity
// path /og-image.png (via a Route Handler) instead of the /opengraph-image
// file-convention path. Already-shared social cards (LinkedIn/Twitter/Telegram)
// reference https://rectorspace.com/og-image.png, so the bytes served here must
// match the previous composition exactly.
// ---------------------------------------------------------------------------
export const size = { width: 1200, height: 630 };
export const alt = "RECTOR — Building for Eternity";

// ---------------------------------------------------------------------------
// Font + image loading via process.cwd() — consistent with this project's
// established pattern (posts.ts, achievements.ts, resume.ts all use this).
// process.cwd() during a Next.js build/runtime is the web/ directory.
//
// NOTE: import.meta.url is NOT used here because Turbopack's SSR bundler
// does not populate import.meta.url in the server-side bundle, causing
// `new URL(undefined)` at runtime.
// ---------------------------------------------------------------------------
const boldFont = fs.readFileSync(
  path.join(process.cwd(), "public", "fonts", "JetBrainsMono-Bold.ttf"),
);
const regularFont = fs.readFileSync(
  path.join(process.cwd(), "public", "fonts", "JetBrainsMono-Regular.ttf"),
);
const profileBuffer = fs.readFileSync(
  path.join(process.cwd(), "public", "images", "rector_profile_image.png"),
);

// ---------------------------------------------------------------------------
// Image generation
// Faithful composition of the MiniMagick layout (og_image_generator.rb):
//   Canvas 1200×630, background #2D2320
//   Profile image: 60×60 at left=50, top=55 (composited raw, no border-radius)
//   "RECTOR" label: white bold ~22px at left=120, top=60 (right of profile)
//   Orange accent bar: #E58C2E, 50×4px at left=80, top=225
//   "Building for Eternity": white bold 48px at left=80, top=250
//   Stats line: #B0A090 regular 22px at left=80, top=340
//   "rectorspace.com": regular 16px, bottom-right (right=50, bottom=40)
//
// Pixel-perfect parity with ImageMagick is not achievable (different
// rendering engine); composition and visual weight are faithfully reproduced.
// Satori requires display:flex on every multi-child element.
// ---------------------------------------------------------------------------
export async function renderOgImage(): Promise<ImageResponse> {
  const { winCount, totalEarnings } = loadAchievements();
  const stats = `Full-stack builder. Hackathon hunter. ${winCount} wins, ~$${numberWithDelimiter(totalEarnings)} earned.`;

  // Embed profile as a data URI so Satori can render it inline.
  const profileDataUri = `data:image/png;base64,${profileBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          position: "relative",
          width: "1200px",
          height: "630px",
          backgroundColor: "#2D2320",
          fontFamily: "JetBrains Mono",
        }}
      >
        {/* Profile image: 60×60 at +50+55 */}
        <img
          src={profileDataUri}
          alt="RECTOR profile"
          width={60}
          height={60}
          style={{
            position: "absolute",
            left: 50,
            top: 55,
          }}
        />

        {/* "RECTOR" label: white bold 22px at +120+60 (beside profile) */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            left: 120,
            top: 60,
            color: "white",
            fontSize: 22,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          RECTOR
        </div>

        {/* Orange accent bar: rectangle 80,225 130,229 → 50px wide, 4px tall */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            left: 80,
            top: 225,
            width: 50,
            height: 4,
            backgroundColor: "#E58C2E",
          }}
        />

        {/* "Building for Eternity" heading: white bold 48px at +80+250 */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            left: 80,
            top: 250,
            color: "white",
            fontSize: 48,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          Building for Eternity
        </div>

        {/* Stats line: #B0A090 regular 22px at +80+340 */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            left: 80,
            top: 340,
            color: "#B0A090",
            fontSize: 22,
            fontWeight: 400,
            lineHeight: 1,
          }}
        >
          {stats}
        </div>

        {/* "rectorspace.com": regular 16px, bottom-right at +50+40 from SE */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            right: 50,
            bottom: 40,
            color: "#B0A090",
            fontSize: 16,
            fontWeight: 400,
            lineHeight: 1,
          }}
        >
          rectorspace.com
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "JetBrains Mono",
          data: regularFont,
          weight: 400,
          style: "normal",
        },
        {
          name: "JetBrains Mono",
          data: boldFont,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );
}
