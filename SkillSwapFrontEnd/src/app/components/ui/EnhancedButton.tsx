/**
 * EnhancedButton Component - Advanced Button with Loading States
 * 
 * Features:
 * - Multiple loading state animations
 * - Progress indicator
 * - Magnetic hover effect
 * - Accessible loading announcements
 * - Touch ripple effect
 */

import { forwardRef, useRef, useEffect, useState } from "react";
import { cn } from "./utils";
import { Loader2, Check, X } from "lucide-react";
import { gsap } from "gsap";

export interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  loadingText?: string;
  success?: boolean;
  error?: boolean;
  progress?: number; // 0-100
  magnetic?: boolean;
  ripple?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({
    children,
    className,
    variant = "primary",
    size = "md",
    isLoading = false,
    loadingText,
    success = false,
    error = false,
    progress,
    magnetic = false,
    ripple = false,
    leftIcon,
    rightIcon,
    disabled,
    onClick,
    ...props
  }, ref) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const combinedRef = (ref as React.RefObject<HTMLButtonElement>) || buttonRef;
    const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);

    // Handle success/error states
    useEffect(() => {
      if (success) {
        setShowSuccess(true);
        const timer = setTimeout(() => setShowSuccess(false), 2000);
        return () => clearTimeout(timer);
      }
    }, [success]);

    useEffect(() => {
      if (error) {
        setShowError(true);
        const timer = setTimeout(() => setShowError(false), 2000);
        return () => clearTimeout(timer);
      }
    }, [error]);

    // Magnetic effect
    useEffect(() => {
      if (!magnetic || !combinedRef.current) return;

      const button = combinedRef.current;
      const strength = 0.3;

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
    }, [magnetic]);

    // Ripple effect
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && combinedRef.current) {
        const rect = combinedRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();

        setRipples((prev) => [...prev, { id, x, y }]);

        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 600);
      }

      onClick?.(e);
    };

    const baseStyles = "relative inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 overflow-hidden";

    const variants = {
      primary: "bg-primary text-white hover:bg-primary-dark hover:shadow-lg hover:-translate-y-0.5 active:scale-95 focus-visible:ring-primary",
      secondary: "bg-secondary text-white hover:bg-secondary/90 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 focus-visible:ring-secondary",
      ghost: "bg-transparent text-primary hover:bg-primary/10 active:scale-95 focus-visible:ring-primary",
      destructive: "bg-error text-white hover:bg-error/90 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 focus-visible:ring-error",
      outline: "bg-transparent border-2 border-border text-foreground hover:bg-surface hover:border-primary active:scale-95 focus-visible:ring-primary",
    };

    const sizes = {
      sm: "h-9 px-3 text-sm min-h-[36px]",
      md: "h-11 px-5 text-base min-h-[44px]",
      lg: "h-14 px-8 text-lg min-h-[56px]",
    };

    const isDisabled = disabled || isLoading;

    // Determine icon to show
    let IconComponent: React.ReactNode = null;
    let displayText = children;

    if (isLoading) {
      IconComponent = <Loader2 className="w-5 h-5 animate-spin" />;
      displayText = loadingText || children;
    } else if (showSuccess) {
      IconComponent = <Check className="w-5 h-5" />;
    } else if (showError) {
      IconComponent = <X className="w-5 h-5" />;
    } else if (leftIcon) {
      IconComponent = leftIcon;
    }

    return (
      <button
        ref={combinedRef}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          isDisabled && "opacity-60 cursor-not-allowed hover:translate-y-0",
          className
        )}
        disabled={isDisabled}
        onClick={handleClick}
        aria-busy={isLoading}
        aria-live="polite"
        {...props}
      >
        {/* Progress bar background */}
        {progress !== undefined && (
          <div 
            className="absolute left-0 top-0 h-full bg-black/10 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        )}

        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 animate-ping pointer-events-none"
            style={{
              left: ripple.x - 50,
              top: ripple.y - 50,
              width: 100,
              height: 100,
            }}
          />
        ))}

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {IconComponent}
          {displayText}
          {!isLoading && !showSuccess && !showError && rightIcon}
        </span>

        {/* Screen reader text for loading state */}
        {isLoading && (
          <span className="sr-only">
            Loading, please wait...
          </span>
        )}
      </button>
    );
  }
);

EnhancedButton.displayName = "EnhancedButton";

export { EnhancedButton };
