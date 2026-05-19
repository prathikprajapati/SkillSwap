import * as React from "react";

import { cn } from "./utils";

/**
 * Card Component - Design System v2.0
 * 
 * Features:
 * - Claymorphism effects (soft 3D tactile UI)
 * - Glassmorphism variants (frosted glass)
 * - 8px grid spacing
 * - 60:30:10 color compliance
 * - Modular border radius (8px multiples)
 */

interface CardProps extends React.ComponentProps<"div"> {
  variant?: "default" | "clay" | "glass" | "outline";
}

function Card({ className, variant = "default", ...props }: CardProps) {
  const variantClasses = {
    default: "bg-[var(--color-primary-60-elevated)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] shadow-sm",
    clay: "clay clay-md bg-[var(--color-primary-60-elevated)]",
    glass: "glass glass-blur-md rounded-[var(--radius-lg)] border border-[var(--glass-border-light)]",
    outline: "bg-transparent border border-[var(--color-border-default)] rounded-[var(--radius-lg)]",
  };

  return (
    <div
      data-slot="card"
      className={cn(
        "text-[var(--color-text-primary)] flex flex-col",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col space-y-1.5 p-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <h3
      data-slot="card-title"
      className={cn(
        "text-xl font-semibold leading-tight tracking-tight text-[var(--color-text-primary)]",
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <p
      data-slot="card-description"
      className={cn(
        "text-sm text-[var(--color-text-secondary)] leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("p-6 pt-0", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center p-6 pt-0 gap-3",
        className,
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
export type { CardProps };
