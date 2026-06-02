"use client";

import { useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BootSequenceProps {
  /** BIOS-style lines to type one by one. */
  lines: string[];
  /** Speed per character in ms. Default: 20 (matches Stimulus). */
  charSpeed?: number;
  /** Delay between lines completing and the next starting, in ms. Default: 400. */
  lineDelay?: number;
  /** Content to reveal (fade in) after all lines have typed. */
  content?: React.ReactNode;
  /** Optional className forwarded to the wrapper div. */
  className?: string;
  /**
   * Optional className for an inner wrapper around just the lines (NOT the
   * content). Lets the arbital retro page reproduce the `.boot-header` element,
   * which carries its own border/opacity that must NOT bleed onto the revealed
   * content. When omitted, the lines are direct children of the outer wrapper
   * (unchanged default behaviour).
   */
  headerClassName?: string;
  /** Optional className applied to each `[data-line]` (e.g. "bios-line"). */
  lineClassName?: string;
}

// ---------------------------------------------------------------------------
// BootSequence island
//
// Port of app/javascript/controllers/boot_sequence_controller.js.
//
// On mount: hides all `[data-line]` elements (opacity 0, empty text) and
// hides `[data-content]` (opacity 0).  Types each line char-by-char at
// `charSpeed` ms/char, waits `lineDelay` ms, then moves to the next.
// After all lines, fades in content (opacity 1, transition 0.5s ease).
// ---------------------------------------------------------------------------

export function BootSequence({
  lines,
  charSpeed = 20,
  lineDelay = 400,
  content,
  className,
  headerClassName,
  lineClassName,
}: BootSequenceProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const lineEls = Array.from(
      wrapper.querySelectorAll<HTMLElement>("[data-line]"),
    );
    const contentEl = wrapper.querySelector<HTMLElement>("[data-content]");

    // a11y: when the user prefers reduced motion, skip the boot typing and show
    // every line + the content in their final visible state immediately. Each
    // line's text is already present in JSX ({line}) so we only reveal it.
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      lineEls.forEach((el) => {
        el.style.opacity = "1";
      });
      if (contentEl) {
        contentEl.style.opacity = "1";
      }
      return;
    }

    // Store original text and clear — mirrors Stimulus connect()
    const originalTexts = lineEls.map((el) => {
      const text = el.dataset.originalText ?? el.textContent ?? "";
      el.dataset.originalText = text;
      el.textContent = "";
      el.style.opacity = "0";
      return text;
    });

    if (contentEl) {
      contentEl.style.opacity = "0";
    }

    let cancelled = false;

    function typeText(
      element: HTMLElement,
      text: string,
      callback: () => void,
    ) {
      let charIndex = 0;
      function type() {
        if (cancelled) return;
        if (charIndex < text.length) {
          element.textContent += text.charAt(charIndex);
          charIndex++;
          setTimeout(type, charSpeed);
        } else if (callback) {
          callback();
        }
      }
      type();
    }

    function showContent() {
      if (contentEl) {
        contentEl.style.transition = "opacity 0.5s ease";
        contentEl.style.opacity = "1";
      }
    }

    function showNextLine(currentLine: number) {
      if (cancelled) return;
      if (currentLine < lineEls.length) {
        const line = lineEls[currentLine];
        line.style.opacity = "1";
        typeText(line, originalTexts[currentLine], () => {
          setTimeout(() => showNextLine(currentLine + 1), lineDelay);
        });
      } else {
        showContent();
      }
    }

    showNextLine(0);

    return () => {
      cancelled = true;
    };
  }, [lines, charSpeed, lineDelay]);

  const lineEls = lines.map((line, i) => (
    <div key={i} data-line data-original-text={line} className={lineClassName}>
      {line}
    </div>
  ));

  return (
    <div ref={wrapperRef} className={className}>
      {headerClassName !== undefined ? (
        <div className={headerClassName}>{lineEls}</div>
      ) : (
        lineEls
      )}
      {content !== undefined && (
        <div data-content>{content}</div>
      )}
    </div>
  );
}
