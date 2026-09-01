"use client";

import { useEffect } from "react";
import { cn } from "./cn.ts";

export type ToastTone = "success" | "warning" | "error" | "info";

interface ToastProps {
  tone?: ToastTone;
  message: string;
  duration?: number;
  onDismiss?: () => void;
  className?: string;
}

const toneStyles: Record<ToastTone, string> = {
  success: "bg-green-600 text-white",
  warning: "bg-yellow-500 text-yellow-950",
  error: "bg-red-600 text-white",
  info: "bg-surface-container-highest text-on-surface",
};

export function Toast({
  tone = "info",
  message,
  duration = 4000,
  onDismiss,
  className,
}: ToastProps) {
  useEffect(() => {
    if (!duration) return;
    const timer = setTimeout(() => onDismiss?.(), duration);
    return () => clearTimeout(timer);
  }, [duration, message, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed inset-x-0 bottom-6 z-50 mx-auto flex w-fit max-w-[calc(100vw-2.5rem)] items-center gap-3 rounded-full px-5 py-3",
        "font-label text-label-md font-semibold shadow-modal",
        toneStyles[tone],
        className
      )}
    >
      <span className="truncate">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fechar notificação"
          className="-my-1 -mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full opacity-80 transition-opacity hover:opacity-100"
        >
          ✕
        </button>
      )}
    </div>
  );
}