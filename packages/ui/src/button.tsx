"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn.ts";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  appName?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  pill?: boolean;
  onPress?: () => void;
}

const variantStyles = {
  primary:
    "bg-primary text-on-primary hover:bg-primary-container active:opacity-90 shadow-card",
  secondary:
    "bg-transparent text-secondary border-2 border-secondary hover:bg-secondary/10 active:bg-secondary/20",
  ghost: "bg-transparent text-on-surface-variant hover:bg-surface-container-high active:bg-surface-container-highest",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-label-sm",
  md: "px-4 py-2 text-label-md",
  lg: "px-6 py-3 text-body-md",
};

export const Button = ({
  children,
  className,
  appName,
  variant = "primary",
  size = "md",
  pill = true,
  onPress,
  ...rest
}: ButtonProps) => {
  return (
    <button
      className={cn(
        "font-label font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100",
        pill ? "rounded-full" : "rounded-md",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      onClick={() => {
        if (onPress) {
          onPress();
        } else if (appName) {
          alert(`Hello from your ${appName} app!`);
        }
      }}
      {...rest}
    >
      {children}
    </button>
  );
};
