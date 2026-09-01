"use client";

import { cn } from "./cn.ts";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-surface-container-high",
        className
      )}
    />
  );
}

export function EventCardSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-surface-container-lowest p-5 shadow-card",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-4 w-1/2" />
      <Skeleton className="mt-4 h-4 w-full" />
    </div>
  );
}
