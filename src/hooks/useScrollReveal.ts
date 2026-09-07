import { useEffect, useRef, useState } from "react";

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  delay?: number;
}

export function useScrollReveal<T extends HTMLElement = HTMLElement>(options: ScrollRevealOptions = {}) {
  // Always default to true so sections are never hidden as blank white spaces
  const [hasRevealed, setHasRevealed] = useState(true);
  const ref = useRef<T | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    const currentRef = ref.current;
    if (!currentRef) return;

    // Set revealed to true immediately on mount
    setHasRevealed(true);

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
          observer.unobserve(currentRef);
        }
      },
      {
        threshold: options.threshold ?? 0.01,
        rootMargin: options.rootMargin ?? "0px",
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
