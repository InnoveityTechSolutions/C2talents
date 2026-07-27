import { useEffect, useRef, useState } from "react";

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  delay?: number;
}

export function useScrollReveal<T extends HTMLElement = HTMLElement>(options: ScrollRevealOptions = {}) {
  const [hasRevealed, setHasRevealed] = useState(false);
  const ref = useRef<T | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    // Respect prefers-reduced-motion
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setHasRevealed(true);
      return;
    }

    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (options.delay) {
            timeoutId = setTimeout(() => {
              setHasRevealed(true);
            }, options.delay);
          } else {
            setHasRevealed(true);
          }
          // Disconnect observer after it triggers once
          observer.unobserve(currentRef);
        }
      },
      {
        threshold: options.threshold ?? 0.05,
        rootMargin: options.rootMargin ?? "0px 0px -50px 0px",
      }
    );

    observer.observe(currentRef);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options.threshold, options.rootMargin, options.delay]);

  return { ref, hasRevealed };
}
