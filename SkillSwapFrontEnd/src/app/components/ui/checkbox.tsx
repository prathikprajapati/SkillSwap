"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";

import { cn } from "./utils";

/**
 * Checkbox Component - Design System v2.0
 * 
 * Features:
 * - Claymorphism styling with subtle shadow
 * - 8px grid sizing (size-4 = 16px)
 * - 60:30:10 color compliance
 * - Accent color checked state
 */

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 rounded-[var(--radius-2xs)] border border-[var(--color-border-default)] bg-[var(--color-primary-60-elevated)] shadow-sm transition-all outline-none",
        "hover:border-[var(--color-accent-10)]/30",
        "focus-visible:border-[var(--color-accent-10)] focus-visible:ring-[3px] focus-visible:ring-[var(--color-accent-10-glow)]",
        "data-[state=checked]:bg-[var(--color-accent-10)] data-[state=checked]:text-white data-[state=checked]:border-[var(--color-accent-10)]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--color-secondary-30)]",
        "aria-invalid:border-[var(--color-error)] aria-invalid:ring-[var(--color-error-subtle)]",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
