"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "./utils";

/**
 * Switch Component - Design System v2.0
 * 
 * Features:
 * - Claymorphism thumb effect
 * - 60:30:10 color compliance (accent color for checked state)
 * - Smooth transitions
 */

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent transition-all outline-none",
        "data-[state=checked]:bg-[var(--color-accent-10)] data-[state=unchecked]:bg-[var(--color-secondary-30)]",
        "focus-visible:ring-[3px] focus-visible:ring-[var(--color-accent-10-glow)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-full shadow-sm transition-transform clay-xs",
          "bg-[var(--color-primary-60-elevated)]",
          "data-[state=checked]:translate-x-[calc(100%+4px)] data-[state=unchecked]:translate-x-0.5",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
