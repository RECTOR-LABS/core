"use client";

import { useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BarConfig {
  /** CSS width value to animate to, e.g. "75%". */
  width: string;
  /** Optional accessible label for the bar. */
  label?: string;
}

interface ProgressBarProps {
  /** Bar configurations — each becomes one animated bar element. */
  bars: BarConfig[];
  /** Stagger delay between each bar in ms. Default: 100 (matches Stimulus). */
  delay?: number;
  /** CSS transition duration in ms. Default: 1000 (matches Stimulus). */
  duration?: number;
  /** Optional className forwarded to the wrapper div. */
  className?: string;
}

// ---------------------------------------------------------------------------
// ProgressBar island
//
// Port of app/javascript/controllers/progress_bar_controller.js.
//
// On mount: stores each bar's target width (as data-target-width) and resets
// to 0%. On IntersectionObserver trigger (threshold 0.2, ONE-TIME), animates
// each bar to its target width with staggered setTimeout delays using a CSS
// ease-out transition. Disconnects after first trigger.
// ---------------------------------------------------------------------------

export function ProgressBar({
  bars,
  delay = 100,
  duration = 1000,
  className,
}: ProgressBarProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const barEls = Array.from(
      wrapper.querySelectorAll<HTMLElement>("[data-bar]"),
    );

    // Store target widths and reset to 0% — mirrors Stimulus connect()
    barEls.forEach((bar) => {
      bar.style.width = "0%";
    });

    let cancelled = false;
    const timerIds: ReturnType<typeof setTimeout>[] = [];

    function animateBars() {
      barEls.forEach((bar, index) => {
        const id = setTimeout(() => {
          if (cancelled) return;
          bar.style.transition = `width ${duration}ms ease-out`;
          bar.style.width = bar.dataset.targetWidth ?? "0%";
        }, index * delay);
        timerIds.push(id);
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateBars();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(wrapper);

    return () => {
      cancelled = true;
      timerIds.forEach(clearTimeout);
      observer.disconnect();
    };
  }, [bars, delay, duration]);

  return (
    <div ref={wrapperRef} className={className}>
      {bars.map((b, i) => (
        <div
          key={i}
          data-bar
          data-target-width={b.width}
          style={{ width: b.width }}
          aria-label={b.label}
        />
      ))}
    </div>
  );
}
