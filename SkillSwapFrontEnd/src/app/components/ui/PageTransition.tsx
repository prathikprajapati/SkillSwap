/**
 * PageTransition Component - GSAP-powered Page Animations
 * 
 * Features:
 * - Smooth page transitions with GSAP
 * - Staggered element animations
 * - Scroll-triggered reveals
 * - Reduced motion support
 */

import { useEffect, useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

// Main page wrapper with entrance animation
export function PageTransition({ children, className }: PageTransitionProps) {
  const pageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      
      if (prefersReducedMotion) {
        // Simple fade for reduced motion
        gsap.fromTo(
          pageRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.2 }
        );
      } else {
        // Full animation
        gsap.fromTo(
          pageRef.current,
          { opacity: 0, y: 20 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.5, 
            ease: "power3.out"
          }
        );
      }
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} className={className}>
      {children}
    </div>
  );
}

// Staggered children animation wrapper
interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  animation?: "fadeUp" | "fadeIn" | "slideIn" | "scaleIn";
}

export function StaggerContainer({ 
  children, 
  className,
  staggerDelay = 0.1,
  animation = "fadeUp"
}: StaggerContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const children = containerRef.current?.children;
      
      if (!children || children.length === 0) return;

      if (prefersReducedMotion) {
        gsap.set(children, { opacity: 1 });
        return;
      }

      const animations = {
        fadeUp: { opacity: 0, y: 30 },
        fadeIn: { opacity: 0 },
        slideIn: { opacity: 0, x: -30 },
        scaleIn: { opacity: 0, scale: 0.9 },
      };

      const fromState = animations[animation];

      gsap.fromTo(
        children,
        fromState,
        {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          duration: 0.5,
          stagger: staggerDelay,
          ease: "power3.out",
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [staggerDelay, animation]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

// Scroll-triggered reveal component
interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
  threshold?: number;
}

export function ScrollReveal({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.6,
  threshold = 0.2,
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      
      if (prefersReducedMotion) {
        gsap.set(elementRef.current, { opacity: 1 });
        return;
      }

      const directions = {
        up: { y: 40, x: 0 },
        down: { y: -40, x: 0 },
        left: { x: 40, y: 0 },
        right: { x: -40, y: 0 },
      };

      const fromState = {
        opacity: 0,
        ...directions[direction],
      };

      gsap.set(elementRef.current, fromState);

      triggerRef.current = ScrollTrigger.create({
        trigger: elementRef.current,
        start: `top ${(1 - threshold) * 100}%`,
        once: true,
        onEnter: () => {
          gsap.to(elementRef.current, {
            opacity: 1,
            x: 0,
            y: 0,
            duration: duration,
            delay: delay,
            ease: "power3.out",
          });
        },
      });
    }, elementRef);

    return () => {
      triggerRef.current?.kill();
      ctx.revert();
    };
  }, [direction, delay, duration, threshold]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}

// Animated text component (character/word stagger)
interface AnimatedTextProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  splitBy?: "chars" | "words";
  staggerDelay?: number;
}

export function AnimatedText({
  text,
  className,
  as: Component = "span",
  splitBy = "words",
  staggerDelay = 0.03,
}: AnimatedTextProps) {
  const containerRef = useRef<HTMLElement>(null);

  const parts = splitBy === "chars" ? text.split("") : text.split(" ");

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      
      if (prefersReducedMotion) {
        gsap.set(containerRef.current?.children || [], { opacity: 1 });
        return;
      }

      gsap.fromTo(
        containerRef.current?.children || [],
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: staggerDelay,
          ease: "power3.out",
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [staggerDelay, text]);

  return (
    <Component ref={containerRef as React.RefObject<HTMLHeadingElement & HTMLParagraphElement & HTMLSpanElement>} className={className}>
      {parts.map((part, index) => (
        <span key={index} className="inline-block">
          {part}
          {splitBy === "words" && index < parts.length - 1 && "\u00A0"}
        </span>
      ))}
    </Component>
  );
}

// Magnetic button effect component
interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

export function MagneticButton({
  children,
  className,
  strength = 0.3,
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;

      gsap.to(button, {
        x: deltaX,
        y: deltaY,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.3)",
      });
    };

    button.addEventListener("mousemove", handleMouseMove);
    button.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      button.removeEventListener("mousemove", handleMouseMove);
      button.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [strength]);

  return (
    <button ref={buttonRef} className={className}>
      {children}
    </button>
  );
}

// Page loader/preloader component
interface PreloaderProps {
  onComplete?: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(containerRef.current, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
              gsap.set(containerRef.current, { display: "none" });
              onComplete?.();
            },
          });
        },
      });

      tl.to(progressRef.current, {
        width: "100%",
        duration: 1.5,
        ease: "power2.inOut",
      });
    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center"
    >
      <div className="w-64 h-1 bg-surface rounded-full overflow-hidden">
        <div
          ref={progressRef}
          className="h-full bg-primary rounded-full"
          style={{ width: "0%" }}
        />
      </div>
      <p className="mt-4 text-text-secondary text-sm">Loading...</p>
    </div>
  );
}

// Cleanup utility for ScrollTrigger
export function useScrollTriggerCleanup() {
  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);
}
