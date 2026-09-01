"use client";

import type { Event } from "@dafesta/types";
import { formatDate } from "@dafesta/utils";
import { cn } from "./cn.ts";

interface EventCardProps {
  event: Event;
  onClick?: () => void;
  className?: string;
}

export function EventCard({ event, onClick, className }: EventCardProps) {
  const dateLabel = event.date ? formatDate(event.date) : "Data não definida";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-lg bg-surface-container-lowest p-5 text-left shadow-card",
        "transition-all duration-150 hover:bg-surface-container-low active:scale-[0.98]",
        onClick ? "cursor-pointer" : "cursor-default",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-headline text-headline-md font-semibold text-on-surface">
            {event.title}
          </h3>
          {event.location && (
            <p className="mt-1 truncate text-body-md text-on-surface-variant">
              {event.location}
            </p>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-primary-container px-3 py-1 font-label text-label-sm font-medium text-on-primary-container">
          {dateLabel}
        </span>
      </div>

      {event.description && (
        <p className="mt-3 line-clamp-2 text-body-md text-on-surface-variant">
          {event.description}
        </p>
      )}
    </button>
  );
}
