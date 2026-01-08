import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface EnhancedCheckboxProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  bilingualText?: boolean;
  "aria-describedby"?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  error?: boolean;
  errorMessage?: string;
  "data-testid"?: string;
}

export const EnhancedCheckbox = React.forwardRef<
  React.ElementRef<typeof Checkbox>,
  EnhancedCheckboxProps
>(({
  id,
  checked,
  onCheckedChange,
  label,
  description,
  className,
  disabled = false,
  required = false,
  bilingualText = false,
  "aria-describedby": ariaDescribedBy,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  error = false,
  errorMessage,
  "data-testid": dataTestId,
  ...props
}, ref) => {
  const handleChange = (checkedValue: boolean) => {
    onCheckedChange(checkedValue);
  };

  // Generate IDs for accessibility
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = errorMessage ? `${id}-error` : undefined;
  const ariaDescribedByIds = [
    ariaDescribedBy,
    descriptionId,
    errorId
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div
      className={cn("flex items-start space-x-3", className)}
      role="group"
      aria-labelledby={ariaLabelledBy}
    >
      {/* Enhanced clickable area container */}
      <div className="relative">
        <Checkbox
          ref={ref}
          id={id}
          data-testid={dataTestId}
          checked={checked}
          onCheckedChange={handleChange}
          disabled={disabled}
          aria-required={required}
          aria-describedby={ariaDescribedByIds}
          aria-label={ariaLabel}
          aria-invalid={error}
          className={cn(
            "peer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            error && "border-red-500 focus-visible:ring-red-500"
          )}
          {...props}
        />
        {/* Expanded click target - 44x44px minimum as per WCAG 2.1 */}
        <div
          className={cn(
            "absolute inset-0 w-11 h-11 -m-3.5 rounded-md transition-colors",
            "hover:bg-accent/20 focus-within:bg-accent/30",
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          )}
          onClick={() => !disabled && handleChange(!checked)}
          onKeyDown={(e) => {
            if (!disabled && (e.key === ' ' || e.key === 'Enter')) {
              e.preventDefault();
              handleChange(!checked);
            }
          }}
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>

      {/* Label and description container */}
      <div className="flex-1 min-w-0">
        <Label
          htmlFor={id}
          className={cn(
            "text-sm font-medium leading-none cursor-pointer select-none",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            "transition-colors hover:text-foreground/80",
            bilingualText && "font-medium text-base leading-relaxed text-foreground/90",
            error && "text-red-600"
          )}
          lang={bilingualText ? "pt-en" : undefined}
        >
          {bilingualText ? (
            <span
              className="inline-block"
              role="text"
              aria-label="Bilingual text: Portuguese and English"
            >
              {label}
            </span>
          ) : (
            label
          )}
          {required && (
            <span
              className="text-red-500 ml-1"
              aria-label="required field"
              role="img"
            >
              *
            </span>
          )}
        </Label>

        {description && (
          <div
            className="mt-1 text-sm text-muted-foreground"
            id={descriptionId}
            role="note"
          >
            {description}
          </div>
        )}

        {errorMessage && (
          <div
            className="mt-1 text-sm text-red-600"
            id={errorId}
            role="alert"
            aria-live="polite"
          >
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
});

EnhancedCheckbox.displayName = "EnhancedCheckbox";