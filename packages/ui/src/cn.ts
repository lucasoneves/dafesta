import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const customTwMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "display",
        "headline-lg",
        "headline-lg-mobile",
        "headline-md",
        "body-lg",
        "body-md",
        "label-md",
        "label-sm",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return customTwMerge(clsx(inputs));
}
