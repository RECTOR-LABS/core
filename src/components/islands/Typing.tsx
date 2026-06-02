"use client";

import { useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TypingProps {
  /** The text to type character by character. */
  text: string;
  /** Typing speed in ms per character. Default: 50 (matches Stimulus). */
  speed?: number;
  /** Initial delay before typing starts, in ms. Default: 0 (matches Stimulus). */
  delay?: number;
  /** If true, resets and retypes after 2000ms on completion. Default: false. */
  loop?: boolean;
  /** Optional cursor character to display after the typed text. */
  cursor?: string;
  /** Optional className forwarded to the wrapper span. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Typing island
//
// Port of app/javascript/controllers/typing_controller.js.
//
// Saves the original text, clears it, then types char-by-char at `speed` ms
// intervals after an initial `delay`.  If `loop` is true, resets and retypes
// after a 2000ms pause.  Restores the original text on unmount (matches
// Stimulus's disconnect() behaviour).
// ---------------------------------------------------------------------------

export function Typing({
  text,
  speed = 50,
  delay = 0,
  loop = false,
  cursor,
  className,
}: TypingProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  // Store the original text for restore-on-unmount
  const originalText = useRef<string>(text);

  useEffect(() => {
    const textEl = textRef.current;
    if (!textEl) return;

    originalText.current = text;

    // a11y: when the user prefers reduced motion, skip the typing animation and
    // show the final text immediately (the span renders empty in JSX).
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      textEl.textContent = text;
      return;
    }

    textEl.textContent = "";

    let cancelled = false;
    let charIndex = 0;

    function type() {
      if (cancelled) return;
      if (charIndex < text.length) {
        textEl!.textContent += text.charAt(charIndex);
        charIndex++;
        setTimeout(type, speed);
      } else if (loop) {
        setTimeout(() => {
          if (cancelled) return;
          charIndex = 0;
          textEl!.textContent = "";
          type();
        }, 2000);
      }
    }

    // Always schedule via setTimeout — even when delay === 0 — so the first
    // character types one tick later, matching the Stimulus source (which wraps
    // the initial type() in setTimeout(fn, delayValue) unconditionally).
    setTimeout(() => {
      if (!cancelled) type();
    }, delay);

    return () => {
      cancelled = true;
      // Restore original text on unmount — matches Stimulus disconnect()
      if (textEl) {
        textEl.textContent = originalText.current;
      }
    };
  }, [text, speed, delay, loop]);

  return (
    <span className={className}>
      <span ref={textRef} data-text />
      {cursor !== undefined && (
        <span data-cursor>{cursor}</span>
      )}
    </span>
  );
}
