import { type JSX } from "react";
import { cn } from "./cn.ts";

export function Code({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <code
      className={cn(
        "rounded bg-gray-100 px-1.5 py-0.5 text-sm font-mono text-gray-800",
        className
      )}
    >
      {children}
    </code>
  );
}
