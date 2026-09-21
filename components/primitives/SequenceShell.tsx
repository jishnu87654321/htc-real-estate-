"use client";

import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { Placeholder, type AspectRatioType } from "@/components/primitives/Placeholder";
import { useReducedMotion } from "@/lib/motion";

interface SequenceShellProps {
  posterId: string;
  posterRatio?: AspectRatioType;
  posterLabel: string;
  children?: ReactNode;
  className?: string;
  desktopOnly?: boolean;
}

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class SequenceErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("[SequenceShell] sequence error, falling back to static poster:", error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export function SequenceShell({
  posterId,
  posterRatio = "4/5",
  posterLabel,
  children,
  className = "",
  desktopOnly = false,
}: SequenceShellProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [saveData] = useState(() => {
    if (typeof navigator !== "undefined") {
      const nav = navigator as unknown as { connection?: { saveData?: boolean } };
      return !!nav.connection?.saveData;
    }
    return false;
  });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || saveData) return;
    if (desktopOnly && window.matchMedia("(max-width: 1023px)").matches) return;

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [desktopOnly, reducedMotion, saveData]);

  const fallback = (
    <Placeholder
      id={posterId}
      ratio={posterRatio}
      label={posterLabel}
      className="h-full w-full"
    />
  );

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: posterRatio.replace("/", " / ") }}
    >
      <SequenceErrorBoundary fallback={fallback}>
        {mounted && !reducedMotion && !saveData ? children : fallback}
      </SequenceErrorBoundary>
    </div>
  );
}
