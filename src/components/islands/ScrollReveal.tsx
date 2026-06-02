"use client";

import { useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ScrollRevealProps {
  /** Stagger delay between each child item in ms. Default: 100 (matches Stimulus). */
  delay?: number;
  /** IntersectionObserver threshold. Default: 0.1 (matches Stimulus). */
  threshold?: number;
  /** Optional className forwarded to the wrapper div. */
  className?: string;
  children?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// ScrollReveal island
//
// Port of app/javascript/controllers/scroll_reveal_controller.js.
//
// Wraps its children in a div; each DIRECT child is treated as a reveal item
// (matching Stimulus's `this.itemTargets` — the children of the controller
// element).  Items start hidden (opacity:0, translateY:20px) and reveal
// independently when they enter the viewport.  The observer is continuous
// (items remain observed after revealing — matching the Stimulus source, which
// never disconnects or unobserves an individual item on reveal).
// ---------------------------------------------------------------------------

export function ScrollReveal({
  delay = 100,
  threshold = 0.1,
  className,
  children,
}: ScrollRevealProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const items = Array.from(wrapper.children) as HTMLElement[];

    // a11y: when the user prefers reduced motion, reveal every item in its final
    // visible state immediately and skip the observer entirely. (Skipping ONLY
    // the observer would leave items at opacity:0 forever — they must be shown.)
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      items.forEach((item) => {
        item.style.opacity = "1";
        item.style.transform = "none";
        item.style.transition = "none";
      });
      return;
    }

    // Set initial state — identical to Stimulus connect()
    items.forEach((item, index) => {
      item.style.opacity = "0";
      item.style.transform = "translateY(20px)";
      item.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      item.style.transitionDelay = `${index * delay}ms`;
    });

    // Observe each item — reveal on enter, no reset on exit (matches Stimulus)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = "1";
            (entry.target as HTMLElement).style.transform = "translateY(0)";
          }
        });
      },
      { threshold },
    );

    items.forEach((item) => observer.observe(item));

    return () => {
      observer.disconnect();
    };
  }, [delay, threshold]);

  return (
    <div ref={wrapperRef} className={className}>
      {children}
    </div>
  );
}
