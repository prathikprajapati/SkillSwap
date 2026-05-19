import { forwardRef } from "react";
import { cn } from "@/app/components/ui/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium";
    
    const variantStyles = {
      primary: disabled 
        ? "bg-[var(--text-disabled)] text-white"
        : "text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
      secondary: disabled
        ? "bg-[var(--text-disabled)] text-white"
        : "bg-[var(--secondary)] hover:bg-[#E5E7EB] active:scale-[0.98]",
      outline: disabled
        ? "border-2 border-[var(--text-disabled)] text-[var(--text-disabled)]"
        : "border-2 border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary-light)] active:scale-[0.98]",
      ghost: disabled
        ? "text-[var(--text-disabled)]"
        : "hover:bg-[var(--secondary)] active:scale-[0.98]",
    };
    
    const sizeStyles = {
      default: "px-5 py-2.5 text-[14px]",
      sm: "px-3 py-1.5 text-[12px]",
      lg: "px-8 py-3.5 text-[16px]",
    };

    const primaryBg = variant === "primary" && !disabled 
      ? { backgroundColor: 'var(--accent-indigo)' }
      : {};
    
    const primaryHover = variant === "primary" && !disabled
      ? { 
          transition: 'all 0.2s ease',
        }
      : {};

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        style={{ ...primaryBg, ...primaryHover }}
        disabled={disabled}
        onMouseEnter={(e) => {
          if (variant === "primary" && !disabled) {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-indigo-dark)';
          }
        }}
        onMouseLeave={(e) => {
          if (variant === "primary" && !disabled) {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-indigo)';
          }
        }}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
