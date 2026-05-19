/**
 * useScrollSpy Hook - Active navigation based on scroll position
 * 
 * Features:
 * - Track which section is currently in viewport
 * - Update active nav item based on scroll
 * - Smooth scroll to section
 * - Configurable threshold
 */

import { useState, useEffect, useCallback, useRef } from "react";

interface UseScrollSpyOptions {
  sectionIds: string[];
  rootMargin?: string;
  threshold?: number;
  offset?: number;
}

interface UseScrollSpyReturn {
  activeSection: string | null;
  scrollToSection: (sectionId: string) => void;
  isScrolled: boolean;
}

export function useScrollSpy(options: UseScrollSpyOptions): UseScrollSpyReturn {
  const { sectionIds, rootMargin = "0px", threshold = 0.3, offset = 80 } = options;
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const observersRef = useRef<IntersectionObserver[]>([]);

  // Track scroll position for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Setup intersection observers for sections
  useEffect(() => {
    // Clean up previous observers
    observersRef.current.forEach((observer) => observer.disconnect());
    observersRef.current = [];

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    // Create observer for each section
    sectionIds.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) {
        const observer = new IntersectionObserver(handleIntersection, {
          rootMargin,
          threshold,
        });
        observer.observe(element);
        observersRef.current.push(observer);
      }
    });

    return () => {
      observersRef.current.forEach((observer) => observer.disconnect());
    };
  }, [sectionIds, rootMargin, threshold]);

  // Smooth scroll to section
  const scrollToSection = useCallback(
    (sectionId: string) => {
      const element = document.getElementById(sectionId);
      if (element) {
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    },
    [offset]
  );

  return {
    activeSection,
    scrollToSection,
    isScrolled,
  };
}

// Hook for parallax scrolling effect
export function useParallax(speed: number = 0.5) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      const scrolled = window.scrollY;
      const yPos = scrolled * speed;
      element.style.transform = `translateY(${yPos}px)`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return elementRef;
}

// Hook for scroll progress (0 to 1)
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = docHeight > 0 ? scrollTop / docHeight : 0;
      setProgress(Math.min(Math.max(scrollProgress, 0), 1));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return progress;
}

// Hook for scroll direction
export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setScrollDirection("down");
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection("up");
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return scrollDirection;
}
