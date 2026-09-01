"use client";

import { cn } from "./cn.ts";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ items, activeId, onChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "flex w-full gap-1 overflow-x-auto rounded-full bg-surface-container-high p-1",
        className
      )}
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2.5 font-label text-label-md font-semibold transition-all duration-150",
              isActive
                ? "bg-primary text-on-primary shadow-card"
                : "text-on-surface-variant hover:bg-surface-container-low"
            )}
          >
            {item.label}
            {typeof item.count === "number" && item.count > 0 ? (
              <span
                className={cn(
                  "rounded-full px-1.5 text-label-sm",
                  isActive
                    ? "bg-on-primary/20 text-on-primary"
                    : "bg-surface-container-low text-on-surface-variant"
                )}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
