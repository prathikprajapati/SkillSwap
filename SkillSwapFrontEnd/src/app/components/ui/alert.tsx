import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

/**
 * Alert Component - Design System v2.0
 * 
 * Features:
 * - Claymorphism styling with accent colors
 * - 8px grid spacing (px-4 = 16px, py-3 = 12px)
 * - 60:30:10 color compliance
 * - Glassmorphism variant support
 */

const alertVariants = cva(
  "relative w-full rounded-[var(--radius-lg)] border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-1 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current clay clay-xs",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-primary-60-elevated)] text-[var(--color-text-primary)] border-[var(--color-border-subtle)]",
        destructive:
          "bg-[var(--color-error-subtle)] text-[var(--color-error)] border-[var(--color-error)]/20 [&>svg]:text-current",
        success:
          "bg-[var(--color-success-subtle)] text-[var(--color-success)] border-[var(--color-success)]/20 [&>svg]:text-current",
        warning:
          "bg-[var(--color-warning-subtle)] text-[var(--color-warning)] border-[var(--color-warning)]/20 [&>svg]:text-current",
        info:
          "bg-[var(--color-info-subtle)] text-[var(--color-info)] border-[var(--color-info)]/20 [&>svg]:text-current",
        glass:
          "glass glass-blur-md bg-[var(--glass-bg-light)] border-[var(--glass-border-light)] text-[var(--color-text-primary)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-semibold tracking-tight text-[var(--color-text-primary)]",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-[var(--color-text-secondary)] col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
