"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

/**
 * Toggle Component - Design System v2.0
 * 
 * Features:
 * - Claymorphism styling
 * - 8px grid spacing
 * - 60:30:10 color compliance
 * - Accent color for active state
 */

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] text-sm font-medium transition-all outline-none whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-transparent hover:bg-[var(--color-secondary-30)] hover:text-[var(--color-text-primary)] text-[var(--color-text-secondary)]",
        outline:
          "border border-[var(--color-border-default)] bg-transparent hover:bg-[var(--color-secondary-30)] hover:text-[var(--color-text-primary)] text-[var(--color-text-secondary)]",
        clay:
          "clay clay-xs bg-[var(--color-primary-60-elevated)] text-[var(--color-text-primary)] hover:shadow-md",
      },
      size: {
        default: "h-10 px-3 min-w-10",
        sm: "h-8 px-2 min-w-8",
        lg: "h-12 px-4 min-w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(
        toggleVariants({ variant, size, className }),
        "data-[state=on]:bg-[var(--color-accent-10)] data-[state=on]:text-white",
        "data-[state=on]:hover:bg-[var(--color-accent-10-hover)]",
        "focus-visible:ring-[3px] focus-visible:ring-[var(--color-accent-10-glow)]",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
        "aria-invalid:ring-[var(--color-error-subtle)] aria-invalid:border-[var(--color-error)]",
      )}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
