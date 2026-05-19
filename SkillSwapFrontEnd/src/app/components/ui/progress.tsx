"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "./utils";

/**
 * Progress Component - Design System v2.0
 * 
 * Features:
 * - Claymorphism track styling
 * - 60:30:10 color compliance (accent color for progress)
 * - Smooth transitions
 */

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full clay-xs bg-[var(--color-secondary-30)]",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 transition-all duration-300 ease-out bg-[var(--color-accent-10)] rounded-full"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
