"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "./cn.ts";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

    return (
      <div className={cn("w-full", className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block font-label text-label-sm font-medium text-on-surface-variant"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-14 w-full rounded-md border-2 bg-surface-container-low px-4 text-body-md text-on-surface",
            "placeholder:text-on-surface-variant/60",
            "outline-none transition-all duration-150",
            "focus:border-secondary focus:bg-surface-container-lowest",
            "active:scale-[0.99]",
            error
              ? "border-error focus:border-error"
              : "border-transparent",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 font-label text-label-sm text-error">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
