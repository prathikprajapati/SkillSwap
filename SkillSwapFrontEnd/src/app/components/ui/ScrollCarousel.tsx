"use client";
import React, {
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
  forwardRef,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
// Removed unused LucideIcon import
import { cn } from "@/app/components/ui/utils";

gsap.registerPlugin(ScrollTrigger);

// Component Props and Types
export interface FeatureItem {
  icon: any;
  title: string;
  description: string;
  image?: string;
  name?: string;
  skill?: string;
  avatar?: string;
  rating?: number;
  quote?: string;
}

export interface ScrollCarouselProps {
  features: FeatureItem[];
  className?: string;
  maxScrollHeight?: number;
}

// Custom Hook for Animations
const useFeatureAnimations = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  scrollContainerRef: React.RefObject<HTMLDivElement | null>,
  scrollContainerRef2: React.RefObject<HTMLDivElement | null>,
  progressBarRef: React.RefObject<HTMLDivElement | null>,
  cardRefs: React.MutableRefObject<HTMLDivElement[]>,
  cardRefs2: React.MutableRefObject<HTMLDivElement[]>,
  isDesktop: boolean,
  maxScrollHeight?: number
) => {
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    
    let ctx = gsap.context(() => {
      // Desktop horizontal scroll logic
      if (isDesktop) {
        const scrollWidth1 = scrollContainerRef.current?.scrollWidth || 0;
        const scrollWidth2 = scrollContainerRef2.current?.scrollWidth || 0;
        const containerWidth = containerRef.current?.offsetWidth || 0;
        const cardWidth = cardRefs.current[0]?.offsetWidth || 0;
        const viewportOffset = (containerWidth - cardWidth) / 2;

        const finalOffset1 = scrollWidth1 - containerWidth + viewportOffset;
        const finalOffset2 = scrollWidth2 - containerWidth + viewportOffset;

        const scrollDistance = maxScrollHeight || finalOffset1;

        gsap.set(scrollContainerRef2.current, {
          x: -finalOffset2 + viewportOffset * 2,
        });

        gsap
          .timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: () => `+=${scrollDistance}`,
              scrub: 1,
              pin: true,
            },
          })
          .fromTo(
            scrollContainerRef.current,
            { x: viewportOffset },
            { x: -finalOffset1 + viewportOffset, ease: "none" }
          );

        gsap
          .timeline({
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: () => `+=${scrollDistance}`,
              scrub: 1,
            },
          })
          .to(scrollContainerRef2.current, { x: viewportOffset, ease: "none" });

        gsap.to(progressBarRef.current, {
          width: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: () => `+=${scrollDistance}`,
            scrub: true,
          },
        });
      } else {
        // Mobile vertical scroll logic
        const allCards = [...cardRefs.current, ...cardRefs2.current];
        allCards.forEach((card, index) => {
          if (card) {
            gsap.fromTo(
              card,
              {
                opacity: 0,
                x: index % 2 === 0 ? -200 : 200,
              },
              {
                opacity: 1,
                x: 0,
                duration: 1,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: card,
                  start: "top 0%",
                  toggleActions: "play none none none",
                  once: true,
                },
              }
            );
          }
        });
      }
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [isDesktop, maxScrollHeight]);
};

// Component Definition
export const ScrollCarousel = forwardRef<HTMLDivElement, ScrollCarouselProps>(
  ({ features, className, maxScrollHeight }, ref) => {
    const [isMounted, setIsMounted] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef2 = useRef<HTMLDivElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<HTMLDivElement[]>([]);
    const cardRefs2 = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    useEffect(() => {
      if (typeof window === 'undefined') return;
      
      const checkDesktop = () => {
        setIsDesktop(window.matchMedia("(min-width: 768px)").matches);
      };
      checkDesktop();
      window.addEventListener("resize", checkDesktop);
      return () => window.removeEventListener("resize", checkDesktop);
    }, []);

    // Dynamic sorting for the second row of cards
    const features2 = [...features].sort(() => Math.random() - 0.5);

    useFeatureAnimations(
      containerRef,
      scrollContainerRef,
      scrollContainerRef2,
      progressBarRef,
      cardRefs,
      cardRefs2,
      isDesktop,
      maxScrollHeight
    );

    // Don't render on server side to prevent SSR issues
    if (!isMounted) {
      return null;
    }

    const renderTestimonialCards = (
      featureSet: FeatureItem[],
      refs: React.MutableRefObject<HTMLDivElement[]>
    ) =>
      featureSet.map((feature, index) => (
        <div
          key={index}
          ref={(el: HTMLDivElement | null) => {
            if (el) refs.current[index] = el;
          }}
          className="feature-card flex-shrink-0 w-full md:w-80 h-full z-10 gap-4 group relative transition-all duration-300 ease-in-out"
        >
          <div
            className={cn(
              `relative h-full p-5 lg:p-6 rounded-2xl backdrop-blur-sm 
              flex items-center justify-center z-10 
              transition-all duration-300 my-2`,
              `backdrop-blur-lg border border-border text-card-foreground`,
              "group-hover:scale-105 centered:scale-105 bg-card"
            )}
          >
            <div className="w-full">
              {/* Rating Stars */}
              {feature.rating && (
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: feature.rating }).map((_, i) => (
                    <svg key={i} className="h-5 w-5 fill-warning text-warning flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>
                    </svg>
                  ))}
                </div>
              )}
              
              {/* Quote */}
              <p className="mb-6 text-muted-foreground italic text-lg leading-relaxed">"{feature.quote}"</p>
              
              {/* Author Info */}
              <div className="flex items-center gap-4 mt-auto">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-semibold text-primary">{feature.avatar}</span>
                </div>
                <div>
                  <p className="font-semibold">{feature.name}</p>
                  <p className="text-sm text-primary">{feature.skill}</p>
                </div>
              </div>
            </div>
            
            <div className="pointer-events-none absolute inset-0 transition-all duration-300 group-hover:bg-black/5 dark:group-hover:bg-white/5 centered:bg-black/5 dark:centered:bg-white/5 rounded-2xl group-hover:blur-md" />
          </div>
        </div>
      ));

    return (
      <section
        className={cn(
          "bg-transparent text-foreground relative overflow-hidden",
          className
        )}
        ref={ref}
      >
        <div
          ref={containerRef}
          className={`relative overflow-hidden md:h-[700px] md:py-14 
          flex flex-col gap-0 z-10 
          lg:[mask-image:_linear-gradient(to_right,transparent_0,_black_5%,_black_95%,transparent_100%)]`}
        >
          <div
            ref={scrollContainerRef}
            className={`flex flex-col md:flex-row gap-8 
            items-center h-full px-6 md:px-0`}
          >
            {renderTestimonialCards(features, cardRefs)}
          </div>

          <div
            ref={scrollContainerRef2}
            className={`flex flex-col md:flex-row gap-8 items-center h-full px-6 md:px-0 hidden lg:flex`}
          >
            {renderTestimonialCards(features2, cardRefs2)}
          </div>

          {isDesktop && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-64 h-2 bg-black/30 dark:bg-white/30 z-50 overflow-hidden rounded-full">
              <div
                ref={progressBarRef}
                className="h-full rounded-full relative overflow-hidden transition-all duration-100"
                style={{ width: "0%" }}
              >
                <div className="absolute inset-0 animated-water" />
              </div>
            </div>
          )}
        </div>
        <style>{`
          .animated-water {
            background: repeating-linear-gradient(
              -45deg,
              rgba(0, 0, 0, 0.7) 0%,
              rgba(0, 0, 0, 0.5) 25%,
              rgba(0, 0, 0, 0.7) 50%
            );
            background-size: 40px 40px;
            animation: waveMove 2s linear infinite;
          }
          :global(.dark) .animated-water {
            background: repeating-linear-gradient(
              -45deg,
              rgba(255, 255, 255, 0.9) 0%,
              rgba(255, 255, 255, 0.6) 25%,
              rgba(255, 255, 255, 0.9) 50%
            );
          }
          @keyframes waveMove {
            from {
              background-position: 0 0;
            }
            to {
              background-position: 40px 40px;
            }
          }
        `}</style>
      </section>
    );
  }
);

ScrollCarousel.displayName = "ScrollCarousel";

export default ScrollCarousel;
