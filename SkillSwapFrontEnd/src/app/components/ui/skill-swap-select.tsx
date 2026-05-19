import { forwardRef } from "react";
import { cn } from "@/app/components/ui/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label 
            htmlFor={selectId}
            className="text-[14px]"
            style={{ color: 'var(--text-primary)', fontWeight: 600 }}
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
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
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="text-[12px]" style={{ color: 'var(--destructive)' }}>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
