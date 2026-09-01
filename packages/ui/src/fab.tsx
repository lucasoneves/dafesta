"use client";

import { ReactNode } from "react";
import { cn } from "./cn.ts";

interface FabProps {
  label?: string;
  className?: string;
  onPress?: () => void;
  children?: ReactNode;
}

export const Fab = ({
  label = "+",
  className,
  onPress,
  children,
}: FabProps) => {
  return (
    <button
      aria-label="Criar"
      onClick={onPress}
      className={cn(
        "fixed bottom-6 right-6 flex h-16 w-16 items-center justify-center",
        "rounded-full bg-primary text-on-primary shadow-fab",
        "transition-all duration-150 active:scale-[0.9] hover:bg-primary-container",
        "text-headline-lg font-bold",
        className
      )}
    >
      {children ?? label}
    </button>
  );
};
