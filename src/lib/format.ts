/**
 * Number formatting helpers for the Next.js port of RECTOR LABS CORE.
 *
 * Faithful ports of Rails number helpers used on the homepage:
 *   - numberWithDelimiter → number_with_delimiter (delimiter: ",")
 *   - humanizeCount       → number_to_human (precision: 1, significant: false,
 *                           format: '%n%u', units: { thousand: 'k' })
 *
 * Architectural constraints:
 *   - No React / no next/* imports. Pure functions.
 *   - Both functions accept non-negative integers as inputs (matching the
 *     real data domain: stars, commits, forks — all ≥ 0 and well under 1e6).
 *
 * @see app/helpers/achievements_helper.rb (number_with_delimiter usage)
 * @see app/views/pages/home.html.erb (activity-bar number_to_human usage)
 */

// ---------------------------------------------------------------------------
// numberWithDelimiter
// ---------------------------------------------------------------------------

/**
 * Format a non-negative integer with thousands-separator commas.
 *
 * Port of Rails `number_with_delimiter(n)` (default delimiter: ",").
 * Implementation delegates to `toLocaleString("en-US")` which produces
 * identical output to Rails for the non-negative integer domain used here.
 *
 * @example
 *   numberWithDelimiter(0)       // "0"
 *   numberWithDelimiter(1234)    // "1,234"
 *   numberWithDelimiter(1234567) // "1,234,567"
 */
export function numberWithDelimiter(n: number): string {
  return n.toLocaleString("en-US");
}

// ---------------------------------------------------------------------------
// humanizeCount
// ---------------------------------------------------------------------------

/**
 * Humanize a count with a "k" suffix for thousands.
 *
 * Port of the Rails call used in the homepage activity bar:
 *   number_to_human(value, precision: 1, significant: false,
 *                   format: '%n%u', units: { thousand: 'k' })
 *
 * Semantics:
 *   - n < 1000   → integer string as-is ("0", "850", etc.)
 *   - 1000 ≤ n   → round to 1 decimal place (round-half-up), append "k".
 *                   Trailing ".0" is stripped by String() (satisfying
 *                   Rails' default strip-insignificant-zeros behaviour).
 *
 * NOTE: n ≥ 1_000_000 is OUT OF the real data domain (aggregate stars and
 * commits for this portfolio are well under 1e6).  The Rails "Million" unit
 * is intentionally NOT implemented here.  Add it if the data domain grows.
 *
 * @example
 *   humanizeCount(850)   // "850"
 *   humanizeCount(1000)  // "1k"
 *   humanizeCount(1500)  // "1.5k"
 *   humanizeCount(2000)  // "2k"
 *   humanizeCount(12345) // "12.3k"
 */
export function humanizeCount(n: number): string {
  if (n < 1000) {
    return String(n);
  }

  // round1: 1 decimal place, round-half-up (Math.round semantics match Rails)
  const value = Math.round((n / 1000) * 10) / 10;
  // String() drops the trailing ".0" automatically, matching Rails
  // strip_insignificant_zeros default behaviour.
  return String(value) + "k";
}
