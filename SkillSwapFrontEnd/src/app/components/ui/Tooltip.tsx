import { useState } from "react";
import type { ReactNode } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ content, children, position = "top" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  /**
   * Tooltip Component - Design System v2.0
   * 
   * Features:
   * - Glassmorphism effect
   * - 8px grid spacing (px-3 = 12px, py-2 = 8px)
   * - 60:30:10 color compliance
   * - Consistent shadow and animations
   */

  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 px-3 py-2 rounded-[var(--radius-md)] text-xs font-medium whitespace-nowrap animate-in fade-in zoom-in-95 duration-200 glass glass-blur-md border border-[var(--glass-border-light)] shadow-lg ${positionClasses[position]}`}
          style={{
            backgroundColor: 'var(--glass-bg-dark)',
            color: 'var(--color-text-primary-dark)',
          }}
        >
          {content}
          {/* Arrow */}
          <div
            className="absolute w-2 h-2 rotate-45"
            style={{
              backgroundColor: 'var(--glass-bg-dark)',
              border: '1px solid var(--glass-border-dark)',
              ...(position === "top" && { bottom: "-5px", left: "50%", transform: "translateX(-50%) rotate(45deg)" }),
              ...(position === "bottom" && { top: "-5px", left: "50%", transform: "translateX(-50%) rotate(45deg)" }),
              ...(position === "left" && { right: "-5px", top: "50%", transform: "translateY(-50%) rotate(45deg)" }),
              ...(position === "right" && { left: "-5px", top: "50%", transform: "translateY(-50%) rotate(45deg)" }),
            }}
          />
        </div>
      )}
    </div>
  );
}
