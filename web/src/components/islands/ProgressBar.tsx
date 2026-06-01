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
  /**
   * Bar configurations — each becomes one bare animated bar element.
   * Optional: omit when supplying `children` that already contain the
   * `[data-bar]` elements (with `data-target-width` set) wrapped in custom row
   * markup (e.g. the arbital `.tech-item` rows with name + percent columns).
   */
  bars?: BarConfig[];
  /**
   * Custom markup to render inside the observed wrapper. When provided, it is
   * rendered as-is and `bars` is ignored. The animation logic finds every
   * `[data-bar]` DESCENDANT, resets it to 0%, and animates it to its own
   * `data-target-width` — faithful to the Stimulus controller, which animated
   * pre-existing `[data-bar]` targets authored in the .erb rather than rendering
   * them. Each `[data-bar]` must carry `data-target-width` (e.g. "85%").
   */
  children?: React.ReactNode;
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
  children,
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

    // Reset every bar to 0% — mirrors Stimulus connect(). Each bar's target is
    // read back from its own `data-target-width` when it animates.
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
    // `children` is intentionally NOT a dependency. Both modes assume a STATIC bar
    // set for the component's lifetime (the arbital tech bars come from a build-time
    // techBars() result that never changes at runtime). The animation is one-time
    // (the observer disconnects after the first intersection), so re-running on a
    // children change would only re-trigger it. To support a CHANGING children set,
    // add `children` here AND re-arm the observer.
  }, [bars, delay, duration]);

  return (
    <div ref={wrapperRef} className={className}>
      {children !== undefined
        ? children
        : (bars ?? []).map((b, i) => (
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
