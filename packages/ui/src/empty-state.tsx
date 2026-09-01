"use client";

import type { ReactNode } from "react";
import { Button } from "./button.tsx";
import { cn } from "./cn.ts";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest px-6 py-12 text-center",
        className
      )}
    >
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="font-headline text-headline-md font-semibold text-on-surface">
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-sm text-body-md text-on-surface-variant">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button className="mt-6" size="lg" onPress={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
