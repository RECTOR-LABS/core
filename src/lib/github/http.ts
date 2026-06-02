// 1 hour — matches the Rails hourly Solid Queue repo sync (config/recurring.yml)
export const REVALIDATE_SECONDS = 3600;

/**
 * ISR-aware fetch wrapper shared by the GitHub data loaders.
 * Next.js augments the global RequestInit with `next` (next/types/global.d.ts),
 * so no cast is needed.
 */
export function githubFetch(
  url: string,
  headers: Record<string, string>,
): Promise<Response> {
  return fetch(url, { headers, next: { revalidate: REVALIDATE_SECONDS } });
}
