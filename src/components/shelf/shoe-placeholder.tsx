import { cn } from "@/lib/utils";

/** Soft sneaker silhouette, shown until a pair has its photos. */
export function ShoePlaceholder({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      role="img"
      aria-label="Фото скоро появится"
      className={cn("text-neutral-300", className)}
      fill="none"
    >
      {/* upper */}
      <path
        d="M52 226 V168 c0-14 8-24 22-27 l46-10 c22-5 40-20 52-42 c6-11 18-16 30-12 l22 8 c18 24 44 40 76 46 c40 8 66 34 70 70 v25 z"
        fill="currentColor"
        opacity="0.55"
      />
      {/* sole */}
      <path d="M40 222 h330 c18 0 28 10 28 22 c0 12-10 20-26 20 H66 c-16 0-26-8-26-20 z" fill="currentColor" />
      {/* laces and details */}
      <g stroke="#fbfafc" strokeWidth="5" strokeLinecap="round" opacity="0.9">
        <path d="M168 104 l24 22" />
        <path d="M190 92 l26 24" />
        <path d="M212 84 l26 22" />
      </g>
      <path d="M62 190 h60" stroke="#fbfafc" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}
