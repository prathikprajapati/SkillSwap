/**
 * EmptyState Component - Enhanced with Custom Illustrations
 * 
 * Features:
 * - Custom SVG illustrations for different states
 * - Clear messaging with helpful actions
 * - Accessible with proper ARIA attributes
 * - Multiple preset configurations
 */

import { cn } from "./utils";
import { Button } from "./button";

export type EmptyStateType = 
  | "search" 
  | "data" 
  | "error" 
  | "success" 
  | "notification" 
  | "custom";

export interface EmptyStateProps {
  type?: EmptyStateType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "secondary" | "outline" | "ghost";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  illustration?: React.ReactNode;
}

// Custom SVG Illustrations
const Illustrations = {
  search: (
    <svg viewBox="0 0 200 200" className="w-40 h-40 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="85" cy="85" r="45" stroke="currentColor" strokeWidth="8" className="text-primary/30" />
      <circle cx="85" cy="85" r="25" stroke="currentColor" strokeWidth="6" className="text-primary/50" />
      <line x1="118" y1="118" x2="165" y2="165" stroke="currentColor" strokeWidth="8" strokeLinecap="round" className="text-primary" />
      <circle cx="155" cy="55" r="8" fill="currentColor" className="text-primary-light/50" />
      <circle cx="175" cy="85" r="6" fill="currentColor" className="text-primary-light/30" />
    </svg>
  ),
  data: (
    <svg viewBox="0 0 200 200" className="w-40 h-40 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="40" width="50" height="60" rx="8" stroke="currentColor" strokeWidth="6" className="text-primary/40" />
      <rect x="70" y="70" width="50" height="60" rx="8" stroke="currentColor" strokeWidth="6" className="text-primary/60" />
      <rect x="100" y="100" width="50" height="60" rx="8" stroke="currentColor" strokeWidth="6" className="text-primary" />
      <circle cx="65" cy="70" r="5" fill="currentColor" className="text-primary-light" />
      <circle cx="95" cy="100" r="5" fill="currentColor" className="text-primary-light" />
      <circle cx="125" cy="130" r="5" fill="currentColor" className="text-primary-light" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 200 200" className="w-40 h-40 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="6" className="text-error/30" />
      <circle cx="100" cy="100" r="45" stroke="currentColor" strokeWidth="4" className="text-error/50" />
      <path d="M85 85 L115 115" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-error" />
      <path d="M115 85 L85 115" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-error" />
    </svg>
  ),
  success: (
    <svg viewBox="0 0 200 200" className="w-40 h-40 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="6" className="text-success/30" />
      <circle cx="100" cy="100" r="45" stroke="currentColor" strokeWidth="4" className="text-success/50" />
      <path d="M70 100 L90 120 L130 80" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="text-success" />
    </svg>
  ),
  notification: (
    <svg viewBox="0 0 200 200" className="w-40 h-40 mx-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M100 170 C140 170 170 140 170 100 C170 60 140 30 100 30 C60 30 30 60 30 100 C30 140 60 170 100 170 Z" stroke="currentColor" strokeWidth="6" className="text-primary/30" />
      <path d="M70 85 Q100 55 130 85 L130 115 Q100 145 70 115 Z" stroke="currentColor" strokeWidth="5" className="text-primary/50" />
      <circle cx="100" cy="105" r="8" fill="currentColor" className="text-primary" />
    </svg>
  ),
};

export function EmptyState({
  type = "custom",
  title,
  description,
  action,
  secondaryAction,
  className,
  illustration,
}: EmptyStateProps) {
  const selectedIllustration = illustration || (type !== "custom" ? Illustrations[type] : null);

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center text-center p-8",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {selectedIllustration && (
        <div className="mb-6 text-primary animate-in fade-in scale-in duration-500">
          {selectedIllustration}
        </div>
      )}
      
      <h3 className="text-h4 font-display font-semibold text-foreground mb-2 animate-in fade-in-up delay-100">
        {title}
      </h3>
      
      {description && (
        <p className="text-text-secondary max-w-md mb-6 animate-in fade-in-up delay-150">
          {description}
        </p>
      )}
      
      <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in-up delay-200">
        {action && (
          <Button 
            onClick={action.onClick}
            variant={action.variant || "default"}
          >
            {action.label}
          </Button>
        )}
        
        {secondaryAction && (
          <Button 
            onClick={secondaryAction.onClick}
            variant="ghost"
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}

// Preset configurations for common use cases
export const EmptyStatePresets = {
  noSearchResults: {
    type: "search" as const,
    title: "No results found",
    description: "We couldn't find anything matching your search. Try different keywords or filters.",
  },
  noData: {
    type: "data" as const,
    title: "No data yet",
    description: "There's nothing here yet. Start by adding your first item.",
  },
  error: {
    type: "error" as const,
    title: "Something went wrong",
    description: "We encountered an error while loading this content. Please try again.",
  },
  emptyNotifications: {
    type: "notification" as const,
    title: "No notifications",
    description: "You're all caught up! Check back later for updates.",
  },
  success: {
    type: "success" as const,
    title: "All done!",
    description: "Everything has been completed successfully.",
  },
};
