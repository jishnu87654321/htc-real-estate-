import type { ReactNode } from "react";

type Variant = "green" | "red" | "brass" | "clay" | "paper" | "sage";

const variants: Record<Variant, string> = {
  green: "bg-green-100 border-green-200 text-green-700",
  brass: "bg-green-100 border-green-200 text-green-700",
  red: "bg-red-100 border-red-200 text-red-700",
  clay: "bg-red-100 border-red-200 text-red-700",
  paper: "bg-paper-100 border-paper-300 text-ink-700",
  sage: "bg-paper-100 border-paper-300 text-ink-700",
};

export function Badge({
  children,
  variant = "red",
  className = "",
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-label uppercase tracking-[0.08em] font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
