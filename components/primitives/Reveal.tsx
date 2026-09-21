"use client";

import { Children, isValidElement, type ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { duration, ease, stagger as staggerTokens, useReducedMotion } from "@/lib/motion";

type Direction = "up" | "down" | "left" | "right" | "none";

interface RevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  stagger?: boolean;
  staggerAmount?: number;
  threshold?: number;
  as?: "div" | "section" | "ul";
  className?: string;
}

const OFFSET = 24;

function offsetFor(direction: Direction) {
  switch (direction) {
    case "up":
      return { y: OFFSET };
    case "down":
      return { y: -OFFSET };
    case "left":
      return { x: OFFSET };
    case "right":
      return { x: -OFFSET };
    default:
      return {};
  }
}

/**
 * The single scroll-into-view primitive used site-wide. One <Reveal> beats
 * nine bespoke scroll animations — do not write ad-hoc scroll animations.
 */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  stagger = false,
  staggerAmount = staggerTokens.base,
  threshold = 0.2,
  as = "div",
  className,
}: RevealProps) {
  const reducedMotion = useReducedMotion();
  const MotionTag = motion[as];

  if (reducedMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const hiddenOffset = offsetFor(direction);

  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: delay,
        staggerChildren: stagger ? staggerAmount : 0,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, ...hiddenOffset },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: duration.slow, ease: ease.out, delay: stagger ? 0 : delay },
    },
  };

  if (!stagger) {
    return (
      <MotionTag
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: threshold }}
        variants={item}
      >
        {children}
      </MotionTag>
    );
  }

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold }}
      variants={container}
    >
      {Children.map(children, (child, i) =>
        isValidElement(child) ? (
          <motion.div key={child.key ?? i} variants={item}>
            {child}
          </motion.div>
        ) : (
          child
        )
      )}
    </MotionTag>
  );
}
