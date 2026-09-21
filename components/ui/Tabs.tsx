"use client";

import { motion } from "motion/react";
import { ease } from "@/lib/motion";

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  layoutId: string;
  className?: string;
}

export function Tabs({ tabs, active, onChange, layoutId, className = "" }: TabsProps) {
  return (
    <div
      role="tablist"
      className={`flex max-w-full gap-1 overflow-x-auto rounded-full bg-surface-sunken p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className="relative shrink-0 rounded-full px-4 py-2 text-body-sm font-medium"
        >
          {active === tab.id && (
            <motion.span
              layoutId={layoutId}
              className="absolute inset-0 rounded-full bg-surface-raised shadow-sm"
              transition={ease.spring}
            />
          )}
          <span className={`relative z-10 ${active === tab.id ? "text-text-primary" : "text-text-tertiary"}`}>
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}
