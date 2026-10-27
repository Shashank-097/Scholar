"use client";

import { useEffect, useState } from "react";

// Small shared hook since GSAP components (unlike Motion's own
// useReducedMotion) don't get this for free. Returns true if the user has
// requested reduced motion at the OS/browser level.
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  return reduced;
}