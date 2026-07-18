import type { ReactNode } from "react";

const MAX_WIDTHS = {
  "md": "max-w-md",
  "lg": "max-w-lg",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
} as const;

/**
 * Shared page container.
 *
 * Use this on every normal content section so the left/right gutter stays
 * identical across the whole page. `size` controls how wide the content
 * column is (7xl = default page width, 5xl/4xl = narrower editorial widths
 * like the stats strip or hero copy) — the gutter padding is the same
 * either way, only the max-width changes.
 *
 * Do NOT use this on full-bleed elements — hero/carousel background image,
 * full-width colored section backgrounds, the footer background — those
 * should stay edge-to-edge. Only wrap the *content inside* them with
 * Container so their text aligns with the rest of the page.
 */
export default function Container({
  children,
  size = "7xl",
  className = "",
}: {
  children: ReactNode;
  size?: keyof typeof MAX_WIDTHS;
  className?: string;
}) {
  return (
    <div className={`w-full ${MAX_WIDTHS[size]} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}