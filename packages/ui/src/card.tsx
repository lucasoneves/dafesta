import { type JSX } from "react";
import { cn } from "./cn.ts";

export function Card({
  className,
  title,
  children,
  href,
}: {
  className?: string;
  title: string;
  children: React.ReactNode;
  href: string;
}): JSX.Element {
  return (
    <a
      className={cn(
        "block rounded-lg bg-white p-6 shadow-card transition-all duration-150 hover:bg-surface-container-low active:scale-[0.98]",
        className
      )}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <h2 className="font-headline text-headline-md font-semibold text-on-surface">
        {title}
      </h2>
      <p className="mt-2 text-body-md text-on-surface-variant">{children}</p>
    </a>
  );
}
