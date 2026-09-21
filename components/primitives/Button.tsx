"use client";

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { duration } from "@/lib/motion";

type Variant = "primary" | "ghost" | "inverse-ghost" | "text" | "outline" | "secondary";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-sans font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap cursor-pointer";

const variants: Record<Variant, string> = {
  primary: "bg-red-600 text-white hover:bg-red-500 shadow-sm",
  ghost: "border border-border-strong bg-white text-text-primary hover:border-red-600 hover:text-red-600",
  outline: "border border-border-strong bg-transparent text-text-primary hover:border-red-600 hover:text-red-600",
  secondary: "bg-surface-sunken border border-border-strong text-text-primary hover:bg-surface-raised",
  "inverse-ghost": "border border-white/70 text-white hover:border-white hover:bg-white/10",
  text: "text-red-600 hover:text-red-700 underline-offset-4 hover:underline",
};

const sizes: Record<Size, string> = {
  sm: "px-3.5 py-1.5 text-body-xs",
  md: "px-5 py-2.5 text-body-md",
  lg: "px-7 py-3.5 text-body-lg",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

type ConflictingHandlers =
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration";

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, ConflictingHandlers> & { href?: undefined };

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, ConflictingHandlers> & { href: string };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", children, className = "", ...rest } = props;
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if ("href" in rest && rest.href) {
    const { href, ...anchorRest } = rest as Omit<AnchorHTMLAttributes<HTMLAnchorElement>, ConflictingHandlers> & {
      href: string;
    };
    return (
      <motion.div className="inline-block" whileTap={{ scale: 0.98 }} transition={{ duration: duration.fast }}>
        <Link href={href} className={classes} {...anchorRest}>
          {children}
        </Link>
      </motion.div>
    );
  }

  const buttonRest = rest as Omit<ButtonHTMLAttributes<HTMLButtonElement>, ConflictingHandlers>;
  return (
    <motion.button
      className={classes}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: duration.fast }}
      {...buttonRest}
    >
      {children}
    </motion.button>
  );
}
