"use client";

import { useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CounterProps {
  /** Integer animation target (count from 0 to this). Default: 0. */
  number?: number;
  /** Formatted display string shown after animation completes. Default: "". */
  display?: string;
  /** Animation duration in ms. Default: 1500 (matches Stimulus). */
  duration?: number;
}

// ---------------------------------------------------------------------------
// Counter island
//
// Port of app/javascript/controllers/counter_controller.js.
//
// On enter viewport (ONE-TIME, IntersectionObserver threshold 0.3), counts
// from 0 to `number` over `duration` ms using cubic ease-out via rAF.
// On completion, swaps the element text to the formatted `display` string.
// ---------------------------------------------------------------------------

export function Counter({ number = 0, display = "", duration = 1500 }: CounterProps) {
  const elRef = useRef<HTMLSpanElement>(null);
  // Tracks whether animation has fired — mirrors Stimulus's `this.animated` flag.
  const animated = useRef(false);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    // a11y: when the user prefers reduced motion, jump straight to the final
    // value — skip the count-up animation, the observer and rAF entirely.
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      el.textContent = display !== "" ? display : number.toLocaleString();
      return;
    }

    animated.current = false;

    let cancelled = false;
    let rafId = 0;

    function animate() {
      const start = performance.now();

      const step = (timestamp: number) => {
        if (cancelled) return;

        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        // Cubic ease-out — identical to Stimulus: 1 - Math.pow(1 - progress, 3)
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * number);

        el!.textContent = current.toLocaleString();

        if (progress < 1) {
          rafId = requestAnimationFrame(step);
        } else if (display) {
          el!.textContent = display;
        }
      };

      rafId = requestAnimationFrame(step);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animated.current) {
            animated.current = true;
            animate();
          }
        });
      },
      { threshold: 0.3 },
    );

    observer.observe(el);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [number, display, duration]);

  return <span ref={elRef}>0</span>;
}
