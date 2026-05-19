"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "./utils";

/**
 * Tabs Component - Design System v2.0
 * 
 * Features:
 * - Claymorphism list container
 * - 8px grid spacing
 * - 60:30:10 color compliance
 * - Glassmorphism active state
 */

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-3", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex h-10 w-fit items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-secondary-30)] p-1",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex h-full flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium whitespace-nowrap transition-all outline-none",
        "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
        "data-[state=active]:bg-[var(--color-primary-60-elevated)] data-[state=active]:text-[var(--color-text-primary)] data-[state=active]:shadow-sm data-[state=active]:clay-xs",
        "focus-visible:ring-[3px] focus-visible:ring-[var(--color-accent-10-glow)]",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none mt-4", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
