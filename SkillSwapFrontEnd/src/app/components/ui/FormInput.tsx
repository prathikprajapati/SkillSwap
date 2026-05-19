/**
 * FormInput Component - Enhanced with Accessibility
 * 
 * Features:
 * - Accessible error states with aria-invalid and aria-describedby
 * - Visual error indicators (icon + border color)
 * - Helper text support
 * - Label association
 * - Screen reader announcements
 */

import { forwardRef, useId } from "react";
import { cn } from "./utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ 
    label, 
    helperText, 
    error, 
    success,
    leftIcon, 
    rightIcon,
    containerClassName,
    className,
    id: propId,
    ...props 
  }, ref) => {
    const generatedId = useId();
    const id = propId || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;
    
    const hasError = Boolean(error);
    const describedBy = [
      helperText ? helperId : null,
      hasError ? errorId : null,
    ].filter(Boolean).join(" ") || undefined;

    return (
      <div className={cn("space-y-1.5", containerClassName)}>
        {label && (
          <label 
            htmlFor={id}
            className="form-label"
          >
            {label}
            {props.required && (
              <span className="text-error ml-1" aria-label="required">*</span>
            )}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={id}
            className={cn(
              "input-base",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              hasError && "input-error",
              success && "input-success",
              className
            )}
            aria-invalid={hasError}
            aria-describedby={describedBy}
            aria-errormessage={hasError ? errorId : undefined}
            aria-required={props.required}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              {rightIcon}
            </div>
          )}
          
          {/* Success indicator */}
          {success && !hasError && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-success">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          
          {/* Error indicator */}
          {hasError && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-error">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
        </div>
        
        {helperText && !hasError && (
          <p id={helperId} className="form-helper">
            {helperText}
          </p>
        )}
        
        {hasError && (
          <p id={errorId} className="form-error" role="alert">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

export { FormInput };
