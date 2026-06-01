// ---------------------------------------------------------------------------
// footer-date.ts — build-time footer timestamps for the arbital CV pages.
//
// The Rails footers rendered `Time.current.strftime(...)` per request. These
// pages are statically generated, so the stamp is fixed at build time — the
// same "deploy = publish" model the superteam route uses. UTC is used so the
// build machine's timezone never shifts the value.
// ---------------------------------------------------------------------------

/**
 * Retro footer stamp — mirrors Rails `strftime("%Y-%m-%d %H:%M UTC")`,
 * e.g. "2026-06-01 09:42 UTC".
 */
export function arbitalGeneratedAt(date: Date = new Date()): string {
  const iso = date.toISOString(); // 2026-06-01T09:42:13.123Z
  const day = iso.slice(0, 10); // 2026-06-01
  const time = iso.slice(11, 16); // 09:42
  return `${day} ${time} UTC`;
}

/**
 * Modern footer stamp — mirrors Rails `strftime("%Y-%m-%d")`, e.g. "2026-06-01".
 */
export function arbitalLastUpdated(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}
