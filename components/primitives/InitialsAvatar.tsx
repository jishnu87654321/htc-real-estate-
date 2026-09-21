import React from "react";

interface InitialsAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  ariaLabel?: string;
}

function getInitials(name: string): string {
  if (!name) return "HTC";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function InitialsAvatar({
  name,
  size = "md",
  className = "",
  ariaLabel,
}: InitialsAvatarProps) {
  const initials = getInitials(name);

  // Size specifications:
  // sm: 40px (2.5rem)
  // md: 56px (3.5rem - testimonial standard)
  // lg: 80px (5rem)
  // xl: 120px (7.5rem - team portrait standard)
  const sizeClasses = {
    sm: "w-10 h-10 text-sm",
    md: "w-14 h-14 text-xl",
    lg: "w-20 h-20 text-2xl",
    xl: "w-[120px] h-[120px] text-4xl",
  }[size];

  return (
    <div
      role="img"
      aria-label={ariaLabel || `Initials avatar for ${name}`}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-red-100 font-serif font-bold text-red-700 select-none shadow-sm ${sizeClasses} ${className}`}
    >
      <span>{initials}</span>
    </div>
  );
}
