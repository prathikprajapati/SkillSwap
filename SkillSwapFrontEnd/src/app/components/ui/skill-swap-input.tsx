import { forwardRef } from "react";
import { cn } from "@/app/components/ui/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label 
            htmlFor={inputId}
            className="text-[14px]"
            style={{ color: 'var(--text-primary)', fontWeight: 600 }}
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full px-4 py-2.5 rounded-lg border transition-colors",
            "focus:outline-none focus:ring-2",
            error
              ? "border-[var(--destructive)] focus:ring-[var(--destructive)]/20"
              : "border-[var(--border)] focus:ring-[var(--primary)]/20",
            className
          )}
          style={{
            backgroundColor: 'var(--card)',
            color: 'var(--text-primary)',
          }}
          {...props}
        />
        {error && (
          <span className="text-[12px]" style={{ color: 'var(--destructive)' }}>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
