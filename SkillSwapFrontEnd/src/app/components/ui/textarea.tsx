import * as React from "react";

import { cn } from "./utils";

/**
 * Textarea Component - Design System v2.0
 * 
 * Features:
 * - Claymorphism styling
 * - 8px grid spacing (min-h-20 = 80px, px-4 = 16px, py-3 = 12px)
 * - 60:30:10 color compliance
 * - Focus states with accent color glow
 */

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-[var(--radius-sm)] border border-[var(--color-border-default)] bg-[var(--color-primary-60-elevated)] px-4 py-3 text-sm text-[var(--color-text-primary)] shadow-sm transition-all outline-none resize-y",
        "placeholder:text-[var(--color-text-tertiary)]",
        "hover:border-[var(--color-accent-10)]/30",
        "focus-visible:border-[var(--color-accent-10)] focus-visible:ring-[3px] focus-visible:ring-[var(--color-accent-10-glow)]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--color-secondary-30)]",
        "aria-invalid:border-[var(--color-error)] aria-invalid:ring-[var(--color-error-subtle)]",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
